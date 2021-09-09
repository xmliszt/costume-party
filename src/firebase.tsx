// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDO5MbrLwGzJtC9MIPEQc-qOpr6DSRGwEY",
  authDomain: "costume-party-bb2a9.firebaseapp.com",
  projectId: "costume-party-bb2a9",
  storageBucket: "costume-party-bb2a9.appspot.com",
  messagingSenderId: "762712089605",
  appId: "1:762712089605:web:84741407def80ab820a86c",
  measurementId: "G-1S66LJP41N",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export default {
  analytics,
  db,
};
