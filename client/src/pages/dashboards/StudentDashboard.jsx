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
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import io from "socket.io-client";
import { FaBook, FaExclamationCircle, FaBriefcase, FaTasks, FaSearchLocation } from 'react-icons/fa';
import api from "../../services/api";

const StudentDashboard = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    academics: 0,
    grievances: 0,
    opportunities: 0,
    tasks: 5 // Placeholder count for Scholar's Ledger/Tasks as per instructions
  });
  const [loadingStats, setLoadingStats] = useState(true);

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
        const [academicsRes, grievancesRes, opportunitiesRes] = await Promise.all([
          api.get('/academics/my-courses'),
          api.get('/grievances'),
          api.get('/opportunities')
        ]);

        setStats(prev => ({
          ...prev,
          academics: academicsRes.data.count || 0,
          grievances: grievancesRes.data.count || 0,
          opportunities: opportunitiesRes.data.count || 0
        }));
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    }
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
            {loadingStats ? "-" : count}
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
              onClick={() => navigate("/academics")}
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
              onClick={() => navigate("/grievances")} 
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
              onClick={() => navigate("/careers")} 
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
              onClick={() => navigate("/academics")} 
              delay={0.4}
            />
          </Grid>

          {/* Keeping existing functionality: Lost & Found */}
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

           {/* Quick Action for New Grievance (To preserve the specific "Submit" intent from original dashboard) */}
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
                  onClick={() => navigate("/grievance/new")}
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
