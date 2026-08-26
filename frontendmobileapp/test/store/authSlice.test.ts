import authReducer, {
  LoginState,
  setLoginStateAction,
  increasePageNo,
  decreasePageNo,
  setSignupSubmitting,
  setLastSignupPayload,
  setErrorMessage,
  setMessage,
  setSignupEmail,
} from "@/app/store/Auth-store/authSlice";
import type { SignupRequest } from "@/generated-api";

describe("authSlice", () => {
  it("defaults to the LOADING login state", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state.loginState).toBe(LoginState.LOADING);
  });

  it("transitions the login state", () => {
    const state = authReducer(undefined, setLoginStateAction(LoginState.LOGGED_IN));
    expect(state.loginState).toBe(LoginState.LOGGED_IN);
  });

  it("moves the signup page number forward and back relative to the given page", () => {
    expect(authReducer(undefined, increasePageNo(1)).SignupPageNo).toBe(2);
    expect(authReducer(undefined, decreasePageNo(3)).SignupPageNo).toBe(2);
  });

  it("tracks signup submission state and the retry payload", () => {
    const payload = { email: "a@b.com" } as unknown as SignupRequest;
    let state = authReducer(undefined, setSignupSubmitting(true));
    state = authReducer(state, setLastSignupPayload(payload));

    expect(state.isSignupSubmitting).toBe(true);
    expect(state.lastSignupPayload).toEqual(payload);
  });

  it("stores error, message, and signup-email fields", () => {
    let state = authReducer(undefined, setErrorMessage("bad"));
    state = authReducer(state, setMessage("hi"));
    state = authReducer(state, setSignupEmail("me@x.com"));

    expect(state.errorMessage).toBe("bad");
    expect(state.message).toBe("hi");
    expect(state.signupEmail).toBe("me@x.com");
  });
});
