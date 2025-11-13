import React, { useEffect, useState } from 'react'
import styles from "./LeaveRequest.module.css";
import { BiSearchAlt } from "react-icons/bi";
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getBatchbyid, getBatchName, getLeaveRequest, getLeaveRequestById, updateLeaveRequest } from '../../api/Serviceapi';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Modal from 'react-modal';
import { MdClose } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { IoIosCloseCircle } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';


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


const LeaveRequest = () => {
  const useQuery = () => new URLSearchParams(useLocation().search);

  const [searchText, setSearchText] = useState('');
  const [date, setDate] = useState('')
  const [open, setOpen] = useState(false)
  const [list, setList] = useState([])
  const [limit, setlimit] = useState(10);
  const [totallist, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);
  const [status, setStatus] = useState('')
  const [update, setUpdate] = useState(false)
  const [data, setData] = useState([])
  const [updatestatus, setUpdatestatus] = useState('')
  const [loading, setLoading] = useState(false)
  const adminId = localStorage.getItem('userId')
  const [reason, setReason] = useState('')
  const [course, setCourse] = useState([])
  const [batch, setBatch] = useState([])
  const [batchId, setBatchId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [leaveType, setLeaveType] = useState('')

  // Calculate visible range
  const startIndex = (offset - 1) * limit + 1;
  const endIndex = Math.min(offset * limit, totallist);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD
    setDate(formattedDate);
  }, []);

  useEffect(() => {
    const totalPages = Math.ceil(totallist / limit);
    setpage(totalPages);
  }, [totallist, limit]);

  const handlePageChange = (event, value) => {
    setList([]);
    if (value === offset) {

      getleavelist()
    } else {
      setoffset(value);
    }
  };

  const query = useQuery();

  const dates = query.get("date");
  const courseIds = query.get("courseId");
  const batchIds = query.get("batchId");
  const searchTexts = query.get("search");

  useEffect(() => {
    if (dates) setDate(dates);
  }, [dates]);

  useEffect(() => {
    if (courseIds) setCourseId(courseIds);
  }, [courseIds]);

  useEffect(() => {
    if (batchIds) setBatchId(batchIds);
  }, [batchIds]);

  useEffect(() => {
    if (searchTexts) setSearchText(searchTexts);
  }, [searchTexts]);

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

  useEffect(() => {
    if (!date) return;
    getleavelist()
  }, [offset, date, status, searchText, courseId, batchId, leaveType])

  let getleavelist = async () => {
    setLoading(true)
    try {
      let res = await getLeaveRequest(limit, offset - 1, date, status, searchText, courseId, batchId, leaveType)
      setList(res.data?.data?.result)
      settotal(res.data?.data?.totalCount)

    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setoffset(1)
    setList([])
  }

  const handleLeaveChange = (e) => {
    setLeaveType(e.target.value)
    setoffset(1)
    setList([])
  }
  const handlegetbyClick = async (id) => {
    setUpdate(true)
    try {
      let res = await getLeaveRequestById(id)
      setData(res.data?.data?.result[0])
    } catch (err) {
      console.log(err)
    }

  }

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

  useEffect(() => {
    if (courseIds) {
      setCourseId(courseIds);
      getBatchnameid(courseIds);
    }
  }, [courseIds]);

  useEffect(() => {
    getBatchname()
  }, []);

  let getBatchnameid = async (id) => {
    try {
      const res = await getBatchbyid(id);
      const course = res?.data?.data?.find(c => c._id === id);
      const batches = Array.isArray(course?.batches) ? course.batches : [];
      setBatch(batches);
      if (paramBatch && batches.some(b => b._id === paramBatch)) {
        setBatchId(paramBatch);
      }
    } catch (error) {
      console.error("error", error.response?.data || error);
    }
  };



  let getBatchname = async () => {
    try {
      const res = await getBatchName();


      console.log(res?.data?.data, 'dasdasdada')
      setCourse(Array.isArray(res?.data?.data) ? res.data.data : []);


    } catch (error) {
      console.error("error", error.response?.data || error);
    }
  };

  const [reasonerror, setReasonerror] = useState('')

  const validation = () => {
    if (reason.trim() === '') {
      setReasonerror('Reason is required');
      return false;
    }
    setReasonerror('');
    return true;
  };

  const [idloading, setIdlloading] = useState(false)

  const handleUpdateClick = async (id, status, adminId, reason) => {
    if (!validation()) {
      return;
    }
    setIdlloading(true)
    try {
      let res = await updateLeaveRequest(id, status, adminId, reason)
      setUpdatestatus(status)
      setUpdate(false)
      getleavelist()
      setReason('')
      if (status === 'Rejected') {
        toast.error('Leave Rejected')
      } else if (status === 'Approved') {
        toast.success('Leave Approved')
      }

    }
    catch (err) {
      console.log(err)
      toast.error(err?.response?.data?.message)
    } finally {
      setIdlloading(false)
    }
  }
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      // second: "numeric",
      hour12: true,
      timeZone: "UTC",
    });
  };



  const formatTimehours = (decimalHours) => {
    if (!decimalHours) return "0 mins"; // handle null/undefined/0 safely

    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let parts = [];

    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? "min" : "mins"}`);
    }

    return parts.join(" ") || "0 mins";
  };


  const handlefilterSearch = () => {
    setStatus('');
    setCourseId('');
    setBatchId('');
    setLeaveType('');
    setSearchText('');
  }


  return (
    <>
      <ToastContainer />
      <div className={styles.container}>
        <div className={styles.attendance_container}>
          <div className={styles.header_container}>
            <div className={styles.header_container1}>
              <div >
                <IoMdArrowRoundBack style={{ cursor: 'pointer', fontSize: '20px', marginTop: '2px' }} onClick={() => window.history.back()} />

              </div>
              <h3 className={styles.attendance_h3}>Leave Request</h3>
            </div>
            <div className={styles.header_container2}>

              <div className={styles.selectWrapper}>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#F6F6F6', // match the image background
                    borderRadius: '6px',
                    border: 'none'
                  }}
                >
                  <Select
                    value={leaveType}
                    onChange={handleLeaveChange}
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
                    <MenuItem value="Casual">Casual</MenuItem>
                    <MenuItem value="Sick">Sick</MenuItem>
                    <MenuItem value="permission">Permission</MenuItem>
                    <MenuItem value="earlyPermission">Early Permission</MenuItem>

                  </Select>

                </FormControl>
              </div>
              <div className={styles.selectWrapper}>

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 120,
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
              <div className={styles.selectWrapper}>

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    minWidth: 120,
                    backgroundColor: '#F6F6F6', // match the image background
                    borderRadius: '6px',
                    border: 'none'
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
              <div className={styles.dropdown}>
                <div className={styles.dropdownWrapper}>

                  <div className={styles.selectWrapper}>
                    <FormControl
                      variant="outlined"
                      size="small"
                      sx={{
                        minWidth: 120,
                        backgroundColor: '#F6F6F6', // match the image background
                        borderRadius: '6px',
                        border: 'none'
                      }}
                    >
                      <Select
                        value={status}
                        onChange={handleStatusChange}
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
                        <MenuItem value="Created">Created</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Select>

                    </FormControl>
                  </div>
                </div>
              </div>
              <div className={styles.dateWrapper}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={date ? dayjs(date, "YYYY-MM-DD") : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        const formatted = dayjs(newValue).format("YYYY-MM-DD");
                        setDate(formatted);
                      } else {
                        setDate("");
                      }
                    }}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: 'DD/MM/YYYY',
                        onClick: () => setOpen(true),
                        error: Boolean(Error?.DateofBrith),
                        sx: {
                          '& .MuiPickersOutlinedInput-root': {
                            height: '35px',
                            outline: 'none',
                            width: '100%',
                            backgroundColor: ' #f2f2f2',
                            width: '150px'
                          },
                          '& fieldset': {
                            border: 'none',
                          },
                          '&:hover fieldset': {
                            border: 'none',
                            outline: 'none'
                          },
                          '& .MuiPickersOutlinedInput-root.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                            border: 'none'
                          }
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
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
              <div>
                {(status?.toString().trim() || courseId?.toString().trim() || batchId?.toString().trim() || leaveType?.toString().trim() || searchText) && (
                  <button className={styles.clear} onClick={handlefilterSearch}>
                    <IoIosCloseCircle />
                  </button>
                )}

              </div>
            </div>
          </div>
        </div>


        <div>
          <div className={styles.table_container}>
            <table className={styles.table}>
              <tr className={styles.tr}>
                <th>Name</th>
                <th>ID No</th>
                <th>Mobile</th>
                <th>Leave Type</th>

                <th>Duration</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
              </tr>
              {loading ?
                <tr>
                  <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold border-0">
                    <Loader />
                  </td>
                </tr>
                : <tbody>
                  {
                    Array.isArray(list) && list.length > 0 ?
                      list.map((item) => (
                        <tr key={item._id} className={styles.trtd}>
                          <td style={{ textTransform: 'capitalize' }}>{item?.userDetails?.name}</td>
                          <td>{item?.userDetails?.studentId}</td>
                          <td>{item?.userDetails?.mobileNo}</td>
                          <td style={{ textTransform: 'capitalize' }}>{item?.leaveType}</td>

                          {item.isPermission || item?.isEarlyPermission ?
                            <td>{formatTimehours(item?.permissionTime)}</td> :
                            <td>{item?.noOfDays} {item?.noOfDays > 1 ? 'days' : 'day'}</td>

                          }
                          {item.isPermission || item?.isEarlyPermission ?
                            <td>{formatTime(item?.startTime)}</td>
                            :
                            <td>{item?.fromDate?.split("T")[0]}</td>
                          }
                          {item.isPermission || item?.isEarlyPermission ?
                            <td>{formatTime(item?.endTime)}</td>
                            :
                            <td>{item?.toDate?.split("T")[0]}</td>
                          }
                          <td className={styles.green} style={{
                            color: item.status === 'Approved' && 'green' || item.status === 'Created' && '#144196' || item.status === 'Rejected' && 'red',
                            cursor: item?.status == 'Created' && 'pointer'
                          }} onClick={() => item?.status == 'Created' && handlegetbyClick(item?._id)}>{item?.status == 'Created' ? <div><FontAwesomeIcon
                            icon={faEye}
                            style={{ marginRight: "5px" }}
                            className={styles.viewIcon}
                          />
                            <span>View</span></div> : item.status} </td>
                        </tr>
                      ))
                      :
                      <tr >
                        <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold " style={{ border: "none" }}>
                          <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                          <p className="text-center ">No Data Found</p>
                        </td>
                      </tr>


                  }

                </tbody>
              }
            </table>
          </div>
        </div>

        <div className='flex justify-between items-end px-2 ms-auto w-[50%]'>

          {totalpages > 0 &&
            <ThemeProvider theme={theme}>
              <div style={{ marginTop: '20px' }}>
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
          {totalpages > 0 &&
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm">
                Showing {startIndex} – {endIndex} of {totallist} students
              </p>
            </div>
          }
        </div>

      </div>

      <Modal
        isOpen={update}
        onRequestClose={() => setUpdate(true)}
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
            padding: '1rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: 'max-content',
            height: '600px',
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 1001,
          },
        }}
      >
        <div

        >
          <div className={styles.leavereq}>
            <div className={styles.reqhead}>
              <p>Leave Request</p>
              <MdClose className={styles.closeIcon} onClick={() => { setUpdate(false), setData({}), setReason(''), setReasonerror('') }} />
            </div>
            <div className={styles.div}>
              <div className={styles.profile}>
                <p>Profile</p>
                <div className={styles.profilediv}>
                  <img src={data?.userDetails?.profileURL} alt="" />
                </div>
              </div>
              <div className={styles.grid}>
                <div className={styles.grid1}>
                  <label for="">Student Name</label>
                  <input type="text" style={{ color: 'grey', cursor: 'not-allowed' }} placeholder="Enter student name" value={data?.userDetails?.name} disabled />
                </div>
                <div className={styles.grid1}>
                  <label for="">Phone Number</label>
                  <input type="tel" style={{ color: 'grey', cursor: 'not-allowed' }} placeholder="Enter phone number" value={data?.userDetails?.mobileNo} disabled />
                </div>
              </div>
              <div className={styles.grids}>
                <div className={styles.grid2}>
                  <label for="">
                    Duration
                  </label>
                  {data?.isPermission || data?.isEarlyPermission ?
                    <input type="text" style={{ color: 'grey', cursor: 'not-allowed' }} placeholder="no of days" value={formatTimehours(data?.permissionTime)} disabled /> :
                    <input type="text" style={{ color: 'grey', cursor: 'not-allowed' }} placeholder="no of days" value={data?.noOfDays} disabled />}
                </div>
                <div className={styles.grid2}>
                  <label for="">From</label>
                  {data?.isPermission || data?.isEarlyPermission ? <input disabled className={styles.dateinput} value={formatTime(data?.startTime)}
                  /> :
                    <input style={{ color: 'grey', cursor: 'not-allowed' }} disabled className={styles.dateinput} value={data?.fromDate ? data.fromDate.slice(0, 10) : ""}
                    />}

                </div>
                <div className={styles.grid2}>
                  <label for="">To</label>
                  {data?.isPermission || data?.isEarlyPermission ? <input style={{ color: 'grey', cursor: 'not-allowed' }} disabled className={styles.dateinput} value={formatTime(data?.endTime)}
                  /> :
                    <input style={{ color: 'grey', cursor: 'not-allowed' }} disabled className={styles.dateinput} value={data?.toDate ? data.toDate.slice(0, 10) : ""}
                    />
                  }
                </div>
              </div>
              <div className={styles.gridss}>
                <div className={styles.grid3}>
                  <label>Description</label>
                  <textarea
                    disabled
                    style={{ color: 'grey', cursor: 'not-allowed' }}
                    placeholder="Enter description"
                    className={styles.description}
                    value={data?.discription}
                  ></textarea>
                </div>
              </div>
              <div className={styles.gridss}>
                <div className={styles.grid3}>
                  <label>Reason <span style={{ color: "red" }}>*</span></label>
                  <textarea
                    placeholder="Enter Reason"
                    className={styles.description}
                    value={reason}
                    onChange={(e) => { setReason(e.target.value), setReasonerror('') }}
                  ></textarea>
                  {reasonerror && <p style={{ color: "red", fontSize: "12px" }}>{reasonerror}</p>}

                </div>
              </div>
              <div className={styles.gridsss}>
                <button className={styles.rejectBtn} onClick={() => handleUpdateClick(data?._id, 'Rejected', adminId, reason)}>  Reject</button>
                <button className={styles.acceptBtn} onClick={() => handleUpdateClick(data?._id, 'Approved', adminId, reason)}>Accept</button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default LeaveRequest
