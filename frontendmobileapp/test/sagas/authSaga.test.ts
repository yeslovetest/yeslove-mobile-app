jest.mock("@/generated-api");
jest.mock("@/ts/token-service");

import axios from "axios";
import { AuthApiFactory } from "@/generated-api";
import authSaga from "@/app/store/sagas/authSaga";
import authReducer, { logInAction, LoginState } from "@/app/store/Auth-store/authSlice";
import userReducer from "@/app/store/Profile-store/userSlice";
import profileReducer from "@/app/store/Profile-store/profileSlice";
import { runSagaStore, flushPromises, stopSagas } from "../helpers/sagaTestStore";

const mockedAuthApiFactory = jest.mocked(AuthApiFactory);

describe("login session", () => {
  afterEach(() => {
    stopSagas();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    delete axios.defaults.headers.common.Authorization;
  });

  const loginWith = async (data: Record<string, unknown>) => {
    const postLogin = jest.fn().mockResolvedValue({ data });
    mockedAuthApiFactory.mockReturnValue({ postLogin } as any);
    const store = runSagaStore(
      { auth: authReducer, user: userReducer, profile: profileReducer },
      authSaga,
    );
    store.dispatch(logInAction({ username: "leo", password: "test-password" }));
    await flushPromises();
    return store;
  };

  it("rejects a successful HTTP response that contains no access token", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(axios, "post").mockResolvedValue({ data: {} });
    const store = await loginWith({ message: "Complete your professional profile." });

    expect(store.getState().auth.loginState).toBe(LoginState.LOGGED_OUT);
    expect(store.getState().auth.errorMessage).toBeTruthy();
    expect(axios.defaults.headers.common.Authorization).toBeUndefined();
  });

  it("uses the identity returned by login without calling a missing sync endpoint", async () => {
    const identityRequest = jest.spyOn(axios, "post").mockResolvedValue({ data: {} });
    const store = await loginWith({
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
      keycloak_id: "test-user",
      user_id: 7,
    });

    expect(store.getState().auth.loginState).toBe(LoginState.LOGGED_IN);
    expect(store.getState().user.id).toBe("test-user");
    expect(identityRequest).not.toHaveBeenCalled();
  });

  it("uses the existing authenticated identity endpoint for older backends", async () => {
    const identityRequest = jest.spyOn(axios, "post").mockResolvedValue({
      data: { keycloak_id: "test-user", user_id: 7 },
    });
    const store = await loginWith({
      access_token: "test-access-token",
      refresh_token: "test-refresh-token",
    });

    expect(identityRequest.mock.calls[0][0]).toBe("/api/profile/user/keycloak_id");
    expect(store.getState().auth.loginState).toBe(LoginState.LOGGED_IN);
    expect(store.getState().user.id).toBe("test-user");
  });
});
