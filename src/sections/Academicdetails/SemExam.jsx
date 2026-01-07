import React, { useEffect, useState } from "react";
import styles from "./TermExam.module.css";
import Pagination from "@mui/material/Pagination";
import {
  getPerformance,
  getCourse,
  getCourseBatchByCourseId,
  getUser,
} from "../../api/Serviceapi";

const Sem = () => {
  const [performance, setPerformance] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [semester, setSemester] = useState("");

  const [viewModal, setViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchCourses();
    fetchPerformance();
    fetchUsers();
  }, []);

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
      const res = await getPerformance();
      const apiData = res?.data?.data?.data || [];

      const semData = apiData.filter(
        (item) =>
          item.Academic &&
          (item.Academic.toLowerCase().includes("sem") ||
            item.Academic.toLowerCase().includes("semester"))
      );

      const formatted = semData.map((item) => ({
        id: item._id,
        userId: item.userDetails?._id,
        name: item.userDetails?.name || "-",
        studentId: item.userDetails?.studentId || "-",
        semester: item.Academic || "-",
        courseName: item.courseDetails?.courseName || "-",
        batchName:
          item.batchDetails?.length > 0
            ? item.batchDetails[0].batchName
            : "-",
        total: item.total || 0,
        percentage: item.average ? `${item.average}%` : "0%",
        subjects: item.Marks || [],
      }));

      setPerformance(formatted);
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
      setPage(1);
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
    setPage(1);
  }, [courseId]);

  useEffect(() => {
    fetchUsers(search, courseId, batchId);
    setPage(1);
  }, [batchId]);


  const filteredData = performance.filter((row) => {
    const userMatch = users.some((u) => u._id === row.userId);
    const semMatch = !semester || row.semester === semester;
    return userMatch && semMatch;
  });


  const startIndex = (page - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);

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
    setPage(1);
  }}
>
  <option value="">All Semesters</option>
  <option value="Sem 1">Semester 1</option>
  <option value="Sem 2">Semester 2</option>
</select>


          <input
            className={styles.search}
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              fetchUsers(e.target.value, courseId, batchId);
              setPage(1);
            }}
          />
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Student ID</th>
            <th>Semester</th>
            <th>Course</th>
            <th>Batch</th>
            <th>Total</th>
            <th>Percentage</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.noData}>
                No Data Found
              </td>
            </tr>
          ) : (
            paginatedData.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.studentId}</td>
                <td>{row.semester}</td>
                <td>{row.courseName}</td>
                <td>{row.batchName}</td>
                <td>{row.total}</td>
                <td>{row.percentage}</td>
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
          )}
        </tbody>
      </table>


     <div className={styles.paginationWrap}>
  <Pagination
    count={pageCount || 1}
    page={page}
    onChange={(e, value) => setPage(value)}
  />
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
          <p className={styles.value}>{viewRecord.semester || "-"}</p>
        </div>
      </div>

      {/* MARKS TABLE */}
      <table className={styles.marksTable}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Marks</th>
            <th>Total</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {viewRecord.subjects && viewRecord.subjects.length > 0 ? (
            viewRecord.subjects.map((s, i) => (
              <tr key={i}>
                <td>{s.subject || "-"}</td>
                <td>{s.mark ?? 0}</td>
                <td>100</td>
                <td>{s.mark ? `${s.mark}%` : "0%"}</td>
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
