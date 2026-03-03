import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  createWebsiteEvent,
  uploadFile,
  updateWebsiteEvent,
} from "../../../src/api/Serviceapi";

const AddEventModal = ({
  open,
  handleClose,
  refreshEvents,
  addEventOptimistic,
  setOverlayLoading,
  editEvent, // ⭐ ADD THIS
}) => {
  const [name, setName] = useState("");
  const [images, setImages] = useState([]); // files
  const [previews, setPreviews] = useState([]); // preview urls
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (editEvent) {
      setName(editEvent.name);
      setImages(editEvent.images || []);
      setPreviews(editEvent.images || []);
    }
  }, [editEvent, open]);
  // 🔹 validate single field
  const validateField = (field, value) => {
    let message = "";

    if (field === "name" && !value.trim()) {
      message = "Event name is required";
    }

    // ⭐ check array length
    if (field === "image" && (!value || value.length === 0)) {
      message = "Event image is required";
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleFile = (e) => {
    const files = Array.from(e.target.files);

    // update images and validate
    setImages((prev) => {
      const updated = [...prev, ...files];
      validateField("image", updated);
      return updated;
    });

    // update previews
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...previewUrls]);
  };
  const removeImage = (index) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      // ✅ validate after delete
      validateField("image", updated.length ? updated : null);

      return updated;
    });

    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };
  const handleNameChange = (e) => {
    setName(e.target.value);
    validateField("name", e.target.value);
  };

  const handleSubmit = async () => {
    validateField("name", name);
    validateField("image", images);

    if (!name || !images.length) return;

    try {
      setOverlayLoading(true);

      // upload all images
      const uploadedUrls = [];

     for (const file of images) {
       // ⭐ if image already URL (edit mode)
       if (typeof file === "string") {
         uploadedUrls.push(file);
       } else {
         const res = await uploadFile(file);
         const url = res?.data?.data?.imageURL;
         if (url) uploadedUrls.push(url);
       }
     }
      // create event with array
      if (editEvent) {
        await updateWebsiteEvent(editEvent.id, {
          eventName: name,
          eventImage: uploadedUrls,
        });
      } else {
        await createWebsiteEvent({
          eventName: name,
          eventImage: uploadedUrls,
        });
      }
      await refreshEvents();
      setOverlayLoading(false);

      handleClose();
      setName("");
      setImages([]);
      setPreviews([]);
      setErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
        {editEvent ? "Edit Event" : "Add Event"}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 10, top: 10 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* IMAGE */}
        <Typography mb={1}>Event Image</Typography>

        <label
          style={{ ...uploadBox, overflow: "hidden", position: "relative" }}
        >
          {previews.length ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img
                    src={src}
                    alt="preview"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />

                  {/* ❌ remove button */}
                  <span
                    onClick={(e) => {
                      e.stopPropagation(); // ⭐ prevents file dialog
                      removeImage(i);
                    }}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      cursor: "pointer",
                      background: "#fff",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: 12,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    ✕
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <span>Upload Image</span>
          )}

          <input
            type="file"
            multiple
            hidden
            onChange={(e) => {
              handleFile(e);
              e.target.value = null; // reset input
            }}
          />
        </label>
        {images.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {images.length} image(s) selected
          </Typography>
        )}

        {errors.image && <ErrorText text={errors.image} />}

        {/* NAME */}
        <TextField
          fullWidth
          label="Event Name"
          value={name}
          onChange={handleNameChange}
          error={!!errors.name}
          helperText={errors.name}
          sx={{ marginTop: 3 }}
        />

        {/* BUTTON */}
        <div style={{ textAlign: "center", marginTop: 25 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              px: 5,
              py: 1.2,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: "0.3px",
              background: "linear-gradient(180deg, #1f4fa3, #0b2c6b)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
              transition: "all .2s ease",
              "&:hover": {
                background: "linear-gradient(180deg, #2458b8, #0d357f)",
                boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              },
            }}
          >
            Submit
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

export default AddEventModal;
