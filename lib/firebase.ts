import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRcsgUjNec1oKeLEY3-BFG-8jk-Id5ag8",
  authDomain: "nilam-league.firebaseapp.com",
  projectId: "nilam-league",
  storageBucket: "nilam-league.firebasestorage.app",
  messagingSenderId: "420671731645",
  appId: "1:420671731645:web:7a4098e83df9615f2084d4"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);