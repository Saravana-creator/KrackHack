import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import ReportIcon from '@mui/icons-material/Report';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DRAWER_WIDTH = 240;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const [openGrievance, setOpenGrievance] = useState(false);

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Academics', icon: <SchoolIcon />, path: '/academics' },
        { text: 'Careers', icon: <WorkIcon />, path: '/internships' },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', top: 64, height: 'calc(100% - 64px)', bgcolor: 'background.paper' },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                            sx={{ '&.Mui-selected': { bgcolor: 'primary.dark' } }}
                        >
                            <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}

                    {user?.role !== 'faculty' && (
                        <>
                            <ListItem button onClick={() => setOpenGrievance(!openGrievance)}>
                                <ListItemIcon sx={{ color: 'secondary.main' }}><ReportIcon /></ListItemIcon>
                                <ListItemText primary="Grievances" />
                                {openGrievance ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                            <Collapse in={openGrievance} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {user?.role === 'student' && (
                                        <ListItem button sx={{ pl: 4 }} onClick={() => navigate('/grievance/new')}>
                                            <ListItemText primary="Submit New" />
                                        </ListItem>
                                    )}
                                    <ListItem button sx={{ pl: 4 }} onClick={() => navigate('/grievances')}>
                                        <ListItemText primary={user?.role === 'student' ? "My Tickets" : "Manage Tickets"} />
                                    </ListItem>
                                </List>
                            </Collapse>
                        </>
                    )}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
