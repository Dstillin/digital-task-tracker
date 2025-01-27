import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

// Function to add a task
export const addTask = async (task) => {
  try {
    console.log("Due Date received:", task.dueDate);

    let dueDate = null;

    // Ensure task.dueDate is a valid string (for date input like yyyy-mm-dd)
    if (task.dueDate && typeof task.dueDate === "string") {
      // Create a Date object based on the input
      const localDate = new Date(task.dueDate);

      
      localDate.setHours(0, 0, 0, 0);

      console.log("Parsed Local Date:", localDate); // Log the parsed local date

      
      dueDate = Timestamp.fromDate(localDate);
      console.log("Due date being saved:", dueDate);
    } else if (task.dueDate instanceof Timestamp) {
      
      dueDate = task.dueDate;
    }

    const taskWithDefaults = {
      ...task,
      status: task.status || "Incomplete",
      dueDate: dueDate, // Store Firestore Timestamp
    };

    await addDoc(collection(db, "tasks"), taskWithDefaults); // Add task to Firestore
  } catch (e) {
    console.error("Error adding task: ", e);
  }
};




// Function to retrieve tasks
export const getTasks = async () => {
  const tasksSnapshot = await getDocs(collection(db, "tasks"));
  const tasksList = tasksSnapshot.docs.map(doc => {
    const taskData = doc.data();
    return {
      id: doc.id,
      ...taskData,
      dueDate: taskData.dueDate ? taskData.dueDate.toDate().toLocaleDateString() : null, // Convert Timestamp to Date string
    };
  });
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
