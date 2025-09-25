import React, { use, useEffect } from 'react';
import styles from './Addstudent.module.css';
import { AiOutlineClose } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { FiDownload } from "react-icons/fi";
import { useState } from 'react';
import { Form } from 'antd';
import { addUser } from '../../api/Serviceapi';
import { uploadFile } from '../../api/Serviceapi';
import { IoMdCloseCircle } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { getBatchName, getBatchbyid } from '../../api/Serviceapi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import defaultimg from '../../../src/assets/profile.png'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';

const Addstudent = ({ closeModal, onStudentAdded }) => {

    const [user, setUser] = useState([])
    const [file, setFileName] = useState('');
    const [original, setOriginal] = useState('')
    const [course, setCourse] = useState([])
    const [batch, setBatch] = useState([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    let navigate = useNavigate()
    const location = useLocation();
    const [Formdata, setFormdata] = useState({
        name: '',
        student_id: '',
        student_email: '',
        student_mobile: '',
        student_father: '',
        parent_number: '',
        student_address: '',
        student_bloodgroup: '',
        student_qualification: '',
        student_course: '',
        student_batch: '',
        student_document: '',
        student_aadhar: '',
        student_profile: '',
        student_original: '',
        student_dob: null,

    })

    const [Errors, setErrors] = useState({
        name: '',
        student_id: '',
        student_email: '',
        student_mobile: '',
        student_father: '',
        parent_number: '',
        student_address: '',
        student_bloodgroup: '',
        student_qualification: '',
        student_course: '',
        student_batch: '',
        student_aadhar: '',
        student_profile: '',
        student_original: '',
        student_dob: ''
    });
    const validation = () => {
        let newErrors = {};

        if (!Formdata.name.trim()) {
            newErrors.name = "Student Name is required";
        } else if (!/^(?!.*\d).+$/.test(Formdata.name.trim())) {
            newErrors.name = "Enter a valid name without numbers";
        }

        if (!Formdata.student_dob) {
            newErrors.student_dob = "Date of Birth is required";
        }

        if (!Formdata.student_email.trim()) {
            newErrors.student_email = "Email is required";
        } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(Formdata.student_email.trim())) {
            newErrors.student_email = "Enter a valid email address";
        }

        if (!Formdata.student_mobile.trim()) {
            newErrors.student_mobile = "Mobile number is required";
        } else if (!/^\d{10}$/.test(Formdata.student_mobile.trim())) {
            newErrors.student_mobile = "Enter a valid 10-digit phone number";
        }

        if (!Formdata.student_father.trim()) {
            newErrors.student_father = "Father's Name is required";
        } else if (!/^(?!.*\d).+$/.test(Formdata.student_father.trim())) {
            newErrors.student_father = "Enter a valid Father's name without numbers";
        }

        if (!Formdata.parent_number.trim()) {
            newErrors.parent_number = "Parent's Mobile is required";
        } else if (!/^\d{10}$/.test(Formdata.parent_number.trim())) {
            newErrors.parent_number = "Enter a valid 10-digit phone number";
        }

        if (!Formdata.student_address.trim()) {
            newErrors.student_address = "Address is required";
        }

        if (!Formdata.student_bloodgroup.trim()) {
            newErrors.student_bloodgroup = "Blood Group is required";
        }

        if (!Formdata.student_qualification.trim()) {
            newErrors.student_qualification = "Qualification is required";
        }

        if (!Formdata.student_course.trim()) {
            newErrors.student_course = "Course is required";
        }

        if (!Formdata.student_batch.trim()) {
            newErrors.student_batch = "Batch is required";
        }

        if (!Formdata.student_aadhar) {
            newErrors.student_aadhar = "Aadhar is required";
        }

        if (!Formdata.student_profile) {
            newErrors.student_profile = "Profile is required";
        }

        if (!Formdata.student_original) {
            newErrors.student_original = "Original Document is required";
        }

        setErrors(newErrors);
        return newErrors;
    };

    const aadharfile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadFile(file);

            // Extract imageURL from backend response
            const imageUrl = res.data?.data?.imageURL;

            setFormdata(prev => ({
                ...prev,
                student_aadhar: imageUrl
            }));

            setFileName(res.data?.data?.name);

        } catch (error) {
            console.error("File upload failed", error.response?.data || error);
        }
    };

    const Profilefile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadFile(file);

            // Extract imageURL from backend response
            const imageUrl = res.data?.data?.imageURL;

            setFormdata(prev => ({
                ...prev,
                student_profile: imageUrl
            }));



        } catch (error) {
            console.error("File upload failed", error.response?.data || error);
        }
    };

    const originalFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const res = await uploadFile(file);

            // Extract imageURL from backend response
            const imageUrl = res.data?.data?.imageURL;

            setFormdata(prev => ({
                ...prev,
                student_original: imageUrl
            }));

            setOriginal(res.data?.data?.name)


        } catch (error) {
            console.error("File upload failed", error.response?.data || error);
        }
    };

    const [mes, setMes] = useState('')

    const [toastQueue, setToastQueue] = useState([]);
    const [toastActive, setToastActive] = useState(false);

    const showToast = (message, type = "error") => {
        setToastQueue((prev) => [...prev, { message, type }]);
    };

    useEffect(() => {
        if (!toastActive && toastQueue.length > 0) {
            const { message, type } = toastQueue[0];

            toast[type](message, {
                autoClose: 2000,
                onOpen: () => setToastActive(true),
                onClose: () => {
                    setToastActive(false);
                    setToastQueue((prev) => prev.slice(1)); // remove first toast after close
                },
            });
        }
    }, [toastActive, toastQueue]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validation();
        if (Object.keys(newErrors).length === 0) {
            setLoading(true)
            try {
                const res = await addUser(Formdata);

                setErrors({})
                toast.success("Student added successfully!");
                closeModal()


                if (location.pathname === "/students") {

                    if (onStudentAdded) onStudentAdded();


                } else {

                    navigate("/students");

                }

            } catch (err) {

                // toast.error(err?.response?.data?.message);
                setLoading(false);
                setMes(err?.response?.data?.message);
            }

        }
    }


    useEffect(() => {

        getBatchname()
    }, []);




    let getBatchnameid = async (id) => {
        try {
            const res = await getBatchbyid(id);

            // Extract imageURL from backend response

            console.log(res?.data?.data, 'batch')
            const course = res?.data?.data?.find(c => c._id === id);

            // store only the batches array
            setBatch(
                course?.batches
                    ? Array.isArray(course.batches)
                        ? course.batches
                        : [course.batches]
                    : []
            );
        } catch (error) {
            console.error("error", error.response?.data || error);
        }
    };

    let getBatchname = async () => {
        try {
            const res = await getBatchName();

            // Extract imageURL from backend response

            // console.log(res?.data?.data, 'details')
            // setBatch(res?.data?.data)    
            setCourse(Array.isArray(res?.data?.data) ? res.data.data : []);


        } catch (error) {
            console.error("error", error.response?.data || error);
        }
    };

    const handleCourseName = (e) => {
        const selectedCourseId = e.target.value;


        setFormdata({
            ...Formdata,
            student_course: selectedCourseId,
            student_batch: ""
        });
        setErrors({ ...Errors, student_course: '' })


        getBatchnameid(selectedCourseId);
    };


    const handleBatchName = (e) => {
        setFormdata(prev => ({ ...prev, student_batch: e.target.value }))
        setErrors({ ...Errors, student_batch: '' })

    }

    const handleBloodgroup = (e) => {
        setFormdata(prev => ({ ...prev, student_bloodgroup: e.target.value }))
        setErrors({ ...Errors, student_bloodgroup: '' })
    }

    const namevalidation = (value) => {
        let error = "";

        if (!value.trim()) {
            error = "Student Name is required";
        } else if (!/^(?!.*\d).+$/.test(value.trim())) {
            error = "Enter a valid name without numbers";
        }

        setErrors(prev => ({ ...prev, name: error }));
    };

    const mobilevalidation = (value) => {
        let error = "";

        if (!value.trim()) {
            error = "Mobile number is required";
        } else if (!/^\d{10}$/.test(value.trim())) {
            error = "Enter a valid 10-digit phone number";
        }

        setErrors(prev => ({ ...prev, student_mobile: error }));
    };

    const othervalidation = (value) => {
        let error = "";

        if (!value.trim()) {
            error = "Mobile number is required";
        } else if (!/^\d{10}$/.test(value.trim())) {
            error = "Enter a valid 10-digit phone number";
        }

        setErrors(prev => ({ ...prev, parent_number: error }));
    };


    const emailvalidation = (value) => {
        let error = "";

        if (!value.trim()) {
            error = "Email is required";
        } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(value.trim())) {
            error = "Enter a valid email address";
        }

        setErrors(prev => ({ ...prev, student_email: error }));
    };

    const fathervalidation = (value) => {
        let error = "";

        if (!value.trim()) {
            error = "Father's Name is required";
        } else if (!/^(?!.*\d).+$/.test(value.trim())) {
            error = "Enter a valid Father's name without numbers";
        }

        setErrors(prev => ({ ...prev, student_father: error }));
    };

    const addressvalidation = (value) => {
        let error = "";

        if (!value.trim()) {
            error = "Address is required";
        }

        setErrors(prev => ({ ...prev, student_address: error }));
    };

      const qualivalidation = (value) => {
        let error = "";

         if (!value.trim()) {
           error = "Qualification is required";
        }

        setErrors(prev => ({ ...prev, student_qualification: error }));
    };
  
    return (
        <>
            <div className={styles.add_student}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Add Student</h2>
                    <span className={styles.close_icon} onClick={closeModal}><AiOutlineClose /></span>
                </div>
                <p style={{ color: 'red', fontSize: '12px', marginTop: '1rem' }}>Note: File size should be less than 500KB*</p>
                <form action="">
                    <div className={styles.form_body}>

                        <div className={styles.profile}>
                            <label htmlFor="photoUpload">Profile<span className={styles.important}>*</span></label>
                            {Formdata.student_profile ?
                                <div className={styles.profile_img}>
                                    <img src={Formdata.student_profile} alt="" width={'100%'} height={'100%'} />
                                    <span className={styles.close} onClick={() => setFormdata({ ...Formdata, student_profile: null })}><MdCancel />
                                    </span>

                                </div> :
                                <div className={styles.student_image}>
                                    <label htmlFor="photoUpload" className={styles.customUpload}>
                                        <img src={defaultimg} className={styles.defaultimg} alt="" width={'100%'} height={'100%'} />
                                    </label>

                                    <input type="file" id="photoUpload" className={styles.hiddenInput} onChange={Profilefile} />
                                    <p className={styles.error}>{Errors.student_profile}</p>
                                </div>
                            }
                        </div>

                        <div className={styles.first_detail}>
                            <div className={styles.student_name}>
                                <label htmlFor="name">Student Name<span className={styles.important}>*</span></label>

                                <input className={styles.input_field} value={Formdata.name}
                                    onChange={(e) => {
                                        setFormdata({ ...Formdata, name: e.target.value });
                                        // setErrors({ ...Errors, name: '' });
                                        namevalidation(e.target.value);
                                    }} id='name' type="text" placeholder='Enter name' />
                                <p className={styles.error}>{Errors.name}</p>
                            </div>
                            {/* <div className={styles.student_id}>
                                <label htmlFor="id">ID</label>
                                <input className={styles.input_field} onChange={(e) => setFormdata({ ...Formdata, student_id: e.target.value })} value={Formdata.student_id} id='id' type="text" placeholder='0245687' />
                                <p>{Errors.student_id}</p>
                            </div> */}
                        </div>
                        <div className={styles.second_detail}>
                            <div className={styles.student_phone}>
                                <label htmlFor="student_phone">Mobile Number<span className={styles.important}>*</span></label>
                                <input className={styles.input_field} inputMode='numeric' maxLength={10} onChange={(e) => { setFormdata({ ...Formdata, student_mobile: e.target.value }), mobilevalidation(e.target.value) }} value={Formdata.student_mobile} id='student_phone' type="tel" placeholder='Enter number' />
                                <p className={styles.error}>{Errors.student_mobile}</p>
                            </div>
                            <div className={styles.student_email}>
                                <label htmlFor="email">E-Mail<span className={styles.important}>*</span></label>
                                <input className={styles.input_field} onChange={(e) => { setFormdata({ ...Formdata, student_email: e.target.value }), emailvalidation(e.target.value) }} value={Formdata.student_email} id='email' type="email" placeholder='Enter mail' />
                                <p className={styles.error}>{Errors.student_email}</p>
                            </div>
                        </div>
                        <div className={styles.third_detail}>
                            <div className={styles.student_father}>
                                <label htmlFor="father_name">Father Name<span className={styles.important}>*</span></label>
                                <input className={styles.input_field} onChange={(e) => { setFormdata({ ...Formdata, student_father: e.target.value }), fathervalidation(e.target.value) }} value={Formdata.student_father} id='father_name' type="text" placeholder='Enter name' />
                                <p className={styles.error}>{Errors.student_father}</p>
                            </div>
                            <div className={styles.student_mobile}>
                                <label htmlFor="mobile">Parent Number<span className={styles.important}>*</span></label>
                                <input className={styles.input_field} inputMode='numeric' maxLength={10} onChange={(e) => { setFormdata({ ...Formdata, parent_number: e.target.value }), othervalidation(e.target.value) }} value={Formdata.parent_number} id='mobile' type="tel" placeholder='Enter Parent Number' />
                                <p className={styles.error}>{Errors.parent_number}</p>
                            </div>
                        </div>
                        <div className={styles.fourth_detail}>
                            <div className={styles.student_address}>
                                <label htmlFor="address">Address<span className={styles.important}>*</span></label>
                                <input className={styles.input_field} onChange={(e) => { setFormdata({ ...Formdata, student_address: e.target.value }), addressvalidation(e.target.value) }} value={Formdata.student_address} id='address' type="text" placeholder='Enter Address' />
                                <p className={styles.error}>{Errors.student_address}</p>
                            </div>
                        </div>
                        <div className={styles.fifth_detail}>
                            <div className={styles.student_bloodgroup}>
                                <label htmlFor="blood-group">Blood<span className={styles.important}>*</span></label>
                                <div className={styles.select_container}>
                                    <select className={styles.select_field} onChange={handleBloodgroup} id="blood-group" value={Formdata.student_bloodgroup} name="blood-group">
                                        <option value="" disabled>Bloodgroup</option>

                                        <option value="A+">A+</option>
                                        <option value="A-">A−</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B−</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB−</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O−</option>
                                        <option value="A1B+">A1B+</option>

                                    </select>
                                    <FaChevronDown className={styles.selectIcon} />
                                </div>
                                <p className={styles.error}>{Errors.student_bloodgroup}</p>
                            </div>
                            <div className={styles.student_dob}>
                                <div className={styles.datepicker_wrapper}>
                                    {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <div>
                                            

                                            <DatePicker
                                                open={open}
                                                onOpen={() => setOpen(true)}
                                                onClose={() => setOpen(false)}
                                                value={Formdata.student_dob ? dayjs(Formdata.student_dob, "DD/MM/YYYY") : null}
                                                maxDate={dayjs()}
                                                onAccept={(newValue) => {
                                                    if (newValue && newValue.date()) {   
                                                        const formatted = dayjs(newValue).format("DD/MM/YYYY");
                                                        setFormdata({ ...Formdata, student_dob: formatted });
                                                        setErrors({ ...Errors, student_dob: "" });
                                                        setOpen(false);  
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
                                                                height: '40px', marginTop: "5px",
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

                                            <div >
                                                <p className={styles.error}>{Errors.student_dob}</p>
                                            </div>
                                        </div>
                                    </LocalizationProvider> */}
                                    <div >
                                        <label htmlFor="date">D.O.B<span className={styles.important}>*</span></label>

                                    </div>

                                    <input type="date" max={new Date().toISOString().split("T")[0]} className={styles.inputfield} value={Formdata.student_dob} onChange={(e) => { setFormdata({ ...Formdata, student_dob: e.target.value }), setErrors({ ...Errors, student_dob: '' }) }} />
                                    <p className={styles.error}>{Errors.student_dob}</p>

                                </div>
                            </div>
                            <div className={styles.student_qualification}>
                                <label htmlFor="qualification">Qualification<span className={styles.important}>*</span></label>
                                <input type="text" id="qualification" onChange={(e) => { setFormdata({ ...Formdata, student_qualification: e.target.value }), qualivalidation(e.target.value) }} value={Formdata.student_qualification} placeholder='Enter qualification' className={styles.input_field} />
                                <p className={styles.error}>{Errors.student_qualification}</p>

                            </div>
                        </div>
                        <div className={styles.sixth_detail}>
                            <div className={styles.course_batch_row}>
                                <div className={styles.student_course}>
                                    <label htmlFor="course">Select Course<span className={styles.important}>*</span></label>
                                    <div className={styles.select_container}>
                                        <select className={styles.select_field} onChange={handleCourseName} value={Formdata.student_course} id="course" name="course">
                                            <option value="">Select a course</option>
                                            {course.map((course) => (
                                                <option value={course._id} key={course._id}>{course.courseName}</option>

                                            ))}

                                        </select>

                                        <FaChevronDown className={styles.selectIcon} />
                                        <p className={styles.error}>{Errors.student_course}</p>
                                    </div>
                                </div>
                                <div className={styles.student_batch}>
                                    <label htmlFor="batch">Select Batch<span className={styles.important}>*</span></label>
                                    <div className={styles.select_container}>

                                        <select onChange={handleBatchName} disabled={!Formdata.student_course} style={{ cursor: Formdata.student_course ? 'pointer' : 'not-allowed' }} className={styles.select_field} value={Formdata.student_batch} id="batch" name="batch">
                                            <option value="" >Select a batch</option>
                                            {Array.isArray(batch) &&

                                                batch.map((b) => (
                                                    <option value={b._id} key={b._id}>
                                                        {b.batchName}
                                                    </option>
                                                ))
                                            }
                                        </select>

                                        <FaChevronDown className={styles.selectIcon} />
                                        <p className={styles.error}>{Errors.student_batch}</p>

                                    </div>
                                </div>
                            </div>

                            <div className={styles.document_upload_row}>
                                {Formdata.student_aadhar ?
                                    <div className={styles.student_aadhar}>
                                        <label htmlFor="aadharupload">Aadhar card<span className={styles.important}>*</span></label>
                                        <label htmlFor="aadharupload" className={styles.custom_file_upload}>
                                            <span className={styles.filename}>{file}</span>
                                            <span className={styles.download_icon} onClick={() => setFormdata({ ...Formdata, student_aadhar: null })}><IoMdCloseCircle />
                                            </span>
                                        </label>
                                    </div> :
                                    <div className={styles.student_aadhar}>
                                        <label htmlFor="aadharupload">Aadhar card<span className={styles.important}>*</span></label>
                                        <input
                                            type="file"
                                            id="aadharupload"
                                            className={styles.hidden_file_input}

                                            onChange={aadharfile}
                                        />
                                        <label htmlFor="aadharupload" className={styles.custom_file_upload}>
                                            Upload document
                                            <span className={styles.download_icon}><FiDownload /></span>
                                        </label>

                                        <p className={styles.error}>{Errors.student_aadhar}</p>
                                    </div>
                                }

                                <div className={styles.student_document}>
                                    <label htmlFor="documentupload">Document<span className={styles.important}>*</span></label>
                                    {Formdata.student_original ?
                                        <div>

                                            <label htmlFor="documentupload" className={styles.custom_file_upload}>
                                                <span className={styles.filename}>{original}</span>
                                                <span className={styles.download_icon} onClick={() => setFormdata({ ...Formdata, student_original: null })}><IoMdCloseCircle />
                                                </span>
                                            </label>
                                        </div>
                                        : <div>
                                            <input type="file" id="documentupload" className={styles.hidden_file_input} onChange={originalFile} />
                                            <label htmlFor="documentupload" className={styles.custom_file_upload}>
                                                Upload document
                                                <span className={styles.download_icon}><FiDownload /></span>
                                            </label>
                                            <p className={styles.error}>{Errors.student_original}</p>
                                        </div>
                                    }

                                </div>
                            </div>
                        </div>
                        {/* <p className={styles.error}>{mes}</p> */}
                        <div className={styles.submit_button}>
                            <input type="submit" value={loading ? "Loading..." : "Add Student"} style={{ cursor: "pointer" }} className={styles.submit} onClick={handleSubmit} />
                        </div>
                        <p style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>{mes}</p>
                    </div>
                </form>
            </div>
            {/* <div className={styles.toastWrapper}>
                <ToastContainer
                    position="bottom-center"
                    newestOnTop
                    className={styles.customContainer}
                />
            </div> */}

        </>
    )
}

export default Addstudent 