import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { getApplicationByid } from '../../api/Serviceapi';
import { IoMdArrowRoundBack } from "react-icons/io";
import Import from '../../assets/dashboardimgs/Import.png';
import Loader from '../../component/loader/Loader';
import Skeleton from '@mui/material/Skeleton';

const Details = () => {

    const { id } = useParams();
    const [details, setDetails] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getDetails();
    }, [id])

    let getDetails = async () => {
        setLoading(true)
        try {
            let res = await getApplicationByid(id)
            setDetails(res?.data?.data)
            console.log(res?.data?.data)
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
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

    return (
        <>
            <div className='px-5 pt-6   pb-[100px]'>
                <div class="flex gap-[10px] items-center pb-[10px]">
                    <div >
                        <IoMdArrowRoundBack style={{ cursor: 'pointer', fontSize: '20px', marginTop: '2px' }} onClick={() => window.history.back()} />

                    </div>
                    <div>
                        <h4 className='text-xl font-normal'>Student Details</h4>

                    </div>
                </div>

                {loading ?


                    <div>
                        <div>
                            <div className='bg-[#F8F8F8] px-[10px] py-[10px] rounded-[10px]'>
                                <div className=''>


                                    <div className='w-[100%]'>
                                        <div class="flex  items-center pb-[10px]">
                                            <div>

                                                <div className='  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid'>
                                                    <div className='w-[100px] h-[100px]'>
                                                        <Skeleton variant="circular" width={100} height={100} />
                                                    </div>

                                                </div>
                                            </div>
                                            <div style={{ width: '100%' }}>

                                                <Skeleton variant="text" width={80} height={40} />
                                                <div className='grid grid-cols-2 lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 text-[14px]'>

                                                    <div>

                                                        <div className='text-[#00000080]'>Phone</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                    <div>
                                                        <div className='text-[#00000080]'>E-Mail</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>

                                                    <div>
                                                        <div className='text-[#00000080]'>Blood</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                    <div>
                                                        <div className='text-[#00000080]'>D.O.B</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                    <div>
                                                        <div className='text-[#00000080]'>Gender</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                    <div>
                                                        <div className='text-[#00000080]'>Pincode</div>
                                                        <Skeleton variant="text" width={80} height={40} />                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>




                                </div>

                            </div>
                        </div>
                        <div className='grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 text-[14px] w-[100%] gap-[10px]'>
                            <div >
                                <div className='bg-[#F8F8F8] px-[10px] py-[10px] mt-[10px] rounded-[10px] '>
                                    <p className='text-[17px] font-[500] text-center md:text-left'>Personal Details</p>

                                    <div>
                                        <p className='py-[5px] flex items-center gap-[5px]'> <span>Address :</span> <Skeleton variant="text" width={80} height={40} /> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'> <span>Country :</span> <Skeleton variant="text" width={80} height={40} /></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>State :</span><Skeleton variant="text" width={80} height={40} /></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Parent Name :</span><Skeleton variant="text" width={80} height={40} /></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Relation :</span><Skeleton variant="text" width={80} height={40} /> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Alternate Email :</span><Skeleton variant="text" width={80} height={40} /> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Emergency Contact :</span><Skeleton variant="text" width={80} height={40} /> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Occupation :</span><Skeleton variant="text" width={80} height={40} /> </p>

                                    </div>
                                </div>

                                <div className='bg-[#F8F8F8] px-[10px] py-[10px] mt-[10px] rounded-[10px] '>
                                    <p className='text-[17px] font-[500] text-center md:text-left'>Documents</p>
                                    <div className='grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 text-[14px] w-[100%] gap-[10px]'>

                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>
                                            <div className='flex justify-between items-center '>
                                                <h4>Aadhar card</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>
                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Profile</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>
                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Signature</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>
                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>


                                            <div className='flex justify-between items-center'>
                                                <h4>Marksheet</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>
                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Transfer Certificate</h4>
                                                <Skeleton variant="text" width={80} height={20} />

                                            </div>
                                        </div>



                                    </div>
                                </div>
                            </div>

                            <div >
                                <div className='bg-[#F8F8F8] px-[10px] py-[5px] mt-[10px] rounded-[10px] h-[100%] '>
                                    <p className='text-[17px] font-[500] text-center md:text-left pb-3'>Academic Details</p>

                                    <div className='h-[490px] overflow-y-scroll'>

                                        <div className='bg-white rounded-[10px] mt-2'>
                                            <div className=' px-[20px] py-[10px]  '>
                                                <p className='py-[5px] flex items-center gap-[5px]   '>Degree\Qualification : <Skeleton variant="text" width={80} height={40} /></p>
                                                <p className='py-[5px] flex items-center gap-[5px]   '>School\Unversity : <Skeleton variant="text" width={80} height={40} /></p>
                                                <p className='py-[5px] flex items-center gap-[5px] '>Start Year : <Skeleton variant="text" width={80} height={40} /></p>
                                                <p className=' py-[5px] flex items-center gap-[5px]  '>End Year : <Skeleton variant="text" width={80} height={40} /></p>
                                                <p className='py-[5px] flex items-center gap-[5px]  '>Grade : <Skeleton variant="text" width={80} height={40} /></p>

                                            </div>
                                        </div>



                                    </div>
                                </div>


                            </div>

                        </div>
                    </div>

                    :
                    <div>
                        <div>
                            <div className='bg-[#F8F8F8] px-[10px] py-[10px] rounded-[10px]'>
                                <div className=''>


                                    <div className='w-[100%]'>
                                        <div class="flex   items-center pb-[10px] " >
                                            <div>

                                                <div className='  m-auto rounded-[50%] overflow-hidden mx-2 border-[3px] border-[#ffff] border-solid'>
                                                    <div className='w-[100px] h-[100px]'>
                                                        <img src={details?.imageUrl} alt="profile" className='w-[100%] h-[100%]' />
                                                    </div>

                                                </div>
                                            </div>
                                            <div style={{ width: '100%' }}>

                                                <h2 className='text-[22px] font-[500] text-center md:text-left'>{details?.firstName?.replace(/\b\w/g, (char) => char.toUpperCase())} {details?.lastName?.replace(/\b\w/g, (char) => char.toUpperCase())}</h2>

                                                <div className='grid grid-cols-2 lg:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 text-[14px]' >

                                                    <div>

                                                        <div className='text-[#00000080]'>Phone</div>
                                                        <p className='font-[500]'>+{details?.phoneNo}</p>
                                                    </div>
                                                    <div>
                                                        <div className='text-[#00000080]'>E-Mail</div>
                                                        <p title={details?.email} className='font-[500] truncate overflow-hidden whitespace-nowrap w-[90%]'>{details?.email}</p>
                                                    </div>

                                                    <div>
                                                        <div className='text-[#00000080]'>Blood</div>
                                                        <p className='font-[500]'>{details?.bloodgroup}</p>
                                                    </div>
                                                    <div>
                                                        <div className='text-[#00000080]'>D.O.B</div>
                                                        <p className='font-[500]'>{details?.DOB?.split("T")[0]}</p>
                                                    </div>
                                                    <div>
                                                        <div className='text-[#00000080]'>Gender</div>
                                                        <p className='font-[500]'>{details?.gender}</p>
                                                    </div>
                                                    <div>
                                                        <div className='text-[#00000080]'>Pincode</div>
                                                        <p className='font-[500]'>{details?.pincode}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className='grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 text-[14px]  gap-[10px]'>
                            <div >
                                <div className='bg-[#F8F8F8] px-[10px] py-[10px] mt-[10px] rounded-[10px] '>
                                    <p className='text-[17px] font-[500] text-center md:text-left'>Personal Details</p>

                                    <div>
                                        <p className='py-[5px] flex items-center gap-[5px]'> <span>Address :</span> <span>{details?.fullAddress}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'> <span>Country :</span> <span>{details?.country}</span></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>State :</span><span>{details?.state}</span></p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>District :</span><span>{details?.district}</span></p>

                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Parent Name :</span><span>{details?.parentName}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Relation :</span><span>{details?.relation}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Alternate Email :</span><span>{details?.alternativeEmail}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Emergency Contact :</span><span>{details?.emergencyContact}</span> </p>
                                        <p className='py-[5px] flex items-center gap-[5px]'><span>Occupation :</span><span>{details?.occupation}</span> </p>

                                    </div>
                                </div>

                                <div className='bg-[#F8F8F8] px-[10px] py-[10px] mt-[10px] rounded-[10px] '>
                                    <p className='text-[17px] font-[500] text-center md:text-left'>Documents</p>
                                    <div className='grid grid-cols-2 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 text-[14px] w-[100%] gap-[10px]'>

                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>
                                            <div className='flex justify-between items-center '>
                                                <h4>Aadhar card</h4>
                                                <button className='flex items-center cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]' onClick={() => handleDownload(details?.aadharUrl)
                                                }>Download <img src={Import} alt="" class="px-2" /></button>

                                            </div>
                                        </div>
                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Profile</h4>
                                                <button className='flex items-center cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]' onClick={() => handleDownload(details?.imageUrl)
                                                }>Download <img src={Import} alt="" class="px-2" /></button>

                                            </div>
                                        </div>
                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Signature</h4>
                                                <button className='flex items-center cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]' onClick={() => handleDownload(details?.signatureUrl)
                                                }>Download <img src={Import} alt="" class="px-2" /></button>

                                            </div>
                                        </div>
                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>


                                            <div className='flex justify-between items-center'>
                                                <h4>Marksheet</h4>
                                                <button className='flex items-center cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]' onClick={() => handleDownload(details?.markSheetUrl)
                                                }>Download <img src={Import} alt="" class="px-2" /></button>

                                            </div>
                                        </div>
                                        <div className='text-[12px] bg-white rounded-[10px] px-[20px] py-[10px] my-2 '>

                                            <div className='flex justify-between items-center'>
                                                <h4>Transfer Certificate</h4>
                                                <button className='flex items-center cursor-pointer text-transparent bg-clip-text bg-gradient-to-b from-[#144196] to-[#061530]' onClick={() => handleDownload(details?.tcUrl)
                                                }>Download <img src={Import} alt="" class="px-2" /></button>

                                            </div>
                                        </div>



                                    </div>
                                </div>
                            </div>

                            <div >
                                <div className='bg-[#F8F8F8] px-[10px] py-[5px] mt-[10px] rounded-[10px] h-[100%] '>
                                    <p className='text-[17px] font-[500] text-center md:text-left pb-3'>Academic Details</p>

                                    <div className='h-[490px] overflow-y-scroll'>
                                        {details?.academicQualification?.map((item, index) => (
                                            <div className='bg-white rounded-[10px] mt-2'>
                                                <div className=' px-[20px] py-[10px]  '>
                                                    <p className='py-[5px] flex items-center gap-[5px]   '>Degree\Qualification : {item?.qualification}</p>
                                                    <p className='py-[5px] flex items-center gap-[5px]   '>School\Unversity : {item?.university}</p>
                                                    <p className='py-[5px] flex items-center gap-[5px] '>Start Year : {item?.fromDate}</p>
                                                    <p className=' py-[5px] flex items-center gap-[5px]  '>End Year : {item?.toDate}</p>
                                                    <p className='py-[5px] flex items-center gap-[5px]  '>Grade : {item?.grade}</p>

                                                </div>
                                            </div>

                                        ))}

                                    </div>
                                </div>


                            </div>

                        </div>
                    </div>
                }
            </div>






        </>
    )
}

export default Details