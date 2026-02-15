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
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Container,
} from "@mui/material";
import { FaUserShield, FaCheckCircle, FaBan } from "react-icons/fa";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data);
    } catch (err) {
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole });
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      toast.success("Role updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    // Confirm blocking? Maybe too intrusive. Just toggle.
    try {
      await api.patch(`/admin/users/${userId}`, { status: newStatus });
      setUsers(users.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)));
      const msg = newStatus === "active" ? "User unblocked" : "User blocked";
      toast.success(msg);
    } catch (err) {
      toast.error(err.response?.data?.error || "Status update failed");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin": return "error";
      case "authority": return "warning";
      case "faculty": return "info";
      default: return "success";
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "text.primary", mb: 3 }}>
          System User Management
        </Typography>

        <TableContainer component={Paper} sx={{ bgcolor: "background.paper", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(255,255,255,0.05)" }}>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disableUnderline
                          sx={{ 
                            color: getRoleColor(user.role) + ".main",
                            fontSize: '0.875rem',
                            fontWeight: 500
                          }}
                        >
                          <MenuItem value="student">Student</MenuItem>
                          <MenuItem value="faculty">Faculty</MenuItem>
                          <MenuItem value="authority">Authority</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status || "active"} // Fallback for old data
                        size="small"
                        color={user.status === "blocked" ? "error" : "success"}
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                         <Button
                            size="small"
                            variant="outlined"
                            color={user.status === "blocked" ? "success" : "error"}
                            startIcon={user.status === "blocked" ? <FaCheckCircle /> : <FaBan />}
                            onClick={() => handleStatusChange(user._id, user.status || "active")}
                         >
                            {user.status === "blocked" ? "Unblock" : "Block"}
                         </Button>
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

export default AdminUsers;
