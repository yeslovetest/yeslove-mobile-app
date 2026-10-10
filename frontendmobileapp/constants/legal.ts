// Public legal pages. Override per environment with EXPO_PUBLIC_* if the URLs move.
export const PRIVACY_POLICY_URL =
  (process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || "").trim() ||
  "https://yeslove.co.uk/privacy-policy/";

export const TERMS_URL =
  (process.env.EXPO_PUBLIC_TERMS_URL || "").trim() || "https://yeslove.co.uk/terms-conditions/";
