import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import carReducer from "./carSlice";
import bookingReducer from "./bookingSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cars: carReducer,
    bookings: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
