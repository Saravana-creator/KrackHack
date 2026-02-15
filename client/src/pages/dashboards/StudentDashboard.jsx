import React, { useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import io from "socket.io-client";
import { FaBook, FaExclamationCircle, FaBriefcase, FaTasks, FaSearchLocation } from 'react-icons/fa';
import { fetchStudentDashboardData, addNotification } from "../../redux/dashboardSlice";

const StudentDashboard = () => {
  const { user, isLoading: authLoading } = useSelector((state) => state.auth);
  const { data, notifications, isLoading: dashboardLoading } = useSelector((state) => state.dashboard);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 1.1 API Calls — Fire Once on Mount Only
  useEffect(() => {
    dispatch(fetchStudentDashboardData());
  }, [dispatch]);

  // 2.4 Frontend Bell Icon Listener (Socket)
  useEffect(() => {
    if (!user?._id) return; // Ensure user exists before connecting

    const socket = io("http://localhost:5000");
    
    socket.emit('join', user._id);

    socket.on('notification', notif => {
      dispatch(addNotification(notif));
    });

    return () => {
      socket.off('notification');
      socket.disconnect(); 
    };
  }, [user?._id, dispatch]); 
  // Note: Added user._id dependency to ensure socket connects with correct ID if user loads late, 
  // though prompt simplified it to []. Safety first for "correctness". 
  // However, prompts says "useEffect(..., [])" in 2.4 logic. 
  // But strictly, if user is null initially (async load), [] would fail to emit join.
  // Given "Goal: stability + correctness", I'll include user._id.

  // 1.3 Memoize Derived Values
  const stats = useMemo(() => ({
    academics: data.academics?.count || data.academics?.length || 0,
    grievances: data.grievances?.count || data.grievances?.length || 0,
    opportunities: data.opportunities?.count || data.opportunities?.length || 0,
    tasks: 5 // Placeholder
  }), [data]);

  // 1.4 Memoize Callbacks Passed to Children
  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  if (!user || authLoading || dashboardLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const StatCard = ({ icon: Icon, title, count, color, buttonText, onClick, delay = 0 }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }}
    >
      <Card
        sx={{
          bgcolor: "background.paper",
          border: "1px solid rgba(255,255,255,0.1)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Icon size={28} color={color} style={{ marginRight: '12px' }} />
            <Typography variant="h6" color="text.primary">
              {title}
            </Typography>
          </Box>
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 2 }}>
            {count}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
             {title === "Academics" && "Enrolled Courses"}
             {title === "My Grievances" && "Submitted Tickets"}
             {title === "Opportunities" && "Available Openings"}
             {title === "Tasks" && "Pending Assignments"}
             {title === "Lost & Found" && "Active Reports"}
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ 
              bgcolor: color, 
              '&:hover': { filter: 'brightness(0.9)', bgcolor: color },
              mt: 'auto'
            }}
            onClick={onClick}
            disabled={!onClick}
          >
            {buttonText}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(to right, #3b82f6, #14b8a6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 4
          }}
        >
          Welcome, {user?.username}
        </Typography>

        <Grid container spacing={3}>
          {/* Required Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={FaBook} 
              title="Academics" 
              count={stats.academics} 
              color="#3b82f6" 
              buttonText="View Academics" 
              onClick={() => handleNavigate("/academics")}
              delay={0.1}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={FaExclamationCircle} 
              title="My Grievances" 
              count={stats.grievances} 
              color="#ef4444" 
              buttonText="View My Grievances" 
              onClick={() => handleNavigate("/grievances")} 
              delay={0.2}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={FaBriefcase} 
              title="Opportunities" 
              count={stats.opportunities} 
              color="#ec4899" 
              buttonText="Explore Opportunities" 
              onClick={() => handleNavigate("/careers")} 
              delay={0.3}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={FaTasks} 
              title="Tasks" 
              count={stats.tasks} 
              color="#8b5cf6" 
              buttonText="View Tasks" 
              // Placeholder link as per instruction to use existing routes or disable
              onClick={() => handleNavigate("/academics")} 
              delay={0.4}
            />
          </Grid>

          {/* Keep existing functionality: Lost & Found */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid rgba(255,255,255,0.1)",
                mt: 2
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FaSearchLocation size={24} color="#f59e0b" style={{ marginRight: '12px' }} />
                    <Typography variant="h5" sx={{ color: "#f59e0b" }}>
                        Lost & Found
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Report lost items or claim found items on campus.
                </Typography>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => handleNavigate("/lost-found")}
                >
                  View Items
                </Button>
              </CardContent>
            </Card>
          </Grid>

           {/* Quick Action for New Grievance */}
           <Grid item xs={12} md={6}>
            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid rgba(255,255,255,0.1)",
                mt: 2
              }}
            >
              <CardContent>
                <Typography variant="h5" color="secondary" gutterBottom>
                  Quick Actions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Need to raise an issue immediately?
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleNavigate("/grievance/new")}
                >
                  Submit New Grievance
                </Button>
              </CardContent>
            </Card>
          </Grid>


          {/* Notifications Section */}
          {notifications.length > 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  bgcolor: "background.paper",
                  border: "1px solid rgba(255,255,255,0.1)",
                  mt: 2
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    Recent Notifications
                  </Typography>
                  {notifications.map((notif, index) => (
                    <Chip
                      key={index}
                      label={notif.message}
                      color="warning"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </motion.div>
    </Box>
  );
};

export default StudentDashboard;
