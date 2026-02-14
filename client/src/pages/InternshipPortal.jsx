import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Grid, CircularProgress, IconButton, Tabs, Tab, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import InternshipCard from '../components/InternshipCard';

const InternshipPortal = () => {
    const { user } = useSelector((state) => state.auth);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0); // 0: Listings, 1: My Applications (Student) / New Post (Faculty)
    const [applications, setApplications] = useState([]); // For students to see their status
    const [newInternship, setNewInternship] = useState({ title: '', company: '', description: '', type: 'internship', location: '', stipend: 'Unpaid', duration: '', deadline: '' });
    const [openPostDialog, setOpenPostDialog] = useState(false);
    const [openAppsDialog, setOpenAppsDialog] = useState(false);
    const [selectedInternshipApps, setSelectedInternshipApps] = useState([]);
    const [selectedInternshipTitle, setSelectedInternshipTitle] = useState('');

    useEffect(() => {
        fetchInternships();
        if (user.role === 'student') fetchMyApplications();
    }, [user.role]);

    const fetchInternships = async () => {
        try {
            const res = await axios.get('/api/v1/internships');
            setInternships(res.data.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load internships');
            setLoading(false);
        }
    };

    const fetchMyApplications = async () => {
        try {
            const res = await axios.get('/api/v1/applications/my');
            setApplications(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApply = async (id, resumeLink) => {
        try {
            await axios.post(`/api/v1/internships/${id}/apply`, { resumeLink });
            toast.success('Application submitted successfully!');
            fetchMyApplications();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to apply');
        }
    };

    const handlePostInternship = async () => {
        try {
            await axios.post('/api/v1/internships', newInternship);
            toast.success('Internship posted successfully!');
            setOpenPostDialog(false);
            fetchInternships();
            setNewInternship({ title: '', company: '', description: '', type: 'internship', location: '', stipend: 'Unpaid', duration: '', deadline: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to post');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this opportunity?")) return;
        try {
            await axios.delete(`/api/v1/internships/${id}`);
            toast.success('Deleted successfully');
            fetchInternships();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete');
        }
    };

    const handleViewApplications = async (id) => {
        try {
            const res = await axios.get(`/api/v1/internships/${id}/applications`);
            setSelectedInternshipApps(res.data.data);
            const internship = internships.find(i => i._id === id);
            setSelectedInternshipTitle(internship ? internship.title : 'Applications');
            setOpenAppsDialog(true);
        } catch (err) {
            toast.error('Failed to load applications');
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        try {
            await axios.put(`/api/v1/applications/${appId}`, { status });
            toast.success(`Application ${status}`);
            // Refresh the list
            const updatedApps = selectedInternshipApps.map(app =>
                app._id === appId ? { ...app, status } : app
            );
            setSelectedInternshipApps(updatedApps);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold" sx={{ background: '-webkit-linear-gradient(45deg, #3b82f6, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Career & Research Portal
                </Typography>
                {(user.role === 'admin' || user.role === 'faculty') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenPostDialog(true)}
                        sx={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
                    >
                        Post Opportunity
                    </Button>
                )}
            </Box>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 4, '& .MuiTabs-indicator': { backgroundColor: '#3b82f6' } }}>
                <Tab label="Explore Opportunities" sx={{ color: 'white' }} />
                {user.role === 'student' && <Tab label="My Applications" sx={{ color: 'white' }} />}
            </Tabs>

            {/* TAB 0: EXPLORE */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {internships.map((internship) => (
                        <Grid item xs={12} md={6} lg={4} key={internship._id}>
                            <InternshipCard
                                internship={internship}
                                userRole={user.role}
                                onApply={handleApply}
                                onDelete={handleDelete}
                                onViewApplications={handleViewApplications}
                            />
                        </Grid>
                    ))}
                    {internships.length === 0 && (
                        <Box width="100%" textAlign="center" mt={4}>
                            <Typography color="text.secondary">No opportunities available at the moment.</Typography>
                        </Box>
                    )}
                </Grid>
            )}

            {/* TAB 1: MY APPLICATIONS (STUDENT) */}
            {activeTab === 1 && user.role === 'student' && (
                <Box>
                    {applications.map((app) => (
                        <Box key={app._id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ mb: 2, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" color="primary">{app.internship.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    {app.status === 'accepted' && <CheckCircleIcon color="success" />}
                                    {app.status === 'rejected' && <CancelIcon color="error" />}
                                    <Chip
                                        label={app.status.toUpperCase()}
                                        color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>
                        </Box>
                    ))}
                    {applications.length === 0 && <Typography align="center" color="text.secondary">You haven't applied to any roles yet.</Typography>}
                </Box>
            )}

            {/* POST DIALOG (FACULTY/ADMIN) */}
            <Dialog open={openPostDialog} onClose={() => setOpenPostDialog(false)} maxWidth="md" fullWidth PaperProps={{ style: { backgroundColor: '#1e293b', color: 'white' } }}>
                <DialogTitle>Post New Opportunity</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Title" value={newInternship.title} onChange={(e) => setNewInternship({ ...newInternship, title: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Company/Lab" value={newInternship.company} onChange={(e) => setNewInternship({ ...newInternship, company: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={4} label="Description" value={newInternship.description} onChange={(e) => setNewInternship({ ...newInternship, description: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth label="Type" value={newInternship.type} onChange={(e) => setNewInternship({ ...newInternship, type: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }}>
                                <MenuItem value="internship">Internship</MenuItem>
                                <MenuItem value="research">Research</MenuItem>
                                <MenuItem value="project">Project</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Location" value={newInternship.location} onChange={(e) => setNewInternship({ ...newInternship, location: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Stipend" value={newInternship.stipend} onChange={(e) => setNewInternship({ ...newInternship, stipend: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Duration" value={newInternship.duration} onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField type="date" fullWidth label="Deadline" InputLabelProps={{ shrink: true, style: { color: '#94a3b8' } }} value={newInternship.deadline} onChange={(e) => setNewInternship({ ...newInternship, deadline: e.target.value })} InputProps={{ style: { color: 'white' } }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPostDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handlePostInternship} variant="contained" color="primary">Post Now</Button>
                </DialogActions>
            </Dialog>

            {/* VIEW APPLICATIONS DIALOG (FACULTY) */}
            <Dialog open={openAppsDialog} onClose={() => setOpenAppsDialog(false)} maxWidth="md" fullWidth PaperProps={{ style: { backgroundColor: '#1e293b', color: 'white' } }}>
                <DialogTitle>Applications for {selectedInternshipTitle}</DialogTitle>
                <DialogContent>
                    {selectedInternshipApps.length === 0 ? (
                        <Typography color="text.secondary">No applications yet.</Typography>
                    ) : (
                        selectedInternshipApps.map((app) => (
                            <Box key={app._id} sx={{ mb: 2, p: 2, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <Grid container alignItems="center" spacing={2}>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="subtitle1" fontWeight="bold">{app.student.username || 'Student'}</Typography>
                                        <Typography variant="body2" color="text.secondary">{app.student.email}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
                                            View Resume
                                        </a>
                                        <Box mt={1}>
                                            <Chip label={app.status.toUpperCase()} size="small" color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'} />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4} display="flex" gap={1} justifyContent="flex-end">
                                        <Button size="small" variant="contained" color="success" onClick={() => handleUpdateStatus(app._id, 'accepted')} disabled={app.status === 'accepted'}>Accept</Button>
                                        <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateStatus(app._id, 'rejected')} disabled={app.status === 'rejected'}>Reject</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAppsDialog(false)} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InternshipPortal;
