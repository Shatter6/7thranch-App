/* -------------------------------------------------------------------------- */
/*                           USER CREATION FUNCTIONS                           */
/* -------------------------------------------------------------------------- */

const { auth, db } = window;

/* ---------------------------- CREATE USER FUNCTION --------------------------- */
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function handleUserCreation(e) {
    e.preventDefault();
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!validatePassword(password)) {
        alert("Password must be 8-32 characters long and contain at least one uppercase letter, lowercase letter, number, and special character.");
        return;
    }

    createUser(email, password, role, name)
        .then(() => {
            console.log("User created successfully");
            alert("User created successfully");
            document.getElementById('createUserForm').reset();
            if (typeof window.loadWorkamperList === 'function') {
                window.loadWorkamperList();
            } else {
                console.warn('loadWorkamperList function not found');
            }
        })
        .catch((error) => {
            console.error("Error creating user: ", error);
            alert("Error creating user: " + error.message);
        });
}

/* -------------------------- CREATE PROFILE FUNCTION -------------------------- */
function createProfile(uid, email, role, name) {
    return db.ref('wk_profiles/' + uid).set({
        email: email,
        role: role,
        fullName: name,
        spouseName: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        phone: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        w9Signed: false,
        isActive: true,
        profilePicUrl: ''
    });
}

/* ----------------------- HANDLE USER CREATION FUNCTION ----------------------- */
window.handleUserCreation = debounce(function(e) {
    e.preventDefault();
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!validatePassword(password)) {
        alert("Password must be 8-32 characters long and contain at least one uppercase letter, lowercase letter, number, and special character.");
        return;
    }

    createUser(email, password, role, name)
        .then(() => {
            console.log("User created successfully");
            alert("User created successfully");
            document.getElementById('createUserForm').reset();
            loadWorkamperList(); // Ensure this function is defined and working
        })
        .catch((error) => {
            console.error("Error creating user: ", error);
            alert("Error creating user: " + error.message);
        });
}, 300); // 300ms debounce time

function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,32}$/;
    return regex.test(password);
}

/* ---------------------------- EVENT LISTENERS ---------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    // If you have a form in your HTML, you can add the event listener here
    const createUserForm = document.getElementById('createUserForm');
    if (createUserForm) {
        createUserForm.addEventListener('submit', handleUserCreation);
    }
});

// Attach functions to the window object so they can be accessed globally

window.handleUserCreation = handleUserCreation;

window.createUser = createUser;