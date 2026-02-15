import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../services/api";
import toast from "react-hot-toast";

const Opportunities = () => {
  const { user } = useSelector((state) => state.auth);
  const [opportunities, setOpportunities] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: "",
    stipend: "",
    duration: "",
    deadline: "",
    type: "Internship",
  });
  const [filters, setFilters] = useState({ type: "", skills: "" });
  const [loading, setLoading] = useState(true);

  // Faculty Application Management
  const [viewAppsDialog, setViewAppsDialog] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [currentApps, setCurrentApps] = useState([]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/opportunities?type=${filters.type}&skills=${filters.skills}`,
      );
      console.log("Opportunities fetched:", res.data);
      setOpportunities(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Failed to load opportunities");
    }
  };

  const fetchMyApplications = async () => {
    try {
      const res = await api.get("/opportunities/applications/me");
      setMyApplications(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOpportunities();
    if (user.role === "student") fetchMyApplications();
  }, [filters]);

  const handleCreate = async () => {
    try {
      await api.post("/opportunities", {
        ...formData,
        requiredSkills: formData.requiredSkills.split(",").map((s) => s.trim()),
      });
      toast.success("Opportunity Posted!");
      setOpenDialog(false);
      fetchOpportunities();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to post");
    }
  };

  const handleApply = async (id) => {
    try {
      await api.post(`/opportunities/${id}/apply`, {
        resumeURL: "https://example.com/resume.pdf",
      });
      toast.success("Applied successfully!");
      fetchMyApplications();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to apply");
    }
  };

  const handleViewApps = async (oppId, title) => {
    try {
      setSelectedTitle(title);
      const res = await api.get(`/opportunities/${oppId}/applications`);
      setCurrentApps(res.data.data);
      setViewAppsDialog(true);
    } catch (err) {
      toast.error("Failed to load applications");
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/opportunities/applications/${appId}/status`, {
        status: newStatus,
      });
      toast.success("Status updated");
      setCurrentApps(
        currentApps.map((app) =>
          app._id === appId ? { ...app, status: newStatus } : app,
        ),
      );
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "success";
      case "Rejected":
        return "error";
      case "Shortlisted":
        return "warning";
      default:
        return "info";
    }
  };

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            background: "linear-gradient(to right, #3b82f6, #14b8a6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Career Opportunities
        </Typography>
        {(user.role === "faculty" ||
          user.role === "admin" ||
          user.role === "authority") && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenDialog(true)}
          >
            Post Opportunity
          </Button>
        )}
      </Box>

      {user.role === "student" && (
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ mb: 3 }}
          indicatorColor="secondary"
          textColor="secondary"
        >
          <Tab label="Browse Opportunities" />
          <Tab label="My Applications" />
        </Tabs>
      )}

      {tabValue === 0 && (
        <>
          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel sx={{ color: "text.secondary" }}>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                sx={{
                  color: "white",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
                <MenuItem value="Research">Research</MenuItem>
                <MenuItem value="Job">Job</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Filter by Skills"
              variant="outlined"
              size="small"
              value={filters.skills}
              onChange={(e) =>
                setFilters({ ...filters, skills: e.target.value })
              }
              InputProps={{ style: { color: "white" } }}
              InputLabelProps={{ style: { color: "#94a3b8" } }}
              sx={{
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
              }}
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={5}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {opportunities.map((opp) => (
                <Grid item xs={12} md={6} lg={4} key={opp._id}>
                  <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{
                      bgcolor: "background.paper",
                      border: "1px solid rgba(255,255,255,0.1)",
                      height: "100%",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {opp.title}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <Chip label={opp.type} size="small" color="info" />
                        <Chip
                          label={opp.stipend}
                          size="small"
                          variant="outlined"
                          sx={{
                            color: "text.secondary",
                            borderColor: "text.secondary",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                        sx={{
                          height: 60,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {opp.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {opp.requiredSkills.map((skill, i) => (
                          <Chip
                            key={i}
                            label={skill}
                            size="small"
                            sx={{
                              mr: 0.5,
                              mb: 0.5,
                              bgcolor: "rgba(255,255,255,0.05)",
                            }}
                          />
                        ))}
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Deadline:{" "}
                          {new Date(opp.deadline).toLocaleDateString()}
                        </Typography>

                        {user.role === "student" && (
                          <Box>
                            <Button
                              size="small"
                              variant={
                                JSON.parse(
                                  localStorage.getItem("bookmarks") || "[]",
                                ).includes(opp._id)
                                  ? "contained"
                                  : "outlined"
                              }
                              color="warning"
                              sx={{ mr: 1 }}
                              onClick={() => {
                                const current = JSON.parse(
                                  localStorage.getItem("bookmarks") || "[]",
                                );
                                const updated = current.includes(opp._id)
                                  ? current.filter((id) => id !== opp._id)
                                  : [...current, opp._id];
                                localStorage.setItem(
                                  "bookmarks",
                                  JSON.stringify(updated),
                                );
                                setFilters({ ...filters }); // Force re-render
                                toast.success(
                                  updated.includes(opp._id)
                                    ? "Bookmarked!"
                                    : "Removed bookmark",
                                );
                              }}
                            >
                              {JSON.parse(
                                localStorage.getItem("bookmarks") || "[]",
                              ).includes(opp._id)
                                ? "Saved"
                                : "Save"}
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleApply(opp._id)}
                            >
                              Apply
                            </Button>
                          </Box>
                        )}

                        {user.role === "faculty" &&
                          opp.postedBy._id === user.id && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={() => handleViewApps(opp._id, opp.title)}
                            >
                              Manage Apps
                            </Button>
                          )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {myApplications.map((app) => (
            <Grid item xs={12} md={6} key={app._id}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <CardContent>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6" color="primary">
                      {app.opportunity
                        ? app.opportunity.title
                        : "Deleted Opportunity"}
                    </Typography>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {myApplications.length === 0 && (
            <Typography color="text.secondary">No applications yet.</Typography>
          )}
        </Grid>
      )}

      {/* Create Opportunity Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{ style: { backgroundColor: "#1e293b", color: "white" } }}
      >
        <DialogTitle>Post New Opportunity</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            margin="normal"
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#94a3b8" } }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#94a3b8" } }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Required Skills (comma separated)"
            value={formData.requiredSkills}
            onChange={(e) =>
              setFormData({ ...formData, requiredSkills: e.target.value })
            }
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#94a3b8" } }}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Stipend"
                value={formData.stipend}
                onChange={(e) =>
                  setFormData({ ...formData, stipend: e.target.value })
                }
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#94a3b8" } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Duration"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                InputProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "#94a3b8" } }}
              />
            </Grid>
          </Grid>
          <TextField
            fullWidth
            margin="normal"
            type="date"
            label="Deadline"
            InputLabelProps={{ shrink: true, style: { color: "#94a3b8" } }}
            value={formData.deadline}
            onChange={(e) =>
              setFormData({ ...formData, deadline: e.target.value })
            }
            InputProps={{ style: { color: "white" } }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel style={{ color: "#94a3b8" }}>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              sx={{
                color: "white",
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.2)",
                },
              }}
            >
              <MenuItem value="Internship">Internship</MenuItem>
              <MenuItem value="Research">Research</MenuItem>
              <MenuItem value="Job">Job</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleCreate} color="secondary" variant="contained">
            Post
          </Button>
        </DialogActions>
      </Dialog>

      {/* Application Review Dialog */}
      <Dialog
        open={viewAppsDialog}
        onClose={() => setViewAppsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { backgroundColor: "#1e293b", color: "white" } }}
      >
        <DialogTitle>Applications for {selectedTitle}</DialogTitle>
        <DialogContent>
          <TableContainer
            component={Paper}
            sx={{ bgcolor: "transparent", boxShadow: "none" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#94a3b8" }}>Student</TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>Department</TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>Resume</TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>Status</TableCell>
                  <TableCell sx={{ color: "#94a3b8" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentApps.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell sx={{ color: "white" }}>
                      {app.student.username}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      {app.student.department}
                    </TableCell>
                    <TableCell sx={{ color: "white" }}>
                      <a
                        href={app.resumeURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#3b82f6",
                          textDecoration: "underline",
                        }}
                      >
                        View
                      </a>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.status}
                        color={getStatusColor(app.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={app.status}
                        size="small"
                        onChange={(e) =>
                          handleUpdateStatus(app._id, e.target.value)
                        }
                        sx={{
                          color: "white",
                          minWidth: 120,
                          ".MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255,255,255,0.2)",
                          },
                        }}
                      >
                        <MenuItem value="Applied">Applied</MenuItem>
                        <MenuItem value="Shortlisted">Shortlist</MenuItem>
                        <MenuItem value="Rejected">Reject</MenuItem>
                        <MenuItem value="Accepted">Accept</MenuItem>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {currentApps.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ color: "text.secondary" }}
                    >
                      No applications yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewAppsDialog(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Opportunities;
