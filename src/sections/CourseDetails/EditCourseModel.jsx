import { React, useState, useEffect } from "react";
import { Modal } from "antd";
import styles from "./AddCourse.module.css";
import { editCouse } from "../../api/Serviceapi";
import { toast } from "react-toastify";

const EditCourseModal = ({ visible, onCancel, onUpdate, formData,id }) => {
  const [courseName, setcoursename] = useState("");
  const [duration, setduration] = useState("");
  const [noOfSem, setsemester] = useState("");
  const [admissionFee, setadfee] = useState("");
  const [firstsemFee, setsem1fee] = useState("");
  const [secondSemFee, setsem2fee] = useState("");

  const [coursenameerror, setcoursenameerror] = useState("");
  const [durationerror, setdurationerror] = useState("");
  const [semestererror, setsemestererror] = useState("");
  const [adfeeerror, setadfeeerror] = useState("");
  const [sem1feeerror, setsem1feeerror] = useState("");
  const [sem2feeerror, setsem2feeerror] = useState("");

  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    console.log(formData[0])
   if (formData && formData.length > 0) {
     const course = formData[0];
     setcoursename(course.courseName || "");
     setduration(course.duration || "");
     setsemester(course.noOfSem || "");
     setadfee(course.admissionFee || "");
     setsem1fee(course.firstsemFee || "");
     setsem2fee(course.secondSemFee || "");
   }
  }, [formData, visible]);


  async function handleCreate(e) {
    console.log('clicked')
    e.preventDefault();
    let hasError = false;

    // Course Name
    if (!courseName.trim()) {
      setcoursenameerror(" course name required");
      hasError = true;
    } else if(!/^[A-Za-z\s/]+$/.test(courseName)){
      setcoursenameerror("Course name must contain only alphabets");
      hasError = true;
    }
    else {
      setcoursenameerror("");
    }

    // Duration
    if (!duration.trim()) {
      setdurationerror("duration required");
      hasError = true;
    } else if (!/^\d+$/.test(duration)) {
      setdurationerror(" duration must be a Number");
      hasError = true;
    } else {
      setdurationerror("");
    }

    // Semester
    if (!noOfSem) {
      setsemestererror("no of semester required");
      hasError = true;
    } else if (!/^\d+$/.test(noOfSem)) {
      setsemestererror(" no of semester must be a Number");
      hasError = true;
    } else {
      setsemestererror("");
    }

    // Admission Fee
    if (!admissionFee) {
      setadfeeerror("admission fee required");
      hasError = true;
    } else if (!/^\d+$/.test(admissionFee)) {
      setadfeeerror("admission fee must be a Number");
      hasError = true;
    } else {
      setadfeeerror("");
    }

    // Semester 1 Fee
    if (!firstsemFee) {
      setsem1feeerror("first semester Fee required");
      hasError = true;
    } else if (!/^\d+$/.test(firstsemFee)) {
      setsem1feeerror(" first semester fee must be a Number");
      hasError = true;
    } else {
      setsem1feeerror("");
    }

    // Semester 2 Fee
    if (!secondSemFee) {
      setsem2feeerror("second semester Fee required");
      hasError = true;
    } else if (!/^\d+$/.test(secondSemFee)) {
      setsem2feeerror(" second semester fee must be a number");
      hasError = true;
    } else {
      setsem2feeerror("");
    }

    // Stop submission if any errors
    if (hasError) return;

    // const courseData = {
    //   courseName,
    //   duration,
    //   noOfSem,
    //   admissionFee,
    //   firstsemFee,
    //   secondSemFee,
    // };

    // postCourse(courseData)
    //   .then((response) => {
    //     console.log(response.data);
    //     onCancel();
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
    // const res = await postCourse(courseData);
    // console.log( 'posted data',res.data.data)
    // GetMethod()
    // // Update state in parent here if needed
    // onCancel();
    setLoading(true);
        try {
          // Capitalize first letter of each word
          const formattedCourseName = courseName
            .split(" ")
            .filter((word) => word.trim() !== "") // remove extra spaces
            // .map(
            //   (word) =>
            //     word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            // )
            .join(" ");

          await editCouse(id, {
            courseName: formattedCourseName,
            duration,
            noOfSem,
            admissionFee,
            firstsemFee,
            secondSemFee,
          });

          // Refresh parent data
          onUpdate();
          onCancel();
          toast.success("Course updated successfully!");
        } catch (error) {
          console.error("Error updating course:", error);
        }finally{
          setLoading(false);
        }

  }
  return (
    <Modal
      title={<h2 className={styles.modalTitle}>Edit Course</h2>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={800}
      transitionName=""
      maskTransitionName=""
      modalRender={(modal) => <div className="slide-up-wrapper">{modal}</div>}
    >
      <div className={styles.form}>
        <form onSubmit={handleCreate}>
          <div className={styles.formWrapper}>
            {/* Row 1 */}
            <div className={styles.rowOneGrid}>
              <div className={styles.formGroup}>
                <label>Course Name</label>
                <input
                  type="text"
                  placeholder="Enter Course Name"
                  value={courseName}
                  onChange={(e) => setcoursename(e.target.value)}
                />
                <div className={styles.errorDiv}>
                  <p>{coursenameerror}</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Duration</label>
                <input
                  type="text"
                  placeholder="Enter Duration"
                  value={duration}
                  onChange={(e) => setduration(e.target.value)}
                />
                <div className={styles.errorDiv}>
                  <p>{durationerror}</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>No.of. Semester</label>
                <input
                  type="text"
                  placeholder="Enter no of Semester"
                  value={noOfSem}
                  onChange={(e) => setsemester(e.target.value)}
                />
                <div className={styles.errorDiv}>
                  <p>{semestererror}</p>
                </div>
              </div>
            </div>

            <div className={styles.rowTwoGrid}>
              <div className={styles.formGroup}>
                <label>
                  Admission Fees<span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Admission Fees"
                  value={admissionFee}
                  onChange={(e) => setadfee(e.target.value)}
                />
                <div className={styles.errorDiv}>
                  <p>{adfeeerror}</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>
                  Semester 1 Fees <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Semester 1 Fees"
                  value={firstsemFee}
                  onChange={(e) => setsem1fee(e.target.value)}
                />
                <div className={styles.errorDiv}>
                  <p>{sem1feeerror}</p>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>
                  Semester 2 Fees <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Semester 2 Fees"
                  value={secondSemFee}
                  onChange={(e) => setsem2fee(e.target.value)}
                />
                <div className={styles.errorDiv}>
                  <p>{sem2feeerror}</p>
                </div>
              </div>
            </div>

            <div
              style={{ textAlign: "left", marginTop: "20px", fontSize: "20px" }}
            >
              <button type="submit" className={styles.submitBtn}>
               {loading ? "Updating..." : "Update"} 
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditCourseModal;