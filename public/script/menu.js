// Menu Database (as provided) - Keep this section exactly as is
const menuDatabase = {
    'Rice': [
        { name: 'Korean Spicy Bulgogi (Pork)', unit: 'plate', defaultPrice: 180 },
        { name: 'Korean Salt and Pepper (Pork)', unit: 'plate', defaultPrice: 175 },
        { name: 'Crisky Pork Lechon Kawali', unit: 'plate', defaultPrice: 165 },
        { name: 'Cream Dory Fish Fillet', unit: 'plate', defaultPrice: 160 },
        { name: 'Buttered Honey Chicken', unit: 'plate', defaultPrice: 155 },
        { name: 'Buttered Spicy Chicken', unit: 'plate', defaultPrice: 155 },
        { name: 'Chicken Adobo', unit: 'plate', defaultPrice: 145 },
        { name: 'Pork Shanghai', unit: 'plate', defaultPrice: 140 }
    ],
    'Sizzling': [
        { name: 'Sizzling Pork Sisig', unit: 'sizzling plate', defaultPrice: 220 },
        { name: 'Sizzling Liempo', unit: 'sizzling plate', defaultPrice: 210 },
        { name: 'Sizzling Porkchop', unit: 'sizzling plate', defaultPrice: 195 },
        { name: 'Sizzling Fried Chicken', unit: 'sizzling plate', defaultPrice: 185 }
    ],
    'Party': [
        { name: 'Pancit Bihon (S)', unit: 'tray', defaultPrice: 350 },
        { name: 'Pancit Bihon (M)', unit: 'tray', defaultPrice: 550 },
        { name: 'Pancit Bihon (L)', unit: 'tray', defaultPrice: 750 },
        { name: 'Pancit Canton (S)', unit: 'tray', defaultPrice: 380 },
        { name: 'Pancit Canton (M)', unit: 'tray', defaultPrice: 580 },
        { name: 'Pancit Canton (L)', unit: 'tray', defaultPrice: 780 },
        { name: 'Spaghetti (S)', unit: 'tray', defaultPrice: 400 },
        { name: 'Spaghetti (M)', unit: 'tray', defaultPrice: 600 },
        { name: 'Spaghetti (L)', unit: 'tray', defaultPrice: 800 }
    ],
    'Drink': [
        { name: 'Cucumber Lemonade (Glass)', unit: 'glass', defaultPrice: 60 },
        { name: 'Cucumber Lemonade (Pitcher)', unit: 'pitcher', defaultPrice: 180 },
        { name: 'Blue Lemonade (Glass)', unit: 'glass', defaultPrice: 65 },
        { name: 'Blue Lemonade (Pitcher)', unit: 'pitcher', defaultPrice: 190 },
        { name: 'Red Tea (Glass)', unit: 'glass', defaultPrice: 55 },
        { name: 'Soda (Mismo)', unit: 'bottle', defaultPrice: 25 },
        { name: 'Soda 1.5L', unit: 'bottle', defaultPrice: 65 }
    ],
    'Cafe': [
        { name: 'Cafe Americano Tall', unit: 'cup', defaultPrice: 80 },
        { name: 'Cafe Americano Grande', unit: 'cup', defaultPrice: 95 },
        { name: 'Cafe Latte Tall', unit: 'cup', defaultPrice: 90 },
        { name: 'Cafe Latte Grande', unit: 'cup', defaultPrice: 105 },
        { name: 'Caramel Macchiato Tall', unit: 'cup', defaultPrice: 100 },
        { name: 'Caramel Macchiato Grande', unit: 'cup', defaultPrice: 115 }
    ],
    'Milk': [
        { name: 'Milk Tea Regular HC', unit: 'cup', defaultPrice: 85 },
        { name: 'Milk Tea Regular MC', unit: 'cup', defaultPrice: 95 },
        { name: 'Matcha Green Tea HC', unit: 'cup', defaultPrice: 90 },
        { name: 'Matcha Green Tea MC', unit: 'cup', defaultPrice: 100 }
    ],
    'Frappe': [
        { name: 'Matcha Green Tea HC', unit: 'cup', defaultPrice: 120 },
        { name: 'Matcha Green Tea MC', unit: 'cup', defaultPrice: 135 },
        { name: 'Cookies & Cream HC', unit: 'cup', defaultPrice: 125 },
        { name: 'Cookies & Cream MC', unit: 'cup', defaultPrice: 140 },
        { name: 'Strawberry & Cream HC', unit: 'cup', defaultPrice: 130 },
        { name: 'Mango cheese cake HC', unit: 'cup', defaultPrice: 135 }
    ],
    'Snack & Appetizer': [
        { name: 'Cheesy Nachos', unit: 'serving', defaultPrice: 150 },
        { name: 'Nachos Supreme', unit: 'serving', defaultPrice: 180 },
        { name: 'French fries', unit: 'serving', defaultPrice: 90 },
        { name: 'Clubhouse Sandwich', unit: 'sandwich', defaultPrice: 120 },
        { name: 'Fish and Fries', unit: 'serving', defaultPrice: 160 },
        { name: 'Cheesy Dynamite Lumpia', unit: 'piece', defaultPrice: 25 },
        { name: 'Lumpiang Shanghai', unit: 'piece', defaultPrice: 20 }
    ],
    'Budget Meals Served with Rice': [
        { name: 'Fried Chicken', unit: 'meal', defaultPrice: 95 },
        { name: 'Buttered Honey Chicken', unit: 'meal', defaultPrice: 105 },
        { name: 'Buttered Spicy Chicken', unit: 'meal', defaultPrice: 105 },
        { name: 'Tinapa Rice', unit: 'meal', defaultPrice: 85 },
        { name: 'Tuyo Pesto', unit: 'meal', defaultPrice: 80 },
        { name: 'Fried Rice', unit: 'serving', defaultPrice: 50 },
        { name: 'Plain Rice', unit: 'bowl', defaultPrice: 25 }
    ],
    'Specialties': [
        { name: 'Sinigang (PORK)', unit: 'serving', defaultPrice: 280 },
        { name: 'Sinigang (Shrimp)', unit: 'serving', defaultPrice: 320 },
        { name: 'Paknet (Pakbet w/ Bagnet)', unit: 'serving', defaultPrice: 260 },
        { name: 'Buttered Shrimp', unit: 'serving', defaultPrice: 300 },
        { name: 'Special Bulalo (good for 2-3 Persons)', unit: 'pot', defaultPrice: 450 },
        { name: 'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)', unit: 'pot', defaultPrice: 850 }
    ],
    'packaging': [
        { name: 'Paper Cups (12oz)', unit: 'pack', defaultPrice: 250 },
        { name: 'Paper Cups (16oz)', unit: 'pack', defaultPrice: 280 },
        { name: 'Straws (Regular)', unit: 'pack', defaultPrice: 120 },
        { name: 'Straws (Boba)', unit: 'pack', defaultPrice: 150 },
        { name: 'Food Containers (Small)', unit: 'pack', defaultPrice: 180 },
        { name: 'Food Containers (Medium)', unit: 'pack', defaultPrice: 220 },
        { name: 'Food Containers (Large)', unit: 'pack', defaultPrice: 260 },
        { name: 'Plastic Utensils Set', unit: 'set', defaultPrice: 85 },
        { name: 'Napkins (Pack of 50)', unit: 'pack', defaultPrice: 75 }
    ]
};

// Category to display name mapping
const categoryDisplayNames = {
    'Rice': 'Rice Bowl Meals',
    'Sizzling': 'Hot Sizzlers',
    'Party': 'Party Trays',
    'Drink': 'Drinks',
    'Cafe': 'Coffee',
    'Milk': 'Milk Tea',
    'Frappe': 'Frappe',
    'Snack & Appetizer': 'Snacks & Appetizers',
    'Budget Meals Served with Rice': 'Budget Meals',
    'Specialties': 'Specialties',
    'packaging': 'Packaging'
};

// Category-specific units mapping
const categoryUnitsMapping = {
    'Rice': ['plate', 'serving'],
    'Sizzling': ['sizzling plate', 'plate'],
    'Party': ['tray'],
    'Drink': ['glass', 'cup', 'pitcher', 'bottle'],
    'Cafe': ['cup', 'glass'],
    'Milk': ['cup', 'glass'],
    'Frappe': ['cup', 'glass'],
    'Snack & Appetizer': ['serving', 'piece', 'sandwich'],
    'Budget Meals Served with Rice': ['meal', 'bowl'],
    'Specialties': ['serving', 'pot'],
    'packaging': ['pack', 'set', 'box', 'bag']
};

// Unit display labels
const unitDisplayLabels = {
    'plate': 'Plate',
    'plates': 'Plates',
    'sizzling plate': 'Sizzling Plate',
    'tray': 'Tray',
    'trays': 'Trays',
    'glass': 'Glass',
    'glasses': 'Glasses',
    'cup': 'Cup',
    'cups': 'Cups',
    'pitcher': 'Pitcher',
    'pitchers': 'Pitchers',
    'bottle': 'Bottle',
    'bottles': 'Bottles',
    'serving': 'Serving',
    'servings': 'Servings',
    'meal': 'Meal',
    'meals': 'Meals',
    'bowl': 'Bowl',
    'bowls': 'Bowls',
    'sandwich': 'Sandwich',
    'sandwiches': 'Sandwiches',
    'piece': 'Piece',
    'pieces': 'Pieces',
    'pot': 'Pot',
    'pots': 'Pots',
    'pack': 'Pack',
    'packs': 'Packs',
    'set': 'Set',
    'sets': 'Sets',
    'box': 'Box',
    'boxes': 'Boxes',
    'bag': 'Bag',
    'bags': 'Bags'
};

// ==================== GLOBAL VARIABLES ====================
let allMenuItems = [];
let notifications = [];
let notificationCount = 0;
let isNotificationModalOpen = false;
let hasNewNotifications = false;
let currentSection = 'dashboard';
let currentCategory = 'all';
let isModalOpen = false;

// ==================== DOM ELEMENTS CACHE ====================
const elements = {
    itemModal: document.getElementById('itemModal'),
    modalTitle: document.getElementById('modalTitle'),
    itemForm: document.getElementById('itemForm'),
    closeModal: document.getElementById('closeModal'),
    itemId: document.getElementById('itemId'),
    itemName: document.getElementById('itemName'),
    itemCategory: document.getElementById('itemCategories'),
    itemUnit: document.getElementById('itemUnit'),
    currentStock: document.getElementById('currentStock'),
    minimumStock: document.getElementById('minimumStock'),
    maximumStock: document.getElementById('maximumStock'),
    itemPrice: document.getElementById('itemPrice'),
    addNewItem: document.getElementById('addNewItem'),
    saveItemBtn: document.querySelector('.modal-footer .btn-primary'),
    cancelBtn: document.querySelector('.modal-footer .btn-secondary'),
    navLinks: document.querySelectorAll('.nav-link[data-section]'),
    categoryItems: document.querySelectorAll('.category-item[data-category]'),
    menuGrid: document.getElementById('menuGrid'),
    dashboardGrid: document.getElementById('dashboardGrid'),
    totalProducts: document.getElementById('totalProducts'),
    lowStock: document.getElementById('lowStock'),
    outOfStock: document.getElementById('outOfStock'),
    menuValue: document.getElementById('menuValue'),
    totalMenuItems: document.getElementById('totalMenuItems'),
    currentCategoryTitle: document.getElementById('currentCategoryTitle'),
    sendStockModal: document.getElementById('sendStockModal'),
    sendStockToStaffBtn: document.getElementById('sendStockToStaffBtn'),
    closeSendStockModal: document.getElementById('closeSendStockModal'),
    cancelSendStockBtn: document.getElementById('cancelSendStockBtn'),
    confirmSendStockBtn: document.getElementById('confirmSendStockBtn'),
    stockProduct: document.getElementById('stockProduct'),
    stockQuantity: document.getElementById('stockQuantity'),
    availableStock: document.getElementById('availableStock'),
    transferDate: document.getElementById('transferDate'),
    transferNotes: document.getElementById('transferNotes')
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Menu Management System initializing...');
    
    // Initialize notification system
    addNotificationStyles();
    initializeNotificationSystem();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Fetch initial data
    fetchMenuItems();
    
    // Set up auto-refresh
    setInterval(fetchMenuItems, 30000);
    
    console.log('✅ System initialized');
});

// ==================== NOTIFICATION SYSTEM ====================
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            font-size: 11px;
            font-weight: bold;
            border-radius: 50%;
            min-width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

function initializeNotificationSystem() {
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notificationContainer';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        width: 350px;
        max-height: 500px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        z-index: 1000;
        display: none;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid #ddd;
    `;
    
    const notificationHeader = document.createElement('div');
    notificationHeader.style.cssText = `
        padding: 15px;
        background: #f8f9fa;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const headerTitle = document.createElement('h3');
    headerTitle.textContent = 'Notifications';
    headerTitle.style.cssText = `margin: 0; font-size: 16px; font-weight: 600; color: #333;`;
    
    const clearAllBtn = document.createElement('button');
    clearAllBtn.textContent = 'Clear All';
    clearAllBtn.style.cssText = `
        background: none;
        border: none;
        color: #dc3545;
        cursor: pointer;
        font-size: 14px;
        padding: 5px 10px;
        border-radius: 4px;
    `;
    clearAllBtn.addEventListener('click', clearAllNotifications);
    
    notificationHeader.appendChild(headerTitle);
    notificationHeader.appendChild(clearAllBtn);
    
    const notificationList = document.createElement('div');
    notificationList.id = 'notificationList';
    notificationList.style.cssText = `flex: 1; overflow-y: auto; max-height: 400px;`;
    
    const emptyState = document.createElement('div');
    emptyState.id = 'notificationEmptyState';
    emptyState.style.cssText = `padding: 30px 20px; text-align: center; color: #666;`;
    emptyState.innerHTML = `<div style="font-size: 48px; margin-bottom: 10px;">📭</div><p style="margin: 0;">No notifications yet</p>`;
    notificationList.appendChild(emptyState);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
        padding: 10px;
        background: #f8f9fa;
        border: none;
        border-top: 1px solid #ddd;
        cursor: pointer;
        color: #333;
        font-size: 14px;
    `;
    closeBtn.addEventListener('click', toggleNotificationModal);
    
    notificationContainer.appendChild(notificationHeader);
    notificationContainer.appendChild(notificationList);
    notificationContainer.appendChild(closeBtn);
    
    document.body.appendChild(notificationContainer);
    
    // Add notification button to navbar
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        const notificationNavItem = document.createElement('li');
        notificationNavItem.style.cssText = `position: relative;`;
        
        const notificationBtn = document.createElement('a');
        notificationBtn.href = '#';
        notificationBtn.className = 'nav-link';
        notificationBtn.innerHTML = `
            <span>Notifications</span>
            <span id="notificationBadge" class="notification-badge" style="display: none;">0</span>
        `;
        notificationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleNotificationModal();
        });
        
        notificationNavItem.appendChild(notificationBtn);
        navLinks.appendChild(notificationNavItem);
    }
}

function toggleNotificationModal() {
    const notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) return;
    
    if (isNotificationModalOpen) {
        notificationContainer.style.display = 'none';
        isNotificationModalOpen = false;
    } else {
        notificationContainer.style.display = 'flex';
        isNotificationModalOpen = true;
        hasNewNotifications = false;
        updateNotificationBadge();
        
        notifications.forEach(notification => {
            notification.read = true;
        });
    }
}

function addNotification(productName, message) {
    const notification = {
        id: Date.now(),
        productName: productName,
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        read: false
    };
    
    notifications.unshift(notification);
    hasNewNotifications = true;
    updateNotificationBadge();
    renderNotifications();
    
    showToast(`New notification: ${productName} is out of stock`, 'warning');
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    notificationCount = unreadCount;
    
    if (notificationCount > 0) {
        badge.textContent = notificationCount > 99 ? '99+' : notificationCount;
        badge.style.display = 'inline-block';
        
        if (hasNewNotifications && !isNotificationModalOpen) {
            badge.style.animation = 'pulse 1s infinite';
        } else {
            badge.style.animation = 'none';
        }
    } else {
        badge.style.display = 'none';
    }
}

function renderNotifications() {
    const notificationList = document.getElementById('notificationList');
    const emptyState = document.getElementById('notificationEmptyState');
    
    if (!notificationList) return;
    
    notificationList.innerHTML = '';
    
    if (notifications.length === 0) {
        notificationList.appendChild(emptyState);
        return;
    }
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.style.cssText = `
            padding: 15px;
            border-bottom: 1px solid #eee;
            background: ${!notification.read ? '#fff8e1' : 'white'};
            cursor: pointer;
            transition: background 0.2s;
        `;
        
        notificationItem.addEventListener('click', () => {
            notification.read = true;
            updateNotificationBadge();
            renderNotifications();
        });
        
        const productName = document.createElement('div');
        productName.style.cssText = `font-weight: 600; color: #333; margin-bottom: 5px; font-size: 14px;`;
        productName.textContent = notification.productName;
        
        const message = document.createElement('div');
        message.style.cssText = `color: #666; font-size: 13px; margin-bottom: 5px;`;
        message.textContent = notification.message;
        
        const timestamp = document.createElement('div');
        timestamp.style.cssText = `color: #999; font-size: 12px; display: flex; justify-content: space-between;`;
        timestamp.innerHTML = `
            <span>${notification.date} ${notification.timestamp}</span>
            ${!notification.read ? '<span style="color: #ff9800;">●</span>' : ''}
        `;
        
        notificationItem.appendChild(productName);
        notificationItem.appendChild(message);
        notificationItem.appendChild(timestamp);
        
        notificationList.appendChild(notificationItem);
    });
}

function clearAllNotifications() {
    if (notifications.length === 0) return;
    
    if (confirm('Clear all notifications?')) {
        notifications = [];
        notificationCount = 0;
        hasNewNotifications = false;
        updateNotificationBadge();
        renderNotifications();
    }
}

function checkOutOfStockItems() {
    if (!allMenuItems || allMenuItems.length === 0) return;
    
    const outOfStockItems = allMenuItems.filter(item => item.currentStock === 0);
    
    outOfStockItems.forEach(item => {
        const recentNotification = notifications.find(n => 
            n.productName === (item.name || item.itemName) && 
            n.message.includes('out of stock') &&
            (Date.now() - n.id) < 3600000
        );
        
        if (!recentNotification) {
            addNotification(
                item.name || item.itemName,
                'Out of stock'
            );
        }
    });
}

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Add new item button
    if (elements.addNewItem) {
        elements.addNewItem.addEventListener('click', openAddModal);
    }
    
    // Save item button
    if (elements.saveItemBtn) {
        elements.saveItemBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await handleSaveItem();
        });
    }
    
    // Cancel and close modal buttons
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', closeModal);
    }
    
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeModal);
    }
    
    // Category change listener
    if (elements.itemCategory) {
        elements.itemCategory.addEventListener('change', updateFromCategory);
    }
    
    // Product name change listener
    if (elements.itemName) {
        elements.itemName.addEventListener('change', updateFromItemNameSelect);
    }
    
    // Modal overlay click
    if (elements.itemModal) {
        elements.itemModal.addEventListener('click', (e) => {
            if (e.target === elements.itemModal) {
                closeModal();
            }
        });
    }
    
    // Form submit
    if (elements.itemForm) {
        elements.itemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSaveItem();
        });
    }
    
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Category filter
    elements.categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = item.getAttribute('data-category');
            const fullname = item.getAttribute('data-fullname');
            filterByCategory(category, fullname);
        });
    });
    
    // Send stock functionality
    if (elements.sendStockToStaffBtn) {
        elements.sendStockToStaffBtn.addEventListener('click', openSendStockModal);
    }
    
    if (elements.closeSendStockModal) {
        elements.closeSendStockModal.addEventListener('click', closeSendStockModal);
    }
    
    if (elements.cancelSendStockBtn) {
        elements.cancelSendStockBtn.addEventListener('click', closeSendStockModal);
    }
    
    if (elements.confirmSendStockBtn) {
        elements.confirmSendStockBtn.addEventListener('click', handleSendStock);
    }
    
    if (elements.stockProduct) {
        elements.stockProduct.addEventListener('change', updateStockTransferSummary);
    }
    
    if (elements.stockQuantity) {
        elements.stockQuantity.addEventListener('input', updateStockTransferSummary);
    }
    
    if (elements.transferDate) {
        const today = new Date().toISOString().split('T')[0];
        elements.transferDate.value = today;
        elements.transferDate.addEventListener('change', updateStockTransferSummary);
    }
    
    // Add logout listener if exists
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// ==================== HELPER FUNCTIONS ====================
function getUnitFromItem(itemName, category) {
    for (const cat in menuDatabase) {
        const foundItem = menuDatabase[cat].find(item => item.name === itemName);
        if (foundItem) {
            return foundItem.unit;
        }
    }
    
    const defaultUnits = {
        'Rice': 'plate',
        'Sizzling': 'sizzling plate',
        'Party': 'tray',
        'Drink': 'glass',
        'Cafe': 'cup',
        'Milk': 'cup',
        'Frappe': 'cup',
        'Snack & Appetizer': 'serving',
        'Budget Meals Served with Rice': 'meal',
        'Specialties': 'serving',
        'packaging': 'pack'
    };
    
    return defaultUnits[category] || 'unit';
}

function getDefaultPrice(itemName) {
    for (const category in menuDatabase) {
        const foundItem = menuDatabase[category].find(item => item.name === itemName);
        if (foundItem) {
            return foundItem.defaultPrice;
        }
    }
    return 0;
}

function getCategoryDisplayName(category) {
    return categoryDisplayNames[category] || category;
}

function populateItemNamesByCategory(category = null) {
    const itemNameSelect = elements.itemName;
    if (!itemNameSelect) return;
    
    itemNameSelect.innerHTML = '<option value="">Select Product</option>';
    
    if (!category) return;
    
    const categoryItems = menuDatabase[category] || [];
    const sortedItems = [...categoryItems].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        option.dataset.unit = item.unit;
        option.dataset.price = item.defaultPrice;
        itemNameSelect.appendChild(option);
    });
}

function updateFromItemNameSelect() {
    const itemName = elements.itemName.value;
    const selectedOption = elements.itemName.options[elements.itemName.selectedIndex];
    
    if (!itemName || itemName.trim() === '') {
        if (elements.itemUnit) elements.itemUnit.value = '';
        if (elements.itemPrice) elements.itemPrice.value = '';
        return;
    }
    
    const unit = selectedOption.dataset.unit;
    const price = selectedOption.dataset.price;
    
    if (unit && elements.itemUnit) {
        elements.itemUnit.value = unit;
    }
    
    if (price && elements.itemPrice) {
        elements.itemPrice.value = price;
    }
}

function updateFromCategory() {
    const category = elements.itemCategory.value;
    
    if (!category) {
        if (elements.itemName) {
            elements.itemName.innerHTML = '<option value="">Select Product</option>';
        }
        if (elements.itemUnit) elements.itemUnit.value = '';
        if (elements.itemPrice) elements.itemPrice.value = '';
        return;
    }
    
    updateUnitOptions(category);
    populateItemNamesByCategory(category);
    
    if (elements.itemName) elements.itemName.value = '';
    if (elements.itemUnit) elements.itemUnit.value = '';
    if (elements.itemPrice) elements.itemPrice.value = '';
}

function updateUnitOptions(category) {
    const unitSelect = elements.itemUnit;
    if (!unitSelect) return;
    
    const availableUnits = categoryUnitsMapping[category] || ['pcs'];
    const currentUnit = unitSelect.value;
    
    unitSelect.innerHTML = '<option value="">Select Unit</option>';
    
    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unitDisplayLabels[unit] || unit.charAt(0).toUpperCase() + unit.slice(1);
        unitSelect.appendChild(option);
    });
    
    if (currentUnit && availableUnits.includes(currentUnit)) {
        unitSelect.value = currentUnit;
    } else if (availableUnits.length > 0) {
        const defaultUnits = {
            'Rice': 'plate',
            'Sizzling': 'sizzling plate',
            'Party': 'tray',
            'Drink': 'glass',
            'Cafe': 'cup',
            'Milk': 'cup',
            'Frappe': 'cup',
            'Snack & Appetizer': 'serving',
            'Budget Meals Served with Rice': 'meal',
            'Specialties': 'serving',
            'packaging': 'pack'
        };
        
        unitSelect.value = defaultUnits[category] || availableUnits[0];
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₱0.00';
    }
    
    const numAmount = parseFloat(amount);
    return '₱' + numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// ==================== FIXED DELETE FUNCTION ====================
async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    const deleteBtn = event.target;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = 'Deleting...';
    deleteBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/menu/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                showToast('Product deleted successfully!', 'success');
                
                // Remove from local array
                allMenuItems = allMenuItems.filter(item => item._id !== itemId);
                
                // Update UI
                updateAllUIComponents();
            } else {
                throw new Error(data.message);
            }
        } else {
            throw new Error(`Failed to delete: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        showToast('Failed to delete product. Please try again.', 'error');
    } finally {
        deleteBtn.textContent = originalText;
        deleteBtn.disabled = false;
    }
}

// ==================== UPDATED FETCH FUNCTION ====================
async function fetchMenuItems() {
    try {
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                allMenuItems = data.data;
                console.log('✅ Menu items loaded from API:', allMenuItems.length);
                
                // Update all UI components
                updateAllUIComponents();
            } else {
                throw new Error(data.message);
            }
        } else {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        showToast('Failed to load menu items from server', 'error');
        
        // Try to load from localStorage as backup
        try {
            const backup = localStorage.getItem('menuItems_backup');
            if (backup) {
                allMenuItems = JSON.parse(backup);
                console.log('✅ Menu items loaded from localStorage backup:', allMenuItems.length);
                updateAllUIComponents();
            }
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
        }
    }
}

// ==================== CORE FUNCTIONS ====================
function updateDashboardStats() {
    const totalItems = allMenuItems.length;
    const lowStockItems = allMenuItems.filter(item => item.currentStock <= item.minStock).length;
    const outOfStockItems = allMenuItems.filter(item => item.currentStock === 0).length;
    const menuValueTotal = allMenuItems.reduce((total, item) => {
        const price = item.price || 0;
        const stock = item.currentStock || 0;
        return total + (price * stock);
    }, 0);
    
    // Update dashboard stats
    if (elements.totalProducts) elements.totalProducts.textContent = formatNumber(totalItems);
    if (elements.lowStock) elements.lowStock.textContent = formatNumber(lowStockItems);
    if (elements.outOfStock) elements.outOfStock.textContent = formatNumber(outOfStockItems);
    if (elements.menuValue) elements.menuValue.textContent = formatCurrency(menuValueTotal);
    if (elements.totalMenuItems) elements.totalMenuItems.textContent = formatNumber(totalItems);
    
    // Check for out of stock notifications
    checkOutOfStockItems();
}

function showSection(section) {
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.remove('active-section');
    });
    
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active-section');
    }
    
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });
    
    currentSection = section;
    
    if (section === 'dashboard') {
        updateDashboardStats();
    }
}

function filterByCategory(category, fullname) {
    currentCategory = category;
    
    elements.categoryItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-category') === category) {
            item.classList.add('active');
        }
    });
    
    if (elements.currentCategoryTitle) {
        elements.currentCategoryTitle.textContent = fullname || 'Product Menu';
    }
    
    if (currentSection === 'menu') {
        renderMenuGrid();
    }
}

function renderMenuGrid() {
    if (!elements.menuGrid) return;
    
    let filteredItems = allMenuItems;
    
    if (currentCategory !== 'all') {
        filteredItems = allMenuItems.filter(item => item.category === currentCategory);
    }
    
    if (filteredItems.length === 0) {
        elements.menuGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Add products using the "Add New Product" button</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = filteredItems.map(item => {
        const itemPrice = item.price || 0;
        const itemValue = itemPrice * (item.currentStock || 0);
        const stockPercentage = ((item.currentStock / item.maxStock) * 100) || 0;
        
        let stockClass = '';
        if (item.currentStock === 0) {
            stockClass = 'out-of-stock';
        } else if (item.currentStock <= item.minStock) {
            stockClass = 'low-stock';
        }
        
        return `
        <div class="menu-card ${stockClass}">
            <div class="card-header">
                <h4>${item.name || item.itemName}</h4>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openEditModal('${item._id}')">Edit</button>
                    <button class="btn-icon delete" onclick="deleteMenuItem('${item._id}')">Delete</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Category:</span> ${getCategoryDisplayName(item.category)}
                </div>
                <div class="card-info">
                    <span class="label">Current Stock:</span> ${item.currentStock} ${unitDisplayLabels[item.unit] || item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Selling Price:</span> ₱${itemPrice.toFixed(2)}
                </div>
                <div class="card-info">
                    <span class="label">Stock Value:</span> ₱${itemValue.toFixed(2)}
                </div>
                <div class="card-info">
                    <span class="label">Min Stock:</span> ${item.minStock} ${unitDisplayLabels[item.unit] || item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Max Stock:</span> ${item.maxStock || 0} ${unitDisplayLabels[item.unit] || item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Stock Level:</span>
                    <div class="stock-progress">
                        <div class="progress-bar" style="width: ${Math.min(stockPercentage, 100)}%"></div>
                    </div>
                </div>
                <div class="card-info">
                    <span class="label">Status:</span>
                    <span class="status ${item.currentStock === 0 ? 'out-of-stock' : item.currentStock <= item.minStock ? 'low-stock' : 'in-stock'}">
                        ${item.currentStock === 0 ? 'Out of Stock' : item.currentStock <= item.minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.menuGrid.innerHTML = gridHTML;
}

function renderDashboardGrid() {
    if (!elements.dashboardGrid) return;
    
    const lowStockItems = allMenuItems.filter(item => item.currentStock <= item.minStock);
    const recentItems = lowStockItems.slice(0, 8);
    
    if (recentItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <h3>All products are well stocked!</h3>
                <p>No low stock items to display</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = recentItems.map(item => {
        const itemPrice = item.price || 0;
        const itemValue = itemPrice * (item.currentStock || 0);
        
        return `
        <div class="menu-card ${item.currentStock === 0 ? 'out-of-stock' : 'low-stock'}">
            <div class="card-header">
                <h4>${item.name || item.itemName}</h4>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Stock:</span> ${item.currentStock}/${item.maxStock || 0} ${unitDisplayLabels[item.unit] || item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Value:</span> ₱${itemValue.toFixed(2)}
                </div>
                <div class="card-info">
                    <span class="label">Min:</span> ${item.minStock} ${unitDisplayLabels[item.unit] || item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span>
                    <span class="status ${item.currentStock === 0 ? 'out-of-stock' : 'low-stock'}">
                        ${item.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.dashboardGrid.innerHTML = gridHTML;
}

function updateCategoryCounts() {
    const categories = {
        all: allMenuItems.length,
        Rice: allMenuItems.filter(item => item.category === 'Rice').length,
        Sizzling: allMenuItems.filter(item => item.category === 'Sizzling').length,
        Party: allMenuItems.filter(item => item.category === 'Party').length,
        Drink: allMenuItems.filter(item => item.category === 'Drink').length,
        Cafe: allMenuItems.filter(item => item.category === 'Cafe').length,
        Milk: allMenuItems.filter(item => item.category === 'Milk').length,
        Frappe: allMenuItems.filter(item => item.category === 'Frappe').length,
        'Snack & Appetizer': allMenuItems.filter(item => item.category === 'Snack & Appetizer').length,
        'Budget Meals Served with Rice': allMenuItems.filter(item => item.category === 'Budget Meals Served with Rice').length,
        Specialties: allMenuItems.filter(item => item.category === 'Specialties').length,
        packaging: allMenuItems.filter(item => item.category === 'packaging').length
    };
    
    elements.categoryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        const countElement = item.querySelector('.category-count');
        if (countElement && categories[category] !== undefined) {
            countElement.textContent = categories[category];
        }
    });
}

// ==================== MODAL FUNCTIONS ====================
function openAddModal() {
    if (isModalOpen) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Product';
    if (elements.itemForm) elements.itemForm.reset();
    if (elements.itemId) elements.itemId.value = '';
    
    // Set default values
    if (elements.currentStock) elements.currentStock.value = '0';
    if (elements.minimumStock) elements.minimumStock.value = '20';
    if (elements.maximumStock) elements.maximumStock.value = '200';
    if (elements.itemPrice) elements.itemPrice.value = '';
    
    // Reset category and unit
    if (elements.itemCategory) {
        elements.itemCategory.value = '';
        updateFromCategory();
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemCategory) elements.itemCategory.focus();
    }, 10);
}

async function openEditModal(itemId) {
    if (isModalOpen) return;
    
    const item = allMenuItems.find(i => i._id === itemId);
    if (!item) {
        showToast('Product not found', 'error');
        return;
    }
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Product';
    if (elements.itemId) elements.itemId.value = item._id;
    
    // Set category first, then populate other fields
    if (elements.itemCategory) {
        elements.itemCategory.value = item.category;
        updateUnitOptions(item.category);
        populateItemNamesByCategory(item.category);
    }
    
    // Set values after a short delay to ensure dropdowns are populated
    setTimeout(() => {
        if (elements.itemName) {
            elements.itemName.value = item.name || item.itemName || '';
        }
        
        if (elements.itemUnit) {
            elements.itemUnit.value = item.unit || '';
        }
        
        if (elements.itemPrice) {
            elements.itemPrice.value = item.price || '';
        }
        
        if (elements.currentStock) {
            elements.currentStock.value = item.currentStock || 0;
        }
        
        if (elements.minimumStock) {
            elements.minimumStock.value = item.minStock || 20;
        }
        
        if (elements.maximumStock) {
            elements.maximumStock.value = item.maxStock || 200;
        }
    }, 100);
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemName) elements.itemName.focus();
    }, 10);
}

function closeModal() {
    if (elements.itemModal) {
        elements.itemModal.classList.remove('show');
        setTimeout(() => {
            elements.itemModal.style.display = 'none';
            isModalOpen = false;
        }, 150);
    }
}

// ==================== FIXED SAVE FUNCTION ====================
async function handleSaveItem() {
    // Get form data
    const formData = {
        itemId: elements.itemId ? elements.itemId.value : '',
        itemName: elements.itemName ? elements.itemName.value.trim() : '',
        category: elements.itemCategory ? elements.itemCategory.value : '',
        unit: elements.itemUnit ? elements.itemUnit.value : '',
        currentStock: elements.currentStock ? parseInt(elements.currentStock.value) || 0 : 0,
        minStock: elements.minimumStock ? parseInt(elements.minimumStock.value) || 20 : 20,
        maxStock: elements.maximumStock ? parseInt(elements.maximumStock.value) || 200 : 200,
        price: elements.itemPrice ? parseFloat(elements.itemPrice.value) || 0 : 0
    };
    
    // Validate required fields
    if (!formData.itemName) {
        showToast('Please select a product', 'error');
        return;
    }
    
    if (!formData.category) {
        showToast('Please select a category', 'error');
        return;
    }
    
    if (!formData.unit) {
        showToast('Please select a unit', 'error');
        return;
    }
    
    if (!formData.price || formData.price <= 0) {
        showToast('Please enter a valid price', 'error');
        return;
    }
    
    // Validate stock values
    if (formData.maxStock <= formData.minStock) {
        showToast('Maximum stock must be greater than minimum stock', 'error');
        return;
    }
    
    if (formData.currentStock > formData.maxStock) {
        showToast('Current stock cannot exceed maximum stock', 'error');
        return;
    }
    
    await saveMenuItem(formData);
}

async function saveMenuItem(itemData) {
    const isEdit = itemData.itemId && itemData.itemId.trim() !== '';
    
    // Disable save button during request
    const saveBtn = elements.saveItemBtn;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    try {
        const payload = {
            name: itemData.itemName,
            category: itemData.category,
            unit: itemData.unit,
            currentStock: itemData.currentStock,
            minStock: itemData.minStock,
            maxStock: itemData.maxStock,
            price: itemData.price,
            itemType: 'finished',
            isActive: true
        };
        
        let url, method;
        
        if (isEdit) {
            url = `/api/menu/${itemData.itemId}`;
            method = 'PUT';
        } else {
            url = '/api/menu';
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const action = isEdit ? 'updated' : 'added';
            showToast(`Product ${action} successfully!`, 'success');
            
            // Close modal
            closeModal();
            
            // Refresh data from server
            await fetchMenuItems();
            
        } else {
            throw new Error(data.message || 'Failed to save product');
        }
        
    } catch (error) {
        console.error('❌ Error saving product:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// ==================== STOCK TRANSFER FUNCTIONS ====================
function openSendStockModal() {
    if (allMenuItems.length === 0) {
        showToast('No products available to transfer', 'error');
        return;
    }
    
    populateStockTransferProducts();
    elements.sendStockModal.style.display = 'flex';
}

function closeSendStockModal() {
    elements.sendStockModal.style.display = 'none';
}

function populateStockTransferProducts() {
    if (!elements.stockProduct) return;
    
    elements.stockProduct.innerHTML = '<option value="">Select Product to Transfer</option>';
    
    allMenuItems.forEach(item => {
        if (item.currentStock > 0) {
            const option = document.createElement('option');
            option.value = item._id;
            const displayUnit = unitDisplayLabels[item.unit] || item.unit || '';
            option.textContent = `${item.name || item.itemName} (${item.currentStock} ${displayUnit} available)`;
            option.dataset.stock = item.currentStock;
            option.dataset.unit = item.unit || '';
            option.dataset.name = item.name || item.itemName;
            elements.stockProduct.appendChild(option);
        }
    });
}

function updateStockTransferSummary() {
    const productId = elements.stockProduct.value;
    const quantity = parseInt(elements.stockQuantity.value) || 0;
    const date = elements.transferDate.value;
    
    const productOption = elements.stockProduct.options[elements.stockProduct.selectedIndex];
    const availableStock = parseInt(productOption.dataset.stock) || 0;
    const unit = productOption.dataset.unit || '';
    const displayUnit = unitDisplayLabels[unit] || unit;
    
    if (elements.availableStock) {
        elements.availableStock.textContent = `${availableStock} ${displayUnit}`;
    }
    
    const summaryProduct = document.getElementById('summaryProduct');
    const summaryQuantity = document.getElementById('summaryQuantity');
    const summaryDate = document.getElementById('summaryDate');
    
    if (summaryProduct) {
        summaryProduct.textContent = productOption.dataset.name || 'Not selected';
    }
    
    if (summaryQuantity) {
        summaryQuantity.textContent = quantity > 0 ? `${quantity} ${displayUnit}` : '0';
    }
    
    if (summaryDate) {
        summaryDate.textContent = date || 'Not selected';
    }
}

async function handleSendStock() {
    const productId = elements.stockProduct.value;
    const quantity = parseInt(elements.stockQuantity.value) || 0;
    const date = elements.transferDate.value;
    const notes = elements.transferNotes.value;
    
    if (!productId) {
        showToast('Please select a product to transfer', 'error');
        return;
    }
    
    if (!quantity || quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }
    
    if (!date) {
        showToast('Please select a transfer date', 'error');
        return;
    }
    
    const productOption = elements.stockProduct.options[elements.stockProduct.selectedIndex];
    const availableStock = parseInt(productOption.dataset.stock) || 0;
    
    if (quantity > availableStock) {
        showToast(`Cannot transfer more than available stock (${availableStock})`, 'error');
        return;
    }
    
    const btn = elements.confirmSendStockBtn;
    const originalText = btn.textContent;
    btn.textContent = 'Transferring...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/menu/transfer-stock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity: quantity,
                date: date,
                notes: notes
            }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Stock transferred successfully!');
            closeSendStockModal();
            
            // Update local data
            const itemIndex = allMenuItems.findIndex(item => item._id === productId);
            if (itemIndex !== -1) {
                allMenuItems[itemIndex].currentStock -= quantity;
            }
            
            // Update UI
            updateAllUIComponents();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error transferring stock:', error);
        showToast('Failed to transfer stock', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// ==================== LOGOUT FUNCTION ====================
function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(() => {
        window.location.href = '/login';
    })
    .catch(error => {
        console.error('Logout error:', error);
        window.location.href = '/login';
    });
}

// ==================== UPDATE ALL UI COMPONENTS ====================
function updateAllUIComponents() {
    renderMenuGrid();
    renderDashboardGrid();
    updateCategoryCounts();
    updateDashboardStats();
    populateStockTransferProducts();
}

// ==================== GLOBAL EXPORTS ====================
window.handleLogout = handleLogout;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteMenuItem = deleteMenuItem;
window.handleSendStock = handleSendStock;
window.updateStockTransferSummary = updateStockTransferSummary;
window.toggleNotificationModal = toggleNotificationModal;
window.clearAllNotifications = clearAllNotifications;

console.log('✅ Menu Management System loaded successfully');