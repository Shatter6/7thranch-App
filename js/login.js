window.onerror = function(message, source, lineno, colno, error) {
    console.error("Unhandled error:", error);
    alert("An unexpected error occurred. Please try again or contact support.");
    return true;
};

document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const db = firebase.database();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

            auth.setPersistence(persistence)
                .then(() => {
                    return auth.signInWithEmailAndPassword(email, password);
                })
                .then((userCredential) => {
                    const user = userCredential.user;
                    console.log("User signed in successfully", user);
                    return checkUserRole(user);
                })
                .catch((error) => {
                    console.error("Login error:", error.code, error.message);
                    handleAuthError(error);
                });
        });
    } else {
        console.error('Login form not found in the DOM');
    }

    window.togglePasswordVisibility = function() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('.toggle-password i');

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = "password";
            toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
});

function checkUserRole(user) {
    console.log("Checking role for user:", user.uid);
    return firebase.database().ref('users/' + user.uid).once('value')
        .then((snapshot) => {
            const userData = snapshot.val();
            console.log("User data:", userData);
            if (userData.role === 'admin') {
                window.location.href = 'admin/admin_dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        })
        .catch((error) => {
            console.error("Error checking user role:", error);
            showNotification("An error occurred. Please try again.");
        });
}

function handleAuthError(error) {
    let errorMessage;
    switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            errorMessage = "Incorrect email or password. Please try again.";
            break;
        case 'auth/invalid-email':
            errorMessage = "Invalid email address. Please check and try again.";
            break;
        default:
            errorMessage = "An error occurred. Please try again later.";
    }
    showNotification(errorMessage);
}

function showNotification(message) {
    const notification = document.getElementById('notification') || createNotificationElement();
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function createNotificationElement() {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#333';
    notification.style.color = '#fff';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.display = 'none';
    document.body.appendChild(notification);
    return notification;
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        updateUserInfo(user);
        console.log("User is signed in:", user.uid);
    } else {
        console.log("No user is signed in.");
    }
});

function updateUserInfo(user) {
    firebase.database().ref('users/' + user.uid).once('value')
        .then((snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                document.getElementById('userName').textContent = userData.name || 'User';
                document.getElementById('userRole').textContent = userData.role || 'Maintenance Staff';
            } else {
                console.warn('User data not found in database');
                document.getElementById('userName').textContent = 'User';
                document.getElementById('userRole').textContent = 'Maintenance Staff';
            }
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
        });
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        updateUserInfo(user);
        console.log("User is signed in:", user.uid);
    } else {
        console.log("No user is signed in.");
        // Only redirect if not on the login page
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
})