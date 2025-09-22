import React, { useState, useLayoutEffect, useEffect } from 'react'
import styles from './Header.module.css'
import logo from '../assets/aloschoolimages/logo1.png'
import employee from '../assets/aloschoolimages/employee.png'
import { IoPieChart } from "react-icons/io5";
import { IoPieChartOutline } from "react-icons/io5";
import { BsPerson } from "react-icons/bs";
import { LiaMoneyBillSolid } from "react-icons/lia";
import { RiFileList2Line } from "react-icons/ri";
import { PiFlagPennantLight } from "react-icons/pi";
import { RiSettings5Line } from "react-icons/ri";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FaBullseye, FaPlus } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { GoBell } from "react-icons/go";
import user_image from '../assets/user.png'
import { IoMdPerson } from "react-icons/io";
import { RiFileList2Fill } from "react-icons/ri";
import { PiFlagPennantFill } from "react-icons/pi";
import { RiSettings5Fill } from "react-icons/ri";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaIdBadge } from "react-icons/fa";
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Addstudent from '../sections/Addstudent/Addstudent'
import Modal from 'react-modal';
import { FaMoneyBill } from "react-icons/fa";
import LogoutModal from '../sections/Logout/LogoutModal';
import { getNotification, updateNotification } from '../api/Serviceapi';
import { IoMdCloseCircle } from "react-icons/io";
import { format } from "date-fns";
import { FaQuestionCircle } from "react-icons/fa";
import { FaRegIdBadge } from "react-icons/fa";


const Header = ({ setLoginUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [notification, setNotification] = useState(false)
  const [notificationlist, setNotificationlist] = useState([])
  const [isread, setIsread] = useState(false)
  const handleToggleNavbar = () => {
    setIsNavbarOpen(true);
  };

  const handleCloseNavbar = () => {
    setIsNavbarOpen(false);
  };
  useLayoutEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      // Update both width and navbar state in sync
      setWindowWidth(width);

      if (width > 768 && isNavbarOpen) {
        setIsNavbarOpen(false); // Close on desktop
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial check on mount
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isNavbarOpen]);

  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutOpen, setIsLogutOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);


  const handleLogout = () => {
    console.log("Logout clicked");
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    navigate('/login');
    setLoginUser(false);
  };

  let userName = localStorage.getItem('username');

  useEffect(() => {
    notificationget()
    const interval = setInterval(() => {
      notificationget();
    }, 60000);

    // clear interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  const [count, setCount] = useState(0)

  let notificationget = async () => {
    try {
      const res = await getNotification();
      setNotificationlist(res?.data?.data?.data);
      // console.log(res?.data?.data?.fetchCount, 'ddd')
      setCount(res?.data?.data?.fetchCount)
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }

  }

  let updatenotification = async (id) => {

    try {
      setIsread(true)
      const res = await updateNotification(id, isread);
      notificationget()
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
    const year = date.getUTCFullYear();
    return { day, month, year };
  };



  return (
    <>
      <div className={styles.aloschool}>
        <div className={styles.menu_toggle} onClick={handleToggleNavbar}><IoMenu /></div>
        <div className={`${styles.navbar} ${windowWidth <= 768 ? (isNavbarOpen ? styles.open : styles.closed) : ''}`}>
          <div className={styles.navbar_close} onClick={handleCloseNavbar}><IoMdClose /></div>
          <div className={styles.navbar_content}>
            <div>
              <div className={styles.logo}>
                <Link to='/dashboard'>
                  <img src={logo} alt="logo" height={"100%"} width={"100%"} style={{
                    filter: 'brightness(0) saturate(100%) invert(100%)'
                  }} /></Link>
              </div>
            </div>
            <div className={styles.main_navigation}>
              <div className={styles.navigation}>
                <div className={styles.dashboard}>
                  <button className={`${styles.dashboard_button} ${location.pathname == '/dashboard' ? styles.navactive : ''}`} onClick={() => navigate('/dashboard')}> {location.pathname == '/dashboard' ? <IoPieChart className={styles.filled_chart_icon} /> : <IoPieChartOutline className={styles.outline_chart_icon} />}Dashboard</button>
                </div>
                <div className={styles.students}>
                  <button className={`${styles.students_button}  ${location.pathname == '/students' ? styles.navactive : ''} ${location.pathname.startsWith('/students/studentview') ? styles.navactive : ''}`} onClick={() => navigate('/students')}>{location.pathname == '/students' || location.pathname.startsWith('/students/studentview') ? <IoMdPerson className={styles.filled_person_icon} /> : <BsPerson className={styles.outline_person_icon} />}Students</button>
                </div>
                <div className={styles.fees}>
                  <button className={`${styles.fees_button} ${location.pathname == '/fees' ? styles.navactive : ''}`} onClick={() => navigate('/fees')}>{location.pathname == '/fees' ? <FaMoneyBill /> : <LiaMoneyBillSolid className={styles.outline_fee_icon} />
                  }Fee Management</button>
                </div>
                <div className={styles.attendance}>
                  <button className={`${styles.attendance_button} ${location.pathname == '/attendence' || location.pathname.startsWith('/attendence/leaverequest') ? styles.navactive : ''}`} onClick={() => navigate('/attendence')}>
                    {location.pathname == '/attendence' || location.pathname.startsWith('/attendence/leaverequest') ? <RiFileList2Fill className={styles.filled_list_icon} />
                      :
                      <RiFileList2Line className={styles.outline_list_icon} />}Attendance</button>
                </div>
                <div className={styles.attendance}>
                  <button className={`${styles.attendance_button} ${location.pathname == '/course' || location.pathname.startsWith('/course/coursedetails') ? styles.navactive : ''}`} onClick={() => navigate('/course')}>
                    {location.pathname == '/course' || location.pathname.startsWith('/course/coursedetails') ? <RiFileList2Fill className={styles.filled_list_icon} /> : <RiFileList2Line className={styles.outline_list_icon} />}


                    Course</button>
                </div>
                <div className={styles.events}>
                  <button className={`${styles.events_button} ${location.pathname == '/events' ? styles.navactive : ''}`} onClick={() => navigate('/events')}>{location.pathname == '/events' ? <PiFlagPennantFill className={styles.filled_flag_icon} /> : <PiFlagPennantLight className={styles.outline_flag_icon} />}  Events</button>
                </div>
                <div className={styles.settings}>
                  <button className={`${styles.settings_button} ${location.pathname == '/enquiry' ? styles.navactive : ''}`} onClick={() => navigate('/enquiry')}>{location.pathname == '/enquiry' ? <FaQuestionCircle className={styles.outline_settings_icon} />:
                    <FaRegQuestionCircle className={styles.filled_settings_icon} /> }
                    Enquiry</button>
                </div>
                <div className={styles.settings}>
                  <button className={`${styles.settings_button} ${location.pathname == '/application' ? styles.navactive : ''}`} onClick={() => navigate('/application')}>{location.pathname == '/application' ? <FaIdBadge className={styles.outline_settings_icon} />:
                    <FaRegIdBadge  className={styles.filled_settings_icon} /> }
                    Application</button>
                </div>
                <div className={styles.logout}>
                  <button className={styles.logout_button} onClick={() => setIsLogutOpen(true)}><RiLogoutCircleLine className={styles.outline_logout_icon} /> Logout</button>
                </div>
              </div>
              <div className={styles.add_student}>
                <button className={styles.add_student_button} onClick={() => setIsOpen(true)}><FaPlus />Add Student</button>
              </div>
            </div>
            <div className={styles.task_box}>
              <div className={styles.task}>
                <p className={styles.task_text}>Let’s streamline your tasks today</p>
                <img className={styles.employee_image} src={employee} alt="employee" height={"100%"} width={"100%"} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.welcome}>
              <h2 className={styles.welcome_text}>Welcome Back!</h2>
            </div>
            <div className={styles.login_details}>
              <div className={styles.userdetails} onClick={() => setIsLogutOpen(true)} style={{ cursor: 'pointer' }}>
                <div className={styles.user_image} style={{ cursor: 'pointer' }}>
                  <img src={user_image} alt="" height={"100%"} width={"100%"} />
                </div>
                <div className={styles.user_name}><p className={styles.admin_user} style={{ cursor: 'pointer' }} >{userName}</p></div>

              </div>
              <div className={styles.notification_icon} style={{ cursor: 'pointer' }} onClick={() => (Array.isArray(notificationlist) && notificationlist.length > 0) && setNotification(!notification)}>
                <div>
                  <GoBell />
                  <div className={`${count > 0 && styles.dot}`}>
                  </div>
                </div>

              </div>

            </div>
          </div>

          <div className={styles.Outlet} style={{ height: '100vh', overflow: 'auto' }}>
            <Outlet />
          </div>
        </div>
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
        <Addstudent closeModal={() => setIsOpen(false)} />
      </Modal>

      <Modal
        isOpen={isLogoutOpen}
        onRequestClose={() => setIsLogutOpen(false)}
        contentLabel="Logout Confirmation"
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgb(21 21 21 / 81%)',
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
        <LogoutModal
          onConfirmLogout={handleLogout}
          closeModal={() => setIsLogutOpen(false)}
        />
      </Modal>
      {notification &&

        <div className={styles.notification}>
          <div className={styles.notification_content}>
            <div className={styles.notification_header}>
              <p className={styles.notification_title}>Notifications</p>
              <IoMdCloseCircle style={{ cursor: 'pointer', fontSize: '20px' }} onClick={() => setNotification(false)} />

              {/* <p className={styles.notification_count}>{count}</p> */}
            </div>
            {notificationlist.map((item, index) => {
              const { day, month, year } = formatDate(item.date);
              const firstLetter = item.message?.charAt(0).toUpperCase(); // Get first letter

              return (
                <div className={styles.notification_box} onClick={() => updatenotification(item?._id)}>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-semibold">
                        {firstLetter}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', textTransform: 'capitalize' }} className={`${item.isRead ? "" : styles.notification_read}`}>
                        {item.message}
                      </p>

                      <span className="text-xs text-gray-400">
                        {day} {month} {year}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      }


    </>
  )
}

export default Header;