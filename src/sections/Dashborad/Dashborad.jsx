import React, { useEffect, useState } from 'react'
import dashboradcss from './Dashborad.module.css'
import profile from '../../assets/dashboardimgs/profile.png'
import profile1 from '../../assets/dashboardimgs/profile1.png'
import profile2 from '../../assets/dashboardimgs/profile2.png'
import profile3 from '../../assets/dashboardimgs/profile3.png'
import profileicon from '../../assets/dashboardimgs/profile_icon.png'
import resizeicon from '../../assets/dashboardimgs/re-size.png'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
    CircularProgressbarWithChildren,
    buildStyles
} from 'react-circular-progressbar';
import nodata from '../../assets/trans.png'
import 'react-circular-progressbar/dist/styles.css';
import { Link, Links } from 'react-router-dom'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { getAttendancerate, getDashboardAttendencerate, getDashboardEvents, getDashboardLeave, getDashboardUser, getTodayrate, studentCount } from '../../api/Serviceapi'
import {
    getDashboardTermToppers,
    getDashboardSemesterToppers,
} from "../../api/Serviceapi";

export const Dashboard = () => {
    const [days, setdays] = useState('this_week');
    const [studentList, setStudentList] = useState([])
    const [eventList, setEventList] = useState([])
    const [leaveList, setLeaveList] = useState([])
    const [todayAttendance, setToday] = useState()
    const [date, setDate] = useState('')
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState('');
    const [leavestatus, setLeaveStatus] = useState('');

    const todayDate = new Date().toLocaleDateString("en-CA");


    const [Attendance, setAttendance] = useState([])
    const [termToppers, setTermToppers] = useState([]);
    const [semesterToppers, setSemesterToppers] = useState([]);
    const [term, setTerm] = useState("Term 1");
    const [semester, setSemester] = useState("Semester 1");
    useEffect(() => {
        getTermToppers();
    }, [term]);

    useEffect(() => {
        getSemesterToppers();
    }, [semester]);
    const getTermToppers = async () => {
        const res = await getDashboardTermToppers(term);

        const filtered = (res?.data?.data || [])
            .filter(item => item.Academic === term)
            .sort((a, b) => b.average - a.average);

        setTermToppers(filtered);
    };

    const getSemesterToppers = async () => {
        const res = await getDashboardSemesterToppers(semester);

        const filtered = (res?.data?.data || [])
            .filter(item =>
                item.Academic === semester ||
                (semester === "Semester 2" && item.Academic === "Sem 2")
            )
            .sort((a, b) => b.average - a.average);

        setSemesterToppers(filtered);
    };


    useEffect(() => {
        studentlist()
    }, [])
    useEffect(() => {
        eventlist()
    }, [status])
    useEffect(() => {
        leavelist()
    }, [leavestatus])
    useEffect(() => {
        countStudent()
    }, [])
    let studentlist = async () => {
        try {
            let res = await getDashboardUser()
            setStudentList(res?.data?.data?.data)

        } catch (err) {
            console.log(err)
        }
    }
    const [studentData, setStudentData] = useState(null);


    let countStudent = async () => {
        try {
            let res = await studentCount();
            setStudentData(res?.data?.data?.[0]); // since your API returns array inside data
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {

        const formattedDate = new Date().toLocaleDateString("en-CA");
        setDate(formattedDate);
    }, []);

    useEffect(() => {
        countStudent();
    }, []);

    useEffect(() => {
        attendanceRate();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0"); // ensures 03 instead of 3
        const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase(); // "SEP"
        const year = date.getFullYear();
        return { day, month, year };
    };

    const statusChange = (event) => {
        setStatus(event.target.value);
    }

    let eventlist = async () => {
        try {
            let res = await getDashboardEvents(status)
            setEventList(res?.data?.data?.data)
        } catch (err) {
            console.log(err)
        }
    }

    let leavelist = async () => {
        try {
            let res = await getDashboardLeave(leavestatus)
            setLeaveList(res?.data?.data?.result)
        } catch (err) {
            console.log(err)
        }
    }

    let attendanceRate = async () => {
        try {
            let res = await getTodayrate()
            setToday(res?.data?.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (!date) return;

        attendanceDashboradRate()
    }, [date])

    let attendanceDashboradRate = async () => {
        try {
            let res = await getDashboardAttendencerate(date)
            setAttendance(res?.data?.data)
        } catch (err) {
            console.log(err)
        }
    }
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const weekday = today.toLocaleDateString("en-GB", { weekday: "long" });
    const displayDate = `${formattedDate}, ${weekday}`;

    const handleLeaveStatusChange = (e) => {
        setLeaveStatus(e.target.value)
    }


    return (
        <>
            <div className={dashboradcss.dashboradcontainer}>
                <div className="flex justify-between items-center">
                    <h4 className=' m-[10px] text-xl font-normal'>Dashboard Overview</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-1 ">
                    <div className={dashboradcss.dashcard}>
                        <div className="flex justify-between items-center">
                            <div><p className=' text-lg font-normal'>Total Students</p></div>
                            <div className={dashboradcss.profileicon}><img src={profileicon} alt="" width={'100%'} /></div>
                        </div>
                        <div className={dashboradcss.dashcount}>{studentData?.totalStudents ?? 0}</div>
                        <div className="flex justify-between items-center">

                            <div className={dashboradcss.avatars}>
                                {studentData?.userDetails?.slice(0, 3).map((user, i) => (
                                    <img key={i} src={user.profileURL} alt={user.name} width={'100%'} />
                                ))}
                            </div>

                            <div className={dashboradcss.avatar_text}>
                                {studentData?.userDetails?.slice(0, 2).map((s, i) => (
                                    <Link to="/students" key={i}> <span key={i}>
                                        {s.name}
                                        {i < Math.min(studentData?.userDetails?.length, 3) - 1 && ", "}
                                    </span></Link>
                                ))}

                                {studentData?.totalStudents > 2 && (
                                    <>
                                        <Link to="/students">  +{studentData?.totalStudents - 2} <span>others</span></Link>
                                    </>
                                )}
                            </div>

                        </div>
                    </div>
                    <div className={dashboradcss.dashcard}>
                        <div className="flex justify-between items-center">
                            <div><p className=' text-lg font-normal'>Active Students</p></div>
                            <div className={dashboradcss.profileicon}><img src={profileicon} alt="" width={'100%'} /></div>
                        </div>
                        <div className={dashboradcss.dashcount}>      {studentData?.activeStudents ?? 0}
                        </div>
                        <div className="flex justify-between items-center">

                            <div className={dashboradcss.avatars}>
                                {studentData?.userDetails?.slice(0, 3).map((user, i) => (
                                    <img key={i} src={user.profileURL} alt={user.name} width={'100%'} />
                                ))}
                            </div>

                            <div className={dashboradcss.avatar_text}>
                                {studentData?.userDetails?.slice(0, 2).map((s, i) => (
                                    <Link to="/students" key={i}> <span key={i}>
                                        {s.name}
                                        {i < Math.min(studentData?.userDetails?.length, 3) - 1 && ", "}
                                    </span></Link>
                                ))}

                                {studentData?.totalStudents > 2 && (
                                    <>
                                        <Link to="/students">   +{studentData?.totalStudents - 2} <span>others</span></Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={dashboradcss.dashcard} >
                        <div className="flex justify-between items-center">
                            <div><p className=' text-lg font-normal'>Attendance rate</p><p className={dashboradcss.dashdate}>{displayDate}</p></div>
                            <div className={dashboradcss.profileicon}><img src={profileicon} alt="" width={'100%'} /></div>
                        </div>
                        <div className="flex justify-between items-center pt-[20px]">
                            <div className={dashboradcss.dashcount}>{todayAttendance?.attendanceRate}</div>
                            <Link to='/attendence'><div className={dashboradcss.avatar_text}>ViewDetails</div></Link>
                        </div>
                    </div>

                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 ">
                    <div className={dashboradcss.dashcard} style={{ height: '420px', overflowY: 'hidden' }} >
                        <div className="flex justify-between items-center mx-2 mb-[20px]">
                            <div><h4 className=' text-lg font-normal'>Leave Request</h4></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FormControl
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        minWidth: 120,
                                        backgroundColor: '#ffffff', // match the image background
                                        borderRadius: '6px',
                                        border: 'none'
                                    }}
                                >
                                    <Select
                                        value={leavestatus}
                                        onChange={handleLeaveStatusChange}
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

                                        <MenuItem value="Approved">Approved</MenuItem>
                                        <MenuItem value="Rejected">Rejected</MenuItem>

                                    </Select>
                                </FormControl>
                                <div>
                                    <Link to={`/attendence/leaverequest/${todayDate}//`}><img src={resizeicon} alt="resizeicon" /></Link>
                                </div>

                            </div>
                        </div>
                        <div style={{ height: '400px', overflowY: 'auto', paddingBottom: '40px' }} >
                            {leaveList?.length > 0 ? (
                                leaveList.map((leave) => (
                                    <div
                                        key={leave._id}
                                        className="flex justify-between items-center py-[10px] border-b-[2px] border-b-[#0000001A] border-b-solid"
                                    >
                                        {/* Left section */}
                                        <div className="flex items-center">
                                            <div className="w-[50px] h-[50px] rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#fff] border-solid">
                                                <img
                                                    src={leave?.userDetails?.profileURL || "/default-avatar.png"}
                                                    alt="profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="mx-2">
                                                <h6 className="text-[14px]">{leave?.userDetails?.name || "Unknown User"}</h6>
                                                <p className="text-[12px] font-[400] text-[#888484]">
                                                    ID: {leave?.userDetails?.studentId || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status button */}
                                        <div>
                                            <button
                                                className="text-[14px] p-[5px] w-[100px] mx-[10px] rounded-lg"
                                                style={{
                                                    background:
                                                        leave?.status === "Rejected"
                                                            ? "#FFD6D6"
                                                            : leave?.status === "Created"
                                                                ? "#D7E9FF"
                                                                : leave?.status === "Approved"
                                                                    ? "#C5FFD8"
                                                                    : "#f1f1f1",
                                                    color:
                                                        leave?.status === "Rejected"
                                                            ? "#F81111"
                                                            : leave?.status === "Created"
                                                                ? "#2274D4"
                                                                : leave?.status === "Approved"
                                                                    ? "#08792E"
                                                                    : "#333",
                                                }}
                                            >
                                                {leave?.status}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div>
                                    <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                                    <p className="text-center text-gray-500 font-semibold">No Data Found</p>
                                </div>
                            )}


                        </div>
                    </div>
                    <div className={dashboradcss.dashcard}>
                        <div className='flex justify-between flex-col h-100'>
                            <div className="flex justify-between items-center mb-[20px] mx-2">
                                <div><h4 className=' text-lg font-normal'>Attendance Rate</h4></div>
                                <div style={{ width: '150px', }}>
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
                            </div>

                            <div style={{ width: 200, height: 200, margin: 'auto', display: 'block' }}>
                                <CircularProgressbarWithChildren
                                    value={parseFloat(Attendance.attendanceRate)}
                                    styles={buildStyles({
                                        pathColor: 'url(#gradient)',
                                        trailColor: '#eee',
                                        strokeLinecap: 'butt',
                                    })}
                                >

                                    <svg style={{ height: 0 }}>
                                        <defs>
                                            <linearGradient id="gradient" gradientTransform="rotate(90)">
                                                <stop offset="0%" stopColor="#144196" />
                                                <stop offset="100%" stopColor="#061530" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div style={{ fontSize: 24, fontWeight: 'bold' }}>{Attendance.attendanceRate}</div>
                                </CircularProgressbarWithChildren>
                            </div>

                            <div className='flex justify-between '>
                                <div style={{ color: 'green', fontSize: '14px' }}>No of student present: {Attendance.fetchCount}</div>

                                <div style={{ color: 'red', fontSize: '14px' }}>No of student absent: {Attendance.leaveApproved}</div>
                            </div>
                        </div>

                    </div>
                    <div className={`${dashboradcss.dashcard} row-span-3`} style={{ height: '741px', overflowY: 'hidden' }}>
                        <div className="flex justify-between items-center mx-2 mb-[20px]">
                            <div><h4 className=' text-lg font-normal'>Events</h4></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FormControl
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        minWidth: 120,
                                        backgroundColor: '#ffffff', // match the image background
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
                                        <MenuItem value="">All</MenuItem>

                                        <MenuItem value="upcoming">Upcoming</MenuItem>
                                        <MenuItem value="ongoing">Ongoing</MenuItem>
                                        <MenuItem value="completed">Completed</MenuItem>

                                    </Select>
                                </FormControl>
                                <div><Link to='/events'><img src={resizeicon} alt="resizeicon" /></Link></div>

                            </div>

                        </div>
                        <div style={{ height: '680px', overflowY: 'scroll', paddingBottom: '20px' }}>
                            {eventList?.length > 0 ? (
                                eventList.map((item) => {
                                    const { day, month, year } = formatDate(item.date);
                                    return (
                                        <div key={item._id} className="flex justify-around items-center py-[10px] border-b-[2px] border-b-[#0000001A] border-b-solid">
                                            <div className="flex items-center w-[70%]">

                                                <div>
                                                    <h6 className=' text-[17px] text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-[500] my-1' style={{ textTransform: 'capitalize' }}>{item?.title}</h6>
                                                    <p className='text-[13px] text-[#555]' style={{ textTransform: 'capitalize' }}>
                                                        {item?.description}                                            </p>
                                                    <div className='text-[13px] text-[#06752B] px-[10px] bg-[#D1FFC2] rounded inline-block my-2' style={{
                                                        background: item.status === 'upcoming' && '#FFCA96' || item.status === 'ongoing' && '#D7E9FF' || item.status === 'completed' && '#D1FFC2',
                                                        color: item.status === 'upcoming' && '#8D4600' || item.status === 'ongoing' && '#2274D4' || item.status === 'completed' && '#06752B',

                                                    }}>{item?.status}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className='bg-[#D9D9D9] px-[5px] py-[5px]  rounded-lg text-center'>
                                                    <h5 className='text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-[600]'>{day}</h5>
                                                    <p className='text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-[600] text-[13px]'>{month} {year}</p>
                                                    <p className='text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]  text-[12px]'>{item?.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div>
                                    <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                                    <p className="text-center text-gray-500 font-semibold">No Data Found</p>
                                </div>

                            )}
                        </div>

                    </div>
                    <div className={`${dashboradcss.dashcard} lg:col-span-2 md:col-span-2 col-span-1 mt-2 h-100`} style={{ height: '300px', overflowY: 'hidden' }}>
                        <div className="flex justify-between items-center mx-2 my-[10px]">
                            <div><h4 className=' text-lg font-normal'>Student List</h4></div>
                            <div><Link to='/students'><img src={resizeicon} alt="resizeicon" /></Link></div>
                        </div>

                        <div className="overflow-x-auto " style={{ height: '300px', overflowY: 'scroll', paddingBottom: '60px' }}>
                            <table className="min-w-full text-sm text-left rounded-[10px] overflow-hidden">
                                <thead className="bg-[#ffff]">
                                    <tr >
                                        <th className="px-4 py-3 text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-semibold">Profile</th>
                                        <th className="px-4 py-3 text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-semibold">ID No</th>
                                        <th className="px-4 py-3 text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-semibold">Name</th>
                                        <th className="px-4 py-3 text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-semibold">Mobile</th>
                                        <th className="px-4 py-3 text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-semibold">Course</th>
                                        <th className="px-4 py-3 text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-semibold">Batch</th>
                                        <th className="px-4 py-3 text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentList.map((item) => (
                                        <tr className="border-b border-gray-200" key={item?._id}>
                                            <td className="px-4 py-3">
                                                <img src={item?.profileURL} alt="Profile" className="rounded-full w-10 h-10" />                                           </td>
                                            <td className="px-4 py-3">{item?.studentId}</td>
                                            <td className="px-4 py-3" style={{ textTransform: 'capitalize' }}>{item?.name}</td>
                                            <td className="px-4 py-3">{item?.mobileNo}</td>
                                            <td className="px-4 py-3">{item?.courseDetails?.courseName}</td>
                                            <td className="px-4 py-3">{item?.batchDetails?.batchName}</td>
                                            <td className="px-4 py-3 text-green-500 font-medium" style={item?.inStatus === 'ongoing' ? { color: '#1D4ED8' } : ''}>{item.inStatus}</td>
                                        </tr>
                                    ))}


                                </tbody>
                            </table>
                        </div>


                    </div>
                </div>
                {/* ================= TOPPERS SECTION ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4 mt-4">

                    <div className={dashboradcss.dashcard} style={{ height: "320px",overflow:'auto' }}>
                        <div className="flex justify-between items-center mx-2 mb-3">
                            <h4 className="text-lg font-normal">Term Wise Toppers</h4>

                            <FormControl size="small">
                                <Select
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    IconComponent={KeyboardArrowDownIcon}
                                    sx={{ height: "32px" }}
                                >
                                    <MenuItem value="Term 1">Term 1</MenuItem>
                                    <MenuItem value="Term 2">Term 2</MenuItem>
                                    <MenuItem value="Term 3">Term 3</MenuItem>
                                    <MenuItem value="Term 4">Term 4</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        {termToppers.length > 0 ? (
                            termToppers.map((s, i) => (
                                <div
                                    key={s._id}
                                    className="flex justify-between items-center px-3 py-2 border-b"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">{i + 1}</span>

                                        <img
                                            src={s.userDetails?.profileURL}
                                            className="w-10 h-10 rounded-full"
                                            alt="profile"
                                        />

                                        <div>
                                            <p className="text-sm">
                                                {s.userDetails?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {s.courseDetails?.courseName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="font-semibold">
                                        {s.average}%
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 mt-10">
                                No Data Found
                            </p>
                        )}

                    </div>


                    <div className={dashboradcss.dashcard} style={{ height: "320px",overflow:'auto' }}>
                        <div className="flex justify-between items-center mx-2 mb-3">
                            <h4 className="text-lg font-normal"> Semester Wise Toppers</h4>

                            <FormControl size="small">
                                <Select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    IconComponent={KeyboardArrowDownIcon}
                                    sx={{ height: "32px" }}
                                >
                                    <MenuItem value="Semester 1">Semester 1</MenuItem>
                                    <MenuItem value="Semester 2">Semester 2</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        {semesterToppers.length > 0 ? (
                            semesterToppers.map((s, i) => (
                                <div
                                    key={s._id}
                                    className="flex justify-between items-center px-3 py-2 border-b"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">{i + 1}</span>

                                        <img
                                            src={s.userDetails?.profileURL}
                                            className="w-10 h-10 rounded-full"
                                            alt="profile"
                                        />

                                        <div>
                                            <p className="text-sm">
                                                {s.userDetails?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {s.courseDetails?.courseName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="font-semibold">
                                        {s.average}%
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 mt-10">
                                No Data Found
                            </p>
                        )}

                    </div>

                </div>

            </div>
        </>

    )
}

export default Dashboard;
