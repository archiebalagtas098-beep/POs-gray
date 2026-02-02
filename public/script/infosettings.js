// Settings Management Script
let currentUser = null;
let settingsChanged = false;
let originalUserData = null;
let passwordAttempts = 0;
let passwordCooldown = false;
let cooldownTimer = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings page loaded');
    
    // Check for existing cooldown from session
    checkSessionCooldown();
    
    loadUserData();
    setupEventListeners();
});

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
    } catch (error) {
        console.error('Error loading user data from MongoDB:', error);
    }
}

// Populate form with user data
function populateUserData() {
    if (!currentUser) return;

    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const phoneDisplay = document.getElementById('phoneDisplay');
    const usernameDisplay = document.getElementById('usernameDisplay');

    if (fullNameDisplay) fullNameDisplay.value = currentUser.fullName || '';
    if (emailDisplay) emailDisplay.value = currentUser.email || '';
    if (phoneDisplay) phoneDisplay.value = currentUser.phoneNumber || '';
    if (usernameDisplay) usernameDisplay.value = currentUser.username || '';

    // Make fields read-only by default
    if (fullNameDisplay) fullNameDisplay.readOnly = true;
    if (emailDisplay) emailDisplay.readOnly = true;
    if (phoneDisplay) phoneDisplay.readOnly = true;
    if (usernameDisplay) usernameDisplay.readOnly = true;
}

// Setup event listeners
function setupEventListeners() {
    // Edit Personal Info
    const editPersonalInfoBtn = document.getElementById('editPersonalInfoBtn');
    if (editPersonalInfoBtn) {
        editPersonalInfoBtn.addEventListener('click', toggleEditPersonalInfo);
    }

    // Change Password
    const changePasswordModalBtn = document.getElementById('changePasswordModalBtn');
    if (changePasswordModalBtn) {
        changePasswordModalBtn.addEventListener('click', showPasswordChangeForm);
    }

    const cancelPasswordChangeBtn = document.getElementById('cancelPasswordChangeBtn');
    if (cancelPasswordChangeBtn) {
        cancelPasswordChangeBtn.addEventListener('click', hidePasswordChangeForm);
    }

    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', handlePasswordChange);
    }

    // Save and Cancel buttons
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', savePersonalInfo);
    }

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Toggle edit mode for personal information
function toggleEditPersonalInfo() {
    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const phoneDisplay = document.getElementById('phoneDisplay');
    const editBtn = document.getElementById('editPersonalInfoBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    if (!fullNameDisplay || !emailDisplay || !phoneDisplay || !editBtn) {
        console.error('Required elements not found');
        return;
    }

    const isReadOnly = fullNameDisplay.readOnly;

    if (isReadOnly) {
        // Enable editing
        fullNameDisplay.readOnly = false;
        emailDisplay.readOnly = false;
        phoneDisplay.readOnly = false;
        editBtn.textContent = '✓ Done Editing';
        editBtn.style.backgroundColor = '#28a745';
        
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (cancelBtn) cancelBtn.style.display = 'inline-block';
        
        settingsChanged = true;
    } else {
        // Disable editing - but KEEP the current values
        fullNameDisplay.readOnly = true;
        emailDisplay.readOnly = true;
        phoneDisplay.readOnly = true;
        editBtn.textContent = 'Update Info';
        editBtn.style.backgroundColor = '';
        
        if (saveBtn) saveBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
        
        // Get current values from form
        const currentValues = {
            fullName: fullNameDisplay.value,
            email: emailDisplay.value,
            phoneNumber: phoneDisplay.value
        };
        
        // Update currentUser object with form values
        if (currentUser) {
            currentUser.fullName = currentValues.fullName;
            currentUser.email = currentValues.email;
            currentUser.phoneNumber = currentValues.phoneNumber;
            
            showToast('Changes saved to form', 'info');
        }
        
        settingsChanged = false;
    }
}

// Save personal information to MongoDB
async function savePersonalInfo() {
    try {
        const fullNameDisplay = document.getElementById('fullNameDisplay');
        const emailDisplay = document.getElementById('emailDisplay');
        const phoneDisplay = document.getElementById('phoneDisplay');

        if (!fullNameDisplay || !emailDisplay || !phoneDisplay) {
            showToast('Form elements not found', 'error');
            return;
        }

        const fullName = fullNameDisplay.value;
        const email = emailDisplay.value;
        const phone = phoneDisplay.value;

        // Validation
        if (!fullName || !email) {
            showToast('Full name and email are required', 'error');
            return;
        }

        if (!email.includes('@')) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        // Update currentUser object
        currentUser.fullName = fullName;
        currentUser.email = email;
        currentUser.phoneNumber = phone;

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
            showToast('Update failed: ' + (error.message || 'Unknown error'), 'error');
            
            // Revert to original data since update failed
            if (originalUserData) {
                currentUser = JSON.parse(JSON.stringify(originalUserData));
                populateUserData();
            }
            
            finishEditing();
            return;
        }

        // Get updated user data from MongoDB
        const updatedUser = await response.json();
        
        // Update currentUser with fresh data from MongoDB
        currentUser.fullName = updatedUser.fullName || '';
        currentUser.email = updatedUser.email || '';
        currentUser.phoneNumber = updatedUser.phoneNumber || '';
        currentUser.updatedAt = updatedUser.updatedAt;
        
        showToast('Profile updated successfully!', 'success');
        
        finishEditing();
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Update failed. Please check your connection.', 'error');
        
        if (originalUserData) {
            currentUser = JSON.parse(JSON.stringify(originalUserData));
            populateUserData();
        }
        
        finishEditing();
    }
}

// Helper function to finish editing mode
function finishEditing() {
    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const phoneDisplay = document.getElementById('phoneDisplay');
    const editBtn = document.getElementById('editPersonalInfoBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (fullNameDisplay) fullNameDisplay.readOnly = true;
    if (emailDisplay) emailDisplay.readOnly = true;
    if (phoneDisplay) phoneDisplay.readOnly = true;
    
    if (editBtn) {
        editBtn.textContent = 'Update Info';
        editBtn.style.backgroundColor = '';
    }
    
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    
    originalUserData = JSON.parse(JSON.stringify(currentUser));
    settingsChanged = false;
}

// Cancel editing
function cancelEdit() {
    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const phoneDisplay = document.getElementById('phoneDisplay');
    
    // Restore original values from MongoDB data
    if (fullNameDisplay && originalUserData) fullNameDisplay.value = originalUserData.fullName || '';
    if (emailDisplay && originalUserData) emailDisplay.value = originalUserData.email || '';
    if (phoneDisplay && originalUserData) phoneDisplay.value = originalUserData.phoneNumber || '';
    
    // Also update currentUser to match original
    if (originalUserData) {
        currentUser = JSON.parse(JSON.stringify(originalUserData));
    }
    
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const editBtn = document.getElementById('editPersonalInfoBtn');
    
    if (fullNameDisplay) fullNameDisplay.readOnly = true;
    if (emailDisplay) emailDisplay.readOnly = true;
    if (phoneDisplay) phoneDisplay.readOnly = true;
    
    if (editBtn) {
        editBtn.textContent = 'Update Info';
        editBtn.style.backgroundColor = '';
    }
    
    if (saveBtn) saveBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    
    settingsChanged = false;
}

// Show password change form
function showPasswordChangeForm() {
    const passwordFormContainer = document.getElementById('passwordFormContainer');
    const passwordActionContainer = document.getElementById('passwordActionContainer');
    
    if (passwordFormContainer) {
        passwordFormContainer.style.display = 'block';
        // Clear only old password field
        const currentPassword = document.getElementById('currentPassword');
        if (currentPassword) currentPassword.value = '';
    }
    if (passwordActionContainer) {
        passwordActionContainer.style.display = 'none';
    }
}

// Hide password change form
function hidePasswordChangeForm() {
    const passwordFormContainer = document.getElementById('passwordFormContainer');
    const passwordActionContainer = document.getElementById('passwordActionContainer');
    
    if (passwordFormContainer) {
        passwordFormContainer.style.display = 'none';
    }
    if (passwordActionContainer) {
        passwordActionContainer.style.display = 'block';
    }

    // Clear form - only old password, keep new passwords
    const currentPassword = document.getElementById('currentPassword');
    
    if (currentPassword) currentPassword.value = '';
}

// Start cooldown timer (session only, not persistent)
function startCooldown(seconds = 30) {
    passwordCooldown = true;
    const cooldownEnd = Date.now() + (seconds * 1000);
    sessionStorage.setItem('passwordCooldownEnd', cooldownEnd.toString());
    
    // Update UI
    const passwordChangeBtn = document.getElementById('passwordChangeBtn');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (passwordChangeBtn) {
        passwordChangeBtn.disabled = true;
    }
    
    if (currentPassword) currentPassword.disabled = true;
    if (newPassword) newPassword.disabled = true;
    if (confirmPassword) confirmPassword.disabled = true;
    
    // Start countdown
    let remaining = Math.ceil(seconds);
    
    if (cooldownTimer) clearInterval(cooldownTimer);
    
    cooldownTimer = setInterval(() => {
        remaining--;
        
        if (passwordChangeBtn) {
            passwordChangeBtn.textContent = `Try again in ${remaining}s`;
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
    const passwordChangeBtn = document.getElementById('passwordChangeBtn');
    const currentPassword = document.getElementById('currentPassword');
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (passwordChangeBtn) {
        passwordChangeBtn.disabled = false;
        passwordChangeBtn.textContent = 'Change Password';
    }
    
    if (currentPassword) currentPassword.disabled = false;
    if (newPassword) newPassword.disabled = false;
    if (confirmPassword) confirmPassword.disabled = false;
}

// Handle password change and save to MongoDB
async function handlePasswordChange(e) {
    e.preventDefault();

    // Check if in cooldown
    if (passwordCooldown) {
        showToast('Please wait before trying again', 'error');
        return;
    }

    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
        showToast('Password form elements not found', 'error');
        return;
    }

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('All password fields are required', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
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

    try {
        // Save password to MongoDB through API
        const response = await fetch('/api/user/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (!response.ok) {
            const error = await response.json();
            
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
            currentPasswordInput.value = '';
            
            return;
        }

        // Success - password saved to MongoDB
        const result = await response.json();
        
        // Reset attempts and clear cooldown
        passwordAttempts = 0;
        passwordCooldown = false;
        sessionStorage.removeItem('passwordCooldownEnd');
        
        if (cooldownTimer) {
            clearInterval(cooldownTimer);
            cooldownTimer = null;
        }

        showToast('✅ Password changed successfully!', 'success');
        
        // Update user data
        if (currentUser) {
            currentUser.passwordUpdatedAt = new Date().toISOString();
        }
        
        // Keep new passwords, clear old password
        currentPasswordInput.value = '';
        
        // Show success message for 2 seconds before hiding form
        setTimeout(() => {
            hidePasswordChangeForm();
            
            // Clear all password fields after hiding
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
        }, 2000);
        
    } catch (error) {
        console.error('Error changing password:', error);
        
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showToast('Cannot connect to server. Please try again later.', 'error');
        } else {
            showToast('Error changing password: ' + error.message, 'error');
        }
        
        // Clear only old password field on error
        currentPasswordInput.value = '';
    }
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
    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const phoneDisplay = document.getElementById('phoneDisplay');
    
    if (!fullNameDisplay || !emailDisplay || !phoneDisplay || !originalUserData) return;
    
    const hasChanges = 
        fullNameDisplay.value !== originalUserData.fullName ||
        emailDisplay.value !== originalUserData.email ||
        phoneDisplay.value !== originalUserData.phoneNumber;
    
    settingsChanged = hasChanges;
}, 1000);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleEditPersonalInfo,
        savePersonalInfo,
        cancelEdit,
        showToast,
        handleLogout,
        handlePasswordChange
    };
}