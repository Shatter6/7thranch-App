document.addEventListener('DOMContentLoaded', function() {
    const db = firebase.database();
    const siteMap = document.getElementById('siteMap');
    const siteOverlay = document.getElementById('siteOverlay');

    function createSiteButtons(sites) {
        siteOverlay.innerHTML = '';

        sites.forEach(site => {
            const button = document.createElement('div');
            button.className = 'site-button';
            button.dataset.siteId = site.id;
            button.style.left = `${site.x}px`;
            button.style.top = `${site.y}px`;
            button.style.width = `${site.width}px`;
            button.style.height = `${site.height}px`;
            button.textContent = site.id;

            button.addEventListener('click', () => handleSiteClick(site));
            siteOverlay.appendChild(button);

            updateSiteColor(site.id, site.occupied);
        });
    }

    function updateSiteColor(siteId, isOccupied) {
        const siteButton = document.querySelector(`.site-button[data-site-id="${siteId}"]`);
        if (siteButton) {
            siteButton.classList.toggle('occupied', isOccupied);
        }
    }

    function handleSiteClick(site) {
        if (site.occupied) {
            if (confirm(`Do you want to check out from site ${site.id}?`)) {
                checkoutSite(site.id);
            }
        } else {
            alert(`Site ${site.id} is not occupied.`);
        }
    }

    function checkoutSite(siteId) {
        db.ref(`sites/${siteId}`).update({ occupied: false })
            .then(() => alert(`Successfully checked out from site ${siteId}`))
            .catch(error => console.error('Error during checkout:', error));
    }

    db.ref('sites').on('value', (snapshot) => {
        const sites = [];
        snapshot.forEach((childSnapshot) => {
            sites.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        createSiteButtons(sites);
    });
});