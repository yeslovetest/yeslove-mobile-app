export type FormattedTextLine = {
  text: string;
  isHeading: boolean;
};

export const isLikelyHeading = (line: string): boolean => {
  const trimmed = line.trim();

  if (!trimmed) return false;
  if (/^#{1,3}\s+/.test(trimmed)) return true;
  if (trimmed[trimmed.length - 1] === ":") return true;
  if (trimmed.length <= 42 && /^[A-Z0-9\s,&\-]+$/.test(trimmed)) {
    return true;
  }

  if (/^\d+[\.\)]\s+/.test(trimmed) && trimmed.length <= 56) {
    return true;
  }

  return false;
};

const decodeHtmlEntities = (text: string): string => {
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
  };

  return text
    .replace(
      /&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/gi,
      (entity) => entities[entity.toLowerCase()] ?? entity,
    )
    .replace(/&#(\d+);/g, (_, code: string) => {
      const number = Number(code);
      return number <= 0x10ffff ? String.fromCodePoint(number) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
      const number = parseInt(code, 16);
      return number <= 0x10ffff ? String.fromCodePoint(number) : _;
    });
};

const convertHtmlToText = (content: string): FormattedTextLine[] => {
  const lines: FormattedTextLine[] = [];
  const headingPattern = /<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]\s*>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const addText = (html: string, isHeading = false) => {
    const text = decodeHtmlEntities(
      html
        .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, "")
        .replace(/<img\b[^>]*>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<li\b[^>]*>/gi, "\n• ")
        .replace(/<\/(p|div|ul|ol|li|blockquote|figure|section)\s*>/gi, "\n")
        .replace(/<(p|div|ul|ol|li|blockquote|figure|section)\b[^>]*>/gi, "\n")
        .replace(/<[^>]*>/g, ""),
    );

    text
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        lines.push({
          text: line.replace(/^#{1,3}\s+/, ""),
          isHeading: isHeading || isLikelyHeading(line),
        });
      });
  };

  while ((match = headingPattern.exec(content)) !== null) {
    addText(content.slice(lastIndex, match.index));
    addText(match[1], true);
    lastIndex = headingPattern.lastIndex;
  }

  addText(content.slice(lastIndex));

  return lines;
};

export const formatLargeTextContent = (content?: string | null): FormattedTextLine[] => {
  if (!content) return [];

  return convertHtmlToText(content);
};
