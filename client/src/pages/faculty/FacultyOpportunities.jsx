import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Card, CardContent, Button, Grid, Chip, CircularProgress 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUserTie, FaUsers } from 'react-icons/fa';
import api from '../../services/api';
import { format } from 'date-fns';

const FacultyOpportunities = () => {
    const navigate = useNavigate();
    const [opportunities, setOpportunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyOpportunities = async () => {
            try {
                const res = await api.get('/opportunities/mine');
                setOpportunities(res.data.data);
            } catch (err) {
                console.error("Error fetching opportunities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyOpportunities();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#f8fafc' }}>
                My Posted Opportunities
            </Typography>

            <Grid container spacing={3}>
                {opportunities.map((op) => (
                    <Grid item xs={12} md={6} lg={4} key={op._id}>
                        <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    {op.title}
                                </Typography>
                                <Chip 
                                    label={op.type} 
                                    size="small" 
                                    sx={{ bgcolor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', mb: 2 }} 
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <FaCalendarAlt size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Deadline: {format(new Date(op.deadline), 'MMM dd, yyyy')}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <FaUsers size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        Status: {new Date(op.deadline) > new Date() ? 'Open' : 'Closed'}
                                    </Typography>
                                </Box>
                                <Button 
                                    variant="outlined" 
                                    fullWidth
                                    onClick={() => navigate(`/faculty/applications/${op._id}`)}
                                >
                                    View Applicants
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default FacultyOpportunities;
