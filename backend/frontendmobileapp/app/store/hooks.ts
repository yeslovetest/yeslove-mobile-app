import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, State } from './store'
import { call, CallEffect, select, SelectEffect, Tail } from 'redux-saga/effects'
import { AxiosResponse } from 'axios'

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<State> = useSelector

//Use in sagas
export const appSelect: <Fn extends (state: State, ...args: any[]) => any>(
    selector: Fn,
    ...args: Tail<Parameters<Fn>>
  ) => SelectEffect = select;