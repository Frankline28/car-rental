import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../lib/api";
import { Booking } from "../types";

interface BookingState {
  items: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk("bookings/fetchBookings", async (userId: string | undefined) => {
  const response = await api.get("/bookings", { params: { userId } });
  return response.data;
});

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action: PayloadAction<Booking[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch bookings";
      });
  },
});

export default bookingSlice.reducer;
