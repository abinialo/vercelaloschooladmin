import React, { useEffect, useState } from "react";
import styles from "./TermExam.module.css";
import {
  getPerformance,
  getCourse,
  getCourseBatchByCourseId,
  getUser,
} from "../../api/Serviceapi";

const TermExam = () => {
  const [performance, setPerformance] = useState([]);
  const [users, setUsers] = useState([]);

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [term, setTerm] = useState("");

  const [viewModal, setViewModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);

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

      const formatted = apiData.map((item) => ({
        id: item._id,
        userId: item.userDetails?._id,

        name: item.userDetails?.name || "-",
        studentId: item.userDetails?.studentId || "-",
        term: item.Academic || "-",

        courseName: item.courseDetails?.courseName || "-",
        batchName:
          item.batchDetails?.length > 0 ? item.batchDetails[0].batchName : "-",

        total: item.total || 0,
        percentage: item.average ? `${item.average}%` : "0%",
        subjects: item.Marks || [],
      }));

      setPerformance(formatted);
    } catch (err) {
      console.error("Performance fetch failed", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await getCourse(100, 0);
      console.log("COURSE API RESPONSE 👉", res.data);
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
  }, [courseId]);

  useEffect(() => {
    fetchUsers(search, courseId, batchId);
  }, [batchId]);

  const filteredData = performance.filter((row) => {
    const userMatch = users.some((u) => u._id === row.userId);
    const matchTerm = !term || row.term === term;
    return userMatch && matchTerm;
  });

  const termOptions = [
    ...new Set(performance.map((p) => p.term).filter(Boolean)),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.headerBar}>
        <h3>Academic / Term Details</h3>

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

          <select value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="">All Terms</option>
            {termOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            className={styles.search}
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              fetchUsers(value, courseId, batchId);
            }}
          />
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.gradientHeader}>Name</th>
            <th className={styles.gradientHeader}>Student ID</th>
            <th className={styles.gradientHeader}>Term</th>
            <th className={styles.gradientHeader}>Course</th>
            <th className={styles.gradientHeader}>Batch</th>
            <th className={styles.gradientHeader}>Total</th>
            <th className={styles.gradientHeader}>Percentage</th>
            <th className={styles.gradientHeader}>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.noData}>
                No Data Found
              </td>
            </tr>
          ) : (
            filteredData.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.studentId}</td>
                <td>{row.term}</td>
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

      {viewModal && viewRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>Term / Semester Details</h3>
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
    <p className={styles.value}>{viewRecord.name}</p>
  </div>

  <div className={styles.infoCard}>
    <span className={styles.label}>Student ID</span>
    <p className={styles.value}>{viewRecord.studentId}</p>
  </div>

  <div className={styles.infoCard}>
    <span className={styles.label}>Term / Semester</span>
    <p className={styles.value}>{viewRecord.term}</p>
  </div>
</div>

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
                {viewRecord.subjects.map((s, i) => (
                  <tr key={i}>
                    <td>{s.subject}</td>
                    <td>{s.mark}</td>
                    <td>100</td>
                    <td>{s.mark}%</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.modalFooter}>
              <strong>Total Marks:</strong> {viewRecord.total} &nbsp; | &nbsp;
              <strong>Percentage:</strong> {viewRecord.percentage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermExam;
