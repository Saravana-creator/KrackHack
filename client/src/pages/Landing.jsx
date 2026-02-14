import React from 'react';
import { Box, Typography, Button, Grid, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(circle at 10% 20%, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 90%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            {/* Background elements */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', top: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '40%', background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(168,85,247,0.1) 100%)', filter: 'blur(80px)', zIndex: 0 }}
            />

            <Container maxWidth="lg" sx={{ zIndex: 1 }}>
                <Grid container spacing={4} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800, background: '-webkit-linear-gradient(45deg, #3b82f6, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
                                AEGIS PROTOCOL
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 4, color: 'text.secondary', fontWeight: 300 }}>
                                Unifying Campus Governance into a Single, Secure Ecosystem.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button component={Link} to="/register" variant="contained" size="large" sx={{ borderRadius: '30px', px: 4, py: 1.5, fontSize: '1.1rem', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(59,130,246,0.39)' }}>
                                    Get Started
                                </Button>
                                <Button component={Link} to="/login" variant="outlined" size="large" sx={{ borderRadius: '30px', px: 4, py: 1.5, fontSize: '1.1rem', borderColor: 'rgba(255,255,255,0.2)', color: 'white', textTransform: 'none', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.05)' } }}>
                                    Login
                                </Button>
                            </Box>
                        </motion.div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                            <Box sx={{ position: 'relative', width: '100%', height: 400, borderRadius: 4, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)' }}>
                                {/* Abstract Dashboard UI Mockup */}
                                <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 2 }}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444' }} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#eab308' }} />
                                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#22c55e' }} />
                                </Box>
                                <Box sx={{ p: 4 }}>
                                    <Box sx={{ height: 20, width: '40%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, mb: 4 }} />
                                    <Grid container spacing={2}>
                                        {[1, 2, 3].map((i) => (
                                            <Grid item xs={4} key={i}>
                                                <Box sx={{ height: 100, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                    <Box sx={{ mt: 4, height: 150, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                                </Box>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Landing;
