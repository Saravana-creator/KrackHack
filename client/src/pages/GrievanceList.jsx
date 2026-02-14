import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, TextField, CircularProgress, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GrievanceList = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState('');

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const res = await api.get('/grievances');
            setGrievances(res.data.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load tickets');
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
            await api.put(`/grievances/${selectedGrievance._id}`, { status: statusUpdate });
            toast.success(`Ticket status updated to ${statusUpdate}`);
            setOpenDialog(false);
            fetchGrievances();
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;
        try {
            await api.delete(`/grievances/${id}`);
            toast.success('Ticket deleted');
            fetchGrievances();
        } catch (err) {
            toast.error('Failed to delete ticket');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'error';
            case 'in-progress': return 'warning';
            case 'resolved': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 4, bgcolor: '#f1f5f9', minHeight: '100vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        Support Center
                    </Typography>
                    <Typography color="text.secondary">
                        {user.role === 'student' ? 'Track and manage your submitted requests' : 'Manage incoming support tickets'}
                    </Typography>
                </Box>
                {user.role === 'student' && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/grievance/new')}
                        sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                    >
                        New Ticket
                    </Button>
                )}
            </Box>

            {loading ? <Box display="flex" justifyContent="center"><CircularProgress /></Box> : (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>TICKET ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>SUBJECT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>CATEGORY</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>DATE SUBMITTED</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }}>STATUS</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#64748b' }} align="right">ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {grievances.map((row) => (
                                <TableRow key={row._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                                        #{row._id.slice(-6).toUpperCase()}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{row.title}</TableCell>
                                    <TableCell>
                                        <Chip label={row.category || 'General'} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.status.toUpperCase().replace('-', ' ')}
                                            color={getStatusColor(row.status)}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="View Details">
                                            <IconButton color="primary" size="small" onClick={() => handleView(row)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {(user.role === 'admin' || user.role === 'authority') && (
                                            <Tooltip title="Delete Ticket">
                                                <IconButton color="error" size="small" onClick={() => handleDelete(row._id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {grievances.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No tickets found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* TICKET DETAILS DIALOG */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', pb: 2 }}>
                    Ticket #{selectedGrievance?._id.slice(-6).toUpperCase()}
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box mb={3}>
                        <Typography variant="subtitle2" color="text.secondary">SUBJECT</Typography>
                        <Typography variant="h6">{selectedGrievance?.title}</Typography>
                    </Box>
                    <Box mb={3}>
                        <Typography variant="subtitle2" color="text.secondary">DESCRIPTION</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', bgcolor: '#f8fafc', p: 2, borderRadius: 1, border: '1px solid #e2e8f0' }}>
                            {selectedGrievance?.description}
                        </Typography>
                    </Box>

                    {(user.role === 'admin' || user.role === 'authority') ? (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>UPDATE STATUS</Typography>
                            <Select fullWidth size="small" value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}>
                                <MenuItem value="open">Open</MenuItem>
                                <MenuItem value="in-progress">In Progress</MenuItem>
                                <MenuItem value="resolved">Resolved</MenuItem>
                            </Select>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">CURRENT STATUS</Typography>
                            <Chip label={selectedGrievance?.status.toUpperCase()} color={getStatusColor(selectedGrievance?.status)} />
                        </Box>
                    )}

                    <Box mt={3}>
                        <Typography variant="caption" display="block" color="text.secondary">Submitted on: {selectedGrievance && new Date(selectedGrievance.createdAt).toLocaleString()}</Typography>
                        <Typography variant="caption" display="block" color="text.secondary">User ID: {selectedGrievance?.user}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Close</Button>
                    {(user.role === 'admin' || user.role === 'authority') && (
                        <Button variant="contained" onClick={handleUpdateStatus} color="primary">Update Status</Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GrievanceList;
