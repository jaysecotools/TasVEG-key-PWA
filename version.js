// version.js - Version checking and update management

const VERSION_CHECK_INTERVAL = 3600000; // Check every hour (in milliseconds)
let updateNotificationShown = false;
let updateCheckInterval = null;

// Check for updates from server
async function checkForUpdates() {
    try {
        // Fetch the current version from the server
        const response = await fetch('/version.json', {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            console.log('Version check failed:', response.status);
            return null;
        }
        
        const versionInfo = await response.json();
        const serverVersion = versionInfo.version;
        
        // Check if we should skip this version
        const skipVersion = localStorage.getItem('skip_version_' + serverVersion);
        if (skipVersion === 'true') {
            return null;
        }
        
        // Compare versions
        if (serverVersion !== APP_VERSION) {
            return {
                newVersion: serverVersion,
                currentVersion: APP_VERSION,
                releaseNotes: versionInfo.releaseNotes || "New version available",
                updateUrl: versionInfo.updateUrl || null,
                forceUpdate: versionInfo.forceUpdate || false
            };
        }
        
        return null;
    } catch (error) {
        console.error('Version check error:', error);
        return null;
    }
}

// Show update notification to user
function showUpdateNotification(update) {
    const modal = document.getElementById('updateModal');
    const currentVersionSpan = document.getElementById('currentVersionDisplay');
    const newVersionSpan = document.getElementById('newVersionDisplay');
    const releaseNotesDiv = document.getElementById('releaseNotes');
    
    if (currentVersionSpan) currentVersionSpan.textContent = update.currentVersion;
    if (newVersionSpan) newVersionSpan.textContent = update.newVersion;
    
    if (releaseNotesDiv && update.releaseNotes) {
        // Format release notes with bullet points
        const formattedNotes = update.releaseNotes.split('\n').map(line => {
            if (line.trim().startsWith('•')) {
                return line;
            }
            return line;
        }).join('<br>');
        releaseNotesDiv.innerHTML = `<strong>Release Notes:</strong><br>${formattedNotes}`;
    }
    
    // If force update is enabled, hide the "Later" and "Don't Show" buttons
    if (update.forceUpdate) {
        const laterBtn = document.getElementById('updateLaterBtn');
        const neverBtn = document.getElementById('updateNeverBtn');
        if (laterBtn) laterBtn.style.display = 'none';
        if (neverBtn) neverBtn.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// Perform the actual update
async function performUpdate() {
    const progressModal = document.getElementById('updateProgressModal');
    const progressBar = document.getElementById('updateProgressBar');
    const updateStatus = document.getElementById('updateStatus');
    
    progressModal.style.display = 'block';
    progressBar.style.width = '0%';
    
    try {
        // Step 1: Update service worker
        if ('serviceWorker' in navigator) {
            updateStatus.textContent = 'Updating service worker...';
            progressBar.style.width = '30%';
            
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.update();
            }
            
            progressBar.style.width = '70%';
            updateStatus.textContent = 'Waiting for new version to activate...';
            
            // Wait for the new service worker to take control
            await new Promise((resolve) => {
                if (navigator.serviceWorker.controller) {
                    const controllerChangeHandler = () => {
                        navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
                        resolve();
                    };
                    navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
                    
                    // Timeout after 10 seconds
                    setTimeout(() => {
                        navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
                        resolve();
                    }, 10000);
                } else {
                    resolve();
                }
            });
            
            progressBar.style.width = '100%';
            updateStatus.textContent = 'Update complete! Reloading...';
            
            // Clear cached version skip
            const newVersionSpan = document.getElementById('newVersionDisplay');
            if (newVersionSpan) {
                localStorage.removeItem('skip_version_' + newVersionSpan.textContent);
            }
            
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            // Fallback for browsers without service worker support
            updateStatus.textContent = 'Update not supported. Please refresh the page.';
            progressBar.style.backgroundColor = '#f9a825';
            setTimeout(() => {
                progressModal.style.display = 'none';
            }, 3000);
        }
    } catch (error) {
        console.error('Update failed:', error);
        updateStatus.textContent = 'Update failed. Please try again later.';
        progressBar.style.backgroundColor = '#c62828';
        
        setTimeout(() => {
            progressModal.style.display = 'none';
        }, 3000);
    }
}

// Manual version check (triggered by button)
async function manualVersionCheck() {
    const update = await checkForUpdates();
    if (update) {
        showUpdateNotification(update);
    } else {
        // Show "no updates" toast message
        showToast('✅ You are using the latest version!');
    }
}

// Show a temporary toast notification
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// Periodic version check
async function periodicVersionCheck() {
    const update = await checkForUpdates();
    
    if (update && !updateNotificationShown) {
        updateNotificationShown = true;
        showUpdateNotification(update);
    }
}

// Initialize version checking on page load
function initVersionChecking() {
    // Display current version
    const versionDisplay = document.getElementById('versionDisplay');
    if (versionDisplay) {
        versionDisplay.textContent = `v${APP_VERSION}`;
    }
    
    // Check for updates after page loads
    setTimeout(() => {
        periodicVersionCheck();
    }, 3000);
    
    // Set up periodic checking
    if (updateCheckInterval) {
        clearInterval(updateCheckInterval);
    }
    updateCheckInterval = setInterval(periodicVersionCheck, VERSION_CHECK_INTERVAL);
}

// Setup update modal event listeners
function setupUpdateEventListeners() {
    const updateNowBtn = document.getElementById('updateNowBtn');
    const updateLaterBtn = document.getElementById('updateLaterBtn');
    const updateNeverBtn = document.getElementById('updateNeverBtn');
    
    if (updateNowBtn) {
        updateNowBtn.addEventListener('click', () => {
            document.getElementById('updateModal').style.display = 'none';
            performUpdate();
        });
    }
    
    if (updateLaterBtn) {
        updateLaterBtn.addEventListener('click', () => {
            document.getElementById('updateModal').style.display = 'none';
            // Reset notification flag so we can notify again later
            updateNotificationShown = false;
        });
    }
    
    if (updateNeverBtn) {
        updateNeverBtn.addEventListener('click', () => {
            const modal = document.getElementById('updateModal');
            const newVersionSpan = document.getElementById('newVersionDisplay');
            if (newVersionSpan && newVersionSpan.textContent) {
                localStorage.setItem('skip_version_' + newVersionSpan.textContent, 'true');
            }
            modal.style.display = 'none';
            updateNotificationShown = false;
        });
    }
}

// Check for service worker updates on page load
async function checkServiceWorkerUpdate() {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New version available
                        showToast('A new version is available. Refresh to update.', 5000);
                    }
                });
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initVersionChecking();
    setupUpdateEventListeners();
    checkServiceWorkerUpdate();
});

// Make functions globally available
window.checkForUpdates = checkForUpdates;
window.manualVersionCheck = manualVersionCheck;
window.performUpdate = performUpdate;
