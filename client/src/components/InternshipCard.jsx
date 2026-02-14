import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Button, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Box } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const InternshipCard = ({ internship, userRole, onApply, onDelete, onViewApplications }) => {
    const [open, setOpen] = useState(false);
    const [resumeLink, setResumeLink] = useState('');

    const handleApply = async () => {
        if (!resumeLink) {
            toast.error('Please provide a resume link');
            return;
        }
        await onApply(internship._id, resumeLink);
        setOpen(false);
        setResumeLink('');
    };

    return (
        <Card component={motion.div} whileHover={{ scale: 1.02 }} sx={{ mb: 2, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <CardContent>
                <div className="flex justify-between items-start">
                    <div>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                            {internship.title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {internship.company} • {internship.location}
                        </Typography>
                    </div>
                    <Chip label={internship.type.toUpperCase()} color="secondary" size="small" variant="outlined" />
                </div>

                <Typography variant="body2" sx={{ my: 2, color: 'text.secondary' }}>
                    {internship.description.substring(0, 150)}...
                </Typography>

                <div className="flex gap-4 mb-2 text-sm text-gray-400">
                    <span>💰 {internship.stipend}</span>
                    <span>⏳ {internship.duration}</span>
                </div>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {userRole === 'student' && (
                        <Button variant="contained" size="small" onClick={() => setOpen(true)} sx={{ background: 'linear-gradient(to right, #3b82f6, #14b8a6)' }}>
                            Apply Now
                        </Button>
                    )}
                    {(userRole === 'admin' || userRole === 'faculty') && (
                        <>
                            <Button variant="outlined" color="info" size="small" onClick={() => onViewApplications(internship._id)}>
                                View Applications
                            </Button>
                            <Button variant="outlined" color="error" size="small" onClick={() => onDelete(internship._id)}>
                                Delete
                            </Button>
                        </>
                    )}
                </Box>
            </CardContent>

            {/* Application Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ style: { backgroundColor: '#1e293b', color: 'white' } }}>
                <DialogTitle>Apply for {internship.title}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Please provide a link to your resume (Google Drive, LinkedIn, etc.)
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Resume Link"
                        fullWidth
                        variant="outlined"
                        value={resumeLink}
                        onChange={(e) => setResumeLink(e.target.value)}
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleApply} variant="contained" color="primary">Submit Application</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default InternshipCard;
