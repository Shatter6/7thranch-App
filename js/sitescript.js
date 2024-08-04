// Enable offline persistence
firebase.database().enablePersistence()
  .then(() => console.log("Offline persistence enabled"))
  .catch((error) => console.error("Error enabling offline persistence:", error));
// Enable Firebase debug mode
enableLogging(true);

// Initialize Firebase with fallback
let app, database;
try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  enablePersistence(database)
    .then(() => console.log("Offline persistence enabled"))
    .catch((error) => console.error("Error enabling offline persistence:", error));

  // Firebase initialization test
  const testRef = ref(database, 'test');
  set(testRef, { init: true })
    .then(() => console.log('Firebase initialized and working'))
    .catch(error => console.error('Firebase initialization test failed:', error));

} catch (error) {
  console.error("Firebase initialization failed:", error);
  showNotification('Error connecting to database. Some features may not work.');
}

document.addEventListener('DOMContentLoaded', function() {
  const buttons = document.querySelectorAll('.site-button');

  buttons.forEach(function(button) {
    button.addEventListener('click', function() {
      const siteId = this.id;
      const currentStatus = this.getAttribute('data-status');

      if (currentStatus === 'host') {
        showNotification('Host sites cannot be changed');
        return;
      }

      let newStatus;
      if (currentStatus === 'available' || !currentStatus) {
        newStatus = 'checkedIn';
      } else if (currentStatus === 'checkedIn') {
        newStatus = 'checkedOut';
      } else if (currentStatus === 'checkedOut') {
        newStatus = 'available';
      }

      // 1-second delay before updating status
      setTimeout(() => {
        updateSiteStatus(siteId, newStatus)
          .then(() => {
            button.classList.add('updated'); // Show overlay animation
            setTimeout(() => {
              button.classList.remove('updated'); // Hide overlay
            }, 1000); // Delay before hiding
          })
          .catch(error => {
            console.error(`Error saving status for site ${siteId}:`, error);
            showNotification('Error saving status. Please try again.'); // Show error notification
          });
      }, 1000);
    });
  });

  // Add test write button
  const testButton = document.createElement('button');
  testButton.id = 'testWrite';
  testButton.textContent = 'Test Database Write';
  document.body.appendChild(testButton);

  async function handleSiteButtonClick() {
    const siteId = this.id;
    const currentStatus = this.getAttribute('data-status');
  
    if (currentStatus === 'host') {
      showNotification('Host sites cannot be changed');
      return;
    }
  
    let newStatus;
    if (currentStatus === 'available' || !currentStatus) {
      newStatus = 'checkedIn';
    } else if (currentStatus === 'checkedIn') {
      newStatus = 'checkedOut';
    } else {
      newStatus = 'available';
    }
  
    // 1-second delay to allow correcting the status
    setTimeout(async () => {
      try {
        await updateSiteStatus(siteId, newStatus);
        this.classList.add('updated');
        setTimeout(() => this.classList.remove('updated'), 1000); // Hide overlay
      } catch (error) {
        console.error(`Error saving status for site ${siteId}:`, error);
        showNotification('Error saving status. Please try again.');
      }
    }, 1000);
  }
  
  function updateSiteStatus(siteId, status) {
    const siteRef = ref(database, 'sites/' + siteId);
    return set(siteRef, { status: status });
  }
  
  
  function updateSiteDisplay(siteId, status) {
    const button = document.getElementById(siteId);
    if (button) {
      button.setAttribute('data-status', status);
      button.style.backgroundColor = getSiteColor(status);
  
      // Handle lock icon based on status
      const lockIcon = button.querySelector('.lock-icon');
      if (status === 'host' && !lockIcon) {
        const newLockIcon = document.createElement('span');
        newLockIcon.classList.add('lock-icon');
        newLockIcon.textContent = '🔒';
        button.appendChild(newLockIcon);
      } else if (status !== 'host' && lockIcon) {
        button.removeChild(lockIcon);
      }
    }
  }
  
  document.getElementById('testWrite').addEventListener('click', function() {
    const testRef = ref(database, 'test');
    set(testRef, {
      timestamp: Date.now()
    }).then(() => {
      console.log('Test write successful');
      showNotification('Test write successful');
    }).catch(error => {
      console.error('Test write failed:', error);
      showNotification('Test write failed');
    });
  });

  // Retrieve initial site statuses from Firebase
  const sitesRef = ref(database, 'sites');
  onValue(sitesRef, function(snapshot) {
    console.log("Received updated data from Firebase:");
    snapshot.forEach(function(siteSnapshot) {
      const siteId = siteSnapshot.key;
      const siteStatus = siteSnapshot.val().status;
      console.log(`Site ${siteId}: ${siteStatus}`);
      updateSiteDisplay(siteId, siteStatus);
    });
  }, (error) => {
    console.error("Error fetching site statuses:", error);
    showNotification('Error fetching site statuses. Please check your connection.');
  });
});

function updateSiteStatus(siteId, status) {
  console.log(`Attempting to update site ${siteId} to status ${status}`);
  const siteRef = ref(database, 'sites/' + siteId);
  return set(siteRef, { status: status }); // Return the Promise
}

function updateSiteDisplay(siteId, status) {
  const button = document.getElementById(siteId);
  if (button) {
    button.setAttribute('data-status', status);
    button.style.backgroundColor = getSiteColor(status);
    if (status === 'host') {
      button.innerHTML += ' 🔒';
    }
  }
}

function getSiteColor(status) {
  if (status === 'checkedIn') {
    return '#bae523';  // Green
  } else if (status === 'checkedOut') {
    return '#d01817';  // Red
  } else if (status === 'host') {
    return '#aa1f84';  // Purple
  } else {
    return '#e0e0e0';  // Grey (default/available)
  }
}

function showNotification(message) {
  const notification = document.getElementById('notification') || createNotificationElement();
  notification.textContent = message;
  notification.style.right = '0';
  setTimeout(() => {
    notification.style.right = '-300px';
  }, 3000);
}

function createNotificationElement() {
  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.style.position = 'fixed';
  notification.style.top = '60px';
  notification.style.right = '-300px';
  notification.style.backgroundColor = '#333';
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.transition = 'right 0.5s';
  notification.style.zIndex = '1000';
  document.body.appendChild(notification);
  return notification;
}
