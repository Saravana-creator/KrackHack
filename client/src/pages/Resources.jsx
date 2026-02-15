import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import api from "../services/api";
import { toast } from "react-hot-toast";

const Resources = () => {
  const { user } = useSelector((state) => state.auth);
  const [resources, setResources] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Upload form state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [uploading, setUploading] = useState(false);

  const isFaculty = user.role === "faculty" || user.role === "admin";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resourcesRes, coursesRes] = await Promise.all([
        api.get("/resources"),
        api.get("/courses"),
      ]);

      setResources(resourcesRes.data.data || []);
      setAllResources(resourcesRes.data.data || []);
      setCourses(coursesRes.data.data || []);
    } catch (err) {
      console.error("Error fetching resources:", err);
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setResources(allResources);
      return;
    }

    const filtered = allResources.filter((res) => {
      const titleMatch = res.title?.toLowerCase().includes(query.toLowerCase());
      const courseMatch = res.course?.courseCode?.toLowerCase().includes(query.toLowerCase()) ||
                          res.course?.title?.toLowerCase().includes(query.toLowerCase());
      return titleMatch || courseMatch;
    });

    setResources(filtered);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (PDF only for now)
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are supported");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle || !selectedCourse) {
      toast.error("Please provide file, title, and select a course");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", uploadTitle);
      formData.append("description", uploadDescription);

      await api.post(`/courses/${selectedCourse}/resources`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Resource uploaded successfully");
      
      // Reset form
      setSelectedFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setSelectedCourse("");
      document.getElementById("file-upload-input").value = "";

      // Refresh resources
      fetchData();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            Vault of Knowledge
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Centralized repository for academic materials and course resources.
          </Typography>
        </Box>

        {/* Faculty Upload Section */}
        {isFaculty && (
          <Paper
            sx={{
              p: 3,
              mb: 4,
              bgcolor: "background.paper",
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mb: 2 }}>
              Upload Resource
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    label="Course"
                  >
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.courseCode} - {course.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <input
                  id="file-upload-input"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                />
                <label htmlFor="file-upload-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<PictureAsPdfIcon />}
                    fullWidth
                  >
                    {selectedFile ? selectedFile.name : "Select PDF File"}
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUpload}
                  disabled={uploading || !selectedFile || !uploadTitle || !selectedCourse}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: "background.paper" }}>
          <TextField
            fullWidth
            placeholder="Search by title or course code..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Resources List */}
        <Paper sx={{ bgcolor: "background.paper", border: "1px solid rgba(255,255,255,0.1)" }}>
          <List>
            {resources.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                      {searchQuery ? "No resources found matching your search" : "No resources available yet"}
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              resources.map((resource) => (
                <ListItem
                  key={resource._id}
                  sx={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <ListItemIcon>
                    <PictureAsPdfIcon sx={{ color: "error.main", fontSize: 32 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={500}>
                          {resource.title}
                        </Typography>
                        <Chip
                          label={resource.course?.courseCode || "N/A"}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        {resource.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {resource.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {resource.course?.title} • Uploaded {new Date(resource.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    href={`http://localhost:5000${resource.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ ml: 2 }}
                  >
                    View PDF
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        </Paper>

        {/* Info Box */}
        <Paper
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            📌 <strong>Note:</strong> Files are stored locally in the server's /uploads directory. 
            This is a time-constrained implementation. Cloud storage integration can be added later.
          </Typography>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Resources;
