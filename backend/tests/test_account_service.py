import unittest

from app.services.account_service import object_key_from_url


class ObjectKeyTests(unittest.TestCase):
    def test_virtual_host_style_url(self):
        url = "https://yeslove-media.lon1.digitaloceanspaces.com/media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/photo.png"
        self.assertEqual(object_key_from_url(url), "media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/photo.png")

    def test_path_style_url_with_bucket_prefix(self):
        url = "https://lon1.digitaloceanspaces.com/yeslove-media/media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/photo.png"
        self.assertEqual(object_key_from_url(url), "media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/photo.png")

    def test_cdn_url_and_encoded_filename(self):
        url = "https://cdn.example.test/media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/my%20photo.png"
        self.assertEqual(object_key_from_url(url), "media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/my photo.png")

    def test_plain_key_is_returned(self):
        self.assertEqual(object_key_from_url("media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/x.png"), "media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/x.png")

    def test_bucket_name_containing_media_is_not_confused_with_the_key(self):
        url = "https://lon1.digitaloceanspaces.com/media/media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/a.png"
        self.assertEqual(object_key_from_url(url), "media/0b9d5e1c-3f1a-4c52-8a9e-6f2d7c1b4a10/a.png")

    def test_missing_or_unrelated_url_gives_none(self):
        self.assertIsNone(object_key_from_url(None))
        self.assertIsNone(object_key_from_url(""))
        self.assertIsNone(object_key_from_url("https://example.test/other/file.png"))


if __name__ == "__main__":
    unittest.main()
