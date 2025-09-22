import React from "react";
import styles from "./LogoutModal.module.css";

const LogoutModal = ({ closeModal, onConfirmLogout }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>Are You Sure You Want to Logout Now?</p>

        <div className={styles.actions}>

          <button
            className={`${styles.btn} ${styles.cancel}`}
            onClick={closeModal}
          >
            No
          </button>
          <button
            className={`${styles.btn} ${styles.confirm}`}
            onClick={onConfirmLogout}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
