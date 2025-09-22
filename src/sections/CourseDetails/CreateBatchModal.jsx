import React, { useState, useEffect } from "react";
import styles from "./CreateBatchModel.module.css";
import { postCourseBatch } from "../../api/Serviceapi";
import { updateCourseBatch } from "../../api/Serviceapi";
import { toast } from "react-toastify";


const CreateBatchModal = ({
  visible,
  onClose,
  id,
  onBatchCreated,
  batchData,
}) => {
  const [formData, setFormData] = useState({
    batchName: "",
    startDate: "",
    endDate: "",
    sem1FeeDate: "",
    sem2FeeDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const formatDate = (isoString) => {
      if (!isoString) return "";
      const date = new Date(isoString);
      // Get yyyy-MM-dd
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    if (batchData) {
      setFormData({
        batchName: batchData.batchName || "",
        startDate: formatDate(batchData.startDate),
        endDate: formatDate(batchData.endDate),
        sem1FeeDate: formatDate(batchData.sem1PayDate),
        sem2FeeDate: formatDate(batchData.sem2PayDate),
      });
    } else {
      setFormData({
        batchName: "",
        startDate: "",
        endDate: "",
        sem1FeeDate: "",
        sem2FeeDate: "",
      });
    }
  }, [batchData]);



  const [errors, setErrors] = useState({});

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for the current field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    let newErrors = {};

    // Required fields
    if (!formData.batchName.trim())
      newErrors.batchName = "Batch name is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.sem1FeeDate)
      newErrors.sem1FeeDate = "Sem1 Fee Date is required";
    if (!formData.sem2FeeDate)
      newErrors.sem2FeeDate = "Sem2 Fee Date is required";

    // Date logic (batch duration)
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    // Fee Dates validation
    if (formData.sem1FeeDate) {
      if (
        new Date(formData.sem1FeeDate) < new Date(formData.startDate) ||
        new Date(formData.sem1FeeDate) > new Date(formData.endDate)
      ) {
        newErrors.sem1FeeDate = "Sem1 Fee Date must be within batch duration";
      }
    }

    if (formData.sem2FeeDate) {
      if (
        new Date(formData.sem2FeeDate) < new Date(formData.startDate) ||
        new Date(formData.sem2FeeDate) > new Date(formData.endDate)
      ) {
        newErrors.sem2FeeDate = "Sem2 Fee Date must be within batch duration";
      }
    }

    // Sem2 after Sem1
    if (formData.sem1FeeDate && formData.sem2FeeDate) {
      if (new Date(formData.sem2FeeDate) <= new Date(formData.sem1FeeDate)) {
        newErrors.sem2FeeDate = "Sem2 Fee Date must be after Sem1 Fee Date";
      }
    }

    return newErrors;
  };


  const handleSubmit = async () => {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
    setIsLoading(true);
    try {

      const formattedCourseName = formData.batchName
        .trim()
        .split(" ")
        .filter((word) => word.length > 0) // remove extra spaces
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      // ✅ map frontend keys to backend keys
      const payload = {
        batchName: formattedCourseName,
        courseId: id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        sem1PayDate: formData.sem1FeeDate,
        sem2PayDate: formData.sem2FeeDate,
      };


      console.log("Submitting batch:", payload);
      let res;
      if (batchData) {
        const updatePayload = {
          batchName: formData.batchName,
          startDate: formData.startDate,
          endDate: formData.endDate,
          sem1PayDate: formData.sem1FeeDate,
          sem2PayDate: formData.sem2FeeDate,
        };

        const resedit = await updateCourseBatch(batchData._id, updatePayload);
        console.log("Update response:", resedit);
        toast.success("Batch updated successfully!");

      } else {
        res = await postCourseBatch(payload);
        console.log("Batch created:", res.data.data);
        toast.success("Batch created successfully!");
      }
      if (onBatchCreated) onBatchCreated();

      // ✅ reset form
      setFormData({
        batchName: "",
        startDate: "",
        endDate: "",
        sem1FeeDate: "",
        sem2FeeDate: "",
      });
      onClose();
    } catch (err) {
      console.error("Error creating batch:", err);
    } finally {
      setIsLoading(false);
    }

  };
  const resetForm = () => {
    setFormData({
      batchName: "",
      startDate: "",
      endDate: "",
      sem1FeeDate: "",
      sem2FeeDate: "",
    });
    setErrors({});
  };
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h2 className={styles.modalTitle}>
          {batchData ? "Edit Batch" : "Create Batch"}
        </h2>
        <button className={styles.closeBtn}
          onClick={() => {
            onClose()
            resetForm();

          }}>
          ×
        </button>

        <div className={styles.formWrapper}>
          <div className={styles.rowSingle}>
            <div className={styles.formGroup}>
              <label>
                Batch Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="batchName"
                value={formData.batchName}
                onChange={handleChange}
                placeholder="Enter Batch Name"
                className={errors.batchName ? styles.errorInput : ""}
              />
              {errors.batchName && (
                <div className={styles.errorDiv}>{errors.batchName}</div>
              )}
            </div>
          </div>

          <div className={styles.rowTwoGrid}>
            <div className={styles.formGroup}>
              <label>
                Start Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? styles.errorInput : ""}
              />
              {errors.startDate && (
                <div className={styles.errorDiv}>{errors.startDate}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>
                End Date <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate}
                onChange={handleChange}
                className={errors.endDate ? styles.errorInput : ""}
              />
              {errors.endDate && (
                <div className={styles.errorDiv}>{errors.endDate}</div>
              )}
            </div>
          </div>

          <div className={styles.rowTwoGrid}>
            <div className={styles.formGroup}>
              <label>Semester 1 Fee Date<span className={styles.required}>*</span></label>
              <input
                type="date"
                name="sem1FeeDate"
                value={formData.sem1FeeDate}
                onChange={handleChange}
              />
              {errors.sem1FeeDate && (
                <div className={styles.errorDiv}>{errors.sem1FeeDate}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Semester 2 Fee Date<span className={styles.required}>*</span></label>
              <input
                type="date"
                name="sem2FeeDate"
                value={formData.sem2FeeDate}
                onChange={handleChange}
              />
              {errors.sem2FeeDate && (
                <div className={styles.errorDiv}>{errors.sem2FeeDate}</div>
              )}
            </div>
          </div>
          {isLoading ? (<div className={styles.loader}>
            {batchData ?
              <button
                type="button"
                className={styles.submitBtn}

              >
                Updating....
              </button>
              :
              <button type="button" className={styles.submitBtn}>Creating...</button>

            }
          </div>) :

            <button
              type="button"
              className={styles.submitBtn}
              onClick={handleSubmit}
            >
              {batchData ? "Update" : "Create"}
            </button>
          }

          </div>
      </div>
      </div>
      );
};

      export default CreateBatchModal;
