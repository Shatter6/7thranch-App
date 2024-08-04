/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */
const manufacturers = ['Airstream', 'Winnebago', 'Jayco', 'Thor', 'Forest River', 'Coachmen', 'Keystone', 'Heartland', 'Grand Design', 'Newmar', 'Tiffin', 'Leisure Travel Vans', 'Entegra', 'Fleetwood', 'Gulf Stream'];
const colors = ['White', 'Silver', 'Gray', 'Black', 'Blue', 'Red', 'Green', 'Brown', 'Beige', 'Tan', 'Yellow', 'Orange', 'Purple', 'Gold', 'Champagne'];
const states = [
    'Alabama - AL', 'Alaska - AK', 'Arizona - AZ', 'Arkansas - AR', 'California - CA', 
    'Colorado - CO', 'Connecticut - CT', 'Delaware - DE', 'Florida - FL', 'Georgia - GA', 
    'Hawaii - HI', 'Idaho - ID', 'Illinois - IL', 'Indiana - IN', 'Iowa - IA', 
    'Kansas - KS', 'Kentucky - KY', 'Louisiana - LA', 'Maine - ME', 'Maryland - MD', 
    'Massachusetts - MA', 'Michigan - MI', 'Minnesota - MN', 'Mississippi - MS', 'Missouri - MO', 
    'Montana - MT', 'Nebraska - NE', 'Nevada - NV', 'New Hampshire - NH', 'New Jersey - NJ', 
    'New Mexico - NM', 'New York - NY', 'North Carolina - NC', 'North Dakota - ND', 'Ohio - OH', 
    'Oklahoma - OK', 'Oregon - OR', 'Pennsylvania - PA', 'Rhode Island - RI', 'South Carolina - SC', 
    'South Dakota - SD', 'Tennessee - TN', 'Texas - TX', 'Utah - UT', 'Vermont - VT', 
    'Virginia - VA', 'Washington - WA', 'West Virginia - WV', 'Wisconsin - WI', 'Wyoming - WY', 
    'Canada'
];

let currentCheckIn = {};
let checkIns = [];

/* -------------------------------------------------------------------------- */
/*                           DOM CONTENT LOADED EVENT                         */
/* -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function() {
    const sliderMenu = document.getElementById('checkInSlider');
    const sliderTab = document.querySelector('#checkInSlider .slider-tab');
    const backToDashboardButton = document.getElementById('backToDashboard');
    const logoutBtn = document.getElementById('logoutBtn');
    const db = firebase.database();
    const siteMap = document.getElementById('siteMap');
    const siteMapAreas = document.getElementById('siteMapAreas');

    // Create and add the Assign Site button
    const checkInSection = document.querySelector('.check-in-section');
    if (checkInSection) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'check-in-header';

        const title = checkInSection.querySelector('h2');
        if (title) {
            headerDiv.appendChild(title);
        } else {
            const newTitle = document.createElement('h2');
            newTitle.textContent = 'Recent Check-Ins';
            headerDiv.appendChild(newTitle);
        }

        const assignSiteButton = document.createElement('button');
        assignSiteButton.textContent = 'Assign Site';
        assignSiteButton.id = 'assignSiteBtn';
        assignSiteButton.className = 'assign-site-btn';
        assignSiteButton.addEventListener('click', assignSite);

        headerDiv.appendChild(assignSiteButton);

        checkInSection.insertBefore(headerDiv, checkInSection.firstChild);
    }

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            firebase.auth().signOut().then(() => {
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error('Logout Error:', error);
            });
        });
    }

    if (!sliderMenu || !sliderTab) {
        console.error('Slider elements not found in the DOM');
        return;
    }
    
    // Ensure slider starts closed
    sliderMenu.classList.remove('active');

    /* -------------------------------------------------------------------------- */
    /*                              HELPER FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */
    function toggleSlider() {
        console.log('Toggling slider');
        sliderMenu.classList.toggle('active');
        console.log('Slider active:', sliderMenu.classList.contains('active'));
    }

    function showSection(sectionId) {
        console.log('Showing section:', sectionId);
        document.querySelectorAll('.process-section').forEach(section => section.classList.add('hidden'));
        const section = document.getElementById(sectionId);
        if (section) section.classList.remove('hidden');
    }

    function createButtons(container, items, onClickFunction, inputId) {
        const buttonContainer = document.getElementById(container);
        if (!buttonContainer) {
            console.error(`Button container ${container} not found`);
            return;
        }
        buttonContainer.innerHTML = '';
        buttonContainer.className = 'slider-button-container';
    
        items.forEach((item) => {
            const button = document.createElement('button');
            button.textContent = item;
            button.classList.add('slider-card-button');
            button.addEventListener('click', () => onClickFunction(item));
            buttonContainer.appendChild(button);
        });
        
        // Add input field for manual entry
        const input = document.createElement('input');
        input.type = 'text';
        input.id = inputId;
        input.placeholder = 'Enter manually';
        input.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                onClickFunction(this.value);
            }
        });
        buttonContainer.appendChild(input);
    }

    function showSiteSelection() {
        const siteSelectionHTML = `
            <div class="site-selection-container">
                <div class="column">
                    <div class="action-buttons">
                        <button id="unassignSite" class="dashboard-btn">Unassign</button>
                        <button id="cancelSiteSelection" class="dashboard-btn">Cancel</button>
                    </div>
                    <h2 id="a-sites">A Sites</h2>
                    <div class="site-list">
                        <button id="A1" class="site-button host" data-status="host">A1 - Host</button>
                        <button id="A2" class="site-button">A2</button>
                        <button id="A3" class="site-button">A3</button>
                        <button id="A4" class="site-button">A4</button>
                        <button id="A5" class="site-button">A5</button>
                        <button id="A6" class="site-button">A6</button>
                        <button id="A7" class="site-button">A7</button>
                        <button id="A8" class="site-button">A8</button>
                        <button id="A9" class="site-button">A9</button>
                        <button id="A10" class="site-button">A10</button>
                        <button id="A11" class="site-button">A11</button>
                        <button id="A12" class="site-button">A12</button>
                        <button id="A13" class="site-button host" data-status="host">A13 - Host</button>
                        <button id="A14" class="site-button">A14</button>
                        <button id="A15" class="site-button">A15</button>
                        <button id="A16" class="site-button">A16</button>
                        <button id="A17" class="site-button">A17</button>
                        <button id="A18" class="site-button">A18</button>
                        <button id="A19" class="site-button">A19</button>
                        <button id="A20" class="site-button">A20</button>
                        <button id="A21" class="site-button">A21</button>
                        <button id="A22" class="site-button">A22</button>
                        <button id="A23" class="site-button">A23</button>
                        <button id="A24" class="site-button">A24</button>
                        <button id="A25" class="site-button">A25</button>
                        <button id="A26" class="site-button">A26</button>
                        <button id="A27" class="site-button">A27</button>
                        <button id="A28" class="site-button">A28</button>
                        <button id="A29" class="site-button">A29</button>
                        <button id="A30" class="site-button">A30</button>
                        <button id="A31" class="site-button">A31</button>
                        <button id="A32" class="site-button">A32</button>
                        <button id="A33" class="site-button">A33</button>
                        <button id="A34" class="site-button">A34</button>
                        <button id="A35" class="site-button">A35</button>
                        <button id="A36" class="site-button">A36</button>
                        <button id="A37" class="site-button">A37</button>
                        <button id="A38" class="site-button">A38</button>
                        <button id="A39" class="site-button">A39</button>
                        <button id="A40" class="site-button">A40</button>
                        <button id="A41" class="site-button">A41</button>
                        <button id="A42" class="site-button">A42</button>
                        <button id="A43" class="site-button">A43</button>
                        <button id="A44" class="site-button">A44</button>
                        <button id="A45" class="site-button host" data-status="host">A45 - Host</button>
                        <button id="A46" class="site-button">A46</button>
                        <button id="A47" class="site-button">A47</button>
                        <button id="A48" class="site-button">A48</button>
                        <button id="A49" class="site-button host" data-status="host">A49 - Host</button>
                    </div>
                </div>
                <div class="column">
                    <h2 id="b-sites">B Sites</h2>
                    <div class="site-list">
                        <button id="B1" class="site-button">B1</button>
                        <button id="B2" class="site-button">B2</button>
                        <button id="B3" class="site-button">B3</button>
                        <button id="B4" class="site-button">B4</button>
                        <button id="B5" class="site-button">B5</button>
                        <button id="B6" class="site-button">B6</button>
                        <button id="B7" class="site-button">B7</button>
                        <button id="B8" class="site-button">B8</button>
                        <button id="B9" class="site-button">B9</button>
                        <button id="B10" class="site-button">B10</button>
                        <button id="B11" class="site-button">B11</button>
                        <button id="B12" class="site-button">B12</button>
                        <button id="B13" class="site-button">B13</button>
                        <button id="B14" class="site-button">B14</button>
                        <button id="B15" class="site-button">B15</button>
                        <button id="B16" class="site-button">B16</button>
                        <button id="B17" class="site-button">B17</button>
                        <button id="B18" class="site-button">B18</button>
                        <button id="B19" class="site-button">B19</button>
                        <button id="B20" class="site-button">B20</button>
                    </div>
                    <h2 id="f-sites">F Sites</h2>
                    <div class="site-list">
                        <button id="F1" class="site-button">F1</button>
                        <button id="F2" class="site-button">F2</button>
                        <button id="F3" class="site-button">F3</button>
                    </div>
                </div>
            </div>
        `;
    
    
        const siteSection = document.getElementById('siteSection');
        if (siteSection) {
            siteSection.innerHTML = siteSelectionHTML;

            // Add event listeners to site buttons
            const siteButtons = document.querySelectorAll('.site-button');
            siteButtons.forEach(button => {
                button.addEventListener('click', () => selectSite(button.id));
            });

            // Add event listeners for Unassign and Cancel buttons
            document.getElementById('unassignSite').addEventListener('click', unassignSite);
            document.getElementById('cancelSiteSelection').addEventListener('click', cancelSiteSelection);
        } else {
            console.error('Site section element not found');
        }
    }

    function generateSiteButtons(prefix, count) {
        let buttons = '';
        for (let i = 1; i <= count; i++) {
            const isHost = [1, 13, 45, 49].includes(i) && prefix === 'A';
            buttons += `<button id="${prefix}${i}" class="site-button${isHost ? ' host' : ''}" ${isHost ? 'data-status="host"' : ''}>${prefix}${i}${isHost ? ' - Host' : ''}</button>`;
        }
        return buttons;
    }
    
    /* -------------------------------------------------------------------------- */
    /*                           CHECK-IN PROCESS FUNCTIONS                       */
    /* -------------------------------------------------------------------------- */
    function selectManufacturer(manufacturer) {
        currentCheckIn.manufacturer = manufacturer;
        showSection('colorSection');
        createButtons('colorButtons', colors, selectColor, 'colorInput');
    }

    function selectColor(color) {
        currentCheckIn.color = color;
        showSection('stateSection');
        createButtons('stateButtons', states, selectState, 'stateInput');
    }

    function selectState(state) {
        currentCheckIn.state = state;
        showSection('licensePlateSection');
    }

    function selectSite(siteId) {
        currentCheckIn.site = siteId;
        updateCheckIn(currentCheckIn);
        toggleSlider();
    }

    function unassignSite() {
        currentCheckIn.site = null;
        updateCheckIn(currentCheckIn);
        toggleSlider();
    }

    function cancelSiteSelection() {
        toggleSlider();
    }

    function submitCheckIn() {
        console.log('Submitting check-in:', currentCheckIn);
        checkIns.push(currentCheckIn);
        updateDashboard();
        currentCheckIn = {}; // Reset for next check-in
        toggleSlider(); // Close the slider
        showSection('manufacturerSection'); // Reset to first step for next check-in
    }

    function assignSite() {
        currentCheckIn = { site: null };
        toggleSlider();
        showSection('siteSection');
        showSiteSelection();
    }

    
    /* -------------------------------------------------------------------------- */
    /*                             DASHBOARD FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */
    function updateDashboard() {
        const cardContainer = document.getElementById('checkInCards');
        if (!cardContainer) {
            console.error('Check-in card container not found');
            return;
        }
        cardContainer.innerHTML = '';
        checkIns.forEach((checkIn, index) => {
            const card = document.createElement('button');
            card.classList.add('check-in-card');
            card.classList.add(checkIn.site ? 'assigned' : 'unassigned');
            card.innerHTML = `
                <p><strong>${checkIn.manufacturer || 'No Vehicle'}</strong></p>
                <p>${checkIn.color || ''}</p>
                <p>${checkIn.state ? checkIn.state + ',' : ''} ${checkIn.licensePlate || ''}</p>
                <p>${checkIn.site ? `Site: ${checkIn.site}` : 'Site: Unassigned'}</p>
            `;
            card.addEventListener('click', () => editCheckIn(index));
            cardContainer.appendChild(card);
        });
    }

    function updateCheckIn(checkIn) {
        const index = checkIns.findIndex(c => c === currentCheckIn);
        if (index !== -1) {
            checkIns[index] = checkIn;
        } else {
            checkIns.push(checkIn);
        }
        updateDashboard();
    }

    function editCheckIn(index) {
        currentCheckIn = checkIns[index];
        toggleSlider();
        showSection('siteSection');
        showSiteSelection();
    }

    function clearDashboardAtMidnight() {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 50, 0, 0);
        const timeUntilMidnight = midnight - now;
        setTimeout(() => {
            checkIns = [];
            updateDashboard();
            clearDashboardAtMidnight(); // Set up the next day's clear
        }, timeUntilMidnight);
    }

    /* -------------------------------------------------------------------------- */
    /*                               EVENT LISTENERS                              */
    /* -------------------------------------------------------------------------- */
    sliderTab.addEventListener('click', toggleSlider);

    if (backToDashboardButton) {
        backToDashboardButton.addEventListener('click', () => window.location.href = 'dashboard.html');
    }

    const licensePlateInput = document.getElementById('licensePlateInput');
    const submitButton = document.getElementById('submitLicensePlate');

    if (licensePlateInput) {
        licensePlateInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                currentCheckIn.licensePlate = this.value;
                submitCheckIn();
            }
        });
    }

    if (submitButton) {
        submitButton.addEventListener('click', function() {
            currentCheckIn.licensePlate = licensePlateInput.value;
            submitCheckIn();
        });
    }

    ['manufacturerInput', 'colorInput', 'stateInput'].forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    const value = this.value.trim();
                    if (value) {
                        if (inputId === 'manufacturerInput') selectManufacturer(value);
                        else if (inputId === 'colorInput') selectColor(value);
                        else if (inputId === 'stateInput') selectState(value);
                    }
                }
            });
        }s
    });
    function handleFirebaseError(error) {
        console.error('Firebase operation failed:', error);
        // Display a user-friendly error message
        showNotification('An error occurred. Please try again later.');
    }

    /* -------------------------------------------------------------------------- */
    /*                            INITIALIZATION                                  */
    /* -------------------------------------------------------------------------- */
    clearDashboardAtMidnight();
    updateDashboard(); // Initial dashboard update
    createButtons('manufacturerButtons', manufacturers, selectManufacturer, 'manufacturerInput');
    showSection('manufacturerSection'); // Show the first section initially

    console.log('Script initialization complete');
});