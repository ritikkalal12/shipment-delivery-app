// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyD3pucWnV9CoD1oyWT5AOh8fSYEFKmMrlM',
  authDomain: 'shipment-delivery-app-717a7.firebaseapp.com',
  projectId: 'shipment-delivery-app-717a7',
  storageBucket: 'shipment-delivery-app-717a7.firebasestorage.app',
  messagingSenderId: '664923505920',
  appId: '1:664923505920:web:20e0652e92777bfb315fe5',
  measurementId: 'G-4SC19FCFWZ',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
