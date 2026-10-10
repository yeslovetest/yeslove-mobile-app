import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import SecurityPrompt, {
  lostPhoneHelp,
} from "@/app/pages/Profile/Settings/General/Security-prompt/SecurityPrompt";

const mockOpenBrowser = jest.fn();
jest.mock("expo-web-browser", () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpenBrowser(...args),
}));

let mockBrowserSignIn = false;
jest.mock("@/app/services/oidc", () => ({
  get BROWSER_SIGN_IN_ENABLED() {
    return mockBrowserSignIn;
  },
  ACCOUNT_SECURITY_URL: "https://auth.example.test/realms/R/account/#/security/signing-in",
}));

beforeEach(() => {
  mockOpenBrowser.mockClear();
  mockBrowserSignIn = false;
});

describe("SecurityPrompt", () => {
  it("shows nothing in a password-form build", () => {
    const { toJSON } = render(<SecurityPrompt />);
    expect(toJSON()).toBeNull();
  });

  it("explains two-step verification and opens the account page in a browser build", () => {
    mockBrowserSignIn = true;
    const { getByText, getByLabelText } = render(<SecurityPrompt />);
    expect(getByText("Protect your account")).toBeTruthy();
    fireEvent.press(getByLabelText("Set up two-step verification"));
    expect(mockOpenBrowser).toHaveBeenCalledWith(
      "https://auth.example.test/realms/R/account/#/security/signing-in",
    );
  });

  it("names the support address only when one is set", () => {
    expect(lostPhoneHelp("help@example.test")).toContain("help@example.test");
    expect(lostPhoneHelp("")).toContain("contact details on our website");
    expect(lostPhoneHelp("")).not.toContain("@");
  });
});
