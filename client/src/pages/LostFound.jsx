import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Button, Grid, Card, CardContent, TextField, Chip, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const LostFound = () => {
    const { user } = useSelector((state) => state.auth);
    const [items, setItems] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newItem, setNewItem] = useState({ itemName: '', description: '', category: 'Electronics', location: '', status: 'Lost' });
    const [filter, setFilter] = useState('All');

    const fetchItems = async () => {
        try {
            const res = await api.get('/lostfound');
            setItems(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleReport = async () => {
        try {
            await api.post('/lostfound', newItem);
            toast.success('Item Reported Successfully');
            setOpenDialog(false);
            fetchItems();
        } catch (err) {
            toast.error('Failed to report item');
        }
    };

    const handleClaim = async (id) => {
        try {
            await api.post(`/lostfound/${id}/claim`);
            toast.success('Claim request sent to owner');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to claim');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/lostfound/${id}`);
            toast.success('Item removed');
            fetchItems();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    // Filter items based on status tab/dropdown
    const displayedItems = filter === 'All' ? items : items.filter(i => i.status === filter);

    return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ background: 'linear-gradient(to right, #f59e0b, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Lost & Found
                </Typography>
                <Button variant="contained" color="warning" onClick={() => setOpenDialog(true)}>
                    Report Lost/Found Item
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Button variant={filter === 'All' ? 'contained' : 'outlined'} onClick={() => setFilter('All')} sx={{ mr: 1, color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>All</Button>
                <Button variant={filter === 'Lost' ? 'contained' : 'outlined'} onClick={() => setFilter('Lost')} color="error" sx={{ mr: 1 }}>Lost</Button>
                <Button variant={filter === 'Found' ? 'contained' : 'outlined'} onClick={() => setFilter('Found')} color="success" sx={{ mr: 1 }}>Found</Button>
            </Box>

            <Grid container spacing={3}>
                {displayedItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                        <Card component={motion.div} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" color="primary">{item.itemName}</Typography>
                                    <Chip label={item.status} color={item.status === 'Lost' ? 'error' : 'success'} size="small" />
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {item.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Chip label={item.category} size="small" variant="outlined" sx={{ color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">Location: {item.location}</Typography>
                                </Box>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Posted by: {item.postedBy?.username || 'Unknown'}
                                    </Typography>
                                    {user.role !== 'admin' && item.postedBy._id !== user.id && item.status === 'Found' && (
                                        <Button size="small" variant="outlined" color="success" onClick={() => handleClaim(item._id)}>
                                            Claim This
                                        </Button>
                                    )}
                                    {(user.role === 'admin' || item.postedBy._id === user.id) && (
                                        <Button size="small" color="error" onClick={() => handleDelete(item._id)}>
                                            Remove
                                        </Button>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Report Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ style: { backgroundColor: '#1e293b', color: 'white' } }}>
                <DialogTitle>Report an Item</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: '#94a3b8' }}>Status</InputLabel>
                                <Select value={newItem.status} label="Status" onChange={(e) => setNewItem({ ...newItem, status: e.target.value })} sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                                    <MenuItem value="Lost">Lost (I lost something)</MenuItem>
                                    <MenuItem value="Found">Found (I found something)</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Item Name" value={newItem.itemName} onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={3} label="Description" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel sx={{ color: '#94a3b8' }}>Category</InputLabel>
                                <Select value={newItem.category} label="Category" onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                                    <MenuItem value="Electronics">Electronics</MenuItem>
                                    <MenuItem value="Books">Books</MenuItem>
                                    <MenuItem value="Clothing">Clothing</MenuItem>
                                    <MenuItem value="ID Cards">ID Cards</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Location" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} InputProps={{ style: { color: 'white' } }} InputLabelProps={{ style: { color: '#94a3b8' } }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleReport} color="warning" variant="contained">Submit Report</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LostFound;
