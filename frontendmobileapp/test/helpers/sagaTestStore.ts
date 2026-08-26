import createSagaMiddleware, { Saga, Task } from "redux-saga";
import { configureStore, Reducer } from "@reduxjs/toolkit";

const runningTasks: Task[] = [];

/**
 * Build a real Redux store wired to redux-saga and start `saga`. Tests dispatch
 * intent actions, `await flushPromises()`, then assert on the resulting state.
 *
 * `serializableCheck` is disabled because some slice payloads carry FormData.
 * (This is a NOT a `*.test` file, so Jest does not run it as a suite.)
 */
export function runSagaStore(reducer: Record<string, Reducer>, saga: Saga) {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer,
    middleware: (getDefault) =>
      getDefault({ thunk: false, serializableCheck: false }).concat(sagaMiddleware),
  });
  runningTasks.push(sagaMiddleware.run(saga));
  return store;
}

/**
 * Cancel every saga watcher started via `runSagaStore`. Call from `afterEach` so
 * the long-running `takeEvery` watchers do not leak between tests.
 */
export function stopSagas() {
  runningTasks.forEach((task) => task.cancel());
  runningTasks.length = 0;
}

/** Let queued promise microtasks + the saga's async `call` effects resolve. */
export const flushPromises = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));
