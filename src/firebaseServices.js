import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import app from "./firebaseConfig";

const db = getFirestore(app);

// Function to add a task
export const addTask = async (task) => {
  try {
    console.log("Task data received for addition:", task);

    let dueDate = null;

    
    if (task.dueDate) {
      if (task.dueDate instanceof Timestamp) {
        dueDate = task.dueDate; // Directly use the Firestore Timestamp
      } else {
        const date = new Date(task.dueDate);
        if (!isNaN(date.getTime())) {
          dueDate = Timestamp.fromDate(date); // Convert to Firestore Timestamp if it's a valid date string
        } else {
          console.error("Invalid date format for dueDate:", task.dueDate);
          return;
        }
      }
    }

    const taskWithDefaults = {
      ...task,
      status: task.status || "To Do",
      dueDate: dueDate, // Save as Firestore Timestamp or null
    };

    console.log("Task being added to Firestore:", taskWithDefaults);

    // Add task to Firestore
    const docRef = await addDoc(collection(db, "tasks"), taskWithDefaults);

    console.log("Task successfully added with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding task to Firestore:", error);
  }
};







// Function to retrieve tasks
export const getTasks = async () => {
  const tasksSnapshot = await getDocs(collection(db, "tasks"));
  const tasksList = tasksSnapshot.docs.map((doc) => {
    const taskData = doc.data();

    return {
      id: doc.id,
      ...taskData,
      dueDate: taskData.dueDate
        ? taskData.dueDate instanceof Timestamp
          ? taskData.dueDate.toDate() // Properly convert Timestamp to Date
          : new Date(taskData.dueDate) 
        : null, // No due date
    };
  });
  return tasksList;
};




// Function to update a task
export const updateTask = async (taskId, updatedFields) => {
  try {
    const taskRef = doc(db, "tasks", taskId);

    // Handle `dueDate` field conversion to Firestore `Timestamp`
    if (updatedFields.dueDate) {
      if (updatedFields.dueDate instanceof Date) {
        updatedFields.dueDate = Timestamp.fromDate(updatedFields.dueDate);
      } else if (typeof updatedFields.dueDate === "string") {
        const date = new Date(updatedFields.dueDate);
        if (!isNaN(date.getTime())) {
          updatedFields.dueDate = Timestamp.fromDate(date);
        } else {
          console.error("Invalid date format");
          return;
        }
      }
    }

    // Update the document in Firestore
    await updateDoc(taskRef, updatedFields);
    console.log(`Task ${taskId} updated successfully!`);
  } catch (error) {
    console.error("Error updating task: ", error);
  }
};


// Function to delete a task
export const deleteTask = async (id) => {
  await deleteDoc(doc(db, "tasks", id));
};
