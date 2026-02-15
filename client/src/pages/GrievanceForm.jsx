import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
} from "@mui/material";
import api from "../services/api";
import { motion } from "framer-motion";

const GrievanceForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (image) {
      formData.append("image", image);
    }

    try {
      await api.post("/grievances", formData);
      toast.success("Grievance submitted successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to submit grievance");
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{
        p: 4,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 600,
          borderRadius: 2,
          bgcolor: "background.paper",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom color="primary">
          Submit Grievance
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            variant="outlined"
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#94a3b8" } }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            variant="outlined"
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#94a3b8" } }}
          />
          <TextField
            select
            fullWidth
            label="Category"
            margin="normal"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            variant="outlined"
            InputProps={{ style: { color: "white" } }}
            InputLabelProps={{ style: { color: "#94a3b8" } }}
          >
            <MenuItem value="academic">Academic</MenuItem>
            <MenuItem value="financial">Financial</MenuItem>
            <MenuItem value="harassment">Harassment</MenuItem>
            <MenuItem value="infrastructure">Infrastructure</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>

          <input
            accept="image/*"
            style={{ display: "none" }}
            id="raised-button-file"
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <label htmlFor="raised-button-file">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              sx={{
                mt: 2,
                color: "white",
                borderColor: "rgba(255,255,255,0.3)",
                "&:hover": { borderColor: "rgba(255,255,255,0.5)" },
              }}
            >
              {image ? image.name : "Upload Image (Optional)"}
            </Button>
          </label>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              background: "linear-gradient(to right, #3b82f6, #14b8a6)",
            }}
          >
            Submit Report
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default GrievanceForm;
