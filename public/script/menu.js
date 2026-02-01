// DOM Elements
const toastContainer = document.getElementById('toastContainer');
const menuGrid = document.getElementById('menuGrid');
const dashboardGrid = document.getElementById('dashboardGrid');
const totalProductsEl = document.getElementById('totalProducts');
const lowStockEl = document.getElementById('lowStock');
const outOfStockEl = document.getElementById('outOfStock');
const menuValueEl = document.getElementById('menuValue');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');

// Modal Elements
const itemModal = document.getElementById('itemModal');
const sendStockModal = document.getElementById('sendStockModal');
const closeModalBtn = document.getElementById('closeModal');
const closeSendStockModalBtn = document.getElementById('closeSendStockModal');
const cancelBtn = document.getElementById('cancelBtn');
const cancelSendStockBtn = document.getElementById('cancelSendStockBtn');
const addNewItemBtn = document.getElementById('addNewItem');
const sendStockToStaffBtn = document.getElementById('sendStockToStaffBtn');
const saveItemBtn = document.getElementById('saveItemBtn');
const confirmSendStockBtn = document.getElementById('confirmSendStockBtn');

// Form Elements
const itemForm = document.getElementById('itemForm');
const sendStockForm = document.getElementById('sendStockForm');
const itemId = document.getElementById('itemId');
const itemName = document.getElementById('itemName');
const itemCategories = document.getElementById('itemCategories');
const itemUnit = document.getElementById('itemUnit');
const currentStock = document.getElementById('currentStock');
const minimumStock = document.getElementById('minimumStock');
const maximumStock = document.getElementById('maximumStock');
const itemPrice = document.getElementById('itemPrice');

// Send Stock Form Elements
const staffSelect = document.getElementById('staffSelect');
const stockProduct = document.getElementById('stockProduct');
const stockQuantity = document.getElementById('stockQuantity');
const availableStock = document.getElementById('availableStock');
const transferDate = document.getElementById('transferDate');
const transferPurpose = document.getElementById('transferPurpose');
const transferNotes = document.getElementById('transferNotes');

// Summary Elements
const summaryStaff = document.getElementById('summaryStaff');
const summaryProduct = document.getElementById('summaryProduct');
const summaryQuantity = document.getElementById('summaryQuantity');
const summaryPurpose = document.getElementById('summaryPurpose');

// Navigation Elements
const navLinks = document.querySelectorAll('.nav-link');
const categoryItems = document.querySelectorAll('.category-item');
const categoryCounts = document.querySelectorAll('.category-count');
const sectionContents = document.querySelectorAll('.section-content');
const statsDashboard = document.querySelector('.stats-dashboard');

// Data Storage - Empty arrays
let products = [];
let selectedCategory = 'all';
let selectedSection = 'dashboard';

// Product Configuration Database - ONLY TEMPLATES, NO DATA
const productDatabase = {
    'Rice': [
        { name: 'Korean Spicy Bulgogi (Pork)', unit: 'plate' },
        { name: 'Korean Salt and Pepper (Pork)', unit: 'plate' },
        { name: 'Crispy Pork Lechon Kawali', unit: 'plate' },
        { name: 'Cream Dory Fish Fillet', unit: 'plate' },
        { name: 'Buttered Honey Chicken', unit: 'plate' },
        { name: 'Buttered Spicy Chicken', unit: 'plate' },
        { name: 'Chicken Adobo', unit: 'plate' },
        { name: 'Pork Shanghai', unit: 'plate' }
    ],
    'Sizzling': [
        { name: 'Sizzling Pork Sisig', unit: 'sizzling plate' },
        { name: 'Sizzling Liempo', unit: 'sizzling plate' },
        { name: 'Sizzling Porkchop', unit: 'sizzling plate' },
        { name: 'Sizzling Fried Chicken', unit: 'sizzling plate' }
    ],
    'Party': [
        { name: 'Pancit Bihon (S)', unit: 'tray' },
        { name: 'Pancit Bihon (M)', unit: 'tray' },
        { name: 'Pancit Bihon (L)', unit: 'tray' },
        { name: 'Pancit Canton (S)', unit: 'tray' },
        { name: 'Pancit Canton (M)', unit: 'tray' },
        { name: 'Pancit Canton (L)', unit: 'tray' },
        { name: 'Spaghetti (S)', unit: 'tray' },
        { name: 'Spaghetti (M)', unit: 'tray' },
        { name: 'Spaghetti (L)', unit: 'tray' }
    ],
    'Drink': [
        { name: 'Cucumber Lemonade (Glass)', unit: 'glass' },
        { name: 'Cucumber Lemonade (Pitcher)', unit: 'pitcher' },
        { name: 'Blue Lemonade (Glass)', unit: 'glass' },
        { name: 'Blue Lemonade (Pitcher)', unit: 'pitcher' },
        { name: 'Red Tea (Glass)', unit: 'glass' },
        { name: 'Soda (Mismo)', unit: 'bottle' },
        { name: 'Soda 1.5L', unit: 'bottle' }
    ],
    'Cafe': [
        { name: 'Cafe Americano Tall', unit: 'cup' },
        { name: 'Cafe Americano Grande', unit: 'cup' },
        { name: 'Cafe Latte Tall', unit: 'cup' },
        { name: 'Cafe Latte Grande', unit: 'cup' },
        { name: 'Caramel Macchiato Tall', unit: 'cup' },
        { name: 'Caramel Macchiato Grande', unit: 'cup' }
    ],
    'Milk': [
        { name: 'Milk Tea Regular HC', unit: 'cup' },
        { name: 'Milk Tea Regular MC', unit: 'cup' },
        { name: 'Matcha Green Tea HC', unit: 'cup' },
        { name: 'Matcha Green Tea MC', unit: 'cup' }
    ],
    'Frappe': [
        { name: 'Matcha Green Tea HC', unit: 'cup' },
        { name: 'Matcha Green Tea MC', unit: 'cup' },
        { name: 'Cookies & Cream HC', unit: 'cup' },
        { name: 'Cookies & Cream MC', unit: 'cup' },
        { name: 'Strawberry & Cream HC', unit: 'cup' },
        { name: 'Mango cheese cake HC', unit: 'cup' }
    ],
    'Snack & Appetizer': [
        { name: 'Cheesy Nachos', unit: 'serving' },
        { name: 'Nachos Supreme', unit: 'serving' },
        { name: 'French fries', unit: 'serving' },
        { name: 'Clubhouse Sandwich', unit: 'sandwich' },
        { name: 'Fish and Fries', unit: 'serving' },
        { name: 'Cheesy Dynamite Lumpia', unit: 'piece' },
        { name: 'Lumpiang Shanghai', unit: 'piece' }
    ],
    'Budget Meals Served with Rice': [
        { name: 'Fried Chicken', unit: 'meal' },
        { name: 'Buttered Honey Chicken', unit: 'meal' },
        { name: 'Buttered Spicy Chicken', unit: 'meal' },
        { name: 'Tinapa Rice', unit: 'meal' },
        { name: 'Tuyo Pesto', unit: 'meal' },
        { name: 'Fried Rice', unit: 'serving' },
        { name: 'Plain Rice', unit: 'bowl' }
    ],
    'Specialties': [
        { name: 'Sinigang (PORK)', unit: 'serving' },
        { name: 'Sinigang (Shrimp)', unit: 'serving' },
        { name: 'Paknet (Pakbet w/ Bagnet)', unit: 'serving' },
        { name: 'Buttered Shrimp', unit: 'serving' },
        { name: 'Special Bulalo (good for 2-3 Persons)', unit: 'pot' },
        { name: 'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)', unit: 'pot' }
    ],
    'packaging': [
        { name: 'Paper Cups (12oz)', unit: 'pack' },
        { name: 'Paper Cups (16oz)', unit: 'pack' },
        { name: 'Straws (Regular)', unit: 'pack' },
        { name: 'Straws (Boba)', unit: 'pack' },
        { name: 'Food Containers (Small)', unit: 'pack' },
        { name: 'Food Containers (Medium)', unit: 'pack' },
        { name: 'Food Containers (Large)', unit: 'pack' },
        { name: 'Plastic Utensils Set', unit: 'set' },
        { name: 'Napkins (Pack of 50)', unit: 'pack' }
    ]
};

// Category-Unit mapping
const categoryUnitMap = {
    'Rice': ['plate', 'bowl'],
    'Sizzling': ['sizzling plate'],
    'Party': ['tray'],
    'Drink': ['glass', 'pitcher', 'bottle', 'cup'],
    'Cafe': ['cup'],
    'Milk': ['cup'],
    'Frappe': ['cup'],
    'Snack & Appetizer': ['serving', 'sandwich', 'piece'],
    'Budget Meals Served with Rice': ['meal', 'serving', 'bowl'],
    'Specialties': ['serving', 'pot'],
    'packaging': ['pack', 'set', 'box']
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if elements exist before setting up
    if (transferDate) initializeDate();
    loadProducts();
    setupEventListeners();
    updateCategoryCounts();
    setupCategoryNavigation(); // New function for category navigation
});

// NEW FUNCTION: Set up category navigation
function setupCategoryNavigation() {
    if (!categoryItems.length) return;
    
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            const fullName = item.getAttribute('data-fullname');
            filterByCategory(category, fullName);
        });
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                showSection(section);
            });
        });
    }

    // Category filtering is now handled by setupCategoryNavigation()

    // Modal controls with null checks
    if (addNewItemBtn) {
        addNewItemBtn.addEventListener('click', openAddProductModal);
    }
    
    if (sendStockToStaffBtn) {
        sendStockToStaffBtn.addEventListener('click', openSendStockModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (closeSendStockModalBtn) {
        closeSendStockModalBtn.addEventListener('click', closeSendStockModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (cancelSendStockBtn) {
        cancelSendStockBtn.addEventListener('click', closeSendStockModal);
    }
    
    // Form submissions with null checks
    if (saveItemBtn) {
        saveItemBtn.addEventListener('click', saveProduct);
    }
    
    if (confirmSendStockBtn) {
        confirmSendStockBtn.addEventListener('click', sendStockToStaff);
    }
    
    // Real-time updates with null checks
    if (itemCategories) {
        itemCategories.addEventListener('change', updateProductNameOptions);
    }
    
    if (itemName) {
        itemName.addEventListener('change', autoFillProductData);
    }
    
    if (itemCategories) {
        itemCategories.addEventListener('change', updateUnitOptions);
    }
    
    if (stockProduct) {
        stockProduct.addEventListener('change', updateAvailableStock);
    }
    
    if (stockQuantity) {
        stockQuantity.addEventListener('input', updateStockSummary);
    }
    
    if (staffSelect) {
        staffSelect.addEventListener('change', updateStaffSummary);
    }
    
    if (transferPurpose) {
        transferPurpose.addEventListener('change', updatePurposeSummary);
    }
}

// Date initialization with null check
function initializeDate() {
    if (transferDate) {
        const today = new Date().toISOString().split('T')[0];
        transferDate.value = today;
    }
}

// Update product name options based on selected category
function updateProductNameOptions() {
    if (!itemName) return;
    
    const category = itemCategories ? itemCategories.value : '';
    const currentValue = itemName.value;
    
    // Clear current options
    itemName.innerHTML = '<option value="">Select Product</option>';
    
    if (category && productDatabase[category]) {
        // Add products from the selected category
        productDatabase[category].forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            option.selected = (product.name === currentValue);
            itemName.appendChild(option);
        });
    } else {
        // If no category selected, show all products organized by category
        for (const [cat, products] of Object.entries(productDatabase)) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = cat;
            
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product.name;
                option.textContent = product.name;
                option.selected = (product.name === currentValue);
                optgroup.appendChild(option);
            });
            
            itemName.appendChild(optgroup);
        }
    }
}

// Update unit options based on selected category
function updateUnitOptions() {
    if (!itemUnit) return;
    
    const category = itemCategories ? itemCategories.value : '';
    const currentValue = itemUnit.value;
    
    // Get available units for the category
    let availableUnits = [];
    
    if (category && categoryUnitMap[category]) {
        availableUnits = categoryUnitMap[category];
    } else {
        // Default units for other categories
        availableUnits = ['plate', 'tray', 'serving', 'meal', 'bowl', 'pot', 'set', 'pack', 'box'];
    }
    
    // Update dropdown options
    itemUnit.innerHTML = '<option value="">Select Unit</option>';
    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        option.selected = (unit === currentValue);
        itemUnit.appendChild(option);
    });
}

// Load products - Empty function since no data to load
function loadProducts() {
    // Start with empty products array
    products = [];
    
    updateDashboardStats();
    renderProducts();
    updateCategoryCounts();
    populateProductDropdown();
}

// Load staff - Empty function since no data to load
function loadStaff() {
    if (!staffSelect) return;
    
    staffSelect.innerHTML = '<option value="">Select Staff Member</option>';
    // No staff data loaded
}

// Populate product dropdown for stock transfer
function populateProductDropdown() {
    if (!stockProduct) return;
    
    stockProduct.innerHTML = '<option value="">Select Product to Transfer</option>';
    products.forEach(product => {
        if (product.currentStock > 0) {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (Available: ${product.currentStock} ${product.unit})`;
            option.dataset.stock = product.currentStock;
            stockProduct.appendChild(option);
        }
    });
}

// Update available stock display
function updateAvailableStock() {
    if (!stockProduct || !availableStock || !stockQuantity) return;
    
    const selectedOption = stockProduct.options[stockProduct.selectedIndex];
    const stock = selectedOption ? selectedOption.dataset.stock || 0 : 0;
    availableStock.textContent = stock;
    stockQuantity.max = stock;
    updateProductSummary();
}

// Auto-fill product data based on selection
function autoFillProductData() {
    if (!itemName || !itemId) return;
    
    const selectedProductName = itemName.value;
    
    if (selectedProductName) {
        // Find product in database
        let productConfig = null;
        let productCategory = null;
        
        // Search through all categories
        for (const [category, products] of Object.entries(productDatabase)) {
            const foundProduct = products.find(p => p.name === selectedProductName);
            if (foundProduct) {
                productConfig = foundProduct;
                productCategory = category;
                break;
            }
        }
        
        if (productConfig && itemCategories && itemUnit) {
            // Set category and unit based on product configuration
            itemCategories.value = productCategory;
            itemUnit.value = productConfig.unit;
            
            // Update unit options based on category
            updateUnitOptions();
            
            // Ensure the correct unit is selected
            setTimeout(() => {
                if (itemUnit) itemUnit.value = productConfig.unit;
            }, 100);
        }
        
        // Set default values for new products - ALWAYS START AT 0 FOR STOCK, EMPTY FOR PRICE
        if (!itemId.value && currentStock && minimumStock && maximumStock && itemPrice) {
            currentStock.value = '0';  // Always start at 0
            minimumStock.value = '0';  // Always start at 0
            maximumStock.value = '0';  // Always start at 0
            itemPrice.value = '';      // Always start empty for price
        }
    }
}

// Get product image based on name and category
function getProductImage(productName, category) {
    // This is a simplified version - you would have actual image paths
    const imagePaths = {
        'Rice': 'rice/',
        'Sizzling': 'sizzling/',
        'Party': 'party/',
        'Drink': 'drinks/',
        'Cafe': 'coffee/',
        'Milk': 'milktea/',
        'Frappe': 'frappe/',
        'Snack & Appetizer': 'snacks/',
        'Budget Meals Served with Rice': 'budget/',
        'Specialties': 'specialties/',
        'packaging': 'packaging/'
    };
    
    const basePath = imagePaths[category] || 'default/';
    const fileName = productName.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '_') + '.png';
    
    return basePath + fileName;
}

// Update dashboard statistics
function updateDashboardStats() {
    if (!totalProductsEl || !lowStockEl || !outOfStockEl || !menuValueEl) return;
    
    const totalProducts = products.length;
    
    // Low stock: current stock is less than or equal to minimum stock AND current stock > 0
    const lowStock = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minimumStock).length;
    
    // Out of stock: current stock is 0
    const outOfStock = products.filter(p => p.currentStock === 0).length;
    
    const menuValue = products.reduce((sum, p) => sum + (p.currentStock * (p.price || 0)), 0);

    totalProductsEl.textContent = totalProducts;
    lowStockEl.textContent = lowStock;
    outOfStockEl.textContent = outOfStock;
    menuValueEl.textContent = `₱${menuValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

// Update category counts
function updateCategoryCounts() {
    if (categoryCounts.length === 0) return;
    
    const categories = {
        'all': products.length,
        'Rice': products.filter(p => p.category === 'Rice').length,
        'Sizzling': products.filter(p => p.category === 'Sizzling').length,
        'Party': products.filter(p => p.category === 'Party').length,
        'Drink': products.filter(p => p.category === 'Drink').length,
        'Cafe': products.filter(p => p.category === 'Cafe').length,
        'Milk': products.filter(p => p.category === 'Milk').length,
        'Frappe': products.filter(p => p.category === 'Frappe').length,
        'Snack & Appetizer': products.filter(p => p.category === 'Snack & Appetizer').length,
        'Budget Meals Served with Rice': products.filter(p => p.category === 'Budget Meals Served with Rice').length,
        'Specialties': products.filter(p => p.category === 'Specialties').length,
        'packaging': products.filter(p => p.category === 'packaging').length
    };

    categoryCounts.forEach(countEl => {
        const category = countEl.parentElement.dataset.category;
        countEl.textContent = categories[category] || 0;
    });
}

// Render products in grid
function renderProducts() {
    const container = selectedSection === 'dashboard' ? dashboardGrid : menuGrid;
    if (!container) return;
    
    let filteredProducts = [];
    
    // Filter by selected category
    if (selectedCategory === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(p => p.category === selectedCategory);
    }

    container.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}" data-category="${product.category}">
            <div class="product-header">
                <h4 class="product-name">${product.name}</h4>
                <span class="product-category">${product.category}</span>
            </div>
            <div class="product-details">
                <div class="product-stock">
                    <span class="stock-label">Stock:</span>
                    <span class="stock-value ${getStockStatusClass(product.currentStock, product.minimumStock)}">
                        ${product.currentStock} ${product.unit}
                        ${product.currentStock <= product.minimumStock ? '<span class="stock-alert">!</span>' : ''}
                    </span>
                </div>
                <div class="product-price">
                    <span class="price-label">Price:</span>
                    <span class="price-value">₱${(product.price || 0).toFixed(2)}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-sm btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-sm btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                <button class="btn btn-sm btn-transfer" onclick="transferProduct('${product.id}')">Transfer</button>
            </div>
        </div>
    `).join('');
}

// Get stock status class
function getStockStatusClass(currentStock, minimumStock) {
    if (currentStock === 0) return 'out-of-stock';
    if (currentStock <= minimumStock) return 'low-stock';
    return '';
}

// Edit product
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }
    
    fillEditForm(product);
    openAddProductModal();
}

// Fill edit form
function fillEditForm(product) {
    if (!itemId || !itemName || !itemCategories || !itemUnit || 
        !currentStock || !minimumStock || !maximumStock || 
        !itemPrice) return;
    
    itemId.value = product.id;
    itemName.value = product.name;
    itemCategories.value = product.category;
    itemUnit.value = product.unit;
    
    // Keep existing stock values when editing
    currentStock.value = product.currentStock;
    minimumStock.value = product.minimumStock;
    maximumStock.value = product.maximumStock;
    itemPrice.value = product.price || '';  // Keep existing price or empty
    
    // Update product name options based on category
    updateProductNameOptions();
    
    // Update unit options based on category
    updateUnitOptions();
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Edit Product';
    }
}

// Transfer product shortcut
function transferProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    openSendStockModal();
    
    // Auto-select the product
    setTimeout(() => {
        if (stockProduct) {
            stockProduct.value = productId;
            updateAvailableStock();
        }
        if (stockQuantity && product.currentStock > 0) {
            stockQuantity.value = Math.min(1, product.currentStock);
        }
        updateTransferSummary();
    }, 100);
}

// Delete product
function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        // Remove product locally
        products = products.filter(p => p.id !== id);
        
        showToast('Product deleted successfully!', 'success');
        updateDashboardStats();
        renderProducts();
        updateCategoryCounts();
        populateProductDropdown();
    } catch (error) {
        showToast('Error deleting product: ' + error.message, 'error');
    }
}

// Open modals
function openAddProductModal() {
    if (!itemModal) return;
    
    if (itemForm) itemForm.reset();
    if (itemId) itemId.value = '';
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
        modalTitle.textContent = 'Add New Product';
    }
    
    // Reset stock values to 0 and price to empty
    if (currentStock) currentStock.value = '0';
    if (minimumStock) minimumStock.value = '0';
    if (maximumStock) maximumStock.value = '0';
    if (itemPrice) itemPrice.value = '';
    
    itemModal.style.display = 'flex';
    
    // Reset dropdowns to default
    if (itemCategories) {
        itemCategories.value = '';
        updateProductNameOptions();
        updateUnitOptions();
    }
}

function openSendStockModal() {
    if (!sendStockModal) return;
    
    if (sendStockForm) sendStockForm.reset();
    initializeDate();
    sendStockModal.style.display = 'flex';
    updateTransferSummary();
}

// Close modals
function closeModal() {
    if (itemModal) {
        itemModal.style.display = 'none';
        if (itemForm) itemForm.reset();
    }
}

function closeSendStockModal() {
    if (sendStockModal) {
        sendStockModal.style.display = 'none';
        if (sendStockForm) sendStockForm.reset();
    }
}

// Section navigation
function showSection(section) {
    selectedSection = section;
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });
    
    // Show selected section
    sectionContents.forEach(content => {
        content.classList.toggle('active-section', content.id === section);
    });
    
    // Show/hide stats dashboard based on section
    if (statsDashboard) {
        if (section === 'dashboard') {
            statsDashboard.style.display = 'flex';
        } else if (section === 'menu') {
            statsDashboard.style.display = 'none'; // Hide stats in Product Menu
        }
    }
    
    // Render appropriate content
    if (section === 'dashboard') {
        renderDashboard();
    } else if (section === 'menu') {
        renderProducts();
    }
}

// Filter by category
function filterByCategory(category, fullName) {
    selectedCategory = category;
    
    // Update active category
    categoryItems.forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-category') === category);
    });
    
    // Update the category title in the main content
    if (currentCategoryTitle) {
        if (category === 'all') {
            currentCategoryTitle.textContent = 'Product Menu';
        } else {
            // Use the full name from data-fullname attribute
            currentCategoryTitle.textContent = fullName;
        }
    }
    
    renderProducts();
}

// Update summary functions with null checks
function updateStockSummary() {
    if (!summaryQuantity || !stockQuantity) return;
    summaryQuantity.textContent = stockQuantity.value || '0';
}

function updateStaffSummary() {
    if (!summaryStaff || !staffSelect) return;
    const selectedOption = staffSelect.options[staffSelect.selectedIndex];
    summaryStaff.textContent = selectedOption ? selectedOption.textContent : 'Not selected';
}

function updateProductSummary() {
    if (!summaryProduct || !stockProduct) return;
    const selectedOption = stockProduct.options[stockProduct.selectedIndex];
    const productText = selectedOption ? selectedOption.textContent : 'Not selected';
    // Remove available stock info from display
    summaryProduct.textContent = productText.split('(')[0].trim() || 'Not selected';
}

function updatePurposeSummary() {
    if (!summaryPurpose || !transferPurpose) return;
    const selectedOption = transferPurpose.options[transferPurpose.selectedIndex];
    summaryPurpose.textContent = selectedOption ? selectedOption.textContent : 'Not selected';
}

function updateTransferSummary() {
    updateStaffSummary();
    updateProductSummary();
    updateStockSummary();
    updatePurposeSummary();
}

// Save product to database - LOCAL SAVING ONLY
function saveProduct() {
    // Check if all required elements exist
    if (!itemName || !itemCategories || !itemUnit || !currentStock || 
        !minimumStock || !maximumStock || !itemPrice) {
        showToast('Form elements not found', 'error');
        return;
    }
    
    if (!validateProductForm()) return;

    const productData = {
        id: itemId ? itemId.value : null,
        name: itemName.value,
        category: itemCategories.value,
        unit: itemUnit.value,
        currentStock: parseInt(currentStock.value) || 0,
        minimumStock: parseInt(minimumStock.value) || 0,
        maximumStock: parseInt(maximumStock.value) || 0,
        price: parseFloat(itemPrice.value) || 0,
        image: getProductImage(itemName.value, itemCategories.value)
    };

    try {
        if (productData.id) {
            // Update existing product
            const index = products.findIndex(p => p.id === productData.id);
            if (index !== -1) {
                products[index] = productData;
            }
        } else {
            // Add new product
            productData.id = 'product_' + Date.now();
            products.push(productData);
        }

        showToast(`Product ${productData.id ? 'updated' : 'added'} successfully!`, 'success');
        closeModal();
        
        // Update UI with local data
        updateDashboardStats();
        renderProducts();
        updateCategoryCounts();
        populateProductDropdown();
        
    } catch (error) {
        showToast('Error saving product: ' + error.message, 'error');
    }
}

// Send stock to staff - LOCAL PROCESSING ONLY
function sendStockToStaff() {
    if (!validateStockForm()) return;

    const transferData = {
        staffId: staffSelect ? staffSelect.value : '',
        productId: stockProduct ? stockProduct.value : '',
        quantity: stockQuantity ? parseInt(stockQuantity.value) : 0,
        transferDate: transferDate ? transferDate.value : '',
        purpose: transferPurpose ? transferPurpose.value : '',
        notes: transferNotes ? transferNotes.value : '',
        status: 'completed'
    };

    try {
        // Update product stock locally
        const product = products.find(p => p.id === transferData.productId);
        if (product) {
            product.currentStock -= transferData.quantity;
            if (product.currentStock < 0) product.currentStock = 0;
        }

        showToast('Stock transferred successfully!', 'success');
        closeSendStockModal();
        
        // Update UI
        updateDashboardStats();
        renderProducts();
        updateCategoryCounts();
        populateProductDropdown();
        
    } catch (error) {
        showToast('Error transferring stock: ' + error.message, 'error');
    }
}

// Validation functions with null checks
function validateProductForm() {
    // Check if all required elements exist
    const requiredElements = [itemName, itemCategories, itemUnit, currentStock, minimumStock, maximumStock, itemPrice];
    
    for (const element of requiredElements) {
        if (!element) {
            showToast('Form is not properly loaded', 'error');
            return false;
        }
    }
    
    for (const field of requiredElements) {
        // For price field, check if it's empty or not a valid number
        if (field === itemPrice) {
            const priceValue = field.value.trim();
            if (priceValue === '' || isNaN(parseFloat(priceValue)) || parseFloat(priceValue) < 0) {
                showToast('Please enter a valid price (0 or greater)', 'error');
                field.focus();
                return false;
            }
        }
        
        // For stock fields, check if they're valid numbers
        if (field === currentStock || field === minimumStock || field === maximumStock) {
            const value = parseInt(field.value);
            if (isNaN(value) || value < 0) {
                showToast(`${field.labels[0].textContent} must be a number 0 or greater`, 'error');
                field.focus();
                return false;
            }
        }
        
        // For other required fields
        if (field !== currentStock && field !== minimumStock && field !== maximumStock && 
            field !== itemPrice && field.value.trim() === '') {
            showToast(`Please fill in ${field.labels[0].textContent}`, 'error');
            field.focus();
            return false;
        }
    }
    
    const minStock = parseInt(minimumStock.value);
    const maxStock = parseInt(maximumStock.value);
    const currStock = parseInt(currentStock.value);
    const price = parseFloat(itemPrice.value);
    
    if (minStock > maxStock) {
        showToast('Minimum stock cannot be greater than maximum stock', 'error');
        minimumStock.focus();
        return false;
    }
    
    if (currStock > maxStock) {
        showToast('Current stock cannot exceed maximum stock', 'error');
        currentStock.focus();
        return false;
    }
    
    if (price < 0) {
        showToast('Price cannot be negative', 'error');
        itemPrice.focus();
        return false;
    }
    
    return true;
}

function validateStockForm() {
    const requiredFields = [staffSelect, stockProduct, stockQuantity, transferDate, transferPurpose];
    
    for (const field of requiredFields) {
        if (!field) {
            showToast('Transfer form is not properly loaded', 'error');
            return false;
        }
        
        if (!field.value.trim()) {
            showToast(`Please select ${field.labels[0].textContent}`, 'error');
            field.focus();
            return false;
        }
    }
    
    const selectedOption = stockProduct.options[stockProduct.selectedIndex];
    const selectedStock = selectedOption ? parseInt(selectedOption.dataset.stock || 0) : 0;
    const transferQty = parseInt(stockQuantity.value);
    
    if (transferQty <= 0) {
        showToast('Transfer quantity must be greater than 0', 'error');
        stockQuantity.focus();
        return false;
    }
    
    if (transferQty > selectedStock) {
        showToast(`Cannot transfer more than available stock (${selectedStock})`, 'error');
        stockQuantity.focus();
        return false;
    }
    
    return true;
}

// Utility functions
function showToast(message, type = 'info') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showLoading() {
    // Implement loading spinner if needed
    document.body.style.cursor = 'wait';
}

function hideLoading() {
    document.body.style.cursor = 'default';
}

// Render dashboard specific content
function renderDashboard() {
    if (!dashboardGrid) return;
    
    // Show top 6 products in dashboard
    const recentProducts = products.slice(0, 6);
    dashboardGrid.innerHTML = recentProducts.map(product => `
        <div class="dashboard-product-card">
            <div class="dashboard-product-header">
                <h4>${product.name}</h4>
                <span class="dashboard-category">${product.category}</span>
            </div>
            <div class="dashboard-product-stats">
                <div class="stat-item">
                    <span class="stat-label">Stock:</span>
                    <span class="stat-value">${product.currentStock} ${product.unit}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Value:</span>
                    <span class="stat-value">₱${(product.currentStock * (product.price || 0)).toFixed(2)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle logout
function handleLogout() {
    // Implement logout logic
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/logout';
    }
}

// Global functions for inline event handlers
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.handleLogout = handleLogout;
window.transferProduct = transferProduct;
window.openAddProductModal = openAddProductModal;