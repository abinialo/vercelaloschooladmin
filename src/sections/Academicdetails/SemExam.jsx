import React, { useEffect, useState } from "react";
import styles from "./TermExam.module.css";
import Pagination from '@mui/material/Pagination';
import {
  getPerformance,
  getCourse,
  getCourseBatchByCourseId,
  getUser,
} from "../../api/Serviceapi";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { IoIosCloseCircle } from "react-icons/io";

const theme = createTheme({
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          color: '#1f2937', // text-gray-800
          '&.Mui-selected': {
            background: 'linear-gradient(to bottom, #144196, #061530)',
            color: '#fff',
            border: 'none',
          },
          '&:hover': {
            backgroundColor: '#f3f4f6', // hover:bg-gray-100
          },
        },
      },
    },
  },
});
const Sem = () => {
  const [performance, setPerformance] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [semester, setSemester] = useState("");
  const [academic, setAcademic] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  // const [page, setPage] = useState(1);
  // const rowsPerPage = 5;

  const [limit, setlimit] = useState(8);
  const [totaluser, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);

  const startIndex = (offset - 1) * limit + 1;
  const endIndex = Math.min(offset * limit, totaluser);

  const handlePageChange = (event, value) => {
    if (value !== offset) {
      setoffset(value);
    } else {
      fetchPerformance(); // reload if same page clicked
    }
  };

  useEffect(() => {
    const totalPages = Math.ceil(totaluser / limit);
    setpage(totalPages);
  }, [totaluser, limit]);

  const handlefilterSearch = () => {
    setCourseId('');
    setBatchId('');
    setSearch('');
    setSemester('');
    setAcademic('');

  };

  useEffect(() => {
    fetchCourses();
    // fetchPerformance();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchPerformance();
  }, [search, courseId, batchId, semester, offset, academic]);

  const fetchUsers = async (value = "", cId = "", bId = "") => {
    try {
      const res = await getUser(100, 0, value, cId, "", bId, "");
      setUsers(res?.data?.data?.data || []);
    } catch (err) {
      console.error("User fetch error", err);
    }
  };

  const fetchPerformance = async () => {
    try {
      const res = await getPerformance(limit, offset - 1, courseId, batchId, semester, search, academic);
      const apiData = res?.data?.data?.data || [];
      settotal(res?.data?.data?.totalCount);
      setPerformance(res?.data?.data?.data || []);
      // const formatted = apiData
      //   .filter(
      //     (item) =>
      //       item.Academic &&
      //       item.Academic.toLowerCase().startsWith("sem")
      //   )
      //   .map((item) => ({
      //     id: item._id,
      //     userId: item.userDetails?._id,
      //     name: item.userDetails?.name || "-",
      //     studentId: item.userDetails?.studentId || "-",

      //     Academic: item.Academic,
      //     exam: item.exam,

      //     courseId: item.courseDetails?._id || "",
      //     courseName: item.courseDetails?.courseName || "-",

      //     batchId:
      //       item.batchDetails?.length > 0
      //         ? item.batchDetails[0]._id
      //         : "",
      //     batchName:
      //       item.batchDetails?.length > 0
      //         ? item.batchDetails[0].batchName
      //         : "-",

      //     total: item.total || 0,
      //     percentage: item.average ? `${item.average}%` : "0%",
      //     subjects: item.Marks || [],
      //   }));

      // setPerformance(formatted);
    } catch (err) {
      console.error("Semester fetch failed", err);
    }
  };


  const fetchCourses = async () => {
    try {
      const res = await getCourse(100, 0);
      setCourses(res?.data?.data?.data || []);
    } catch (err) {
      console.error("Course fetch error", err);
    }
  };

  useEffect(() => {
    if (!courseId) {
      setBatches([]);
      setBatchId("");
      fetchUsers(search, "", "");
      setoffset(1);
      return;
    }

    const fetchBatches = async () => {
      try {
        const res = await getCourseBatchByCourseId(courseId, 100, 0);
        setBatches(res?.data?.data?.data || []);
      } catch {
        setBatches([]);
      }
    };

    fetchBatches();
    fetchUsers(search, courseId, "");
    setoffset(1);
  }, [courseId]);

  useEffect(() => {
    fetchUsers(search, courseId, batchId);
    setoffset(1);
  }, [batchId]);


  const filteredData = performance.filter((row) => {
    const userMatch = users.some((u) => u._id === row.userId);
    const courseMatch = !courseId || row.courseId === courseId;
    const batchMatch = !batchId || row.batchId === batchId;
    const semMatch = !semester || row.semester === semester;

    return userMatch && courseMatch && batchMatch && semMatch;
  });



  // const startIndex = (page - 1) * rowsPerPage;
  // const paginatedData = filteredData.slice(
  //   startIndex,
  //   startIndex + rowsPerPage
  // );

  // const pageCount = Math.ceil(filteredData.length / rowsPerPage);

  const semesterOptions = [
    ...new Set(performance.map((p) => p.semester).filter(Boolean)),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <h3>Semester Details</h3>

        <div className={styles.filters}>
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setBatchId("");
            }}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.courseName}
              </option>
            ))}
          </select>

          <select
            value={batchId}
            disabled={!courseId}
            onChange={(e) => setBatchId(e.target.value)}
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.batchName}
              </option>
            ))}
          </select>

          <select
            value={semester}
            onChange={(e) => {
              setSemester(e.target.value);
              setoffset(1);
            }}
          >
            <option value="">All Semesters</option>
            {/* {semesterOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))} */}
            <option value="sem1">Semester 1</option>
            <option value="sem2">Semester 2</option>
          </select>
          <select
            value={academic}
            onChange={(e) => {
              setAcademic(e.target.value);
              setoffset(1);
            }}
          >
            <option value="">All</option>
            {/* {semesterOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))} */}
            <option value="Term1">Term 1</option>
            <option value="Term2">Term 2</option>
            <option value="Semester">Semester</option>
          </select>

          <input
            className={styles.search}
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchUsers(e.target.value, courseId, batchId);
              setoffset(1)
            }}
          />

          {(courseId?.toString().trim() || batchId?.toString().trim() || semester?.toString().trim() || academic?.toString().trim()) && (
            <button className={styles.clear} onClick={handlefilterSearch}>
              <IoIosCloseCircle />
            </button>
          )}
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Student ID</th>
            <th>Semester</th>
            <th>Academic</th>
            <th>Course</th>
            <th>Batch</th>
            <th>Total</th>
            <th>Percentage</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {totalpages > 0 ? (

            performance.map((row) => (
              <tr key={row.id}>
                <td>{row.userDetails.name}</td>
                <td>{row.userDetails.studentId}</td>
                <td>{row.exam}</td>
                <td>{row.Academic}</td>
                <td>{row.courseDetails.courseName}</td>
                <td>{row.batchDetails[0]?.batchName}</td>
                <td>{row.total}</td>
                <td>{row.average}%</td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => {
                      setViewRecord(row);
                      setViewModal(true);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))

          ) : (
            <tr>
              <td colSpan="8" className={styles.noData}>
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className='flex justify-between my-4 ms-auto w-[50%]'>

        {totalpages > 0 &&


          <ThemeProvider theme={theme} >
            <div className="flex justify-center ">
              <Pagination
                count={totalpages}
                page={offset}
                onChange={handlePageChange}
                showFirstButton
                showLastButton
              />
            </div>
          </ThemeProvider>
        }


        {totalpages > 0 &&

          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              Showing {startIndex} – {endIndex} of {totaluser} students
            </p>
          </div>


        }
      </div>
      {viewModal && viewRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>Semester Details</h3>
              <button
                className={styles.closeIcon}
                onClick={() => setViewModal(false)}
              >
                ✕
              </button>
            </div>


            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <span className={styles.label}>Name</span>
                <p className={styles.value}>{viewRecord.name || "-"}</p>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.label}>Student ID</span>
                <p className={styles.value}>{viewRecord.studentId || "-"}</p>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.label}>Semester</span>
                <p className={styles.value}>{viewRecord.exam || "-"}({viewRecord.Academic})</p>
              </div>
            </div>

            {/* MARKS TABLE */}
            <table className={styles.marksTable}>
              <thead>
                <tr>
                  <th>Subject Code</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  {/* <th>Total</th> */}
                  {/* <th>Percentage</th> */}
                </tr>
              </thead>
              <tbody>
                {viewRecord.subjects && viewRecord.subjects.length > 0 ? (
                  viewRecord.subjects.map((s, i) => (
                    <tr key={i}>
                      <td>{s.subjectCode}</td>
                      <td>{s.subjectName || "-"}</td>
                      <td>{s.mark ?? 0}</td>
                      {/* <td>100</td> */}
                      {/* <td>{s.mark ? `${s.mark}%` : "0%"}</td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.noData}>
                      No Subject Marks Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className={styles.modalFooter}>
              <strong>Total Marks:</strong> {viewRecord.total || 0} &nbsp; | &nbsp;
              <strong>Percentage:</strong> {viewRecord.percentage || "0%"}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Sem;
