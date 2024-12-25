// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "digital-task-tracker.firebaseapp.com",
  projectId: "digital-task-tracker",
  storageBucket: "digital-task-tracker.appspot.com",
  messagingSenderId: "686252451078",
  appId: "1:686252451078:web:b7e1681a76450cf2b3ea87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;