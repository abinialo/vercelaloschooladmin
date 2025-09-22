import React, { useEffect, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import { PlusIcon } from '@heroicons/react/24/solid';
import AddEventModal from './AddEventModal';
import { getEvents, deleteEvent } from '../../api/Serviceapi';
import styles from './Eventlist.module.css'
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Modal from 'react-modal';
import Updateevent from '../../component/updateevent/Updateevent';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
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

const Eventlist = () => {
    const [limit, setlimit] = useState(8);
    const [totaluser, settotal] = useState(0);
    const [totalpages, setpage] = useState(0);
    const [offset, setoffset] = useState(1);
    const [status, setStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    // Calculate visible range
    const startIndex = (offset - 1) * limit + 1;
    const endIndex = Math.min(offset * limit, totaluser);
    const statusChange = (event) => {
        setStatus(event.target.value);
        setoffset(1)
    }
    const handlePageChange = (event, value) => {
        setEvents([]);
        if (value === offset) {
            getevents();
        } else {
            setoffset(value); 
        }
    };

    useEffect(() => {
        const totalPages = Math.ceil(totaluser / limit);
        setpage(totalPages);
    }, [totaluser, limit]);

    let getevents = async () => {
        setLoading(true); 
        try {
            const res = await getEvents(limit, offset - 1, status);
            console.log(res?.data?.data?.totalCount, 'events')
            setEvents(res?.data?.data?.data || [])
            settotal(res?.data?.data?.totalCount);

        } catch (error) {
            console.error("error", error.response?.data || error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getevents()
    }, [offset, status])

    const [deleteevent, setDelete] = useState(false)
    const [updateevent, setUpdate] = useState(false)

    const [id, setId] = useState('')

    const handleDelete = async (id) => {
        try {
            await deleteEvent(id);
            getevents(); // refresh the list
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };


    return (
        <>
              <ToastContainer />
        
            {showModal && <AddEventModal closeModal={() => setShowModal(false)} onevent={getevents} />}
            {updateevent && <Updateevent closeModal={() => setUpdate(false)} onevent={getevents} id={id} />}

            <div className='px-4 pt-4 pb-[100px]'>
                <div className="flex justify-between items-center lg:flex-row md:flex-row flex-col">
                    <h4 className='text-xl font-normal'>Events</h4>
                    <div className=' flex items-end md:justify-around flex-wrap p-2 gap-2 '>
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

                                    <MenuItem value="completed">Completed</MenuItem>
                                    <MenuItem value="upcoming">Upcoming</MenuItem>
                                    <MenuItem value="ongoing">Ongoing</MenuItem>


                                </Select>
                            </FormControl>
                        </div>

                        <div className={styles.button}>
                            <button onClick={() => setShowModal(true)} className='text-[#FFFFFF] bg-gradient-to-b from-[#144196] to-[#061530]  px-[20px] w-fit py-2 rounded-md mr-2 flex items-center justify-between cursor-pointer'><PlusIcon className='w-4 h-4 text-[600]' />Add Events</button>
                        </div>

                    </div>
                </div>
                <div className='mt-4'>
                    <div className=' overflow-x-auto py-[0px]'>
                        {loading ? (
                            <div className='text-center'><Loader /></div>
                        ) : (
                            <>
                                {events.length > 0 ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4 m-[10px]">
                                        {events.map((item, index) => (
                                            <div
                                                className={`bg-[#F9F9F9] p-4 rounded-[10px] shadow-[0px_0px_4px_2px_#0C0C0D0D] `}
                                                key={item._id}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="text-[14px] font-[500]">Event Title</div>
                                                    <div className="text-[#06752B] font-medium text-[13px] bg-[#D1FFC2] px-[20px] rounded-[5px]" style={{
                                                        background: item.status === 'upcoming' && '#FFCA96' || item.status === 'ongoing' && '#D7E9FF' || item.status === 'completed' && '#D1FFC2',
                                                        color: item.status === 'upcoming' && '#8D4600' || item.status === 'ongoing' && '#2274D4' || item.status === 'completed' && '#06752B',

                                                    }}>
                                                        {item.status}

                                                    </div>
                                                </div>
                                                <p className="font-[600] text-[18px] my-2">{item.title?.replace(/\b\w/g, (char) => char.toUpperCase())}</p>
                                                <p
                                                    title={item.description} className={`text-[14px] text-[#000] h-[41px] font-[400] my-3 ${styles['ellipsis-2']}`}
                                                >
                                                    {item.description?.replace(/\b\w/g, (char) => char.toUpperCase())}
                                                </p>
                                                <p className="text-[14px] text-[#000] font-[500]  pb-3">
                                                    Date : {item.date.split('T')[0]}, {item.day}
                                                </p>
                                                <p className="text-[14px] text-[#000] font-[500]  pb-3">
                                                    Time : {item.time}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div>
                                                        {/* <p className="text-[14px] text-[#000] font-[400] ">
                                                            Time: {item.time}
                                                        </p> */}
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <FaEdit
                                                            className={styles.edit}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setUpdate(true), setId(item._id);
                                                            }}
                                                        />
                                                        <MdDelete
                                                            className={styles.delete}
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setDelete(true), setId(item._id);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center h-[400px] items-center w-full my-auto flex-col text-gray-500 font-semibold">
                                        <img src={nodata} alt="No Data" className="w-[200px] h-[200px]" />
                                        <p>No Data Found</p>

                                    </div>
                                )}
                            </>
                        )}


                    </div>
                </div>


                <div className='flex justify-between items-end ms-auto w-[50%]'>

                    {totalpages > 0 &&
                        <ThemeProvider theme={theme}>
                            <div className="flex justify-end mt-4">
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
                        <div className="flex justify-end items-center">
                            <p className="text-gray-600 text-sm">
                                Showing {startIndex} – {endIndex} of {totaluser} Events
                            </p>
                        </div>
                    }
                </div>
            </div>

            <Modal
                isOpen={deleteevent}
                onRequestClose={() => setDelete(true)}
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
                <p className={styles.popmessage}>Are you sure you want to delete this event</p>
                <div className='flex gap-4 justify-center mt-10'>
                    <button onClick={() => { setDelete(false); handleDelete(id) }}
                        className={styles.popyes} >Yes</button>
                    <button className={styles.popno} onClick={() => setDelete(false)}>No</button>
                </div>
            </Modal>


        </>
    )
}

export default Eventlist