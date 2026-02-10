import { React, useEffect, useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import profile from "../../assets/dashboardimgs/profile.png";
import Import from "../../assets/dashboardimgs/Import.png";
import { Form, useParams } from "react-router-dom";
import {
  attendancestudentrate,
  getAttendanceStudentList,
  getStudentAttendencemonth,
  getUserId,
  makeabsent,
  updatedetailsuser,
  updateUser,
  createTermSem,
  updateTermSem,
  getPerformance,
  Performanceuser,
  deleteTermSem,
} from "../../api/Serviceapi";
import Modal from "react-modal";
import { deleteTermSem as deleteTermSemApi } from "../../api/Serviceapi";

import UpdateStudent from "../../component/updatestudent/UpdateStudent";
import styles from "./Studentdetails.module.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import Skeleton from "@mui/material/Skeleton";
import nodata from "../../assets/trans.png";
import { Switch } from "antd";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { set } from "date-fns";
// import { use } from 'react';
import { getSubjects } from "../../api/Serviceapi";

const Studentdetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState([]);
  const [fileUrl, setFileUrl] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [totalcount, setTotalcount] = useState(null);
  const [studentattendance, setAttendance] = useState({});
  const [status, setStatus] = useState(true);
  const [termList, setTermList] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const [selectedRange, setSelectedRange] = useState([
    {
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    },
  ]);
  const [editMode, setEditMode] = useState(false);
  const { RangePicker } = DatePicker;
  const [termModal, setTermModal] = useState(false);
  const [Academic, setAcademic] = useState("");
  const [sem, setSem] = useState('sem1');

  // sub

  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const handleSemesterChange = (event) => {

    setSem(event.target.value)
  };


  const fetchSubjects = async () => {
    if (!user?.courseDetails?._id || !user?.batchDetails?._id || !sem) return;

    setSubjectsLoading(true);
    try {
      const res = await getSubjects(
        user.courseDetails._id,
        user.batchDetails._id,
        sem.toLowerCase() // API expects sem1, sem2
      );

      const subjectList = res?.data?.data?.[0]?.subjects || [];

      setSubjects(subjectList);

      // Prepare marks state for each subject
      const initialMarks = subjectList.map((sub) => ({
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        mark: "",
      }));

      setMarks(initialMarks);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setSubjectsLoading(false);
    }
  };

  useEffect(() => {
    if (termModal && !editMode) {
      fetchSubjects();
    }
  }, [sem]);

  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);



  const openEditTermSem = (record) => {
    setEditMode(true);
    setTermModal(true);

    setEditingId(record._id);
    setAcademic(record.Academic || "");
    setSem(record.exam || "sem1");

    // Convert API Marks → UI format
    const formattedMarks = (record.Marks || []).map((m) => ({
      subjectCode: m.subjectCode || "",
      subjectName: m.subjectName || m.subject || "",
      mark: m.mark ?? m.Mark ?? "",
    }));

    setMarks(formattedMarks);

    // Also set subjects list so UI labels show
    const subjectList = formattedMarks.map((m) => ({
      subjectCode: m.subjectCode,
      subjectName: m.subjectName,
    }));
    setSubjects(subjectList);
  };
  const [performanceLoading, setPerformanceLoading] = useState(false);


  const handleSavePerformance = async () => {
    setFormError("");

    if (!Academic) return setFormError("Please select Term / Sem");
    if (!marks.length) return setFormError("Marks not available");

    if (!editMode && allAcademicsUsed) {
      return setFormError(
        "All Term / Semester marks already entered for this semester"
      );
    }

    if (!editMode && usedAcademicsForSemester.includes(Academic)) {
      return setFormError(
        "Marks already exist for this Term / Sem in the selected semester"
      );
    }

    for (let m of marks) {
      if (m.mark === "") {
        return setFormError(`Enter mark for ${m.subjectName}`);
      }

      if (m.mark !== "AA" && (isNaN(m.mark) || Number(m.mark) < 0)) {
        return setFormError(`Invalid mark for ${m.subjectName}`);
      }
    }


    const numericMarks = marks.map((m) => {
      // If absent → count as 0
      if (m.mark === "AA") return 0;

      // Convert to number safely
      const num = Number(m.mark);

      // If invalid number → treat as 0 (prevents NaN)
      return isNaN(num) ? 0 : num;
    });

    const total = numericMarks.reduce((sum, m) => sum + m, 0);

    const average = numericMarks.length
      ? Number((total / numericMarks.length).toFixed(2))
      : 0;


    const payload = {
      userId: id,
      courseId: user?.courseDetails?._id,
      batchId: user?.batchDetails?._id,
      exam: sem,
      Academic,
      total,
      average,
      Marks: marks.map((m) => ({
        subjectCode: m.subjectCode,
        subjectName: m.subjectName,
        mark: m.mark === "AA" ? "AA" : Number(m.mark),
      })),

    };

    try {
      setPerformanceLoading(true);

      if (editMode && editingId) {
        await updateTermSem(editingId, payload);
        toast.success("Marks updated successfully ✏️");
      } else {
        await createTermSem(payload);
        toast.success("Marks saved successfully 🎉");
      }

      setTermModal(false);
      setEditMode(false);
      setEditingId(null);
      setMarks([]);
      setSubjects([]);
      fetchPerformance();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setPerformanceLoading(false);
    }
  };

  // Academics already used for selected semester
  const usedAcademicsForSemester = termList
    .filter((item) => item.exam === sem)
    .map((item) => item.Academic);

  // All possible academic options
  const allAcademicOptions = ["Term1", "Term2", "Semester"];

  // Check if all options already entered
  const allAcademicsUsed = allAcademicOptions.every((opt) =>
    usedAcademicsForSemester.includes(opt)
  );


  const numericMarksUI = marks.map((m) => {
    if (m.mark === "AA") return 0;
    const num = Number(m.mark);
    return isNaN(num) ? 0 : num;
  });

  const totalMarks = numericMarksUI.reduce((sum, m) => sum + m, 0);

  const avgMarks = numericMarksUI.length
    ? (totalMarks / numericMarksUI.length).toFixed(2)
    : 0;



  const handleMarkChange = (index, value) => {
    const updated = [...marks];
    updated[index] = { ...updated[index], mark: value };
    setMarks(updated);
  };


  useEffect(() => {
    attdancemonth();
  }, []);

  useEffect(() => {
    attendancelist();
  }, []);

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
      let res = await getStudentAttendencemonth(id);
      setTotalcount(res?.data?.data);
      // console.log(res?.data?.data)
    } catch (err) {
      console.log(err);
    }
  };

  let attendancelist = async () => {
    try {
      let res = await getAttendanceStudentList(id);
      setAttendance(res?.data?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDownload = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      const blob = await response.blob();

      const contentType = response.headers.get("content-type");
      let extension = "";

      if (contentType) {
        if (contentType.includes("pdf")) extension = ".pdf";
        else if (contentType.includes("png")) extension = ".png";
        else if (contentType.includes("jpeg") || contentType.includes("jpg"))
          extension = ".jpg";
        else if (contentType.includes("gif")) extension = ".gif";
        else extension = "";
      } else {
        extension = fileUrl.split(".").pop().split(/\#|\?/)[0]
          ? "." + fileUrl.split(".").pop().split(/\#|\?/)[0]
          : "";
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
      setIsDisabledToday(true); // already submitted today
    } else {
      setIsDisabledToday(false); // allow submit
    }
  }, []);

  const [absentloading, setAbsentloading] = useState(false);
  const [discription, setdiscription] = useState("");
  const [error, setError] = useState("");
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
      setdiscription("");
      setError("");
      localStorage.setItem(
        `absentSubmittedDate_${id}`,
        new Date().toLocaleDateString()
      );
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
    setRateLoading(true);
    try {
      const formatDate = (date) =>
        date ? date.toLocaleDateString("en-CA") : "";

      const fromDate = selectedRange.length
        ? formatDate(selectedRange[0].startDate)
        : "";
      const toDate = selectedRange.length
        ? formatDate(selectedRange[0].endDate)
        : "";

      const response = await attendancestudentrate(id, fromDate, toDate);
      console.log(
        "response",
        response.data?.data,
        studentattendance.attendanceRate
      );
      setStudentAttendance(response?.data?.data);
      setRateLoading(false);
    } catch (error) {
      console.log(error);
      setRateLoading(false);
    }
  };


  useEffect(() => {
    studentrate();
  }, [selectedRange]);

  const [absentModel, setAbsentModel] = useState(false);

  useEffect(() => {
    getUserById(id);
    // getTermDetails();
  }, [id]);


  const [termLoading, setTermLoading] = useState(false);


  const fetchPerformance = async () => {
    setTermLoading(true);
    try {
      const res = await Performanceuser(id);

      // 🔥 Correct path to records array
      const records = res?.data?.data?.data || [];

      setTermList(records);
    } catch (err) {
      console.error("Error fetching performance:", err);
    } finally {
      setTermLoading(false);
    }
  };


  useEffect(() => {
    if (id) fetchPerformance();
  }, [id]);

  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);


  const confirmDeleteTermSem = async () => {
    if (!deleteId) return;

    setDeleteLoading(true);
    try {
      await deleteTermSem(deleteId);

      toast.success("Record deleted successfully 🗑️");

      // Remove from UI
      setTermList((prev) => prev.filter((item) => item._id !== deleteId));

      setDeleteId(null); // close popup
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleteLoading(false);
    }
  };



  return (
    <>
      <ToastContainer />
      <div className={styles.spacing}>
        <div className="flex gap-[10px] items-center pb-[10px]">
          <div>
            <IoMdArrowRoundBack
              style={{ cursor: "pointer", fontSize: "20px", marginTop: "2px" }}
              onClick={() => window.history.back()}
            />
          </div>
          <div>
            <h4 className="text-xl font-normal">Student Details</h4>
          </div>
        </div>
        {loading ? (
          <div>
            <div className="bg-[#F8F8F8] px-[10px] py-[10px] rounded-[10px]">
              <div className="flex justify-evenly items-center flex-col md:flex-row">
                <div className="  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid">
                  <div className="w-[100px] h-[100px]">
                    <Skeleton variant="circular" width={100} height={100} />
                  </div>
                </div>
                <div className="w-[85%]">
                  <div className="flex justify-between items-center pb-[10px]">
                    <Skeleton variant="text" width={80} height={40} />

                    <div
                      onClick={() => setIsOpen(true)}
                      style={{ cursor: "pointer" }}
                      className="text-transparent bg-clip-text bg-gradient-to-b 
                                        from-[#144196] to-[#061530] font-[500] px-[40px] p-2 "
                    >
                      <EditOutlinedIcon
                        className="text-[#144196]"
                        sx={{ fontSize: "14px", cursor: "pointer" }}
                      />{" "}
                      Edit
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-7 md:grid-cols-3 sm:grid-cols-2 text-[14px]">
                    <div>
                      <div className="text-[#00000080]">ID</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">Phone</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">E-Mail</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">Course</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">Batch</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">Blood</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">D.O.B</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px]">
                <div className="flex justify-between items-center">
                  <h4 className="text-[16px] font-medium">
                    Attendance Details
                  </h4>
                  {/* <div className='text-white  bg-gradient-to-b from-[#144196] to-[#061530] text-[12px] px-[40px] p-2 rounded-lg'>Make Absent</div> */}
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-2">
                  <div className="bg-white rounded-[10px] px-[20px] py-[10px] mt-5">
                    <p className="text-[#F81111] text-[12px]">
                      No: Of Days Absents
                    </p>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div className="bg-white rounded-[10px] px-[20px] py-[10px] mt-5 ">
                    <p className="text-[#F81111] text-[12px]">
                      No: Of Days Absents
                    </p>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
                <div className="grid grid-cols-3  text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5  ">
                  <div>
                    <div className="text-[#00000080]">Date</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#00000080]">Check-in</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#00000080]">Check-out</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
                <div className="grid grid-cols-3  text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5  ">
                  <div>
                    <div className="text-[#00000080]">Date</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#00000080]">Check-in</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#00000080]">Check-out</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
                <div className="grid grid-cols-3  text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5  ">
                  <div>
                    <div className="text-[#00000080]">Date</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#00000080]">Check-in</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#00000080]">Check-out</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
                <div className="grid grid-cols-3  text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5  ">
                  <div>
                    <div className="text-[#00000080]">Date</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#00000080]">Check-in</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                  <div>
                    <div className="text-[#00000080]">Check-out</div>
                    <Skeleton variant="text" width={80} height={40} />
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] ">
                  <h4 className="text-[16px] font-medium">Fee Details</h4>
                  <div className="grid grid-cols-4 text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5 ">
                    <div>
                      <div className="text-[#00000080]">Total Fees</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">Paid</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">Pending</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                    <div>
                      <div className="text-[#00000080]">Due Date</div>
                      <Skeleton variant="text" width={80} height={40} />
                    </div>
                  </div>
                </div>
                <div className="bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] my-3">
                  <h4 className="text-[16px] font-medium">Documents</h4>
                  <div className="text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 ">
                    <div className="flex justify-between items-center">
                      <h4>Aadhar card</h4>
                      <Skeleton variant="text" width={80} height={20} />
                    </div>
                  </div>
                  <div className="text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 ">
                    <div className="flex justify-between items-center">
                      <h4>Original</h4>
                      <Skeleton variant="text" width={80} height={20} />
                    </div>
                  </div>
                </div>
                <div className="bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] my-3">
                  <h4 className="text-[16px] font-medium">Personal Details</h4>

                  <div className="text-[14px] font-normal my-2">
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Father Name</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        <Skeleton variant="text" width={80} height={10} />
                      </div>
                    </div>
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Contact No</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        <Skeleton variant="text" width={80} height={10} />
                      </div>
                    </div>
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Address</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        <Skeleton variant="text" width={80} height={10} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-[#F8F8F8] px-[10px] py-[10px] rounded-[10px]">
              <div className="flex justify-evenly items-center flex-col md:flex-row">
                <div className="  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid">
                  <div className="w-[100px] h-[100px]">
                    <img
                      src={user?.profileURL}
                      alt="profile"
                      className="w-[100%] h-[100%]"
                    />
                  </div>
                </div>
                <div className="w-[85%]">
                  <div className="flex justify-between items-center pb-[10px]">
                    <h2 className="text-[22px] font-[500] text-center md:text-left">
                      {user?.name?.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                    </h2>
                    <div className="flex items-center gap-3 pb-[10px]">
                      <div>
                        <button
                          className={` ${styles.absent}`}
                          onClick={() => setAbsentModel(true)}
                        >
                          Make Absent
                        </button>
                      </div>
                      <div>
                        <button
                          className="bg-gradient-to-b from-[#144196] to-[#061530]
    text-white font-medium
    text-[11px] sm:text-[12px] md:text-[13px]
    px-3 sm:px-4 md:px-5
    py-1.5 sm:py-2
    rounded-md
    whitespace-nowrap"
                          onClick={() => {
                            setTimeout(fetchSubjects, 0); // ensure modal + user loaded

                            setEditMode(false);
                            setAcademic("");
                            // setSem("");
                            setTermModal(true);
                          }}
                        >
                          + Add Term / Sem Detail
                        </button>
                      </div>
                      <div
                        onClick={() => setIsOpen(true)}
                        className="text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530] flex items-center font-[500] px-[40px] p-2 cursor-pointer "
                      >
                        <EditOutlinedIcon
                          className="text-[#144196]"
                          sx={{ fontSize: "14px", cursor: "pointer" }}
                        />{" "}
                        Edit
                      </div>
                      <div>
                        <Switch
                          value={status}
                          onChange={onChange}
                          size="small"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-7 md:grid-cols-3 sm:grid-cols-2 text-[14px]">
                    <div>
                      <div className="text-[#00000080]">ID</div>
                      <p className="font-[500]">{user?.studentId}</p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">Phone</div>
                      <p className="font-[500]">{user?.mobileNo}</p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">E-Mail</div>
                      <p
                        title={user?.email}
                        className="font-[500] truncate overflow-hidden whitespace-nowrap w-[90%]"
                      >
                        {user?.email}
                      </p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">Course</div>
                      <p className="font-[500]">
                        {user?.courseDetails?.courseName}
                      </p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">Batch</div>
                      <p className="font-[500]">
                        {user?.batchDetails?.batchName}
                      </p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">Blood</div>
                      <p className="font-[500]">{user?.blood}</p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">D.O.B</div>
                      <p className="font-[500]">{user?.DOB?.split("T")[0]}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F8F8F8] mt-3 p-3 rounded-[10px]">
              <h4 className="text-[16px] font-medium mb-3">
                Term / Semester Details
              </h4>

              {termLoading ? (
                <p className="text-sm text-gray-500">Loading records...</p>
              ) : termList.length > 0 ? (
                termList.map((p) => (
                  <div
                    key={p._id}
                    className="flex justify-between items-center bg-white p-3 rounded mb-2"
                  >
                    <div>
                      <p className="font-medium">
                        {p.Academic || "—"}({p.exam || "—"})
                      </p>
                      <p className="text-sm text-gray-500">
                        Total : {p.total} | Avg : {p.average}
                      </p>
                    </div>

                    <div className="flex gap-3 items-center">
                      <EditOutlinedIcon
                        sx={{ cursor: "pointer", fontSize: 18 }}
                        onClick={() => openEditTermSem(p)}
                      />

                      <span
                        className="text-red-600 text-sm cursor-pointer"
                        onClick={() => setDeleteId(p._id)}
                      >
                        Delete
                      </span>

                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No Term / Sem Records</p>
              )}


            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px]">
                <div className="flex justify-between items-center">
                  <h4 className="text-[16px] font-medium">
                    Attendance Details
                  </h4>
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
                  <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 gap-2">
                    <div className="bg-white rounded-[10px] px-[20px] py-[10px] mt-5">
                      <p className="text-[#F81111] text-[11px]">
                        No Of Days Absents this month
                      </p>
                      <p className="text-[#F81111] text-[28px] font-[600]">
                        {totalcount?.total?.currentMonth || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-[10px] px-[20px] py-[10px] mt-5 ">
                      <p className="text-[#F81111] text-[12px]">
                        No Of Days Absents last month
                      </p>
                      <p className="text-[#F81111] text-[28px] font-[600]">
                        {totalcount?.total?.prevMonth || 0}
                      </p>
                    </div>
                    <div className="bg-white rounded-[10px] px-[20px] py-[10px] mt-5 ">
                      <p className="text-[#F81111] text-[12px]">
                        Attendance Rate
                      </p>
                      <p className="text-[#F81111] text-[12px]">
                        Present Days : {Studentattendancerate?.presentDays || 0}
                      </p>
                      <p className="text-[#F81111] text-[28px] font-[600] ">
                        {Studentattendancerate?.attendanceRate || 0}
                      </p>
                    </div>
                  </div>
                )}
                {studentattendance.length > 0 ? (
                  studentattendance.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-5 text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5"
                    >
                      <div>
                        <div className="text-[#00000080]">Date</div>
                        <p
                          className="font-[500]"
                          style={{ color: item?.onLeave ? "red" : "" }}
                        >
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <div className="text-[#00000080]">Break-in</div>
                        <p className="font-[500]">
                          {item?.onLeave ? (
                            <span style={{ color: "red" }}>-</span>
                          ) : item.breakTime[0] ? (
                            formatTime(item?.breakTime[0])
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                      <div>
                        <div className="text-[#00000080]">Break-out</div>
                        <p className="font-[500]">
                          {item?.onLeave ? (
                            <span style={{ color: "red" }}>-</span>
                          ) : item.breakTime[1] ? (
                            formatTime(item?.breakTime[1])
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                      <div>
                        <div className="text-[#00000080]">Check-in</div>
                        <p className="font-[500]">
                          {item?.onLeave ? (
                            <span style={{ color: "red" }}>Leave</span>
                          ) : item.inTime ? (
                            formatTime(item?.inTime)
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                      <div>
                        <div className="text-[#00000080]">Check-out</div>
                        <p className="font-[500]">
                          {item?.onLeave ? (
                            <span style={{ color: "red" }}>-</span>
                          ) : item.outTime ? (
                            formatTime(item?.outTime)
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <img
                      src={nodata}
                      alt=""
                      width={"200px"}
                      height={"200px"}
                      className="m-auto mt-[30px]"
                    />
                    <p className="text-center text-[#00000080] font-semibold">
                      No Data Found
                    </p>
                  </div>
                )}
              </div>
              <div>
                <div className="bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] ">
                  <h4 className="text-[16px] font-medium">Fee Details</h4>
                  <div className="grid grid-cols-4 text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-5 ">
                    <div>
                      <div className="text-[#00000080]">Total Fees</div>
                      <p className="font-[500]">{user?.totalFee}</p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">Paid</div>
                      <p className="font-[500]">{user?.paidFee}</p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">Pending</div>
                      <p className="font-[500]">{user?.pendingFee}</p>
                    </div>
                    <div>
                      <div className="text-[#00000080]">Paid Date</div>
                      <p className="font-[500]">
                        {user?.dueDate?.split("T")[0]}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] my-3">
                  <h4 className="text-[16px] font-medium">Documents</h4>
                  <div className="text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 ">
                    <div className="flex justify-between items-center">
                      <h4>Aadhar card</h4>
                      <button
                        className="flex items-center cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]"
                        onClick={() => handleDownload(user.aadharURL)}
                      >
                        Download <img src={Import} alt="" className="px-2" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 ">
                    <div className="flex justify-between items-center">
                      <h4>Original</h4>
                      <button
                        className="flex items-center text-transparent bg-clip-text bg-gradient-to-b cursor-pointer from-[#144196] to-[#061530]"
                        onClick={() => handleDownload(user.certificateURL)}
                      >
                        Download <img src={Import} alt="" className="px-2" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F8F8F8] px-[20px] py-[10px] rounded-[10px] my-3">
                  <h4 className="text-[16px] font-medium">Personal Details</h4>

                  <div className="text-[14px] font-normal my-2">
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Father Name</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        {user?.fatherName?.replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )}
                      </div>
                    </div>
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Contact No</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]"> {user?.alterMobileNo} </div>
                    </div>
                    <div className="flex justify-around items-center my-1">
                      <div className="w-[30%]">Address</div>
                      <div className="w-[5%]">:</div>
                      <div className="w-[70%]">
                        <p className="truncate overflow-hidden whitespace-nowrap w-[80%]">
                          {user?.address}{" "}
                        </p>{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(true)}
        contentLabel="Add Student"
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgb(21 21 21 / 81%)",
            zIndex: 1000,
          },
          content: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "2rem",
            backgroundColor: "#fff",
            borderRadius: "8px",
            width: "800px",
            height: "600px",
            overflow: "auto",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            zIndex: 1001,
          },
        }}
      >
        <UpdateStudent
          closeModal={() => setIsOpen(false)}
          id={id}
          onSuccess={() => getUserById(id)}
        />
      </Modal>

      <Modal
        isOpen={absentModel}
        onRequestClose={() => {
          setAbsentModel(false), setdiscription(""), setError("");
        }}
        contentLabel="Make Absent"
        isCloseButtonShown={true}
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgb(21 21 21 / 81%)", // gray overlay
            zIndex: 1000,
          },
          content: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "2rem",
            backgroundColor: "#fff",
            borderRadius: "8px",
            width: "500px",
            height: "max-content",
            overflow: "auto",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            zIndex: 1001,
          },
        }}
      >
        <div>
          <label className="font-[500]">Description</label>
          <div className="my-[20px]">
            <textarea
              placeholder="Enter description"
              className={styles.textarea}
              value={discription}
              onChange={(e) => {
                setdiscription(e.target.value), setError("");
              }}
            ></textarea>
            <p className="text-red-500 text-[12px]">{error}</p>
          </div>
        </div>
        <button
          onClick={createabsent}
          className="bg-[#144196] text-white py-[5px] px-[10px] rounded-[5px] m-auto"
          disabled={absentloading || isDisabledToday}
          style={{
            cursor:
              absentloading || isDisabledToday ? "not-allowed" : "pointer",
          }}
        >
          {absentloading
            ? "Loading..."
            : isDisabledToday
              ? "Submitted Today"
              : "Submit"}
        </button>
      </Modal>

      <Modal
        isOpen={termModal}
        onRequestClose={() => setTermModal(false)}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1000 },
          content: {
            width: "600px",
            height: 'max-content',
            margin: "auto",
            borderRadius: "10px",
            padding: "24px",
          },
        }}
      >
        <h3 className="text-lg font-semibold mb-6">
          {editMode ? "Edit Term / Sem Detail" : "Add Term / Sem Detail"}
        </h3>

        {/* ================= Semester Dropdown ================= */}
        <div className="mb-5">
          <label className="text-sm font-medium block mb-1">Semester</label>

          <select
            value={sem}
            onChange={(e) => handleSemesterChange(e)}
            className="w-full border rounded p-2 bg-white"
            disabled={editMode}
            style={{ cursor: editMode ? 'not-allowed' : 'pointer' }}
          >
            {/* <option value="">Select Semester</option> */}
            <option value="sem1">Semester 1</option>
            <option value="sem2">Semester 2</option>
          </select>
        </div>

        {/* ================= Term / Sem Dropdown ================= */}
        <div className="mb-5">
          <label className="text-sm font-medium block mb-1">
            Term / Sem
          </label>

          <select
            className="w-full border rounded p-2 bg-white"
            value={Academic}
            onChange={(e) => setAcademic(e.target.value)}
            disabled={editMode || allAcademicsUsed}
            style={{
              cursor: editMode || allAcademicsUsed ? "not-allowed" : "pointer",
              // backgroundColor: !editMode || allAcademicsUsed ? "#f3f4f6" : "white",
            }}
          >
            <option value="">Select Term / Sem</option>

            <option
              value="Term1"
              disabled={!editMode && usedAcademicsForSemester.includes("Term1")}
            >
              Term 1
            </option>

            <option
              value="Term2"
              disabled={!editMode && usedAcademicsForSemester.includes("Term2")}
            >
              Term 2
            </option>

            <option
              value="Semester"
              disabled={!editMode && usedAcademicsForSemester.includes("Semester")}
            >
              Semester
            </option>
          </select>

          {/* Helper Messages */}
          {!editMode && allAcademicsUsed && (
            <p className="text-xs text-red-500 mt-1">
              All Term / Semester records are already added for this semester.
            </p>
          )}



        </div>

        {/* ================= Marks Section (UNCHANGED) ================= */}
        <div className="mb-5">
          <label className="text-sm font-medium block mb-2">Marks</label>

          {subjectsLoading ? (
            <p className="text-sm text-gray-500">Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p className="text-sm text-red-500">No subjects found</p>
          ) : (
            subjects.map((sub, index) => (
              <div key={sub.subjectCode} className="flex gap-3 mb-3 items-center">
                <div className="w-1/3 text-sm  font-medium">
                  {sub.subjectCode} 
                </div>
                <div className="w-1/3 text-sm ">
                 {sub.subjectName}
                </div>
                <div className="w-1/3 text-sm ">
                  <input
                    type="text"
                    value={marks[index]?.mark ?? ""}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();

                      if (value === "AA") {
                        handleMarkChange(index, "AA");
                        return;
                      }

                      if (/^\d*$/.test(value)) {
                        handleMarkChange(index, value);
                        return;
                      }

                      handleMarkChange(index, value);
                    }}
                    className="border p-2 rounded"
                  />
                </div>

              </div>
            ))
          )}
        </div>
        {formError && (
          <p className="text-red-500 text-sm mb-3">{formError}</p>
        )}

        <div className="mt-4 text-sm font-medium">
          Total: {totalMarks} <br />
          Average: {avgMarks}
        </div>

        {/* ================= Buttons ================= */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            className="px-4 py-2 border rounded"
            onClick={() => {
              setTermModal(false);   // close modal
              setEditMode(false);    // exit edit mode
              setAcademic("");       // reset academic
              setMarks([]);          // clear marks
              setSubjects([]);       // clear subjects
              setFormError("");
              setSem("sem1");        // clear validation error
            }}
          >
            Cancel
          </button>


          <button
            type="button"
            onClick={handleSavePerformance}
            disabled={performanceLoading}
            className={`px-5 py-2 rounded text-white flex items-center justify-center gap-2
    ${performanceLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#144196]"}
  `}
          >
            {performanceLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {editMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              editMode ? "Update" : "Save"
            )}
          </button>



        </div>
      </Modal>
      <Modal
        isOpen={!!deleteId}
        onRequestClose={() => setDeleteId(null)}
        style={{
          overlay: { backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000 },
          content: {
            width: "350px",
            margin: "auto",
            height: 'max-content',
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
          },
        }}
      >
        <h3 className="text-lg font-semibold mb-4">Delete Record?</h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this Term / Sem record?
        </p>

        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 border rounded"
            onClick={() => setDeleteId(null)}
            disabled={deleteLoading}
          >
            Cancel
          </button>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"
            onClick={confirmDeleteTermSem}
            disabled={deleteLoading}
          >
            {deleteLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            Delete
          </button>
        </div>
      </Modal>


    </>
  );
};

export default Studentdetails;
