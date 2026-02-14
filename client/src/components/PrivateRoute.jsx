import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../redux/authSlice';
import { Box, CircularProgress } from '@mui/material';

const PrivateRoute = () => {
    const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!user && localStorage.token) {
            dispatch(loadUser());
        }
    }, [dispatch, user]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress color="secondary" />
            </Box>
        );
    }

    // If we have a token but state is not authenticated yet (e.g. refresh), loadUser handles it.
    // If loadUser fails, it clears token and isAuthenticated stays false.

    const token = localStorage.getItem('token');

    return isAuthenticated || token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
