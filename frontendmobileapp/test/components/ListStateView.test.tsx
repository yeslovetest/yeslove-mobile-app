import React from "react";
import { render, screen } from "@testing-library/react-native";
import ListStateView from "@/app/Universal-components/List-state/ListStateView";

describe("ListStateView", () => {
  it("shows the empty message when not loading", () => {
    render(<ListStateView emptyText="No posts yet." />);

    expect(screen.getByText("No posts yet.")).toBeOnTheScreen();
  });

  it("shows the loading text and hides the empty message when loading", () => {
    render(<ListStateView loading loadingText="Loading posts..." emptyText="No posts yet." />);

    expect(screen.getByText("Loading posts...")).toBeOnTheScreen();
    expect(screen.queryByText("No posts yet.")).toBeNull();
  });

  it("falls back to the default loading text", () => {
    render(<ListStateView loading emptyText="No posts yet." />);

    expect(screen.getByText("Loading...")).toBeOnTheScreen();
  });
});
