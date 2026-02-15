import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import jwt_decode from "jwt-decode";

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async Thunks
export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/auth/login", userData);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response.data.error || "Login failed",
      );
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await api.post("/auth/register", userData);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response.data.error || "Registration failed",
      );
    }
  },
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, thunkAPI) => {
    if (!localStorage.getItem("token")) {
      return thunkAPI.rejectWithValue("No token found");
    }

    try {
      const res = await api.get("/auth/me");
      return res.data.data;
    } catch (err) {
      localStorage.removeItem("token");
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Authentication failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null, // Full user object (id, role, etc) - cleared on logout
    isAuthenticated: false,
    isLoading: false,
    error: null,
    lastKnownUser: localStorage.getItem("AEGIS_USER_NAME") || null, // Persisted name for UI
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      // distinct requirement: Do NOT clear lastKnownUser
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        const decoded = jwt_decode(action.payload.token);
        state.user = { id: decoded.id, role: decoded.role };
        // We don't have username yet in payload, so we wait for loadUser or next refresh,
        // OR we could decode it if we added it to token.
        // However, since we are relying on loadUser usually, let's just wait for loadUser to set the name.
        // But for better UX, if we have it, set it.
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        // Set persisted name
        if (action.payload.username) {
          state.lastKnownUser = action.payload.username;
          localStorage.setItem("AEGIS_USER_NAME", action.payload.username);
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        const decoded = jwt_decode(action.payload.token);
        state.user = { id: decoded.id, role: decoded.role };
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearErrors } = authSlice.actions;
export default authSlice.reducer;
