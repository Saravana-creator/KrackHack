import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Button,
  Container,
} from "@mui/material";
import { FaEye } from "react-icons/fa";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AuthorityGrievances = () => {
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
  });

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;

      const res = await api.get("/grievances", { params });
      setGrievances(res.data.data);
    } catch (err) {
      console.error("Error fetching grievances", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Submitted":
        return "info";
      case "Under Review":
        return "warning";
      case "In Progress":
        return "primary";
      case "Resolved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
      case "Urgent":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: "secondary.main", mb: 3 }}
        >
          Authority Grievance Control Panel
        </Typography>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: "background.paper", border: '1px solid rgba(255,255,255,0.1)' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  label="Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Submitted">Submitted</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={filters.priority}
                  label="Priority"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={filters.category}
                  label="Category"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="infrastructure">Infrastructure</MenuItem>
                  <MenuItem value="academics">Academics</MenuItem>
                  <MenuItem value="hostel">Hostel</MenuItem>
                  <MenuItem value="food">Food</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="outlined" color="primary" onClick={() => setFilters({ status: "", priority: "", category: "" })}>
                    Reset Filters
                </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Table */}
        <TableContainer component={Paper} sx={{ bgcolor: "background.paper", border: '1px solid rgba(255,255,255,0.1)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(255,255,255,0.05)" }}>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : grievances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No grievances found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                grievances.map((grievance) => (
                  <TableRow key={grievance._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{grievance.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={grievance.category}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={grievance.priority}
                        size="small"
                        color={getPriorityColor(grievance.priority)}
                      />
                    </TableCell>
                    <TableCell>{grievance.location || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={grievance.status}
                        size="small"
                        color={getStatusColor(grievance.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(grievance.updatedAt || grievance.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/authority/grievances/${grievance._id}`)}
                      >
                        <FaEye />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
    </Container>
  );
};

export default AuthorityGrievances;
