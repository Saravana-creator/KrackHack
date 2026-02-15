import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Card, CardContent, Button, Grid, Chip, 
    CircularProgress, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFileAlt, FaSave, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FacultyApplications = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await api.get(`/opportunities/${id}/applications`);
                setApplications(res.data.data);
            } catch (err) {
                console.error("Error fetching applications", err);
                toast.error("Failed to load applications");
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [id]);

    const handleStatusChange = (appId, newStatus) => {
        setApplications(prev => prev.map(app => 
            app._id === appId ? { ...app, status: newStatus } : app
        ));
    };

    const handleSave = async (appId, status) => {
        setUpdating(appId);
        try {
            await api.put(`/opportunities/applications/${appId}/status`, { status });
            toast.success("Application status updated!");
        } catch (err) {
            console.error("Error updating status", err);
            toast.error("Failed to update status");
        } finally {
            setUpdating(null);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
            <Button 
                startIcon={<FaArrowLeft />} 
                onClick={() => navigate(-1)} 
                sx={{ mb: 3, color: 'text.secondary' }}
            >
                Back to Opportunities
            </Button>
            
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#f8fafc' }}>
                Manage Applications
            </Typography>

            <Grid container spacing={3}>
                {applications.length === 0 ? (
                    <Typography sx={{ ml: 3, color: 'text.secondary' }}>No applications received yet.</Typography>
                ) : (
                    applications.map((app) => (
                        <Grid item xs={12} md={6} key={app._id}>
                            <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" color="primary">
                                                {app.student?.username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {app.student?.email}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {app.student?.department}
                                            </Typography>
                                        </Box>
                                        <Chip 
                                            label={app.status} 
                                            color={
                                                app.status === 'accepted' ? 'success' : 
                                                app.status === 'rejected' ? 'error' : 
                                                app.status === 'shortlisted' ? 'warning' : 'default'
                                            } 
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Skills / Cover Letter:
                                        </Typography>
                                        <Typography variant="body2" sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 1, borderRadius: 1 }}>
                                            {app.coverLetter || "No details provided."}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel sx={{ color: 'text.secondary' }}>Status</InputLabel>
                                            <Select
                                                value={app.status}
                                                label="Status"
                                                onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                                sx={{ 
                                                    color: 'white',
                                                    '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
                                                }}
                                            >
                                                <MenuItem value="submitted">Submitted</MenuItem>
                                                <MenuItem value="shortlisted">Shortlisted</MenuItem>
                                                <MenuItem value="accepted">Accepted</MenuItem>
                                                <MenuItem value="rejected">Rejected</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <Button 
                                            variant="contained" 
                                            color="secondary"
                                            startIcon={updating === app._id ? <CircularProgress size={20} /> : <FaSave />}
                                            onClick={() => handleSave(app._id, app.status)}
                                            disabled={updating === app._id}
                                        >
                                            Save
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                )}
            </Grid>
        </Box>
    );
};

export default FacultyApplications;
