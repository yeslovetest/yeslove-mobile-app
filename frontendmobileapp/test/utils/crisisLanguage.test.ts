import { containsCrisisLanguage } from "@/app/Universal-components/Wellbeing-notice/crisisLanguage";

describe("containsCrisisLanguage", () => {
  it.each([
    "I want to hurt myself",
    "i dont want to be here anymore",
    "I'm thinking about suicide",
    "he is hitting me",
    "my partner is threatening me",
    "I feel like everyone would be better off without me",
    "I've been self-harming again",
  ])("detects: %s", (text) => {
    expect(containsCrisisLanguage(text)).toBe(true);
  });

  it.each([
    "How do I build trust in my relationship?",
    "We had an argument about money",
    "My ex hurt my feelings",
    "I want to end this conversation",
    "",
  ])("ignores: %s", (text) => {
    expect(containsCrisisLanguage(text)).toBe(false);
  });
});
