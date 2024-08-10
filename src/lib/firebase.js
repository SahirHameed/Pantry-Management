import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsmy7R1XKxtlCxtCkVcuTjyrRO40m0x38",
  authDomain: "inventory-management-c77e6.firebaseapp.com",
  projectId: "inventory-management-c77e6",
  storageBucket: "inventory-management-c77e6.appspot.com",
  messagingSenderId: "1056709650054",
  appId: "1:1056709650054:web:891eb1311614bac09d5307",
  measurementId: "G-ZMR6XGRBWR",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Export the initialized services
export { auth, googleProvider, githubProvider, signInWithPopup, signOut, firestore };
