import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AdminDomains = () => {
    const [domains, setDomains] = useState([]);
    const [newDomain, setNewDomain] = useState('');

    useEffect(() => {
        fetchDomains();
    }, []);

    const fetchDomains = async () => {
        try {
            const res = await api.get('/admin/domains');
            setDomains(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async () => {
        if (!newDomain) return;
        try {
            await api.post('/admin/domains', { domain: newDomain });
            setNewDomain('');
            fetchDomains();
            toast.success('Domain added successfully');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to add domain');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/admin/domains/${id}`);
            fetchDomains();
            toast.success('Domain removed');
        } catch (err) {
            toast.error('Failed to remove domain');
        }
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Manage Allowed Email Domains
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4 }}>
                Control which email domains are permitted for new user registrations.
            </Typography>

            <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.paper', maxWidth: 600 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="New Domain (e.g., .sece.ac.in)"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        variant="outlined"
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                    />
                    <Button variant="contained" onClick={handleAdd}> Add </Button>
                </Box>
            </Paper>

            <Paper sx={{ bgcolor: 'background.paper', maxWidth: 600 }}>
                <List>
                    {domains.map((d) => (
                        <ListItem
                            key={d._id}
                            secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(d._id)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText
                                primary={d.domain}
                                secondary={`Added on: ${new Date(d.createdAt).toLocaleDateString()}`}
                                primaryTypographyProps={{ color: 'white' }}
                                secondaryTypographyProps={{ color: 'gray' }}
                            />
                        </ListItem>
                    ))}
                    {domains.length === 0 && (
                        <ListItem>
                            <ListItemText primary="No custom domains configured (Default: .edu)" primaryTypographyProps={{ color: 'text.secondary' }} />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Box>
    );
};

export default AdminDomains;
