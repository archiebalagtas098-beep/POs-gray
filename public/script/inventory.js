const validRawIngredients = {
    'Pork slices': 'meat',
    'Pork belly': 'meat',
    'Chicken': 'meat',
    'Ground pork': 'meat',
    'Cream dory fillet': 'seafood',
    'Shrimp': 'seafood',
    'Beef shanks and marrow': 'meat',
    'Pork face & ears': 'meat',
    'Liver': 'meat',
    'Pork chop': 'meat',
    'Bagnet': 'meat',
    'Pork ribs': 'meat',
    'Hotdogs': 'meat',
    'Bacon': 'meat',
    'Ham': 'meat',
    'Smoked fish (tinapa)': 'seafood',
    'Dried fish (tuyo)': 'seafood',
    
    'Butter': 'dairy',
    'Eggs': 'dairy',
    'Milk': 'dairy',
    'Cheese': 'dairy',
    'Grated cheese': 'dairy',
    'Mayonnaise': 'dairy',
    'Whipped cream': 'dairy',
    'Cream cheese': 'dairy',
    'Non-dairy creamer': 'dairy',
    'Sour cream': 'dairy',
    
    'Garlic': 'produce',
    'Onion': 'produce',
    'Green onions': 'produce',
    'Carrots': 'produce',
    'Cabbage': 'produce',
    'Tomato': 'produce',
    'Eggplant': 'produce',
    'Cucumber': 'produce',
    'Lettuce': 'produce',
    'Celery': 'produce',
    'Green beans': 'produce',
    'Spring onions': 'produce',
    'Chili peppers': 'produce',
    'Long green chili (siling haba)': 'produce',
    'Jalapeños': 'produce',
    'Potato strips': 'produce',
    'Corn on the cob': 'produce',
    'Ginger': 'produce',
    'Calamansi': 'produce',
    'Lemon': 'produce',
    'Mint': 'produce',
    'Kangkong (water spinach)': 'produce',
    'Radish': 'produce',
    'Sitaw (long beans)': 'produce',
    'Okra': 'produce',
    'Bitter melon (ampalaya)': 'produce',
    'Squash': 'produce',
    'Pechay (bok choy)': 'produce',
    'Basil or malunggay leaves': 'produce',
    'Mixed vegetables (peas, carrots)': 'produce',
    
    'Soy sauce': 'dry',
    'Brown sugar': 'dry',
    'Gochujang (Korean chili paste)': 'dry',
    'Sesame oil': 'dry',
    'Sesame seeds': 'dry',
    'Salt': 'dry',
    'Black pepper': 'dry',
    'Whole peppercorns': 'dry',
    'Cornstarch': 'dry',
    'Cooking oil': 'dry',
    'Flour': 'dry',
    'Breadcrumbs': 'dry',
    'Honey': 'dry',
    'Chili flakes or hot sauce': 'dry',
    'Vinegar': 'dry',
    'Lumpia wrapper': 'dry',
    'Bihon/canton noodles': 'dry',
    'Spaghetti noodles': 'dry',
    'Oyster sauce': 'dry',
    'Banana ketchup': 'dry',
    'Tomato sauce': 'dry',
    'Sugar': 'dry',
    'Blue curaçao syrup': 'dry',
    'Raspberry/red fruit tea powder': 'dry',
    'Espresso': 'dry',
    'Vanilla syrup': 'dry',
    'Caramel drizzle': 'dry',
    'Black tea leaves/powder': 'dry',
    'Matcha powder': 'dry',
    'Tapioca pearls (sago)': 'dry',
    'Sugar syrup': 'dry',
    'Chocolate cookies (Oreo)': 'dry',
    'Strawberry syrup': 'dry',
    'Mango syrup/puree': 'dry',
    'Graham crumbs': 'dry',
    'Tortilla chips': 'dry',
    'Cheese sauce': 'dry',
    'Salsa': 'dry',
    'Tartar sauce': 'dry',
    'Bread': 'dry',
    'Nuts (pili or cashew)': 'dry',
    'Olive oil': 'dry',
    'Jasmine rice': 'dry',
    'Tamarind (sampaloc)': 'dry',
    'Bagoong (fermented shrimp paste)': 'dry',
    'Fish sauce (patis)': 'dry',
    'Bay leaves': 'dry',
    'Ice': 'dry',
    'Water': 'dry',
    
    'Sprite/7-Up': 'beverage',
    'Branded soda (Coke, Sprite, Royal)': 'beverage',
    
    'Paper cups': 'packaging',
    'Straws': 'packaging',
    'Food containers': 'packaging',
    'Plastic utensils': 'packaging',
    'Napkins': 'packaging'
};

const finishedProducts = {};

const unitMapping = {
    'Drinks': 'liters',
    'Coffee': 'liters',
    'Milk Tea': 'liters',
    'Frappe': 'liters',
    
    'Soda (Mismo/1.5L)': 'bottles',
    'Branded soda (Coke, Sprite, Royal)': 'bottles',
    'Sprite/7-Up': 'bottles',
    
    'Paper cups': 'packs',
    'Straws': 'packs',
    'Food containers': 'packs',
    'Plastic utensils': 'packs',
    'Napkins': 'packs',
    
    'meat': 'kg',
    'seafood': 'kg',
    'dairy': 'pieces'
};

// Category-specific units mapping
const categoryUnitsMapping = {
    // Raw Ingredients - Weight/Volume Only (NO beverage units)
    'meat': ['kg', 'g', 'lbs', 'oz', 'mg'],
    'seafood': ['kg', 'g', 'lbs', 'oz', 'mg'],
    'produce': ['kg', 'g', 'lbs', 'oz', 'pc'],
    'dairy': ['kg', 'g', 'ml', 'liters', 'pieces'],
    'dry': ['kg', 'g', 'lbs', 'oz', 'ml', 'mm'],
    'beverage': ['liters', 'ml', 'bottles'],
    'packaging': ['packs', 'box', 'bag', 'pc'],
    
    // Finished Products - Drinks
    'Drinks': ['liters', 'ml', 'glasses', 'pitcher', 'bottles'],
    'Coffee': ['liters', 'ml', 'glasses', 'cups', 'bottles'],
    'Milk Tea': ['liters', 'ml', 'glasses', 'cups', 'bottles'],
    'Frappe': ['liters', 'ml', 'glasses', 'cups', 'bottles'],
    
    // Finished Products - Food
    'Rice Bowl Meals': ['servings', 'pc', 'box', 'tray'],
    'Hot Sizzlers': ['servings', 'pc', 'box', 'plate'],
    'Party Tray': ['trays', 'servings', 'box'],
    'Snack & Appetizer': ['servings', 'pc', 'bag', 'box'],
    'Budget Meals Served with Rice': ['servings', 'pc', 'box'],
    'Specialities': ['servings', 'pc', 'box', 'tray']
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

function getItemTypeFromName(itemName) {
    if (validRawIngredients[itemName]) {
        return 'raw';
    }
    
    return 'raw';
}

function getCategoryFromName(itemName, itemType) {
    if (itemType === 'raw') {
        return validRawIngredients[itemName] || 'dry';
    } else {
        return 'dry';
    }
}

function getUnitFromItem(itemName, category, itemType) {
    if (unitMapping[itemName]) {
        return unitMapping[itemName];
    }
    
    if (unitMapping[category]) {
        return unitMapping[category];
    }
    
    if (itemType === 'raw') {
        if (category === 'meat' || category === 'seafood') {
            return 'kg';
        } else if (category === 'produce') {
            return 'kg';
        } else if (category === 'dairy') {
            return 'pieces';
        } else if (category === 'beverage') {
            return 'liters';
        } else if (category === 'packaging') {
            return 'packs';
        } else {
            return 'pieces';
        }
    } else {
        return 'pieces';
    }
}

function updateFromItemName() {
    const itemName = elements.itemName.value;
    if (!itemName) return;
    
    const itemType = getItemTypeFromName(itemName);
    const category = getCategoryFromName(itemName, itemType);
    const unit = getUnitFromItem(itemName, category, itemType);
    
    if (elements.itemType) {
        elements.itemType.value = itemType;
    }
    
    // Don't auto-select category when item name is selected
    // Let user select it manually
    
    if (elements.itemUnit) {
        elements.itemUnit.value = unit;
    } else {
        const unitInput = document.getElementById('itemUnit');
        if (unitInput) {
            unitInput.value = unit;
        }
    }
}

function updateFromCategory() {
    const category = elements.itemCategory.value;
    const itemType = elements.itemType ? elements.itemType.value : 'raw';
    
    if (!category) return;
    
    // Update item name options based on category
    if (elements.itemName) {
        elements.itemName.innerHTML = '<option value="">Select Product</option>';
        
        if (itemType === 'raw') {
            Object.keys(validRawIngredients).forEach(item => {
                if (validRawIngredients[item] === category) {
                    const option = document.createElement('option');
                    option.value = item;
                    option.textContent = item;
                    elements.itemName.appendChild(option);
                }
            });
        }
    }
    
    // Update unit options based on category
    updateUnitOptions(category);
}

function updateUnitOptions(category) {
    const unitSelect = elements.itemUnit;
    if (!unitSelect) return;
    
    // Get available units for this category
    const availableUnits = categoryUnitsMapping[category] || ['kg', 'pc', 'liter', 'box', 'servings'];
    
    // Get the current selected unit
    const currentUnit = unitSelect.value;
    
    // Clear existing options
    unitSelect.innerHTML = '<option value="">Select Unit</option>';
    
    // Add category-specific units
    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        
        // Add readable labels
        const labels = {
            'kg': 'Kilogram (kg)',
            'g': 'Gram (g)',
            'mg': 'Milligram (mg)',
            'mm': 'Millimeter (mm)',
            'lbs': 'Pounds (lbs)',
            'oz': 'Ounces (oz)',
            'liter': 'Liter (L)',
            'liters': 'Liters (L)',
            'ml': 'Milliliter (ml)',
            'pc': 'Piece (pc)',
            'doz': 'Dozen (doz)',
            'box': 'Box',
            'pack': 'Pack',
            'bottle': 'Bottle',
            'bottles': 'Bottles',
            'can': 'Can',
            'bag': 'Bag',
            'jar': 'Jar',
            'sachet': 'Sachet',
            'serving': 'Serving',
            'servings': 'Servings',
            'pieces': 'Pieces',
            'glass': 'Glass',
            'glasses': 'Glasses',
            'cups': 'Cups',
            'cup': 'Cup',
            'pitcher': 'Pitcher',
            'pitchers': 'Pitchers',
            'trays': 'Trays',
            'tray': 'Tray',
            'plate': 'Plate',
            'packs': 'Packs'
        };
        
        option.textContent = labels[unit] || unit.charAt(0).toUpperCase() + unit.slice(1);
        unitSelect.appendChild(option);
    });
    
    // Try to restore previously selected unit if it's available
    if (currentUnit && availableUnits.includes(currentUnit)) {
        unitSelect.value = currentUnit;
    } else if (availableUnits.length > 0) {
        // Set to first available unit
        unitSelect.value = availableUnits[0];
    }
}

function updateItemNameOptions() {
    const itemType = elements.itemType ? elements.itemType.value : 'raw';
    const itemNameSelect = elements.itemName;
    
    if (!itemNameSelect) return;
    
    itemNameSelect.innerHTML = '<option value="">Select Product</option>';
    
    if (itemType === 'raw') {
        Object.keys(validRawIngredients).forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            itemNameSelect.appendChild(option);
        });
    }
}

function updateFromItemType() {
    const itemType = elements.itemType.value;
    
    updateItemNameOptions();
    
    if (elements.itemCategory) {
        updateCategoryOptions();
        // Reset category to "Select Category" when item type changes
        elements.itemCategory.value = '';
    }
    
    if (elements.itemName) {
        elements.itemName.value = '';
    }
    
    // Don't auto-set unit when category is not selected
    if (elements.itemUnit) {
        elements.itemUnit.value = '';
    }
    
    toggleFieldsByItemType();
}

function updateCategoryOptions() {
    const itemType = elements.itemType ? elements.itemType.value : 'raw';
    const categorySelect = elements.itemCategory;
    
    if (!categorySelect) return;
    
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (itemType === 'raw') {
        const rawCategories = [
            { value: 'meat', label: 'Meat & Poultry' },
            { value: 'seafood', label: 'Seafood' },
            { value: 'produce', label: 'Vegetables & Fruits' },
            { value: 'dairy', label: 'Dairy & Eggs' },
            { value: 'dry', label: 'Dry Goods' },
            { value: 'beverage', label: 'Beverages' },
            { value: 'packaging', label: 'Packaging' }
        ];
        
        rawCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.label;
            categorySelect.appendChild(option);
        });
    } else {
        // Only raw categories available
        const rawCategories = [
            { value: 'meat', label: 'Meat & Poultry' },
            { value: 'seafood', label: 'Seafood' },
            { value: 'produce', label: 'Vegetables & Fruits' },
            { value: 'dairy', label: 'Dairy & Eggs' },
            { value: 'dry', label: 'Dry Goods' },
            { value: 'beverage', label: 'Beverages' },
            { value: 'packaging', label: 'Packaging' }
        ];
        
        rawCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.label;
            categorySelect.appendChild(option);
        });
    }
}

function toggleFieldsByItemType() {
    const itemType = elements.itemType ? elements.itemType.value : 'raw';
    const descriptionField = elements.description ? elements.description.parentElement : null;
    
    if (itemType === 'raw') {
        if (descriptionField) descriptionField.style.display = 'none';
        
        if (elements.rawIngredientsList) {
            const groupedIngredients = {};
            Object.keys(validRawIngredients).forEach(ingredient => {
                const category = validRawIngredients[ingredient];
                if (!groupedIngredients[category]) {
                    groupedIngredients[category] = [];
                }
                groupedIngredients[category].push(ingredient);
            });

            let listHTML = '<div class="raw-ingredients-list"><h4>Available Raw Ingredients by Category:</h4>';
            
            for (const category in groupedIngredients) {
                const displayCategory = getCategoryLabel(category);
                listHTML += `<strong>${displayCategory}:</strong> ${groupedIngredients[category].join(', ')}<br>`;
            }
            
            listHTML += '</div>';
            elements.rawIngredientsList.innerHTML = listHTML;
            elements.rawIngredientsList.style.display = 'block';
        }
    } else {
        if (descriptionField) descriptionField.style.display = 'block';
        
        if (elements.rawIngredientsList) {
            elements.rawIngredientsList.style.display = 'none';
        }
    }
}

function getCategoryLabel(category) {
    const labels = {
        'meat': 'Meat & Poultry',
        'seafood': 'Seafood',
        'produce': 'Vegetables & Fruits',
        'dairy': 'Dairy & Eggs',
        'dry': 'Dry Goods',
        'beverage': 'Beverages',
        'packaging': 'Packaging'
    };
    return labels[category] || category;
}

async function saveInventoryItem(itemData, isEdit = false) {
    try {
        showLoading();
        
        if (!itemData.itemName || !itemData.itemType || !itemData.category) {
            throw new Error('Please select Item Name, Type, and Category');
        }
        
        const currentStock = parseFloat(itemData.currentStock) || 0;
        const minStock = parseFloat(itemData.minStock) || 10;
        const maxStock = parseFloat(itemData.maxStock) || 50;
        const price = parseFloat(itemData.price) || 0;
        const unit = itemData.unit || 'pieces';
        
        if (isEdit && itemData.itemType === 'raw') {
            const existingItem = allInventoryItems.find(item => item._id === itemData._id);
            if (existingItem && existingItem.itemType === 'raw') {
                if (currentStock > existingItem.currentStock) {
                    throw new Error('Cannot add new stock to raw ingredients. Use restock feature instead.');
                }
            }
        }
        
        const url = isEdit ? `/api/inventory/${itemData._id}` : '/api/inventory';
        const method = isEdit ? 'PUT' : 'POST';
        
        const payload = {
            itemName: itemData.itemName.trim(),
            itemType: itemData.itemType,
            category: itemData.category,
            unit: unit,
            currentStock: currentStock,
            minStock: minStock,
            maxStock: maxStock
        };
        
        if (itemData.message && itemData.message.trim()) {
            payload.message = itemData.message.trim();
        }
        
        if (itemData.isActive !== undefined) {
            payload.isActive = itemData.isActive;
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
        
        if (!response.ok) {
            throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'save'} item. Status: ${response.status}`);
        }
        
        if (data.success) {
            const action = isEdit ? 'updated' : 'added';
            showToast(`Raw ingredient ${action} successfully!`);
            await fetchInventoryItems();
            updateDashboardStats();
            return { success: true, data: data.data };
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error saving item:', error);
        showToast(error.message, 'error');
        return { success: false, error: error.message };
    } finally {
        hideLoading();
    }
}

function openAddModal() {
    if (isModalOpen) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    const form = elements.itemForm;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Raw Ingredient';
    if (form) form.reset();
    if (elements.itemId) elements.itemId.value = '';
    
    if (elements.itemType) {
        elements.itemType.value = 'raw';
    }
    
    updateItemNameOptions();
    updateCategoryOptions();
    toggleFieldsByItemType();
    
    // Reset category to "Select Category"
    if (elements.itemCategory) {
        elements.itemCategory.value = '';
    }
    
    // Reset unit to "Select Unit"
    if (elements.itemUnit) {
        elements.itemUnit.value = '';
    }
    
    const existingStockFields = document.querySelectorAll('.stock-field');
    existingStockFields.forEach(field => field.remove());
    
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        let stockFields = ``;
        formContainer.insertAdjacentHTML('beforeend', stockFields);
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemName) elements.itemName.focus();
    }, 10);
}

function openEditModal(itemId) {
    if (isModalOpen) return;
    
    const item = allInventoryItems.find(i => i._id === itemId);
    if (!item) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Raw Ingredient';
    if (elements.itemId) elements.itemId.value = item._id;
    
    if (elements.itemType) {
        elements.itemType.value = item.itemType;
    }
    
    updateItemNameOptions();
    updateCategoryOptions();
    
    if (elements.itemName) {
        elements.itemName.value = item.itemName;
    }
    
    if (elements.itemCategory) {
        elements.itemCategory.value = item.category;
    }
    
    if (elements.itemName) {
        elements.itemName.addEventListener('change', updateFromItemName);
    }
    
    if (elements.itemCategory) {
        elements.itemCategory.addEventListener('change', updateFromCategory);
    }
    
    if (elements.itemType) {
        elements.itemType.addEventListener('change', updateFromItemType);
    }
    
    const existingStockFields = document.querySelectorAll('.stock-field');
    existingStockFields.forEach(field => field.remove());
    
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        let stockFields = `
            <div class="form-group stock-field">
                <label for="currentStock">Current Stock <span class="required">*</span></label>
                <input type="number" id="currentStock" name="currentStock" min="0" step="0.01" value="${item.currentStock || 0}" required>
                <small class="form-hint">Cannot increase stock for raw ingredients</small>
            </div>
            <div class="form-group stock-field">
                <label for="minStock">Minimum Stock Level <span class="required">*</span></label>
                <input type="number" id="minStock" name="minStock" min="0" step="0.01" value="${item.minStock || 0}" required>
                <small class="form-hint">Alert when stock falls below this level</small>
            </div>
            <div class="form-group stock-field">
                <label for="maxStock">Maximum Stock Level <span class="required">*</span></label>
                <input type="number" id="maxStock" name="maxStock" min="0" step="0.01" value="${item.maxStock || 0}" required>
                <small class="form-hint">Maximum capacity for this item</small>
            </div>
            <div class="form-group stock-field">
                <label for="itemUnit">Unit <span class="required">*</span></label>
                <input type="text" id="itemUnit" name="itemUnit" value="${item.unit || getUnitFromItem(item.itemName, item.category, item.itemType)}" required>
                <small class="form-hint">Unit of measurement (kg, liters, pieces, servings, etc.)</small>
            </div>
        `;
        
        formContainer.insertAdjacentHTML('beforeend', stockFields);
    }
    
    if (elements.description) {
        elements.description.value = item.message || '';
        elements.description.parentElement.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemName) elements.itemName.focus();
    }, 10);
}

const elements = {
    itemModal: document.getElementById('itemModal'),
    modalTitle: document.getElementById('modalTitle'),
    itemForm: document.getElementById('itemForm'),
    closeModal: document.getElementById('closeModal'),
  
    itemId: document.getElementById('itemId'),
    itemName: document.getElementById('itemName'),
    itemType: document.getElementById('itemTypes'),
    itemCategory: document.getElementById('itemCategories'),
    itemUnit: document.getElementById('itemUnit'),
    
    addNewItem: document.getElementById('addNewItem'),
    saveItemBtn: document.getElementById('saveItemBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    refreshDashboard: document.getElementById('refreshDashboard'),
    markAllRestocked: document.getElementById('markAllRestocked'),
    bulkOrder: document.getElementById('bulkOrder'),
    
    inventoryGrid: document.getElementById('inventoryGrid'),
    dashboardGrid: document.getElementById('dashboardGrid'),
    restockGrid: document.getElementById('restockGrid'),
    
    totalItems: document.getElementById('totalItems'),
    lowStock: document.getElementById('lowStock'),
    outOfStock: document.getElementById('outOfStock'),
    totalProducts: document.getElementById('totalProducts'),
    inventoryValue: document.getElementById('inventoryValue'),
    
    navLinks: document.querySelectorAll('.nav-link[data-section]'),
    categoryItems: document.querySelectorAll('.category-item[data-category]'),
    
    rawIngredientsList: document.getElementById('rawIngredientsList')
};

let allInventoryItems = [];
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
    }, 3000);
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
    fetchInventoryItems();
    updateDashboardStats();
});

function initializeEventListeners() {
    if (elements.addNewItem) {
        elements.addNewItem.addEventListener('click', openAddModal);
    }
    
    if (elements.saveItemBtn) {
        elements.saveItemBtn.addEventListener('click', handleSaveItem);
    }
    
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', closeModal);
    }
    
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeModal);
    }
    
    if (elements.itemName) {
        elements.itemName.addEventListener('change', updateFromItemName);
    }
    
    if (elements.itemType) {
        elements.itemType.addEventListener('change', updateFromItemType);
    }
    
    if (elements.itemCategory) {
        elements.itemCategory.addEventListener('change', updateFromCategory);
    }
    
    if (elements.refreshDashboard) {
        elements.refreshDashboard.addEventListener('click', () => {
            fetchInventoryItems();
            updateDashboardStats();
        });
    }
    
    if (elements.markAllRestocked) {
        elements.markAllRestocked.addEventListener('click', markAllRestocked);
    }
    
    if (elements.bulkOrder) {
        elements.bulkOrder.addEventListener('click', createBulkOrder);
    }
    
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
    
    elements.categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = item.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    if (elements.itemForm) {
        elements.itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveItem();
        });
    }
 
    if (elements.itemModal) {
        elements.itemModal.addEventListener('click', (e) => {
            if (e.target === elements.itemModal) {
                closeModal();
            }
        });
    }
}

async function fetchInventoryItems() {
    try {
        const response = await fetch('/api/inventory', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch inventory items');
        }
        
        if (data.success) {
            allInventoryItems = data.data;
            renderInventoryGrid();
            renderDashboardGrid();
            updateCategoryCounts();
            updateDashboardStats();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        showToast('Failed to load inventory items', 'error');
    }
}

async function updateDashboardStats() {
    try {
        calculateDashboardStatsFromLocal();
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        calculateDashboardStatsFromLocal();
    }
}

function calculateDashboardStatsFromLocal() {
    const totalItems = allInventoryItems.length;
    const lowStockItems = allInventoryItems.filter(item => {
        return item.currentStock > 0 && item.currentStock <= 10;
    }).length;
    
    const outOfStockItems = allInventoryItems.filter(item => {
        return item.currentStock === 0;
    }).length;
    
    // Calculate inventory value (sum of all finished products' stock * price)
    const inventoryValueTotal = allInventoryItems.reduce((total, item) => {
        if (item.price && item.currentStock) {
            return total + (item.price * item.currentStock);
        }
        return total;
    }, 0);
    
    if (elements.totalItems) elements.totalItems.textContent = totalItems;
    if (elements.lowStock) elements.lowStock.textContent = lowStockItems;
    if (elements.outOfStock) elements.outOfStock.textContent = outOfStockItems;
    if (elements.inventoryValue) elements.inventoryValue.textContent = '₱' + inventoryValueTotal.toFixed(2);
    
    calculateTotalProducts();
}

function calculateTotalProducts() {
    const totalProducts = allInventoryItems.length;
    
    if (elements.totalProducts) {
        elements.totalProducts.textContent = totalProducts;
    }
}

async function handleSaveItem() {
    const currentStock = document.getElementById('currentStock');
    const minStockInput = document.getElementById('minStock');
    const maxStockInput = document.getElementById('maxStock');
    const minimumStock = document.getElementById('minimumStock');
    const maximumStock = document.getElementById('maximumStock');
    const itemUnit = document.getElementById('itemUnit');
    
    // Handle both ID formats
    const minStockVal = minStockInput ? minStockInput.value : (minimumStock ? minimumStock.value : 10);
    const maxStockVal = maxStockInput ? maxStockInput.value : (maximumStock ? maximumStock.value : 50);
    
    const itemData = {
        itemId: elements.itemId ? elements.itemId.value : '',
        itemName: elements.itemName ? elements.itemName.value : '',
        itemType: elements.itemType ? elements.itemType.value : '',
        category: elements.itemCategory ? elements.itemCategory.value : '',
        unit: itemUnit ? itemUnit.value : '',
        currentStock: currentStock ? parseFloat(currentStock.value) || 0 : 0,
        minStock: parseFloat(minStockVal) || 10,
        maxStock: parseFloat(maxStockVal) || 50,
        price: 0
    };
    
    const isEdit = itemData.itemId && itemData.itemId.trim() !== '';
    
    const result = await saveInventoryItem(itemData, isEdit);
    
    if (result.success) {
        closeModal();
    }
}

function closeModal() {
    if (elements.itemName) {
        elements.itemName.removeEventListener('change', updateFromItemName);
    }
    
    if (elements.itemType) {
        elements.itemType.removeEventListener('change', updateFromItemType);
    }
    
    if (elements.itemCategory) {
        elements.itemCategory.removeEventListener('change', updateFromCategory);
    }
    
    if (elements.itemModal) {
        elements.itemModal.classList.remove('show');
        setTimeout(() => {
            elements.itemModal.style.display = 'none';
            isModalOpen = false;
        }, 300);
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
    } else if (section === 'restock') {
        renderRestockGrid();
    }
}

function filterByCategory(category) {
    currentCategory = category;
    
    elements.categoryItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-category') === category) {
            item.classList.add('active');
        }
    });

    if (currentSection === 'inventory') {
        renderInventoryGrid();
    } else if (currentSection === 'dashboard') {
        renderDashboardGrid();
    }
}

async function markAllRestocked() {
    try {
        showLoading('Marking all items as restocked...');
        
        const response = await fetch('/api/inventory/needs-restock', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const promises = data.data.map(item => 
                fetch(`/api/inventory/${item._id}/restock`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        quantity: item.minStock - item.currentStock,
                        notes: 'Bulk restock'
                    }),
                    credentials: 'include'
                })
            );
            
            await Promise.all(promises);
            showToast('All items marked as restocked!');
            fetchInventoryItems();
        } else {
            showToast('No items need restocking', 'info');
        }
    } catch (error) {
        console.error('Error marking all restocked:', error);
        showToast('Failed to mark items as restocked', 'error');
    } finally {
        hideLoading();
    }
}

function createBulkOrder() {
    showToast('Bulk order feature coming soon!', 'info');
}

function renderInventoryGrid() {
    if (!elements.inventoryGrid) return;
    
    let filteredItems = allInventoryItems;
    
    if (currentCategory !== 'all') {
        if (currentCategory === 'raw') {
            filteredItems = allInventoryItems.filter(item => item.itemType === 'raw');
        } else {
            filteredItems = allInventoryItems.filter(item => item.category === currentCategory);
        }
    }
    
    if (filteredItems.length === 0) {
        elements.inventoryGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"></div>
                <h3>No inventory items found</h3>
                <p>Add your first item to get started</p>
                <button class="btn btn-primary" onclick="openAddModal()">Add New Item</button>
            </div>
        `;
        return;
    }
    
    const gridHTML = filteredItems.map(item => `
        <div class="inventory-card ${item.currentStock <= item.minStock ? 'low-stock' : ''} ${item.currentStock === 0 ? 'out-of-stock' : ''}">
            <div class="card-header">
                <h4>${item.itemName}</h4>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openEditModal('${item._id}')">Edit</button>
                    <button class="btn-icon delete" onclick="deleteInventoryItem('${item._id}')">Delete</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Type:</span> ${item.itemType}
                </div>
                <div class="card-info">
                    <span class="label">Category:</span> ${item.category}
                </div>
                <div class="card-info">
                    <span class="label">Current Stock:</span> ${item.currentStock} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Min Stock:</span> ${item.minStock} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Max Stock:</span> ${item.maxStock || 0} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${item.currentStock === 0 ? 'out-of-stock' : item.currentStock <= 10 ? 'low-stock' : 'in-stock'}">
                        ${item.currentStock === 0 ? 'Out of Stock' : item.currentStock <= 10 ? 'Low Stock (1-10)' : 'In Stock (>10)'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.inventoryGrid.innerHTML = gridHTML;
}

function renderDashboardGrid() {
    if (!elements.dashboardGrid) return;
    
    const recentItems = allInventoryItems.slice(0, 12);
    
    if (recentItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"></div>
                <h3>No inventory data</h3>
                <p>Add items to see dashboard overview</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = recentItems.map(item => `
        <div class="inventory-card ${item.currentStock === 0 ? 'out-of-stock' : item.currentStock <= 10 ? 'low-stock' : ''}">
            <div class="card-header">
                <h4>${item.itemName}</h4>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Stock:</span> ${item.currentStock}/${item.maxStock || 0} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Min:</span> ${item.minStock} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${item.currentStock === 0 ? 'out-of-stock' : item.currentStock <= 10 ? 'low-stock' : 'in-stock'}">
                        ${item.currentStock === 0 ? 'Out of Stock' : item.currentStock <= 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.dashboardGrid.innerHTML = gridHTML;
}

function renderRestockGrid() {
    if (!elements.restockGrid) return;
    
    const itemsNeedingRestock = allInventoryItems.filter(item => item.currentStock <= item.minStock);
    
    if (itemsNeedingRestock.length === 0) {
        elements.restockGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"></div>
                <h3>All items are well stocked!</h3>
                <p>No items need restocking at this time</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = itemsNeedingRestock.map(item => `
        <div class="inventory-card low-stock">
            <div class="card-header">
                <h4>${item.itemName}</h4>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="openRestockModal('${item._id}')">Restock</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Current Stock:</span> ${item.currentStock} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Minimum Stock:</span> ${item.minStock} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Maximum Stock:</span> ${item.maxStock || 0} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Needed:</span> ${item.minStock - item.currentStock} ${item.unit || ''}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${item.currentStock === 0 ? 'out-of-stock' : 'low-stock'}">
                        ${item.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.restockGrid.innerHTML = gridHTML;
}

function updateCategoryCounts() {
    const categories = {
        all: allInventoryItems.length,
        meat: allInventoryItems.filter(item => item.category === 'meat').length,
        dairy: allInventoryItems.filter(item => item.category === 'dairy').length,
        produce: allInventoryItems.filter(item => item.category === 'produce').length,
        dry: allInventoryItems.filter(item => item.category === 'dry').length,
        beverage: allInventoryItems.filter(item => item.category === 'beverage').length,
        packaging: allInventoryItems.filter(item => item.category === 'packaging').length,
        others: allInventoryItems.filter(item => item.category === 'others').length,
        finished: allInventoryItems.filter(item => item.itemType === 'finished').length,
        raw: allInventoryItems.filter(item => item.itemType === 'raw').length
    };
    
    elements.categoryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        const countElement = item.querySelector('.category-count');
        if (countElement && categories[category] !== undefined) {
            countElement.textContent = categories[category];
        }
    });
}

function debounceSearch(query) {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

function performSearch(query) {
    if (!query.trim()) {
        renderInventoryGrid();
        renderDashboardGrid();
        return;
    }
    
    const searchTerm = query.toLowerCase().trim();
    const filteredItems = allInventoryItems.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.itemType.toLowerCase().includes(searchTerm)
    );

    const originalItems = allInventoryItems;
    allInventoryItems = filteredItems;
    
    if (currentSection === 'inventory') {
        renderInventoryGrid();
    } else if (currentSection === 'dashboard') {
        renderDashboardGrid();
    }

    allInventoryItems = originalItems;
}

function deleteInventoryItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    fetch(`/api/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Item deleted successfully!');
            fetchInventoryItems();
            updateDashboardStats();
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting item:', error);
        showToast('Failed to delete item', 'error');
    });
}

function openRestockModal(itemId) {
    showToast('Restock modal coming soon!', 'info');
}

function updateStockProgress() {
    const currentStock = document.getElementById('currentStock');
    const maxStock = document.getElementById('maxStock');
    const progressBar = document.getElementById('stockProgressBar');
    
    if (currentStock && maxStock && progressBar) {
        const current = parseFloat(currentStock.value) || 0;
        const max = parseFloat(maxStock.value) || 1;
        
        const percentage = Math.min((current / max) * 100, 100);
        progressBar.style.width = percentage + '%';
        
        if (percentage < 20) {
            progressBar.style.background = 'linear-gradient(90deg, #e53e3e, #fc8181)';
        } else if (percentage < 50) {
            progressBar.style.background = 'linear-gradient(90deg, #f6ad55, #fbd38d)';
        } else {
            progressBar.style.background = 'linear-gradient(90deg, #4a90e2, #68d391)';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const currentStock = document.getElementById('currentStock');
    const maxStock = document.getElementById('maxStock');
    
    if (currentStock && maxStock) {
        currentStock.addEventListener('input', updateStockProgress);
        maxStock.addEventListener('input', updateStockProgress);
        updateStockProgress();
    }
});

window.handleLogout = handleLogout;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteInventoryItem = deleteInventoryItem;
window.openRestockModal = openRestockModal;
window.debounceSearch = debounceSearch;