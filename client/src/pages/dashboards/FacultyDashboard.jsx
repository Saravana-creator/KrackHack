import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
import { FaBook, FaFlask, FaInbox, FaCalendarAlt, FaSearchLocation } from 'react-icons/fa';
import api from "../../services/api";

const FacultyDashboard = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    courses: 0,
    opportunities: 0,
    applications: 0, // Placeholder as there is no direct API for total applications received across all ops
    calendar: 3 // Placeholder
  });

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("join", { role: user.role, id: user.id }); // Join room based on role and ID
    });

    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.role, user?.id]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch courses (assuming /academics returns all courses, we might need a specific 'mine' or filter)
        // For now using /academics/events for calendar placeholder and /opportunities/mine for posted ops
        const [opportunitiesRes, academicRes] = await Promise.all([
            api.get('/opportunities/mine').catch(err => ({ data: { count: 0 }})),
            api.get('/academics/faculty').catch(err => ({ data: { courses: [], events: [] } })),
        ]);

        setStats(prev => ({
            ...prev,
            opportunities: opportunitiesRes.data.count || 0,
            courses: academicRes.data.courses ? academicRes.data.courses.length : 0,
            calendar: academicRes.data.events ? academicRes.data.events.length : 0
        }));

      } catch (error) {
        console.error("Error fetching dashboard stats", error);
      }
    };
    if(user) fetchStats();
  }, [user]);

  if (!user || isLoading) {
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
          <Button
            variant="contained"
            fullWidth
            sx={{ 
              bgcolor: color, 
              '&:hover': { filter: 'brightness(0.9)', bgcolor: color },
              mt: 'auto'
            }}
            onClick={onClick}
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
           {/* My Courses */}
           <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={FaBook} 
              title="My Courses" 
              count={stats.courses} 
              color="#3b82f6" 
              buttonText="Manage Courses" 
              onClick={() => navigate("/academics")}
              delay={0.1}
            />
          </Grid>

          {/* My Posted Opportunities */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={FaFlask} 
              title="My Opportunities" 
              count={stats.opportunities} 
              color="#ec4899" 
              buttonText="Manage Postings" 
              onClick={() => navigate("/faculty/opportunities")} 
              delay={0.2}
            />
          </Grid>

           {/* Applications Received */}
           <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={FaInbox} 
              title="Applications" 
              count={stats.applications} 
              color="#8b5cf6" 
              buttonText="View All" 
              // Navigating to opportunities page where they can see applicants per opportunity
              onClick={() => navigate("/faculty/opportunities")} 
              delay={0.3}
            />
          </Grid>
          
           {/* Academic Calendar */}
           <Grid item xs={12} sm={6} md={3}>
            <StatCard 
              icon={FaCalendarAlt} 
              title="Calendar" 
              count={stats.calendar} 
              color="#14b8a6" 
              buttonText="View Schedule" 
              onClick={() => navigate("/academics")} 
              delay={0.4}
            />
          </Grid>

          {/* Lost & Found - Common Card */}
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
                  onClick={() => navigate("/lost-found")}
                >
                  View Items
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

export default FacultyDashboard;
