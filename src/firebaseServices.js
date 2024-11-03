import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

// Function to add a task
export const addTask = async (task) => {
    try {
        // Ensure the due date is formatted as a Firestore Timestamp
        const taskWithDefaults = {
            ...task,
            status: task.status || "Incomplete",
            dueDate: task.dueDate ? Timestamp.fromDate(new Date(task.dueDate)) : null, // Adds due date if provided
        };
        await addDoc(collection(db, "tasks"), taskWithDefaults);
    } catch (e) {
        console.error("Error adding task: ", e);
    }
};
// Function to retrieve tasks
export const getTasks = async () => {
    const tasksSnapshot = await getDocs(collection(db, "tasks"));
    const tasksList = tasksSnapshot.docs.map(doc => ({
      id: String(doc.id), // Ensure the ID is a string
      ...doc.data(),
    }));
    return tasksList;
  };

// Function to update a task
export const updateTask = async (taskId, updatedFields) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, updatedFields);
    } catch (e) {
      console.error("Error updating task: ", e);
    }
  };

// Function to delete a task
export const deleteTask = async (id) => {
  await deleteDoc(doc(db, "tasks", id));
};
