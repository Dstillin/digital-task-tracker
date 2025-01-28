import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { addTask, getTasks, updateTask, deleteTask } from "./firebaseServices";
import { Timestamp } from "firebase/firestore";
import Column from "./components/Column";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksFromDB = await getTasks();
      setTasks(tasksFromDB);
    };

    fetchTasks();
  }, []);

  const handleEditTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const addNewTask = async () => {
    if (newTaskTitle.trim()) {
      const newTask = {
        title: newTaskTitle,
        status: "To Do",
        dueDate: newTaskDueDate ? Timestamp.fromDate(newTaskDueDate) : null,
      };

      try {
        await addTask(newTask);
        const tasksFromDB = await getTasks();
        setTasks(tasksFromDB);
        setNewTaskTitle("");
        setNewTaskDueDate(null); // Reset the date picker
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };
      

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleDrop = async (id, newStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);

    const taskToUpdate = updatedTasks.find((task) => task.id === id);

    if (taskToUpdate) {
      await updateTask(taskToUpdate.id, { status: newStatus });
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
        <DatePicker
          selected={newTaskDueDate}
          onChange={(date) => setNewTaskDueDate(date)}
          className="border p-2 w-full mt-2"
          placeholderText="Select a due date"
          dateFormat="yyyy-MM-dd"
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
              onEdit={handleEditTask}
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
