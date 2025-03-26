import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch user orders
export const fectchUserOrders = createAsyncThunk(
  "orders/fectchUserOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to fetch orders details by ID
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (fetchOrderDetails, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
    name: "orders",
    initialState: {
        orders: [], 
        totalOrders: 0,
        orderDetails: null,
        isLoading: false,
        error: null,
    },
    reducers:{},
    extraReducers: (builder) => {
        builder
        // Fetch User Orders
        .addCase(fectchUserOrders.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fectchUserOrders.fulfilled, (state, action) => {
            state.isLoading = false;
            state.orders = action.payload
        })
        .addCase(fectchUserOrders.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload.message
        })

        // Fetch Order Details
        .addCase(fetchOrderDetails.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchOrderDetails.fulfilled, (state, action) => {
            state.isLoading = false;
            state.orderDetails = action.payload
        })
        .addCase(fetchOrderDetails.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload.message
        })
    }
})

export default orderSlice.reducer;