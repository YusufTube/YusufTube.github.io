  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDAr2KgoAyhkxGUm5FmuexzLmm_XyiQQ0c",
    authDomain: "yusuftube-63599.firebaseapp.com",
    projectId: "yusuftube-63599",
    storageBucket: "yusuftube-63599.firebasestorage.app",
    messagingSenderId: "9588442108",
    appId: "1:9588442108:web:065d421a1652d75a392879",
    measurementId: "G-CR8YVB53NL"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);