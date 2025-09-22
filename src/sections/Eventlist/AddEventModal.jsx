import React, { useState } from 'react';
import styles from './AddEventModal.module.css';
import { AiOutlineClose } from "react-icons/ai";
import { SlCalender } from 'react-icons/sl';
import { MdAccessTimeFilled } from "react-icons/md";
import { getEventcreate } from '../../api/Serviceapi';
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { toast, ToastContainer } from 'react-toastify';


const AddEventModal = ({ closeModal, onevent }) => {

  const [formdata, setFormdata] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    eventType: ""
  })

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    status: ""
  });

  const convertTo12Hour = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(':');
    const hr = +hour % 12 || 12;
    const ampm = +hour >= 12 ? 'PM' : 'AM';
    return `${hr}:${minute} ${ampm}`;
  };

  const statusChange = (e) => {
    setFormdata({ ...formdata, eventType: e.target.value })
    setErrors({ ...errors, status: '' })
  }
  let validateForm = () => {
    let newErrors = {};
    if (!formdata.title.trim()) newErrors.title = "Event title is required";
    if (!formdata.description.trim()) newErrors.description = "Event description is required";
    if (!formdata.date) newErrors.date = "Event date is required";
    if (!formdata.eventType.trim()) newErrors.status = "Event Type is required";
    if (!formdata.time.trim()) newErrors.time = "Time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true)
      try {
        const formattedData = {
          ...formdata,
          time: convertTo12Hour(formdata.time)
        };
        const res = await getEventcreate(formattedData);
        if (onevent) onevent();
        toast.success('Event Added successfully');
      } catch (err) {
        console.log(err.response?.data.message);
      } finally {
        setLoading(false)
      }
      console.log("Submitting event:", formdata);
      closeModal();
    }
  };

  const titlevalidation = (value) => {
    let error = "";

    if (!value.trim()) {
      error = "Event title is required"
    }

    setErrors(prev => ({ ...prev, title: error }));
  };
  const disvalidation = (value) => {
    let error = "";

    if (!value.trim()) {
      error = "Event description is required";
    }

    setErrors(prev => ({ ...prev, description: error }));
  };
  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_content}>
        <div className={styles.header}>
          <h2>Add Event</h2>
          <span className={styles.close_icon} onClick={closeModal}><AiOutlineClose /></span>
        </div>
        <form className={styles.form}>
          <div className={styles.row}>

            <div className={styles.input_group}>
              <label htmlFor="title">Event Title<span className={styles.required}>*</span></label>
              <input type="text" value={formdata.title} id="title" placeholder="Enter event title" onChange={(e) => { setFormdata({ ...formdata, title: e.target.value }), titlevalidation(e.target.value) }} />
              <p className={styles.error}>{errors.title}</p>
            </div>
            <div className={styles.input_group} style={{ width: '100%', height: '100%' }}>
              <label >Event Type<span className={styles.required}>*</span></label>
              <FormControl
                variant="outlined"
                size="small"
                sx={{
                  minWidth: '100%',
                  backgroundColor: '#F6F6F6', // match the image background
                  borderRadius: '6px',
                  border: 'none',
                  height: '45px',
                  border: ' 1px solid #eceaeae1'

                }}
              >
                <Select
                  value={formdata.eventType}
                  onChange={(e) => statusChange(e)}
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
                //  placeholder="Event Type"

                >
                  <MenuItem value="">Select Event Type</MenuItem>

                  <MenuItem value="birthday">Birthday</MenuItem>
                  {/* <MenuItem value="anniversary">Anniversary</MenuItem> */}
                  <MenuItem value="function">Function</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>



                </Select>
              </FormControl>
              <p className={styles.error}>{errors.status}</p>

            </div>
          </div>


          <div className={styles.input_group}>
            <label htmlFor="description">Description<span className={styles.required}>*</span></label>
            <textarea id="description" value={formdata.description} placeholder="Event description here..." onChange={(e) => { setFormdata({ ...formdata, description: e.target.value }), disvalidation(e.target.value) }}></textarea>
            <p className={styles.error}>{errors.description}</p>
          </div>

          <div className={styles.row}>
            <div className={`${styles.input_group} ${styles.input_icon}`} style={{ flex: 1 }}>
              <label htmlFor="date">Date<span className={styles.required}>*</span></label>
              <input type="date" id="date" value={formdata.date} onChange={(e) => { setFormdata({ ...formdata, date: e.target.value }), setErrors({ ...errors, date: '' }) }} required />
              <p className={styles.error}>{errors.date}</p>
            </div>

            <div className={`${styles.input_group} ${styles.input_icon}`} style={{ flex: 1 }}>
              <label htmlFor="time">Time<span className={styles.required}>*</span> </label>
              <input type="time" id="time" value={formdata.time} onChange={(e) => { setFormdata({ ...formdata, time: e.target.value }), setErrors({ ...errors, time: '' }) }} />
              <p className={styles.error}>{errors.time}</p>
            </div>
          </div>

          <button type="submit" onClick={handleSubmit} className={styles.submit_btn}>{loading ? 'Creating...' : 'Create'}</button>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;
