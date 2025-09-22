import React, { use, useEffect, useState } from 'react'
import { getApplication } from '../../api/Serviceapi';
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';


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

const Application = () => {
    const [limit, setlimit] = useState(10);
    const [totaluser, settotal] = useState(0);
    const [totalpages, setpage] = useState(0);
    const [offset, setoffset] = useState(1);
    const [student, setstudent] = useState([])
    const [loading, setloading] = useState(false)
    const navigate = useNavigate()


    useEffect(() => {
        const totalPages = Math.ceil(totaluser / limit);
        setpage(totalPages);
    }, [totaluser, limit]);

    useEffect(() => {
        getstudent()
    }, [offset])



    let getstudent = async () => {
        setloading(true)
        try {
            let res = await getApplication(limit, offset - 1);
            setstudent(res?.data?.data?.data);
            settotal(res?.data?.data?.totalCount);
        } catch (err) {
            console.log(err);
        } finally {
            setloading(false)
        }
    }

    const handlePageChange = (event, value) => {
        if (value === offset) {
            getstudent();
        } else {
            setoffset(value);
        }
    };
    return (
        <>
            <div className='px-5 pt-6   pb-[100px]'>
                <h4 className='text-xl font-normal'>Applications</h4>
                <div className='overflow-x-auto w-full mt-5  '>
                    <table className="w-full  rounded-md    ">
                        <thead className="bg-white text-[16px] ">
                            <tr className="bg-[#F8F8F8] text-left ">
                                <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Name</th>
                                <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Phone Number</th>
                                <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Email</th>
                                <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Blood Group</th>
                                <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Gender</th>
                                <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Action</th>

                            </tr>
                        </thead>
                        {loading ?
                            <tr>
                                <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                    <Loader />
                                </td>
                            </tr>

                            : <tbody className="bg-white text-gray-800 text-[15px] ">

                                {student?.length > 0 ? (
                                    student.map((item, index) => (
                                        <tr key={item._id || index} style={{ borderBottom: '1px solid #e5e7eba4' }}>
                                            <td className="px-4 py-4">{item?.firstName || "-"}</td>
                                            <td className="px-4 py-2">+{item?.phoneNo || "-"}</td>
                                            <td className="px-4 py-2">{item?.email || "-"}</td>
                                            <td className="px-4 py-2">{item?.bloodgroup || "-"}</td>
                                            <td className="px-4 py-2">{item?.gender || "-"}</td>
                                            <td className="px-4 py-2 text-sm"> <button className='text-blue-700 flex items-center gap-1 cursor-pointer' onClick={() => navigate(`/application/details/${item._id}`)}> <VisibilityIcon />view</button></td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold">
                                            <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                                            <p>No Data Found</p>
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        }
                    </table>

                </div>
                {totalpages > 1 &&
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
            </div>

        </>
    )
}

export default Application