import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";
import { addTask, getTasks, updateTask, deleteTask } from "./firebaseServices"; // Adjust path as needed

const ItemType = {
  TASK: "task",
};

// Task Component
const Task = ({ task, onDelete }) => {
  const [, ref] = useDrag({
    type: ItemType.TASK,
    item: { id: task.id },
  });

  return (
    <div
      ref={ref}
      className="bg-white p-2 mb-2 shadow rounded flex justify-between"
      style={{ cursor: "move" }}
    >
      <div>
        <p>{task.title}</p>
        {task.dueDate && (
          <p className="text-gray-600 text-sm">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
      </div>
      <button onClick={() => onDelete(task.id)} className="text-red-500">
        Delete
      </button>
    </div>
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
      if (newTaskDueDate) {
        // Set dueDate to midnight in the local timezone to prevent shifting due to time zones
        const date = new Date(newTaskDueDate);
       // date.setHours(12, 0, 0, 0); // Set time to midnight
        dueDate = date.toISOString(); // Convert to ISO string
      }

      const newTask = { 
        title: newTaskTitle, 
        status: "To Do", 
        dueDate: dueDate // Set the due date correctly
      };
      
      await addTask(newTask); // Store in Firestore
      setTasks((prevTasks) => [...prevTasks, { ...newTask, id: uuidv4() }]);
      setNewTaskTitle("");
      setNewTaskDueDate("");
    }
};


  const handleDeleteTask = async (id) => {
    await deleteTask(id); // Delete from Firestore
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id)); // Update local state
  };

  const handleDrop = async (id, newStatus) => {
    // Update the local state first
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status: newStatus } : task
    );
  
    setTasks(updatedTasks); // Update local state
  
    // Find the task to update in Firestore
    const taskToUpdate = updatedTasks.find((task) => task.id === id);
    if (taskToUpdate) {
      await updateTask(taskToUpdate.id, { status: newStatus }); // Update in Firestore
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
