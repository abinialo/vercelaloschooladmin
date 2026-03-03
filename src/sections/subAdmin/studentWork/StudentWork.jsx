import React, { useState, useEffect } from "react";
import styles from "./studentwork.module.css";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import AddWorkModel from "../../../model/addWorkModel/AddWorkModel";
import { getStudentWork, deleteStudentWork } from "../../../api/Serviceapi";
import Skeleton from "@mui/material/Skeleton";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

const StudentWork = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [overlayLoading, setOverlayLoading] = useState(false); // 🔹 overlay for add/edit/delete

  const rowsPerPage = 10;

  // 🔥 Fetch API
  const fetchWork = async () => {
    try {
      setLoading(true); // show loader
      const res = await getStudentWork();
      const list = res?.data?.data || [];
      const formatted = list.map((item) => ({
        id: item._id,
        name: item.alumniName,
        position: item.position,
        profile: item.alumniImage,
        thumbnail: item.thumbnailImage,
        behance: item.link,
      }));
      setData(formatted);
    } catch (err) {
      console.error("Fetch work error:", err);
    } finally {
      setLoading(false); // hide loader
    }
  };

  useEffect(() => {
    fetchWork();
  }, []);

  const selectedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // 🔹 Add / Edit modal
  const handleOpenAdd = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditData(item);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };

  // 🔹 Delete
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    setOverlayLoading(true); // show overlay
    try {
      await deleteStudentWork(deleteId);
      toast.success("Student work deleted successfully");
      await fetchWork();
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete work");
    } finally {
      setDeleteLoading(false);
      setOpenDelete(false);
      setDeleteId(null);
      setOverlayLoading(false); // hide overlay
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h2 className={styles.heading}>Student Works</h2>

          <div className={styles.card} style={{ position: "relative" }}>
            {/* Overlay Loader */}
            {overlayLoading && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 5,
                  backdropFilter: "blur(2px)",
                }}
              >
                <CircularProgress />
              </Box>
            )}

            <div className={styles.addRow}>
              <button className={styles.addBtn} onClick={handleOpenAdd}>
                + Add Work
              </button>
            </div>

            <div className={styles.tableWrapper}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", padding: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Profile</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Thumbnail</th>
                      <th>Behance URL</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>No Work Added</td>
                      </tr>
                    ) : (
                      selectedData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img src={item.profile} className={styles.avatar} alt="" />
                          </td>
                          <td>{item.name}</td>
                          <td>{item.position}</td>
                          <td>
                            <img src={item.thumbnail} className={styles.thumbnail} alt="" />
                          </td>
                          <td>
                            <a href={item.behance} target="_blank" rel="noreferrer" style={{ padding: "4px 10px", background: "#eef6ff", borderRadius: 6, fontWeight: 500 }}>
                              Tap to View
                            </a>
                          </td>
                          <td className={styles.actions}>
                            <FiEdit className={styles.icon} onClick={() => handleOpenEdit(item)} title="Edit" />
                            <FiTrash2 className={styles.icon} onClick={() => openDeleteConfirm(item.id)} title="Delete" style={{ color: "#dc2626" }} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {data.length > rowsPerPage && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                <Stack>
                  <Pagination count={Math.ceil(data.length / rowsPerPage)} page={page} onChange={(e, v) => setPage(v)} />
                </Stack>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AddWorkModel open={open} handleClose={handleClose} refreshWork={fetchWork} editData={editData} setOverlayLoading={setOverlayLoading} />

      {/* Delete Confirmation */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Student Work</DialogTitle>
        <DialogContent>Are you sure you want to delete this work?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)} disabled={deleteLoading}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentWork;