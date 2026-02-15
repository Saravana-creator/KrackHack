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
  CircularProgress,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../../services/api";
import { FaUserShield, FaUsers, FaClipboardList, FaClock, FaGlobe } from "react-icons/fa";
import AdminDomains from "../AdminDomains";

const AdminDashboard = () => {
  const { user, isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('students'); // students, staff, career
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/admin?type=${filter}`);
        setAnalytics(res.data);
      } catch (err) {
        console.error("Error fetching admin analytics", err);
      } finally {
        setLoading(false);
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

  // Simple Trend Chart Component (Reused logic ideally, but inline for speed)
  const TrendChart = ({ data }) => {
      if (!data) return null;
      const max = Math.max(...data.map(d => d.count), 1);
      return (
          <Box sx={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 2, overflowX: 'auto', p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
              {data.map((d, i) => (
                  <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <Box sx={{ width: '80%', height: `${(d.count / max) * 100}%`, minHeight: 4, bgcolor: '#8b5cf6', borderRadius: '4px 4px 0 0' }} />
                      <Typography variant="caption" sx={{ mt: 1 }}>{d._id}</Typography>
                  </Box>
              ))}
          </Box>
      );
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Typography variant="h3" fontWeight="bold" sx={{ background: "linear-gradient(to right, #ef4444, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Administrator Control
            </Typography>
            <Typography variant="body1" color="text.secondary">
              System oversight and governance dashboard.
            </Typography>
          </div>
          <Box sx={{ display: 'flex', gap: 2 }}>
             <Button variant="contained" color="secondary" onClick={() => navigate("/admin/system")}>
                System Config
             </Button>
             <Button variant="contained" color="primary" startIcon={<FaUsers />} onClick={() => navigate("/admin/users")}>
                User Management
             </Button>
          </Box>
        </Box>

        {/* 6. Admin Analytics Section */}
        <Typography variant="h5" sx={{ mb: 2 }}>Global Analytics</Typography>
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                {['students', 'staff', 'career'].map((f) => (
                    <Button 
                        key={f}
                        variant={filter === f ? 'contained' : 'outlined'} 
                        onClick={() => setFilter(f)}
                        sx={{ textTransform: 'capitalize' }}
                    >
                        {f}
                    </Button>
                ))}
            </Box>

            {loading ? <CircularProgress /> : analytics && (
                <Grid container spacing={3}>
                    {/* Primary Stat */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography variant="h6" color="text.secondary">Total {filter === 'career' ? 'Opportunities' : filter}</Typography>
                                <Typography variant="h2" fontWeight="bold" color="primary">
                                    {filter === 'career' ? analytics.total : analytics.count}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Distribution Chart (Pie/Bar logic) */}
                    <Grid item xs={12} md={4}>
                         <Card sx={{ height: '100%', bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>Distribution</Typography>
                                {analytics.distribution && analytics.distribution.map((d, i) => (
                                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                                        <Typography>{d._id}</Typography>
                                        <Typography fontWeight="bold">{d.count}</Typography>
                                    </Box>
                                ))}
                                {analytics.types && analytics.types.map((d, i) => (
                                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, p: 1, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
                                        <Typography>{d._id}</Typography>
                                        <Typography fontWeight="bold">{d.count}</Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Growth Chart */}
                    <Grid item xs={12} md={4}>
                        <TrendChart data={analytics.growth} />
                    </Grid>
                </Grid>
            )}
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

        {/* 5.3 ALLOWED DOMAIN CONTROL */}
        <Typography variant="h4" sx={{ mb: 3, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
           <FaUserShield size={28} color="#ef4444" /> Domain Governance
        </Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
                 {/* Reusing existing component but assuming it fits well. 
                     If AdminDomains has its own padding/container, it might look nested.
                     Let's verify AdminDomains content. It has Box p={4}. I should probably wrapp it or just use it.
                     Since I am reusing it, I will just render it here.
                  */}
                 <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <CardContent>
                       <AdminDomains />
                    </CardContent>
                 </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
                 <Card sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <CardContent>
                        <Typography variant="h6" color="error.main" gutterBottom>
                            Security Enforcement
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Restricting registration to specific domains ensures that only verified institutional members can access the platform.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • <strong>.edu</strong> and <strong>admin.com</strong> are allowed by default.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • Changes take effect immediately for new registrations.
                        </Typography>
                    </CardContent>
                 </Card>
            </Grid>
        </Grid>

      </motion.div>
    </Box>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ bgcolor: "background.paper", border: "1px solid rgba(255,255,255,0.1)", height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" textTransform="uppercase">
          {title}
        </Typography>
        <Box sx={{ color: color, bgcolor: `${color}20`, p: 1, borderRadius: 1.5 }}>
           {icon}
        </Box>
      </Box>
      <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>
        {value}
      </Typography>
      {subtitle && (typeof subtitle === 'string' ? 
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography> : subtitle
      )}
    </CardContent>
  </Card>
);

export default AdminDashboard;
