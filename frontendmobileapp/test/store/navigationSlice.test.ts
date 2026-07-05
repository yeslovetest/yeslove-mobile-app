import navigationReducer, {
  changeTabAction,
  openTabOnTopAction,
  goBackToPreviousTabAction,
  TabType,
} from "@/app/store/Navigation/navigationSlice";

const initialState = { tabStack: [{ type: TabType.HOME, data: {} }] };

describe("navigationSlice", () => {
  it("starts on the HOME tab", () => {
    const state = navigationReducer(undefined, { type: "@@INIT" });
    expect(state.tabStack).toHaveLength(1);
    expect(state.tabStack.at(-1)?.type).toBe(TabType.HOME);
  });

  it("changeTabAction replaces the whole stack", () => {
    const pushed = navigationReducer(
      initialState,
      openTabOnTopAction({ type: TabType.CONVERSATION, data: { userId: "u1" } }),
    );
    const state = navigationReducer(pushed, changeTabAction({ type: TabType.EVENTS }));

    expect(state.tabStack).toHaveLength(1);
    expect(state.tabStack.at(-1)?.type).toBe(TabType.EVENTS);
  });

  it("openTabOnTopAction pushes a screen and preserves its params", () => {
    const state = navigationReducer(
      initialState,
      openTabOnTopAction({ type: TabType.INDIVIDUAL_POST, data: { postID: 42 } }),
    );

    expect(state.tabStack).toHaveLength(2);
    expect(state.tabStack.at(-1)?.type).toBe(TabType.INDIVIDUAL_POST);
    expect(state.tabStack.at(-1)?.data).toEqual({ postID: 42 });
  });

  it("goBackToPreviousTabAction pops the top screen", () => {
    const pushed = navigationReducer(
      initialState,
      openTabOnTopAction({ type: TabType.MESSAGES, data: {} }),
    );
    const state = navigationReducer(pushed, goBackToPreviousTabAction());

    expect(state.tabStack).toHaveLength(1);
    expect(state.tabStack.at(-1)?.type).toBe(TabType.HOME);
  });
});
