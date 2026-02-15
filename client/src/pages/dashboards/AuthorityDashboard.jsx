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
import { FaClipboardList, FaSpinner, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import api from "../../services/api";

const AuthorityDashboard = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('grievance'); // 'grievance' or 'lostfound'
  const [analytics, setAnalytics] = useState(null);
  
  // Keep grievanceStats for top cards if they are separate from the "Analytics" section?
  // The Prompt 3 says "Authority SHOULD see ONLY: Grievances, Lost & Found".
  // The Prompt 4 says "Authority Analytics - Filtered Insights Only".
  // It implies the MAIN view should be these filtered insights or available.
  // I will keep the top "Summary Cards" for quick actions and add the Analytics section below with filters.
  
  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000");
    // Socket connection
    socket.emit('join', user._id);
    
    socket.on('notification', notif => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/analytics/authority?type=${filter}`);
        setAnalytics(res.data);
      } catch (err) {
        console.error("Error fetching analytics", err);
      }
    };
    if (user) fetchAnalytics();
  }, [user, filter]);

  if (!user || isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // Helper for simple bar chart
  const SimpleBarChart = ({ data }) => {
      if (!data) return null;
      // data is { _id: "Month", count: N }
      const max = Math.max(...data.map(d => d.count), 1);
      return (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 2, overflowX: 'auto', p: 2 }}>
              {data.map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <Box 
                        sx={{ 
                            width: '100%', 
                            height: `${(d.count / max) * 150}px`, 
                            bgcolor: '#3b82f6', 
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.5s'
                        }} 
                      />
                      <Typography variant="caption" sx={{ mt: 1 }}>{d._id}</Typography>
                  </Box>
              ))}
          </Box>
      );
  };

  // Helper for simple pie usage (distribution list)
  const DistributionList = ({ data }) => {
      if (!data) return null;
      const total = data.reduce((acc, curr) => acc + curr.count, 0);
      return (
          <Box>
              {data.map((d, i) => (
                  <Box key={i} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">{d._id}</Typography>
                          <Typography variant="body2">{d.count} ({((d.count / total) * 100).toFixed(1)}%)</Typography>
                      </Box>
                      <Box sx={{ width: '100%', height: 8, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                          <Box sx={{ width: `${(d.count / total) * 100}%`, height: '100%', bgcolor: i % 2 === 0 ? '#10b981' : '#f59e0b', borderRadius: 4 }} />
                      </Box>
                  </Box>
              ))}
          </Box>
      );
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", background: "linear-gradient(to right, #3b82f6, #14b8a6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", mb: 4 }}>
          Authority Dashboard
        </Typography>

        {/* Navigation / Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
             <Grid item xs={12} md={6}>
                 <Card sx={{ bgcolor: "background.paper", border: "1px solid rgba(255,255,255,0.1)", cursor: 'pointer' }} onClick={() => navigate("/authority/grievances")}>
                     <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <FaClipboardList size={32} color="#3b82f6" />
                         <Box>
                             <Typography variant="h6">Grievances</Typography>
                             <Typography variant="body2" color="text.secondary">Manage student complaints</Typography>
                         </Box>
                     </CardContent>
                 </Card>
             </Grid>
             <Grid item xs={12} md={6}>
                 <Card sx={{ bgcolor: "background.paper", border: "1px solid rgba(255,255,255,0.1)", cursor: 'pointer' }} onClick={() => navigate("/authority/lost-found")}>
                     <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                         <FaSearchLocation size={32} color="#f59e0b" />
                         <Box>
                             <Typography variant="h6">Lost & Found</Typography>
                             <Typography variant="body2" color="text.secondary">Oversee lost items</Typography>
                         </Box>
                     </CardContent>
                 </Card>
             </Grid>
        </Grid>

        {/* Analytics Section */}
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Typography variant="h5">Analytics Overview</Typography>
                <Box sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: 1, p: 0.5 }}>
                    <Button 
                        size="small" 
                        variant={filter === 'grievance' ? 'contained' : 'text'} 
                        onClick={() => setFilter('grievance')}
                    >
                        Grievances
                    </Button>
                    <Button 
                        size="small" 
                        variant={filter === 'lostfound' ? 'contained' : 'text'} 
                        color="warning"
                        onClick={() => setFilter('lostfound')}
                    >
                        Lost & Found
                    </Button>
                </Box>
            </Box>

            {analytics && (
                <Grid container spacing={3}>
                    {/* Total Count */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="h2" fontWeight="bold" color="primary">{analytics.totalReports}</Typography>
                                <Typography variant="subtitle1" color="text.secondary">Total Reports</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Status Distribution */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Status Distribution</Typography>
                                <DistributionList data={analytics.statusDistribution} />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Trends */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Monthly Trends</Typography>
                                <SimpleBarChart data={analytics.monthlyTrend} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
      </motion.div>
    </Box>
  );
};

const StatCard = ({ title, count, icon, color, onClick }) => (
  <Card 
    sx={{ 
      bgcolor: "background.paper", 
      border: "1px solid rgba(255,255,255,0.1)", 
      cursor: 'pointer', 
      transition: 'all 0.2s', 
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 4px 20px -2px ${color}40` } 
    }} 
    onClick={onClick}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3 }}>
        <Box>
            <Typography variant="h6" color="text.secondary" sx={{ fontSize: '0.9rem', mb: 0.5 }}>{title}</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: color }}>{count}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'inline-block', borderBottom: '1px solid currentColor' }}>
              View All
            </Typography>
        </Box>
        <Box sx={{ 
          color: color, 
          bgcolor: `${color}20`, 
          p: 1.5, 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
    </CardContent>
  </Card>
);

export default AuthorityDashboard;
