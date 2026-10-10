// Public legal pages. Override per environment with EXPO_PUBLIC_* if the URLs move.
export const PRIVACY_POLICY_URL =
  (process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || "").trim() ||
  "https://yeslove.co.uk/privacy-policy/";

export const TERMS_URL =
  (process.env.EXPO_PUBLIC_TERMS_URL || "").trim() || "https://yeslove.co.uk/terms-conditions/";

// Where members are told to write if they cannot sign in (for example after losing the phone that
// holds their authenticator app). Empty until a support address is set for the build, in which
// case the help text says to use the contact details on the website instead.
export const SUPPORT_EMAIL = (process.env.EXPO_PUBLIC_SUPPORT_EMAIL || "").trim();
