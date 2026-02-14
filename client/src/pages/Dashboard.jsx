import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket.emit('join', { role: user.role, id: user.id }); // Join room based on role and ID
        });

        socket.on('notification', (data) => {
            setNotifications((prev) => [data, ...prev]);
        });

        return () => {
            socket.disconnect();
        };
    }, [user.role]);

    return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #3b82f6, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard
                </Typography>

                <Grid container spacing={3}>
                    {/* Role Specific Actions */}
                    {user?.role === 'student' && (
                        <Grid item xs={12} md={6}>
                            <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <CardContent>
                                    <Typography variant="h5" color="primary" gutterBottom>Submit a Grievance</Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Report issues regarding academic, infrastructure, or other concerns.
                                    </Typography>
                                    <Button variant="contained" color="secondary" onClick={() => navigate('/grievance/new')}>
                                        Submit New
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* COMMON CARDS */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent>
                                <Typography variant="h5" color="info.main" gutterBottom>Academic Portal</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Access course materials, resources, and governance documents.
                                </Typography>
                                <Button variant="contained" color="info" onClick={() => navigate('/academics')}>
                                    Go to Academics
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent>
                                <Typography variant="h5" color="success.main" gutterBottom>Career & Research</Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Explore internships, research opportunities, and apply.
                                </Typography>
                                <Button variant="contained" color="success" onClick={() => navigate('/internships')}>
                                    Explore Opportunities
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {(user?.role === 'admin' || user?.role === 'authority') && (
                        <>
                            <Grid item xs={12} md={6}>
                                <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <CardContent>
                                        <Typography variant="h5" color="secondary" gutterBottom>Manage Grievances</Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Review and update status of submitted grievances.
                                        </Typography>
                                        <Button variant="outlined" color="secondary" onClick={() => navigate('/grievances')}>
                                            View All
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ANALYTICS SECTION */}
                            <Grid item xs={12}>
                                <Card sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                    <CardContent>
                                        <Typography variant="h5" color="primary" gutterBottom sx={{ mb: 2 }}>
                                            System Analytics & Monitoring
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="text.secondary">Total Users</Typography>
                                                <Typography variant="h4" fontWeight="bold">1,245</Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="text.secondary">Active Grievances</Typography>
                                                <Typography variant="h4" fontWeight="bold" color="warning.main">24</Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="text.secondary">Open Internships</Typography>
                                                <Typography variant="h4" fontWeight="bold" color="success.main">8</Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="text.secondary">Avg. Resolution Time</Typography>
                                                <Typography variant="h4" fontWeight="bold" color="info.main">2.5 Days</Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}

                    {/* Notifications Section */}
                    {notifications.length > 0 && (
                        <Grid item xs={12}>
                            <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <CardContent>
                                    <Typography variant="h6" color="warning.main">Recent Notifications</Typography>
                                    {notifications.map((notif, index) => (
                                        <Chip key={index} label={notif.message} color="warning" sx={{ m: 0.5 }} />
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </motion.div>
        </Box>
    );
};

export default Dashboard;
