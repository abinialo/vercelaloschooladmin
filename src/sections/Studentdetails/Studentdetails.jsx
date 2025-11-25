import { React, useEffect, useState } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import profile from '../../assets/dashboardimgs/profile.png';
import Import from '../../assets/dashboardimgs/Import.png';
import { Form, useParams } from 'react-router-dom';
import { attendancestudentrate, getAttendanceStudentList, getStudentAttendencemonth, getUserId, makeabsent, updatedetailsuser, updateUser } from '../../api/Serviceapi'
import Modal from 'react-modal';
import UpdateStudent from '../../component/updatestudent/UpdateStudent';
import styles from './Studentdetails.module.css';
import { IoMdArrowRoundBack } from "react-icons/io";
import Skeleton from '@mui/material/Skeleton';
import nodata from '../../assets/trans.png'
import { Switch } from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import { use } from 'react';

const Studentdetails = () => {
    const { id } = useParams();
    const [user, setUser] = useState([])
    const [fileUrl, setFileUrl] = useState('');
    const [certificateUrl, setCertificateUrl] = useState('');
    const [totalcount, setTotalcount] = useState(null)
    const [studentattendance, setAttendance] = useState({})
    const [status, setStatus] = useState(true)
    const [selectedRange, setSelectedRange] = useState([
        {
            startDate: dayjs().startOf("month").toDate(),
            endDate: dayjs().endOf("month").toDate(),
            key: "selection",
        },
    ]);
    const { RangePicker } = DatePicker;

    useEffect(() => {

        getUserById(id);
    }, [id]);

    useEffect(() => {
        attdancemonth()
    }, [])

    useEffect(() => {
        attendancelist()
    }, [])


    const [loading, setLoading] = useState(false);
    const getUserById = (id) => {
        setLoading(true);
        getUserId(id)
            .then((res) => {
                const users = res?.data?.data?.data || [];
                if (users.length > 0) {
                    const userData = users[0];
                    setUser({
                        ...userData,
                        //   inStatus: userData.inStatus || "Ongoing"  
                    });
                    setStatus(userData.status === "active");
                    setFileUrl(userData.aadharURL);
                    setCertificateUrl(userData.certificateURL);
                }
            })
            .catch((err) => console.error("Error fetching user:", err))
            .finally(() => setLoading(false));
    };

    const [isOpen, setIsOpen] = useState(false);
    let attdancemonth = async () => {
        try {
            let res = await getStudentAttendencemonth(id)
            setTotalcount(res?.data?.data)
            // console.log(res?.data?.data)
        } catch (err) {
            console.log(err)
        }
    }

    let attendancelist = async () => {
        try {
            let res = await getAttendanceStudentList(id)
            setAttendance(res?.data?.data?.data || [])
        } catch (err) {
            console.log(err)
        }
    }


    const handleDownload = async (fileUrl) => {
        try {
            const response = await fetch(fileUrl, { mode: "cors" });
            const blob = await response.blob();

            const contentType = response.headers.get("content-type");
            let extension = "";

            if (contentType) {
                if (contentType.includes("pdf")) extension = ".pdf";
                else if (contentType.includes("png")) extension = ".png";
                else if (contentType.includes("jpeg") || contentType.includes("jpg")) extension = ".jpg";
                else if (contentType.includes("gif")) extension = ".gif";
                else extension = "";
            } else {
                extension = fileUrl.split(".").pop().split(/\#|\?/)[0] ? "." + fileUrl.split(".").pop().split(/\#|\?/)[0] : "";
            }

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;


            const filename = "download" + extension;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const onChange = async (checked) => {
        const newStatus = checked ? "active" : "inactive";
        try {
            await updatedetailsuser(newStatus, id);
            setStatus(checked);
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    const [isDisabledToday, setIsDisabledToday] = useState(false);

    useEffect(() => {
        const savedDate = localStorage.getItem(`absentSubmittedDate_${id}`);
        const today = new Date().toLocaleDateString(); // "11/25/2025" format

        if (savedDate === today) {
            setIsDisabledToday(true);  // already submitted today
        } else {
            setIsDisabledToday(false); // allow submit
        }
    }, []);


    const [absentloading, setAbsentloading] = useState(false)
    const [discription, setdiscription] = useState('')
    const [error, setError] = useState('')
    const createabsent = async () => {
        if (!discription.trim()) {
            setError("Description is required");
            return;
        }

        setAbsentloading(true);
        try {
            await makeabsent(id, discription);
            setAbsentloading(false);
            attendancelist();
            setAbsentModel(false);
            setdiscription('');
            setError('');
            localStorage.setItem(`absentSubmittedDate_${id}`, new Date().toLocaleDateString());
            setIsDisabledToday(true);
        } catch (err) {
            console.error("Error updating status:", err);
            setAbsentloading(false);
            toast.error(err?.response?.data?.message);
        }
    };


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

    const [Studentattendancerate, setStudentAttendance] = useState({});

    const [rateLoading, setRateLoading] = useState(false);
    const studentrate = async () => {
        setRateLoading(true)
        try {


            const formatDate = (date) => date ? date.toLocaleDateString('en-CA') : '';

            const fromDate = selectedRange.length ? formatDate(selectedRange[0].startDate) : '';
            const toDate = selectedRange.length ? formatDate(selectedRange[0].endDate) : '';

            const response = await attendancestudentrate(id, fromDate, toDate);
            console.log('response', response.data?.data, studentattendance.attendanceRate)
            setStudentAttendance(response?.data?.data);
            setRateLoading(false)

        } catch (error) {
            console.log(error);
            setRateLoading(false)
        }
    };

    useEffect(() => {
        studentrate()
    }, [selectedRange])


    const [absentModel, setAbsentModel] = useState(false)


    return (
        <>
            <ToastContainer />
            <div className={styles.spacing}>

                <div className="flex gap-[10px] items-center pb-[10px]">
                    <div >
                        <IoMdArrowRoundBack style={{ cursor: 'pointer', fontSize: '20px', marginTop: '2px' }} onClick={() => window.history.back()} />

                    </div>
                    <div>
                        <h4 className='text-xl font-normal'>Student Details</h4>

                    </div>
                </div>
                {loading ?


                    <div>
                        <div className='bg-[#F8F8F8] px-[10px] py-[10px] rounded-[10px]'>
                            <div className='flex justify-evenly items-center flex-col md:flex-row'>
                                <div className='  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid'>
                                    <div className='w-[100px] h-[100px]'>
                                        <Skeleton variant="circular" width={100} height={100} />
                                    </div>
                                </div>
                                <div className='w-[85%]'>
                                    <div className="flex justify-between items-center pb-[10px]">
                                        <Skeleton variant="text" width={80} height={40} />

                                        <div onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }} className='text-transparent bg-clip-text bg-gradient-to-b 
                                        from-[#144196] to-[#061530] font-[500] px-[40px] p-2 '>
                                            <EditOutlinedIcon className="text-[#144196]" sx={{ fontSize: '14px', cursor: 'pointer' }} /> Edit
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-2 lg:grid-cols-7 md:grid-cols-3 sm:grid-cols-2 text-[14px]'>
                                        <div>
                                            <div className='text-[#00000080]'>ID</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Phone</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>E-Mail</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Course</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Batch</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Blood</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>D.O.B</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-3 mt-3'>
                            <div className='bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px]'>
                                <div className='flex justify-between items-center'>
                                    <h4 className='text-[16px] font-medium'>Attendance Details</h4>
                                    {/* <div className='text-white  bg-gradient-to-b from-[#144196] to-[#061530] text-[12px] px-[40px] p-2 rounded-lg'>Make Absent</div> */}
                                </div>
                                <div className='grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-2'>
                                    <div className='bg-white rounded-[10px] px-[20px] py-[10px] mt-5'>
                                        <p className='text-[#F81111] text-[12px]'>No: Of Days Absents</p>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div className='bg-white rounded-[10px] px-[20px] py-[10px] mt-5 '>
                                        <p className='text-[#F81111] text-[12px]'>No: Of Days Absents</p>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                </div>
                                <div className='grid grid-cols-3  text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5  '>
                                    <div>
                                        <div className='text-[#00000080]'>Date</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div>
                                        <div className='text-[#00000080]'>Check-in</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div>
                                        <div className='text-[#00000080]'>Check-out</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                </div>
                                <div className='grid grid-cols-3  text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5  '>
                                    <div>
                                        <div className='text-[#00000080]'>Date</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div>
                                        <div className='text-[#00000080]'>Check-in</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div>
                                        <div className='text-[#00000080]'>Check-out</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                </div>
                                <div className='grid grid-cols-3  text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5  '>
                                    <div>
                                        <div className='text-[#00000080]'>Date</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div>
                                        <div className='text-[#00000080]'>Check-in</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div>
                                        <div className='text-[#00000080]'>Check-out</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                </div>
                                <div className='grid grid-cols-3  text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5  '>
                                    <div>
                                        <div className='text-[#00000080]'>Date</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div>
                                        <div className='text-[#00000080]'>Check-in</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                    <div>
                                        <div className='text-[#00000080]'>Check-out</div>
                                        <Skeleton variant="text" width={80} height={40} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className='bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] '>
                                    <h4 className='text-[16px] font-medium'>Fee Details</h4>
                                    <div className='grid grid-cols-4 text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5 '>
                                        <div>
                                            <div className='text-[#00000080]'>Total Fees</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Paid</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Pending</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Due Date</div>
                                            <Skeleton variant="text" width={80} height={40} />
                                        </div>
                                    </div>
                                </div>
                                <div className='bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] my-3'>
                                    <h4 className='text-[16px] font-medium'>Documents</h4>
                                    <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>
                                        <div className='flex justify-between items-center'>
                                            <h4>Aadhar card</h4>
                                            <Skeleton variant="text" width={80} height={20} />
                                        </div>


                                    </div>
                                    <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>
                                        <div className='flex justify-between items-center'>
                                            <h4>Original</h4>
                                            <Skeleton variant="text" width={80} height={20} />
                                        </div>

                                    </div>
                                </div>
                                <div className='bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] my-3'>
                                    <h4 className='text-[16px] font-medium'>Personal Details</h4>

                                    <div className='text-[14px] font-normal my-2'>
                                        <div className='flex justify-around items-center my-1'>
                                            <div className='w-[30%]'>Father Name</div>
                                            <div className='w-[5%]'>:</div>
                                            <div className='w-[70%]'>
                                                <Skeleton variant="text" width={80} height={10} /></div>
                                        </div>
                                        <div className='flex justify-around items-center my-1'>
                                            <div className='w-[30%]'>Contact No</div>
                                            <div className='w-[5%]'>:</div>
                                            <div className='w-[70%]'>
                                                <Skeleton variant="text" width={80} height={10} />
                                            </div>
                                        </div>
                                        <div className='flex justify-around items-center my-1'>
                                            <div className='w-[30%]'>Address</div>
                                            <div className='w-[5%]'>:</div>
                                            <div className='w-[70%]'>
                                                <Skeleton variant="text" width={80} height={10} />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    :


                    <div>
                        <div className='bg-[#F8F8F8] px-[10px] py-[10px] rounded-[10px]'>
                            <div className='flex justify-evenly items-center flex-col md:flex-row'>
                                <div className='  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid'>
                                    <div className='w-[100px] h-[100px]'>
                                        <img src={user?.profileURL} alt="profile" className='w-[100%] h-[100%]' />
                                    </div>
                                </div>
                                <div className='w-[85%]'>
                                    <div className="flex justify-between items-center pb-[10px]">
                                        <h2 className='text-[22px] font-[500] text-center md:text-left'>{user?.name?.replace(/\b\w/g, (char) => char.toUpperCase())}</h2>
                                        <div className="flex justify-between items-center pb-[10px]">
                                            <div>
                                                <button className={` ${styles.absent}`}  onClick={() => setAbsentModel(true)}>Make Absent</button>
                                            </div>
                                            <div onClick={() => setIsOpen(true)} className='text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] flex items-center font-[500] px-[40px] p-2 cursor-pointer '>
                                                <EditOutlinedIcon className="text-[#144196]" sx={{ fontSize: '14px', cursor: 'pointer' }} /> Edit</div>
                                            <div>
                                                <Switch value={status} onChange={onChange} size="small" />
                                            </div>

                                        </div>
                                    </div>

                                    <div className='grid grid-cols-2 lg:grid-cols-7 md:grid-cols-3 sm:grid-cols-2 text-[14px]'>
                                        <div>
                                            <div className='text-[#00000080]'>ID</div>
                                            <p className='font-[500]'>{user?.studentId}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Phone</div>
                                            <p className='font-[500]'>{user?.mobileNo}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>E-Mail</div>
                                            <p title={user?.email} className='font-[500] truncate overflow-hidden whitespace-nowrap w-[90%]'>{user?.email}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Course</div>
                                            <p className='font-[500]'>{user?.courseDetails?.courseName}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Batch</div>
                                            <p className='font-[500]'>{user?.batchDetails?.batchName}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Blood</div>
                                            <p className='font-[500]'>{user?.blood}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>D.O.B</div>
                                            <p className='font-[500]'>{user?.DOB?.split("T")[0]}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-3 mt-3'>
                            <div className='bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px]'>
                                <div className='flex justify-between items-center'>
                                    <h4 className='text-[16px] font-medium'>Attendance Details</h4>
                                    <div>
                                        <RangePicker
                                            format="YYYY-MM-DD"
                                            onChange={(dates) => {
                                                if (dates && dates.length === 2) {
                                                    setSelectedRange([
                                                        {
                                                            startDate: dates[0].toDate(),
                                                            endDate: dates[1].toDate(),
                                                            key: "selection",
                                                        },
                                                    ]);
                                                }
                                            }}
                                            value={[
                                                dayjs(selectedRange[0].startDate),
                                                dayjs(selectedRange[0].endDate),
                                            ]}
                                        />
                                    </div>
                                    {/* <div className='text-white  bg-gradient-to-b from-[#144196] to-[#061530] text-[12px] px-[40px] p-2 rounded-lg'>Make Absent</div> */}
                                </div>
                                {totalcount && (
                                    <div className='grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 gap-2'>
                                        <div className='bg-white rounded-[10px] px-[20px] py-[10px] mt-5'>
                                            <p className='text-[#F81111] text-[11px]'>No Of Days Absents this month</p>
                                            <p className='text-[#F81111] text-[28px] font-[600]'>{totalcount?.total?.currentMonth || 0}</p>
                                        </div>
                                        <div className='bg-white rounded-[10px] px-[20px] py-[10px] mt-5 '>
                                            <p className='text-[#F81111] text-[12px]'>No Of Days Absents last month</p>
                                            <p className='text-[#F81111] text-[28px] font-[600]'>{totalcount?.total?.prevMonth || 0}</p>
                                        </div>
                                        <div className='bg-white rounded-[10px] px-[20px] py-[10px] mt-5 '>
                                            <p className='text-[#F81111] text-[12px]'>Attendance Rate</p>
                                            <p className='text-[#F81111] text-[12px]'>
                                                Present Days : {Studentattendancerate?.presentDays || 0}
                                            </p>
                                            <p className='text-[#F81111] text-[28px] font-[600] '>{Studentattendancerate?.attendanceRate || 0}</p>
                                        </div>
                                    </div>
                                )
                                }
                                {studentattendance.length > 0 ?
                                    studentattendance.map((item, index) => (
                                        <div key={index} className='grid grid-cols-5 text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5'>
                                            <div>
                                                <div className='text-[#00000080]'>Date</div>
                                                <p className='font-[500]' style={{ color: item?.onLeave ? 'red' : '' }}>{new Date(item.date).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <div className='text-[#00000080]'>Break-in</div>
                                                <p className='font-[500]'>
                                                    {item?.onLeave ? <span style={{ color: 'red' }}>-</span> : item.breakTime[0] ? formatTime(item?.breakTime[0]) : "-"}

                                                </p>
                                            </div>
                                            <div>
                                                <div className='text-[#00000080]'>Break-out</div>
                                                <p className='font-[500]'>
                                                    {item?.onLeave ? <span style={{ color: 'red' }}>-</span> : item.breakTime[1] ? formatTime(item?.breakTime[1]) : "-"}

                                                </p>
                                            </div>
                                            <div>
                                                <div className='text-[#00000080]'>Check-in</div>
                                                <p className='font-[500]'>
                                                    {item?.onLeave ? <span style={{ color: 'red' }}>Leave</span> : item.inTime ? formatTime(item?.inTime) : "-"}

                                                </p>
                                            </div>
                                            <div>
                                                <div className='text-[#00000080]'>Check-out</div>
                                                <p className='font-[500]'>
                                                    {item?.onLeave ? <span style={{ color: 'red' }}>-</span> : item.outTime ? formatTime(item?.outTime) : "-"}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                    :
                                    <div>
                                        <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto mt-[30px]' />
                                        <p className="text-center text-[#00000080] font-semibold">No Data Found</p>

                                    </div>
                                }


                            </div>
                            <div>
                                <div className='bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] '>
                                    <h4 className='text-[16px] font-medium'>Fee Details</h4>
                                    <div className='grid grid-cols-4 text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5 '>
                                        <div>
                                            <div className='text-[#00000080]'>Total Fees</div>
                                            <p className='font-[500]'>{user?.totalFee}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Paid</div>
                                            <p className='font-[500]'>{user?.paidFee}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Pending</div>
                                            <p className='font-[500]'>{user?.pendingFee}</p>
                                        </div>
                                        <div>
                                            <div className='text-[#00000080]'>Paid Date</div>
                                            <p className='font-[500]'>{user?.dueDate?.split("T")[0]}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className='bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] my-3'>
                                    <h4 className='text-[16px] font-medium'>Documents</h4>
                                    <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>
                                        <div className='flex justify-between items-center'>
                                            <h4>Aadhar card</h4>
                                            <button className='flex items-center cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]' onClick={() => handleDownload(user.aadharURL)
                                            }>Download <img src={Import} alt="" className="px-2" /></button>

                                        </div>


                                    </div>
                                    <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>
                                        <div className='flex justify-between items-center'>
                                            <h4>Original</h4>
                                            <button className='flex items-center text-transparent bg-clip-text bg-gradient-to-b cursor-pointer from-[#144196] to-[#061530]' onClick={() => handleDownload(user.certificateURL)
                                            }>Download <img src={Import} alt="" className="px-2" /></button>
                                        </div>

                                    </div>
                                </div>
                                <div className='bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] my-3'>
                                    <h4 className='text-[16px] font-medium'>Personal Details</h4>

                                    <div className='text-[14px] font-normal my-2'>
                                        <div className='flex justify-around items-center my-1'>
                                            <div className='w-[30%]'>Father Name</div>
                                            <div className='w-[5%]'>:</div>
                                            <div className='w-[70%]'>{user?.fatherName?.replace(/\b\w/g, (char) => char.toUpperCase())}</div>
                                        </div>
                                        <div className='flex justify-around items-center my-1'>
                                            <div className='w-[30%]'>Contact No</div>
                                            <div className='w-[5%]'>:</div>
                                            <div className='w-[70%]'> {user?.alterMobileNo} </div>
                                        </div>
                                        <div className='flex justify-around items-center my-1'>
                                            <div className='w-[30%]'>Address</div>
                                            <div className='w-[5%]'>:</div>
                                            <div className='w-[70%]'><p className='truncate overflow-hidden whitespace-nowrap w-[80%]'>{user?.address} </p> </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
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
                <UpdateStudent closeModal={() => setIsOpen(false)} id={id} onSuccess={() => getUserById(id)} />
            </Modal>


            <Modal
                isOpen={absentModel}
                onRequestClose={() => { setAbsentModel(false), setdiscription(''), setError('') }}
                contentLabel="Make Absent"
                isCloseButtonShown={true}
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
                        width: '500px',
                        height: 'max-content',
                        overflow: 'auto',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        zIndex: 1001,
                    },
                }}

            >


                <div>
                    <label className='font-[500]'>Description</label>
                    <div className='my-[20px]'>
                        <textarea
                            placeholder="Enter description"
                            className={styles.textarea}
                            value={discription}
                            onChange={(e) => { setdiscription(e.target.value), setError("") }}
                        ></textarea>
                        <p className="text-red-500 text-[12px]">{error}</p>
                    </div>
                </div>
                <button
                    onClick={createabsent}
                    className='bg-[#144196] text-white py-[5px] px-[10px] rounded-[5px] m-auto'
                    disabled={absentloading || isDisabledToday}
                    style={{ cursor: absentloading || isDisabledToday ? 'not-allowed' : 'pointer' }}
                >
                    {absentloading ? 'Loading...' : isDisabledToday ? 'Submitted Today' : 'Submit'}
                </button>

            </Modal>
        </>
    )
}

export default Studentdetails