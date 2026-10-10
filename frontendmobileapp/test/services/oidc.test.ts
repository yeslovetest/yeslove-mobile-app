jest.mock("expo-auth-session", () => ({ AuthRequest: jest.fn(), ResponseType: { Code: "code" }, exchangeCodeAsync: jest.fn() }));
jest.mock("expo-web-browser", () => ({ maybeCompleteAuthSession: jest.fn(), openBrowserAsync: jest.fn() }));
jest.mock("@/ts/secureStorage", () => {
  const store: Record<string, string> = {};
  return {
    secureGet: jest.fn(async (k: string) => store[k] ?? null),
    secureSet: jest.fn(async (k: string, v: string) => {
      store[k] = v;
    }),
  };
});
const mockPostRefreshToken = jest.fn();
jest.mock("@/generated-api", () => ({ AuthApiFactory: () => ({ postRefreshToken: mockPostRefreshToken }) }));

import {
  DISCOVERY,
  REDIRECT_URI,
  endBrowserSession,
  getAuthMode,
  refreshSession,
  setAuthMode,
  usernameFromAccessToken,
} from "@/app/services/oidc";

const fetchMock = jest.fn();
beforeEach(() => {
  jest.clearAllMocks();
  (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
});

describe("browser sign-in settings", () => {
  it("uses the app's link scheme and Keycloak's standard endpoints", () => {
    expect(REDIRECT_URI).toBe("yeslove://auth/callback");
    expect(DISCOVERY.authorizationEndpoint).toMatch(/\/realms\/.+\/protocol\/openid-connect\/auth$/);
    expect(DISCOVERY.tokenEndpoint).toMatch(/\/protocol\/openid-connect\/token$/);
  });
});

describe("refreshSession", () => {
  it("goes through the API for a password sign-in", async () => {
    await setAuthMode("password");
    mockPostRefreshToken.mockResolvedValue({ data: { access_token: "a", refresh_token: "r" } });
    expect(await refreshSession("old")).toEqual({ access_token: "a", refresh_token: "r" });
    expect(mockPostRefreshToken).toHaveBeenCalledWith({ refresh_token: "old" }, { timeout: 10000 });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("goes straight to Keycloak, with the public client and no secret, for a browser sign-in", async () => {
    await setAuthMode("browser");
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ access_token: "a2", refresh_token: "r2", expires_in: 60 }) });
    expect(await refreshSession("old")).toMatchObject({ access_token: "a2", refresh_token: "r2" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(DISCOVERY.tokenEndpoint);
    expect(init.body).toContain("grant_type=refresh_token");
    expect(init.body).toContain("client_id=yeslove-mobile");
    expect(init.body).not.toContain("secret");
    expect(init.headers).not.toHaveProperty("Authorization");
    expect(mockPostRefreshToken).not.toHaveBeenCalled();
  });

  it("fails when Keycloak refuses the refresh token", async () => {
    await setAuthMode("browser");
    fetchMock.mockResolvedValue({ ok: false, status: 400 });
    await expect(refreshSession("revoked")).rejects.toThrow(/400/);
  });
});

describe("auth mode and sign-out", () => {
  it("defaults to password and remembers browser", async () => {
    await setAuthMode("password");
    expect(await getAuthMode()).toBe("password");
    await setAuthMode("browser");
    expect(await getAuthMode()).toBe("browser");
  });

  it("ends the Keycloak session with the refresh token and never throws", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await endBrowserSession("rt");
    expect(fetchMock.mock.calls[0][0]).toBe(DISCOVERY.endSessionEndpoint);
    fetchMock.mockRejectedValue(new Error("offline"));
    await expect(endBrowserSession("rt")).resolves.toBeUndefined();
  });
});

describe("usernameFromAccessToken", () => {
  const token = (claims: object) => `h.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.s`;
  it("reads preferred_username", () => {
    expect(usernameFromAccessToken(token({ preferred_username: "jane" }))).toBe("jane");
  });
  it("returns an empty string for anything unreadable", () => {
    expect(usernameFromAccessToken("not-a-token")).toBe("");
  });
});
