
import { formatLargeTextContent } from "../../utils/largeTextFormatter";

describe("formatLargeTextContent", () => {
  it("converts HTML headings and paragraphs into readable text", () => {
    const result = formatLargeTextContent(
      "<h2>About Us</h2><p>Welcome to our blog.</p>",
    );

    expect(result.map((line) => line.text)).toEqual([
      "About Us",
      "Welcome to our blog.",
    ]);
    expect(result[0].isHeading).toBe(true);
  });

  it("converts HTML entities into readable characters", () => {
    const result = formatLargeTextContent(
      "<p>Love &amp; care</p>",
    );

    expect(result.map((line) => line.text)).toContain("Love & care");
  });

  it("returns an empty array for empty content", () => {
    expect(formatLargeTextContent("")).toEqual([]);
    expect(formatLargeTextContent(null)).toEqual([]);
  });



  it("converts bullet points into readable text", () => {
    const result = formatLargeTextContent(
      "<ul><li>First item</li><li>Second item</li></ul>"
    );

    expect(result.map((line) => line.text)).toEqual([
      "• First item",
      "• Second item",
    ]);
  });


  it("preserves text inside bold HTML tags", () => {
    const result = formatLargeTextContent(
      "<p>This is <strong>important</strong> information.</p>"
    );

    expect(result.map((line) => line.text)).toContain(
      "This is important information."
    );
  });

  it("preserves link text while removing HTML tags", () => {
    const result = formatLargeTextContent(
      '<p>Visit <a href="https://example.com">our website</a> today.</p>'
    );

    expect(result.map((line) => line.text)).toContain(
      "Visit our website today."
    );
  });

});
