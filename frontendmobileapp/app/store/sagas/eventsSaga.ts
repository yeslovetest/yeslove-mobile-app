import { call, put, takeEvery } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

import {
  EventInfoResponse,
  EventListResponse,
  EventsApiFactory,
  ProfessionalsListResponse,
} from "@/generated-api";

import { openTabOnTopAction, TabType } from "../Navigation/navigationSlice";
import {
  addAttendeeToEvent,
  fetchAllEvents,
  fetchOneEvent,
  fetchUserEvents,
  removeAttendeeFromEvent,
  setAllEvents,
  setOneEvent,
  setUserEvents,
} from "../Events-store/eventsSlice";
import { fetchProfessionals, setProfessionals } from "../Get-help-store/getHelpSlice";

function* handleGetEventsList(
  action: PayloadAction<{
    endDate?: string;
    startDate?: string;
    perPage?: number;
    currentPage?: number;
  }>,
) {
  try {
    const response = (
      (yield call(
        EventsApiFactory().getEventList,
        action.payload.endDate ?? undefined,
        action.payload.startDate ?? undefined,
        action.payload.perPage ?? undefined,
        action.payload.currentPage ?? undefined,
      )) as AxiosResponse<EventListResponse>
    ).data as EventListResponse;

    yield put(setAllEvents({ events: response }));
  } catch (error) {
    console.error("failed to fetch Events", error);
  }
}

function* handleGetOneEvent(action: PayloadAction<{ eventId: number }>) {
  try {
    const response = (
      (yield call(EventsApiFactory().getEventInfo, {
        event_ids: [action.payload.eventId],
        page: 1,
        per_page: 10,
      })) as AxiosResponse<EventInfoResponse>
    ).data as EventInfoResponse;
    yield put(setOneEvent(response.event_infos?.[0] ?? undefined));
    yield put(
      openTabOnTopAction({ type: TabType.INDIVIDUAL_EVENT, data: response.event_infos?.[0] }),
    );
  } catch (error) {
    console.error("failed to fetch Event", error);
  }
}

function* handleGetAttendingEvents(
  action: PayloadAction<{
    queryType: string;
    endDate?: string;
    startDate?: string;
    perPage?: number;
    currentPage?: number;
  }>,
) {
  try {
    const response = (
      (yield call(
        EventsApiFactory().getAttendingEvents,
        action.payload.endDate ?? undefined,
        action.payload.startDate ?? undefined,
        action.payload.perPage ?? undefined,
        action.payload.currentPage ?? undefined,
        action.payload.queryType ?? "all",
      )) as AxiosResponse<EventListResponse>
    ).data as EventListResponse;

    yield put(setUserEvents({ events: response }));
  } catch (error) {
    console.error("failed to fetch Events", error);
  }
}

function* handleAddAttendeeToEvent(action: PayloadAction<{ eventId: number }>) {
  try {
    yield call(EventsApiFactory().postEventAttendees, {
      user_id: undefined,
      event_id: action.payload.eventId,
    });
    yield put(fetchAllEvents({}));
    yield put(fetchUserEvents({ queryType: "attending" }));
  } catch (error) {
    console.error("failed to add attendee to event", error);
  }
}

function* handleRemoveAttendeeFromEvent(action: PayloadAction<{ eventId: number }>) {
  try {
    yield call(EventsApiFactory().deleteRemoveAttendee, {
      user_id: undefined,
      event_id: action.payload.eventId,
    });
    yield put(fetchAllEvents({}));
    yield put(fetchUserEvents({ queryType: "attending" }));
  } catch (error) {
    console.error("failed to remove attendee from event", error);
  }
}

function* handleFetchProfessionals(
  action: PayloadAction<{ perPage?: number; currentPage?: number }>,
) {
  try {
    const response = (
      (yield call(
        EventsApiFactory().getGetProfessionals,
        action.payload.perPage ?? undefined,
        action.payload.currentPage ?? undefined,
      )) as AxiosResponse<ProfessionalsListResponse>
    ).data as ProfessionalsListResponse;
    const pagination = (response.pagination ?? {}) as {
      total_professionals?: number;
      page?: number;
      per_page?: number;
    };

    yield put(
      setProfessionals({
        items: response.professionals ?? [],
        total: pagination.total_professionals ?? 0,
        page: pagination.page ?? 1,
        per_page: pagination.per_page ?? 20,
      }),
    );
  } catch (error) {
    console.error("failed to fetch professionals", error);
  }
}

export default function* eventsSaga() {
  yield takeEvery(fetchAllEvents.type, handleGetEventsList);
  yield takeEvery(fetchUserEvents.type, handleGetAttendingEvents);
  yield takeEvery(addAttendeeToEvent.type, handleAddAttendeeToEvent);
  yield takeEvery(removeAttendeeFromEvent.type, handleRemoveAttendeeFromEvent);
  yield takeEvery(fetchProfessionals.type, handleFetchProfessionals);
  yield takeEvery(fetchOneEvent.type, handleGetOneEvent);
}
