document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('profilePopup');
    const closeBtn = document.querySelector('.wk_close');
    const profileForm = document.getElementById('wk_profileForm');
    const profilePicUpload = document.getElementById('wk_profilePicUpload');
    const profilePic = document.getElementById('wk_profilePic');
    const resetPasswordBtn = document.getElementById('wk_resetPassword');
    const resetUsernameBtn = document.getElementById('wk_resetUsername');
    const createUserForm = document.getElementById('createUserForm');
    const showInactiveCheckbox = document.getElementById('showInactive');

    // Update user info in header
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.database().ref('wk_profiles/' + user.uid).once('value').then(function(snapshot) {
                const userData = snapshot.val();
                if (userData) {
                    document.getElementById('userName').textContent = userData.fullName || user.email;
                    document.getElementById('userRole').textContent = userData.role || 'User';
                }
            });
        } else {
            window.location.href = '../index.html'; // Redirect to login if not authenticated
        }
    });

    closeBtn.onclick = () => popup.style.display = 'none';

    window.onclick = (event) => {
        if (event.target == popup) popup.style.display = 'none';
    }

    profilePicUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => profilePic.src = e.target.result;
            reader.readAsDataURL(file);
        }
    });

    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });

    resetPasswordBtn.addEventListener('click', resetPassword);
    resetUsernameBtn.addEventListener('click', resetUsername);

    createUserForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createUser();
    });

    showInactiveCheckbox.addEventListener('change', loadWorkamperList);

    loadWorkamperList();
});

function loadWorkamperList() {
    const listElement = document.getElementById('workamperList');
    const showInactive = document.getElementById('showInactive').checked;

    if (!listElement) {
        console.error('Workamper list element not found');
        return;
    }

    listElement.innerHTML = `
        <div class="workamper-list-header" onclick="sortList('name')">Name</div>
        <div class="workamper-list-header" onclick="sortList('role')">Role</div>
        <div class="workamper-list-header">Status</div>
    `; 

    firebase.database().ref('wk_profiles').once('value')
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                if (showInactive || userData.isActive) {
                    const listItem = document.createElement('div');
                    listItem.className = 'workamper-item';
                    listItem.innerHTML = `
                        <button class="workamper-name-btn" data-username="${userData.email}">${userData.fullName || 'N/A'}</button>
                        <div>${userData.role || 'N/A'}</div>
                        <div>${userData.isActive ? 'Active' : 'Inactive'}</div>
                    `;
                    listElement.appendChild(listItem);
                }
            });
            addWorkamperLinkListeners();
        })
        .catch((error) => {
            console.error('Error loading workamper list:', error);
        });
}

function sortList(key) {
    const list = document.getElementById('workamperList');
    const items = Array.from(list.getElementsByClassName('workamper-item'));

    items.sort((a, b) => {
        const valueA = a.children[key === 'name' ? 0 : 1].textContent.toUpperCase();
        const valueB = b.children[key === 'name' ? 0 : 1].textContent.toUpperCase();
        return valueA.localeCompare(valueB);
    });

    // Clear list except headers
    while (list.children.length > 3) {
        list.removeChild(list.lastChild);
    }

    // Append sorted items
    items.forEach(item => list.appendChild(item));
}

function addWorkamperLinkListeners() {
    const workamperLinks = document.querySelectorAll('.workamper-name-btn');
    workamperLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const username = this.getAttribute('data-username');
            loadProfile(username);
        });
    });
}

function loadProfile(username) {
    const profileRef = firebase.database().ref('wk_profiles').orderByChild('email').equalTo(username);
    profileRef.once('value', (snapshot) => {
        const profileData = snapshot.val();
        if (profileData) {
            const uid = Object.keys(profileData)[0];
            const userData = profileData[uid];
            
            document.getElementById('wk_profileForm').setAttribute('data-uid', uid);
            document.getElementById('wk_fullName').value = userData.fullName || '';
            document.getElementById('wk_spouseName').value = userData.spouseName || '';
            document.getElementById('wk_address').value = userData.address || '';
            document.getElementById('wk_city').value = userData.city || '';
            document.getElementById('wk_state').value = userData.state || '';
            document.getElementById('wk_zip').value = userData.zip || '';
            document.getElementById('wk_phone').value = userData.phone || '';
            document.getElementById('wk_email').value = userData.email || '';
            document.getElementById('wk_emergencyContactName').value = userData.emergencyContactName || '';
            document.getElementById('wk_emergencyContactPhone').value = userData.emergencyContactPhone || '';
            document.getElementById('wk_w9Signed').checked = userData.w9Signed || false;
            document.getElementById('wk_isActive').checked = userData.isActive || false;
            
            document.getElementById('wk_profilePic').src = userData.profilePicUrl || '../image/default-avatar.png';
            
            document.getElementById('profilePopup').style.display = 'block';
            makeDraggable(document.querySelector('.wk_popup-content'));
        } else {
            console.error('Profile not found');
            alert('Profile not found');
        }
    });
}

function saveProfile() {
    const uid = document.getElementById('wk_profileForm').getAttribute('data-uid');
    const profileData = {
        fullName: document.getElementById('wk_fullName').value,
        spouseName: document.getElementById('wk_spouseName').value,
        address: document.getElementById('wk_address').value,
        city: document.getElementById('wk_city').value,
        state: document.getElementById('wk_state').value,
        zip: document.getElementById('wk_zip').value,
        phone: document.getElementById('wk_phone').value,
        email: document.getElementById('wk_email').value,
        emergencyContactName: document.getElementById('wk_emergencyContactName').value,
        emergencyContactPhone: document.getElementById('wk_emergencyContactPhone').value,
        w9Signed: document.getElementById('wk_w9Signed').checked,
        isActive: document.getElementById('wk_isActive').checked
    };

    firebase.database().ref('wk_profiles/' + uid).update(profileData)
        .then(() => {
            alert('Profile updated successfully');
            loadWorkamperList();
            document.getElementById('profilePopup').style.display = 'none';
        })
        .catch((error) => {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        });
}

function resetPassword() {
    const email = document.getElementById('wk_email').value;
    if (email) {
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => alert('Password reset email sent to ' + email))
            .catch((error) => {
                console.error('Error sending password reset email:', error);
                alert('Failed to send password reset email');
            });
    } else {
        alert('Please enter an email address');
    }
}

function resetUsername() {
    const newEmail = prompt("Enter new email address:");
    if (newEmail) {
        const uid = document.getElementById('wk_profileForm').getAttribute('data-uid');
        firebase.database().ref('wk_profiles/' + uid).update({ email: newEmail })
            .then(() => {
                alert('Email updated successfully');
                document.getElementById('wk_email').value = newEmail;
            })
            .catch((error) => {
                console.error('Error updating email:', error);
                alert('Failed to update email');
            });
    }
}

function createUser() {
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return firebase.database().ref('wk_profiles/' + user.uid).set({
                fullName: name,
                email: email,
                role: role,
                isActive: true
            });
        })
        .then(() => {
            alert('User created successfully');
            document.getElementById('createUserForm').reset();
            loadWorkamperList();
        })
        .catch((error) => {
            console.error('Error creating user:', error);
            alert('Failed to create user: ' + error.message);
        });
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}