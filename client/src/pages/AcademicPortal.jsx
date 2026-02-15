import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab,
  Paper,
  Divider,
  Avatar,
  Container,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import ForumIcon from "@mui/icons-material/Forum";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FolderIcon from "@mui/icons-material/Folder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import CourseCard from "../components/CourseCard";

const AcademicPortal = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Main State
  const [courses, setCourses] = useState([]); // Catalog
  const [myCourses, setMyCourses] = useState([]); // Enrolled
  const [enrollments, setEnrollments] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ credits: 0, attendance: 0 });

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("my-courses"); // Default to 'my-courses' (Classes)
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Course Detail State
  const [activeTab, setActiveTab] = useState(0); // 0: Stream, 1: Classwork
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // Forms State
  const [openAddCourse, setOpenAddCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    courseCode: "",
    description: "",
    credits: 3,
    semester: "Fall 2024",
  });
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    fileUrl: "",
  });
  const [attendanceStatus, setAttendanceStatus] = useState("Present");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch common data
      const coursesRes = await api.get("/courses").catch(err => {
          console.error("Failed to fetch courses catalog:", err);
          return { data: { data: [] } };
      });
      setCourses(coursesRes.data.data || []);

      const resourcesRes = await api.get("/resources").catch(err => {
          console.error("Failed to fetch resources:", err);
          return { data: { data: [] } };
      });
      setResources(resourcesRes.data.data || []);

      if (user.role === 'faculty') {
          // FACULTY FETCH LOGIC
          console.log("Fetching faculty academic data...");
          try {
              const facultyDataRes = await api.get("/academics/faculty");
              console.log("Faculty data received:", facultyDataRes.data);
              
              setMyCourses(facultyDataRes.data.courses || []); 
              setEvents(facultyDataRes.data.events || []);
              setEnrollments([]); 
              setAttendance([]);
              
              setStats({
                  credits: (facultyDataRes.data.courses || []).length,
                  attendance: 0
              });

              // If courses found, set view to my-courses
              if (facultyDataRes.data.courses && facultyDataRes.data.courses.length > 0) {
                  setView("my-courses");
              } else {
                  // If no courses, maybe default to catalog or show empty state
                  // But keep view as "my-courses" so user sees "No classes" message instead of empty catalog
                  setView("my-courses");
              }

          } catch (err) {
              console.error("Failed to fetch faculty specific data:", err);
              toast.error("Could not load your classes.");
              setMyCourses([]);
              setEvents([]);
          }

      } else {
          // STUDENT FETCH LOGIC
          try {
              const [myCoursesRes, attendanceRes, eventsRes] = await Promise.all([
                  api.get("/academics/my-courses"),
                  api.get("/academics/attendance"),
                  api.get("/academics/events"),
              ]);
        
              setEnrollments(myCoursesRes.data.data || []);
              const myCourseList = (myCoursesRes.data.data || []).map((e) => e.course);
              setMyCourses(myCourseList);
        
              setAttendance(attendanceRes.data.data || []);
              setEvents(eventsRes.data.data || []);
        
              const totalCredits = myCourseList.reduce((acc, curr) => acc + (curr.credits || 0), 0);
              const totalAttendance = (attendanceRes.data.data || []).length;
        
              setStats({ credits: totalCredits, attendance: totalAttendance });
          } catch (err) {
              console.error("Failed to fetch student data:", err);
              toast.error("Could not load student data.");
          }
      }

      setLoading(false);
    } catch (err) {
      console.error("Critical error in fetchAllData:", err);
      toast.error("Failed to load academic portal.");
      setLoading(false);
    }

  };

  const handleCreateCourse = async () => {
    try {
      await api.post("/courses", newCourse);
      toast.success("Course created successfully");
      setOpenAddCourse(false);
      fetchAllData();
      setNewCourse({
        title: "",
        courseCode: "",
        description: "",
        credits: 3,
        semester: "Fall 2024",
      });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create course");
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/academics/enroll/${courseId}`);
      toast.success("Enrolled successfully!");
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Enrollment failed");
    }
  };

  const handleLogAttendance = async () => {
    try {
      await api.post("/academics/attendance", { status: attendanceStatus });
      toast.success("Attendance logged");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to log attendance");
    }
  };

  const handleEnterCourse = (course) => {
    setSelectedCourse(course);
    setView("course-detail");
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
      toast.error("Failed to load resources");
      setLoadingResources(false);
    }
  };

  const handleUploadResource = async () => {
    if (!newResource.title || !newResource.fileUrl) {
      return toast.error("Please provide a title and URL");
    }
    try {
      await api.post(`/courses/${selectedCourse._id}/resources`, newResource);
      toast.success("Material posted");
      fetchResources(selectedCourse._id);
      setNewResource({ title: "", description: "", fileUrl: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to upload");
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  // ------------------- FACULTY ACADEMIC HUB -------------------
  if (user.role === 'faculty') {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* FACULTY TOP BAR */}
        <Box
          sx={{
            bgcolor: "#1e293b",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Container maxWidth="xl">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    background: "linear-gradient(45deg, #a855f7, #ec4899)", // Different gradient for Faculty
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mr: 4,
                  }}
                >
                  Academic Hub — Faculty
                </Typography>
                
                {/* Faculty Tabs */}
                <Box display={{ xs: "none", md: "flex" }} gap={1}>
                  <Button
                    onClick={() => setView("my-courses")}
                    sx={{
                      color: view === "my-courses" || view === "course-detail" ? "#a855f7" : "white",
                      borderBottom:
                        view === "my-courses" || view === "course-detail"
                          ? "2px solid #a855f7"
                          : "2px solid transparent",
                      borderRadius: 0,
                    }}
                  >
                    My Classes
                  </Button>
                  <Button
                    onClick={() => navigate("/academics/calendar")}
                    sx={{
                      color: "white",
                      borderBottom: "2px solid transparent",
                      borderRadius: 0,
                      "&:hover": {
                        borderBottom: "2px solid #a855f7",
                      }
                    }}
                  >
                    Calendar
                  </Button>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenAddCourse(true)}
                  sx={{
                    bgcolor: "#a855f7",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#9333ea" },
                    boxShadow: "0 4px 14px 0 rgba(168, 85, 247, 0.39)",
                  }}
                >
                  Create Class
                </Button>
                <Avatar sx={{ bgcolor: "#ec4899" }}>
                  {user.username?.charAt(0)}
                </Avatar>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* FACULTY MAIN CONTENT */}
        <Container maxWidth="xl" sx={{ mt: 4, pb: 8 }}>
            
          {/* FACULTY CLASSES VIEW */}
          {view === "my-courses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                {myCourses.map((course) => (
                  <Grid item xs={12} md={6} lg={4} key={course._id}>
                    <CourseCard
                      course={course}
                      userRole={user.role}
                      userId={user.id}
                      onViewResources={handleEnterCourse}
                      onDelete={handleDeleteCourse} // Faculty can delete their own courses
                    />
                  </Grid>
                ))}
                
                {/* FACULTY EMPTY STATE */}
                {myCourses.length === 0 && (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 8,
                        textAlign: "center",
                        bgcolor: "#1e293b",
                        border: "1px dashed rgba(255,255,255,0.2)",
                        borderRadius: 4
                      }}
                    >
                        <FolderIcon sx={{ fontSize: 60, color: "#475569", mb: 2 }} />
                        <Typography variant="h5" color="white" gutterBottom>
                            You haven't created any classes yet.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={4}>
                            Start by creating a class to manage students and materials.
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenAddCourse(true)}
                            sx={{
                              bgcolor: "#a855f7",
                              "&:hover": { bgcolor: "#9333ea" },
                            }}
                        >
                            Create Your First Class
                        </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          )}

          {/* FACULTY CALENDAR VIEW (Reused Logic) */}
          {view === "calendar" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h4" color="white" fontWeight="bold" mb={4}>
                Academic Calendar
              </Typography>
              <Grid container spacing={2}>
                {events.map((ev) => (
                    <Grid item xs={12} md={4} key={ev._id}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "#1e293b",
                        color: "white",
                        borderLeft: "4px solid #a855f7",
                      }}
                    >
                      <Typography variant="h6">{ev.title}</Typography>
                      <Typography variant="body2" color="#94a3b8" gutterBottom>
                        {new Date(ev.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" sx={{ bgcolor: "rgba(255,255,255,0.1)", px: 1, borderRadius: 1 }}>
                         {ev.courseName || ev.type}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
                {events.length === 0 && (
                    <Typography color="text.secondary">No events scheduled.</Typography>
                )}
              </Grid>
            </motion.div>
          )}
          
          {/* FACULTY COURSE DETAIL VIEW (Classroom) */}
          {/* Re-using the same classroom view logic but ensuring only faculty actions are shown */}
           {view === "course-detail" && selectedCourse && (
               <Box>
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={() => setView('my-courses')} sx={{ color: 'white' }}>
                            Back
                        </Button>
                        <Typography variant="h4" color="white" fontWeight="bold">
                            {selectedCourse.title}
                        </Typography>
                    </Box>

                   <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 4, '& .MuiTab-root': { color: 'white' }, '& .Mui-selected': { color: '#a855f7' } }}>
                        <Tab label="Stream" />
                        <Tab label="Classwork" />
                        <Tab label="People" />
                   </Tabs>

                   {/* STREAM */}
                   {activeTab === 0 && (
                       <Grid container spacing={3}>
                           <Grid item xs={12}>
                                <Paper sx={{ p: 4, bgcolor: '#1e293b', borderRadius: 2, mb: 4, background: 'linear-gradient(to right, #a855f7, #ec4899)' }}>
                                    <Typography variant="h3" color="white" fontWeight="bold">{selectedCourse.code}</Typography>
                                    <Typography variant="h5" color="white">{selectedCourse.title}</Typography>
                                    <Typography variant="subtitle1" color="rgba(255,255,255,0.9)">{selectedCourse.semester}</Typography>
                                </Paper>
                                
                                <Paper sx={{ p: 2, bgcolor: '#1e293b', display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: '#a855f7' }}>{user.username[0]}</Avatar>
                                    <Typography color="#94a3b8">Post an announcement to your class...</Typography>
                                </Paper>

                                {resources.slice(0, 5).map(res => (
                                     <Paper key={res._id} sx={{ p: 3, mb: 2, bgcolor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar sx={{ bgcolor: '#a855f7' }}><AssignmentIcon /></Avatar>
                                            <Box>
                                                <Typography color="white" variant="subtitle1">
                                                    You posted a new material: <span style={{ fontWeight: 'bold' }}>{res.title}</span>
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(res.createdAt).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Box>
                                     </Paper>
                                ))}
                           </Grid>
                       </Grid>
                   )}

                   {/* CLASSWORK */}
                   {activeTab === 1 && (
                       <Box>
                           <Box sx={{ p: 3, bgcolor: '#1e293b', borderRadius: 2, mb: 4 }}>
                               <Typography variant="h6" color="white" gutterBottom>Add Learning Material</Typography>
                               <Grid container spacing={2} alignItems="center">
                                   <Grid item xs={12} md={5}>
                                       <TextField 
                                            fullWidth size="small" label="Title" 
                                            value={newResource.title} 
                                            onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                                            InputProps={{ style: { color: 'white' } }}
                                            InputLabelProps={{ style: { color: '#94a3b8' } }}
                                        />
                                   </Grid>
                                   <Grid item xs={12} md={4}>
                                        <TextField 
                                            fullWidth size="small" label="File URL / Link" 
                                            value={newResource.fileUrl} 
                                            onChange={(e) => setNewResource({...newResource, fileUrl: e.target.value})}
                                            InputProps={{ style: { color: 'white' } }}
                                            InputLabelProps={{ style: { color: '#94a3b8' } }}
                                        />
                                   </Grid>
                                   <Grid item xs={12} md={3}>
                                        <Button fullWidth variant="contained" startIcon={<CloudUploadIcon />} onClick={handleUploadResource} sx={{ bgcolor: '#a855f7' }}>
                                            Post
                                        </Button>
                                   </Grid>
                               </Grid>
                           </Box>

                           <List>
                               {resources.map(res => (
                                   <ListItem key={res._id} sx={{ bgcolor: '#1e293b', mb: 1, borderRadius: 1 }}>
                                       <ListItemIcon><DescriptionIcon sx={{ color: '#a855f7' }} /></ListItemIcon>
                                       <ListItemText 
                                            primary={<Typography color="white">{res.title}</Typography>}
                                            secondary={<Typography color="#94a3b8" variant="caption">{new Date(res.createdAt).toLocaleDateString()}</Typography>}
                                       />
                                       <Button size="small" href={res.fileUrl} target="_blank" sx={{ color: '#a855f7' }}>View</Button>
                                   </ListItem>
                               ))}
                           </List>
                       </Box>
                   )}

                   {/* PEOPLE */}
                   {activeTab === 2 && (
                       <Box>
                           <Typography variant="h5" color="white" gutterBottom sx={{ borderBottom: '1px solid #a855f7', pb: 1, mb: 2, display: 'inline-block' }}>
                               Instructor
                           </Typography>
                           <List>
                               <ListItem>
                                   <ListItemIcon><Avatar sx={{ bgcolor: '#a855f7' }}>{user.username[0]}</Avatar></ListItemIcon>
                                   <ListItemText primary={<Typography color="white">{user.username}</Typography>} />
                               </ListItem>
                           </List>
                           
                           <Box mt={4}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ borderBottom: '1px solid #a855f7', pb: 1, mb: 2 }}>
                                    <Typography variant="h5" color="white">Students</Typography>
                                    <Typography color="#94a3b8">{/* Count would go here */}</Typography>
                                </Box>
                                {/* We don't have enrollment data here yet for faculty view in this refactor step, but placeholder for structure */}
                                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Student management functionality coming in next update.
                                </Typography>
                           </Box>
                       </Box>
                   )}
               </Box>
           )}

        </Container>

        {/* DIALOGS */}
        <Dialog
          open={openAddCourse}
          onClose={() => setOpenAddCourse(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ style: { backgroundColor: "#1e293b", color: "white" } }}
        >
          <DialogTitle>Create New Class</DialogTitle>
          <DialogContent>
             {/* Reuse existing form fields */}
            <TextField
              fullWidth
              margin="normal"
              label="Course Code"
              value={newCourse.courseCode}
              onChange={(e) =>
                setNewCourse({ ...newCourse, courseCode: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Class Name"
              value={newCourse.title}
              onChange={(e) =>
                setNewCourse({ ...newCourse, title: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
            />
            <TextField
              fullWidth
              margin="normal"
              multiline
              rows={3}
              label="Description"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
            />
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Credits"
              value={newCourse.credits}
              onChange={(e) =>
                setNewCourse({ ...newCourse, credits: Number(e.target.value) })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Semester"
              value={newCourse.semester || ""}
              onChange={(e) =>
                setNewCourse({ ...newCourse, semester: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
              placeholder="e.g. Spring 2026"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddCourse(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourse}
              variant="contained"
              sx={{ bgcolor: "#a855f7", "&:hover": { bgcolor: "#9333ea" } }}
            >
              Create Class
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ------------------- STUDENT ACADEMIC HUB (Existing Logic) -------------------
  if (view !== "course-detail") {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* TOP APP BAR */}
        <Box
          sx={{
            bgcolor: "#1e293b",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Container maxWidth="xl">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    background: "linear-gradient(45deg, #3b82f6, #14b8a6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mr: 4,
                  }}
                >
                  Academic Hub
                </Typography>

                {/* Navigation Tabs */}
                <Box display={{ xs: "none", md: "flex" }} gap={1}>
                  <Button
                    onClick={() => setView("my-courses")}
                    sx={{
                      color: view === "my-courses" ? "#3b82f6" : "white",
                      borderBottom:
                        view === "my-courses"
                          ? "2px solid #3b82f6"
                          : "2px solid transparent",
                      borderRadius: 0,
                    }}
                  >
                    Classes
                  </Button>
                  <Button
                    onClick={() => navigate("/academics/calendar")}
                    sx={{
                      color: "white",
                      borderBottom: "2px solid transparent",
                      borderRadius: 0,
                      "&:hover": {
                        borderBottom: "2px solid #3b82f6",
                      }
                    }}
                  >
                    Calendar
                  </Button>
                  <Button
                    onClick={() => navigate("/academics/resources")}
                    sx={{
                      color: "white",
                      borderBottom: "2px solid transparent",
                      borderRadius: 0,
                      "&:hover": {
                        borderBottom: "2px solid #3b82f6",
                      }
                    }}
                  >
                    Library
                  </Button>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setView("catalog")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.3)",
                    color: "white",
                    "&:hover": { borderColor: "white" },
                  }}
                >
                  Join Class
                </Button>
                <Avatar sx={{ bgcolor: "#ec4899" }}>
                  {user.username?.charAt(0)}
                </Avatar>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* MAIN CONTENT AREA */}
        <Container maxWidth="xl" sx={{ mt: 4, pb: 8 }}>
          {/* MY CLASSES VIEW (Default) */}
          {view === "my-courses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                {myCourses.map((course) => (
                  <Grid item xs={12} md={6} lg={4} key={course._id}>
                    <CourseCard
                      course={course}
                      userRole={user.role}
                      userId={user.id}
                      onViewResources={handleEnterCourse}
                    />
                  </Grid>
                ))}
                {myCourses.length === 0 && (
                  <Grid item xs={12}>
                    <Box
                      textAlign="center"
                      py={8}
                      bgcolor="#1e293b"
                      borderRadius={2}
                    >
                      <Typography variant="h6" color="text.secondary" mb={2}>
                        You don't have any classes yet.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => setView("catalog")}
                      >
                        Browse Catalog
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          )}

          {/* CATALOG VIEW */}
          {view === "catalog" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h4" color="white" fontWeight="bold" mb={4}>
                Course Catalog
              </Typography>
              <Grid container spacing={3}>
                {courses.map((course) => {
                  const isEnrolled = enrollments.some(
                    (e) => e.course._id === course._id,
                  );
                  return (
                    <Grid item xs={12} md={6} lg={4} key={course._id}>
                      <CourseCard
                        course={course}
                        userRole={user.role}
                        userId={user.id}
                        onDelete={handleDeleteCourse}
                      >
                        <Button
                          fullWidth
                          variant={isEnrolled ? "outlined" : "contained"}
                          color={isEnrolled ? "success" : "primary"}
                          disabled={isEnrolled}
                          onClick={() =>
                            !isEnrolled && handleEnroll(course._id)
                          }
                          sx={{ mt: 2 }}
                        >
                          {isEnrolled ? "Enrolled" : "Enroll Now"}
                        </Button>
                      </CourseCard>
                    </Grid>
                  );
                })}
              </Grid>
            </motion.div>
          )}

          {/* CALENDAR VIEW */}
          {view === "calendar" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h4" color="white" fontWeight="bold" mb={4}>
                Your Calendar
              </Typography>
              <Grid container spacing={2}>
                {events.map((ev) => (
                  <Grid item xs={12} md={4} key={ev._id}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "#1e293b",
                        color: "white",
                        borderLeft: "4px solid #3b82f6",
                      }}
                    >
                      <Typography variant="h6">{ev.title}</Typography>
                      <Typography variant="body2" color="#94a3b8" gutterBottom>
                        {new Date(ev.date).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          display: "block",
                          px: 1,
                          py: 0.5,
                          bgcolor: "rgba(255,255,255,0.1)",
                          borderRadius: 1,
                          width: "fit-content",
                        }}
                      >
                        {/* Show Course Name if Linked */}
                        {ev.relatedCourse
                          ? ev.courseName || "Course Event"
                          : ev.type || "General"}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
                {events.length === 0 && (
                  <Typography color="text.secondary">
                    No upcoming events.
                  </Typography>
                )}
              </Grid>
            </motion.div>
          )}

          {/* LIBRARY VIEW */}
          {view === "library" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h4" color="white" fontWeight="bold" mb={4}>
                Library Resources
              </Typography>
              <Box mb={4}>
                <TextField
                  fullWidth
                  placeholder="Search resources..."
                  InputProps={{ style: { color: "white" } }}
                />
              </Box>
              <Grid container spacing={2}>
                {resources.map((res) => (
                  <Grid item xs={12} key={res._id}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "#1e293b",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box display="flex" gap={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "#3b82f6" }}>
                          <DescriptionIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" color="white">
                            {res.title}
                          </Typography>
                          <Typography variant="caption" color="#94a3b8">
                            {res.course?.title || "General"} • {res.type}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        href={res.fileUrl}
                        target="_blank"
                      >
                        View
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </Container>

        {/* CREATE COURSE DIALOG - Re-used */}
        <Dialog
          open={openAddCourse}
          onClose={() => setOpenAddCourse(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ style: { backgroundColor: "#1e293b", color: "white" } }}
        >
          <DialogTitle>Create New Course</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Course Code"
              value={newCourse.courseCode}
              onChange={(e) =>
                setNewCourse({ ...newCourse, courseCode: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Subject / Tile"
              value={newCourse.title}
              onChange={(e) =>
                setNewCourse({ ...newCourse, title: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
            />
            <TextField
              fullWidth
              margin="normal"
              multiline
              rows={3}
              label="Description / Room"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
            />
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Credits"
              value={newCourse.credits}
              onChange={(e) =>
                setNewCourse({ ...newCourse, credits: Number(e.target.value) })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Semester"
              value={newCourse.semester || ""}
              onChange={(e) =>
                setNewCourse({ ...newCourse, semester: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
              placeholder="e.g. Fall 2024"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddCourse(false)} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourse}
              variant="contained"
              color="secondary"
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ------------------- COURSE VIEW (Classroom Style) -------------------
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header / Banner */}
      <Box
        sx={{
          bgcolor: "#1e293b",
          color: "white",
          p: 2,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => setView("my-courses")}
              sx={{ color: "white" }}
            >
              Back to My Classes
            </Button>
            <Typography variant="h6">{selectedCourse.title}</Typography>
          </Box>

          <Box
            sx={{
              p: 4,
              bgcolor: "#3b82f6",
              borderRadius: 2,
              mb: 0,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box position="relative" zIndex={1}>
              <Typography variant="h3" fontWeight="bold">
                {selectedCourse.title}
              </Typography>
              <Typography variant="h5" sx={{ opacity: 0.9 }}>
                {selectedCourse.courseCode}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedCourse.description}
              </Typography>
            </Box>
            {/* Abstract Shape Overlay */}
            <Box
              sx={{
                position: "absolute",
                right: -50,
                bottom: -50,
                width: 300,
                height: 300,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.1)",
              }}
            />
          </Box>

          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            sx={{
              mt: 2,
              "& .MuiTab-root": { color: "white" },
              "& .Mui-selected": { color: "#3b82f6" },
            }}
          >
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
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "#1e293b",
                  color: "white",
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  Upcoming
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  No work due soon
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={9}>
              <Paper
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: "#1e293b",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  cursor: "pointer",
                }}
              >
                <Avatar sx={{ bgcolor: "#ec4899" }}>
                  {user.user?.username?.charAt(0) || "U"}
                </Avatar>
                <Typography color="text.secondary">
                  Announce something to your class...
                </Typography>
              </Paper>

              {resources.slice(0, 3).map((res) => (
                <Paper
                  key={res._id}
                  sx={{ p: 3, mb: 2, bgcolor: "#1e293b", color: "white" }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Avatar sx={{ bgcolor: "#3b82f6" }}>
                      <AssignmentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">
                        {selectedCourse.faculty.username || "Faculty"} posted a
                        new material: {res.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </Typography>
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
            {(user.role === "admin" ||
              user.role === "faculty" ||
              (user.role === "authority" &&
                selectedCourse.faculty._id === user.id)) && (
              <Box sx={{ mb: 4, p: 3, bgcolor: "#1e293b", borderRadius: 2 }}>
                <Typography variant="h6" color="white" gutterBottom>
                  Add Material
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Title"
                      value={newResource.title}
                      onChange={(e) =>
                        setNewResource({
                          ...newResource,
                          title: e.target.value,
                        })
                      }
                      InputProps={{ style: { color: "white" } }}
                      InputLabelProps={{ style: { color: "#94a3b8" } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Link (URL)"
                      value={newResource.fileUrl}
                      onChange={(e) =>
                        setNewResource({
                          ...newResource,
                          fileUrl: e.target.value,
                        })
                      }
                      InputProps={{ style: { color: "white" } }}
                      InputLabelProps={{ style: { color: "#94a3b8" } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      onClick={handleUploadResource}
                    >
                      Post
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box>
              {resources.map((res) => (
                <Paper
                  key={res._id}
                  component={motion.div}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  sx={{ p: 0, mb: 2, bgcolor: "#1e293b", overflow: "hidden" }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#6366f1" }}>
                      <DescriptionIcon />
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography
                        variant="subtitle1"
                        color="white"
                        fontWeight="bold"
                      >
                        {res.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Posted {new Date(res.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      href={res.fileUrl}
                      target="_blank"
                    >
                      View
                    </Button>
                  </Box>
                </Paper>
              ))}
              {resources.length === 0 && (
                <Typography align="center" color="text.secondary">
                  No classwork yet.
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* TAB 2: PEOPLE */}
        {activeTab === 2 && (
          <Box maxWidth="md">
            <Typography
              variant="h4"
              color="primary"
              sx={{ borderBottom: "1px solid #3b82f6", pb: 2, mb: 3 }}
            >
              Teachers
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={4}>
              <Avatar sx={{ width: 32, height: 32 }} />
              <Typography variant="body1" color="white">
                {selectedCourse.faculty.username}
              </Typography>
            </Box>

            <Typography
              variant="h4"
              color="primary"
              sx={{ borderBottom: "1px solid #3b82f6", pb: 2, mb: 3, mt: 4 }}
            >
              Students
            </Typography>
            <Typography color="text.secondary" fontStyle="italic">
              Students list will appear here.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AcademicPortal;
