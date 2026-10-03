import unittest
from unittest import mock

from app import openai_moderation, perspective
from app.utils import moderation_utils


class ScoreLabelsTests(unittest.TestCase):
    def test_clean_text_is_not_flagged(self):
        result = moderation_utils.score_labels(
            {"HARASSMENT": 0.01, "THREAT": 0.0, "SEXUAL": 0.02, "SEXUAL_MINORS": 0.0, "SELF_HARM": 0.0}
        )
        self.assertFalse(result["is_flagged"])
        self.assertEqual(result["triggered"], {})

    def test_strong_harassment_is_high_severity(self):
        result = moderation_utils.score_labels({"HARASSMENT": 0.95})
        self.assertTrue(result["is_flagged"])
        self.assertEqual(result["severity"], "high")

    def test_borderline_harassment_is_low_severity(self):
        result = moderation_utils.score_labels({"HARASSMENT": 0.66})
        self.assertTrue(result["is_flagged"])
        self.assertEqual(result["severity"], "low")

    def test_sexual_threshold_is_higher_than_harassment(self):
        self.assertFalse(moderation_utils.score_labels({"SEXUAL": 0.7})["is_flagged"])
        self.assertTrue(moderation_utils.score_labels({"SEXUAL": 0.8})["is_flagged"])

    def test_minors_content_is_always_high(self):
        result = moderation_utils.score_labels({"SEXUAL_MINORS": 0.35})
        self.assertTrue(result["is_flagged"])
        self.assertEqual(result["severity"], "high")

    def test_self_harm_is_never_auto_removed(self):
        result = moderation_utils.score_labels({"SELF_HARM": 0.99})
        self.assertTrue(result["is_flagged"])
        self.assertEqual(result["severity"], "medium")

    def test_self_harm_with_other_label_keeps_high(self):
        result = moderation_utils.score_labels({"SELF_HARM": 0.99, "THREAT": 0.95})
        self.assertEqual(result["severity"], "high")


class NormaliseTests(unittest.TestCase):
    def test_openai_categories_map_to_labels(self):
        labels = openai_moderation.normalise({
            "category_scores": {
                "harassment": 0.2,
                "hate": 0.7,
                "violence": 0.4,
                "harassment/threatening": 0.1,
                "sexual": 0.3,
                "sexual/minors": 0.01,
                "self-harm/intent": 0.6,
            }
        })
        self.assertEqual(labels["HARASSMENT"], 0.7)
        self.assertEqual(labels["THREAT"], 0.4)
        self.assertEqual(labels["SEXUAL"], 0.3)
        self.assertEqual(labels["SELF_HARM"], 0.6)

    def test_openai_missing_scores_default_to_zero(self):
        labels = openai_moderation.normalise({})
        self.assertTrue(all(v == 0.0 for v in labels.values()))

    def test_perspective_attributes_map_to_labels(self):
        def attr(v):
            return {"summaryScore": {"value": v}}

        labels = perspective.normalise({
            "attributeScores": {
                "TOXICITY": attr(0.4),
                "INSULT": attr(0.8),
                "THREAT": attr(0.2),
                "SEXUALLY_EXPLICIT": attr(0.1),
            }
        })
        self.assertEqual(labels, {"HARASSMENT": 0.8, "THREAT": 0.2, "SEXUAL": 0.1})


class ProviderFallbackTests(unittest.TestCase):
    def test_uses_openai_when_available(self):
        with mock.patch.object(
            openai_moderation, "analyze_text", return_value={"category_scores": {"harassment": 0.95}}
        ), mock.patch.object(perspective, "analyze_text") as perspective_call:
            result = moderation_utils.moderate_text("hello")
        self.assertEqual(result["provider"], "openai")
        self.assertTrue(result["is_flagged"])
        perspective_call.assert_not_called()

    def test_falls_back_to_perspective_when_openai_unavailable(self):
        perspective_result = {"attributeScores": {"TOXICITY": {"summaryScore": {"value": 0.95}}}}
        with mock.patch.object(openai_moderation, "analyze_text", return_value=None), mock.patch.object(
            perspective, "analyze_text", return_value=perspective_result
        ):
            result = moderation_utils.moderate_text("hello")
        self.assertEqual(result["provider"], "perspective")
        self.assertTrue(result["is_flagged"])

    def test_returns_none_when_no_provider_available(self):
        with mock.patch.object(openai_moderation, "analyze_text", return_value=None), mock.patch.object(
            perspective, "analyze_text", return_value=None
        ):
            self.assertIsNone(moderation_utils.moderate_text("hello"))


class OpenAiClientTests(unittest.TestCase):
    def test_no_key_means_no_request(self):
        with mock.patch.dict("os.environ", {}, clear=True), mock.patch("requests.post") as post:
            self.assertIsNone(openai_moderation.analyze_text("hi"))
        post.assert_not_called()

    def test_bad_key_returns_none(self):
        response = mock.Mock(status_code=401)
        with mock.patch.dict("os.environ", {"OPENAI_API_KEY": "x"}), mock.patch(
            "requests.post", return_value=response
        ):
            self.assertIsNone(openai_moderation.analyze_text("hi"))

    def test_success_returns_first_result(self):
        response = mock.Mock(status_code=200)
        response.json.return_value = {"results": [{"category_scores": {"harassment": 0.1}}]}
        with mock.patch.dict("os.environ", {"OPENAI_API_KEY": "x"}), mock.patch(
            "requests.post", return_value=response
        ) as post:
            result = openai_moderation.analyze_text("hi")
        self.assertEqual(result, {"category_scores": {"harassment": 0.1}})
        self.assertEqual(post.call_args.kwargs["json"]["model"], "omni-moderation-latest")


if __name__ == "__main__":
    unittest.main()
