import { React, useState, useEffect } from 'react'
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { BiSearchAlt } from "react-icons/bi";
import { PlusIcon } from '@heroicons/react/24/solid';
import profile from '../../assets/dashboardimgs/profile.png';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Outlet, useNavigate } from 'react-router-dom';
import { excelStudents, getUser } from '../../api/Serviceapi';
import CloseIcon from '@mui/icons-material/Close';
import { deleteUserId, getBatchbyid, getBatchName } from '../../api/Serviceapi';
import Addstudent from '../Addstudent/Addstudent';
import Modal from 'react-modal';
import styles from './Studentlist.module.css'
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import { IoIosCloseCircle } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

const Studentlist = () => {
  const [limit, setlimit] = useState(10);
  const [totaluser, settotal] = useState(0);
  const [totalpages, setpage] = useState(0);
  const [offset, setoffset] = useState(1);
  const navigate = useNavigate()
  const [users, setUser] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [course, setCourse] = useState([])
  const [batch, setBatch] = useState([])
  const [activestatus, setActiveStatus] = useState(() => localStorage.getItem('activestatus') || '');
  const [status, setStatus] = useState(() => localStorage.getItem('status') || '');
  const [courseId, setCourseId] = useState(() => localStorage.getItem('courseId') || '');
  const [batchId, setBatchId] = useState(() => localStorage.getItem('batchId') || '');
  const [searchText, setSearchText] = useState(() => localStorage.getItem('searchText') || '');

  // Calculate visible range
  const startIndex = (offset - 1) * limit + 1;
  const endIndex = Math.min(offset * limit, totaluser);

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

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setoffset(1);
  };

  const [deleteOpen, setDeleteOpen] = useState(false)

 useEffect(() => {
  localStorage.setItem('activestatus', activestatus);
  localStorage.setItem('status', status);
  localStorage.setItem('courseId', courseId);
  localStorage.setItem('batchId', batchId);
  localStorage.setItem('searchText', searchText);
}, [activestatus, status, courseId, batchId, searchText]);

  const handlefilterSearch = () => {
    setActiveStatus('');
    setStatus('');
    setCourseId('');
    setBatchId('');
    setSearchText('');
    localStorage.removeItem('activestatus');
    localStorage.removeItem('status');
    localStorage.removeItem('courseId');
    localStorage.removeItem('batchId');
    localStorage.removeItem('searchText');
  };

  useEffect(() => {
    getBatchname()
  }, []);

 let getBatchnameid = async (id) => {
  try {
    const res = await getBatchbyid(id);
    const course = res?.data?.data?.find(c => c._id === id);

    const batches = course?.batches
      ? Array.isArray(course.batches)
        ? course.batches
        : [course.batches]
      : [];

    setBatch(batches);

    // ✅ only clear batchId if it doesn’t exist in this course’s batches
    if (!batches.some(b => b._id === batchId)) {
      setBatchId('');
    }
  } catch (error) {
    console.error("error", error.response?.data || error);
  }
};



  let getBatchname = async () => {
    try {
      const res = await getBatchName();

      // Extract imageURL from backend response

      // console.log(res?.data?.data, 'dasdasdada')
      setCourse(res?.data?.data)


    } catch (error) {
      console.error("error", error.response?.data || error);
    }
  };
  // const [searchText, setSearchText] = useState('');


  const handleSearchChange = (e) => {
    setoffset(1)
    setSearchText(e.target.value);
    setUser([])
  };


  useEffect(() => {
    const totalPages = Math.ceil(totaluser / limit);
    setpage(totalPages);
  }, [totaluser, limit]);



  const handlePageChange = (event, value) => {
    if (value !== offset) {
      setoffset(value);
    } else {
      getuserlist(); // reload if same page clicked
    }
  };


  useEffect(() => {
    getuserlist()
    // getBatchname()
  }, [offset, searchText, courseId, status, batchId, activestatus]);



  const [loading, setLoading] = useState(true);

  let getuserlist = async () => {
    setLoading(true); // start loading
    await getUser(limit, offset - 1, searchText, courseId, status, batchId, activestatus)
      .then((res) => {
        setUser(res?.data?.data?.data);
        settotal(res?.data?.data?.totalCount);
      })
      .catch((err) => console.error('Error fetching user:', err))
      .finally(() => setLoading(false)); // stop loading
  };




  const handleClearSearch = () => {
    setUser([])
    setSearchText('');
    setoffset(1);
  };

  const statusChange = (event) => {
    setActiveStatus(event.target.value);
    setoffset(1)
  }

  const handleDelete = async (id) => {
    try {
      await deleteUserId(id);
      getuserlist(); // refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const [id, setId] = useState('')

  // const handlefilterSearch = () => {
  //   setActiveStatus('');
  //   setCourseId('');
  //   setBatchId('');
  //   setStatusName('')
  // }

  let getExcel = async () => {
    try {
      let res = await excelStudents(courseId, batchId, status, activestatus, searchText);
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

  // 👇 This ensures batch dropdown refills when you come back from view page
useEffect(() => {
  if (courseId) {
    getBatchnameid(courseId);
  } else {
    setBatch([]);
  }
}, [courseId]);

  // 👇 after you already defined getBatchnameid() and have batchId in state
  useEffect(() => {
    if (batch.length > 0 && batchId) {
      // ensure that the batchId exists in the new batch list
      const found = batch.some((b) => b._id === batchId);
      if (!found) {
        setBatchId(''); // reset if the stored ID doesn’t exist in this course
      }
    }
  }, [batch, batchId]);



  return (

    <>
      <ToastContainer

      />

      <div style={{ paddingBottom: '100px' }}>
        <div className='p-4  Outlet' >
          <div className="flex justify-between items-center lg:flex-row md:flex-row flex-col">
            <h4 className='text-xl font-normal'>Student Management</h4>
            <div className=' flex items-end md:justify-around flex-wrap  p-2 gap-1 '>

              <div style={{ width: '130px', }}>
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
                    value={activestatus}
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

                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>

                  </Select>
                </FormControl>
              </div>
              <div >

                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{
                    // minWidth: 120,
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
                      border: 'none'
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="ongoing">Ongoing</MenuItem>
                    <MenuItem value="placed">Placed</MenuItem>
                    {/* <MenuItem value="dropout">Dropout</MenuItem> */}

                    {/* {course.map((item, index) => {
                    return (
                      <MenuItem value={item.courseName} key={index}>{item.courseName}</MenuItem>
                    )
                  })} */}
                  </Select>

                </FormControl>
              </div>
              <div >

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

              <div >

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
                    {batch.map((item, index) => {
                      return (
                        <MenuItem value={item._id} key={index}>{item.batchName}</MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
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
                {(activestatus?.toString().trim() || status || courseId?.toString().trim() || batchId?.toString().trim()) && (
                  <button className={styles.clear} onClick={handlefilterSearch}>
                    <IoIosCloseCircle />
                  </button>
                )}

              </div>
              <div className={styles.button}>
                <button onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }} className='text-[#FFFFFF] bg-gradient-to-b from-[#144196] to-[#061530]  px-[20px] w-fit py-2 rounded-md mr-2 flex items-center justify-between'><PlusIcon className='w-4 h-4 text-[600]' />Add Student</button>
              </div>

            </div>
          </div>

          <div className='flex justify-end mt-4'>
            <button className='bg-gradient-to-b from-[#144196] to-[#061530] text-white px-1 py-1 rounded-md flex items-center flex-end gap-1 cursor-pointer' onClick={getExcel}>Export<MdOutlineFileDownload />
            </button>
          </div>
          <div className='overflow-x-auto w-full '>
            <table className="w-full  rounded-md  text-sm  ">
              <thead className="bg-white  ">
                <tr className="bg-[#F8F8F8] text-left ">
                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Profile</th>
                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">ID No</th>
                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Name</th>
                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Mobile</th>

                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Mail</th>
                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Password</th>

                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Course</th>
                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Batch</th>
                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Active</th>

                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Status</th>
                  <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold text-center" colSpan={2}>Action</th>
                </tr>
              </thead>
              <tbody className="bg-white text-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan="11" className="text-center py-20 text-lg text-gray-500 font-semibold">
                      <Loader />
                    </td>
                  </tr>
                ) : Array.isArray(users) && users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="border-b border-[#0000001A] hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <img src={user.profileURL || profile} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
                      </td>
                      <td className="px-4 py-2">{user.studentId}</td>
                      <td className="px-4 py-2 capitalize">{user.name}</td>
                      <td className="px-4 py-2">{user.mobileNo}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">{user.password}</td>
                      <td className="px-4 py-2">{user?.courseDetails?.courseName}</td>
                      <td className="px-4 py-2">{user?.batchDetails?.batchName || '-'}</td>
                      <td
                        className="px-4 py-2 capitalize"
                        style={{ color: user.status === 'active' ? 'green' : 'red' }}
                      >
                        {user?.status || '-'}
                      </td>
                      <td
                        className={`px-4 py-2 font-medium ${user.inStatus === 'completed'
                          ? 'text-green-500'
                          : user.inStatus === 'placed'
                            ? 'text-yellow-500'
                            : user.inStatus === 'ongoing'
                              ? 'text-blue-700'
                              : ''
                          }`}
                      >
                        {user.inStatus}
                      </td>
                      <td className="px-4 py-2 space-x-2 text-sm">
                        <button
                          className="text-blue-700 flex items-center gap-1 cursor-pointer"
                          onClick={() => navigate(`/students/studentview/${user._id}`)}
                        >
                          <VisibilityIcon /> View
                        </button>
                      </td>

                      {/* <td className="px-4 py-2 space-x-2 text-sm">
            <button
              className="text-red-600 flex items-center gap-1 cursor-pointer"
              onClick={() => { setDeleteOpen(true); setId(user._id) }}
            >
              <DeleteOutlineIcon /> Delete
            </button>
          </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-20 text-lg text-gray-500 font-semibold">
                      <img src={nodata} alt="" width="200" height="200" className="m-auto" />
                      <p>No Data Found</p>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>

        </div>
        <div className='flex justify-between items-end ms-auto w-[50%]'>

          {totalpages > 0 &&

            <ThemeProvider theme={theme}>
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

        <Modal
          isOpen={isOpen}
          onRequestClose={() => setIsOpen(true)}
          contentLabel="Add Student"
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
              padding: '2rem',
              backgroundColor: '#fff',
              borderRadius: '8px',
              width: '800px',
              height: '600px',
              overflow: 'auto',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 1001,
            },
          }}
        >
          <Addstudent closeModal={() => setIsOpen(false)} onStudentAdded={getuserlist} />
        </Modal>


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
          <p className={styles.popmessage}>Are you sure you want to delete this student</p>
          <div className='flex gap-4 justify-center mt-10'>
            <button onClick={() => { setDeleteOpen(false); handleDelete(id) }}
              className={styles.popyes} >Yes</button>
            <button className={styles.popno} onClick={() => setDeleteOpen(false)}>No</button>
          </div>
        </Modal>

      </div>
    </>
  )
}

export default Studentlist