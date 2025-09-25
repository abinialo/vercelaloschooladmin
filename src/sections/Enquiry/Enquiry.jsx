import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd';
import { getEnquiry } from '../../api/Serviceapi';
import Pagination from '@mui/material/Pagination';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import nodata from '../../assets/nodata.jpg'
import Loader from '../../component/loader/Loader';
import '../../App.css'

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
const Enquiry = () => {

    const { TabPane } = Tabs;
    const [limit, setlimit] = useState(10);
    const [totaluser, settotal] = useState(0);
    const [totalpages, setpage] = useState(0);
    const [offset, setoffset] = useState(1);
    const [enroll, setEnroll] = useState('message')
    const [enquiry, setEnquiry] = useState([])
    const [loader, setloader] = useState(false)

    useEffect(() => {
        const totalPages = Math.ceil(totaluser / limit);
        setpage(totalPages);
    }, [totaluser, limit]);
    let getenquiry = async () => {
        setloader(true)
        try {
            let res = await getEnquiry(limit, offset - 1, enroll)
            console.log(res?.data?.data?.data, 'enquiry')
            setEnquiry(res?.data?.data?.data)
            settotal(res?.data?.data?.totalCount)
        }
        catch (err) {
            console.log(err)
        } finally {
            setloader(false)
        }
    }

    useEffect(() => {
        getenquiry()
    }, [offset, enroll])
    const handlePageChange = (event, value) => {
        if (value === offset) {
            getenquiry();
        } else {
            setoffset(value);
        }
    };
    return (
        <>
            <div className='px-5 pt-6   pb-[100px]'>

                <h4 className='text-xl font-normal'>Enquiry</h4>

                <div className='mt-5'>
                    <Tabs defaultActiveKey="1" className="custom-tabs" onChange={(key) => {
                        setoffset(1); // reset to first page when tab changes
                        if (key === "1") setEnroll("message");
                        if (key === "2") setEnroll("request");
                        if (key === "3") setEnroll("toMessage");
                    }} >
                        <TabPane tab="Connect" key="1"  >
                            <div className='overflow-x-auto w-full  '>
                                <table className="w-full  rounded-md    ">
                                    <thead className="bg-white text-[16px] ">
                                        <tr className="bg-[#F8F8F8] text-left ">
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Name</th>
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Phone Number</th>
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Email</th>
                                        </tr>
                                    </thead>
                                    {loader ?
                                        <tr>
                                            <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                                <Loader />
                                            </td>
                                        </tr>

                                        : <tbody className="bg-white text-gray-800 text-[15px] ">

                                            {enquiry?.length > 0 ? (
                                                enquiry.map((item, index) => (
                                                    <tr key={item._id || index} style={{ borderBottom: '1px solid #e5e7eba4' }}>
                                                        <td className="px-4 py-4">{item?.name || "-"}</td>
                                                        <td className="px-4 py-2">+{item?.phoneNumber || "-"}</td>
                                                        <td className="px-4 py-2">{item?.email || "-"}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold">
                                                        <img src={nodata} alt="" width={'200px'} height={'200px'} className='m-auto' />
                                                        <p>N o Data Found</p>
                                                    </td>                                            </tr>
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
                        </TabPane>
                        <TabPane tab="Faq" key="2" >
                            <div className='overflow-hidden   '>
                                <table className="w-full  rounded-md    ">
                                    <thead className="bg-white text-[16px] ">
                                        <tr className="bg-[#F8F8F8] text-left ">
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Name</th>
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Email</th>
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold  w-[50%]">Question</th>
                                        </tr>
                                    </thead>
                                    {loader ?
                                        <tr>
                                            <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                                <Loader />
                                            </td>
                                        </tr>

                                        : <tbody className="bg-white text-gray-800 text-[15px] ">
                                            {enquiry?.length > 0 ? (
                                                enquiry.map((item, index) => (
                                                    <tr key={item._id || index} style={{ borderBottom: '1px solid #e5e7eba4' }}>
                                                        <td className="px-4 py-4">{item?.name || "-"}</td>
                                                        <td className="px-4 py-2">{item?.email || "-"}</td>
                                                        <td className="px-4 py-2 "><p className=' w-[100%] break-all'>{item?.question || "-"}</p></td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-4">No records found</td>
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
                        </TabPane>
                        <TabPane tab="Contact" key="3" >
                            <div className='overflow-x-auto w-full  '>
                                <table className="w-full  rounded-md    ">
                                    <thead className="bg-white text-[16px] ">
                                        <tr className="bg-[#F8F8F8] text-left ">
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">First Name</th>
                                            {/* <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Last Name</th> */}

                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Email</th>
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Phone Number</th>
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold">Subject</th>
                                            <th className="px-4 py-2 bg-gradient-to-b from-[#144196] to-[#061530] bg-clip-text text-transparent font-semibold w-[40%]">Message</th>

                                        </tr>
                                    </thead>
                                    {loader ?
                                        <tr>
                                            <td colSpan="10" className="text-center py-20 text-lg text-gray-500 font-semibold ">
                                                <Loader />
                                            </td>
                                        </tr>

                                        : <tbody className="bg-white text-gray-800 text-[15px] ">
                                            {enquiry?.length > 0 ? (
                                                enquiry.map((item, index) => (
                                                    <tr key={item._id || index} style={{ borderBottom: '1px solid #e5e7eba4' }}>
                                                        <td className="px-4 py-4">{item?.firstName} {item.lastName}</td>
                                                        <td className="px-4 py-2">{item?.email || "-"}</td>
                                                        <td className="px-4 py-2">+{item?.phoneNumber || "-"}</td>
                                                        <td className="px-4 py-2">{item?.subject || "-"}</td>
                                                        <td className="px-4 py-2"><p className=' w-[100%] break-all'>{item?.message || "-"}</p></td>


                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-4">No records found</td>
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
                        </TabPane>
                    </Tabs>
                </div>
            </div >


        </>

    )
}

export default Enquiry