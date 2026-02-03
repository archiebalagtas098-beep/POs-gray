// Settings Management Script
let currentUser = null;
let settingsChanged = false;
let originalUserData = null;
let passwordAttempts = 0;
let passwordCooldown = false;
let cooldownTimer = null;

// Element references (declare them at the top for better organization)
let elements = {
    // Form elements - Always editable
    fullNameDisplay: null,
    emailDisplay: null,
    phoneDisplay: null,
    usernameDisplay: null,
    currentPassword: null,
    newPassword: null,
    confirmPassword: null,
    
    // Buttons
    saveBtn: null,
    logoutBtn: null,
    passwordChangeBtn: null,
    changePasswordModalBtn: null,
    cancelPasswordChangeBtn: null,
    
    // Containers
    passwordFormContainer: null,
    passwordActionContainer: null,
    
    // Forms
    passwordChangeForm: null,
    
    // Status indicators
    autoSaveStatus: null,
    lastSavedTime: null
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings page loaded');
    
    // Initialize element references
    initializeElements();
    
    // Check for existing cooldown from session
    checkSessionCooldown();
    
    loadUserData();
    setupEventListeners();
    
    // Initialize auto-save features
    setupAutoSave();
});

// Initialize all DOM element references
function initializeElements() {
    elements.fullNameDisplay = document.getElementById('fullNameDisplay');
    elements.emailDisplay = document.getElementById('emailDisplay');
    elements.phoneDisplay = document.getElementById('phoneDisplay');
    elements.usernameDisplay = document.getElementById('usernameDisplay');
    elements.currentPassword = document.getElementById('currentPassword');
    elements.newPassword = document.getElementById('newPassword');
    elements.confirmPassword = document.getElementById('confirmPassword');
    elements.saveBtn = document.getElementById('saveBtn');
    elements.logoutBtn = document.getElementById('logoutBtn');
    elements.passwordChangeBtn = document.getElementById('passwordChangeBtn');
    elements.changePasswordModalBtn = document.getElementById('changePasswordModalBtn');
    elements.cancelPasswordChangeBtn = document.getElementById('cancelPasswordChangeBtn');
    elements.passwordFormContainer = document.getElementById('passwordFormContainer');
    elements.passwordActionContainer = document.getElementById('passwordActionContainer');
    elements.passwordChangeForm = document.getElementById('passwordChangeForm');
    elements.autoSaveStatus = document.getElementById('autoSaveStatus');
    elements.lastSavedTime = document.getElementById('lastSavedTime');
    
    // Log missing elements for debugging
    Object.keys(elements).forEach(key => {
        if (!elements[key] && key !== 'autoSaveStatus' && key !== 'lastSavedTime') {
            console.warn(`Element not found: ${key}`);
        }
    });
}

// Setup auto-save functionality for personal info fields
function setupAutoSave() {
    // Make personal info fields always editable
    if (elements.fullNameDisplay) elements.fullNameDisplay.readOnly = false;
    if (elements.emailDisplay) elements.emailDisplay.readOnly = false;
    if (elements.phoneDisplay) elements.phoneDisplay.readOnly = false;
    if (elements.usernameDisplay) elements.usernameDisplay.readOnly = true; // Username should remain read-only
    
    // Add input event listeners for auto-save
    if (elements.fullNameDisplay) {
        elements.fullNameDisplay.addEventListener('input', debounce(handlePersonalInfoChange, 1000));
    }
    if (elements.emailDisplay) {
        elements.emailDisplay.addEventListener('input', debounce(handlePersonalInfoChange, 1000));
    }
    if (elements.phoneDisplay) {
        elements.phoneDisplay.addEventListener('input', debounce(handlePersonalInfoChange, 1000));
    }
}

// Debounce function to prevent too many API calls
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Handle personal info changes with auto-save
async function handlePersonalInfoChange() {
    if (!currentUser) return;
    
    const fullName = elements.fullNameDisplay ? elements.fullNameDisplay.value.trim() : '';
    const email = elements.emailDisplay ? elements.emailDisplay.value.trim() : '';
    const phone = elements.phoneDisplay ? elements.phoneDisplay.value.trim() : '';
    
    // Basic validation
    if (!fullName || !email) {
        updateAutoSaveStatus('error', 'Full name and email are required');
        return;
    }
    
    if (!email.includes('@')) {
        updateAutoSaveStatus('error', 'Please enter a valid email address');
        return;
    }
    
    // Check if values have actually changed
    const hasChanges = 
        fullName !== originalUserData.fullName ||
        email !== originalUserData.email ||
        phone !== originalUserData.phoneNumber;
    
    if (!hasChanges) {
        updateAutoSaveStatus('idle', 'No changes detected');
        return;
    }
    
    // Update UI to show saving status
    updateAutoSaveStatus('saving', 'Saving changes...');
    
    try {
        // Save to MongoDB through API
        const response = await fetch('/api/user/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                fullName,
                email,
                phoneNumber: phone
            })
        });

        if (!response.ok) {
            const error = await response.json();
            updateAutoSaveStatus('error', 'Update failed: ' + (error.message || 'Unknown error'));
            
            // Revert to original values if save failed
            if (elements.fullNameDisplay && originalUserData) elements.fullNameDisplay.value = originalUserData.fullName || '';
            if (elements.emailDisplay && originalUserData) elements.emailDisplay.value = originalUserData.email || '';
            if (elements.phoneDisplay && originalUserData) elements.phoneDisplay.value = originalUserData.phoneNumber || '';
            
            return;
        }

        // Get updated user data from MongoDB
        const updatedUser = await response.json();
        
        // Update currentUser with fresh data from MongoDB
        currentUser.fullName = updatedUser.fullName || '';
        currentUser.email = updatedUser.email || '';
        currentUser.phoneNumber = updatedUser.phoneNumber || '';
        currentUser.updatedAt = updatedUser.updatedAt;
        
        // Update originalUserData
        originalUserData = JSON.parse(JSON.stringify(currentUser));
        
        // Update success status
        updateAutoSaveStatus('success', 'Changes saved successfully!');
        
        // Update last saved time
        updateLastSavedTime();
        
    } catch (error) {
        console.error('Error auto-saving profile:', error);
        updateAutoSaveStatus('error', 'Update failed. Please check your connection.');
        
        // Revert to original values on error
        if (originalUserData) {
            if (elements.fullNameDisplay) elements.fullNameDisplay.value = originalUserData.fullName || '';
            if (elements.emailDisplay) elements.emailDisplay.value = originalUserData.email || '';
            if (elements.phoneDisplay) elements.phoneDisplay.value = originalUserData.phoneNumber || '';
        }
    }
}

// Update auto-save status in UI
function updateAutoSaveStatus(status, message) {
    if (!elements.autoSaveStatus) return;
    
    elements.autoSaveStatus.textContent = message;
    
    // Clear existing classes
    elements.autoSaveStatus.className = 'auto-save-status';
    
    switch(status) {
        case 'saving':
            elements.autoSaveStatus.classList.add('saving');
            break;
        case 'success':
            elements.autoSaveStatus.classList.add('success');
            break;
        case 'error':
            elements.autoSaveStatus.classList.add('error');
            break;
        case 'idle':
            elements.autoSaveStatus.classList.add('idle');
            break;
    }
}

// Update last saved time display
function updateLastSavedTime() {
    if (!elements.lastSavedTime) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    elements.lastSavedTime.textContent = `Last saved: ${timeString}`;
    elements.lastSavedTime.style.display = 'block';
}

// Check if user is in cooldown from current session
function checkSessionCooldown() {
    // Only check cooldown in current session, not persistent
    if (passwordCooldown) {
        // If already in cooldown from current session, start timer
        const cooldownEnd = sessionStorage.getItem('passwordCooldownEnd');
        if (cooldownEnd) {
            const now = Date.now();
            const remainingSeconds = Math.max(0, (parseInt(cooldownEnd) - now) / 1000);
            if (remainingSeconds > 0) {
                startCooldown(remainingSeconds);
            }
        }
    }
}

// Load user data from MongoDB
async function loadUserData() {
    try {
        const response = await fetch('/api/user/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Failed to load user data from MongoDB');
            showToast('Failed to load user data. Please refresh the page.', 'error');
            return;
        }

        const userData = await response.json();
        
        // Map MongoDB fields to form fields
        currentUser = {
            _id: userData._id,
            username: userData.username,
            email: userData.email || '',
            fullName: userData.fullName || '',
            phoneNumber: userData.phoneNumber || '',
            role: userData.role || 'Staff',
            isActive: userData.isActive || true,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
        };
        
        originalUserData = JSON.parse(JSON.stringify(currentUser)); // Deep copy original data
        
        // Update UI with fresh data from MongoDB
        populateUserData();
        
        // Update last saved time on load
        if (elements.lastSavedTime) {
            const lastUpdate = new Date(userData.updatedAt);
            const timeString = lastUpdate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            elements.lastSavedTime.textContent = `Last saved: ${timeString}`;
            elements.lastSavedTime.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading user data from MongoDB:', error);
        showToast('Error loading user data. Please check your connection.', 'error');
    }
}

// Populate form with user data
function populateUserData() {
    if (!currentUser) return;

    // Use the elements object
    if (elements.fullNameDisplay) elements.fullNameDisplay.value = currentUser.fullName || '';
    if (elements.emailDisplay) elements.emailDisplay.value = currentUser.email || '';
    if (elements.phoneDisplay) elements.phoneDisplay.value = currentUser.phoneNumber || '';
    if (elements.usernameDisplay) elements.usernameDisplay.value = currentUser.username || '';
}

// Setup event listeners
function setupEventListeners() {
    // Save button (manual save)
    if (elements.saveBtn) {
        elements.saveBtn.addEventListener('click', handlePersonalInfoChange);
    }

    // Change Password buttons
    if (elements.changePasswordModalBtn) {
        elements.changePasswordModalBtn.addEventListener('click', showPasswordChangeForm);
    }

    if (elements.cancelPasswordChangeBtn) {
        elements.cancelPasswordChangeBtn.addEventListener('click', hidePasswordChangeForm);
    }

    if (elements.passwordChangeForm) {
        elements.passwordChangeForm.addEventListener('submit', handlePasswordChange);
    }

    // Logout button
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
}

// Show password change form
function showPasswordChangeForm() {
    if (elements.passwordFormContainer) {
        elements.passwordFormContainer.style.display = 'block';
        // Clear only old password field
        if (elements.currentPassword) elements.currentPassword.value = '';
    }
    if (elements.passwordActionContainer) {
        elements.passwordActionContainer.style.display = 'none';
    }
}

// Hide password change form
function hidePasswordChangeForm() {
    if (elements.passwordFormContainer) {
        elements.passwordFormContainer.style.display = 'none';
    }
    if (elements.passwordActionContainer) {
        elements.passwordActionContainer.style.display = 'block';
    }

    // Clear all password fields
    if (elements.currentPassword) elements.currentPassword.value = '';
    if (elements.newPassword) elements.newPassword.value = '';
    if (elements.confirmPassword) elements.confirmPassword.value = '';
}

// Start cooldown timer (session only, not persistent)
function startCooldown(seconds = 30) {
    passwordCooldown = true;
    const cooldownEnd = Date.now() + (seconds * 1000);
    sessionStorage.setItem('passwordCooldownEnd', cooldownEnd.toString());
    
    // Update UI
    if (elements.passwordChangeBtn) {
        elements.passwordChangeBtn.disabled = true;
    }
    
    if (elements.currentPassword) elements.currentPassword.disabled = true;
    if (elements.newPassword) elements.newPassword.disabled = true;
    if (elements.confirmPassword) elements.confirmPassword.disabled = true;
    
    // Start countdown
    let remaining = Math.ceil(seconds);
    
    if (cooldownTimer) clearInterval(cooldownTimer);
    
    cooldownTimer = setInterval(() => {
        remaining--;
        
        if (elements.passwordChangeBtn) {
            elements.passwordChangeBtn.textContent = `Try again in ${remaining}s`;
        }
        
        if (remaining <= 0) {
            clearInterval(cooldownTimer);
            endCooldown();
        }
    }, 1000);
}

// End cooldown
function endCooldown() {
    passwordCooldown = false;
    passwordAttempts = 0;
    sessionStorage.removeItem('passwordCooldownEnd');
    
    // Update UI
    if (elements.passwordChangeBtn) {
        elements.passwordChangeBtn.disabled = false;
        elements.passwordChangeBtn.textContent = 'Change Password';
    }
    
    if (elements.currentPassword) elements.currentPassword.disabled = false;
    if (elements.newPassword) elements.newPassword.disabled = false;
    if (elements.confirmPassword) elements.confirmPassword.disabled = false;
}

// Handle password change with bcrypt hashing (client-side note)
async function handlePasswordChange(e) {
    e.preventDefault();

    // Check if in cooldown
    if (passwordCooldown) {
        showToast('Please wait before trying again', 'error');
        return;
    }

    if (!elements.currentPassword || !elements.newPassword || !elements.confirmPassword) {
        showToast('Password form elements not found', 'error');
        return;
    }

    const currentPassword = elements.currentPassword.value;
    const newPassword = elements.newPassword.value;
    const confirmPassword = elements.confirmPassword.value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('All password fields are required', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    if (currentPassword === newPassword) {
        showToast('New password cannot be the same as old password', 'error');
        return;
    }

    // Password strength validation
    const passwordStrength = checkPasswordStrength(newPassword);
    if (passwordStrength.score < 3) {
        showToast(`Password too weak: ${passwordStrength.feedback}`, 'warning');
        return;
    }

    try {
        // IMPORTANT: In a real application, passwords should be hashed on the server-side
        // with bcrypt. The server receives plain passwords here but should hash them immediately.
        // NEVER hash passwords client-side for authentication purposes.
        
        // For demonstration: Show that server will use bcrypt
        console.log('Sending password change request. Server will use bcrypt to hash the new password.');
        
        // Show loading state
        if (elements.passwordChangeBtn) {
            elements.passwordChangeBtn.disabled = true;
            elements.passwordChangeBtn.textContent = 'Changing Password...';
        }

        // Send password change request to server
        // The server should:
        // 1. Verify current password by comparing bcrypt hash
        // 2. Hash new password with bcrypt before storing
        const response = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword, // Plain text - server will verify using bcrypt compare
                newPassword     // Plain text - server will hash with bcrypt before storing
            })
        });

        if (!response.ok) {
            const error = await response.json();
            
            // Reset button state
            if (elements.passwordChangeBtn) {
                elements.passwordChangeBtn.disabled = false;
                elements.passwordChangeBtn.textContent = 'Change Password';
            }
            
            // Check if error is due to wrong current password
            if (error.message && (error.message.includes('current password') || 
                error.message.includes('Current password') || 
                error.message.includes('incorrect password') ||
                error.message.includes('Incorrect password') ||
                error.message.includes('wrong password') ||
                error.message.includes('Invalid credentials'))) {
                
                // Increment attempts for wrong current password (in memory only)
                passwordAttempts++;
                
                // Start cooldown after 3 failed attempts (session only)
                if (passwordAttempts >= 3) {
                    showToast('Too many failed attempts. 30-second cooldown activated.', 'error');
                    startCooldown(30);
                } else {
                    const attemptsLeft = 3 - passwordAttempts;
                    showToast(`Wrong current password. ${attemptsLeft} attempt(s) left.`, 'error');
                }
            } else {
                showToast('Error: ' + (error.message || 'Failed to change password'), 'error');
            }
            
            // Clear only old password field on failed attempt
            elements.currentPassword.value = '';
            
            return;
        }

        // Success - password saved to MongoDB with bcrypt hashing
        const result = await response.json();
        
        // Reset attempts and clear cooldown
        passwordAttempts = 0;
        passwordCooldown = false;
        sessionStorage.removeItem('passwordCooldownEnd');
        
        if (cooldownTimer) {
            clearInterval(cooldownTimer);
            cooldownTimer = null;
        }

        showToast('✅ Password changed successfully! (Securely hashed with bcrypt)', 'success');
        
        // Update user data
        if (currentUser) {
            currentUser.passwordUpdatedAt = new Date().toISOString();
        }
        
        // Clear all password fields
        elements.currentPassword.value = '';
        elements.newPassword.value = '';
        elements.confirmPassword.value = '';
        
        // Reset button state
        if (elements.passwordChangeBtn) {
            elements.passwordChangeBtn.disabled = false;
            elements.passwordChangeBtn.textContent = 'Change Password';
        }
        
        // Show success message for 2 seconds before hiding form
        setTimeout(() => {
            hidePasswordChangeForm();
        }, 2000);
        
    } catch (error) {
        console.error('Error changing password:', error);
        
        // Reset button state
        if (elements.passwordChangeBtn) {
            elements.passwordChangeBtn.disabled = false;
            elements.passwordChangeBtn.textContent = 'Change Password';
        }
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showToast('Cannot connect to server. Please try again later.', 'error');
        } else {
            showToast('Error changing password: ' + error.message, 'error');
        }
        
        // Clear only old password field on error
        if (elements.currentPassword) elements.currentPassword.value = '';
    }
}

// Check password strength
function checkPasswordStrength(password) {
    let score = 0;
    const feedback = [];
    
    // Check length
    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');
    
    // Check for lowercase
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');
    
    // Check for uppercase
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');
    
    // Check for numbers
    if (/[0-9]/.test(password)) score++;
    else feedback.push('Add numbers');
    
    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('Add special characters');
    
    return {
        score,
        feedback: feedback.join(', ')
    };
}

// Show toast notification
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 14px;
        min-width: 250px;
        max-width: 350px;
    `;

    // Add animation styles if not already present
    if (!document.getElementById('toastAnimations')) {
        const style = document.createElement('style');
        style.id = 'toastAnimations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    if (type === 'success') {
        toast.style.backgroundColor = '#28a745';
        toast.innerHTML = `<span style="font-size: 18px;">✓</span><span>${message}</span>`;
    } else if (type === 'error') {
        toast.style.backgroundColor = '#dc3545';
        toast.innerHTML = `<span style="font-size: 18px;">✕</span><span>${message}</span>`;
    } else if (type === 'info') {
        toast.style.backgroundColor = '#17a2b8';
        toast.innerHTML = `<span style="font-size: 18px;">ℹ</span><span>${message}</span>`;
    } else if (type === 'warning') {
        toast.style.backgroundColor = '#ffc107';
        toast.style.color = '#000000';
        toast.innerHTML = `<span style="font-size: 18px;">⚠</span><span>${message}</span>`;
    } else {
        toast.style.backgroundColor = '#6c757d';
        toast.innerHTML = `<span>${message}</span>`;
    }

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Logout handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/logout';
    }
}

// Before unload warning
window.addEventListener('beforeunload', function(e) {
    if (settingsChanged) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});

// Check for unsaved changes periodically
setInterval(function() {
    if (!elements.fullNameDisplay || !elements.emailDisplay || !elements.phoneDisplay || !originalUserData) return;
    
    const hasChanges = 
        elements.fullNameDisplay.value !== originalUserData.fullName ||
        elements.emailDisplay.value !== originalUserData.email ||
        elements.phoneDisplay.value !== originalUserData.phoneNumber;
    
    settingsChanged = hasChanges;
}, 1000);

// Add some CSS for auto-save status (optional, add to your CSS file or style tag)
const style = document.createElement('style');
style.textContent = `
    .auto-save-status {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        display: inline-block;
        margin-left: 10px;
        transition: all 0.3s ease;
    }
    
    .auto-save-status.saving {
        background-color: #ffc107;
        color: #000;
    }
    
    .auto-save-status.success {
        background-color: #28a745;
        color: white;
    }
    
    .auto-save-status.error {
        background-color: #dc3545;
        color: white;
    }
    
    .auto-save-status.idle {
        background-color: #6c757d;
        color: white;
        opacity: 0.7;
    }
    
    #lastSavedTime {
        font-size: 11px;
        color: #6c757d;
        font-style: italic;
        margin-top: 5px;
        display: none;
    }
    
    .form-field {
        margin-bottom: 15px;
    }
    
    .form-field label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    .form-field input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .form-field input:focus {
        border-color: #80bdff;
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
    }
`;
document.head.appendChild(style);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeElements,
        handlePersonalInfoChange,
        handlePasswordChange,
        showToast,
        handleLogout,
        checkPasswordStrength
    };
}