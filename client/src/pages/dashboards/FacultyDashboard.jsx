import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../services/api";

const FacultyDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);

  // Data States
  const [opportunities, setOpportunities] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null); // For Managing Resources
  const [courseResources, setCourseResources] = useState([]); // Resources for selected course
  // Modals
  const [openOppModal, setOpenOppModal] = useState(false);
  const [openEventModal, setOpenEventModal] = useState(false);
  const [openResourceModal, setOpenResourceModal] = useState(false);
  const [openAppsModal, setOpenAppsModal] = useState(false);
  const [resourceTargetCourse, setResourceTargetCourse] = useState(""); // For dialog selection

  // Selected Items for View/Edit
  const [selectedOpp, setSelectedOpp] = useState(null); // For viewing applications
  const [applications, setApplications] = useState([]); // Apps for selected opp
  const [resourceFile, setResourceFile] = useState(null);

  // Form States
  const [oppFormData, setOppFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    duration: "",
    stipend: "Unpaid",
    deadline: "",
    type: "Internship",
  });
  const [eventFormData, setEventFormData] = useState({
    title: "",
    description: "",
    date: "",
    type: "Other",
    relatedCourse: "",
  });
  const [resourceFormData, setResourceFormData] = useState({
    title: "",
    description: "",
    fileUrl: "",
    type: "pdf",
    year: new Date().getFullYear().toString(),
  });

  // Fetch Initial Data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Faculty Academics (Courses + Events)
      const academicRes = await api.get("/academics/faculty");
      setMyCourses(academicRes.data.courses);
      setEvents(academicRes.data.events);

      // Fetch My Opportunities
      const oppRes = await api.get("/opportunities/mine");
      setOpportunities(oppRes.data.data);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  };

  // --- HANDLERS ---

  // Opportunity Handlers
  const handleCreateOpportunity = async () => {
    try {
      const skillsArray = oppFormData.requiredSkills
        .split(",")
        .map((s) => s.trim());
      await api.post("/opportunities", {
        ...oppFormData,
        requiredSkills: skillsArray,
      });
      setOpenOppModal(false);
      setOppFormData({
        title: "",
        description: "",
        requiredSkills: "",
        duration: "",
        stipend: "Unpaid",
        deadline: "",
        type: "Internship",
      });
      fetchDashboardData(); // Refresh
    } catch (error) {
      console.error("Create Opportunity Error", error);
      alert("Failed to create opportunity");
    }
  };

  const handleViewApplications = async (opp) => {
    setSelectedOpp(opp);
    try {
      const res = await api.get(`/opportunities/${opp._id}/applications`);
      setApplications(res.data.data);
      setOpenAppsModal(true);
    } catch (error) {
      console.error("Fetch Apps Error", error);
    }
  };

  const handleUpdateAppStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}`, { status });
      // Refresh list
      const res = await api.get(
        `/opportunities/${selectedOpp._id}/applications`,
      );
      setApplications(res.data.data);
    } catch (error) {
      console.error("Update Status Error", error);
    }
  };

  const handleDeleteOpportunity = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/opportunities/${id}`);
      fetchDashboardData();
    } catch (error) {
      console.error("Delete Error", error);
    }
  };

  // Event Handlers
  const handleCreateEvent = async () => {
    try {
      await api.post("/academics/events", {
        ...eventFormData,
        course: eventFormData.relatedCourse || null, // send null if empty string
      });
      setOpenEventModal(false);
      setEventFormData({
        title: "",
        description: "",
        date: "",
        type: "Other",
        relatedCourse: "",
      });
      fetchDashboardData();
    } catch (error) {
      console.error("Create Event Error", error);
      alert("Failed to create event");
    }
  };

  // Resource Handlers
  const handleManageResources = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await api.get(`/courses/${course._id}/resources`);
      setCourseResources(res.data.data);
      // Only switch tab or open dialog? Let's use a dialog or nested view
      // For simplicty, let's open a Resource Management Dialog
      // or we can select the course and show resources in the same tab.
      // Let's use the UI state `selectedCourse` to render details in the current tab
    } catch (error) {
      console.error("Fetch Resources Error", error);
    }
  };

  const handleUploadResource = async () => {
    // Priority: selectedCourse in UI, or selected dropdown value
    const targetId =
      resourceTargetCourse || (selectedCourse ? selectedCourse._id : null);

    if (!targetId) {
      alert("Please select a course to upload to.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", resourceFormData.title);
      formData.append("type", resourceFormData.type);
      if (resourceFormData.fileUrl)
        formData.append("fileUrl", resourceFormData.fileUrl);
      if (resourceFile) formData.append("file", resourceFile);

      await api.post(`/courses/${targetId}/resources`, formData);

      setOpenResourceModal(false);
      setResourceFormData({
        title: "",
        description: "",
        fileUrl: "",
        type: "pdf",
        year: new Date().getFullYear().toString(),
      });
      setResourceFile(null);
      setResourceTargetCourse("");

      // Refresh resources if we uploaded to the currently viewed course
      if (selectedCourse && selectedCourse._id === targetId) {
        const res = await api.get(`/courses/${targetId}/resources`);
        setCourseResources(res.data.data);
      }
    } catch (error) {
      console.error("Upload Resource Error", error);
      alert("Failed to upload resource");
    }
  };

  // --- RENDER HELPERS ---

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 5 }}>
      {/* HEADER */}
      <Box
        sx={{
          bgcolor: "#1e293b",
          py: 4,
          px: 3,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="white">
          Faculty Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome, {user?.username} | {user?.department} Department
        </Typography>
      </Box>

      <Box sx={{ px: 3, mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 4, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="My Opportunities" />
          <Tab label="Academic Materials" />
          <Tab label="Academic Calendar" />
        </Tabs>

        {/* TAB 1: OPPORTUNITIES */}
        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h5" color="text.primary">
                Managed Opportunities
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenOppModal(true)}
              >
                Create Opportunity
              </Button>
            </Box>
            <Grid container spacing={3}>
              {opportunities.map((opp) => (
                <Grid item xs={12} md={6} lg={4} key={opp._id}>
                  <Card
                    sx={{
                      bgcolor: "background.paper",
                      height: "100%",
                      position: "relative",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {opp.title}
                      </Typography>
                      <Chip
                        label={opp.type}
                        size="small"
                        color="primary"
                        sx={{ mb: 1, mr: 1 }}
                      />
                      <Chip
                        label={new Date(opp.deadline).toLocaleDateString()}
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ mb: 2 }}
                      >
                        {opp.description}
                      </Typography>
                      <Box display="flex" gap={1} mt={2}>
                        <Button
                          variant="outlined"
                          size="small"
                          fullWidth
                          onClick={() => handleViewApplications(opp)}
                        >
                          Applications
                        </Button>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteOpportunity(opp._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {opportunities.length === 0 && (
                <Grid item xs={12}>
                  <Typography color="text.secondary">
                    No opportunities posted.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </motion.div>
        )}

        {/* TAB 2: ACADEMIC MATERIALS */}
        {activeTab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h5" color="text.primary">
                Academic Materials
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setResourceTargetCourse(
                    selectedCourse ? selectedCourse._id : "",
                  );
                  setOpenResourceModal(true);
                }}
              >
                Upload Material
              </Button>
            </Box>
            <Grid container spacing={3}>
              {/* LEFT: COURSES LIST */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" mb={2} color="text.primary">
                  Your Courses
                </Typography>
                {myCourses.length === 0 ? (
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      No courses found.
                    </Typography>
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => navigate("/academics")}
                    >
                      Create Course
                    </Button>
                  </Box>
                ) : (
                  <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
                    {myCourses.map((course) => (
                      <ListItem
                        button
                        key={course._id}
                        selected={selectedCourse?._id === course._id}
                        onClick={() => handleManageResources(course)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "#3b82f6" }}>
                            <SchoolIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={course.title}
                          secondary={course.courseCode}
                          primaryTypographyProps={{ color: "text.primary" }}
                          secondaryTypographyProps={{ color: "text.secondary" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>

              {/* RIGHT: RESOURCES */}
              <Grid item xs={12} md={8}>
                {selectedCourse ? (
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" color="text.primary">
                        {selectedCourse.title} - Resources
                      </Typography>
                    </Box>
                    {courseResources.length > 0 ? (
                      <List
                        sx={{ bgcolor: "background.paper", borderRadius: 1 }}
                      >
                        {courseResources.map((res) => (
                          <ListItem
                            key={res._id}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="open"
                                href={res.fileUrl}
                                target="_blank"
                              >
                                <DescriptionIcon color="primary" />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={res.title}
                              secondary={res.type.toUpperCase()}
                              primaryTypographyProps={{ color: "text.primary" }}
                              secondaryTypographyProps={{
                                color: "text.secondary",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography color="text.secondary">
                        No resources uploaded for this course.
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box
                    height="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                  >
                    <Typography color="text.secondary" mb={2}>
                      Select a course to manage materials.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setResourceTargetCourse("");
                        setOpenResourceModal(true);
                      }}
                    >
                      Upload New Material
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* TAB 3: ACADEMIC CALENDAR */}
        {activeTab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h5" color="text.primary">
                Academic Events
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenEventModal(true)}
              >
                Create Event
              </Button>
            </Box>
            <Grid container spacing={2}>
              {events.map((ev) => (
                <Grid item xs={12} md={4} key={ev._id}>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "#1e293b",
                      borderLeft: "4px solid #14b8a6",
                    }}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="h6" color="white">
                        {ev.title}
                      </Typography>
                      <Chip
                        label={ev.type}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.1)",
                          color: "white",
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="#94a3b8" gutterBottom>
                      {new Date(ev.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="white" mt={1}>
                      {ev.description}
                    </Typography>
                    {ev.course && (
                      <Typography
                        variant="caption"
                        color="primary"
                        mt={1}
                        display="block"
                      >
                        {ev.course.title}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </Box>

      {/* MODAL: CREATE OPPORTUNITY */}
      <Dialog
        open={openOppModal}
        onClose={() => setOpenOppModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Opportunity</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Title"
            value={oppFormData.title}
            onChange={(e) =>
              setOppFormData({ ...oppFormData, title: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            multiline
            rows={3}
            value={oppFormData.description}
            onChange={(e) =>
              setOppFormData({ ...oppFormData, description: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Required Skills (comma separated)"
            value={oppFormData.requiredSkills}
            onChange={(e) =>
              setOppFormData({ ...oppFormData, requiredSkills: e.target.value })
            }
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Duration"
                value={oppFormData.duration}
                onChange={(e) =>
                  setOppFormData({ ...oppFormData, duration: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                select
                label="Type"
                value={oppFormData.type}
                onChange={(e) =>
                  setOppFormData({ ...oppFormData, type: e.target.value })
                }
              >
                <MenuItem value="Internship">Internship</MenuItem>
                <MenuItem value="Research">Research</MenuItem>
                <MenuItem value="Job">Job</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Stipend"
                value={oppFormData.stipend}
                onChange={(e) =>
                  setOppFormData({ ...oppFormData, stipend: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                type="date"
                label="Deadline"
                InputLabelProps={{ shrink: true }}
                value={oppFormData.deadline}
                onChange={(e) =>
                  setOppFormData({ ...oppFormData, deadline: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOppModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateOpportunity}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: CREATE EVENT */}
      <Dialog
        open={openEventModal}
        onClose={() => setOpenEventModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Academic Event</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Event Title"
            value={eventFormData.title}
            onChange={(e) =>
              setEventFormData({ ...eventFormData, title: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            multiline
            rows={2}
            value={eventFormData.description}
            onChange={(e) =>
              setEventFormData({
                ...eventFormData,
                description: e.target.value,
              })
            }
          />
          <TextField
            fullWidth
            margin="normal"
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={eventFormData.date}
            onChange={(e) =>
              setEventFormData({ ...eventFormData, date: e.target.value })
            }
          />
          <TextField
            fullWidth
            margin="normal"
            select
            label="Type"
            value={eventFormData.type}
            onChange={(e) =>
              setEventFormData({ ...eventFormData, type: e.target.value })
            }
          >
            <MenuItem value="Exam">Exam</MenuItem>
            <MenuItem value="Deadline">Deadline</MenuItem>
            <MenuItem value="Lecture">Lecture</MenuItem>
            <MenuItem value="Holiday">Holiday</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
          <TextField
            fullWidth
            margin="normal"
            select
            label="Related Course (Optional)"
            value={eventFormData.relatedCourse}
            onChange={(e) =>
              setEventFormData({
                ...eventFormData,
                relatedCourse: e.target.value,
              })
            }
          >
            <MenuItem value="">None (Global)</MenuItem>
            {myCourses.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.title}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateEvent}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: UPLOAD RESOURCE */}
      <Dialog
        open={openResourceModal}
        onClose={() => setOpenResourceModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload Material</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            select
            label="Select Course"
            value={resourceTargetCourse}
            onChange={(e) => setResourceTargetCourse(e.target.value)}
            disabled={
              !!selectedCourse && resourceTargetCourse === selectedCourse._id
            }
          >
            {myCourses.length > 0 ? (
              myCourses.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.title} ({c.courseCode})
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No courses available
              </MenuItem>
            )}
          </TextField>

          <TextField
            fullWidth
            margin="normal"
            label="Title"
            value={resourceFormData.title}
            onChange={(e) =>
              setResourceFormData({
                ...resourceFormData,
                title: e.target.value,
              })
            }
          />

          <Box
            sx={{
              mt: 2,
              mb: 1,
              p: 1,
              border: "1px dashed grey",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload File (PDF, Video, etc.)
            </Typography>
            <input
              type="file"
              onChange={(e) => setResourceFile(e.target.files[0])}
              style={{ display: "block", width: "100%" }}
            />
          </Box>

          <Typography
            variant="caption"
            display="block"
            align="center"
            sx={{ my: 1 }}
          >
            OR
          </Typography>

          <TextField
            fullWidth
            margin="normal"
            label="External Link (if not uploading file)"
            value={resourceFormData.fileUrl}
            onChange={(e) =>
              setResourceFormData({
                ...resourceFormData,
                fileUrl: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="normal"
            select
            label="Type"
            value={resourceFormData.type}
            onChange={(e) =>
              setResourceFormData({ ...resourceFormData, type: e.target.value })
            }
          >
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="video">Video</MenuItem>
            <MenuItem value="link">Link</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResourceModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUploadResource}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: VIEW APPLICATIONS */}
      <Dialog
        open={openAppsModal}
        onClose={() => setOpenAppsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Applications for {selectedOpp?.title}</DialogTitle>
        <DialogContent>
          {applications.length > 0 ? (
            <List>
              {applications.map((app) => (
                <ListItem key={app._id} divider sx={{ flexWrap: "wrap" }}>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={app.student?.username}
                    secondary={`${app.student?.email} • ${app.student?.department}`}
                  />
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={app.status}
                      color={
                        app.status === "Accepted"
                          ? "success"
                          : app.status === "Rejected"
                            ? "error"
                            : "default"
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      href={app.resumeURL}
                      target="_blank"
                    >
                      Resume
                    </Button>

                    {app.status === "Applied" && (
                      <>
                        <IconButton
                          color="success"
                          onClick={() =>
                            handleUpdateAppStatus(app._id, "Accepted")
                          }
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleUpdateAppStatus(app._id, "Rejected")
                          }
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography p={2} color="text.secondary">
              No applications received yet.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAppsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacultyDashboard;
