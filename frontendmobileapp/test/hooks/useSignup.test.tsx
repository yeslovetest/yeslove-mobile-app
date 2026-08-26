import React from "react";
import { Provider } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react-native";
import { useSignup } from "@/hooks/signUpLogic";
import authReducer from "@/app/store/Auth-store/authSlice";

const makeWrapper = () => {
  const store = configureStore({ reducer: combineReducers({ auth: authReducer }) });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, wrapper };
};

const fillPage2 = (result: { current: ReturnType<typeof useSignup> }) => {
  act(() => {
    result.current.handleUsernameChange("janedoe");
    result.current.handleFirstNameChange("Jane");
    result.current.handleLastNameChange("Doe");
  });
};

describe("useSignup (phone number removed)", () => {
  it("completes page 2 validation with only username, first and last name", () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useSignup(), { wrapper });

    fillPage2(result);

    const [valid] = result.current.validateInputs(2);
    expect(valid).toBe(true);
  });

  it("still blocks page 2 when a required name field is missing", () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useSignup(), { wrapper });

    act(() => {
      result.current.handleUsernameChange("janedoe");
      result.current.handleFirstNameChange("Jane");
      // last name left empty
    });

    const [valid, field] = result.current.validateInputs(2);
    expect(valid).toBe(false);
    expect(field).toBe("lastName");
  });

  it("sends an empty phone_number in the signup payload", () => {
    const { store, wrapper } = makeWrapper();
    const { result } = renderHook(() => useSignup(), { wrapper });

    fillPage2(result);
    act(() => {
      result.current.handleSignup("jane@x.com", "secret1", "secret1");
    });

    expect(store.getState().auth.lastSignupPayload).toMatchObject({
      email: "jane@x.com",
      first_name: "Jane",
      last_name: "Doe",
      username: "janedoe",
      phone_number: "",
    });
  });

  it("no longer exposes phone-number helpers", () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useSignup(), { wrapper });

    const api = result.current as Record<string, unknown>;
    expect(api.handlePhoneNumberChange).toBeUndefined();
    expect(api.phoneBdColor).toBeUndefined();
  });
});
