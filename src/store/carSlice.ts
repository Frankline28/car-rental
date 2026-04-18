import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../lib/api";
import { Car } from "../types";

interface CarState {
  items: Car[];
  loading: boolean;
  error: string | null;
}

const initialState: CarState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCars = createAsyncThunk("cars/fetchCars", async () => {
  const response = await api.get("/cars");
  return response.data;
});

const carSlice = createSlice({
  name: "cars",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCars.fulfilled, (state, action: PayloadAction<Car[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch cars";
      });
  },
});

export default carSlice.reducer;
