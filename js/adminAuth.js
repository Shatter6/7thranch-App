// adminAuth.js

function checkAuth(allowedRoles) {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('User authenticated:', user.uid);
            firebase.database().ref('users/' + user.uid).once('value')
                .then((snapshot) => {
                    const userData = snapshot.val();
                    console.log('User data:', userData);
                    if (!userData || !allowedRoles.includes(userData.role)) {
                        console.log('User not authorized. Redirecting...');
                        redirectToAppropriateLogin(userData ? userData.role : null);
                    } else {
                        console.log('User authorized:', userData.role);
                        // If you want to perform any actions for authorized users, do it here
                    }
                })
                .catch((error) => {
                    console.error('Error checking user role:', error);
                    redirectToAppropriateLogin(null);
                });
        } else {
            console.log('No user authenticated. Redirecting to login...');
            redirectToAppropriateLogin(null);
        }
    });
}

function redirectToAppropriateLogin(role) {
    console.log('Redirecting user with role:', role);
    let redirectUrl;
    switch(role) {
        case 'admin':
            redirectUrl = '../admin/admin_dashboard.html';
            break;
        case 'workamper':
            redirectUrl = '../dashboard.html';
            break;
        default:
            redirectUrl = '../index.html';
    }
    console.log('Redirecting to:', redirectUrl);
    window.location.href = redirectUrl;
}

// Usage examples:
// For admin pages: checkAuth(['admin']);
// For workamper pages: checkAuth(['workamper']);
// For pages accessible to all logged-in users: checkAuth(['admin', 'workamper']);

// Export the checkAuth function if using ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { checkAuth };
}