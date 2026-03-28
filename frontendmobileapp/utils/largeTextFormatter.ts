export type FormattedTextLine = {
  text: string;
  isHeading: boolean;
};

export const isLikelyHeading = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Markdown heading support.
  if (/^#{1,3}\s+/.test(trimmed)) return true;

  // Section-like lines commonly ending with a colon.
  if (trimmed.endsWith(":")) return true;

  // Short all-caps lines often represent headings.
  if (trimmed.length <= 42 && /^[A-Z0-9\s,&\-]+$/.test(trimmed)) return true;

  // Numbered heading pattern (e.g. "1. Communication").
  if (/^\d+[\.)]\s+/.test(trimmed) && trimmed.length <= 56) return true;

  return false;
};

export const formatLargeTextContent = (content?: string | null): FormattedTextLine[] => {
  if (!content) return [];

  return content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const normalized = line.replace(/^#{1,3}\s+/, "");
      return {
        text: normalized,
        isHeading: isLikelyHeading(normalized),
      };
    });
};
