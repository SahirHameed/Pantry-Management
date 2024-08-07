// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const firestore = getFirestore(app);

export { firestore };
