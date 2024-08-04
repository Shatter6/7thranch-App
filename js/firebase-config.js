// firebase-config.js

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyA3VDhqTdRgrYt27qN2OQf9ibtlHXSUQmA",
    authDomain: "th-ranch-app.firebaseapp.com",
    databaseURL: "https://th-ranch-app-default-rtdb.firebaseio.com",
    projectId: "th-ranch-app",
    storageBucket: "th-ranch-app.appspot.com",
    messagingSenderId: "863753473532",
    appId: "1:863753473532:web:51e46728563813163c3679"
    // Removed measurementId as it's not necessary unless you're using Analytics
};

// Initialize Firebase and attach services to window object
(function initializeFirebase() {
    try {
        // Check if Firebase app has already been initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        } else {
            firebase.app(); // If already initialized, use that one
        }

        // Initialize and attach Firebase services to the window object
        window.auth = firebase.auth();
        window.db = firebase.database();
         // Only initialize storage if the SDK is available
         if (firebase.storage) {
            window.storage = firebase.storage();
        } else {
            console.warn("Firebase Storage SDK not available");
        }

        console.log("Firebase initialized successfully");
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    }
})();

// initializeFirebase();

// Optional: Add a global error handler for Firebase operations
window.handleFirebaseError = function(error) {
    console.error("Firebase operation error:", error);
    // You can add more error handling logic here, like displaying a user-friendly message
};