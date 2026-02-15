import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert, IconButton, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const { isLoading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login({ email, password }));
        if (result.type === 'auth/login/fulfilled') {
            navigate('/dashboard');
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 'calc(100vh - 64px)',
                bgcolor: 'background.default',
                p: 2
            }}
        >
            <Paper elevation={10} sx={{
                p: 4,
                width: '100%',
                maxWidth: 400,
                borderRadius: 4,
                backgroundColor: 'background.paper',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4, background: '-webkit-linear-gradient(45deg, #3b82f6, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Welcome Back
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        margin="normal"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        InputProps={{ style: { color: 'white' } }}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                        sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#475569' }, '&:hover fieldset': { borderColor: '#3b82f6' } } }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        margin="normal"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        InputProps={{ 
                            style: { color: 'white' },
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                        sx={{ color: '#94a3b8' }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                        InputLabelProps={{ style: { color: '#94a3b8' } }}
                        sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#475569' }, '&:hover fieldset': { borderColor: '#3b82f6' } } }}
                    />
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', fontWeight: 'bold', letterSpacing: 1 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Wait...' : 'Access Portal'}
                    </Button>
                </form>
                <Typography variant="body2" align="center" color="text.secondary">
                    Don't have an account? <span style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate('/register')}>Sign Up</span>
                </Typography>
            </Paper>
        </Box>
    );
};

export default Login;
