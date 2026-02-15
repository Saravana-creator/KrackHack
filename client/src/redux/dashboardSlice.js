import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async Thunks
export const fetchStudentDashboardData = createAsyncThunk(
  'dashboard/fetchStudentData',
  async (_, thunkAPI) => {
    try {
      const [academicsRes, grievancesRes, opportunitiesRes] = await Promise.all([
        api.get('/academics/my-courses'),
        api.get('/grievances'),
        api.get('/opportunities')
      ]);

      const data = {
        courses: academicsRes.data, // Storing full data or just count? Prompt says "courses: data.courses.length" in 1.3
        // The component used .count. Let's store the raw responses or structured data.
        // The Prompt at 1.3 says:
        // const stats = useMemo(() => ({
        //   courses: data.courses.length,
        //   grievances: data.grievances.length,
        //   opportunities: data.opportunities.length
        // }), [data])
        // This implies 'data' in redux should contain arrays.
        // BUT the existing component used .count.
        // Let's assume the API returns arrays or objects with counts.
        // The existing code: 
        // academicsRes.data.count || 0
        // This suggests the API returns { count: N, ... }.
        // However, 1.3 implies arrays: data.courses.length.
        // I will trust existing code for NOW, but if 1.3 is "FIX STRATEGY", I must follow it.
        // 1.3 says "Memoize Derived Values ... courses: data.courses.length".
        // This implies I should store the arrays in Redux.
        // But if the API only returns count? 
        // I'll check the API endpoints if I can, or safer: store the whole response data.
        // If the API returns { count: 5 }, I can't do .length. 
        // The existing code uses .count. 
        // I will stick to existing API response structure so I don't break it. 
        // if existing is .count, I will map it to existing needs.
        // Wait, "1.1 API Calls — Fire Once on Mount Only".
        // "1.2 Prevent Redundant Redux Updates".
        // "1.3 Memoize Derived Values... courses: data.courses.length" -> This example might be hypothetical or requiring a change in existing logic to store arrays instead of counts?
        // Or maybe existing API returns lists and the current component just took .count?
        // In StudentDashboard line 61: academics: academicsRes.data.count || 0
        // This looks like the API returns a count field explicitly.
        // If I change to .length, I might break it if it's not an array.
        // I will try to support both or stick to the safer one (count) but adapt the structure.
        // Actually, for "stability + correctness", sticking to existing behavior (Visual) is key. The PROMPT dictates implementation.
        // I will store the result of the API.
        
        academics: academicsRes.data,
        grievances: grievancesRes.data,
        opportunities: opportunitiesRes.data
      };
      
      return data;
    } catch (error) {
       return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to fetch dashboard data");
    }
  }
);

/*
  Prompt Requirement 1.2:
  if (JSON.stringify(state.data) === JSON.stringify(action.payload)) {
    return state // prevents unnecessary re-render
  }
*/

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    data: {
      academics: null,
      grievances: null,
      opportunities: null
    },
    notifications: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
    clearDashboardErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // CRITICAL 1.2: Prevent Redundant Redux Updates
        if (JSON.stringify(state.data) === JSON.stringify(action.payload)) {
          return state;
        }
        state.data = action.payload;
      })
      .addCase(fetchStudentDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { addNotification, clearDashboardErrors } = dashboardSlice.actions;
export default dashboardSlice.reducer;
