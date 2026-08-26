jest.mock("@/generated-api");

import { EventsApiFactory } from "@/generated-api";
import eventsSaga from "@/app/store/sagas/eventsSaga";
import eventsReducer, {
  fetchAllEvents,
  fetchUserEvents,
} from "@/app/store/Events-store/eventsSlice";
import getHelpReducer, { fetchProfessionals } from "@/app/store/Get-help-store/getHelpSlice";
import { runSagaStore, flushPromises, stopSagas } from "../helpers/sagaTestStore";

const mockedEventsApiFactory = EventsApiFactory as jest.MockedFunction<typeof EventsApiFactory>;

describe("eventsSaga", () => {
  afterEach(() => {
    stopSagas();
    jest.clearAllMocks();
  });

  it("loads all events into allEvents", async () => {
    const getEventList = jest.fn().mockResolvedValue({
      data: { items: [{ id: 1 }, { id: 2 }], total: 2, page: 1, per_page: 10 },
    });
    mockedEventsApiFactory.mockReturnValue({ getEventList } as any);

    const store = runSagaStore({ events: eventsReducer }, eventsSaga);
    store.dispatch(fetchAllEvents({}));
    await flushPromises();

    expect(getEventList).toHaveBeenCalled();
    expect(store.getState().events.allEvents.events).toHaveLength(2);
    expect(store.getState().events.allEvents.totalEvents).toBe(2);
  });

  it("loads attending events into userEvents and forwards the queryType", async () => {
    const getAttendingEvents = jest.fn().mockResolvedValue({
      data: { items: [{ id: 5 }], total: 1, page: 1, per_page: 10 },
    });
    mockedEventsApiFactory.mockReturnValue({ getAttendingEvents } as any);

    const store = runSagaStore({ events: eventsReducer }, eventsSaga);
    store.dispatch(fetchUserEvents({ queryType: "attending" }));
    await flushPromises();

    expect(getAttendingEvents).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      "attending",
    );
    expect(store.getState().events.userEvents.events).toHaveLength(1);
  });

  it("maps the professionals response into the getHelp slice", async () => {
    const getGetProfessionals = jest.fn().mockResolvedValue({
      data: {
        professionals: [{ username: "carrie" }],
        pagination: { total_professionals: 3, page: 1, per_page: 20 },
      },
    });
    mockedEventsApiFactory.mockReturnValue({ getGetProfessionals } as any);

    const store = runSagaStore({ events: eventsReducer, getHelp: getHelpReducer }, eventsSaga);
    store.dispatch(fetchProfessionals({}));
    await flushPromises();

    expect(getGetProfessionals).toHaveBeenCalled();
    expect(store.getState().getHelp.professionals).toHaveLength(1);
    expect(store.getState().getHelp.totalProfessionals).toBe(3);
  });
});
