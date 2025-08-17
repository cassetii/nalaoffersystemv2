// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuFwg2lnAUPaL8vUeQl3qg7YRrh5jsj6c",
  authDomain: "nalaaircondb.firebaseapp.com",
  projectId: "nalaaircondb",
  storageBucket: "nalaaircondb.firebasestorage.app",
  messagingSenderId: "115578923963",
  appId: "1:115578923963:web:92932277f7d8beff37b29e",
  measurementId: "G-JC9PB6E9JR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };