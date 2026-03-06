import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { uploadFile, createStudentWork, updateStudentWork } from "../../../src/api/Serviceapi";

const AddWorkModel = ({ open, handleClose, refreshWork, editData }) => {
  const [form, setForm] = useState({
    name: "",
    position: "",
    behance: "",
    profile: null,
    thumbnail: null,
  });

  const [preview, setPreview] = useState({ profile: "", thumbnail: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize form and preview if editing
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || editData.alumniName || "",
        position: editData.position || "",
        behance: editData.behance || editData.link || "",
        profile: null,
        thumbnail: null,
      });
      setPreview({
        profile: editData.profile || editData.alumniImage || "",
        thumbnail: editData.thumbnail || editData.thumbnailImage || "",
      });
    } else {
      setForm({
        name: "",
        position: "",
        behance: "",
        profile: null,
        thumbnail: null,
      });
      setPreview({ profile: "", thumbnail: "" });
    }
    setErrors({});
  }, [editData, open]);

  // Field validation
  const validateField = (field, value) => {
    let message = "";
    if (field === "name" && !value.trim()) message = "Name is required";
    if (field === "position" && !value.trim()) message = "Position is required";
    if (field === "behance") {
      if (!value.trim()) message = "Behance URL is required";
      else if (!/^https?:\/\/.+\..+/.test(value)) message = "Enter valid URL";
    }
    if (!editData) {
      if (field === "profile" && !value) message = "Profile image required";
      if (field === "thumbnail" && !value) message = "Thumbnail required";
    }
    setErrors((prev) => ({ ...prev, [field]: message }));
    return message === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

 const handleFile = (e, field) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ allowed image types
  const allowedTypes = ["image/jpeg", "image/png", "image/jfif"];

  if (!allowedTypes.includes(file.type)) {
    alert("Only JPG, JPEG, PNG, and JFIF images are allowed.");
    e.target.value = ""; // reset input
    return;
  }

  setForm((prev) => ({ ...prev, [field]: file }));

  setPreview((prev) => ({
    ...prev,
    [field]: URL.createObjectURL(file),
  }));

  validateField(field, file);
};

 const handleSubmit = async () => {
  if (loading) return;
  setLoading(true);

  // 🔥 Validate ALL fields (NO short-circuit)
  const validationResults = [
    validateField("name", form.name),
    validateField("position", form.position),
    validateField("behance", form.behance),
    !editData ? validateField("profile", form.profile) : true,
    !editData ? validateField("thumbnail", form.thumbnail) : true,
  ];

  const isValid = validationResults.every(Boolean);

  if (!isValid) {
    setLoading(false);
    return;
  }

  try {
    let profileUrl = preview.profile;
    let thumbUrl = preview.thumbnail;

    if (form.profile) {
      const profileRes = await uploadFile(form.profile);
      profileUrl = profileRes?.data?.data?.imageURL || profileUrl;
    }

    if (form.thumbnail) {
      const thumbRes = await uploadFile(form.thumbnail);
      thumbUrl = thumbRes?.data?.data?.imageURL || thumbUrl;
    }

    const payload = {
      alumniName: form.name,
      position: form.position,
      link: form.behance,
      alumniImage: profileUrl,
      thumbnailImage: thumbUrl,
      companyName: "Alo",
      model: "work",
    };

    if (editData) {
      await updateStudentWork(editData._id || editData.id, payload);
      toast.success("Student work updated successfully!");
    } else {
      await createStudentWork(payload);
      toast.success("Student work created successfully!");
    }

    refreshWork();
    handleClose();
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
        {editData ? "Edit Student Work" : "Add Student Work"}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ position: "relative" }}>
   
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              backdropFilter: "blur(2px)",
            }}
          >
            <CircularProgress />
          </Box>
        )}

 
        <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <Typography mb={1}>Profile Image</Typography>
            <label style={uploadBox}>
              {preview.profile ? (
                <img
                  src={preview.profile}
                  alt="profile preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
                />
              ) : (
                "Upload Profile"
              )}
              <input type="file" hidden  accept=".jpg,.jpeg,.png,.jfif" onChange={(e) => handleFile(e, "profile")} />
            </label>
            {errors.profile && <ErrorText text={errors.profile} />}
          </div>

          <div style={{ flex: 1 }}>
            <Typography mb={1}>Thumbnail</Typography>
            <label style={uploadBox}>
              {preview.thumbnail ? (
                <img
                  src={preview.thumbnail}
                  alt="thumbnail preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
                />
              ) : (
                "Upload Thumbnail"
              )}
              <input type="file" hidden accept=".jpg,.jpeg,.png,.jfif" onChange={(e) => handleFile(e, "thumbnail")} />
            </label>
            {errors.thumbnail && <ErrorText text={errors.thumbnail} />}
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 22 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            label="Position"
            name="position"
            value={form.position}
            onChange={handleChange}
            error={!!errors.position}
            helperText={errors.position}
          />
        </div>

       
        <div style={{ marginBottom: 24 }}>
          <TextField
            fullWidth
            label="Behance URL"
            name="behance"
            value={form.behance}
            onChange={handleChange}
            error={!!errors.behance}
            helperText={errors.behance}
          />
        </div>

        
        <div style={{ textAlign: "center" }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              px: 6,
              py: 1.2,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.3px",
              background: "linear-gradient(180deg, #1f4fa3, #0b2c6b)",
              "&:hover": { background: "linear-gradient(180deg, #2458b8, #0d357f)" },
            }}
          >
            {loading ? (editData ? "Updating..." : "Submitting...") : editData ? "Update" : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const uploadBox = {
  border: "2px dashed #e5e7eb",
  borderRadius: 12,
  height: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8",
  cursor: "pointer",
  background: "#f8fafc",
};

const ErrorText = ({ text }) => (
  <p style={{ color: "#d32f2f", fontSize: 12, marginTop: 6 }}>{text}</p>
);

export default AddWorkModel;