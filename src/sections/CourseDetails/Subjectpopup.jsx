import React, { useState, useEffect } from "react";
import { addsubject, updatesubject } from "../../api/Serviceapi";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

const Subjectpopup = ({ closeModal, courseId, batchId, semester, editData }) => {
  const [exam, setExam] = useState("sem1");
  const [subjects, setSubjects] = useState([{ subjectCode: "", subjectName: "" }]);
  const [errors, setErrors] = useState([]);
  const isEdit = !!editData?._id;

  useEffect(() => {
    if (editData) {
      setExam(editData.exam);
      setSubjects(editData.subjects || [{ subjectCode: "", subjectName: "" }]);
    } else {
      setExam(semester);
      setSubjects([{ subjectCode: "", subjectName: "" }]);
    }
  }, [editData, semester]);

  // Handle input change
  const handleChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index][field] = value;
    setSubjects(updated);

    // clear error when user types
    const newErrors = [...errors];
    if (newErrors[index]) newErrors[index][field] = "";
    setErrors(newErrors);
  };

  // Add new row
  const addRow = () => {
    setSubjects([...subjects, { subjectCode: "", subjectName: "" }]);
  };

  // Remove row
  const removeRow = (index) => {
    const updated = subjects.filter((_, i) => i !== index);
    setSubjects(updated);
  };

  // Validation
  const validate = () => {
    let tempErrors = [];
    let codes = new Set();
    let isValid = true;

    subjects.forEach((sub, i) => {
      let rowError = {};

      if (!sub.subjectCode.trim()) {
        rowError.subjectCode = "Subject code is required";
        isValid = false;
      }

      if (!sub.subjectName.trim()) {
        rowError.subjectName = "Subject name is required";
        isValid = false;
      }

      const code = sub.subjectCode.trim();
      if (code) {
        if (codes.has(code)) {
          rowError.subjectCode = "Duplicate subject code";
          isValid = false;
        }
        codes.add(code);
      }

      tempErrors[i] = rowError;
    });

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) return; // ⛔ stop API if validation fails

    const payload = {
      exam,
      subjects,
      courseId,
      batchId,
    };

    try {
      if (isEdit) {
        await updatesubject(editData._id, payload);
      } else {
        await addsubject(courseId, payload);
      }

      closeModal();
      window.location.reload(); // Replace with refetch later if needed
    } catch (err) {
      console.error("Error saving subjects:", err);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-semibold mb-6">
        {isEdit ? "Update Subjects" : "Add Subjects"}
      </h2>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
        {subjects.map((sub, index) => (
          <div key={index} className="flex gap-3 items-start">
            <div className="w-1/3">
              <input
                type="text"
                placeholder="Subject Code"
                value={sub.subjectCode}
                onChange={(e) =>
                  handleChange(index, "subjectCode", e.target.value)
                }
                className={`border p-2 rounded w-full ${
                  errors[index]?.subjectCode ? "border-red-500" : ""
                }`}
              />
              {errors[index]?.subjectCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[index].subjectCode}
                </p>
              )}
            </div>

            <div className="w-2/3">
              <input
                type="text"
                placeholder="Subject Name"
                value={sub.subjectName}
                onChange={(e) =>
                  handleChange(index, "subjectName", e.target.value)
                }
                className={`border p-2 rounded w-full ${
                  errors[index]?.subjectName ? "border-red-500" : ""
                }`}
              />
              {errors[index]?.subjectName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors[index].subjectName}
                </p>
              )}
            </div>

            {subjects.length > 1 && (
              <TrashIcon
                onClick={() => removeRow(index)}
                className="w-5 h-5 text-red-500 cursor-pointer mt-2"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addRow}
        className="flex items-center gap-2 text-blue-700 mt-4"
      >
        <PlusIcon className="w-4 h-4" /> Add Another Subject
      </button>

      <div className="flex justify-end gap-4 mt-8">
        <button onClick={closeModal} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-gradient-to-b from-[#144196] to-[#061530] text-white rounded"
        >
          {isEdit ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default Subjectpopup;
