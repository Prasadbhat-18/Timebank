// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtO0AzKkZxVaFFYHlmOmb-kV4_VZJXLGU",
  authDomain: "time-bank-91b48.firebaseapp.com",
  projectId: "time-bank-91b48",
  storageBucket: "time-bank-91b48.firebasestorage.app",
  messagingSenderId: "1006497280677",
  appId: "1:1006497280677:web:29114ba77863a3829ed34c",
  measurementId: "G-QJS9WDH5YN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);