import {  useEffect, useState } from "react";
import { getFeeById } from "../../api/Serviceapi";
import styles from "./ModalView.module.css";
const ModalView = ({ viewOpen, viewClose, children,id }) => {
  if (!viewOpen) return null;

  const [feedata,setFeeData]=useState({})

  useEffect(()=>{
    getfeeid()
  },[])

  let getfeeid=async()=>{

    let res=await getFeeById(id)

    setFeeData(res.data?.data?.data[0])
    console.log(res.data?.data?.data,'data')

  }


  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {children}
        <div className={styles.profile}>
          <div className={styles.profileimg}>
            <img src={feedata?.userDetails?.profileURL} alt="" style={{ width: "100%" , height:"100%",borderRadius:"50%"}} />
          </div>
          <div className={styles.profiledetails}>
            <div className={styles.profiledetailsname}>
              <h1>{feedata?.userDetails?.name}</h1>
            </div>
            <div className={styles.profiledetailsid}>
              <p>{feedata?.userDetails?.mobileNo}</p> | <p>{feedata?.userDetails?.email}</p>
            </div>
          </div>
          <div className={styles.profileid}>
            <p>{feedata?.userDetails?.studentId}</p>
          </div>
        </div>
        <div className={styles.profile}>
          <div className={styles.profilebtns}>
            <p className={styles.p}>Date of Payment</p>
            <p className={styles.p1}>{feedata?.paymentDate?.split("T")[0]}</p>
          </div>
          <div className={styles.profilebtns}>
            <p className={styles.p}>Amount</p>
            <p className={styles.p1}>{feedata?.userDetails?.totalFee}</p>
          </div>
          <div className={styles.profilebtns}>
            <p className={styles.p}>Mode of Payment</p>
            <p className={styles.p1}>{feedata?.modeOfPayment}</p>
          </div>
        </div>
      </div>

     
    </div>
  );
};
export default ModalView;
