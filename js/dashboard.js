document.addEventListener('DOMContentLoaded', function () {
    // Firebase services initialization
    const { auth, db } = window;

    /* -------------------------------------------------------------------------- */
    /*                          AUTHENTICATION HANDLING                           */
    /* -------------------------------------------------------------------------- */
    auth.onAuthStateChanged(function (user) {
        if (user) {
            // User is logged in, determine their role
            checkUserRole(user);
        } else {
            // User is not logged in, redirect to login page
            window.location.href = 'index.html';
        }
    });

    /* -------------------------------------------------------------------------- */
    /*                            CHECK IN BUTTON LISTENER                        */
    /* -------------------------------------------------------------------------- */
    const checkInButton = document.getElementById('goToLoginDashboard');
    if (checkInButton) {
        checkInButton.addEventListener('click', function () {
            window.location.href = 'guest_dashboard.html';
        });
    } else {
        console.log("Check In button not found");
    }

    /* -------------------------------------------------------------------------- */
    /*                            LOGOUT BUTTON LISTENER                          */
    /* -------------------------------------------------------------------------- */
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            firebase.auth().signOut().then(() => {
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Logout Error:', error);
            });
        });
    } else {
        console.log("Logout button not found");
    }
});

/* -------------------------------------------------------------------------- */
/*                          USER ROLE RETRIEVAL                                */
/* -------------------------------------------------------------------------- */
function checkUserRole(user) {
    db.ref('wk_profiles/' + user.uid).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const isAdmin = userData.role === 'admin';
                updateDashboard(isAdmin); 
            } else {
                console.error("User document not found");
                showNotification("An error occurred. Please contact support.");
            }
        })
        .catch((error) => {
            console.error("Error checking user role:", error);
            showNotification("An error occurred. Please try again.");
        });
}

/* -------------------------------------------------------------------------- */
/*                      DASHBOARD UPDATE BASED ON USER ROLE                    */
/* -------------------------------------------------------------------------- */
function updateDashboard(isAdmin) {
    // UI Elements
    const adminContent = document.getElementById('admin-content');
    const workamperContent = document.getElementById('workamper-content');
    const dashboardTitle = document.getElementById('dashboard-title');

    if (isAdmin) {
        // Admin dashboard logic
        dashboardTitle.textContent = 'Admin Dashboard';
        adminContent.style.display = 'block';
        workamperContent.style.display = 'none';
        loadAdminContent();
    } else {
        // Workamper dashboard logic
        dashboardTitle.textContent = 'Workamper Dashboard';
        adminContent.style.display = 'none';
        workamperContent.style.display = 'block';
        loadWorkamperContent();
    }

    loadSharedContent(); // Load content shared by both roles
}

/* -------------------------------------------------------------------------- */
/*                              CONTENT LOADING                                */
/* -------------------------------------------------------------------------- */
function loadAdminContent() { /* ... (load admin content) ... */ }
function loadWorkamperContent() { /* ... (load workamper content) ... */ }
function loadSharedContent() { /* ... (load shared content) ... */ }

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                               */
/* -------------------------------------------------------------------------- */
function showNotification(message) { /* ... (notification logic) ... */ }

// --- Implement these functions based on your requirements ---
function manageUsers() { /* ... */ }
function viewReports() { /* ... */ }
function viewAssignedTasks() { /* ... */ }
function submitTimesheet() { /* ... */ }
function viewMaintenanceSchedule() { /* ... */ }