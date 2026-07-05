import React from "react";
import { render, screen } from "@testing-library/react-native";
import OrangeBanner from "@/app/Universal-components/Orange-banner/OrangeBanner";

describe("OrangeBanner", () => {
  it("renders the title and description", () => {
    render(<OrangeBanner icon="newspaper" mainTitle="Newsfeed" description="Share stories" />);

    expect(screen.getByText("Newsfeed")).toBeOnTheScreen();
    expect(screen.getByText("Share stories")).toBeOnTheScreen();
  });
});
