import React from "react";
import { act, screen, fireEvent } from "@testing-library/react-native";
import ProfessionalsList from "@/app/pages/Get-help/Get-help-root/Get-help-root-components/Professionals/Professionals-list/ProfessionalsList";
import getHelpReducer from "@/app/store/Get-help-store/getHelpSlice";
import navigationReducer, { TabType } from "@/app/store/Navigation/navigationSlice";
import userReducer from "@/app/store/Profile-store/userSlice";
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

  it("shows a loading placeholder while the request is pending", () => {
    jest.useFakeTimers();
    renderWithStore(<ProfessionalsList />, {
      reducer: { getHelp: getHelpReducer },
      preloadedState: { getHelp: { ...getHelpInitial, professionalsLoading: true } },
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
  it("shows failures with a working retry instead of an empty directory", () => {
    const { store } = renderWithStore(<ProfessionalsList />, {
      reducer: { getHelp: getHelpReducer },
      preloadedState: {
        getHelp: { ...getHelpInitial, professionalsError: "Unable to load professionals." },
      },
    });
    expect(screen.getByText("Unable to load professionals.")).toBeOnTheScreen();
    expect(screen.queryByText("No professionals available yet.")).toBeNull();
    fireEvent.press(screen.getByText("Retry"));
    expect(store.getState().getHelp.professionalsLoading).toBe(true);
  });

  describe("messaging a professional", () => {
    const render = (professionals: unknown[], currentUserId = "someone-else") =>
      renderWithStore(<ProfessionalsList />, {
        reducer: { getHelp: getHelpReducer, navigation: navigationReducer, user: userReducer },
        preloadedState: {
          ...withProfessionals(professionals),
          user: { ...userReducer(undefined, { type: "@@INIT" }), id: currentUserId },
        },
      });

    it("opens a conversation with a professional who has an app account", () => {
      const { store } = render([
        { username: "Dr Jane", bio: "hi", keycloak_id: "kc-jane", profile_pic: "p.png" },
      ]);
      fireEvent.press(screen.getByLabelText("Message Dr Jane"));
      const top = store.getState().navigation.tabStack.at(-1);
      expect(top?.type).toBe(TabType.CONVERSATION);
      expect(top?.data).toMatchObject({ userId: "kc-jane", username: "Dr Jane" });
    });

    it("says messaging is unavailable for a professional with no app account", () => {
      const { store } = render([{ username: "Carrie", bio: "hi" }]);
      expect(screen.getByText(/Messaging isn.t available/)).toBeOnTheScreen();
      expect(screen.queryByText("Message")).toBeNull();
      fireEvent.press(screen.getByText("Carrie"));
      expect(store.getState().navigation.tabStack.at(-1)?.type).toBe(TabType.HOME);
    });

    it("does not offer to message yourself", () => {
      render([{ username: "Dr Jane", bio: "hi", keycloak_id: "kc-jane" }], "kc-jane");
      expect(screen.queryByText("Message")).toBeNull();
    });
  });
});
