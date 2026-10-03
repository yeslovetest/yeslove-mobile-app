// Simple safety net: when a message contains common self-harm or abuse phrasing,
// the chat screens show UK crisis resources. This is a keyword match, not a
// clinical assessment, and it only covers English phrasing.
const CRISIS_PATTERNS: RegExp[] = [
  /\bsuicid(e|al)\b/i,
  /\bkill (myself|me)\b/i,
  /\bend (my|it all|my life)\b/i,
  /\bwant(ed)? to die\b/i,
  /\bdon'?t want to (live|be here|be alive)\b/i,
  /\bbetter off (dead|without me)\b/i,
  /\b(hurt|harm|cut|cutting) (myself|me)\b/i,
  /\bself[- ]?harm(ing|ed|s)?\b/i,
  /\b(he|she|they|my (partner|husband|wife|ex)) (is |are )?(hitting|beating|abusing|threatening) me\b/i,
  /\bdomestic (abuse|violence)\b/i,
  /\bnot safe (at home|with)\b/i,
];

export const containsCrisisLanguage = (text: string): boolean =>
  CRISIS_PATTERNS.some((pattern) => pattern.test(text));
