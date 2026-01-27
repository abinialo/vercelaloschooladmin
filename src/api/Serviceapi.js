// src/api/userService.js
import { FaCertificate } from "react-icons/fa6";
import apiService from "./apiService";
import Form from "antd/es/form/Form";
import { useState } from "react";

export const getUser = (
  limit,
  offset,
  value,
  courseId,
  status,
  batchId,
  activestatus
) => {
  return apiService.get(
    `/user?limit=${limit}&offset=${offset}&value=${value}&courseId=${courseId}&inStatus=${status}&batchId=${batchId}&status=${activestatus}`
  );
};
export const getUserFilter = (value) => {
  return apiService.get(`/user?value=${value}`);
};
export const getBatch = () => {
  return apiService.get(`/batch`);
};

export const getUserId = (id) => {
  return apiService.get(`/user?id=${id}`);
};

export const LoginUser = (email, password) => {
  return apiService.post(`/user/login`, { email, password });
};

//postcourse
export const postCourse = (courseData) => {
  return apiService.post(`/course/create`, courseData);
};

export const getCourse = (limit, offset) => {
  return apiService.get(`/course/count?limit=${limit}&page=${offset}`);
};

//getcoursebyid
export const getCourseById = (id) => {
  return apiService.get(`/course/count?courseId=${id}`);
};
//editcourse
export const editCouse = (id, editData) => {
  return apiService.put(`/course/${id}`, editData);
};
//getbatch
export const getCourseBatch = () => {
  return apiService.get(`/batch`);
};
//postbatch
export const postCourseBatch = (data) => {
  return apiService.post(`/batch/create`, data);
};
//putbatch
export const updateCourseBatch = (id, editdata) => {
  return apiService.put(`/batch/${id}`, editdata);
};

// get batch by courseId
export const getCourseBatchByCourseId = (courseId, limit, offset) => {
  return apiService.get(
    `/batch?courseId=${courseId}&limit=${limit}&page=${offset}`
  );
};

export const addUser = (FormData) => {
  let data = {
    name: FormData.name,
    email: FormData.student_email,
    mobileNo: FormData.student_mobile,
    fatherName: FormData.student_father,
    alterMobileNo: FormData.parent_number,
    address: FormData.student_address,
    blood: FormData.student_bloodgroup,
    qualification: FormData.student_qualification,
    aadharURL: FormData.student_aadhar,
    certificateURL: FormData.student_original,
    profileURL: FormData.student_profile,
    courseId: FormData.student_course,
    batchId: FormData.student_batch,
    DOB: FormData.student_dob,
    createdBy: localStorage.getItem("userId"),
  };
  return apiService.post(`/user/create`, data);
};

export const updateUser = (FormData, id) => {
  let data = {
    name: FormData.name,
    email: FormData.student_email,
    mobileNo: FormData.student_mobile,
    fatherName: FormData.student_father,
    alterMobileNo: FormData.parent_number,
    address: FormData.student_address,
    blood: FormData.student_bloodgroup,
    qualification: FormData.student_qualification,
    aadharURL: FormData.student_aadhar,
    certificateURL: FormData.student_original,
    profileURL: FormData.student_profile,
    courseId: FormData.student_course,
    batchId: FormData.student_batch,
    DOB: FormData.student_dob,
    inStatus: FormData.inStatus,
    ID:FormData.ID
  };
  return apiService.put(`/user/${id}`, data);
};

export const updatedetailsuser = (status, id) => {
  return apiService.put(`/user/${id}`, { status });
};

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file); // key name must be 'file'

  return apiService.post("file/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteUserId = (id) => {
  return apiService.delete(`user/${id}`);
};

export const getBatchName = () => {
  return apiService.get(`/batch/batch`);
};

export const getBatchbyid = (id) => {
  return apiService.get(`/batch/batch?courseId=${id}`);
};

// events
export const getEvents = (limit, offset, status) => {
  return apiService.get(
    `/event?limit=${limit}&offset=${offset}&status=${status}`
  );
};

export const getEventcreate = (formdata) => {
  return apiService.post(`/event/create`, formdata);
};

export const deleteEvent = (id) => {
  return apiService.delete(`/event/${id}`);
};

export const updateEvent = (formdata, id) => {
  let data = {
    title: formdata.title,
    description: formdata.description,
    date: formdata.date,
    time: formdata.time,
    eventType: formdata.eventType,
  };
  return apiService.put(`/event/${id}`, data);
};

export const getEventById = (id) => {
  return apiService.get(`/event/${id}`);
};

// attendence
export const getAttendance = (
  limit,
  offset,
  searchtext,
  courseId,
  batchId,
  date,
  status
) => {
  let url = `/attendance/admin?limit=${limit}&page=${offset}&value=${searchtext}&courseId=${courseId}&batchId=${batchId}&date=${date}`;

  if (status !== "") {
    url += `&onLeave=${status}`;
  }

  return apiService.get(url);
};

export const getAttendancerate = (date, courseId, batchId) => {
  return apiService.get(
    `/attendance/rate?date=${date}&courseId=${courseId}&batchId=${batchId}`
  );
};

// leave request

export const getLeaveRequest = (limit, offset, date, status, value,courseId,batchId,leaveType) => {
  return apiService.get(
    `/leave?limit=${limit}&offset=${offset}&date=${date}&status=${status}&value=${value}&courseId=${courseId}&batchId=${batchId}&leaveType=${leaveType}`
  );
};

export const getLeaveRequestById = (id) => {
  return apiService.get(`/leave?_id=${id}`);
};

export const updateLeaveRequest = (id, status, adminId, reason) => {
  let reasonType = "";
  if (status === "Rejected") {
    reasonType = "rejectReason";
  } else {
    reasonType = "approvedReason";
  }
  return apiService.put(`/leave/${id}`, {
    status: status,
    approverId: adminId,
    [reasonType]: reason,
  });
};

// fee

export const getFee = (
  limit,
  offset,
  courseId,
  batchId,
  semester,
  searchtext
) => {
  return apiService.get(
    `/fee?limit=${limit}&offset=${offset}&courseId=${courseId}&batchId=${batchId}&noOfsem=${semester}&value=${searchtext}`
  );
};

export const getFeeById = (id) => {
  return apiService.get(`/fee/?_id=${id}`);
};

export const createFee = (formdata) => {
  return apiService.post(`/fee/create`, formdata);
};

export const calcfee = (courseId, batchId, semester, searchText) => {
  return apiService.get(
    `/feeBalance/dasboard?courseId=${courseId}&batchId=${batchId}&noOfsem=${semester}&value=${searchText}`
  );
};

// dashboard

// export const createBalanceFee = (formdata) => {
//   return apiService.post(`/feeBalance`, formdata);
// };

export const updateBalanceFee = (userId, payload) => {
  return apiService.put(`/feeBalance/${userId}`, payload);
};

export const emailFee = (userId) => {
  return apiService.post(`/fee/mail`, { '_id': userId });
};

export const updateFeeEmail = (id) => {
  return apiService.put(`/fee/${id}`, {'mailStatus':'Sent'});
};

export const getDashboardUser = () => {
  return apiService.get(`/user?limit=3&inStatus=ongoing&status=active`);
};

export const getDashboardEvents = (status) => {
  return apiService.get(`/event?status=${status}&limit=6`);
};

export const getDashboardLeave = (status) => {
    const today = new Date().toLocaleDateString("en-CA");

  return apiService.get(`/leave?status=${status}&date=${today}&limit=5`);
};

export const studentCount = () => {
  return apiService.get(`/user/count`);
};

export const getStudentAttendencemonth = (userId) => {
  return apiService.get(`/leave/month?userId=${userId}`);
};

export const getAttendanceStudentList = (userId) => {
  return apiService.get(`/attendance?userId=${userId}&limit=4`);
};

export const getTodayrate = () => {
    const today = new Date().toLocaleDateString("en-CA");
  return apiService.get(`/attendance/rate?date=${today}`);
};

export const getDashboardAttendencerate = (date) => {
  return apiService.get(`/attendance/rate?date=${date}`);
};

// notification

export const getNotification = () => {
  return apiService.get(`/notification?notificationType=admin`);
};

export const updateNotification=(id,read) => {
  return apiService.put(`/notification/${id}`,{'isRead':read});
}

// enquiry

export const getEnquiry = (limit,offset,enroll) => {
  return apiService.get(`/aloEnroll?limit=${limit}&page=${offset}&enrollType=${enroll}`);
};

//application

export const getApplication = (limit,offset ) => {
  return apiService.get(`/student?limit=${limit}&page=${offset}`);
};

export const getApplicationByid = (id) => {
  return apiService.get(`/student/${id}`);
};

export const excelStudents = (courseId,batchId,status,activestatus,searchText) => {
  return apiService.get(`/user/excel?courseId=${courseId}&inStatus=${status}&batchId=${batchId}&status=${activestatus}&value=${searchText}`);
};

export const excelfee = (courseId,batchId,semester,searchText) => {
  return apiService.get(`/fee/excel?&courseId=${courseId}&batchId=${batchId}&noOfsem=${semester}&value=${searchText}`);
};

export const excelAttendance = (
 
  searchtext,
  courseId,
  batchId,
  date,
  status
) => {
  let url = `/attendance/excel?value=${searchtext}&courseId=${courseId}&batchId=${batchId}&date=${date}`;

  if (status !== "") {
    url += `&onLeave=${status}`;
  }

  return apiService.get(url);
};

export const makeabsent = (id,discription) => {
    const userId = sessionStorage.getItem('userId');
    const date= new Date().toLocaleDateString("en-CA")
  return apiService.post(`/leave/admin/create`,{'userId':id,'date' :date,'approverId':userId,'discription':discription} );
};

export const attendancestudentrate = (userid,fromdate,todate) => {
  return apiService.get(`attendance/studentrate?userId=${userid}&fromDate=${fromdate}&toDate=${todate}`);
};
// export const getUserByStudentId = (studentId) => {
//   return apiService.get(`/user?studentId=${studentId}`);
// };

// term / sem (performance)

export const createTermSem = (payload) => {
  return apiService.post("/performance/send", payload);
};



// export const getUsers = (params = {}) => {
//   return apiService.get("/user", {
//     params: params   // ✅ THIS IS REQUIRED
//   });
// };



export const getPerformance = () => {
  return apiService.get("/performance");
};
export const updateTermSem = (id, payload) => {
  return apiService.put(`/performance/${id}`, payload);
};

export const deleteTermSem = (id) => {
  return apiService.delete(`/performance/${id}`);
};
// term wise toppers
export const getDashboardTermToppers = (Term) => {
  return apiService.get("/performance/leaderboard", {
    params: {
      Academic: Term,   // e.g. "Term 3"
    },
  });
};

// semester wise toppers
export const getDashboardSemesterToppers = (semester) => {
  return apiService.get("/performance/leaderboard", {
    params: {
      Academic: semester,  
    },
  });
};
