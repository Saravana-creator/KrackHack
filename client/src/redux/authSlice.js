import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async Thunks
export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await api.post('/auth/login', userData);
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.error || 'Login failed');
    }
});

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const response = await api.post('/auth/register', userData);
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.error || 'Registration failed');
    }
});

export const loadUser = createAsyncThunk('auth/loadUser', async (_, thunkAPI) => {
    if (!localStorage.getItem('token')) {
        return thunkAPI.rejectWithValue('No token found');
    }

    try {
        const res = await api.get('/auth/me');
        return res.data.data;
    } catch (err) {
        localStorage.removeItem('token');
        return thunkAPI.rejectWithValue(err.response?.data?.error || 'Authentication failed');
    }
});


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },
        clearErrors: (state) => {
            state.error = null;
        }
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
                // Decode token to get basic user info immediately
                const decoded = jwt_decode(action.payload.token);
                state.user = { id: decoded.id, role: decoded.role };
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
