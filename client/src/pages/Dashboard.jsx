import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import io from 'socket.io-client';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [analytics, setAnalytics] = useState(null);

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

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'authority') {
            const fetchAnalytics = async () => {
                try {
                    const res = await api.get('/analytics');
                    setAnalytics(res.data.data);
                } catch (err) {
                    console.error("Error fetching analytics", err);
                }
            };
            fetchAnalytics();
        }
    }, [user]);

    return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #3b82f6, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome, {user?.username}
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

                            {user?.role === 'admin' && (
                                <Grid item xs={12} md={6}>
                                    <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <CardContent>
                                            <Typography variant="h5" color="error.main" gutterBottom>System Configuration</Typography>
                                            <Typography variant="body2" color="text.secondary" paragraph>
                                                Manage allowed email domains and security settings.
                                            </Typography>
                                            <Button variant="contained" color="error" onClick={() => navigate('/admin/domains')}>
                                                Manage Domains
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}

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
                                                <Typography variant="h4" fontWeight="bold">{analytics?.counts?.users || 0}</Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="text.secondary">Active Grievances</Typography>
                                                <Typography variant="h4" fontWeight="bold" color="warning.main">{analytics?.counts?.active_grievances || 0}</Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="text.secondary">Open Internships</Typography>
                                                <Typography variant="h4" fontWeight="bold" color="success.main">{analytics?.counts?.internships || 0}</Typography>
                                            </Grid>
                                            <Grid item xs={6} md={3}>
                                                <Typography variant="subtitle2" color="text.secondary">Total Tickets</Typography>
                                                <Typography variant="h4" fontWeight="bold" color="info.main">{analytics?.counts?.grievances || 0}</Typography>
                                            </Grid>
                                        </Grid>

                                        {/* Department Breakdown */}
                                        <Typography variant="h6" color="primary" sx={{ mt: 3, mb: 1 }}>Department Statistics</Typography>
                                        <Grid container spacing={2}>
                                            {analytics?.department_users?.map((dept) => (
                                                <Grid item xs={12} sm={6} md={4} key={dept._id}>
                                                    <Box sx={{ p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                                        <Typography variant="subtitle1" fontWeight="bold" color="secondary">{dept._id}</Typography>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                            <Typography variant="body2" color="text.secondary">Students: {dept.students}</Typography>
                                                            <Typography variant="body2" color="text.secondary">Faculty: {dept.faculty}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            ))}
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
