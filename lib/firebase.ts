import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCe5ebKWjE7xB7mq2-y9ZQKOg0a8lz6xKk",
  authDomain: "fun-chat-9e936.firebaseapp.com",
  databaseURL: "https://fun-chat-9e936-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fun-chat-9e936",
  storageBucket: "fun-chat-9e936.firebasestorage.app",
  messagingSenderId: "888828957485",
  appId: "1:888828957485:web:47b2a523de9c75b0d839a4",
  measurementId: "G-4J4XC473RG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Google provider scopes
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set redirect URL for Google auth
if (typeof window !== 'undefined') {

    // Set redirect URL to the callback page
  const redirectUrl = `${window.location.origin}/auth/google/callback`;
  console.log('Google Auth redirect URL:', redirectUrl);
}

export default app;
