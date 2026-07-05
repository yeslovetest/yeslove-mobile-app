import React, { ReactElement } from "react";
import { Provider } from "react-redux";
import { combineReducers, configureStore, Reducer } from "@reduxjs/toolkit";
import { render } from "@testing-library/react-native";

type Options = {
  reducer: Record<string, Reducer>;
  preloadedState?: Record<string, unknown>;
};

/**
 * Render a component connected to a real Redux store built from `reducer` and
 * `preloadedState`. Returns the store alongside the usual RTL queries so tests
 * can dispatch or assert on state. (Not a `*.test` file — Jest won't run it.)
 */
export function renderWithStore(ui: ReactElement, { reducer, preloadedState }: Options) {
  const store = configureStore({
    reducer: combineReducers(reducer),
    preloadedState: preloadedState as any,
  });

  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}
