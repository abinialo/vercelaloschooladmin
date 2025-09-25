import React, { useEffect, useState } from "react";
import styles from "./feemenagement.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faSearch,
  faPlus,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import magnification from "../../assets/glass.png";
import Modal from "./Modal";
import ModalView from "./ModalView";
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { BiSearchAlt } from "react-icons/bi";
import CloseIcon from '@mui/icons-material/Close';
import { calcfee, createFee, excelfee, getBatchbyid, getBatchName, getFee, getUser, getUserFilter, updateBalanceFee } from "../../api/Serviceapi";
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import nodata from '../../assets/nodata.jpg'
import Loader from "../../component/loader/Loader";
import Skeleton from '@mui/material/Skeleton';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoIosCloseCircle } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";


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
const FeeHome = () => {
  const [showDiv, setShowDiv] = useState(false);
  const [showDivError, setShowDivError] = useState("");
  const [enterName, setEntername] = useState("");
  const [showDiv2, setShowDiv2] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [sendReqColor, setReqSendColor] = useState(false);
  const [studentField, setStudentField] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailField, setEmailField] = useState("");
  const [emailError, setEmailError] = useState("");
  const [courseField, setCourseField] = useState("");
  const [courseError, setCourseError] = useState("");
  const [semError, setSemError] = useState("");
  const [payError, setPayError] = useState('')

  const [batchidField, setbatchidField] = useState("");
  const [feeidError, setFeeidError] = useState("");
  const [feeamountField, setFeeamountField] = useState("");
  const [feeamountError, setFeeamountError] = useState("");
  const [searchText, setSearchText] = useState('');
  const [course, setCourse] = useState([])
  const [batch, setBatch] = useState([])
  const [batchId, setBatchId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [limit, setlimit] = useState(10);
  const [totallist, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);
  const [list, setList] = useState([])
  const [semester, setSemester] = useState('')
  // const [updatesemester, setUpdateSemester] = useState('')
  // const [payment, setPayment] = useState('')

  const handleSearchChange = (e) => {
    setoffset(1)
    setSearchText(e.target.value);
    setList([])
  };

  const handleClearSearch = () => {
    setList([])
    setSearchText('');
    setoffset(1);
  };



  const handleChange = (event) => {
    setBatchId(event.target.value);
  };

  const handlecourseChange = (event) => {
    const selectedId = event.target.value;
    setCourseId(selectedId);
    setoffset(1);
    setBatchId("");
    getBatchnameid(selectedId);
  };

  const handlesemChange = (event) => {
    const selectedId = event.target.value;
    setSemester(selectedId);
    setoffset(1);
    setList([])

  };

  const handleupdatesemChange = (event) => {
    const selectedId = event.target.value;
    setUpdateSemester(selectedId);
    semValidation(selectedId);
    // setoffset(1);
    // setList([])

  };
  const handlepayment = (event) => {
    const selectedId = event.target.value;
    setPayment(selectedId);
    payValidation(selectedId);

    // setoffset(1);
    // setList([])

  };

  useEffect(() => {
    const totalPages = Math.ceil(totallist / limit);
    setpage(totalPages);
  }, [totallist, limit]);

  const handlePageChange = (event, value) => {
    setList([]);
    if (value === offset) {
      getfeelist();
    } else {
      setoffset(value);
    }
  };

  useEffect(() => {
    getBatchname()
  }, []);

  const handleCourseName = (e) => {
    const selectedCourseId = e.target.value;


    setCourseField(e.target.value);
    courseValidation(e.target.value);
    getBatchnameid(selectedCourseId);
  };

  let getBatchnameid = async (id) => {
    try {
      const res = await getBatchbyid(id);
      const course = res?.data?.data?.find(c => c._id === id);
      setBatch(
        course?.batches
          ? Array.isArray(course.batches)
            ? course.batches
            : [course.batches]
          : []
      );
      // setBatchId("");
    } catch (error) {
      console.error("error", error.response?.data || error);
    }
  };


  let getBatchname = async () => {
    try {
      const res = await getBatchName();
      setCourse(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("error", error.response?.data || error);
    }
  };

  useEffect(() => {
    getfeelist()
  }, [offset, courseId, batchId, semester, searchText]);

  const [loading, setLoading] = useState(false);
  const [id, setID] = useState('')
  let getfeelist = async () => {
    setLoading(true);
    try {
      const res = await getFee(limit, offset - 1, courseId, batchId, semester, searchText)
      console.log(res?.data?.data, 'feelist')
      setList(res?.data?.data?.data)
      settotal(res?.data?.data?.totalCount)
    }
    catch (error) {
      console.error("error", error.response?.data || error);
    } finally {
      setLoading(false)
    }
  }

  const handlecompleted = (id) => {
    setOpenView(true),
      setID(id)
  }

  const handleRequestfee = (id) => {
    setShowModal(true)
    setID(id)
  }


  function updateFee() {
    setEntername(''),
      setSearchList([])
    setShowDiv(true);
  }
  function closeUpdateFee() {
    setShowDiv(false);
    setEntername(''),
      setSearchList([])
    setStudentErrors({})
  }

  const [searchlist, setSearchList] = useState([])
  const [searchloading, setSearchLoading] = useState(false)
  const [studentId, setStudentId] = useState('')

  const studentNameValidation = () => {
    if (!enterName || enterName.trim() === "") {
      setShowDivError("Enter Student Name/ID");
      return false;
    } else {
      setShowDivError("");
      return true;
    }
  };

  const updateFee2 = async (e) => {
    e.preventDefault();
    if (!studentNameValidation()) {
      return;
    }
    setSearchLoading(true);
    try {
      let res = await getUserFilter(enterName);
      const students = res.data?.data?.data || [];
      setSearchList(students);

      // prepare empty form state for each student
      let initialData = {};
      students.forEach((s) => {
        initialData[s._id] = {
          updatesemester: "1",
          feeamountField: "",
          payment: "Online",
        };
      });
      setStudentFormData(initialData);
      setStudentErrors({});

    } catch (err) {
      console.log(err);
    } finally {
      setSearchLoading(false);
    }
  };
  const handleClearSearchList = () => {
    setSearchList([])
    setEntername('');

  };


  function closeUpdateFee2() {
    setShowDiv2(false);
    setShowDiv(false);
  }
  const [studentErrors, setStudentErrors] = useState({});

  function payValidation(studentId, value) {
    const trimmedValue = value.trim();
    let error = "";

    if (!trimmedValue) {
      error = "This should not be empty";
    }

    setStudentErrors((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        payError: error,
      },
    }));

    return !error;
  }

  function dateValidation(studentId, value) {
    const trimmedValue = value.trim();
    let error = "";

    if (!trimmedValue) {
      error = "This should not be empty";
    }

    setStudentErrors((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        dateError: error,
      },
    }));

    return !error;
  }
  function semValidation(studentId, value) {
    const trimmedValue = value.trim();
    let error = "";

    if (!trimmedValue) {
      error = "This should not be empty";
    }

    setStudentErrors((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        semError: error,
      },
    }));

    return !error;
  }

  function feeamountValidation(studentId, value) {
    const trimmedfeeamount = value.trim();
    let error = "";

    if (!trimmedfeeamount) {
      error = "This field should not be empty";
    } else if (!/^[0-9]+$/.test(trimmedfeeamount)) {
      error = "This field must contain only numbers";
    }

    setStudentErrors((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        feeamountError: error,
      },
    }));

    return !error;
  }


  const [studentFormData, setStudentFormData] = useState({
    updatesemester: '',
    payment: '',
    feeamountField: '',
    paymentDate: ''

  });

  function validateStudentForm(studentId, formData) {
    const isFeeValid = feeamountValidation(studentId, formData.feeamountField || "");
    const isSemValid = semValidation(studentId, formData.updatesemester || "");
    const isPayValid = payValidation(studentId, formData.payment || "");
    const isPayDate = dateValidation(studentId, formData.paymentDate || "");

    return isFeeValid && isSemValid && isPayValid && isPayDate;
  }


  const handleInputChange = (studentId, field, value) => {
    setStudentFormData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const [updating, setUpdating] = useState(false)
  const update = async (student) => {
    const formData = studentFormData[student._id] || {};

    if (!validateStudentForm(student._id, formData)) {
      console.log("Validation failed for student:", student._id);
      return;
    }

    setUpdating(true)
    try {
      const selectedSem = Number(formData.updatesemester); // e.g. "1"
      const studentRows = formdata[student._id] || [];
      const semRow = studentRows.find(r => Number(r.noOfsem) === selectedSem);

      if (!semRow) {
        toast.error("Selected semester row not found!");
        return;
      }

      const semFee = Number(semRow.semFee) || 0;
      const alreadyPaid = Number(semRow.paidAmount) || 0;
      const newPayment = Number(formData.feeamountField) || 0;
      const totalPaid = alreadyPaid + newPayment;

      // ✅ Validation first
      if (totalPaid > semFee) {
        toast.error(
          `Paid amount cannot exceed ${semFee}, you already paid ${alreadyPaid}`
        );
        return; // stop execution
      }

      // 1️⃣ Call createFee API
      const feePayload = {
        name: student.name,
        email: student.email,
        courseId: student.courseDetails?._id,
        batchId: student.batchDetails?._id,
        paidAmount: newPayment, // this payment only
        noOfsem: formData.updatesemester,
        modeOfPayment: formData.payment,
        userId: student._id,
        studentId: student.studentId,
        paymentDate: formData.paymentDate,
      };
      await createFee(feePayload);

      // 2️⃣ Call updateBalanceFee API 
      const balancePayload = {
        ...semRow,
        paidAmount: totalPaid,
        pendingAmount: Math.max(0, semFee - totalPaid),
        paymentDate: formData.paymentDate,
      };

      await updateBalanceFee(semRow._id, balancePayload);

      // 🔄 Update local state
      setFormData(prev => {
        const updated = { ...prev };
        updated[student._id] = updated[student._id].map(item =>
          item._id === semRow._id
            ? { ...item, ...balancePayload, thisPayment: "" }
            : item
        );
        return updated;
      });

      // ✅ Reset
      setStudentFormData(prev => ({
        ...prev,
        [student._id]: { updatesemester: "", feeamountField: "", payment: "" }
      }));
      setEntername("");
      setStudentErrors({});
      getfeelist();
      calculation();
      setShowDiv(false);
      toast.success("Fee updated successfully!");

      console.log("Fee updated successfully for:", student.name);

    } catch (err) {
      console.error("Error in update:", err);
      toast.error(err?.response?.data?.message);
    } finally {
      setUpdating(false)
    }
  };




  const handlefeedetailsid = (id) => {
    setShowDiv2(true);

  }

  const [feeStatus, setFeeStatus] = useState('Request Sent')

  const [calc, setCalc] = useState([])

  useEffect(() => {
    calculation()
  }, [courseId, batchId, semester, searchText])

  const [calloading, setCallodading] = useState(false)
  let calculation = async () => {
    setCallodading(true)
    try {
      let res = await calcfee(courseId, batchId, semester, searchText)
      setCalc(res.data?.data?.data?.[0] || [])
      console.log('hjjj', res.data?.data)
    } catch (error) {
      console.log(error)
    } finally {
      setCallodading(false)
    }


  }

  // // Calculate visible range
  // const startIndex = (offset - 1) * limit + 1;
  // const endIndex = Math.min(offset * limit, totallist);

  const [balancefee, setBalancefee] = useState([])

  const [savingRows, setSavingRows] = useState({});

  const [formdata, setFormData] = useState({});


  useEffect(() => {
    if (searchlist?.length > 0) {
      const initialData = {};

      searchlist.forEach((student) => {
        if (student?.feebalance?.length > 0) {
          // If fee balance already exists, use it
          initialData[student._id] = student.feebalance.map((f) => ({
            noOfsem: f.noOfsem,
            paymentDate: "",
            semFee: f.semFee,
            paidAmount: f.paidAmount,
            pendingAmount: Math.max(0, Number(f.semFee) - Number(f.paidAmount)),
            createdBy: f.createdBy,
            userId: f.userId,
            studentId: f.studentId,
            courseId: f.courseId,
            batchId: f.batchId,
            _id: f._id,
          }));
        } else if (student?.courseDetails?.duration) {
          // Generate fresh rows if no feebalance
          initialData[student._id] = Array.from(
            { length: student.courseDetails.duration * 2 },
            (_, i) => {
              const semNumber = i + 1;
              let semFee = "";

              if (semNumber === 1) {
                semFee = student.courseDetails.firstsemFee || 0;
              } else if (semNumber === 2) {
                semFee = student.courseDetails.secondSemFee || 0;
              }

              return {
                noOfsem: semNumber,
                paymentDate: "",
                semFee,
                paidAmount: "",
                pendingAmount: semFee,
                createdBy: localStorage.getItem("userId"),
                userId: student._id,
                studentId: student?.studentId,
                courseId: student?.courseDetails?._id,
                batchId: student?.batchDetails?._id,
              };
            }
          );
        }
      });

      setFormData(initialData);
    }
  }, [searchlist]);



  const handlefilterSearch = () => {
    setSemester('');
    setCourseId('');
    setBatchId('');
  }


  const [feeId, setFeeID] = useState('')


   let getExcel = async () => {
    try {
      let res = await excelfee(courseId, batchId, semester,searchText);
      console.log("Axios response:", res);
  
      // The Base64 string is here
      let base64String = res.data.data;
  
      if (!base64String) {
        alert("No Excel file data found");
        return;
      }
  
      // Clean (just in case)
      base64String = base64String.replace(/\s/g, "");
  
      // Convert Base64 → Blob
      const byteCharacters = atob(base64String);
      const byteNumbers = new Array(byteCharacters.length)
        .fill()
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
  
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
  
      // Trigger download
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "userFeeDetails.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.log("Error downloading Excel:", err);
    }
  };
  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.feemanagement}>
        <div className={styles.feehead}>
          <div className={styles.feetitle}>
            <p>Fee Management</p>
          </div>
          <div className={styles.feeform}>

            <div className={styles.formselect1}>
              <div className={styles.selectWrapper}>

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: '100%',
                    backgroundColor: '#F6F6F6', // match the image background
                    borderRadius: '6px',
                    border: 'none'
                  }}
                >
                  <Select
                    value={courseId}
                    onChange={handlecourseChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      fontSize: '14px',
                      padding: '4px 10px',
                      height: '36px',
                      border: 'none'
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {course.map((item, index) => {
                      return (
                        <MenuItem value={item._id} key={index}>{item.courseName}</MenuItem>
                      )
                    })}
                  </Select>

                </FormControl>
              </div>
            </div>
            <div className={styles.formselect2}>
              <div className={styles.selectWrapper}>

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: '100%',
                    backgroundColor: '#F6F6F6', // match the image background
                    borderRadius: '6px',
                    border: 'none',

                  }}
                >
                  <Select
                    value={batchId}
                    onChange={handleChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      fontSize: '14px',
                      padding: '4px 10px',
                      height: '36px',
                      border: 'none'
                    }}
                    disabled={!courseId}
                  // style={{ cursor: courseId ? 'pointer' : 'not-allowed' }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {Array.isArray(batch) &&
                      batch.map((item, index) => (
                        <MenuItem value={item._id} key={index}>
                          {item.batchName}
                        </MenuItem>
                      ))}
                  </Select>

                </FormControl>
              </div>
            </div>
            <div className={styles.formselect3}>
              <div className={styles.selectWrapper}>

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: '100%',
                    backgroundColor: '#F6F6F6', // match the image background
                    borderRadius: '6px',
                    border: 'none'
                  }}
                >
                  <Select
                    value={semester}
                    onChange={handlesemChange}
                    displayEmpty
                    IconComponent={KeyboardArrowDownIcon}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      fontSize: '14px',
                      padding: '4px 10px',
                      height: '36px',
                      border: 'none',

                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="1">Semester 1</MenuItem>

                    <MenuItem value="2">Semester 2</MenuItem>


                  </Select>

                </FormControl>
              </div>
            </div>
            <div >
              <div style={{ width: '190px' }}>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Search here"
                  value={searchText}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BiSearchAlt style={{ fontSize: 18, color: '#555' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchText && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClearSearch} edge="end">
                          <CloseIcon style={{ fontSize: 18 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                    style: {
                      backgroundColor: '#F6F6F6',
                      borderRadius: '6px',
                      height: '36px',
                      fontSize: '14px',
                      padding: '4px 10px'
                    },
                    notched: false
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                    minWidth: 120,
                  }}
                />
              </div>

            </div>
            <div>
              {(semester?.toString().trim() || courseId?.toString().trim() || batchId?.toString().trim()) && (
                <button className={styles.clear} onClick={handlefilterSearch}>
                  <IoIosCloseCircle />
                </button>
              )}

            </div>
            <div className={styles.formbtn}>
              <button onClick={updateFee}>
                {" "}
                <FontAwesomeIcon
                  icon={faPlus}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "16px",
                    transform: "translateY(-50%)",
                  }}
                />
                Update Fee
              </button>
            </div>
          </div>
        </div>
        <div className='flex justify-end mt-4'>
          <button className='bg-[gray] text-white px-1 py-1 rounded-md flex items-center flex-end gap-1 cursor-pointer' onClick={getExcel}>Export<MdOutlineFileDownload />
          </button>
        </div>
        {calloading ?
          <div className={styles.feeamount}>
            <div className={styles.feeamt}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={80} height={40} />
            </div>
            <div className={styles.feeamt}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={80} height={40} />
            </div>
            <div className={styles.feeamt}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={80} height={40} />
            </div>
          </div>
          :
          calc && (
            <div className={styles.feeamount}>
              <div className={styles.feeamt}>
                <div className={styles.feeamthead}>
                  <p className={styles.amtText}>Total Fee Amount</p>
                </div>
                <div className={styles.feeamtamount}>
                  <p className={styles.amtValue}>{calc?.totalFee || 0}</p>
                </div>
              </div>
              <div className={styles.feeamt}>
                <div className={styles.feeamthead}>
                  <p className={styles.amtText}>Collected Fee Amount</p>
                </div>
                <div className={styles.feeamtamount}>
                  <p className={styles.amtValue}>{calc?.paidFee || 0}</p>
                </div>
              </div>
              <div className={styles.feeamt}>
                <div className={styles.feeamthead}>
                  <p className={styles.amtText}>Pending Fee Amount</p>
                </div>
                <div className={styles.feeamtamount}>
                  <p className={styles.amtValue}>{calc?.pendingFee || 0}</p>
                </div>
              </div>
            </div>
          )}

        <div className={styles.feetable}>
          <table className={styles.tabledetails}>
            <thead>
              <tr>
                <th>Fee ID</th>
                <th>Name</th>
                <th>ID No</th>
                <th>Mobile</th>
                <th style={{ width: "45%" }}>Course</th>
                <th>Total Fees</th>
                <th>Paid Amount</th>
                <th>Pending Fees</th>
                <th >Payment Date</th>
                <th>Action</th>
              </tr>
            </thead>
            {loading ?
              <tr>
                <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold" style={{ border: "none" }}>
                  <Loader />
                </td>
              </tr>
              :
              <tbody>
                {
                  Array.isArray(list) && list.length > 0 ?
                    list.map((item) => (
                      <tr key={item._id}>
                        <td>{item.receiptId}</td>
                        <td style={{ textTransform: 'capitalize' }}>{item.userDetails?.name}</td>
                        <td>{item.userDetails?.studentId}</td>
                        <td>{item.userDetails?.mobileNo}</td>
                        <td>{item.courseDetails?.courseName}</td>
                        <td>{item.totalFeeAmount}</td>
                        <td>{item.paidAmount}</td>
                        <td style={{ color: item.pendingAmount === 0 ? "green" : "red" }}>{item.pendingAmount === 0 ? 'Completed' : item.pendingAmount}</td>
                        <td >{item.paymentDate?.split("T")[0]}</td>
                        <td
                          className={styles.viewBtn}
                          onClick={() => { item.pendingAmount === 0 && handlecompleted(item._id) }}
                        >
                          {item.pendingAmount === 0 ? (
                            <div>
                              <FontAwesomeIcon
                                icon={faEye}
                                style={{ marginRight: "5px" }}
                                className={styles.viewIcon}
                              />
                              <span className={styles.viewText}>View</span>
                            </div>
                          ) : (
                            <p
                              style={{
                                color: item?.mailStatus === 'Sent'
                                  ? "blue"
                                  : "red",

                                cursor: item?.mailStatus === 'Sent' ? 'not-allowed' : 'pointer'
                              }}
                              onClick={() => {
                                if (item?.mailStatus === "Sent") return;
                                setFeeID(item?._id);
                                setShowModal(true);
                              }}
                            >
                              {item?.mailStatus === 'Sent'
                                ? "Requested Fee"
                                : 'Request Sent'
                              }
                            </p>
                          )}

                        </td>
                      </tr>
                    ))
                    :
                    <tr >
                      <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold " style={{ border: "none" }}>
                        <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                        <p className="text-center">No Data Found</p>
                      </td>
                    </tr>
                }


              </tbody>
            }
          </table>
        </div>

        <div className='flex justify-between items-end mx-2'>
          {/* {totalpages > 0 &&
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                Showing {startIndex} – {endIndex} of {totallist} students
              </p>
            </div>
          } */}
          {totalpages > 0 &&
            <ThemeProvider theme={theme}>
              <div style={{ marginLeft: "auto", marginTop: "20px" }}>
                <Pagination

                  count={totalpages}
                  page={offset}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  sx={{ display: "flex", justifyContent: "flex-end" }}
                />
              </div>
            </ThemeProvider>
          }
        </div>






        {/* modal view starts */}
        <ModalView viewOpen={openView} id={id} viewClose={() => setOpenView(false)}>
          <div className={styles.viewHead1}>
            <div className={styles.h1}>Fee Details</div>
            <div className={styles.h1}>
              <FontAwesomeIcon
                cursor={"pointer"}
                icon={faTimes}
                onClick={() => { setOpenView(false) }}
              />
            </div>
          </div>
        </ModalView>
        {/* modal view ends */}

        {/* req send starts */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          sendReqColor={sendReqColor}
          setReqSendColor={setReqSendColor}
          status={setFeeStatus}
          id={feeId}
          list={getfeelist}

        ></Modal>
        {/* req send end */}

        {/* showdiv  start */}
        {showDiv && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0,0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,

            }}>
            {/* <div className={styles.updatefeediv}> */}
            <div className={styles.updatefee}>
              <div className={styles.updatefeehead}>
                <div className={styles.updatefeetitle}>
                  <p>Update Fee</p>
                </div>
                <div className={styles.updatefeetitle}>
                  <FontAwesomeIcon icon={faTimes} cursor={"pointer"} onClick={closeUpdateFee} />
                </div>
              </div>
              <form className={styles.updatefeeinput}>
                <div className={styles.updatefeeinputlabel}>
                  <label htmlFor="">
                    Enter Student Name/ID <sup style={{ color: "red" }}>*</sup>
                  </label>
                </div>
                <div className={styles.updatefeeinputinput}>
                  <div className={styles.searchdiv}>
                    <input
                      type="text"
                      placeholder="Enter Student Name/ID"
                      value={enterName}
                      onChange={(e) => {
                        // studentNameValidation(e.target.value);
                        setShowDivError('')
                        setEntername(e.target.value);
                      }}
                    />
                    {enterName &&
                      <p style={{ cursor: "pointer" }} onClick={handleClearSearchList} className={styles.closesearch}>
                        <CloseIcon style={{ fontSize: 18 }} />
                      </p>
                    }
                  </div>

                  <button onClick={(e) => updateFee2(e)}>
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{ marginRight: "8px" }}
                    />
                    Search
                  </button>
                </div>
              </form>
              <div className={styles.errorinput}>
                <p
                  style={{
                    color: "red",
                    fontSize: "11px",
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {showDivError}
                </p>
              </div>

              {searchloading ? (
                <Loader />
              ) : (
                <div>
                  {searchlist.length > 0 ? (
                    searchlist.map((student) => {
                      const formData = studentFormData[student._id] || {};
                      return (
                        <div key={student._id} className={styles.updatefeedata}>
                          {/* Profile */}
                          <div>
                            <p style={{ marginTop: "10px" }}>Profile</p>
                            <div className={styles.updatefeepic}>
                              <img src={student?.profileURL} alt="" />
                            </div>
                          </div>

                          {/* Name & Email */}
                          <div className={styles.nameemaildiv}>
                            <div className={styles.namediv}>
                              <label className={styles.updatefeeinputlabel}>Student name</label>
                              <input
                                type="text"
                                value={student?.name}
                                disabled
                                style={{
                                  cursor: "not-allowed",
                                  backgroundColor: "#6a6a6a18",
                                  color: "#848282ff",
                                }}
                              />
                            </div>
                            {/* <p className={styles.stderror1}>{nameError}</p> */}

                            <div className={styles.namediv}>
                              <label className={styles.updatefeeinputlabel}>E-mail</label>
                              <input
                                type="text"

                                value={student?.email}
                                disabled
                                style={{
                                  cursor: "not-allowed",
                                  backgroundColor: "#6a6a6a18",
                                  color: "#848282ff",
                                }}
                              />
                            </div>
                          </div>
                          {/* <p className={styles.stderror1}>{emailError}</p> */}

                          {/* Course & Batch */}
                          <div className={styles.nameemaildiv1}>
                            <div className={styles.namediv1}>
                              <label className={styles.updatefeeinputlabel}>
                                Course
                              </label>
                              <select
                                className={styles.select_field}
                                value={student?.courseDetails?._id}
                                disabled
                                style={{
                                  cursor: "not-allowed",
                                  backgroundColor: "#6a6a6a18",
                                  color: "#848282ff",
                                }}
                              >
                                <option value="">Select a course</option>
                                {course.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.courseName}
                                  </option>
                                ))}
                              </select>
                              {/* <p className={styles.stderror1}>{courseError}</p> */}

                            </div>
                            <div className={styles.namediv1}>
                              <label className={styles.updatefeeinputlabel}>Batch</label>
                              <select
                                className={styles.select_field}
                                value={student?.batchDetails?._id || ""}
                                disabled
                                style={{
                                  cursor: "not-allowed",
                                  backgroundColor: "#6a6a6a18",
                                  color: "#848282ff",
                                }}
                              >
                                <option value={student?.batchDetails?._id}>
                                  {student?.batchDetails?.batchName}
                                </option>
                              </select>
                            </div>

                            <div className={styles.namediv1}>
                              <label className={styles.updatefeeinputlabel}>Payment Date <sup style={{ color: "red" }}>*</sup></label>
                              <input
                                type="date"
                                value={formData.paymentDate || ""}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  handleInputChange(student._id, "paymentDate", value);
                                  dateValidation(student._id, value);

                                  const selectedSem = Number(studentFormData[student._id]?.updatesemester);
                                  if (selectedSem) {
                                    setFormData((prev) => {
                                      const updated = { ...prev };
                                      updated[student._id] = updated[student._id].map((row) =>
                                        Number(row.noOfsem) === selectedSem
                                          ? { ...row, paymentDate: value }
                                          : row
                                      );
                                      return updated;
                                    });
                                  }
                                }}
                              />
                              <p className={styles.stderror1}>{studentErrors[student._id]?.dateError}</p>
                            </div>

                          </div>

                          {/* Semester, Fee, Payment */}
                          <div className={styles.nameemaildiv1}>
                            <div className={styles.namediv2}>
                              <label className={styles.updatefeeinputlabel}>
                                Select Semester <sup style={{ color: "red" }}>*</sup>
                              </label>
                              <FormControl
                                variant="outlined"
                                size="small"
                                sx={{
                                  minWidth: "100%",
                                  backgroundColor: "#F6F6F6",
                                  borderRadius: "6px",
                                  border: 'none'
                                }}
                              >
                                <Select
                                  value={studentFormData[student._id]?.updatesemester || ""}
                                  onChange={(e) => {
                                    const newSem = e.target.value;
                                    const prevSem = studentFormData[student._id]?.updatesemester;

                                    // 1️⃣ Reset input fields
                                    handleInputChange(student._id, "updatesemester", newSem);
                                    handleInputChange(student._id, "feeamountField", "");
                                    handleInputChange(student._id, "paymentDate", "");

                                    // 2️⃣ Clear old semester row values
                                    if (prevSem) {
                                      setFormData((prev) => {
                                        const updated = { ...prev };
                                        updated[student._id] = updated[student._id].map((row) =>
                                          Number(row.noOfsem) === Number(prevSem)
                                            ? { ...row, thisPayment: "", paymentDate: "" } // 🔄 reset
                                            : row
                                        );
                                        return updated;
                                      });
                                    }
                                  }}
                                  displayEmpty
                                  IconComponent={KeyboardArrowDownIcon}
                                  sx={{
                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                    fontSize: "14px",
                                    padding: "4px 10px",
                                    height: "43px",
                                  }}
                                >
                                  <MenuItem value="">Select Semester</MenuItem>
                                  <MenuItem value="1">Semester 1</MenuItem>
                                  <MenuItem value="2">Semester 2</MenuItem>
                                </Select>

                              </FormControl>

                              <p className={styles.stderror1}>{studentErrors[student._id]?.semError}</p>


                            </div>

                            <div className={styles.namediv}>
                              <label className={styles.updatefeeinputlabel}>
                                Enter Fee Amount <sup style={{ color: "red" }}>*</sup>
                              </label>
                              <input
                                type="text"
                                placeholder="Enter Fee amount"
                                value={formData.feeamountField}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  // 1️⃣ update studentFormData state
                                  handleInputChange(student._id, "feeamountField", value);
                                  feeamountValidation(student._id, value);

                                  // 2️⃣ also update the correct semester row in formdata
                                  const selectedSem = Number(studentFormData[student._id]?.updatesemester);
                                  if (selectedSem) {
                                    setFormData((prev) => {
                                      const updated = { ...prev };
                                      updated[student._id] = updated[student._id].map((row) =>
                                        Number(row.noOfsem) === selectedSem
                                          ? {
                                            ...row,
                                            thisPayment: value, // temporary typing value
                                            pendingAmount: Math.max(
                                              0,
                                              Number(row.semFee || 0) -
                                              (Number(row.paidAmount || 0) + Number(value || 0))
                                            ),
                                          }
                                          : row
                                      );
                                      return updated;
                                    });
                                  }
                                }}
                              />

                              <p className={styles.stderror1}>{studentErrors[student._id]?.feeamountError}</p>

                            </div>

                            <div className={styles.namediv2}>
                              <label className={styles.updatefeeinputlabel}>
                                Mode of Payment <sup style={{ color: "red" }}>*</sup>
                              </label>
                              <FormControl
                                variant="outlined"
                                size="small"
                                sx={{
                                  minWidth: "100%",
                                  backgroundColor: "#F6F6F6",
                                  borderRadius: "6px",
                                  border: 'none'
                                }}
                              >
                                <Select
                                  value={formData.payment}
                                  onChange={(e) => {
                                    handleInputChange(
                                      student._id,
                                      "payment",
                                      e.target.value
                                    )
                                    payValidation(student._id, e.target.value);
                                  }
                                  }
                                  displayEmpty
                                  IconComponent={KeyboardArrowDownIcon}
                                  sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      border: 'none',
                                    },
                                    fontSize: '14px',
                                    padding: '4px 10px',
                                    height: '43px',
                                    border: 'none',

                                  }}

                                >
                                  <MenuItem value="">Select Payment</MenuItem>
                                  <MenuItem value="Online">Online</MenuItem>
                                  <MenuItem value="Cash">Cash</MenuItem>
                                </Select>
                              </FormControl>
                              <p className={styles.stderror1}>{studentErrors[student._id]?.payError}</p>

                            </div>
                          </div>

                          {/* Update Button */}
                          <div key={student._id} className={styles.feeupdatetable}>
                            {/* <h3>{student.userDetails?.name} ({student.userDetails?.studentId})</h3> */}

                            <table>
                              <thead>
                                <tr>
                                  <th >Sem</th>
                                  <th>Sem Fee</th>
                                  <th>Paid Amount</th>
                                  <th>Pending Amount</th>
                                  {/* <th>Payment Date</th> */}

                                  {/* <th>Action</th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {formdata[student._id]?.map((row, index) => (
                                  <tr key={index}>
                                    <td>
                                      <input
                                        disabled
                                        type="text"
                                        value={row.noOfsem}
                                        onChange={(e) => {
                                          const updated = { ...formdata };
                                          updated[student._id] = [...updated[student._id]];
                                          updated[student._id][index] = {
                                            ...updated[student._id][index],
                                            noOfsem: e.target.value
                                          };
                                          setFormData(updated);
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        disabled
                                        type="text"
                                        value={row.semFee}
                                        onChange={(e) => {
                                          const updated = { ...formdata };
                                          updated[student._id] = [...updated[student._id]];
                                          updated[student._id][index] = {
                                            ...updated[student._id][index],
                                            semFee: e.target.value
                                          };
                                          setFormData(updated);
                                        }}
                                      />
                                    </td>

                                    <td>
                                      {formdata[student._id]?.[index]?.semFee == formdata[student._id]?.[index]?.paidAmount ? (
                                        'paid'
                                      ) :
                                        <input
                                          type="text"
                                          max={row.semFee}
                                          // style={{ border: '2px solid black', borderRadius: '5px' }}
                                          disabled
                                          value={row.thisPayment || ""}
                                          onChange={(e) => {
                                            const updated = { ...formdata };
                                            updated[student._id] = [...updated[student._id]];

                                            let thisPayment = e.target.value;
                                            const semFee = Number(updated[student._id][index].semFee) || 0;
                                            const alreadyPaid = Number(updated[student._id][index].paidAmount) || 0;

                                            // If input cleared → revert pending to original
                                            if (thisPayment === "") {
                                              updated[student._id][index] = {
                                                ...updated[student._id][index],
                                                thisPayment: "",
                                                pendingAmount: semFee - alreadyPaid, // ✅ revert
                                              };
                                            } else {
                                              thisPayment = Number(thisPayment) || 0;
                                              const totalPaid = alreadyPaid + thisPayment;

                                              updated[student._id][index] = {
                                                ...updated[student._id][index],
                                                thisPayment,
                                                pendingAmount: semFee - totalPaid < 0 ? 0 : semFee - totalPaid,
                                              };
                                            }

                                            setFormData(updated);
                                          }}
                                        />
                                      }

                                    </td>

                                    <td>
                                      <input
                                        disabled
                                        type="text"
                                        value={row.pendingAmount}
                                      // onChange={(e) => {
                                      //   const updated = { ...formdata };
                                      //   updated[student._id] = [...updated[student._id]];
                                      //   updated[student._id][index] = {
                                      //     ...updated[student._id][index],
                                      //     pendingAmount: e.target.value,
                                      //   };
                                      //   setFormData(updated);

                                      // }}
                                      />
                                    </td>
                                    {/* <td>
                                      {formdata[student._id]?.[index]?.semFee == formdata[student._id]?.[index]?.paidAmount ?

                                        <input
                                          type="date"
                                          disabled
                                          style={{ cursor: 'not-allowed', color: 'gray' }}

                                        />
                                        :
                                        <input
                                          type="date"
                                          value={row.paymentDate}
                                          onChange={(e) => {
                                            const updated = { ...formdata };
                                            updated[student._id] = [...updated[student._id]];
                                            updated[student._id][index] = {
                                              ...updated[student._id][index],
                                              paymentDate: e.target.value
                                            };
                                            setFormData(updated);
                                          }}
                                        />
                                      }
                                    </td> */}
                                    {/* <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>

                                          {formdata[student._id]?.[index]?.semFee == formdata[student._id]?.[index]?.paidAmount ? (
                                            <button className={styles.savebtn} disabled style={{ cursor: 'not-allowed', color: 'white', background: 'gray' }} onClick={() => { updatebalacncefee(row._id, row), console.log("Editing row with _id:", row._id); }}> {savingRows[row._id] ? "Saving..." : "Save"}</button>

                                          ) :
                                            <button className={styles.savebtn} onClick={() => { updatebalacncefee(row._id, row), console.log("Editing row with _id:", row._id); }}> {savingRows[row._id] ? "Saving..." : "Save"}</button>
                                          }
                                        
                                        </div>
                                      </td> */}
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* Add Row only for this student */}
                            <div className={styles.addfeebtn}>
                              {/* <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...formdata };
                                    updated[student._id] = [
                                      ...updated[student._id],
                                      {
                                        noOfsem: '',
                                        paymentDate: '',
                                        semFee: '',
                                        paidAmount: '',
                                        pendingAmount: '',
                                        createdBy: localStorage.getItem('userId'),
                                        userId: student._id,
                                        studentId: student?.studentId,
                                        courseId: student?.courseDetails?._id,
                                        batchId: student?.batchDetails?._id
                                      }
                                    ];
                                    setFormData(updated);
                                  }}
                                >
                                  <FontAwesomeIcon icon={faPlus} /> Add Row
                                </button> */}
                              {/* {!student.feebalance?.length && (
                                  <button onClick={() => handleSave(student._id)}>Save</button>
                                )} */}
                            </div>
                          </div>
                          <div className={styles.updatefeebtn} >
                            <button onClick={() => update(student)}>{updating ? "Updating..." : "Update"}</button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.updatefeesearch}>
                      <div className={styles.img}>
                        <img src={nodata} alt="" />
                        <p className="text-center text-gray-500 font-semibold">No Data Found</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>



          </div>
        )}


      </div>

    </div>
  )
}

export default FeeHome

