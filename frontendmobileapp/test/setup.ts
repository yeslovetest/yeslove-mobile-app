// Global Jest setup (registered via setupFilesAfterEnv).

// AsyncStorage has no native module under Jest; use the library's official mock.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
