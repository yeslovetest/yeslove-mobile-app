import React from 'react';
import { View, Text, Linking } from 'react-native';
import styles from '../SharedChatbotStyles';

const LINK_PATTERN = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
const FULL_LINK_PATTERN = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i;
const TRAILING_PUNCTUATION_PATTERN = /[.,;:!?]+$/;
const HEADER_TOKEN_PATTERN = /^\[\[H\]\](.*)\[\[\/H\]\]$/;

const markdownToPlainText = (value: string): string => {
  return value
    .replace(/\r\n/g, '\n')
    // Mark markdown headers so they can be rendered as bold text later.
    .replace(/^\s{0,3}#{1,6}\s+(.+)$/gm, '[[H]]$1[[/H]]')
    // Strip markdown bold markers.
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/^\s*[-*+]\s+/gm, '- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const normalizeMarkdownText = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string') {
    return markdownToPlainText(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeMarkdownText(item)).join(' ');
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

const openLink = async (value: string): Promise<void> => {
  const url = normalizeUrl(value);
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  } catch {
    // Ignore link open failures to keep chat interaction uninterrupted.
  }
};

const splitTrailingPunctuation = (value: string): { linkText: string; trailingText: string } => {
  const match = value.match(TRAILING_PUNCTUATION_PATTERN);
  if (!match) {
    return { linkText: value, trailingText: '' };
  }

  const trailingText = match[0];
  return {
    linkText: value.slice(0, -trailingText.length),
    trailingText,
  };
};

const renderTextWithLinks = (
  value: string,
  keyPrefix: string,
  textStyle?: { fontWeight: '700' },
): React.ReactNode[] => {
  return value.split(LINK_PATTERN).map((part, index) => {
    const isLink = !!part && FULL_LINK_PATTERN.test(part);

    if (isLink) {
      const { linkText, trailingText } = splitTrailingPunctuation(part);
      if (!linkText) {
        return (
          <Text key={`${keyPrefix}-text-${index}`} style={textStyle}>
            {part}
          </Text>
        );
      }

      return (
        <Text key={`${keyPrefix}-link-${index}`} style={textStyle}>
          <Text
            style={[textStyle, { color: '#2563eb' }]}
            onPress={() => {
              void openLink(linkText);
            }}
          >
            {linkText}
          </Text>
          {!!trailingText && <Text style={textStyle}>{trailingText}</Text>}
        </Text>
      );
    }

    return (
      <Text key={`${keyPrefix}-text-${index}`} style={textStyle}>
        {part}
      </Text>
    );
  });
};

const ChatResponse = ({ text, time }: { text: string; time: Date }) => {
  const safeText = normalizeMarkdownText(text);

  const hhmm = time
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    .replace(/^0/, "");

  return (
    <View style={styles.chatResponseContainer}>
      <View style={styles.chatResponse}>
        <Text>
          {safeText.split('\n').map((line, lineIndex, lines) => {
            const headerMatch = line.match(HEADER_TOKEN_PATTERN);
            const lineText = headerMatch ? headerMatch[1] : line;
            const lineStyle = headerMatch ? ({ fontWeight: '700' } as const) : undefined;

            return (
              <React.Fragment key={`line-${lineIndex}`}>
                {renderTextWithLinks(lineText, `line-${lineIndex}`, lineStyle)}
                {lineIndex < lines.length - 1 && <Text>{'\n'}</Text>}
              </React.Fragment>
            );
          })}
        </Text>
      </View>

      <Text style={styles.timeSentResponse}>{hhmm}</Text>
    </View>
  );
};

export default ChatResponse;

