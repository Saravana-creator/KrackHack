import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  FormControlLabel,
  Switch,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import api from "../services/api";
import { toast } from "react-hot-toast";

const AcademicCalendar = () => {
  const { user } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myCoursesOnly, setMyCoursesOnly] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch events
      const eventsRes = await api.get("/academics/events");
      const fetchedEvents = eventsRes.data.data || [];
      setAllEvents(fetchedEvents);
      setEvents(fetchedEvents);

      // Fetch enrolled courses for filtering
      if (user.role === "student") {
        const enrollmentsRes = await api.get("/academics/my-courses");
        const courseIds = (enrollmentsRes.data.data || []).map((e) => e.course._id);
        setEnrolledCourseIds(courseIds);
      }
    } catch (err) {
      console.error("Error fetching calendar data:", err);
      toast.error("Failed to load calendar");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterToggle = (checked) => {
    setMyCoursesOnly(checked);
    if (checked) {
      // Filter to only show events for enrolled courses or global events
      const filtered = allEvents.filter(
        (ev) => !ev.relatedCourse || enrolledCourseIds.includes(ev.relatedCourse)
      );
      setEvents(filtered);
    } else {
      setEvents(allEvents);
    }
  };

  const getEventTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "exam":
        return "error";
      case "deadline":
        return "warning";
      case "event":
        return "info";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
              Academic Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Institutional timeline for exams, deadlines, and events.
            </Typography>
          </div>

          {user.role === "student" && (
            <FormControlLabel
              control={
                <Switch
                  checked={myCoursesOnly}
                  onChange={(e) => handleFilterToggle(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" color="text.secondary">
                  My Courses Only
                </Typography>
              }
            />
          )}
        </Box>

        <TableContainer
          component={Paper}
          sx={{
            bgcolor: "background.paper",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "rgba(255,255,255,0.05)" }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Date
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Title
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Related Course
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Type
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No events scheduled.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event._id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{event.title}</Typography>
                      {event.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {event.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {event.courseName || "All Courses"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.type || "Event"}
                        size="small"
                        color={getEventTypeColor(event.type)}
                        variant="outlined"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
    </Container>
  );
};

export default AcademicCalendar;
