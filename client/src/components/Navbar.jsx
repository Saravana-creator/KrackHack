import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const Navbar = () => {
  const { isAuthenticated, user, lastKnownUser } = useSelector(
    (state) => state.auth,
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicRoute = ["/", "/login", "/register"].includes(
    location.pathname,
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: "background.paper",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
            letterSpacing: 1,
            background: "linear-gradient(to right, #3b82f6, #14b8a6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            AEGIS PROTOCOL
          </Link>
        </Typography>

        {isAuthenticated && !isPublicRoute ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button component={Link} to="/dashboard" color="inherit">
              Dashboard
            </Button>
            <Button component={Link} to="/careers" color="inherit">
              Careers
            </Button>
            <Button component={Link} to="/academics" color="inherit">
              Academics
            </Button>
            {!isPublicRoute && (
              <Button
                component={Link}
                to="/profile"
                sx={{ color: "secondary.main", fontWeight: "bold" }}
              >
                {user?.username?.toUpperCase()}
              </Button>
            )}
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Button
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: "20px" }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {lastKnownUser && !isPublicRoute && (
              <Typography
                variant="body2"
                sx={{ color: "#64748b", mr: 1, fontStyle: "italic" }}
              >
                Hi, {lastKnownUser}
              </Typography>
            )}
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/register"
              sx={{ borderRadius: "20px" }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
