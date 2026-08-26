import React from "react";
import { Text } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import ErrorBoundary from "@/app/Universal-components/Error-boundary/ErrorBoundary";

describe("ErrorBoundary", () => {
  it("renders its children when nothing throws", () => {
    render(
      <ErrorBoundary>
        <Text>Safe content</Text>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Safe content")).toBeOnTheScreen();
  });

  it("renders the fallback when a child throws during render", () => {
    // React and componentDidCatch both log to console.error; silence it for a clean run.
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const Boom = () => {
      throw new Error("boom");
    };

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeOnTheScreen();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("recovers and re-renders children when 'Try again' is pressed", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    let shouldThrow = true;
    const MaybeBoom = () => {
      if (shouldThrow) {
        throw new Error("boom");
      }
      return <Text>Recovered content</Text>;
    };

    render(
      <ErrorBoundary>
        <MaybeBoom />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeOnTheScreen();

    // The underlying condition is resolved before the user retries.
    shouldThrow = false;
    fireEvent.press(screen.getByText("Try again"));

    expect(screen.getByText("Recovered content")).toBeOnTheScreen();
    expect(screen.queryByText("Something went wrong")).toBeNull();
    errorSpy.mockRestore();
  });
});
