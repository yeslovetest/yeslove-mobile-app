import eventsReducer, {
  setActiveEventsTabAction,
  setEventsScrollViewPosition,
  setAllEvents,
  setUserEvents,
  setOneEvent,
} from "@/app/store/Events-store/eventsSlice";
import type { EventListResponse, EventsModelResponse } from "@/generated-api";

const makeList = (overrides: Partial<EventListResponse> = {}): EventListResponse =>
  ({
    items: [{ id: 1 }, { id: 2 }],
    total: 2,
    page: 1,
    per_page: 10,
    ...overrides,
  }) as unknown as EventListResponse;

describe("eventsSlice", () => {
  it("sets the active tab and scroll position", () => {
    let state = eventsReducer(undefined, setActiveEventsTabAction("Attending"));
    state = eventsReducer(state, setEventsScrollViewPosition(50));

    expect(state.view.activeTab).toBe("Attending");
    expect(state.scrollViewPosition).toBe(50);
  });

  it("maps a list response into allEvents", () => {
    const state = eventsReducer(undefined, setAllEvents({ events: makeList() }));
    expect(state.allEvents.events).toHaveLength(2);
    expect(state.allEvents.totalEvents).toBe(2);
    expect(state.allEvents.eventPage).toBe(1);
    expect(state.allEvents.eventsPerPage).toBe(10);
  });

  it("falls back to sane defaults when list fields are missing", () => {
    const state = eventsReducer(
      undefined,
      setUserEvents({ events: { items: undefined } as unknown as EventListResponse }),
    );
    expect(state.userEvents.events).toEqual([]);
    expect(state.userEvents.totalEvents).toBe(0);
    expect(state.userEvents.eventPage).toBe(1);
    expect(state.userEvents.eventsPerPage).toBe(10);
  });

  it("stores a single event", () => {
    const event = { id: 9 } as unknown as EventsModelResponse;
    const state = eventsReducer(undefined, setOneEvent(event));
    expect(state.oneEvent).toEqual(event);
  });
});
