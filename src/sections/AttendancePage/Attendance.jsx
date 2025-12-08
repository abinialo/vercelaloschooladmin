import React, { useEffect, useState } from "react";
import styles from "./Attendance.module.css";
import { FaArrowRight } from "react-icons/fa";
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { BiSearchAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { excelAttendance, getAttendance, getAttendancerate, getBatchbyid, getBatchName } from "../../api/Serviceapi";
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import nodata from '../../assets/nodata.jpg'
import Loader from "../../component/loader/Loader";
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
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
const Attandance = () => {
  const [limit, setlimit] = useState(10);
  const [totallist, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);
  const [showtable, setshowtable] = useState(false);
  const [showreq, setshowreq] = useState(false);
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [rate, setRate] = useState()
  const [course, setCourse] = useState([])
  const [batch, setBatch] = useState([])
  // const [batchId, setBatchId] = useState('')
  // const [courseId, setCourseId] = useState('')
  // const [date, setDate] = useState('')
  const [open, setOpen] = useState(false)
  const [deleteevent, setDelete] = useState(false)
  const [loading, setLoading] = useState(false)
  // const [status, setStatus] = useState('');
  const [courseId, setCourseId] = useState(() => localStorage.getItem('att_courseId') || '');
  const [batchId, setBatchId] = useState(() => localStorage.getItem('att_batchId') || '');
  const [status, setStatus] = useState(() => localStorage.getItem('att_status') || 'false');
  const [date, setDate] = useState(() => {
    const saved = localStorage.getItem('att_date');
    return saved ? dayjs(saved).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
  });
  const [searchText, setSearchText] = useState(() => localStorage.getItem('att_searchText') || '');



  // Calculate visible range
  const startIndex = (offset - 1) * limit + 1;
  const endIndex = Math.min(offset * limit, totallist);

  function handleClick(date, courseId, batchId, searchText) {
    const params = new URLSearchParams();

    // if (date) params.append("date", date);
    if (courseId) params.append("courseId", courseId);
    if (batchId) params.append("batchId", batchId);
    if (searchText) params.append("search", searchText);

    navigate(`/attendence/leaverequest?${params.toString()}`);
  }

  useEffect(() => {
    const totalPages = Math.ceil(totallist / limit);
    setpage(totalPages);
  }, [totallist, limit]);


  const handlePageChange = (event, value) => {
    setList([]);
    if (value === offset) {
      // same page clicked -> call API again
      getAttendanceList()
    } else {
      setoffset(value); // triggers useEffect when page changes
    }
  };

  // const [searchText, setSearchText] = useState('');


  const handleSearchChange = (e) => {
    setoffset(1)
    setSearchText(e.target.value);
    setList([])

  };

  useEffect(() => {
    localStorage.setItem('att_courseId', courseId);
    localStorage.setItem('att_batchId', batchId);
    localStorage.setItem('att_status', status);
    localStorage.setItem('att_date', date ? dayjs(date).format('YYYY-MM-DD') : '');
    localStorage.setItem('att_searchText', searchText);
  }, [courseId, batchId, status, date, searchText]);


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

  // useEffect(() => {
  //   setDate(dayjs().format("YYYY-MM-DD"));
  // }, []);


  useEffect(() => {
    getBatchname()
  }, []);

  let getBatchnameid = async (id) => {
    try {
      const res = await getBatchbyid(id);
      console.log(res?.data?.data, 'batchdasdasd')
      const course = res?.data?.data?.find(c => c._id === id);
      setBatch(
        course?.batches
          ? Array.isArray(course.batches)
            ? course.batches
            : [course.batches]
          : []
      );
      setBatchId("");
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


  useEffect(() => {
    if (!date) return;
    getAttendanceList()
  }, [offset, searchText, courseId, batchId, date, status])
  let getAttendanceList = async () => {
    setLoading(true);
    try {
      let res = await getAttendance(limit, offset - 1, searchText, courseId, batchId, date, status)
      console.log('l', date)
      setList(res.data?.data?.data)
      settotal(res.data?.data?.totalCount)
    } catch (err) {
      console.log(err)
    } finally { setLoading(false) };
  }

  const handleClearSearch = () => {
    setList([])
    setSearchText('');
    setoffset(1);
  };
  useEffect(() => {
    if (!date) return;

    getattendancerate(date, courseId, batchId)
  }, [date, courseId, batchId])

  const [rateLoading, setRateLoading] = useState(false)
  let getattendancerate = async () => {
    setRateLoading(true)
    try {
      let res = await getAttendancerate(date, courseId, batchId)
      console.log(res.data?.data, 'j')
      setRate(res.data?.data)
    } catch (err) {
      console.log(err)
    } finally { setRateLoading(false) };
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




  const statusChange = (event) => {
    setStatus(event.target.value);
    setoffset(1)
  }
  const handlefilterSearch = () => {
    setCourseId('');
    setBatchId('');
    setStatus(false);
    setDate(dayjs().format('YYYY-MM-DD'));
    setSearchText('');

    localStorage.removeItem('att_courseId');
    localStorage.removeItem('att_batchId');
    localStorage.removeItem('att_status');
    localStorage.removeItem('att_date');
    localStorage.removeItem('att_searchText');
  };

  useEffect(() => {
    // Step 1: If a saved courseId exists on mount, load its batches
    if (courseId) {
      getBatchnameid(courseId).then(() => {
        // Step 2: After batches load, check if saved batchId still exists in them
        const savedBatchId = localStorage.getItem('att_batchId');
        if (savedBatchId) {
          setBatchId(savedBatchId);
        }
      });
    } else {
      setBatch([]);
    }
    // 👇 Run only once on mount
  }, []);


  let getExcel = async () => {
    try {
      let res = await excelAttendance(searchText, courseId, batchId, date, status);
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
      link.download = "userDetails.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.log("Error downloading Excel:", err);
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.attendancetop}>
        <div className={styles.attendanceleft}>
          <p>Attendance</p>
        </div>
        <div className={styles.attendanceright}>
          <div className={styles.attendancerightdiv}>

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
                  onChange={statusChange}
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
                  <MenuItem value={false}>Present</MenuItem>
                  <MenuItem value={true}>Absent</MenuItem>
                  <MenuItem value={"noLeave"}>Not Checked In</MenuItem>

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

            <div className={styles.dateWrapper}>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={date ? dayjs(date, "YYYY-MM-DD") : null}   // keep ISO date format for binding
                  onChange={(newValue) => {
                    if (newValue) {
                      const formatted = dayjs(newValue).format("YYYY-MM-DD"); // match <input type="date">
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
                          backgroundColor: ' #f2f2f2'
                        },
                        '& fieldset': {
                          border: 'none', // removes the default outline
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
              {(status?.toString().trim() || courseId?.toString().trim() || batchId?.toString().trim() || date || searchText) && (
                <button className={styles.clear} onClick={handlefilterSearch}>
                  <IoIosCloseCircle />
                </button>
              )}


            </div>
          </div>
        </div>
      </div>
      <div className='flex justify-end mt-4 w-[96%]'>
        <button className='bg-gradient-to-b from-[#144196] to-[#061530] text-white px-1 py-1 rounded-md flex items-center flex-end gap-1 cursor-pointer' onClick={getExcel}>Export<MdOutlineFileDownload />
        </button>
      </div>
      {rateLoading ?
        <div className={styles.attendancemiddle}>
          <div className={styles.attendancemiddlediv}>
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={80} height={40} />
          </div>

          <div className={styles.attendancemiddlediv}>
            <Skeleton variant="text" width={160} height={20} />
            <Skeleton variant="text" width={100} height={40} />
          </div>

          <div className={styles.attendancemiddlediv}>
            <div className={styles.attendancemiddlediv1}>
              <div>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={50} height={30} />
              </div>
              <div>
                <Skeleton variant="circular" width={40} height={40} />
              </div>
            </div>
          </div>
        </div> :
        rate &&
        <div className={styles.attendancemiddle}>
          <div className={styles.attendancemiddlediv}>
            <p>Total No of Students</p>
            <p>{rate.studentCount}</p>
          </div>
          <div className={styles.attendancemiddlediv}>
            <p>Today Attendance Rate</p>
            <p>{rate.attendanceRate}</p>
          </div>
          <div className={styles.attendancemiddlediv}>
            <div className={styles.attendancemiddlediv1}>
              <div>
                <p>Leave Requests</p>
                <p>{rate.leaveRequestCount}</p>
              </div>
              <div>
                <div className={styles.leaveReqIcon} onClick={() => {

                  handleClick(date, courseId, batchId, searchText);
                }}>
                  <FaArrowRight />
                </div>
              </div>
            </div>
          </div>
        </div>

      }

      <div className={styles.attendancebottom}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID No</th>
              <th>Mobile</th>
              <th>Course</th>
              <th>Date</th>
              <th>Break In</th>
              <th>Break Out</th>
              <th>In-Time</th>
              <th colspan="2">Out Time</th>
            </tr>
          </thead>
          {loading ?
            <tr>
              <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold" style={{ border: "none" }}>
                <Loader />
              </td>
            </tr>
            : <tbody>
              {Array.isArray(list) && list.length > 0 ?

                list.map((item) => (


                  <tr key={item._id}>
                    {item.userDetails?.name ?
                      <td style={{ color: item?.onLeave && "red", textTransform: "capitalize" }}>{item.userDetails?.name}</td>
                      :
                      <td style={{ color: item?.onLeave && "red", textTransform: "capitalize" }}>{item.name}</td>
                    }
                    {item.userDetails?.studentId ?
                      <td style={{ color: item?.onLeave && "red", textTransform: "capitalize" }}>{item.userDetails?.studentId}</td>
                      :
                      <td style={{ color: item?.onLeave && "red", textTransform: "capitalize" }}>{item.studentId}</td>
                    }
                    {item.userDetails?.mobileNo ?
                      <td style={{ color: item?.onLeave && "red", textTransform: "capitalize" }}>{item.userDetails?.mobileNo}</td>
                      :
                      <td style={{ color: item?.onLeave && "red", textTransform: "capitalize" }}>{item.mobileNo}</td>
                    }
                    <td style={{ color: item?.onLeave && "red" }}>{item.courseDetails?.courseName}</td>
                    {item.date ?
                      <td style={{ color: item?.onLeave && "red", textTransform: "capitalize" }}>{item.date?.split("T")[0]}</td>
                      :
                      <td style={{ color: item?.onLeave && "red", textTransform: "capitalize" }}>   {date}
                      </td>
                    }
                    <td style={{ color: item?.onLeave && "red" }}>{item.breakTime?.length > 0 ? item?.breakTime[0] ? formatTime(item?.breakTime[0]) : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p> : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p>}</td>
                    <td style={{ color: item?.onLeave && "red" }}>{item.breakTime?.length > 0 ? item?.breakTime[1] ? formatTime(item?.breakTime[1]) : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p> : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p>}</td>
                    <td>{item?.onLeave ? <p style={{ color: "red" }}>Leave</p> : item.inTime ? formatTime(item?.inTime) : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p>}</td>
                    <td >
                      {item?.onLeave ? '' : item.outTime ? formatTime(item?.outTime) : <p style={{ background: "none", WebkitBackgroundClip: "initial", WebkitTextFillColor: "initial" }}>--:--</p>
                      }
                    </td>
                  </tr>
                ))

                :
                <tr >
                  <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold " style={{ border: "none" }}>
                    <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                    <p className="text-center text-gray-500">No Data Found</p>
                  </td>
                </tr>

              }
            </tbody>
          }
        </table>
      </div>


      <div className='flex justify-between items-end px-2 ms-auto w-[50%]'>


        {totalpages > 0 &&
          <ThemeProvider theme={theme}>
            <div className="flex justify-end ">
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
  );
};

export default Attandance;
