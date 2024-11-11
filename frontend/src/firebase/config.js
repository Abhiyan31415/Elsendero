import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD9VJFP4n5lIi5VSIayrhSI7Uu9u7XvgK8",
    authDomain: "travel-b7a0d.firebaseapp.com",
    projectId: "travel-b7a0d",
    storageBucket: "travel-b7a0d.firebasestorage.app",
    messagingSenderId: "1040797947018",
    appId: "1:1040797947018:web:72d8cf7193e11ac6f64973",
    measurementId: "G-WFR2DKLEKK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage();
