// Must match the realm's password policy (KeyCloakService/scripts/mfa.py, `harden`) and
// MIN_PASSWORD_LENGTH in backend/app/api/auth/auth_routes.py.
export const MIN_PASSWORD_LENGTH = 12;

export const PASSWORD_TOO_SHORT_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
