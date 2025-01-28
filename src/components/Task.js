import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { motion } from "framer-motion";
import { updateTask } from "../firebaseServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Timestamp } from "firebase/firestore";

const ItemType = {
  TASK: "task",
};

const Task = ({ task, onDelete, onEdit }) => {
  const [, ref] = useDrag({
    type: ItemType.TASK,
    item: { id: task.id },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDueDate, setEditedDueDate] = useState(
    task.dueDate ? new Date(task.dueDate) : null // Initialize as Date object
  );
  const [editedPriority, setEditedPriority] = useState(task.priority || "Medium");

  const handleSave = async () => {
    const updatedTask = {
      ...task,
      title: editedTitle,
      dueDate: editedDueDate, 
      priority: editedPriority,
    };

    try {
      await updateTask(task.id, {
        title: updatedTask.title,
        dueDate: editedDueDate ? Timestamp.fromDate(editedDueDate) : null, 
        priority: updatedTask.priority,
      });
      setIsEditing(false); // Exit editing mode
      onEdit(updatedTask); // Notify parent of changes
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleCancel = () => {
    setEditedTitle(task.title);
    setEditedDueDate(task.dueDate ? new Date(task.dueDate) : null);
    setEditedPriority(task.priority || "Medium");
    setIsEditing(false);
  };

  const priorityColors = {
    High: "bg-red-100 border-red-400",
    Medium: "bg-yellow-100 border-yellow-400",
    Low: "bg-green-100 border-green-400",
  };

  return (
    <motion.div
      ref={ref}
      className={`p-2 mb-2 shadow rounded border ${priorityColors[task.priority]}`}
      style={{ cursor: "move" }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {!isEditing ? (
        <div>
          <p>{task.title}</p>
          <p className="text-gray-600 text-sm">
            Due:{" "}
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "No Due Date"}
          </p>
          <p className="text-gray-700 text-sm">Priority: {task.priority}</p>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="border p-1 rounded mb-2 w-full"
            placeholder="Edit title"
          />
          <DatePicker
            selected={editedDueDate}
            onChange={(date) => setEditedDueDate(date)} // Updates state as Date object
            className="border p-1 rounded mb-2 w-full"
            placeholderText="Select a due date"
            dateFormat="yyyy-MM-dd"
          />
          <select
            value={editedPriority}
            onChange={(e) => setEditedPriority(e.target.value)}
            className="border p-1 rounded mb-2 w-full"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      )}

      {!isEditing ? (
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 mr-2"
          >
            Edit
          </button>
          <button onClick={() => onDelete(task.id)} className="text-red-500">
            Delete
          </button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <button onClick={handleSave} className="text-green-500 mr-2">
            Save
          </button>
          <button onClick={handleCancel} className="text-gray-500">
            Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Task;
