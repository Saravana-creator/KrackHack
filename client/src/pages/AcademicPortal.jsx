import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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

  // Main State
  const [courses, setCourses] = useState([]); // Catalog
  const [myCourses, setMyCourses] = useState([]); // Enrolled
  const [enrollments, setEnrollments] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ credits: 0, attendance: 0 });

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard"); // 'dashboard', 'catalog', 'course-detail'
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
    setLoading(true);
    try {
      const [coursesRes, myCoursesRes, attendanceRes, eventsRes, resourcesRes] =
        await Promise.all([
          api.get("/courses"),
          api.get("/academics/my-courses"),
          api.get("/academics/attendance"),
          api.get("/academics/events"),
          api.get("/resources"),
        ]);

      setCourses(coursesRes.data.data);
      setEnrollments(myCoursesRes.data.data);

      // Extract courses from enrollments for easier usage
      const myCourseList = myCoursesRes.data.data.map((e) => e.course);
      setMyCourses(myCourseList);

      setAttendance(attendanceRes.data.data);
      setEvents(eventsRes.data.data);
      setResources(resourcesRes.data.data);

      // Calculate Stats
      const totalCredits = myCourseList.reduce(
        (acc, curr) => acc + (curr.credits || 0),
        0,
      );
      const totalAttendance = attendanceRes.data.data.length;
      // Simple attendance % calculation logic could go here if we knew total days

      setStats({ credits: totalCredits, attendance: totalAttendance });

      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load academic data");
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

  // ------------------- DASHBOARD & SUB-VIEWS -------------------
  if (view !== "course-detail") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
        }}
      >
        {/* SIDEBAR NAVIGATION (Simple column for now) */}
        <Paper
          sx={{
            width: 280,
            bgcolor: "#1e293b",
            color: "white",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            p: 2,
            borderRight: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: 4,
              px: 2,
              background: "linear-gradient(45deg, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Academic Hub
          </Typography>

          <List component="nav">
            <ListItem
              button
              selected={view === "dashboard"}
              onClick={() => setView("dashboard")}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)" },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem
              button
              selected={view === "my-courses"}
              onClick={() => setView("my-courses")}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)" },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary="My Classes" />
            </ListItem>
            <ListItem
              button
              selected={view === "catalog"}
              onClick={() => setView("catalog")}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)" },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Course Catalog" />
            </ListItem>
            <ListItem
              button
              selected={view === "attendance"}
              onClick={() => setView("attendance")}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)" },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <CheckCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Attendance" />
            </ListItem>
            <ListItem
              button
              selected={view === "calendar"}
              onClick={() => setView("calendar")}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)" },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Calendar" />
            </ListItem>
            <ListItem
              button
              selected={view === "library"}
              onClick={() => setView("library")}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": { bgcolor: "rgba(59, 130, 246, 0.2)" },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText primary="Library" />
            </ListItem>
          </List>
        </Paper>

        {/* MAIN CONTENT AREA */}
        <Box sx={{ flexGrow: 1, p: 4, overflowY: "auto", height: "100vh" }}>
          {/* DASHBOARD VIEW */}
          {view === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Typography
                variant="h4"
                color="text.primary"
                fontWeight="bold"
                gutterBottom
              >
                Welcome back, {user?.username}
              </Typography>

              {/* STATS CARDS */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "#1e293b",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#a855f7", width: 56, height: 56 }}>
                      <TrendingUpIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.credits}
                      </Typography>
                      <Typography variant="body2" color="#94a3b8">
                        Total Credits
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "#1e293b",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#3b82f6", width: 56, height: 56 }}>
                      <CheckCircleIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.attendance} Days
                      </Typography>
                      <Typography variant="body2" color="#94a3b8">
                        Attendance Logged
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "#1e293b",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#ec4899", width: 56, height: 56 }}>
                      <FolderIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {enrollments.length}
                      </Typography>
                      <Typography variant="body2" color="#94a3b8">
                        Active Courses
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={4}>
                {/* QUICK ATTENDANCE */}
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "#1e293b",
                      color: "white",
                    }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Mark Attendance Today
                    </Typography>
                    <Box display="flex" gap={2} mt={2}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={attendanceStatus}
                        onChange={(e) => setAttendanceStatus(e.target.value)}
                        SelectProps={{ native: true }}
                        InputProps={{ style: { color: "white" } }}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                        }}
                      >
                        <option value="Present" style={{ color: "black" }}>
                          Present
                        </option>
                        <option value="Absent" style={{ color: "black" }}>
                          Absent
                        </option>
                      </TextField>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleLogAttendance}
                      >
                        Log
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* UPCOMING EVENTS */}
                <Grid item xs={12} md={6}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: "#1e293b",
                      color: "white",
                      minHeight: 150,
                    }}
                  >
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Upcoming Events
                    </Typography>
                    {events.slice(0, 3).map((ev, i) => (
                      <Box
                        key={i}
                        display="flex"
                        justifyContent="space-between"
                        mb={1}
                        p={1}
                        bgcolor="rgba(255,255,255,0.05)"
                        borderRadius={1}
                      >
                        <Typography variant="body2">{ev.title}</Typography>
                        <Typography variant="caption" color="#94a3b8">
                          {new Date(ev.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))}
                    {events.length === 0 && (
                      <Typography variant="body2" color="#94a3b8">
                        No upcoming events.
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* CATALOG VIEW */}
          {view === "catalog" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
              >
                <Typography variant="h4" color="text.primary" fontWeight="bold">
                  Course Catalog
                </Typography>
                {(user.role === "admin" || user.role === "faculty") && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAddCourse(true)}
                  >
                    Add Course
                  </Button>
                )}
              </Box>
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

          {/* MY COURSES VIEW */}
          {view === "my-courses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography
                variant="h4"
                color="text.primary"
                fontWeight="bold"
                mb={4}
              >
                My Enrolled Classes
              </Typography>
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
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: "center",
                        bgcolor: "#1e293b",
                        color: "text.secondary",
                      }}
                    >
                      <Typography>
                        You are not enrolled in any courses.
                      </Typography>
                      <Button sx={{ mt: 2 }} onClick={() => setView("catalog")}>
                        Browse Catalog
                      </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          )}

          {/* ATTENDANCE VIEW */}
          {view === "attendance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography
                variant="h4"
                color="text.primary"
                fontWeight="bold"
                mb={4}
              >
                Attendance History
              </Typography>
              <Paper
                sx={{ bgcolor: "#1e293b", borderRadius: 2, overflow: "hidden" }}
              >
                <List>
                  {attendance.map((att, i) => (
                    <React.Fragment key={att._id}>
                      <ListItem>
                        <ListItemIcon>
                          {att.status === "Present" ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <TrendingUpIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography color="white">
                              {new Date(att.date).toLocaleDateString()}
                            </Typography>
                          }
                          secondary={
                            <Typography color="#94a3b8">
                              {att.status}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {i < attendance.length - 1 && (
                        <Divider
                          sx={{ borderColor: "rgba(255,255,255,0.1)" }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                  {attendance.length === 0 && (
                    <Box p={4} textAlign="center">
                      <Typography color="text.secondary">
                        No records found.
                      </Typography>
                    </Box>
                  )}
                </List>
              </Paper>
            </motion.div>
          )}

          {/* CALENDAR VIEW */}
          {view === "calendar" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography
                variant="h4"
                color="text.primary"
                fontWeight="bold"
                mb={4}
              >
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
                        borderLeft: "4px solid #3b82f6",
                      }}
                    >
                      <Typography variant="h6">{ev.title}</Typography>
                      <Typography variant="body2" color="#94a3b8" gutterBottom>
                        {new Date(ev.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2">{ev.description}</Typography>
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
                        {ev.type}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {/* LIBRARY VIEW */}
          {view === "library" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography
                variant="h4"
                color="text.primary"
                fontWeight="bold"
                mb={4}
              >
                Resource Library
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
                {resources.length === 0 && (
                  <Typography color="text.secondary">
                    No resources found.
                  </Typography>
                )}
              </Grid>
            </motion.div>
          )}
        </Box>

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
