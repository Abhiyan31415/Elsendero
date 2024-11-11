import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyDMWUHFrj2ys2hzBaIirm7z6ZtTxFdUSng',
  authDomain: "travel-bf50e.firebaseapp.com",
  projectId: "travel-bf50e",
  storageBucket: "travel-bf50e.firebasestorage.app",
  messagingSenderId: "801632241563",
  appId: "1:801632241563:web:d0bf1e3e2148705b30033e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage();
