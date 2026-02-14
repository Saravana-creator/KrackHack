import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearErrors } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, MenuItem, Paper, Alert, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', secretKey: '' });
    const [showPassword, setShowPassword] = useState(false);
    const { isLoading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
        dispatch(clearErrors());
        return () => {
            dispatch(clearErrors());
        };
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(register(formData));
        if (result.type === 'auth/register/fulfilled') {
            navigate('/dashboard');
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)', bgcolor: 'background.default' }}
        >
            <Paper elevation={10} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3, background: '-webkit-linear-gradient(45deg, #14b8a6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Join AEGIS
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        margin="normal"
                        variant="outlined"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        margin="normal"
                        variant="outlined"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                        helperText="Use your institute email (e.g., .edu, .ac.in)"
                        FormHelperTextProps={{ style: { color: '#64748b' } }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        margin="normal"
                        variant="outlined"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        InputProps={{
                            style: { color: 'white' },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                        sx={{ color: '#94a3b8' }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                        helperText="Min 8 chars, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special"
                        FormHelperTextProps={{ style: { color: '#64748b' } }}
                    />
                    <TextField
                        select
                        fullWidth
                        label="Role"
                        margin="normal"
                        variant="outlined"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                    >
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="faculty">Faculty</MenuItem>
                        <MenuItem value="authority">Authority</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </TextField>

                    {/* Show Secret Key if Admin/Authority/Faculty is selected OR if email indicates an admin */}
                    {(formData.role === 'admin' || formData.role === 'authority' || formData.role === 'faculty' || formData.email.endsWith('@admin.com')) && (
                        <TextField
                            fullWidth
                            label="Secret Key"
                            type="password"
                            margin="normal"
                            variant="outlined"
                            value={formData.secretKey}
                            onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                            required
                            InputProps={{ style: { color: 'white' } }}
                            InputLabelProps={{ style: { color: '#94a3b8' } }}
                            helperText="Required for Admin/Authority roles"
                            FormHelperTextProps={{ style: { color: '#f59e0b' } }}
                        />
                    )}

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5, background: 'linear-gradient(to right, #14b8a6, #3b82f6)' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Get Started'}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default Register;
