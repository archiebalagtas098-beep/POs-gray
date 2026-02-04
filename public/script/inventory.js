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

// Recipe mapping - what dishes can be made from each raw ingredient
const recipeMapping = {
  'Chicken': ['Chicken Adobo', 'Chicken Curry', 'Chicken Tinola', 'Fried Chicken'],
  'Pork slices': ['Pork Adobo', 'Pork Sinigang'],
  'Pork belly': ['Lechon Kawali', 'Pork Belly'],
  'Ground pork': ['Pork Burger', 'Pork Meatballs'],
  'Beef shanks and marrow': ['Beef Bulalo', 'Beef Stew'],
  'Cream dory fillet': ['Fried Fish', 'Fish Fillet'],
  'Shrimp': ['Shrimp Scampi', 'Garlic Shrimp'],
  'Cabbage': ['Pork Sinigang', 'Chicken Tinola'],
  'Carrots': ['Beef Stew', 'Chicken Curry'],
  'Potato strips': ['Beef Stew', 'Chicken Curry'],
  'Butter': ['Garlic Shrimp', 'Prawns'],
  'Cheese': ['Cheese Burger', 'Cheese Sandwich'],
  'Milk': ['Milkshakes', 'Coffee Drinks'],
  'Garlic': ['Chicken Adobo', 'Pork Adobo', 'Garlic Shrimp', 'Beef Stew'],
  'Onion': ['Chicken Adobo', 'Pork Adobo', 'Beef Stew', 'Chicken Curry'],
  'Soy sauce': ['Chicken Adobo', 'Pork Adobo'],
  'Cooking oil': ['Fried Chicken', 'Lechon Kawali', 'Fried Fish']
};

// Common finished products with their POS categories
const commonFinishedProducts = {
  'Chicken Adobo': 'Rice Bowl Meals',
  'Chicken Curry': 'Rice Bowl Meals', 
  'Chicken Tinola': 'Rice Bowl Meals',
  'Fried Chicken': 'Rice Bowl Meals',
  'Pork Adobo': 'Rice Bowl Meals',
  'Pork Sinigang': 'Rice Bowl Meals',
  'Lechon Kawali': 'Rice Bowl Meals',
  'Beef Bulalo': 'Rice Bowl Meals',
  'Beef Stew': 'Rice Bowl Meals',
  'Fried Fish': 'Rice Bowl Meals',
  'Shrimp Scampi': 'Rice Bowl Meals',
  'Garlic Shrimp': 'Rice Bowl Meals',
  'Pork Burger': 'Rice Bowl Meals',
  'Cheese Burger': 'Rice Bowl Meals',
  'Milkshakes': 'Drinks',
  'Coffee Drinks': 'Coffee',
  'Garlic Shrimp': 'Hot Sizzlers',
  'Prawns': 'Hot Sizzlers',
  'Cheese Sandwich': 'Snack & Appetizer',
  'Pork Meatballs': 'Snack & Appetizer',
  'Fish Fillet': 'Rice Bowl Meals'
};

// Unit mapping
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
  'dairy': 'pieces',
  'produce': 'kg',
  'dry': 'pieces',
  'beverage': 'liters',
  'packaging': 'packs'
};

// Category-specific units mapping - FIXED to match POS categories
const categoryUnitsMapping = {
  // Raw ingredient categories (for inventory management)
  'meat': ['kg', 'g', 'lbs', 'oz', 'mg'],
  'seafood': ['kg', 'g', 'lbs', 'oz', 'mg'],
  'produce': ['kg', 'g', 'lbs', 'oz', 'pc'],
  'dairy': ['kg', 'g', 'ml', 'liters', 'pieces'],
  'dry': ['kg', 'g', 'lbs', 'oz', 'ml', 'pack', 'bottle', 'can', 'jar'],
  'beverage': ['liters', 'ml', 'bottles', 'cans'],
  'packaging': ['packs', 'box', 'bag', 'pc', 'roll'],
  
  // POS menu categories (for finished products)
  'Rice Bowl Meals': ['servings', 'pc', 'box', 'tray', 'plate'],
  'Hot Sizzlers': ['servings', 'pc', 'plate', 'sizzling plate'],
  'Party Tray': ['trays', 'servings', 'box', 'party size'],
  'Drinks': ['liters', 'ml', 'glasses', 'pitcher', 'bottles', 'cups'],
  'Coffee': ['liters', 'ml', 'glasses', 'cups', 'mugs'],
  'Milk Tea': ['liters', 'ml', 'glasses', 'cups', 'mugs'],
  'Frappe': ['liters', 'ml', 'glasses', 'cups', 'mugs'],
  'Snack & Appetizer': ['servings', 'pc', 'bag', 'box', 'plate'],
  'Budget Meals Served with Rice': ['servings', 'pc', 'box', 'plate'],
  'Specialties': ['servings', 'pc', 'box', 'tray', 'plate']
};

// Mapping between raw ingredient categories and POS categories
const categoryToPOSMapping = {
  'meat': 'Raw Ingredients',
  'seafood': 'Raw Ingredients',
  'produce': 'Raw Ingredients',
  'dairy': 'Raw Ingredients',
  'dry': 'Raw Ingredients',
  'beverage': 'Raw Ingredients',
  'packaging': 'Raw Ingredients'
};

// UI Elements
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
    currentStock: document.getElementById('currentStock'),
    minStock: document.getElementById('minStock'),
    maxStock: document.getElementById('maxStock'),
    description: document.getElementById('description'),
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
    rawIngredientsList: document.getElementById('rawIngredientsList'),
    mappingStatus: document.getElementById('mappingStatus'),
    syncAllBtn: document.getElementById('syncAllBtn'),
    showMappingsBtn: document.getElementById('showMappingsBtn'),
    recipeInfo: document.getElementById('recipeInfo')
};

let allInventoryItems = [];
let currentSection = 'dashboard';
let currentCategory = 'all';
let isModalOpen = false;

// ==================== LOADING FUNCTIONS ====================

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

// ==================== UTILITY FUNCTIONS ====================

function getItemTypeFromName(itemName) {
    if (validRawIngredients[itemName]) {
        return 'raw';
    }
    
    if (commonFinishedProducts[itemName]) {
        return 'finished';
    }
    
    // Check if it's a custom finished product name
    if (itemName && itemName.trim()) {
        // Ask user to select type
        return 'raw'; // Default to raw
    }
    
    return 'raw';
}

function getCategoryFromName(itemName, itemType) {
    if (itemType === 'raw') {
        return validRawIngredients[itemName] || 'dry';
    } else {
        // For finished products, get category from commonFinishedProducts
        return commonFinishedProducts[itemName] || 'Rice Bowl Meals';
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
        // For finished products, default to servings
        return 'servings';
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
        'packaging': 'Packaging',
        'Rice Bowl Meals': 'Rice Bowl Meals',
        'Hot Sizzlers': 'Hot Sizzlers',
        'Party Tray': 'Party Tray',
        'Drinks': 'Drinks',
        'Coffee': 'Coffee',
        'Milk Tea': 'Milk Tea',
        'Frappe': 'Frappe',
        'Snack & Appetizer': 'Snack & Appetizer',
        'Budget Meals Served with Rice': 'Budget Meals',
        'Specialties': 'Specialties',
        'raw': 'Raw Ingredients',
        'finished': 'Finished Products'
    };
    return labels[category] || category;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    
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

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
}

// ==================== FORM HANDLING FUNCTIONS ====================

function updateFromItemName() {
    const itemName = elements.itemName.value;
    if (!itemName) return;
    
    const itemType = getItemTypeFromName(itemName);
    const category = getCategoryFromName(itemName, itemType);
    const unit = getUnitFromItem(itemName, category, itemType);
    
    if (elements.itemType) {
        elements.itemType.value = itemType;
    }
    
    if (elements.itemCategory) {
        elements.itemCategory.value = category;
    }
    
    if (elements.itemUnit) {
        elements.itemUnit.value = unit;
        updateUnitOptions(category);
    }
    
    // Show recipe info if applicable
    showRecipeInfo(itemName, itemType);
}

function showRecipeInfo(itemName, itemType) {
    if (!elements.recipeInfo) return;
    
    if (itemType === 'raw' && recipeMapping[itemName]) {
        const dishes = recipeMapping[itemName];
        elements.recipeInfo.innerHTML = `
            <div class="recipe-info">
                <strong>📝 This ingredient can make:</strong>
                <ul>
                    ${dishes.map(dish => `<li>${dish}</li>`).join('')}
                </ul>
                <p class="small">When you restock this, related dishes may become available in POS.</p>
            </div>
        `;
        elements.recipeInfo.style.display = 'block';
    } else if (itemType === 'finished') {
        // Check what ingredients are needed
        let ingredients = [];
        for (const [ingredient, dishes] of Object.entries(recipeMapping)) {
            if (dishes.includes(itemName)) {
                ingredients.push(ingredient);
            }
        }
        
        if (ingredients.length > 0) {
            elements.recipeInfo.innerHTML = `
                <div class="recipe-info">
                    <strong>🥘 This dish requires:</strong>
                    <ul>
                        ${ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                    <p class="small">All ingredients must be in stock for this dish to be available.</p>
                </div>
            `;
            elements.recipeInfo.style.display = 'block';
        } else {
            elements.recipeInfo.style.display = 'none';
        }
    } else {
        elements.recipeInfo.style.display = 'none';
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
        } else if (itemType === 'finished') {
            // Show finished products for this POS category
            Object.keys(commonFinishedProducts).forEach(item => {
                if (commonFinishedProducts[item] === category) {
                    const option = document.createElement('option');
                    option.value = item;
                    option.textContent = item;
                    elements.itemName.appendChild(option);
                }
            });
            
            // Add option for custom product
            const customOption = document.createElement('option');
            customOption.value = '';
            customOption.textContent = '-- Custom Product --';
            customOption.disabled = true;
            elements.itemName.appendChild(customOption);
        }
    }
    
    // Update unit options based on category
    updateUnitOptions(category);
}

function updateUnitOptions(category) {
    const unitSelect = elements.itemUnit;
    if (!unitSelect) return;
    
    const availableUnits = categoryUnitsMapping[category] || ['kg', 'pc', 'liter', 'box', 'servings'];
    
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
            'packs': 'Packs',
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
            'mug': 'Mug',
            'mugs': 'Mugs',
            'pitcher': 'Pitcher',
            'pitchers': 'Pitchers',
            'trays': 'Trays',
            'tray': 'Tray',
            'plate': 'Plate',
            'sizzling plate': 'Sizzling Plate',
            'party size': 'Party Size'
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
    } else if (itemType === 'finished') {
        // Show finished products grouped by category
        const productsByCategory = {};
        Object.keys(commonFinishedProducts).forEach(item => {
            const category = commonFinishedProducts[item];
            if (!productsByCategory[category]) {
                productsByCategory[category] = [];
            }
            productsByCategory[category].push(item);
        });
        
        // Add optgroup for each category
        Object.keys(productsByCategory).sort().forEach(category => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = category;
            
            productsByCategory[category].sort().forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.textContent = item;
                optgroup.appendChild(option);
            });
            
            itemNameSelect.appendChild(optgroup);
        });
        
        // Add option for custom product
        const customOptgroup = document.createElement('optgroup');
        customOptgroup.label = 'Custom Products';
        const customOption = document.createElement('option');
        customOption.value = '';
        customOption.textContent = '-- Type Custom Product Name --';
        customOptgroup.appendChild(customOption);
        itemNameSelect.appendChild(customOptgroup);
        
        // Allow typing custom names
        itemNameSelect.setAttribute('type', 'text');
    }
}

function updateFromItemType() {
    const itemType = elements.itemType.value;
    
    updateItemNameOptions();
    updateCategoryOptions();
    
    if (elements.itemCategory) {
        elements.itemCategory.value = '';
    }
    
    if (elements.itemName) {
        elements.itemName.value = '';
    }
    
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
    } else if (itemType === 'finished') {
        const finishedCategories = [
            { value: 'Rice Bowl Meals', label: 'Rice Bowl Meals' },
            { value: 'Hot Sizzlers', label: 'Hot Sizzlers' },
            { value: 'Party Tray', label: 'Party Tray' },
            { value: 'Drinks', label: 'Drinks' },
            { value: 'Coffee', label: 'Coffee' },
            { value: 'Milk Tea', label: 'Milk Tea' },
            { value: 'Frappe', label: 'Frappe' },
            { value: 'Snack & Appetizer', label: 'Snack & Appetizer' },
            { value: 'Budget Meals Served with Rice', label: 'Budget Meals Served with Rice' },
            { value: 'Specialties', label: 'Specialties' }
        ];
        
        finishedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.label;
            categorySelect.appendChild(option);
        });
    }
}

function toggleFieldsByItemType() {
    const itemType = elements.itemType ? elements.itemType.value : 'raw';
    
    if (itemType === 'raw') {
        if (elements.description && elements.description.parentElement) {
            elements.description.parentElement.style.display = 'none';
        }
        
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
        if (elements.description && elements.description.parentElement) {
            elements.description.parentElement.style.display = 'block';
        }
        
        if (elements.rawIngredientsList) {
            elements.rawIngredientsList.style.display = 'none';
        }
    }
}

// ==================== MODAL FUNCTIONS ====================

function openAddModal() {
    if (isModalOpen) return;
    
    isModalOpen = true;
    const modal = elements.itemModal;
    const form = elements.itemForm;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Inventory Item';
    if (form) form.reset();
    if (elements.itemId) elements.itemId.value = '';
    
    if (elements.itemType) {
        elements.itemType.value = 'raw';
    }
    
    // Set default stock values
    if (elements.currentStock) elements.currentStock.value = '0';
    if (elements.minStock) elements.minStock.value = '10';
    if (elements.maxStock) elements.maxStock.value = '50';
    
    updateItemNameOptions();
    updateCategoryOptions();
    toggleFieldsByItemType();
    
    if (elements.itemCategory) {
        elements.itemCategory.value = '';
    }
    
    if (elements.itemUnit) {
        elements.itemUnit.value = '';
    }
    
    // Hide recipe info initially
    if (elements.recipeInfo) {
        elements.recipeInfo.style.display = 'none';
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
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Inventory Item';
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
    
    // Populate stock values
    if (elements.currentStock) {
        elements.currentStock.value = item.currentStock || 0;
    }
    
    if (elements.minStock) {
        elements.minStock.value = item.minStock || 10;
    }
    
    if (elements.maxStock) {
        elements.maxStock.value = item.maxStock || 50;
    }
    
    if (elements.itemUnit) {
        updateUnitOptions(item.category);
        elements.itemUnit.value = item.unit || getUnitFromItem(item.itemName, item.category, item.itemType);
    }
    
    // Show recipe info
    showRecipeInfo(item.itemName, item.itemType);
    
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
        }, 300);
    }
}

// ==================== DATA MANAGEMENT FUNCTIONS ====================

async function saveInventoryItem(itemData, isEdit = false) {
    try {
        showLoading();
        
        if (!itemData.itemName || !itemData.itemType || !itemData.category) {
            throw new Error('Please select Item Name, Type, and Category');
        }
        
        const currentStock = parseFloat(itemData.currentStock) || 0;
        const unit = itemData.unit || 'pieces';
        const minStock = parseFloat(itemData.minStock) || 10;
        const maxStock = parseFloat(itemData.maxStock) || 50;
        
        const itemId = itemData._id || itemData.itemId;
        const url = itemId ? `/api/inventory/${itemId}` : '/api/inventory';
        const method = itemId ? 'PUT' : 'POST';
        
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
            showToast(`Item ${action} successfully!`);
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

async function handleSaveItem() {
    const itemId = elements.itemId ? elements.itemId.value : '';
    const isEdit = itemId && itemId.trim() !== '';
    
    const itemData = {
        _id: isEdit ? itemId : undefined,
        itemId: itemId,
        itemName: elements.itemName ? elements.itemName.value : '',
        itemType: elements.itemType ? elements.itemType.value : '',
        category: elements.itemCategory ? elements.itemCategory.value : '',
        unit: elements.itemUnit ? elements.itemUnit.value : '',
        currentStock: elements.currentStock ? parseFloat(elements.currentStock.value) || 0 : 0,
        minStock: elements.minStock ? parseFloat(elements.minStock.value) || 10 : 10,
        maxStock: elements.maxStock ? parseFloat(elements.maxStock.value) || 50 : 50
    };
    
    if (!itemData.itemName || !itemData.itemType || !itemData.category) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const result = await saveInventoryItem(itemData, isEdit);
    
    if (result.success) {
        closeModal();
    }
}

// ==================== FETCH FUNCTIONS ====================

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
            allInventoryItems = data.data.map(item => ({
                ...item,
                maxStock: parseFloat(item.maxStock) || 50,
                minStock: parseFloat(item.minStock) || 10,
                currentStock: parseFloat(item.currentStock) || 0,
                unit: item.unit || 'pieces',
                category: item.category || 'dry',
                itemType: item.itemType || 'raw'
            }));
            
            // Fetch mapping status
            await fetchMappingStatus();
            
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
        
        allInventoryItems = [];
        renderInventoryGrid();
        renderDashboardGrid();
        updateCategoryCounts();
        updateDashboardStats();
    }
}

async function fetchMappingStatus() {
    try {
        const response = await fetch('/api/inventory/mappings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && elements.mappingStatus) {
            const stats = data.data;
            elements.mappingStatus.innerHTML = `
                <div class="mapping-stats">
                    <span class="stat-item">Total Mappings: ${stats.totalMappings}</span>
                    <span class="stat-item success">Synced: ${stats.synced}</span>
                    <span class="stat-item warning">Out of Sync: ${stats.outOfSync}</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching mapping status:', error);
    }
}

async function syncAllItems() {
    try {
        showLoading('Syncing all items...');
        
        const response = await fetch('/api/inventory/sync-all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ forceSource: 'inventory' }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message);
            await fetchInventoryItems();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error syncing items:', error);
        showToast('Failed to sync items', 'error');
    } finally {
        hideLoading();
    }
}

async function showMappings() {
    try {
        showLoading('Loading mappings...');
        
        const response = await fetch('/api/inventory/mappings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const content = document.createElement('div');
            content.className = 'modal-content';
            content.style.cssText = `
                background: white;
                padding: 20px;
                border-radius: 8px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                width: 90%;
            `;
            
            let html = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3>Item Mapping Status</h3>
                    <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
                </div>
                <div class="stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${data.data.totalMappings}</div>
                        <div>Total Mappings</div>
                    </div>
                    <div style="background: #d4edda; padding: 15px; border-radius: 5px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${data.data.synced}</div>
                        <div>Synced</div>
                    </div>
                    <div style="background: #fff3cd; padding: 15px; border-radius: 5px; text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${data.data.outOfSync}</div>
                        <div>Out of Sync</div>
                    </div>
                </div>
            `;
            
            if (data.data.mappings && data.data.mappings.length > 0) {
                html += `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f5f5f5;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Inventory Item</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Inv Stock</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Prod Stock</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                data.data.mappings.forEach(mapping => {
                    const isSynced = mapping.syncStatus === 'synced';
                    html += `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${mapping.inventoryItemName}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${mapping.productName}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${mapping.inventoryStock}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${mapping.productStock}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; ${isSynced ? 'background: #d4edda; color: #155724;' : 'background: #fff3cd; color: #856404;'}">
                                    ${isSynced ? 'Synced' : 'Out of Sync'}
                                </span>
                            </td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <button onclick="syncSingleItem('${mapping.inventoryItemName}')" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                    Sync
                                </button>
                            </td>
                        </tr>
                    `;
                });
                
                html += `
                        </tbody>
                    </table>
                `;
            } else {
                html += `<p style="text-align: center; padding: 20px; color: #666;">No item mappings found.</p>`;
            }
            
            content.innerHTML = html;
            modal.appendChild(content);
            document.body.appendChild(modal);
            
            // Close modal when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    } catch (error) {
        console.error('Error showing mappings:', error);
        showToast('Failed to load mappings', 'error');
    } finally {
        hideLoading();
    }
}

async function syncSingleItem(itemName) {
    try {
        showLoading(`Syncing ${itemName}...`);
        
        const encodedName = encodeURIComponent(itemName);
        const response = await fetch(`/api/inventory/sync-item/${encodedName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ forceSource: 'inventory' }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Synced ${itemName}: Inventory=${data.data.inventoryStock}, Product=${data.data.productStock}`);
            await fetchInventoryItems();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error syncing single item:', error);
        showToast('Failed to sync item', 'error');
    } finally {
        hideLoading();
    }
}

// ==================== DASHBOARD FUNCTIONS ====================

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
        const currentStock = item.currentStock || 0;
        const minStock = item.minStock || 10;
        return currentStock > 0 && currentStock <= minStock;
    }).length;
    
    const outOfStockItems = allInventoryItems.filter(item => {
        const currentStock = item.currentStock || 0;
        return currentStock === 0;
    }).length;
    
    if (elements.totalItems) elements.totalItems.textContent = totalItems;
    if (elements.lowStock) elements.lowStock.textContent = lowStockItems;
    if (elements.outOfStock) elements.outOfStock.textContent = outOfStockItems;
    
    // Calculate total products (including both raw and finished)
    const finishedProductsCount = allInventoryItems.filter(item => item.itemType === 'finished').length;
    const totalProducts = allInventoryItems.length + finishedProductsCount;
    
    if (elements.totalProducts) {
        elements.totalProducts.textContent = totalProducts;
    }
    
    // Remove inventory value display
    if (elements.inventoryValue) {
        elements.inventoryValue.textContent = 'N/A';
    }
}

// ==================== UI RENDERING FUNCTIONS ====================

function renderInventoryGrid() {
    if (!elements.inventoryGrid) return;
    
    let filteredItems = allInventoryItems;
    
    if (currentCategory !== 'all') {
        if (currentCategory === 'raw') {
            filteredItems = allInventoryItems.filter(item => item.itemType === 'raw');
        } else if (currentCategory === 'finished') {
            filteredItems = allInventoryItems.filter(item => item.itemType === 'finished');
        } else if (Object.keys(categoryToPOSMapping).includes(currentCategory)) {
            // For raw ingredient categories (meat, seafood, etc.)
            filteredItems = allInventoryItems.filter(item => 
                item.itemType === 'raw' && item.category === currentCategory
            );
        } else {
            // For POS categories (Rice Bowl Meals, etc.)
            filteredItems = allInventoryItems.filter(item => 
                item.itemType === 'finished' && item.category === currentCategory
            );
        }
    }
    
    if (filteredItems.length === 0) {
        elements.inventoryGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No inventory items found</h3>
                <p>Add items to see them listed here</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = filteredItems.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const maxStock = parseFloat(item.maxStock) || 50;
        const minStock = parseFloat(item.minStock) || 10;
        const unit = item.unit || 'pieces';
        const isOutOfStock = currentStock === 0;
        const isLowStock = currentStock > 0 && currentStock <= minStock;
        
        // Get mapping status if available
        const mappingInfo = item.mappedProduct || {};
        const syncStatus = mappingInfo.syncStatus || 'not_mapped';
        const hasMapping = mappingInfo.exists;
        
        let mappingBadge = '';
        if (hasMapping) {
            const badgeColor = syncStatus === 'synced' ? 'success' : 'warning';
            const badgeText = syncStatus === 'synced' ? '✓ Synced' : '⚠ Out of Sync';
            mappingBadge = `<span class="badge badge-${badgeColor}" style="margin-left: 5px; font-size: 10px;">${badgeText}</span>`;
        }
        
        // Recipe info
        let recipeInfo = '';
        if (item.itemType === 'raw' && recipeMapping[item.itemName]) {
            const dishes = recipeMapping[item.itemName];
            recipeInfo = `
                <div class="recipe-tooltip">
                    <small>Can make: ${dishes.slice(0, 2).join(', ')}${dishes.length > 2 ? '...' : ''}</small>
                </div>
            `;
        } else if (item.itemType === 'finished') {
            // Check what ingredients are needed
            let ingredients = [];
            for (const [ingredient, dishes] of Object.entries(recipeMapping)) {
                if (dishes.includes(item.itemName)) {
                    ingredients.push(ingredient);
                }
            }
            
            if (ingredients.length > 0) {
                recipeInfo = `
                    <div class="recipe-tooltip">
                        <small>Requires: ${ingredients.slice(0, 2).join(', ')}${ingredients.length > 2 ? '...' : ''}</small>
                    </div>
                `;
            }
        }
        
        return `
        <div class="inventory-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}">
            <div class="card-header">
                <h4>${item.itemName} ${mappingBadge}</h4>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openEditModal('${item._id}')">Edit</button>
                    <button class="btn-icon delete" onclick="deleteInventoryItem('${item._id}')">Delete</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Type:</span> <span class="badge badge-${item.itemType === 'finished' ? 'primary' : 'secondary'}">${item.itemType}</span>
                </div>
                <div class="card-info">
                    <span class="label">Category:</span> ${getCategoryLabel(item.category)}
                </div>
                <div class="card-info">
                    <span class="label">Current Stock:</span> ${currentStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Min Stock:</span> ${minStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Max Stock:</span> ${maxStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                        ${isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
                ${hasMapping ? `
                <div class="card-info">
                    <span class="label">Product Sync:</span> 
                    <span class="status ${syncStatus === 'synced' ? 'in-stock' : 'low-stock'}">
                        ${syncStatus === 'synced' ? 'Synced' : 'Out of Sync'}
                    </span>
                </div>
                ` : ''}
                ${recipeInfo}
            </div>
        </div>
        `;
    }).join('');
    
    elements.inventoryGrid.innerHTML = gridHTML;
}

function renderDashboardGrid() {
    if (!elements.dashboardGrid) return;
    
    // Get low stock and out of stock items first
    const criticalItems = allInventoryItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        return currentStock === 0 || currentStock <= minStock;
    });
    
    // Get recent items if not enough critical items
    let displayItems = criticalItems;
    if (displayItems.length < 12) {
        const recentItems = allInventoryItems.slice(0, 12 - displayItems.length);
        displayItems = [...criticalItems, ...recentItems];
    }
    
    // Limit to 12 items
    displayItems = displayItems.slice(0, 12);
    
    if (displayItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>No inventory data</h3>
                <p>Add items to see dashboard overview</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = displayItems.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const maxStock = parseFloat(item.maxStock) || 50;
        const minStock = parseFloat(item.minStock) || 10;
        const unit = item.unit || 'pieces';
        const isOutOfStock = currentStock === 0;
        const isLowStock = currentStock > 0 && currentStock <= minStock;
        
        return `
        <div class="inventory-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}">
            <div class="card-header">
                <h4>${item.itemName}</h4>
                <span class="badge badge-${item.itemType === 'finished' ? 'primary' : 'secondary'}">
                    ${item.itemType}
                </span>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Category:</span> ${getCategoryLabel(item.category)}
                </div>
                <div class="card-info">
                    <span class="label">Stock:</span> ${currentStock}/${maxStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Min:</span> ${minStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                        ${isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.dashboardGrid.innerHTML = gridHTML;
}

function renderRestockGrid() {
    if (!elements.restockGrid) return;
    
    const itemsNeedingRestock = allInventoryItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        return currentStock <= minStock;
    });
    
    if (itemsNeedingRestock.length === 0) {
        elements.restockGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <h3>All items are well stocked!</h3>
                <p>No items need restocking at this time</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = itemsNeedingRestock.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        const maxStock = parseFloat(item.maxStock) || 50;
        const unit = item.unit || 'pieces';
        const neededQuantity = Math.max(0, minStock - currentStock);
        
        return `
        <div class="inventory-card low-stock">
            <div class="card-header">
                <h4>${item.itemName}</h4>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="openRestockModal('${item._id}')">Restock</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info">
                    <span class="label">Category:</span> ${getCategoryLabel(item.category)}
                </div>
                <div class="card-info">
                    <span class="label">Current Stock:</span> ${currentStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Minimum Stock:</span> ${minStock} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Needed:</span> ${neededQuantity} ${unit}
                </div>
                <div class="card-info">
                    <span class="label">Status:</span> 
                    <span class="status ${currentStock === 0 ? 'out-of-stock' : 'low-stock'}">
                        ${currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.restockGrid.innerHTML = gridHTML;
}

function updateCategoryCounts() {
    const categories = {
        all: allInventoryItems.length,
        meat: allInventoryItems.filter(item => item.itemType === 'raw' && item.category === 'meat').length,
        seafood: allInventoryItems.filter(item => item.itemType === 'raw' && item.category === 'seafood').length,
        produce: allInventoryItems.filter(item => item.itemType === 'raw' && item.category === 'produce').length,
        dairy: allInventoryItems.filter(item => item.itemType === 'raw' && item.category === 'dairy').length,
        dry: allInventoryItems.filter(item => item.itemType === 'raw' && item.category === 'dry').length,
        beverage: allInventoryItems.filter(item => item.itemType === 'raw' && item.category === 'beverage').length,
        packaging: allInventoryItems.filter(item => item.itemType === 'raw' && item.category === 'packaging').length,
        finished: allInventoryItems.filter(item => item.itemType === 'finished').length,
        raw: allInventoryItems.filter(item => item.itemType === 'raw').length,
        // POS categories
        'Rice Bowl Meals': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Rice Bowl Meals').length,
        'Hot Sizzlers': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Hot Sizzlers').length,
        'Party Tray': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Party Tray').length,
        'Drinks': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Drinks').length,
        'Coffee': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Coffee').length,
        'Milk Tea': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Milk Tea').length,
        'Frappe': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Frappe').length,
        'Snack & Appetizer': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Snack & Appetizer').length,
        'Budget Meals Served with Rice': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Budget Meals Served with Rice').length,
        'Specialties': allInventoryItems.filter(item => item.itemType === 'finished' && item.category === 'Specialties').length
    };
    
    elements.categoryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        const countElement = item.querySelector('.category-count');
        if (countElement && categories[category] !== undefined) {
            countElement.textContent = categories[category];
        }
    });
}

// ==================== EVENT HANDLERS ====================

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
        renderDashboardGrid();
    } else if (section === 'restock') {
        renderRestockGrid();
    } else if (section === 'inventory') {
        renderInventoryGrid();
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

async function deleteInventoryItem(itemId) {
    if (!confirm('Are you sure you want to delete this item? This will also remove any product mappings.')) return;
    
    try {
        showLoading('Deleting item...');
        
        const response = await fetch(`/api/inventory/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Item deleted successfully!');
            await fetchInventoryItems();
            updateDashboardStats();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        showToast('Failed to delete item', 'error');
    } finally {
        hideLoading();
    }
}

function openRestockModal(itemId) {
    showToast('Restock feature coming soon!', 'info');
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
            await fetchInventoryItems();
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

// ==================== INITIALIZATION ====================

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
        // Allow custom input for finished products
        elements.itemName.addEventListener('input', function(e) {
            if (elements.itemType && elements.itemType.value === 'finished') {
                const itemName = e.target.value;
                if (itemName && !Object.keys(commonFinishedProducts).includes(itemName)) {
                    // Custom product name entered
                    if (elements.itemCategory && !elements.itemCategory.value) {
                        elements.itemCategory.value = 'Rice Bowl Meals'; // Default for custom products
                    }
                }
            }
        });
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
    
    if (elements.syncAllBtn) {
        elements.syncAllBtn.addEventListener('click', syncAllItems);
    }
    
    if (elements.showMappingsBtn) {
        elements.showMappingsBtn.addEventListener('click', showMappings);
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
    
    // Handle search input if it exists
    const searchInput = document.getElementById('searchInventory');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            debounceSearch(e.target.value);
        });
    }
}

// ==================== GLOBAL FUNCTIONS ====================

window.handleLogout = handleLogout;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteInventoryItem = deleteInventoryItem;
window.openRestockModal = openRestockModal;
window.debounceSearch = debounceSearch;
window.syncAllItems = syncAllItems;
window.showMappings = showMappings;
window.syncSingleItem = syncSingleItem;