// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCsmy7R1XKxtlCxtCkVcuTjyrRO40m0x38",
  authDomain: "inventory-management-c77e6.firebaseapp.com",
  projectId: "inventory-management-c77e6",
  storageBucket: "inventory-management-c77e6.appspot.com",
  messagingSenderId: "1056709650054",
  appId: "1:1056709650054:web:891eb1311614bac09d5307",
  measurementId: "G-ZMR6XGRBWR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Initialize Firestore
const firestore = getFirestore(app);

export { auth, provider, signInWithPopup, signOut, firestore };
