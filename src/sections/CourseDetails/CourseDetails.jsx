import React, { useEffect, useState } from "react";
import styles from "./courseDetails.module.css";
import { FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"; // ⬅️ New import for the back arrow icon
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import nodata from '../../assets/nodata.jpg'
import Skeleton from '@mui/material/Skeleton';
import { useParams, useNavigate, Link } from "react-router-dom"; // ⬅️ useNavigate is already here
import {
  getCourseById,
  getCourseBatch,
  updateCourseBatch,
  getCourseBatchByCourseId,
} from "../../api/Serviceapi";
import { toast, ToastContainer } from 'react-toastify';
import { FaArrowRightLong } from "react-icons/fa6";


import EditCourseModal from "./EditCourseModel";
import CreateBatchModal from "./CreateBatchModal";
import Pagination from "@mui/material/Pagination";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Loader from "../../component/loader/Loader";
import Modal from 'react-modal';

const theme = createTheme({
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          color: "#1f2937",
          "&.Mui-selected": {
            background: "linear-gradient(to bottom, #144196, #061530)",
            color: "#fff",
            border: "none",
          },
          "&:hover": {
            backgroundColor: "#f3f4f6",
          },
        },
      },
    },
  },
});

const CourseDetails = () => {
  const [limit, setLimit] = useState(4);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  // Calculate visible range
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalItems);
  const { id } = useParams();
  const navigate = useNavigate(); // ⬅️ Initialize useNavigate
  const [formData, setFormData] = useState([]);
  const [editTable, setEditTable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [totalstudent, settotalstudent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [courseloading, setCourseLoading] = useState(false);

  const goBack = () => {
    navigate(-1);
  };

  const handlePageChange = (event, value) => {
    setBatches([]);
    setPage(value);
    fetchBatch(value);
  };

  useEffect(() => {
    const totalPages = Math.ceil(totalItems / limit);
    setTotalPages(totalPages);
  }, [totalItems, limit]);

  // Fetch course details
  const fetchCourse = async () => {
    setCourseLoading(true);
    try {
      const res = await getCourseById(id);
      setFormData(res.data.data.data || []);
      settotalstudent(res.data.data.studentTotalCount);
    } catch (err) {
      console.error("Error fetching course:", err);
    } finally {
      setCourseLoading(false);
    }
  };
  useEffect(() => {
    fetchCourse();
  }, [id]);

  // Fetch batches
  const fetchBatch = async () => {
    try {
      setLoading(true);
      const offset = (page - 1);
      const res = await getCourseBatchByCourseId(id, limit, offset);
      setBatches(res.data.data.data || []);
      setTotalItems(res?.data?.data?.totalCount);
    } catch (err) {
      console.error("Error fetching batch:", err);
    } finally {
      setLoading(false);
    }
  };
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    fetchBatch();
  }, [id, page, limit]);

  const handleEdit = () => {
    formData.map((ele) => {
      if (ele.studentCount >= 0) {
        setEditTable(true);
      } else return;
    });
  };

  const handleEditCards = (batchId) => {
    const batchToEdit = batches.find((b) => b._id === batchId);
    setSelectedBatch(batchToEdit);
    setShowModal(true);
  };

  const handleDeleteCards = async (batch) => {
    try {
      await updateCourseBatch(batch._id, { ...batch, deleted: true });
      setBatches((prev) => prev.filter((b) => b._id !== batch._id));
      console.log("Batch marked as deleted:", batch._id);
    } catch (err) {
      console.error("Error deleting batch:", err);
    }
  };

  const [delid, setId] = useState([])


  return (
    <div className={styles.container}>
      <ToastContainer />

      {/* ⬅️ Updated Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={goBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <p>Course Details</p>
      </div>

      {/* Course Info Table */}
      <div className={styles.diplomatable}>
        <div className={styles.tablehead}>
          <p className={styles.tableheadpara}>
            {formData.length > 0 ? formData[0].courseName : <Skeleton variant="text" width={80} height={40} />}
          </p>
          <div className={styles.tableheadicon} onClick={handleEdit}>
            <FaPencilAlt className={styles.tableheadiconsvg} /> Edit
          </div>
        </div>

        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Duration</th>
                <th>Semesters</th>
                <th>Total Students</th>
                <th>Ongoing Students</th>
                <th>Admission Fees</th>
                <th>Sem 1 Fee</th>
                <th>Sem 2 Fee</th>
              </tr>
            </thead>
            {courseloading ?
              <tr >
                <td><Skeleton variant="text" width={80} height={25} /></td>
                <td><Skeleton variant="text" width={80} height={25} /></td>
                <td><Skeleton variant="text" width={80} height={25} /></td>
                <td><Skeleton variant="text" width={80} height={25} /></td>
                <td><Skeleton variant="text" width={80} height={25} /></td>
                <td><Skeleton variant="text" width={80} height={25} /></td>
                <td><Skeleton variant="text" width={80} height={25} /></td>
              </tr>
              :
              <tbody>
                {formData.map((course) => (
                  <tr key={course._id}>
                    <td>{course.duration}</td>
                    <td>{course.noOfSem}</td>
                    <td>{totalstudent}</td>
                    <td>{course.studentCount}</td>
                    <td>{course.admissionFee}</td>
                    <td>{course.firstsemFee}</td>
                    <td>{course.secondSemFee}</td>
                  </tr>
                ))}
              </tbody>

            }

          </table>
        </div>
        <EditCourseModal
          visible={editTable}
          onCancel={() => setEditTable(false)}
          formData={formData}
          id={id}
          onUpdate={fetchCourse}
        />
      </div>

      {/* Batches Section */}
      <div className={styles.diplomacard}>
        <div className={styles.cardcreate}>
          <p className={styles.header}>Batches</p>
          <div className={styles.createbtn} onClick={() => setShowModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Create Batch
          </div>
        </div>

        <div className={styles.cards}>
          {loading ? (
            <div className={'col-span-4'}><Loader /></div>
          ) : batches.length > 0 ? (
            batches.map((batch) => {
              const isComplete = new Date(batch.endDate) < new Date();
              return (
                <div className={styles.divcards} key={batch._id}>
                  <div className="flex justify-between items-center">
                    <p className={styles.divcardspara1}>{batch.batchName}</p>
                    <Link to={`/course/Subjects/${id}/${batch._id}`}>
                      <FaArrowRightLong />
                    </Link>
                  </div>
                  <p className={styles.divcardspara2}>
                    No of Students : {batch.noOfStudents}
                  </p>
                  <div className={styles.datesection}>
                    <div>
                      <p className={styles.datesectionpara1}>Sem 1 Fee Date</p>
                      <p className={styles.datesectionpara2}>
                        {new Date(batch.sem1PayDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className={styles.datesectionpara1}>Sem 2 Fee Date</p>
                      <p className={styles.datesectionpara2}>
                        {new Date(batch.sem2PayDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={styles.iconsection}>
                    <div className={styles.icondiv}>
                      <div
                        className={styles.iconsectionsvg}
                        onClick={() => handleEditCards(batch._id)}
                      >
                        <FaPencilAlt className={styles.tableheadiconsvg} />
                      </div>
                      <div
                        className={styles.iconsectionsvg}
                        // onClick={() => handleDeleteCards(batch._id)}
                        onClick={() => { setDeleteOpen(true), setId(batch) }}
                      >
                        <FaTrash color="red" />
                      </div>
                    </div>

                    <div
                      className={`${styles.tableheadstatus} ${isComplete ? styles.complete : styles.ongoing
                        }`}
                    >
                      {isComplete ? "Completed" : "Ongoing"}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex justify-center col-span-4 h-[200px] items-center w-full my-auto flex-col text-gray-500 font-semibold">
              <img src={nodata} alt="No Data" className="w-[200px] h-[200px]" />
              <p>No Data Found</p>

            </div>)}
        </div>

        <div className='flex justify-between items-end ms-auto w-[50%]'>

          {totalPages > 0 && (
            <ThemeProvider theme={theme}>
              <div className="flex justify-end mt-4">
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                />
              </div>
            </ThemeProvider>
          )}
          {totalPages > 0 &&
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                Showing {startIndex} – {endIndex} of {totalItems} Batches
              </p>
            </div>
          }
        </div>
      </div>

      {/* Edit Course Modal */}
      <EditCourseModal
        visible={editTable}
        onCancel={() => setEditTable(false)}
        formData={formData}
        id={id}
        onUpdate={fetchCourse}
      />

      {/* Create/Edit Batch Modal */}
      <CreateBatchModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBatch(null);
        }}
        id={id}
        batchData={selectedBatch}
        onBatchCreated={fetchBatch}
      />



      <Modal
        isOpen={deleteOpen}
        onRequestClose={() => setDeleteOpen(true)}
        contentLabel="Delete Student"
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgb(21 21 21 / 81%)', // gray overlay
            zIndex: 1000,
          },
          content: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '3rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: 'max-content',
            height: 'max-content',
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1001,
          },
        }}
      >
        {/* <Addstudent closeModal={() => setIsOpen(false)} onStudentAdded={getuserlist} /> */}
        <p className={styles.popmessage}>Are you sure you want to delete this batch</p>
        <div className='flex gap-4 justify-center mt-10'>
          <button onClick={() => { setDeleteOpen(false), handleDeleteCards(delid) }}
            className={styles.popyes} >Yes</button>
          <button className={styles.popno} onClick={() => setDeleteOpen(false)}>No</button>
        </div>
      </Modal>
    </div>


  );
};

export default CourseDetails;