import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import CourseCard from '../components/CourseCard';

const AcademicPortal = () => {
    const { user } = useSelector((state) => state.auth);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAddCourse, setOpenAddCourse] = useState(false);
    const [openResources, setOpenResources] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [resources, setResources] = useState([]);
    const [newCourse, setNewCourse] = useState({ title: '', courseCode: '', description: '' });
    const [newResource, setNewResource] = useState({ title: '', description: '', fileUrl: '' });
    const [loadingResources, setLoadingResources] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/api/v1/courses');
            setCourses(res.data.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    const fetchResources = async (courseId) => {
        setLoadingResources(true);
        try {
            const res = await axios.get(`/api/v1/courses/${courseId}/resources`);
            setResources(res.data.data);
            setLoadingResources(false);
        } catch (err) {
            toast.error('Failed to load resources');
            setLoadingResources(false);
        }
    };

    const handleCreateCourse = async () => {
        try {
            await axios.post('/api/v1/courses', newCourse);
            toast.success('Course created successfully');
            setOpenAddCourse(false);
            fetchCourses();
            setNewCourse({ title: '', courseCode: '', description: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create course');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Delete this course and all its resources?")) return;
        try {
            await axios.delete(`/api/v1/courses/${id}`);
            toast.success('Course deleted');
            fetchCourses();
        } catch (err) {
            toast.error('Failed to delete course');
        }
    };

    const handleViewResources = (course) => {
        setSelectedCourse(course);
        fetchResources(course._id);
        setOpenResources(true);
    };

    const handleUploadResource = async () => {
        if (!newResource.title || !newResource.fileUrl) {
            return toast.error('Please provide a title and URL');
        }
        try {
            await axios.post(`/api/v1/courses/${selectedCourse._id}/resources`, newResource);
            toast.success('Resource uploaded');
            fetchResources(selectedCourse._id);
            setNewResource({ title: '', description: '', fileUrl: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to upload resource');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold" sx={{ background: '-webkit-linear-gradient(45deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Academic & Governance
                </Typography>
                {(user.role === 'admin' || user.role === 'faculty' || user.role === 'authority') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddCourse(true)}
                        sx={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
                    >
                        New Course
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {courses.map((course) => (
                    <Grid item xs={12} md={6} lg={4} key={course._id}>
                        <CourseCard
                            course={course}
                            userRole={user.role}
                            userId={user.id}
                            onViewResources={() => handleViewResources(course)}
                            onDelete={handleDeleteCourse}
                        />
                    </Grid>
                ))}
                {courses.length === 0 && (
                    <Box width="100%" textAlign="center" mt={4}>
                        <Typography color="text.secondary">No courses available.</Typography>
                    </Box>
                )}
            </Grid>

            {/* CREATE COURSE DIALOG */}
            <Dialog open={openAddCourse} onClose={() => setOpenAddCourse(false)} maxWidth="sm" fullWidth PaperProps={{ style: { backgroundColor: '#1e293b', color: 'white' } }}>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogContent>
                    <TextField fullWidth margin="normal" label="Course Code (e.g., CS101)" value={newCourse.courseCode} onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                    <TextField fullWidth margin="normal" label="Course Title" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                    <TextField fullWidth margin="normal" multiline rows={3} label="Description" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddCourse(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleCreateCourse} variant="contained" color="secondary">Create Course</Button>
                </DialogActions>
            </Dialog>

            {/* RESOURCES DIALOG */}
            <Dialog open={openResources} onClose={() => setOpenResources(false)} maxWidth="md" fullWidth PaperProps={{ style: { backgroundColor: '#1e293b', color: 'white' } }}>
                <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {selectedCourse?.title} - Resources
                </DialogTitle>
                <DialogContent>
                    {/* Upload Section (Faculty Only) */}
                    {(user.role === 'faculty' && selectedCourse?.faculty._id === user.id || user.role === 'admin') && (
                        <Box sx={{ p: 2, mb: 2, mt: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#a855f7' }}>Add New Resource</Typography>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={4}>
                                    <TextField fullWidth size="small" label="Title" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                                </Grid>
                                <Grid item xs={12} sm={5}>
                                    <TextField fullWidth size="small" label="File URL (Drive/PDF Link)" value={newResource.fileUrl} onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Button fullWidth variant="contained" startIcon={<CloudUploadIcon />} onClick={handleUploadResource} color="secondary">Upload</Button>
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {loadingResources ? <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box> : (
                        <List>
                            {resources.map((res) => (
                                <ListItem key={res._id} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <ListItemIcon>
                                        <DescriptionIcon sx={{ color: '#6366f1' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography color="text.primary">{res.title}</Typography>}
                                        secondary={<Typography variant="caption" color="text.secondary">Uploaded on {new Date(res.createdAt).toLocaleDateString()}</Typography>}
                                    />
                                    <ListItemSecondaryAction>
                                        <Button size="small" variant="outlined" color="primary" href={res.fileUrl} target="_blank" rel="noopener noreferrer">
                                            Open
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                            {resources.length === 0 && <Typography align="center" color="text.secondary" sx={{ py: 4 }}>No resources uploaded yet.</Typography>}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenResources(false)} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AcademicPortal;
