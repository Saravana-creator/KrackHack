import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Avatar, Button, TextField, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);

    // Safety check if user is not yet loaded
    const username = user?.username || '';
    const email = user?.email || '';
    const department = user?.department || '';
    const role = user?.role || '';

    const handleSave = async () => {
        // Implement backend update call here if API exists
        toast.success("Profile saved (demo only)");
        setIsEditing(false);
    };

    return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
                    My Profile
                </Typography>

                <Grid container spacing={4}>
                    {/* User Summary Card */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3 }}>
                            <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}>
                                {username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>{username}</Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>{role.toUpperCase()}</Typography>
                            <Chip label={department || 'N/A'} color="secondary" variant="outlined" />
                        </Paper>
                    </Grid>

                    {/* Details Section */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                                <Typography variant="h6" color="primary">Personal Information</Typography>
                                <Button
                                    variant={isEditing ? "outlined" : "contained"}
                                    color="primary"
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </Button>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={username}
                                        helperText="Contact Admin to change name"
                                        disabled
                                        variant="filled"
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        value={email}
                                        disabled
                                        helperText="Email cannot be changed"
                                        variant="filled"
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Department"
                                        value={department}
                                        disabled
                                        variant="filled"
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Role"
                                        value={role.toUpperCase()}
                                        disabled
                                        variant="filled"
                                        InputProps={{ style: { color: 'white' } }}
                                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                                    />
                                </Grid>

                                {isEditing && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" color="warning.main">
                                            Note: To update critical information like Name, Email, or Department, please contact the administrator.
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </motion.div>
        </Box>
    );
};

export default Profile;
