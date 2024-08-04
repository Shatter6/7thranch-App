import { handleUserCreation, createUser } from './createUser.js';

document.addEventListener('DOMContentLoaded', function() {
    const { auth, db, storage } = window;


    function initializeDashboard() {
        loadUserLists();
        setupEventListeners();
    }

    function setupEventListeners() {
        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                firebase.auth().signOut().then(() => {
                    window.location.href = 'index.html';
                }).catch((error) => {
                    console.error('Logout Error:', error);
                });
            });
        }

        // Workamper button functionality
        const workamperButton = document.querySelector('button[data-section="workampers"]');
        if (workamperButton) {
            workamperButton.addEventListener('click', function() {
                window.location.href = 'admin/workamper_dashboard.html';
            });
        }

        // User creation form submission
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => handleUserCreation(e, ['workamper']));
        }

        // Document upload form submission
        const documentUploadForm = document.getElementById('documentUploadForm');
        if (documentUploadForm) {
            documentUploadForm.addEventListener('submit', handleDocumentUpload);
        }
    }

    function loadUserLists() {
        const adminList = document.getElementById('adminList');
        const workamperList = document.getElementById('workamperList');

        db.ref('users').once('value').then(function(snapshot) {
            adminList.innerHTML = '<h3>Admins</h3>';
            workamperList.innerHTML = '<h3>Workampers</h3>';

            snapshot.forEach(function(childSnapshot) {
                const userData = childSnapshot.val();
                const userElement = document.createElement('p');
                userElement.textContent = `${userData.name} (${userData.email})`;

                if (userData.role === 'admin') {
                    adminList.appendChild(userElement);
                } else if (userData.role === 'workamper') {
                    workamperList.appendChild(userElement);
                }
            });
        });
    }

    function handleDocumentUpload(e) {
        e.preventDefault();
        
        const file = document.getElementById('documentFile').files[0];
        const visibility = document.getElementById('documentVisibility').value;
        
        if (file) {
            uploadDocument(file, visibility);
        }
    }

    function uploadDocument(file, visibility) {
        const storageRef = storage.ref('documents/' + file.name);
        const uploadStatus = document.getElementById('uploadStatus');
        
        storageRef.put(file).then(snapshot => {
            return snapshot.ref.getDownloadURL();
        }).then(downloadURL => {
            return db.ref('documents').push({
                name: file.name,
                url: downloadURL,
                visibility: visibility,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            });
        }).then(() => {
            uploadStatus.textContent = 'Document uploaded successfully!';
            document.getElementById('documentUploadForm').reset();
        }).catch(error => {
            console.error('Error uploading document:', error);
            uploadStatus.textContent = 'Error uploading document. Please try again.';
        });
    }
});