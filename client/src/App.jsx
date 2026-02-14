import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Cursor from './components/Cursor';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './layouts/MainLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GrievanceForm from './pages/GrievanceForm';
import GrievanceList from './pages/GrievanceList';
import InternshipPortal from './pages/InternshipPortal';
import AcademicPortal from './pages/AcademicPortal';
import Profile from './pages/Profile';
import AdminDomains from './pages/AdminDomains';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6', // Electric Blue
        },
        secondary: {
            main: '#14b8a6', // Teal
        },
        background: {
            default: '#0f172a', // Deep Navy
            paper: '#1e293b',   // Darker Slate
        },
        text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove default elevation gradient in dark mode
                }
            }
        }
    },
});

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/authSlice';

function App() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Cursor />
            <Toaster position="top-right" />
            <Toaster position="top-right" />

            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/" element={<><Navbar /><Landing /></>} />
                    <Route path="/login" element={<><Navbar /><Login /></>} />
                    <Route path="/register" element={<><Navbar /><Register /></>} />

                    {/* Protected Routes wrapped in MainLayout */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/grievance/new" element={<GrievanceForm />} />
                            <Route path="/grievances" element={<GrievanceList />} />
                            <Route path="/internships" element={<InternshipPortal />} />
                            <Route path="/academics" element={<AcademicPortal />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/admin/domains" element={<AdminDomains />} />
                        </Route>
                    </Route>
                </Routes>
            </AnimatePresence>
        </ThemeProvider>
    );
}

export default App;
