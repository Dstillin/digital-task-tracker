import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { addTask, getTasks, updateTask, deleteTask } from "./firebaseServices"; 
import { Timestamp } from "firebase/firestore";
import { motion } from "framer-motion";

const ItemType = {
  TASK: "task",
};



 

const Task = ({ task, onDelete }) => {
  const [, ref] = useDrag({
    type: ItemType.TASK,
    item: { id: task.id },
  });

  let dueDateFormatted = null;

  if (task.dueDate instanceof Timestamp) {
    const dueDate = task.dueDate.toDate();
    const localDueDate = new Date(dueDate);
    dueDateFormatted = localDueDate.toLocaleDateString();
  } else if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    if (!isNaN(dueDate.getTime())) {
      dueDateFormatted = dueDate.toLocaleDateString();
    }
  }

  return (
    <motion.div
      ref={ref}
      className="bg-white p-2 mb-2 shadow rounded flex justify-between"
      style={{ cursor: "move" }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <p>{task.title}</p>
        {dueDateFormatted ? (
          <p className="text-gray-600 text-sm">Due: {dueDateFormatted}</p>
        ) : (
          <p className="text-red-600 text-sm">Invalid Due Date</p>
        )}
      </div>
      <button onClick={() => onDelete(task.id)} className="text-red-500">
        Delete
      </button>
    </motion.div>
  );
};








// Column Component
const Column = ({ status, tasks, onDrop, onDelete }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType.TASK,
    drop: (item) => onDrop(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-1 bg-gray-100 p-4 rounded ${isOver ? "bg-green-200" : ""}`}
    >
      <h2 className="text-xl font-semibold mb-4">{status}</h2>
      {tasks.map((task) => (
        <Task key={task.id} task={task} onDelete={onDelete} />
      ))}
    </div>
  );
};

// Main App Component
function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  // Fetch tasks from Firestore on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      const tasksFromDB = await getTasks();
      setTasks(tasksFromDB);
    };

    fetchTasks();
  }, []);

  const addNewTask = async () => {
    if (newTaskTitle.trim()) {
      let dueDate = null;
      
      // Check if the date is valid before converting to Firestore Timestamp
      if (newTaskDueDate) {
        const date = new Date(newTaskDueDate);
        if (isNaN(date.getTime())) {
          console.error("Invalid date format");
          return; // Return early if the date is invalid
        }
        dueDate = Timestamp.fromDate(date); // Convert to Firestore Timestamp
      }
  
      const newTask = { 
        title: newTaskTitle, 
        status: "To Do", 
        dueDate: dueDate // Use Timestamp format for Firestore or null
      };
    
      try {
        await addTask(newTask); // Store in Firestore
        const tasksFromDB = await getTasks(); // Fetch updated tasks from Firestore
        setTasks(tasksFromDB); // Update local state with tasks
        setNewTaskTitle("");
        setNewTaskDueDate(""); // Reset the due date input
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };
  
  


  const handleDeleteTask = async (id) => {
    await deleteTask(id); // Delete from Firestore
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id)); // Update local state
  };

  const handleDrop = async (id, newStatus) => {
    // Update local state
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status: newStatus } : task
    );
    
    setTasks(updatedTasks); // Update the tasks in local state
    
    // Find the task that was dropped
    const taskToUpdate = updatedTasks.find((task) => task.id === id);
  
    // Update the status in Firestore
    if (taskToUpdate) {
      await updateTask(taskToUpdate.id, { status: newStatus }); // Update Firestore
    }
  };
  
  

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Kanban Task Tracker</h1>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="border p-2 w-full mt-4"
        />
        <input
          type="date"
          value={newTaskDueDate}
          onChange={(e) => setNewTaskDueDate(e.target.value)}
          className="border p-2 w-full mt-2"
          placeholder="Select due date"
        />
        <button onClick={addNewTask} className="bg-blue-500 text-white p-2 rounded mt-2">
          Add Task
        </button>
        <div className="flex space-x-4 mt-6">
          {["To Do", "In Progress", "Completed"].map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
              onDrop={handleDrop}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
