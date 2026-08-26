import React from "react";
import { act, screen } from "@testing-library/react-native";
import ProfessionalsList from "@/app/pages/Get-help/Get-help-root/Get-help-root-components/Professionals/Professionals-list/ProfessionalsList";
import getHelpReducer from "@/app/store/Get-help-store/getHelpSlice";
import { renderWithStore } from "../helpers/renderWithStore";

const getHelpInitial = getHelpReducer(undefined, { type: "@@INIT" });

const withProfessionals = (professionals: unknown[], searchQuery = "") => ({
  getHelp: { ...getHelpInitial, professionals, currentSearchQuery: searchQuery },
});

describe("ProfessionalsList (store-connected)", () => {
  afterEach(() => jest.useRealTimers());

  it("renders professionals from the store", () => {
    renderWithStore(<ProfessionalsList />, {
      reducer: { getHelp: getHelpReducer },
      preloadedState: withProfessionals([{ username: "carrie", bio: "helps people" }]),
    });

    expect(screen.getByText("carrie")).toBeOnTheScreen();
    expect(screen.queryByText(/No professionals/)).toBeNull();
  });

  it("shows a loading placeholder before the settle window elapses", () => {
    jest.useFakeTimers();
    renderWithStore(<ProfessionalsList />, {
      reducer: { getHelp: getHelpReducer },
      preloadedState: withProfessionals([]),
    });

    expect(screen.getByText("Loading professionals...")).toBeOnTheScreen();
  });

  it("shows the empty message once settled with no data", () => {
    jest.useFakeTimers();
    renderWithStore(<ProfessionalsList />, {
      reducer: { getHelp: getHelpReducer },
      preloadedState: withProfessionals([]),
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText("No professionals available yet.")).toBeOnTheScreen();
  });

  it("shows a search-specific empty message once settled", () => {
    jest.useFakeTimers();
    renderWithStore(<ProfessionalsList />, {
      reducer: { getHelp: getHelpReducer },
      preloadedState: withProfessionals([], "therapist"),
    });

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText('No professionals found for "therapist".')).toBeOnTheScreen();
  });
});
