import React, { useEffect, useState } from 'react'
import { FormControl, InputLabel, MenuItem, Select, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InputAdornment from '@mui/material/InputAdornment';
import { useParams } from "react-router-dom";
import { PlusIcon } from '@heroicons/react/24/solid';
import Modal from 'react-modal';
import Subjectpopup from './Subjectpopup';
import { getSubjects } from '../../api/Serviceapi';
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import { HiOutlinePencilAlt } from "react-icons/hi";

const Subjects = () => {
    const [sem, setSem] = useState('sem1');
    const { id, batchId } = useParams();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState([]);
    const [coursename, setCourseName] = useState('');
    const [batchname, setBatchName] = useState('');
    const statusChange = (event) => {
        setSem(event.target.value);
    };
    const [isOpen, setIsOpen] = useState(false);

    let getsubjectlist = async () => {
        setLoading(true); // start loading
        await getSubjects(id, batchId, sem)
            .then((res) => {
                setSubjects(res?.data?.data);
                console.log(res?.data?.data);
                console.log(res?.data?.data?.batchData);
                setCourseName(res.data.data[0].courseData?.courseName || "");
                setBatchName(res.data.data[0].batchData?.batchName || "");


            })
            .catch((err) => console.error('Error fetching user:', err))
            .finally(() => setLoading(false)); // stop loading
    };
    useEffect(() => {
        getsubjectlist()
        // getBatchname()
    }, [id, batchId, sem]);
    const [editData, setEditData] = useState(null);
    const hasSubjects =
        Array.isArray(subjects) &&
        subjects.length > 0 &&
        subjects.some(user => user.subjects?.length > 0);


    return (
        <>
            <div style={{ paddingBottom: '100px' }}>
                <div className='p-4  Outlet' >
                    <div className="flex justify-between items-center lg:flex-row md:flex-row flex-col">
                        <h4 className='text-xl font-normal'>Subjects</h4>
                        <div className=' flex items-center md:justify-around flex-wrap  p-2 gap-6 '>
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
                                        value={sem}
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

                                        <MenuItem value="sem1">Semester 1</MenuItem>
                                        <MenuItem value="sem2">Semester 2</MenuItem>

                                    </Select>
                                </FormControl>
                            </div>
                            <div >
                                <button
                                    onClick={() => !hasSubjects && setIsOpen(true)}
                                    disabled={hasSubjects}
                                    className={`px-[20px] py-2 rounded-md mr-2 flex items-center justify-between
    ${hasSubjects
                                            ? "bg-gray-400 cursor-not-allowed text-white"
                                            : "text-white bg-gradient-to-b from-[#144196] to-[#061530]"}
  `}
                                >
                                    <PlusIcon className='w-4 h-4' />
                                    {hasSubjects ? "Add Subject" : "Add Subject"}
                                </button>

                            </div>
                        </div>
                    </div>


                    {loading ? (
                        <div className="flex justify-center items-center h-[300px]">
                            <Loader />
                        </div>
                    ) : Array.isArray(subjects) &&
                        subjects.length > 0 &&
                        subjects.some(user => user.subjects?.length > 0) ? (

                        <div className='overflow-x-auto w-200 m-auto'>
                            <table className="w-full rounded-md text-sm mt-10">
                                <thead className="bg-white">
                                    <tr className="text-center">
                                        <th colSpan={2} className='flex gap-4 items-center py-6 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent text-[24px] font-semibold'>
                                            {coursename} - {batchname}
                                            <HiOutlinePencilAlt
                                                className='w-4 h-4 text-blue-700 cursor-pointer'
                                                onClick={() => {
                                                    setEditData(subjects[0]); // assuming one record per sem/course/batch
                                                    setIsOpen(true);
                                                }}
                                            />




                                        </th>

                                    </tr>
                                    <tr className="bg-[#F8F8F8] text-left">
                                        <th className="px-4 py-2 font-bold bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent">
                                            Subject Code
                                        </th>
                                        <th className="px-4 py-2 font-bold bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent">
                                            Subjects
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white text-gray-800">
                                    {subjects.flatMap((user) =>
                                        user.subjects.map((item) => (
                                            <tr key={`${user._id}-${item.subjectCode}`} className="border-b border-[#0000001A] hover:bg-gray-50">
                                                <td className="px-4 py-3">{item.subjectCode}</td>
                                                <td className="px-4 py-3 capitalize">{item.subjectName}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    ) : (
                        <div className='flex flex-col justify-center items-center h-[300px] text-gray-500 font-semibold'>
                            <img src={nodata} alt="No subjects" width="180" height="180" className="mb-4 opacity-80" />
                            <p className="text-lg">No subjects added yet</p>
                            <p className="text-sm text-gray-400">Click “Add Subject” to get started</p>
                        </div>
                    )}

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
                        height: 'max-content',
                        overflow: 'auto',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        zIndex: 1001,
                    },
                }}
            >
                <Subjectpopup
                    closeModal={() => {
                        setIsOpen(false);
                        setEditData(null);
                    }}
                    courseId={id}
                    batchId={batchId}
                    semester={sem}
                    editData={editData}
                />

            </Modal>

        </>
    )
}
export default Subjects
