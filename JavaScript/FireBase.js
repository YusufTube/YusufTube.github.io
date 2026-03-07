// FireBase.js

// ===== IMPORT FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";


// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyDAr2KgoAyhkxGUm5FmuexzLmm_XyiQQ0c",
  authDomain: "yusuftube-63599.firebaseapp.com",
  projectId: "yusuftube-63599",
  storageBucket: "yusuftube-63599.appspot.com",
  messagingSenderId: "9588442108",
  appId: "1:9588442108:web:065d421a1652d75a392879",
  measurementId: "G-CR8YVB53NL"
};


// ===== INITIALIZE FIREBASE =====
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
export const auth = getAuth(app);


// ===== GOOGLE SIGN IN =====
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error("Google sign-in error:", err);
    throw err;
  }
}


// ===== SIGN OUT =====
export async function logOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign out error:", err);
  }
}


// ===== EMAIL REGISTER =====
export async function registerWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (err) {
    console.error("Email registration error:", err);
    throw err;
  }
}


// ===== EMAIL LOGIN =====
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (err) {
    console.error("Email login error:", err);
    throw err;
  }
}


// ===== PHONE LOGIN =====
export function setupRecaptcha(containerId) {
  return new RecaptchaVerifier(containerId, {
    size: "invisible"
  }, auth);
}

export async function loginWithPhone(phoneNumber, appVerifier) {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (err) {
    console.error("Phone login error:", err);
    throw err;
  }
}


// ===== AUTH STATE LISTENER (LOGIN SUPPORT) =====
export function listenForAuthChanges(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in:", user);
      callback(user);
    } else {
      console.log("User logged out");
      callback(null);
    }
  });
}
