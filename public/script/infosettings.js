// Settings Management Script
let currentUser = null;
let settingsChanged = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings page loaded');
    
    // Apply saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#ffffff';
        document.body.classList.add('dark-mode');
    } else {
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#000000';
    }
    
    loadUserData();
    setupEventListeners();
});

// Load user data from server
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
            return;
        }

        currentUser = await response.json();
        populateUserData();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Populate form with user data
function populateUserData() {
    if (!currentUser) return;

    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const phoneDisplay = document.getElementById('phoneDisplay');

    if (fullNameDisplay) fullNameDisplay.value = currentUser.fullName || '';
    if (emailDisplay) emailDisplay.value = currentUser.email || '';
    if (phoneDisplay) phoneDisplay.value = currentUser.phoneNumber || '';

    // Make fields read-only by default
    if (fullNameDisplay) fullNameDisplay.readOnly = true;
    if (emailDisplay) emailDisplay.readOnly = true;
    if (phoneDisplay) phoneDisplay.readOnly = true;
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

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', toggleDarkMode);
        darkModeToggle.checked = localStorage.getItem('darkMode') === 'true';
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
}

// Toggle edit mode for personal information
function toggleEditPersonalInfo() {
    const fullNameDisplay = document.getElementById('fullNameDisplay');
    const emailDisplay = document.getElementById('emailDisplay');
    const phoneDisplay = document.getElementById('phoneDisplay');
    const editBtn = document.getElementById('editPersonalInfoBtn');

    const isReadOnly = fullNameDisplay.readOnly;

    if (isReadOnly) {
        // Enable editing
        fullNameDisplay.readOnly = false;
        emailDisplay.readOnly = false;
        phoneDisplay.readOnly = false;
        editBtn.textContent = '✓ Done Editing';
        editBtn.style.backgroundColor = '#28a745';
        settingsChanged = true;
    } else {
        // Disable editing
        fullNameDisplay.readOnly = true;
        emailDisplay.readOnly = true;
        phoneDisplay.readOnly = true;
        editBtn.textContent = '✏️ Edit Personal Information';
        editBtn.style.backgroundColor = '';
    }
}

// Save personal information
async function savePersonalInfo() {
    try {
        const fullName = document.getElementById('fullNameDisplay').value;
        const email = document.getElementById('emailDisplay').value;
        const phone = document.getElementById('phoneDisplay').value;

        // Validation
        if (!fullName || !email) {
            showToast('Full name and email are required', 'error');
            return;
        }

        if (!email.includes('@')) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

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
            showToast(error.message || 'Failed to update profile', 'error');
            return;
        }

        currentUser = await response.json();
        showToast('Profile updated successfully!', 'success');
        settingsChanged = false;
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Error updating profile', 'error');
    }
}

// Cancel editing
function cancelEdit() {
    populateUserData();
    toggleEditPersonalInfo();
    settingsChanged = false;
}

// Show password change form
function showPasswordChangeForm() {
    const passwordFormContainer = document.getElementById('passwordFormContainer');
    const passwordActionContainer = document.getElementById('passwordActionContainer');
    
    if (passwordFormContainer) {
        passwordFormContainer.style.display = 'block';
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

    // Clear form
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

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

    try {
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
            showToast(error.message || 'Failed to change password', 'error');
            return;
        }

        showToast('✅ Password changed successfully! Old password is now invalid.', 'success');
        hidePasswordChangeForm();
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = '/login';
        }, 2000);
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Error changing password', 'error');
    }
}

// Toggle dark mode
function toggleDarkMode(e) {
    const isDarkMode = e.target.checked;
    localStorage.setItem('darkMode', isDarkMode);
    
    if (isDarkMode) {
        document.body.style.backgroundColor = '#1a1a1a';
        document.body.style.color = '#ffffff';
        document.body.classList.add('dark-mode');
        showToast('Dark mode enabled', 'success');
    } else {
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#000000';
        document.body.classList.remove('dark-mode');
        showToast('Dark mode disabled', 'info');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out;
    `;

    if (type === 'success') {
        toast.style.backgroundColor = '#28a745';
        toast.innerHTML = `<span>✓</span><span>${message}</span>`;
    } else if (type === 'error') {
        toast.style.backgroundColor = '#dc3545';
        toast.innerHTML = `<span>✕</span><span>${message}</span>`;
    } else if (type === 'info') {
        toast.style.backgroundColor = '#17a2b8';
        toast.innerHTML = `<span>ℹ</span><span>${message}</span>`;
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
