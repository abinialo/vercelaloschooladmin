import React, { useEffect, useState } from "react";
import styles from "./CourseTable.module.css";
import AddCourseModal from "./AddCourseModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { getCourse } from "../../api/Serviceapi";
import { useNavigate } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import LocaleProvider from "antd/es/locale";
import Loader from "../../component/loader/Loader";
import nodata from '../../assets/nodata.jpg'

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

const CourseTable = () => {
  const [limit, setLimit] = useState(7);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1); // page number

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentTotalCount, setStudentTotalCount] = useState(0);
  // Calculate visible range
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalItems);
  const handlePageChange = (event, value) => {
    setTableData([]);
    setPage(value);
    fetchCourse(value);

  };
  useEffect(() => {
    const totalPages = Math.ceil(totalItems / limit);
    setTotalPages(totalPages);
  }, [totalItems, limit]);

  const navigate = useNavigate();

  function handleDetalis(id) {
    navigate(`coursedetails/${id}`);
  }
  const fetchCourse = async () => {
    try {
      setLoading(true);
      // correct offset calculation
      const offset = (page - 1); // ✅ calculate properly
      console.log("Sending to API => limit:", limit, "offset:", offset);
      const res = await getCourse(limit, offset);

      setTableData(res?.data?.data?.data || []);
      console.log('course in the table', res?.data?.data?.data);
      setTotalItems(res?.data?.data?.totalCount);
      setStudentTotalCount(res?.data?.data?.studentTotalCount);

      console.log("API response:", res?.data);
    } catch (error) {
      console.error("error", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  function handleDetalis(id) {
    navigate(`coursedetails/${id}`);
  }

  useEffect(() => {
    fetchCourse();
  }, [page, limit]);

  // const handlePageChange = (_event_, value) => {
  //   setTableData([]); // reset to avoid flicker
  //   setoffset(value);
  // };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>Course Details</h2>
        <div className={styles.addcoursebtn}>
          <button
            className={styles.addBtn}
            onClick={() => setIsModalVisible(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <table className={styles.courseTable}>
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Duration</th>
            <th>No of Semester</th>
            <th>Admission Fee</th>
            <th>Course Fees</th>
            {/* <th>No.of students 2025-26</th> */}
            <th>Total Students</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                <Loader />
              </td>
            </tr>
          ) : tableData.length > 0 ? (
            tableData.map((data) => (
              <tr key={data._id} onClick={() => handleDetalis(data._id)}>
                <td>{data.courseName}</td>
                <td>{data.duration}</td>
                <td>{data.noOfSem}</td>
                <td>{data.admissionFee}</td>
                <td>{data.courseFee}</td>
                {/* <td className={styles.greenText}>{data.studentCount}</td> */}
                <td className={styles.greenText}>{data.studentCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold" style={{ border: 'none' }}>
                <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                <p style={{ textAlign: 'center' }} className=" text-gray-500 font-semibold">No Data Found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Pagination Section */}


      <div className='flex justify-between  items-end ms-auto w-[50%]'>
       
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
              Showing {startIndex} – {endIndex} of {totalItems} Courses
            </p>
          </div>
        }
      </div>

      {/* Modal Component */}
      <AddCourseModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        GetMethod={fetchCourse}
        existingCourses={tableData}
      />
    </div>
  );
};

export default CourseTable;
