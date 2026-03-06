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
import { toast } from "react-toastify";


import { uploadFile, createAlumni,updateAlumni } from "../../api/Serviceapi";

const AlumniModal = ({ open, handleClose, refreshWork, editData }) => {
  const [form, setForm] = useState({
    alumniName: "",
    companyName: "",
    position: "",
    alumniImage: null,
    companyLogo: null,
    alumniImagePreview: null,
    companyLogoPreview: null,
  });
useEffect(() => {
  if (editData) {

    setForm({
      alumniName: editData.alumniName || "",
      companyName: editData.companyName || "",
      position: editData.position || "",
      alumniImage: null,
      companyLogo: null,
      alumniImagePreview: editData.alumniImage || null,
      companyLogoPreview: editData.companyLogo || null,
    });
  } else {
 
    setForm({
      alumniName: "",
      companyName: "",
      position: "",
      alumniImage: null,
      companyLogo: null,
      alumniImagePreview: null,
      companyLogoPreview: null,
    });
  }
}, [editData, open]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setForm((prev) => ({ ...prev, [name]: value }));
  // };
const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));

  // ✅ REMOVE error key completely
  setErrors((prev) => {
    const newErrors = { ...prev };
    delete newErrors[name];
    return newErrors;
  });
};
 
const handleFile = (e, field) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ Allowed file types
  const allowedTypes = ["image/jpeg", "image/png", "image/jfif"];

  if (!allowedTypes.includes(file.type)) {
    alert("Only JPG, PNG, and JFIF images are allowed.");
    e.target.value = ""; // reset input
    return;
  }

  const previewUrl = URL.createObjectURL(file);

  setForm((prev) => ({
    ...prev,
    [field]: file,
    ...(field === "alumniImage" && { alumniImagePreview: previewUrl }),
    ...(field === "companyLogo" && { companyLogoPreview: previewUrl }),
  }));

  // ✅ remove file error
  setErrors((prev) => {
    const newErrors = { ...prev };
    delete newErrors[field];
    return newErrors;
  });
};
 
 const handleSubmit = async () => {
  if (loading) return;
  setLoading(true);

  // const validationErrors = {};

  // Object.entries(form).forEach(([key, value]) => {
  //   if (
  //     (key === "alumniName" || key === "companyName" || key === "position") &&
  //     !value?.trim()
  //   ) {
  //     validationErrors[key] = `${key.replace(/([A-Z])/g, " $1")} is required`;
  //   }

  //   if (
  //     !editData &&
  //     (key === "alumniImage" || key === "companyLogo") &&
  //     !value
  //   ) {
  //     validationErrors[key] = `${key.replace(/([A-Z])/g, " $1")} is required`;
  //   }
  // });

  // setErrors(validationErrors);
  const validationErrors = {};

if (!form.alumniName.trim()) {
  validationErrors.alumniName = "Alumni Name is required";
}

if (!form.companyName.trim()) {
  validationErrors.companyName = "Company Name is required";
}

if (!form.position.trim()) {
  validationErrors.position = "Position is required";
}

if (!editData && !form.alumniImage) {
  validationErrors.alumniImage = "Alumni Image is required";
}

if (!editData && !form.companyLogo) {
  validationErrors.companyLogo = "Company Logo is required";
}

setErrors(validationErrors);
  if (Object.keys(validationErrors).length > 0) {
    setLoading(false);
    return;
  }

  try {
    let alumniImageUrl = editData?.alumniImage;
    let companyLogoUrl = editData?.companyLogo;

    if (form.alumniImage) {
      const imgRes = await uploadFile(form.alumniImage);
      alumniImageUrl = imgRes?.data?.data?.imageURL;
    }

    if (form.companyLogo) {
      const logoRes = await uploadFile(form.companyLogo);
      companyLogoUrl = logoRes?.data?.data?.imageURL;
    }

    const payload = {
      alumniName: form.alumniName,
      companyName: form.companyName,
      position: form.position,
      alumniImage: alumniImageUrl,
      companyLogo: companyLogoUrl,
      model: "alumni",
    };

    if (editData) {
    
      await updateAlumni(editData._id, payload);
      toast.success("Alumni updated successfully ");
    } else {
     
      await createAlumni(payload);
      toast.success("Alumni created successfully ");
    }

    refreshWork();
    handleClose();
  } catch (error) {
    console.error(" Submit error:", error);
    toast.error("Something went wrong ");
  } finally {
    setLoading(false);
  }
};
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
  {editData ? "Edit Alumni" : "Add Alumni"}
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
    
        <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <Typography mb={1}>Alumni Image</Typography>
            <label style={uploadBox}>
              {form.alumniImagePreview ? (
                <img
                  src={form.alumniImagePreview}
                  alt="Alumni"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              ) : (
                "Upload Image"
              )}
              <input
                type="file"
                  accept=".jpg,.jpeg,.png,.jfif"
                hidden
                onChange={(e) => handleFile(e, "alumniImage")}
              />
            </label>
            {errors.alumniImage && <ErrorText text={errors.alumniImage} />}
          </div>

          <div style={{ flex: 1 }}>
            <Typography mb={1}>Company Logo</Typography>
            <label style={uploadBox}>
              {form.companyLogoPreview ? (
                <img
                  src={form.companyLogoPreview}
                  alt="Company Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 10,
                  }}
                />
              ) : (
                "Upload Logo"
              )}
              <input
                type="file"
                hidden
                onChange={(e) => handleFile(e, "companyLogo")}
              />
            </label>
            {errors.companyLogo && <ErrorText text={errors.companyLogo} />}
          </div>
        </div>

      
        <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
          <TextField
            fullWidth
            label="Alumni Name *"
            name="alumniName"
            value={form.alumniName}
            onChange={handleChange}
            error={!!errors.alumniName}
            helperText={errors.alumniName}
          />
          <TextField
            fullWidth
            label="Company Name *"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            error={!!errors.companyName}
            helperText={errors.companyName}
          />
        </div>

     
        <div style={{ marginBottom: 25 }}>
          <TextField
            fullWidth
            label="Position *"
            name="position"
            value={form.position}
            onChange={handleChange}
            error={!!errors.position}
            helperText={errors.position}
          />
        </div>

  
        <div style={{ textAlign: "center" }}>
       <Button
  variant="contained"
  onClick={handleSubmit}
   disabled={loading}
  sx={{
    px: 6,
    borderRadius: 3,
    background: "linear-gradient(180deg, #1f4fa3, #0b2c6b)",
    textTransform: "none",
    fontSize: 16,
  }}
>
  {editData ? "Update" : "Done"}
</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const uploadBox = {
  border: "2px dashed #d1d5db",
  borderRadius: 10,
  height: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
  cursor: "pointer",
  background: "#fafafa",
};

const ErrorText = ({ text }) => (
  <p style={{ color: "#d32f2f", fontSize: 12, marginTop: 5 }}>{text}</p>
);

export default AlumniModal; 