const menuDatabase = {
    'Rice': [
        { name: 'Korean Spicy Bulgogi (Pork)', unit: 'plate', defaultPrice: 180 },
        { name: 'Korean Salt and Pepper (Pork)', unit: 'plate', defaultPrice: 175 },
        { name: 'Crispy Pork Lechon Kawali', unit: 'plate', defaultPrice: 165 },
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

// Category-specific units mapping - organized as per your requirements
const categoryUnitsMapping = {
    'Rice': ['plate', 'serving'],                    // Rice Bowl Meals
    'Sizzling': ['sizzling plate', 'plate'],         // Hot Sizzlers
    'Party': ['tray'],                               // Party Trays
    'Drink': ['glass', 'cup', 'pitcher', 'bottle'],  // Drinks
    'Cafe': ['cup', 'glass'],                        // Coffee
    'Milk': ['cup', 'glass'],                        // Milk Tea
    'Frappe': ['cup', 'glass'],                      // Frappe
    'Snack & Appetizer': ['serving', 'piece', 'sandwich'], // Snacks & Appetizers
    'Budget Meals Served with Rice': ['meal', 'bowl'], // Budget Meals
    'Specialties': ['serving', 'pot'],               // Specialties
    'packaging': ['pack', 'set', 'box', 'bag']       // Packaging
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

function showLoading(message = 'Loading...') {
    hideLoading();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        color: white;
        font-size: 18px;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 20px;
    `;
    
    const loadingText = document.createElement('div');
    loadingText.textContent = message;
    loadingText.style.cssText = `
        margin-top: 10px;
        font-size: 16px;
    `;
    
    if (!document.getElementById('loadingSpinnerStyles')) {
        const style = document.createElement('style');
        style.id = 'loadingSpinnerStyles';
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(loadingText);
    document.body.appendChild(loadingOverlay);
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
            document.body.style.overflow = '';
        }, 300);
    }
}

function getUnitFromItem(itemName, category) {
    // First, look for the item in the menu database
    for (const cat in menuDatabase) {
        const foundItem = menuDatabase[cat].find(item => item.name === itemName);
        if (foundItem) {
            return foundItem.unit;
        }
    }
    
    // If not found, use default units based on category
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

// NEW FUNCTION: Populate product names based on selected category
function populateItemNamesByCategory(category = null) {
    const itemNameSelect = elements.itemName;
    if (!itemNameSelect) return;
    
    // Clear existing options
    itemNameSelect.innerHTML = '<option value="">Select Product</option>';
    
    // If no category selected, leave it empty
    if (!category) return;
    
    // Get items from the selected category
    const categoryItems = menuDatabase[category] || [];
    
    // Sort items alphabetically
    const sortedItems = [...categoryItems].sort((a, b) => a.name.localeCompare(b.name));
    
    // Populate dropdown
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        option.dataset.unit = item.unit;
        option.dataset.price = item.defaultPrice;
        itemNameSelect.appendChild(option);
    });
}

// UPDATED: Update form when product name is selected
function updateFromItemNameSelect() {
    const itemName = elements.itemName.value;
    const selectedOption = elements.itemName.options[elements.itemName.selectedIndex];
    
    if (!itemName || itemName.trim() === '') {
        // Clear fields if no item selected
        if (elements.itemUnit) elements.itemUnit.value = '';
        if (elements.itemPrice) elements.itemPrice.value = '';
        return;
    }
    
    // Get data from the selected option
    const unit = selectedOption.dataset.unit;
    const price = selectedOption.dataset.price;
    
    // Update unit
    if (unit && elements.itemUnit) {
        elements.itemUnit.value = unit;
    }
    
    // Update price
    if (price && elements.itemPrice) {
        elements.itemPrice.value = price;
    }
}

function updateFromCategory() {
    const category = elements.itemCategory.value;
    
    if (!category) {
        // Clear product names if no category selected
        if (elements.itemName) {
            elements.itemName.innerHTML = '<option value="">Select Product</option>';
        }
        // Clear unit and price
        if (elements.itemUnit) elements.itemUnit.value = '';
        if (elements.itemPrice) elements.itemPrice.value = '';
        return;
    }
    
    // Update unit options based on category
    updateUnitOptions(category);
    
    // Populate product names for this category
    populateItemNamesByCategory(category);
    
    // Clear existing values
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
    
    // Try to keep the current unit if it's still valid
    if (currentUnit && availableUnits.includes(currentUnit)) {
        unitSelect.value = currentUnit;
    } else if (availableUnits.length > 0) {
        // Set default unit based on category
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

// UPDATED: Fix dashboard stats to include top selling products
async function fetchDashboardStats() {
    try {
        console.log('Fetching dashboard stats...');

        const response = await fetch('/api/dashboard/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            // If backend fails, use local data
            console.warn('Backend dashboard stats failed, using local data');
            updateDashboardStats(); // Use local stats
            return;
        }

        const data = await response.json();

        if (data.success) {
            // Merge with local product count
            const mergedStats = {
                ...data.data,
                totalProducts: allMenuItems.length, // Always use local count
                totalMenuItems: allMenuItems.length
            };
            
            updateDashboardDisplay(mergedStats);
            console.log('Dashboard stats updated:', mergedStats);
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showToast('Failed to load dashboard data', 'error');
        
        // Always fallback to local data
        updateDashboardStats();
    }
}

// NEW FUNCTION: Update Top Selling Products display
function updateTopSellingProducts(topProducts) {
    const topSellingContainer = document.getElementById('topSellingProducts');
    if (!topSellingContainer) return;
    
    if (!topProducts || topProducts.length === 0) {
        topSellingContainer.innerHTML = `
            <div class="empty-state">
                <p>No sales data yet</p>
            </div>
        `;
        return;
    }
    
    // Limit to top 5 products
    const top5 = topProducts.slice(0, 5);
    
    const html = top5.map((product, index) => {
        return `
        <div class="top-product-item">
            <div class="product-rank">${index + 1}</div>
            <div class="product-info">
                <div class="product-name">${product.name || product.itemName}</div>
                <div class="product-stats">
                    <span class="sales-count">${product.totalSold || 0} sold</span>
                    <span class="sales-revenue">₱${(product.totalRevenue || 0).toFixed(2)}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    topSellingContainer.innerHTML = html;
}

// UPDATED: Fix updateDashboardDisplay to handle Top Selling Products
function updateDashboardDisplay(dashboardStats) {
    if (!dashboardStats) return;
    
    // Update basic stats from backend
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalCustomersEl = document.getElementById('totalCustomers');
    const totalRevenueEl = document.getElementById('totalRevenue');
    
    if (totalOrdersEl) totalOrdersEl.textContent = formatNumber(dashboardStats.totalOrders || 0);
    if (totalCustomersEl) totalCustomersEl.textContent = formatNumber(dashboardStats.totalCustomers || 0);
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(dashboardStats.totalRevenue || 0);
    
    // ALWAYS use local data for product-related stats
    updateDashboardStats();
    
    // CRITICAL: Update Top Selling Products if data is available
    if (dashboardStats.topSellingProducts && Array.isArray(dashboardStats.topSellingProducts)) {
        updateTopSellingProducts(dashboardStats.topSellingProducts);
    } else if (dashboardStats.topProducts && Array.isArray(dashboardStats.topProducts)) {
        // Alternative field name
        updateTopSellingProducts(dashboardStats.topProducts);
    }
    
    // Update today's orders
    updateTodaysOrdersDashboard();
}

// Helper function for number formatting
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

// Helper function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
}

// UPDATED: Fix saveMenuItem to update Top Selling Products
async function saveMenuItem(itemData, isEdit = false) {
    try {
        // Minimal validation
        if (!itemData.itemName || !itemData.category || !itemData.price) {
            showToast('Please provide name, category, and price', 'error');
            return { success: false, error: 'Required fields missing' };
        }
        
        // Quick validation for price
        const price = parseFloat(itemData.price);
        if (isNaN(price) || price < 1) {
            showToast('Price must be at least ₱1', 'error');
            return { success: false, error: 'Invalid price' };
        }
        
        const currentStock = parseInt(itemData.currentStock) || 0;
        const minStock = parseInt(itemData.minStock) || 20;
        const maxStock = parseInt(itemData.maxStock) || 200;
        
        if (maxStock <= minStock) {
            showToast('Maximum stock must be greater than minimum stock', 'error');
            return { success: false, error: 'Invalid stock range' };
        }
        
        const url = isEdit ? `/api/menu/${itemData.itemId}` : '/api/menu';
        const method = isEdit ? 'PUT' : 'POST';
        
        const payload = {
            itemName: itemData.itemName.trim(),
            name: itemData.itemName.trim(),
            category: itemData.category,
            unit: itemData.unit || 'pcs',
            currentStock: currentStock,
            minStock: minStock,
            maxStock: maxStock,
            price: price,
            itemType: 'finished',
            isActive: true
        };
        
        // Show quick saving indicator
        const saveBtn = elements.saveItemBtn;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        // Restore button state
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
        
        if (!response.ok) {
            throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'save'} product`);
        }
        
        if (data.success) {
            const action = isEdit ? 'updated' : 'added';
            showToast(`Product ${action} successfully!`, 'success');
            
            // Close modal immediately
            closeModal();
            
            // CRITICAL: Refresh ALL data including Top Selling Products
            setTimeout(() => {
                fetchMenuItems(); // This updates local product count
                fetchDashboardStats(); // This fetches updated Top Selling Products
            }, 100);
            
            return { success: true, data: data.data };
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    }
}

// UPDATED: Fix updateDashboardStats to properly update product counts
function updateDashboardStats() {
    const totalItems = allMenuItems.length;
    const lowStockItems = allMenuItems.filter(item => item.currentStock <= item.minStock).length;
    const outOfStockItems = allMenuItems.filter(item => item.currentStock === 0).length;
    const menuValueTotal = allMenuItems.reduce((total, item) => {
        const price = item.price || 0;
        const stock = item.currentStock || 0;
        return total + (price * stock);
    }, 0);
    
    // Update local stats - THIS FIXES THE TOTAL PRODUCTS = 0 ISSUE
    if (elements.totalProducts) elements.totalProducts.textContent = totalItems;
    if (elements.lowStock) elements.lowStock.textContent = lowStockItems;
    if (elements.outOfStock) elements.outOfStock.textContent = outOfStockItems;
    if (elements.menuValue) elements.menuValue.textContent = formatCurrency(menuValueTotal);
    
    // Also update totalMenuItems if element exists
    const totalMenuItemsEl = document.getElementById('totalMenuItems');
    if (totalMenuItemsEl) totalMenuItemsEl.textContent = totalItems;
}

// UPDATED: Add modal with immediate save capability
function openAddModal() {
    if (isModalOpen) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Product';
    if (elements.itemForm) elements.itemForm.reset();
    if (elements.itemId) elements.itemId.value = '';
    
    // Set default values for immediate saving
    if (elements.currentStock) elements.currentStock.value = '0';
    if (elements.minimumStock) elements.minimumStock.value = '20';
    if (elements.maximumStock) elements.maximumStock.value = '200';
    if (elements.itemPrice) elements.itemPrice.value = '0.00';
    
    // Reset category and unit
    if (elements.itemCategory) {
        elements.itemCategory.value = '';
    }
    
    if (elements.itemUnit) {
        elements.itemUnit.innerHTML = '<option value="">Select Unit</option>';
    }
    
    // Clear product names dropdown
    if (elements.itemName) {
        elements.itemName.innerHTML = '<option value="">Select Product</option>';
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemCategory) elements.itemCategory.focus();
    }, 10);
}

// UPDATED: Edit modal with immediate save capability
function openEditModal(itemId) {
    if (isModalOpen) return;
    
    const item = allMenuItems.find(i => i._id === itemId);
    if (!item) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Product';
    if (elements.itemId) elements.itemId.value = item._id;
    
    if (elements.itemCategory) {
        elements.itemCategory.value = item.category;
        // Update unit options based on category
        updateUnitOptions(item.category);
        // Populate product names for this category
        populateItemNamesByCategory(item.category);
    }
    
    if (elements.itemName) {
        // Set the item name after populating the dropdown
        setTimeout(() => {
            elements.itemName.value = item.name || item.itemName;
            // Trigger update to set unit and price
            updateFromItemNameSelect();
        }, 100);
    }
    
    if (elements.currentStock) {
        elements.currentStock.value = item.currentStock;
    }
    
    if (elements.minimumStock) {
        elements.minimumStock.value = item.minStock;
    }
    
    if (elements.maximumStock) {
        elements.maximumStock.value = item.maxStock;
    }
    
    // Price will be set by updateFromItemNameSelect
    if (elements.itemPrice) {
        elements.itemPrice.value = item.price || '';
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemName) elements.itemName.focus();
    }, 10);
}

const elements = {
    // Modal elements
    itemModal: document.getElementById('itemModal'),
    modalTitle: document.getElementById('modalTitle'),
    itemForm: document.getElementById('itemForm'),
    closeModal: document.getElementById('closeModal'),
    
    // Form elements
    itemId: document.getElementById('itemId'),
    itemName: document.getElementById('itemName'),
    itemCategory: document.getElementById('itemCategories'),
    itemUnit: document.getElementById('itemUnit'),
    currentStock: document.getElementById('currentStock'),
    minimumStock: document.getElementById('minimumStock'),
    maximumStock: document.getElementById('maximumStock'),
    itemPrice: document.getElementById('itemPrice'),
    
    // Buttons
    addNewItem: document.getElementById('addNewItem'),
    saveItemBtn: document.querySelector('.modal-footer .btn-primary'),
    cancelBtn: document.querySelector('.modal-footer .btn-secondary'),
    
    // Navigation
    navLinks: document.querySelectorAll('.nav-link[data-section]'),
    categoryItems: document.querySelectorAll('.category-item[data-category]'),
    
    // Grids
    menuGrid: document.getElementById('menuGrid'),
    dashboardGrid: document.getElementById('dashboardGrid'),
    
    // Stats
    totalProducts: document.getElementById('totalProducts'),
    lowStock: document.getElementById('lowStock'),
    outOfStock: document.getElementById('outOfStock'),
    menuValue: document.getElementById('menuValue'),
    
    // Category title
    currentCategoryTitle: document.getElementById('currentCategoryTitle'),
    
    // Send stock modal
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

let allMenuItems = [];
let currentSection = 'dashboard';
let currentCategory = 'all';
let isModalOpen = false;

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

function handleLogout() {
    showLoading("Logging out...");
    
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(() => {
        setTimeout(() => {
            hideLoading();
            window.location.href = '/login';
        }, 500);
    })
    .catch(error => {
        console.error('Logout error:', error);
        hideLoading();
        showToast('Logout failed', 'error');
        
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    fetchMenuItems();
    
    // Fetch dashboard stats after a short delay
    setTimeout(() => {
        fetchDashboardStats();
    }, 300);
});

function initializeEventListeners() {
    if (elements.addNewItem) {
        elements.addNewItem.addEventListener('click', openAddModal);
    }
    
    // UPDATED: Simplified save handler for immediate saving
    if (elements.saveItemBtn) {
        elements.saveItemBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await handleSaveItem();
        });
    }
    
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', closeModal);
    }
    
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeModal);
    }
    
    // UPDATED: Listen for category change
    if (elements.itemCategory) {
        elements.itemCategory.addEventListener('change', updateFromCategory);
    }
    
    // UPDATED: Listen for product name selection
    if (elements.itemName) {
        elements.itemName.addEventListener('change', updateFromItemNameSelect);
    }
    
    if (elements.itemModal) {
        elements.itemModal.addEventListener('click', (e) => {
            if (e.target === elements.itemModal) {
                closeModal();
            }
        });
    }
    
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
        elements.transferDate.addEventListener('change', updateStockTransferSummary);
        // Set default to today
        const today = new Date().toISOString().split('T')[0];
        elements.transferDate.value = today;
    }
}

// UPDATED: Fix fetchMenuItems to properly update product counts
async function fetchMenuItems() {
    try {
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch menu items');
        }
        
        if (data.success) {
            allMenuItems = data.data;
            
            // CRITICAL: Update ALL UI elements
            renderMenuGrid();
            renderDashboardGrid();
            updateCategoryCounts();
            
            // FIX: Always update product counts from local data
            updateDashboardStats();
            
            // Update stock transfer dropdown
            populateStockTransferProducts();
            
            console.log('Menu items fetched and UI updated. Total products:', allMenuItems.length);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching menu items:', error);
    }
}

// UPDATED: Simplified save handler
async function handleSaveItem() {
    const itemData = {
        itemId: elements.itemId ? elements.itemId.value : '',
        itemName: elements.itemName ? elements.itemName.value : '',
        category: elements.itemCategory ? elements.itemCategory.value : '',
        unit: elements.itemUnit ? elements.itemUnit.value : '',
        currentStock: elements.currentStock ? parseInt(elements.currentStock.value) || 0 : 0,
        minStock: elements.minimumStock ? parseInt(elements.minimumStock.value) || 20 : 20,
        maxStock: elements.maximumStock ? parseInt(elements.maximumStock.value) || 200 : 200,
        price: elements.itemPrice ? parseFloat(elements.itemPrice.value) || 0 : 0
    };
    
    const isEdit = itemData.itemId && itemData.itemId.trim() !== '';
    
    if (!itemData.itemName || !itemData.category || !itemData.price) {
        showToast('Please provide name, category, and price', 'error');
        return;
    }
    
    await saveMenuItem(itemData, isEdit);
}

// UPDATED: Faster modal close
function closeModal() {
    if (elements.itemModal) {
        elements.itemModal.classList.remove('show');
        setTimeout(() => {
            elements.itemModal.style.display = 'none';
            isModalOpen = false;
        }, 150);
    }
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
                        <div class="progress-bar" style="width: ${stockPercentage}%"></div>
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

// UPDATED: Faster delete function
function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const deleteBtn = event.target;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = 'Deleting...';
    deleteBtn.disabled = true;
    
    fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Product deleted successfully!');
            // Remove from local array immediately
            allMenuItems = allMenuItems.filter(item => item._id !== itemId);
            // Update ALL UI immediately
            renderMenuGrid();
            renderDashboardGrid();
            updateCategoryCounts();
            updateDashboardStats();
            populateStockTransferProducts();
            
            // Also refresh dashboard stats to update Top Selling Products
            setTimeout(() => {
                fetchDashboardStats();
            }, 100);
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product', 'error');
    })
    .finally(() => {
        deleteBtn.textContent = originalText;
        deleteBtn.disabled = false;
    });
}

function openSendStockModal() {
    if (allMenuItems.length === 0) {
        showToast('No products available to transfer', 'error');
        return;
    }
    
    elements.sendStockModal.style.display = 'flex';
}

function closeSendStockModal() {
    elements.sendStockModal.style.display = 'none';
}

function populateStockTransferProducts() {
    if (!elements.stockProduct) return;
    
    elements.stockProduct.innerHTML = '<option value="">Select Product to Transfer</option>';
    
    allMenuItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item._id;
        const displayUnit = unitDisplayLabels[item.unit] || item.unit || '';
        option.textContent = `${item.name || item.itemName} (${item.currentStock} ${displayUnit} available)`;
        option.dataset.stock = item.currentStock;
        option.dataset.unit = item.unit || '';
        option.dataset.name = item.name || item.itemName;
        elements.stockProduct.appendChild(option);
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
    
    // Update available stock display
    if (elements.availableStock) {
        elements.availableStock.textContent = `${availableStock} ${displayUnit}`;
    }
    
    // Update summary
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

// UPDATED: Fix stock transfer to update Top Selling Products
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
            
            // Update local data immediately
            const itemIndex = allMenuItems.findIndex(item => item._id === productId);
            if (itemIndex !== -1) {
                allMenuItems[itemIndex].currentStock -= quantity;
            }
            
            // Update ALL UI immediately
            renderMenuGrid();
            renderDashboardGrid();
            updateDashboardStats();
            populateStockTransferProducts();
            
            // Refresh dashboard stats to update Top Selling Products
            setTimeout(() => {
                fetchDashboardStats();
            }, 100);
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

// NEW: Function to update today's orders in dashboard
function updateTodaysOrdersDashboard() {
    // This should fetch today's orders data
    // For now, we'll leave it as is since it's not the main issue
    const todaysOrdersEl = document.getElementById('todaysOrders');
    if (todaysOrdersEl) {
        // Fetch today's orders data if needed
        // todaysOrdersEl.textContent = formatNumber(todayOrders || 0);
    }
}

window.handleLogout = handleLogout;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteMenuItem = deleteMenuItem;
window.handleSendStock = handleSendStock;
window.updateStockTransferSummary = updateStockTransferSummary;