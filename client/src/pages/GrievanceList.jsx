import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import { motion } from "framer-motion";
import api from "../services/api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const GrievanceList = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState("");

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      const res = await api.get("/grievances");
      console.log("Grievances fetched:", res.data);
      setGrievances(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load tickets");
      setLoading(false);
    }
  };

  const handleView = (grievance) => {
    setSelectedGrievance(grievance);
    setStatusUpdate(grievance.status);
    setOpenDialog(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/grievances/${selectedGrievance._id}`, {
        status: statusUpdate,
      });
      toast.success(`Ticket status updated to ${statusUpdate}`);
      setOpenDialog(false);
      fetchGrievances();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await api.delete(`/grievances/${id}`);
      toast.success("Ticket deleted");
      fetchGrievances();
    } catch (err) {
      toast.error("Failed to delete ticket");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "error";
      case "in-progress":
        return "warning";
      case "resolved":
        return "success";
      default:
        return "default";
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
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(to right, #3b82f6, #14b8a6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Support Center
          </Typography>
          <Typography color="text.secondary">
            {user.role === "student"
              ? "Track and manage your submitted requests"
              : "Manage incoming support tickets"}
          </Typography>
        </Box>
        {user.role === "student" && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/grievance/new")}
            sx={{
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
              borderRadius: "20px",
            }}
          >
            New Ticket
          </Button>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            bgcolor: "background.paper",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "rgba(255,255,255,0.05)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  TICKET ID
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  SUBJECT
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  CATEGORY
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  DATE SUBMITTED
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "text.secondary" }}>
                  STATUS
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: "text.secondary" }}
                  align="right"
                >
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {grievances.map((row) => (
                <TableRow
                  key={row._id}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ color: "text.primary", fontFamily: "monospace" }}
                  >
                    #{row._id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500, color: "text.primary" }}>
                    {row.title}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.category || "General"}
                      size="small"
                      variant="outlined"
                      sx={{
                        color: "text.secondary",
                        borderColor: "rgba(255,255,255,0.2)",
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {new Date(row.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.status.toUpperCase().replace("-", " ")}
                      color={getStatusColor(row.status)}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleView(row)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {(user.role === "admin" || user.role === "authority") && (
                      <Tooltip title="Delete Ticket">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(row._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {grievances.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    No tickets found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* TICKET DETAILS DIALOG */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#1e293b",
            color: "#f8fafc",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 2 }}
        >
          Ticket #{selectedGrievance?._id.slice(-6).toUpperCase()}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary">
              SUBJECT
            </Typography>
            <Typography variant="h6">{selectedGrievance?.title}</Typography>
          </Box>
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary">
              DESCRIPTION
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: "pre-wrap",
                bgcolor: "rgba(255,255,255,0.05)",
                color: "text.primary",
                p: 2,
                borderRadius: 1,
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {selectedGrievance?.description}
            </Typography>
          </Box>

          {selectedGrievance?.image && (
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary">
                ATTACHMENT
              </Typography>
              <Box
                component="img"
                src={selectedGrievance.image}
                alt="Grievance Attachment"
                sx={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                  borderRadius: 1,
                  border: "1px solid rgba(255,255,255,0.1)",
                  mt: 1,
                }}
              />
            </Box>
          )}
          {!selectedGrievance?.image && (
            <Box
              mb={3}
              sx={{
                p: 2,
                border: "1px dashed rgba(255,255,255,0.2)",
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No Attachment
              </Typography>
            </Box>
          )}

          {user.role === "admin" || user.role === "authority" ? (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                UPDATE STATUS
              </Typography>
              <Select
                fullWidth
                size="small"
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
                sx={{
                  color: "white",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                }}
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                CURRENT STATUS
              </Typography>
              <Chip
                label={selectedGrievance?.status.toUpperCase()}
                color={getStatusColor(selectedGrievance?.status)}
              />
            </Box>
          )}

          <Box mt={3}>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Submitted on:{" "}
              {selectedGrievance &&
                new Date(selectedGrievance.createdAt).toLocaleString()}
            </Typography>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Submitted by:{" "}
              {selectedGrievance?.user?.username ||
                selectedGrievance?.user?._id ||
                "Unknown"}{" "}
              ({selectedGrievance?.user?.email})
            </Typography>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Assigned To:{" "}
              {selectedGrievance?.assignedTo?.username || "Unassigned"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            Close
          </Button>
          {(user.role === "admin" || user.role === "authority") && (
            <Button
              variant="contained"
              onClick={handleUpdateStatus}
              color="primary"
            >
              Update Status
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GrievanceList;
