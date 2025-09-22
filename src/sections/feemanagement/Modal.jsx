import { useState } from "react";
import styles from "./Modal.module.css";
import { emailFee, updateFeeEmail } from "../../api/Serviceapi";
const Modal = ({
  isOpen,
  onClose,
  children,
  sendReqColor,
  setReqSendColor,
  status,
  id,
  list
}) => {
  if (!isOpen) return null;
  function close() {
    onClose();
  }
  function sendReq() {
    onClose();
    setReqSendColor(true);
    email()
    update()
    list()
    status('Requested Fee')
  }

 let update = async () => {

    try {
      let res = await updateFeeEmail(id)
      console.log(res)
    }
    catch (err) {
      console.log(err)
    }

  }

  let email = async () => {

    try {
      let res = await emailFee(id)
      console.log(res)
    }
    catch (err) {
      console.log(err)
    }

  }
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {/* {children} */}
        <div className={styles.div}>Are you sure want to send request?</div>
        <div className={styles.button}>
          <div className={`${styles.btn} ${styles.extraClass}`}>
            <button
              className={styles.gradientbutton1}
              role="button"
              onClick={close}
            >
              Cancel
            </button>
          </div>

          <div className={styles.btn}>
            <button className={styles.gradientbutton2} onClick={sendReq}>
              Send request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Modal;
