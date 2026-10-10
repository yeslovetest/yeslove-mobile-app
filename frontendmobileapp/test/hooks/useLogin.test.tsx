import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react-native";

import { useLogin } from "@/hooks/loginLogic";

const makeWrapper = () => {
  const actions: { type: string; payload?: any }[] = [];
  const store = configureStore({
    reducer: (state = {}, action) => {
      actions.push(action);
      return state;
    },
    middleware: (getDefault) => getDefault({ serializableCheck: false, immutableCheck: false }),
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { actions, wrapper };
};

const loginActions = (actions: { type: string; payload?: any }[]) =>
  actions.filter((a) => a.type.toLowerCase().includes("login") && a.payload && a.payload.username);

describe("useLogin authenticator code", () => {
  it("sends only username and password when no code is entered", () => {
    const { actions, wrapper } = makeWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });
    act(() => {
      result.current.handleIdentifierChange("jane");
      result.current.handlePasswordChange("secret-pass-1");
    });
    act(() => result.current.handleLogin());
    const [sent] = loginActions(actions);
    expect(sent.payload).toEqual({ username: "jane", password: "secret-pass-1" });
  });

  it("includes the code, with spaces removed, when one is entered", () => {
    const { actions, wrapper } = makeWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });
    act(() => {
      result.current.handleIdentifierChange("jane");
      result.current.handlePasswordChange("secret-pass-1");
      result.current.handleOtpChange("123 456");
    });
    act(() => result.current.handleLogin());
    const [sent] = loginActions(actions);
    expect(sent.payload).toEqual({ username: "jane", password: "secret-pass-1", otp: "123456" });
  });

  it("ignores anything that is not a digit in the code box", () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });
    act(() => result.current.handleOtpChange("12ab34!"));
    expect(result.current.otp).toBe("1234");
  });
});
