import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';

const CourseCard = ({ course, userRole, onViewResources, onDelete, userId }) => {
    return (
        <Card component={motion.div} whileHover={{ scale: 1.02, y: -5 }} sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                        {course.courseCode}
                    </Typography>
                    {(userRole === 'admin' || (userRole === 'faculty' && course.faculty?._id === userId)) && (
                        <IconButton size="small" color="error" onClick={() => onDelete(course._id)}>
                            <DeleteIcon />
                        </IconButton>
                    )}
                </Box>

                <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
                    {course.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {course.description.substring(0, 80)}...
                </Typography>

                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                    Faculty: {course.faculty?.username}
                </Typography>

                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<FolderIcon />}
                    onClick={() => onViewResources(course)}
                    sx={{ background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
                >
                    View Resources
                </Button>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
