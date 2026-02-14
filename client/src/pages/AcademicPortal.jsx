import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Grid, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Tabs, Tab, Paper, Divider, Avatar, Container } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import ForumIcon from '@mui/icons-material/Forum';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import CourseCard from '../components/CourseCard';

const AcademicPortal = () => {
    const { user } = useSelector((state) => state.auth);

    // Main State
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' or 'course'
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Course Detail State
    const [activeTab, setActiveTab] = useState(0); // 0: Stream, 1: Classwork
    const [resources, setResources] = useState([]);
    const [loadingResources, setLoadingResources] = useState(false);

    // Forms State
    const [openAddCourse, setOpenAddCourse] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', courseCode: '', description: '' });
    const [newResource, setNewResource] = useState({ title: '', description: '', fileUrl: '' });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/courses');
            setCourses(res.data.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load courses');
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        try {
            await api.post('/courses', newCourse);
            toast.success('Course created successfully');
            setOpenAddCourse(false);
            fetchCourses();
            setNewCourse({ title: '', courseCode: '', description: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create course');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Delete this course?")) return;
        try {
            await api.delete(`/courses/${id}`);
            toast.success('Course deleted');
            fetchCourses();
        } catch (err) {
            toast.error('Failed to delete course');
        }
    };

    const handleEnterCourse = (course) => {
        setSelectedCourse(course);
        setView('course');
        setActiveTab(0);
        fetchResources(course._id);
    };

    const fetchResources = async (courseId) => {
        setLoadingResources(true);
        try {
            const res = await api.get(`/courses/${courseId}/resources`);
            setResources(res.data.data);
            setLoadingResources(false);
        } catch (err) {
            toast.error('Failed to load resources');
            setLoadingResources(false);
        }
    };

    const handleUploadResource = async () => {
        if (!newResource.title || !newResource.fileUrl) {
            return toast.error('Please provide a title and URL');
        }
        try {
            await api.post(`/courses/${selectedCourse._id}/resources`, newResource);
            toast.success('Material posted');
            fetchResources(selectedCourse._id);
            setNewResource({ title: '', description: '', fileUrl: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to upload');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;

    // ------------------- LIST VIEW -------------------
    if (view === 'list') {
        return (
            <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" fontWeight="bold" sx={{ background: '-webkit-linear-gradient(45deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Academic Hub
                    </Typography>
                    {(user.role === 'admin' || user.role === 'faculty' || user.role === 'authority') && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenAddCourse(true)}
                            sx={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
                        >
                            Create Class
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
                                onViewResources={() => handleEnterCourse(course)}
                                onDelete={handleDeleteCourse}
                            />
                        </Grid>
                    ))}
                    {courses.length === 0 && (
                        <Box width="100%" textAlign="center" mt={4}>
                            <Typography color="text.secondary">No courses found. Join or create one!</Typography>
                        </Box>
                    )}
                </Grid>

                {/* CREATE COURSE DIALOG */}
                <Dialog open={openAddCourse} onClose={() => setOpenAddCourse(false)} maxWidth="sm" fullWidth PaperProps={{ style: { backgroundColor: '#1e293b', color: 'white' } }}>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogContent>
                        <TextField fullWidth margin="normal" label="Course Code" value={newCourse.courseCode} onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        <TextField fullWidth margin="normal" label="Subject / Tile" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        <TextField fullWidth margin="normal" multiline rows={3} label="Description / Room" value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAddCourse(false)} color="inherit">Cancel</Button>
                        <Button onClick={handleCreateCourse} variant="contained" color="secondary">Create</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    // ------------------- COURSE VIEW (Classroom Style) -------------------
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Header / Banner */}
            <Box sx={{ bgcolor: '#1e293b', color: 'white', p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Container maxWidth="lg">
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => setView('list')} sx={{ color: 'white' }}>
                            All Classes
                        </Button>
                        <Typography variant="h6">{selectedCourse.title}</Typography>
                    </Box>

                    <Box sx={{ p: 4, bgcolor: '#3b82f6', borderRadius: 2, mb: 0, position: 'relative', overflow: 'hidden' }}>
                        <Box position="relative" zIndex={1}>
                            <Typography variant="h3" fontWeight="bold">{selectedCourse.title}</Typography>
                            <Typography variant="h5" sx={{ opacity: 0.9 }}>{selectedCourse.courseCode}</Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>{selectedCourse.description}</Typography>
                        </Box>
                        {/* Abstract Shape Overlay */}
                        <Box sx={{ position: 'absolute', right: -50, bottom: -50, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                    </Box>

                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mt: 2, '& .MuiTab-root': { color: 'white' }, '& .Mui-selected': { color: '#3b82f6' } }}>
                        <Tab label="Stream" />
                        <Tab label="Classwork" />
                        <Tab label="People" />
                    </Tabs>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* TAB 0: STREAM */}
                {activeTab === 0 && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                            <Paper sx={{ p: 2, bgcolor: '#1e293b', color: 'white', borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Upcoming</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No work due soon</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={9}>
                            <Paper sx={{ p: 2, mb: 3, bgcolor: '#1e293b', color: 'white', display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                                <Avatar sx={{ bgcolor: '#ec4899' }}>{user.user?.username?.charAt(0) || 'U'}</Avatar>
                                <Typography color="text.secondary">Announce something to your class...</Typography>
                            </Paper>

                            {resources.slice(0, 3).map((res) => (
                                <Paper key={res._id} sx={{ p: 3, mb: 2, bgcolor: '#1e293b', color: 'white' }}>
                                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                                        <Avatar sx={{ bgcolor: '#3b82f6' }}><AssignmentIcon /></Avatar>
                                        <Box>
                                            <Typography variant="subtitle1">{selectedCourse.faculty.username || 'Faculty'} posted a new material: {res.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{new Date(res.createdAt).toLocaleDateString()}</Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Grid>
                    </Grid>
                )}

                {/* TAB 1: CLASSWORK */}
                {activeTab === 1 && (
                    <Box>
                        {/* Upload for Faculty */}
                        {(user.role === 'admin' || user.role === 'faculty' || (user.role === 'authority' && selectedCourse.faculty._id === user.id)) && (
                            <Box sx={{ mb: 4, p: 3, bgcolor: '#1e293b', borderRadius: 2 }}>
                                <Typography variant="h6" color="white" gutterBottom>Add Material</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={5}>
                                        <TextField fullWidth size="small" label="Title" value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                                    </Grid>
                                    <Grid item xs={12} md={5}>
                                        <TextField fullWidth size="small" label="Link (URL)" value={newResource.fileUrl} onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                                    </Grid>
                                    <Grid item xs={12} md={2}>
                                        <Button fullWidth variant="contained" startIcon={<CloudUploadIcon />} onClick={handleUploadResource}>Post</Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        <Box>
                            {resources.map((res) => (
                                <Paper key={res._id} component={motion.div} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} sx={{ p: 0, mb: 2, bgcolor: '#1e293b', overflow: 'hidden' }}>
                                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                        <Avatar sx={{ bgcolor: '#6366f1' }}><DescriptionIcon /></Avatar>
                                        <Box flexGrow={1}>
                                            <Typography variant="subtitle1" color="white" fontWeight="bold">{res.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">Posted {new Date(res.createdAt).toLocaleDateString()}</Typography>
                                        </Box>
                                        <Button variant="outlined" color="primary" href={res.fileUrl} target="_blank">View</Button>
                                    </Box>
                                </Paper>
                            ))}
                            {resources.length === 0 && <Typography align="center" color="text.secondary">No classwork yet.</Typography>}
                        </Box>
                    </Box>
                )}

                {/* TAB 2: PEOPLE */}
                {activeTab === 2 && (
                    <Box maxWidth="md">
                        <Typography variant="h4" color="primary" sx={{ borderBottom: '1px solid #3b82f6', pb: 2, mb: 3 }}>Teachers</Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <Avatar sx={{ width: 32, height: 32 }} />
                            <Typography variant="body1" color="white">{selectedCourse.faculty.username}</Typography>
                        </Box>

                        <Typography variant="h4" color="primary" sx={{ borderBottom: '1px solid #3b82f6', pb: 2, mb: 3, mt: 4 }}>Students</Typography>
                        <Typography color="text.secondary" fontStyle="italic">Students list will appear here.</Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
};

export default AcademicPortal;
