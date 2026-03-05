import React, { useEffect, useState } from "react";
import styles from "./aluminiimage.module.css";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import AlumniModal from "../../../model/addAluminiModel/AddAluminiModel";
import { getAlumniList, deleteAlumni } from "../../../api/Serviceapi";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

const AlunimiImage = () => {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [page, setPage] = useState(1);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const rowsPerPage = 10;


  const handleAddOpen = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleEditOpen = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };

  
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

const handleDelete = async () => {
  if (deleteLoading) return; 
  setDeleteLoading(true);

  try {
    await deleteAlumni(deleteId);
    toast.success("Alumni deleted successfully");
    fetchAlumni();
  } catch (error) {
    console.error("Delete failed:", error);
    toast.error("Failed to delete alumni");
  } finally {
    setDeleteLoading(false);
    setOpenDelete(false);
    setDeleteId(null);
  }
};
  
  const fetchAlumni = async () => {
    try {
      const res = await getAlumniList();
      setAlumni(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Fetch failed:", error);
      setAlumni([]);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [alumni.length]);

 
  const selectedData = alumni.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h2 className={styles.heading}>Alumni Images</h2>

          <div className={styles.card}>
            <div className={styles.addRow}>
              <button className={styles.addBtn} onClick={handleAddOpen}>
                + Add Alumni
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Alumni Image</th>
                    <th>Alumni Name</th>
                    <th>Company Name</th>
                    <th>Company Logo</th>
                    <th>Position</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedData.length === 0 ? (
                    <tr>
                      <td colSpan="6">
                          <div style={{ textAlign: "center", padding: "40px 0", opacity: 0.8 }}>
                            <img
  src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
  alt="empty"
  width={120}
  style={{
    display: "block",
    margin: "0 auto 10px auto",
  }}
/>
                            <p>No Alumni Yet</p>
                            {/* <small>Add your first event to get started</small> */}
                          </div>
                        </td>
                    </tr>
                  ) : (
                    selectedData.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <img
                            src={item.alumniImage}
                            alt={item.alumniName}
                            className={styles.avatar}
                          />
                        </td>
                        <td>{item.alumniName || "-"}</td>
                        <td>{item.companyName || "-"}</td>
                        <td>
                          {item.companyLogo ? (
                            <img
                              src={item.companyLogo}
                              alt={item.companyName}
                              className={styles.logo}
                            />
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{item.position || "-"}</td>
                        <td className={styles.actions}>
                          {/* ✏️ Edit */}
                          <FiEdit
                            className={styles.icon}
                            onClick={() => handleEditOpen(item)}
                            title="Edit"
                          />

                          {/* 🗑 Delete */}
                          <FiTrash2
                            className={styles.icon}
                            onClick={() => openDeleteConfirm(item._id)}
                            style={{ color: "#dc2626" }}
                            title="Delete"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {alumni.length > rowsPerPage && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                <Stack>
                  <Pagination
                    count={Math.ceil(alumni.length / rowsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                  />
                </Stack>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlumniModal
        open={open}
        handleClose={handleClose}
        refreshWork={fetchAlumni}
        editData={editData}
      />

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Alumni</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this alumni?
        </DialogContent>
      <DialogActions>
  <Button
    onClick={() => setOpenDelete(false)}
    disabled={deleteLoading}
  >
    Cancel
  </Button>

  <Button
    variant="contained"
    color="error"
    onClick={handleDelete}
    disabled={deleteLoading}
  >
    {deleteLoading ? "Deleting..." : "Delete"}
  </Button>
</DialogActions>
      </Dialog>
    </>
  );
};

export default AlunimiImage;