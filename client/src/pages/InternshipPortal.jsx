import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Grid, CircularProgress, Tabs, Tab, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Avatar, Divider, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const InternshipPortal = () => {
    const { user } = useSelector((state) => state.auth);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedInternship, setSelectedInternship] = useState(null);
    const [applications, setApplications] = useState([]);
    const [newInternship, setNewInternship] = useState({ title: '', company: '', description: '', type: 'internship', location: '', stipend: 'Unpaid', duration: '', deadline: '' });
    const [openPostDialog, setOpenPostDialog] = useState(false);
    const [applyDialogOpen, setApplyDialogOpen] = useState(false);
    const [resumeLink, setResumeLink] = useState('');

    // Faculty specific
    const [openAppsDialog, setOpenAppsDialog] = useState(false);
    const [selectedInternshipApps, setSelectedInternshipApps] = useState([]);

    useEffect(() => {
        fetchInternships();
        if (user.role === 'student') fetchMyApplications();
    }, [user.role]);

    const fetchInternships = async () => {
        try {
            const res = await api.get('/internships');
            setInternships(res.data.data);
            if (res.data.data.length > 0) setSelectedInternship(res.data.data[0]);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load internships');
            setLoading(false);
        }
    };

    const fetchMyApplications = async () => {
        try {
            const res = await api.get('/applications/my');
            setApplications(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApply = async () => {
        if (!resumeLink) return toast.error('Please provide a resume link');
        try {
            await api.post(`/internships/${selectedInternship._id}/apply`, { resumeLink });
            toast.success('Application submitted successfully!');
            setApplyDialogOpen(false);
            setResumeLink('');
            fetchMyApplications();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to apply');
        }
    };

    const handlePostInternship = async () => {
        try {
            await api.post('/internships', newInternship);
            toast.success('Internship posted successfully!');
            setOpenPostDialog(false);
            fetchInternships();
            setNewInternship({ title: '', company: '', description: '', type: 'internship', location: '', stipend: 'Unpaid', duration: '', deadline: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to post');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this opportunity?")) return;
        try {
            await api.delete(`/internships/${id}`);
            toast.success('Deleted successfully');
            fetchInternships();
            setSelectedInternship(null);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete');
        }
    };

    const handleViewApplications = async (id) => {
        try {
            const res = await api.get(`/internships/${id}/applications`);
            setSelectedInternshipApps(res.data.data);
            setOpenAppsDialog(true);
        } catch (err) {
            toast.error('Failed to load applications');
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        try {
            await api.put(`/applications/${appId}`, { status });
            toast.success(`Application ${status}`);
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
        <Box sx={{ p: 3, minHeight: '100vh', bgcolor: '#f3f4f6' }}> {/* LinkedIn Light Gray BG */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} sx={{ bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <Typography variant="h5" fontWeight="bold" color="primary">
                    Jobs & Research
                </Typography>
                {(user.role === 'admin' || user.role === 'faculty' || user.role === 'authority') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenPostDialog(true)}
                        sx={{ borderRadius: 20 }}
                    >
                        Post Job
                    </Button>
                )}
            </Box>

            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, bgcolor: 'white', borderRadius: 2 }}>
                <Tab label="Search Jobs" />
                {user.role === 'student' && <Tab label="My Applications" />}
            </Tabs>

            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {/* LEFT COLUMN: LIST */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ maxHeight: '80vh', overflowY: 'auto', bgcolor: 'white' }}>
                            {internships.map((internship) => (
                                <Box
                                    key={internship._id}
                                    onClick={() => setSelectedInternship(internship)}
                                    sx={{
                                        p: 2,
                                        borderBottom: '1px solid #e5e7eb',
                                        cursor: 'pointer',
                                        bgcolor: selectedInternship?._id === internship._id ? '#e0f2fe' : 'transparent',
                                        '&:hover': { bgcolor: '#f3f4f6' }
                                    }}
                                >
                                    <Box display="flex" gap={2}>
                                        <Avatar variant="rounded" sx={{ bgcolor: '#3b82f6' }}>{internship.company.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">{internship.title}</Typography>
                                            <Typography variant="body2" color="text.secondary">{internship.company}</Typography>
                                            <Typography variant="caption" color="text.secondary">{internship.location} ({internship.type})</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                            {internships.length === 0 && <Box p={3} textAlign="center">No jobs found.</Box>}
                        </Paper>
                    </Grid>

                    {/* RIGHT COLUMN: DETAIL */}
                    <Grid item xs={12} md={8}>
                        {selectedInternship ? (
                            <Paper sx={{ p: 4, minHeight: '80vh', position: 'relative' }}>
                                <Box display="flex" justifyContent="space-between" alignItems="start">
                                    <Box>
                                        <Typography variant="h4" fontWeight="bold" gutterBottom>{selectedInternship.title}</Typography>
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            {selectedInternship.company} · {selectedInternship.location}
                                        </Typography>
                                        <Box display="flex" gap={1} mb={2}>
                                            <Chip icon={<WorkIcon />} label={selectedInternship.type.toUpperCase()} color="primary" size="small" variant="outlined" />
                                            <Chip icon={<AccessTimeIcon />} label={selectedInternship.duration} size="small" variant="outlined" />
                                            <Chip icon={<AttachMoneyIcon />} label={selectedInternship.stipend} color="success" size="small" variant="outlined" />
                                        </Box>
                                    </Box>

                                    <Box display="flex" flexDirection="column" gap={1}>
                                        {user.role === 'student' && (
                                            <Button variant="contained" size="large" onClick={() => setApplyDialogOpen(true)}>Apply Now</Button>
                                        )}
                                        {(user.role === 'admin' || user.role === 'faculty' || user.role === 'authority') && (
                                            <>
                                                <Button variant="outlined" onClick={() => handleViewApplications(selectedInternship._id)}>Manage Applications</Button>
                                                <Button variant="text" color="error" onClick={() => handleDelete(selectedInternship._id)}>Delete Job</Button>
                                            </>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" fontWeight="bold" gutterBottom>About the job</Typography>
                                <Typography variant="body1" paragraph style={{ whiteSpace: 'pre-line', color: '#4b5563' }}>
                                    {selectedInternship.description}
                                </Typography>

                                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 4 }}>
                                    Posted on {new Date(selectedInternship.createdAt).toLocaleDateString()}
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper sx={{ p: 4, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="h6" color="text.secondary">Select a job to view details</Typography>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            )}

            {activeTab === 1 && user.role === 'student' && (
                <Box maxWidth="md" mx="auto">
                    {applications.map((app) => (
                        <Paper key={app._id} sx={{ p: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">{app.internship.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{app.internship.company}</Typography>
                                <Typography variant="caption" display="block">Applied: {new Date(app.appliedAt).toLocaleDateString()}</Typography>
                            </Box>
                            <Chip
                                label={app.status.toUpperCase()}
                                color={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'error' : 'warning'}
                                icon={app.status === 'accepted' ? <CheckCircleIcon /> : <AccessTimeIcon />}
                            />
                        </Paper>
                    ))}
                    {applications.length === 0 && <Typography align="center" color="text.secondary">No applications yet.</Typography>}
                </Box>
            )}

            {/* DIALOGS */}
            <Dialog open={openPostDialog} onClose={() => setOpenPostDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Post a Job</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={6}><TextField fullWidth label="Job Title" value={newInternship.title} onChange={(e) => setNewInternship({ ...newInternship, title: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Company" value={newInternship.company} onChange={(e) => setNewInternship({ ...newInternship, company: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField fullWidth multiline rows={4} label="Description" value={newInternship.description} onChange={(e) => setNewInternship({ ...newInternship, description: e.target.value })} /></Grid>
                        <Grid item xs={6}>
                            <TextField select fullWidth label="Type" value={newInternship.type} onChange={(e) => setNewInternship({ ...newInternship, type: e.target.value })}>
                                <MenuItem value="internship">Internship</MenuItem>
                                <MenuItem value="research">Research</MenuItem>
                                <MenuItem value="project">Project</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}><TextField fullWidth label="Location" value={newInternship.location} onChange={(e) => setNewInternship({ ...newInternship, location: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Stipend" value={newInternship.stipend} onChange={(e) => setNewInternship({ ...newInternship, stipend: e.target.value })} /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="Duration" value={newInternship.duration} onChange={(e) => setNewInternship({ ...newInternship, duration: e.target.value })} /></Grid>
                        <Grid item xs={12}><TextField type="date" fullWidth label="Deadline" InputLabelProps={{ shrink: true }} value={newInternship.deadline} onChange={(e) => setNewInternship({ ...newInternship, deadline: e.target.value })} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPostDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handlePostInternship}>Post</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Easy Apply</DialogTitle>
                <DialogContent>
                    <TextField fullWidth autoFocus margin="dense" label="Resume Link (Drive/LinkedIn)" value={resumeLink} onChange={(e) => setResumeLink(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleApply}>Submit Application</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openAppsDialog} onClose={() => setOpenAppsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Applicants</DialogTitle>
                <DialogContent>
                    {selectedInternshipApps.map(app => (
                        <Box key={app._id} sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">{app.student.username || 'Student'}</Typography>
                                <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>View Resume</a>
                            </Box>
                            <Box display="flex" gap={1}>
                                <Button size="small" variant="contained" color="success" onClick={() => handleUpdateStatus(app._id, 'accepted')} disabled={app.status === 'accepted'}>Accept</Button>
                                <Button size="small" variant="outlined" color="error" onClick={() => handleUpdateStatus(app._id, 'rejected')} disabled={app.status === 'rejected'}>Reject</Button>
                            </Box>
                        </Box>
                    ))}
                    {selectedInternshipApps.length === 0 && <Typography>No applicants yet.</Typography>}
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenAppsDialog(false)}>Close</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

export default InternshipPortal;
