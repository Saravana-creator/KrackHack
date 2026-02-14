import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Divider, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { motion } from 'framer-motion';
import axios from 'axios';

const GrievanceList = () => {
    const [grievances, setGrievances] = useState([]);

    useEffect(() => {
        const fetchGrievances = async () => {
            const res = await axios.get('/api/v1/grievances');
            setGrievances(res.data.data);
        };
        fetchGrievances();
    }, []);

    return (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Typography variant="h4" gutterBottom color="secondary.main">Manage Grievances</Typography>
            <List sx={{ width: '100%', maxWidth: 800, bgcolor: 'background.paper', borderRadius: 2 }}>
                {grievances.map((grievance, index) => (
                    <React.Fragment key={grievance._id}>
                        <ListItem alignItems="flex-start" secondaryAction={
                            <IconButton edge="end" aria-label="edit">
                                <EditIcon color="primary" />
                            </IconButton>
                        }>
                            <ListItemText
                                primary={
                                    <React.Fragment>
                                        <Typography component="span" variant="h6" color="primary.light">
                                            {grievance.title}
                                        </Typography>
                                        <Chip label={grievance.status} color={grievance.status === 'resolved' ? 'success' : 'warning'} size="small" sx={{ ml: 2 }} />
                                    </React.Fragment>
                                }
                                secondary={
                                    <React.Fragment>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            {grievance.description}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="caption" color="text.secondary">
                                            Submitted by User: {grievance.user} on {new Date(grievance.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </React.Fragment>
                                }
                            />
                        </ListItem>
                        {index < grievances.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};

export default GrievanceList;
