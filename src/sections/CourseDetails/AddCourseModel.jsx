import React, { useState } from "react";
import { Modal } from "antd";
import styles from "./AddCourse.module.css";
import { postCourse } from "../../api/Serviceapi";
import { toast, ToastContainer } from 'react-toastify';

const AddCourseModal = ({ visible, onCancel, GetMethod, existingCourses }) => {
  const [courseName, setCourseName] = useState("");
  const [duration, setDuration] = useState("");
  const [noOfSem, setNoOfSem] = useState("");
  const [admissionFee, setAdmissionFee] = useState("");
  const [firstSemFee, setFirstSemFee] = useState("");
  const [secondSemFee, setSecondSemFee] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState("");

  // Error states
  const [courseNameError, setCourseNameError] = useState("");
  const [durationError, setDurationError] = useState("");
  const [semesterError, setSemesterError] = useState("");
  const [adFeeError, setAdFeeError] = useState("");
  const [sem1FeeError, setSem1FeeError] = useState("");
  const [sem2FeeError, setSem2FeeError] = useState("");

  // Validation functions
  const validateCourseName = (value) => {
    if (!value.trim()) {
      return "Course name required";
    }
    else if (value && !/^[A-Za-z\s/]+$/.test(value)) {
      return "Course name can contain only letters, spaces, and '/'";
    }

    return "";
    
  };

  const CourseNamevalidate = (value) => {
    error = "";
    if (!value.trim()) {
      error= "Course name required";
    }
    else if (!/^[A-Za-z\s/]+$/.test(value))  {
     error= "Course name can contain only letters, spaces, and '/'";
    }

    setCourseNameError(error); 
  };

  const validateNumber = (value, fieldName) => {
    if (!value.trim()) return `${fieldName} required`;
    if (!/^\d+$/.test(value)) return `${fieldName} must be a Number`;
    return "";
  };

  // OnChange handlers
  const handleCourseNameChange = (e) => {
    setCourseName(e.target.value);
    // setCourseNameError("");
    setDuplicate("");
  };

  const handleDurationChange = (e) => {
    setDuration(e.target.value);
    setDurationError("");
  };

  const handleSemesterChange = (e) => {
    setNoOfSem(e.target.value);
    setSemesterError("");
  };

  const handleAdFeeChange = (e) => {
    setAdmissionFee(e.target.value);
    setAdFeeError("");
  };

  const handleSem1FeeChange = (e) => {
    setFirstSemFee(e.target.value);
    setSem1FeeError("");
  };

  const handleSem2FeeChange = (e) => {
    setSecondSemFee(e.target.value);
    setSem2FeeError("");
  };

  // Submit handler
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    // Validate fields
    const nameErr = validateCourseName(courseName, "Course Name");
    const durationErr = validateNumber(duration, "Duration");
    const semErr = validateNumber(noOfSem, "No of Semester");
    const adErr = validateNumber(admissionFee, "Admission Fee");
    const sem1Err = validateNumber(firstSemFee, "First Semester Fee");
    const sem2Err = validateNumber(secondSemFee, "Second Semester Fee");

    setCourseNameError(nameErr);
    setDurationError(durationErr);
    setSemesterError(semErr);
    setAdFeeError(adErr);
    setSem1FeeError(sem1Err);
    setSem2FeeError(sem2Err);

    if (nameErr || durationErr || semErr || adErr || sem1Err || sem2Err) return;

    // Format course name
    const formattedCourseName = courseName
      .trim()
      .split(" ")
      .filter((word) => word.length > 0)
      // .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // Check for duplicates
    const isDuplicate = existingCourses?.some(
      (course) =>
        course.courseName.toLowerCase() === formattedCourseName.toLowerCase()
    );

    if (isDuplicate) {
      setDuplicate(
        "This course already exists. Please enter a different name."
      );
      return;
    }

    try {
      setIsDisabled(true);

      const courseData = {
        courseName: formattedCourseName,
        duration,
        noOfSem,
        admissionFee,
        firstsemFee: firstSemFee,
        secondSemFee,
      };

      const res = await postCourse(courseData);
      console.log("Posted data:", res.data.data);

      GetMethod(); // refresh the table after adding

      // Reset form
      setCourseName("");
      setDuration("");
      setNoOfSem("");
      setAdmissionFee("");
      setFirstSemFee("");
      setSecondSemFee("");
      setDuplicate("");
      onCancel();
      toast.success("Course added successfully!");
    } catch (error) {
      console.error("Error posting course:", error);
    } finally {
      setIsDisabled(false);
     
    }
  };
  const handleCancel = () => {
    // Reset all form fields
    setCourseName("");
    setDuration("");
    setNoOfSem("");
    setAdmissionFee("");
    setFirstSemFee("");
    setSecondSemFee("");
    setDuplicate("");
    setCourseNameError("");
    setDurationError("");
    setSemesterError("");
    setAdFeeError("");
    setSem1FeeError("");
    setSem2FeeError("");
    setSubmitted(false);

    // Call the parent onCancel
    onCancel();
  };


  return (
    <Modal
      title={<h2 className={styles.modalTitle}>Add Course</h2>}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      centered
      width={800}
    >
      <form className={styles.form} onSubmit={handleCreate}>
        <div className={styles.formWrapper}>
          {/* Row 1 */}
          <div className={styles.rowOneGrid}>
            <div className={styles.formGroup}>
              <label>Course Name<span className={styles.required}>*</span></label>
              <input
                type="text"
                placeholder="Enter Course Name"
                value={courseName}
                onChange={(e) => {handleCourseNameChange(e),CourseNamevalidate(e.target.value)}}
              />
              <div className={styles.errorDiv}>
{courseNameError && <span className="error">{courseNameError}</span>}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Duration (in year)<span className={styles.required}>*</span></label>
              <input
                type="text"
                placeholder="Enter Duration"
                value={duration}
                onChange={handleDurationChange}
              />
              <div className={styles.errorDiv}>
                <p>{durationError}</p>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>No. of Semester<span className={styles.required}>*</span></label>
              <input
                type="text"
                placeholder="Enter no of Semester"
                value={noOfSem}
                onChange={handleSemesterChange}
              />
              <div className={styles.errorDiv}>
                <p>{semesterError}</p>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className={styles.rowTwoGrid}>
            <div className={styles.formGroup}>
              <label>
                Admission Fees<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Admission Fees"
                value={admissionFee}
                onChange={handleAdFeeChange}
              />
              <div className={styles.errorDiv}>
                <p>{adFeeError}</p>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>
                Semester 1 Fees<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Semester 1 Fees"
                value={firstSemFee}
                onChange={handleSem1FeeChange}
              />
              <div className={styles.errorDiv}>
                <p>{sem1FeeError}</p>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>
                Semester 2 Fees<span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Semester 2 Fees"
                value={secondSemFee}
                onChange={handleSem2FeeChange}
              />
              <div className={styles.errorDiv}>
                <p>{sem2FeeError}</p>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div
            style={{ textAlign: "left", marginTop: "20px", fontSize: "20px" }}
          >
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isDisabled}
              style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
            >
              {isDisabled ? "Creating..." : "Create"}
            </button>
          </div>

          {/* Duplicate warning */}
          {duplicate && (
            <div
              style={{
                color: "red",
                fontSize: "14px",
                marginTop: "5px",
                textAlign: "left",
              }}
            >
              <p>{duplicate}</p>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AddCourseModal;
