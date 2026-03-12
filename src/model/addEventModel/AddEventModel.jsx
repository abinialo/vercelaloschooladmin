import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Typography,
  TextField
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import {
  createWebsiteEvent,
  uploadFile,
  updateWebsiteEvent,
} from "../../../src/api/Serviceapi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const AddEventModal = ({
  open,
  handleClose,
  refreshEvents,
  setOverlayLoading,
  editEvent,
}) => {

  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const [showAll, setShowAll] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editEvent) {
      setName(editEvent.name || "");
      setImages(editEvent.images || []);
      setPreviews(editEvent.images || []);
    } else {
      setName("");
      setImages([]);
      setPreviews([]);
      setErrors({});
      setShowAll(false);
    }
  }, [editEvent, open]);

  const validateField = (field, value) => {

    let message = "";

    if (field === "name" && !value.trim()) {
      message = "Event name is required";
    }

    if (field === "image" && (!value || value.length === 0)) {
      message = "Event image is required";
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const openFileBrowser = () => {
    fileInputRef.current.click();
  };

  const handleFile = (e) => {

    const files = Array.from(e.target.files);

    const allowedTypes = ["image/jpeg", "image/png", "image/jfif"];

    const validFiles = files.filter((file) =>
      allowedTypes.includes(file.type)
    );

    if (validFiles.length !== files.length) {
      toast.error("Only JPG, JPEG, PNG, and JFIF images are allowed.");
    }

    if (validFiles.length === 0) return;

    setImages((prev) => {
      const updated = [...prev, ...validFiles];
      validateField("image", updated);
      return updated;
    });
    

    const previewUrls = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews((prev) => [...prev, ...previewUrls]);

    setShowAll(false);
  };

  const removeImage = (index) => {

    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
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

      setSubmitting(true);
      setOverlayLoading(true);

      const uploadedUrls = [];

      for (const file of images) {

        if (typeof file === "string") {
          uploadedUrls.push(file);
        } else {

          const res = await uploadFile(file);
          const url = res?.data?.data?.imageURL;

          if (url) uploadedUrls.push(url);
        }
      }

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

      handleClose();

      setName("");
      setImages([]);
      setPreviews([]);
      setErrors({});

    } catch (err) {

      console.error(err);

    } finally {

      setSubmitting(false);
      setOverlayLoading(false);
    }
  };
const handleDragEnd = (result) => {

  if (!result.destination) return;

  const newImages = Array.from(images);
  const newPreviews = Array.from(previews);

  const [removedImage] = newImages.splice(result.source.index, 1);
  const [removedPreview] = newPreviews.splice(result.source.index, 1);

  newImages.splice(result.destination.index, 0, removedImage);
  newPreviews.splice(result.destination.index, 0, removedPreview);

  setImages(newImages);
  setPreviews(newPreviews);
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

  <Typography mb={1}>Event Image</Typography>

  <div style={uploadBox} onClick={openFileBrowser}>

    {previews.length ? (

 <DragDropContext
  onDragStart={() => setIsDragging(true)}
  onDragEnd={(result) => {
    setIsDragging(false);
    handleDragEnd(result);
  }}
>
        <Droppable droppableId="imageList" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
            >

              {(showAll ? previews : previews.slice(0, 2)).map((src, i) => (

                <Draggable
                  key={`img-${i}`}
                  draggableId={`img-${i}`}
                  index={i}
                >
                  {(provided) => (
                    <div
  ref={provided.innerRef}
  {...provided.draggableProps}
  {...provided.dragHandleProps}
  onClick={(e) => {
    e.stopPropagation();
    openFileBrowser();
  }}
  style={{
    position: "relative",
    ...provided.draggableProps.style
  }}
>

                     <img
  src={src}
  alt="preview"
  onClick={(e) => {
    e.stopPropagation();
    if (!isDragging) {
      openFileBrowser();
    }
  }}
  style={{
    width: 80,
    height: 80,
    objectFit: "cover",
    borderRadius: 8,
    cursor: "grab"
  }}
/>

                      <span
                        onClick={(e) => {
                          e.stopPropagation();
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
                  )}
                </Draggable>

              ))}

              {provided.placeholder}

              {!showAll && previews.length > 2 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(true);
                  }}
                  style={{
                    width: 80,
                    height: 80,
                    background: "#e2e8f0",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  +{previews.length - 2}
                </div>
              )}

            </div>
          )}
        </Droppable>
      </DragDropContext>

    ) : (
      <span>Upload Image</span>
    )}

  </div>

  <input
    ref={fileInputRef}
    type="file"
    multiple
    accept=".jpg,.jpeg,.png,.jfif"
    hidden
    onChange={(e) => {
      handleFile(e);
      e.target.value = null;
    }}
  />

  {images.length > 0 && (
    <Typography variant="caption" color="text.secondary">
      {images.length} image(s) selected
    </Typography>
  )}

  {errors.image && <ErrorText text={errors.image} />}

  <TextField
    fullWidth
    label="Event Name"
    value={name}
    onChange={handleNameChange}
    error={!!errors.name}
    helperText={errors.name}
    sx={{ marginTop: 3 }}
  />

  <div style={{ textAlign: "center", marginTop: 25 }}>

    <Button
      variant="contained"
      onClick={handleSubmit}
      disabled={submitting}
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
      }}
    >

      {submitting ? (
        <CircularProgress size={22} sx={{ color: "#fff" }} />
      ) : (
        "Submit"
      )}

    </Button>

  </div>

</DialogContent>

    </Dialog>
  );
};

const uploadBox = {
  border: "2px dashed #e5e7eb",
  borderRadius: 12,
  minHeight: 120,
  padding: 10,
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