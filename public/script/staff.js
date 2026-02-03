let currentOrder = [];
let orderType = null;
let currentCategory = 'all';
let selectedPaymentMethod = null;
let orderCounter = 1;
let currentAmountPaid = 0;
let todaysSales = 0;
let totalSales = 0;
let totalTransactions = 0;
let productCatalog = [];
let notificationCenter = [];

// Load menu items from API when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadMenuItemsFromAPI();
  setupCategoryButtons();
  loadNotifications();
  
  // Initial setup
  renderMenu();
  updatePayButtonState();
  
  // Set initial order type to "None"
  setOrderTypeNone();
  
  // Event listeners
  const tableInput = document.getElementById('tableNumber');
  if (tableInput) {
    tableInput.addEventListener('input', updatePayButtonState);
  }
  
  const inputPayment = document.getElementById('inputPayment');
  if (inputPayment) {
    inputPayment.addEventListener('input', updatePayButtonState);
  }
  
  // Category buttons
  const categoryButtons = document.querySelectorAll('.category-btn');
  if (categoryButtons.length > 0) {
    categoryButtons.forEach(btn => {
      const category = btn.getAttribute('data-category');
      btn.addEventListener('click', () => filterCategory(category));
      
      if (category === 'all') {
        btn.classList.add('active');
      }
    });
  }
  
  // Search input
  const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchFood(e.target.value);
    });
  }
  
  console.log('Point of Sale System - Permanent Stock');
  
  // Sync pending orders on load
  syncPendingOrders();
  setInterval(syncPendingOrders, 300000);
  
  // Auto-refresh menu items every 30 seconds
  setInterval(() => {
    console.log('🔄 Auto-refreshing menu items...');
    loadMenuItemsFromAPI();
  }, 30000);
  
  // Refresh notifications every 10 seconds
  setInterval(() => {
    loadNotifications();
  }, 10000);
});

// Set order type to "None"
function setOrderTypeNone() {
  orderType = null;
  
  const display = document.getElementById("orderTypeDisplay");
  if (display) display.textContent = "None";
  
  // Remove active class from both buttons
  const dineInBtn = document.querySelector('.dineinandtakeout-btn:nth-child(1)');
  const takeoutBtn = document.querySelector('.dineinandtakeout-btn:nth-child(2)');
  
  if (dineInBtn) dineInBtn.classList.remove('active');
  if (takeoutBtn) takeoutBtn.classList.remove('active');
  
  const tableInput = document.getElementById('tableNumber');
  if (tableInput) {
    tableInput.value = '';
    tableInput.disabled = false;
    tableInput.placeholder = "Enter Table:";
  }
  
  updatePayButtonState();
}

// Load menu items from the API - START FROM 0
async function loadMenuItemsFromAPI() {
  try {
    // Fetch menu items
    const menuResponse = await fetch('/api/menu', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!menuResponse.ok) {
      console.error('Failed to load menu items:', menuResponse.status);
      loadDefaultCatalog();
      return;
    }

    const menuResult = await menuResponse.json();
    
    if (!menuResult.success || !menuResult.data) {
      console.error('Invalid menu API response:', menuResult);
      loadDefaultCatalog();
      return;
    }

    // Fetch finished products (inventory) to get stock levels
    const inventoryResponse = await fetch('/api/inventory/finished', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    let inventoryData = [];
    if (inventoryResponse.ok) {
      const inventoryResult = await inventoryResponse.json();
      if (inventoryResult.success && inventoryResult.data) {
        inventoryData = inventoryResult.data;
      }
    }

    // Map menu items with inventory stock information - START FROM ACTUAL STOCK (COULD BE 0)
    productCatalog = menuResult.data.map(item => {
      // Find matching inventory item by name
      const inventoryItem = inventoryData.find(
        inv => inv.itemName.toLowerCase() === item.name.toLowerCase()
      );

      // Use actual inventory stock (could be 0)
      const stock = inventoryItem ? inventoryItem.currentStock : 0;
      const unit = inventoryItem ? inventoryItem.unit : 'pcs';

      return {
        name: item.name,
        price: item.price,
        category: item.category,
        image: item.image || 'default_food.jpg',
        stock: stock,
        unit: unit,
        vatable: true,
        _id: item._id,
        inventoryItemId: inventoryItem ? inventoryItem._id : null,
        minStock: inventoryItem ? inventoryItem.minStock : 0
      };
    });
      
    console.log('✅ Menu items loaded from API with actual stock:', productCatalog.length);
    renderMenu();
  } catch (error) {
    console.error('Error loading menu items from API:', error);
    loadDefaultCatalog();
  }
}

// Setup category button listeners
function setupCategoryButtons() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      categoryButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentCategory = this.dataset.category;
      renderMenu();
    });
  });
}

// Complete loadDefaultCatalog function - START FROM 0
function loadDefaultCatalog() {
  productCatalog = [
    // Rice Bowl Meals
    { name: 'Korean Spicy Bulgogi (Pork)', price: 158, category: 'Rice', image: 'rice/korean_spicy_bulgogi.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Korean Salt and Pepper (Pork)', price: 158, category: 'Rice', image: 'rice/korean_salt_pepper_pork.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Crispy Pork Lechon Kawali', price: 158, category: 'Rice', image: 'rice/lechon_kawali.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Cream Dory Fish Fillet', price: 138, category: 'Rice', image: 'rice/cream_dory.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Buttered Honey Chicken', price: 128, category: 'Rice', image: 'rice/buttered_honey_chicken.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Buttered Spicy Chicken', price: 128, category: 'Rice', image: 'rice/buttered_spicy_chicken.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Chicken Adobo', price: 128, category: 'Rice', image: 'rice/chicken_adobo.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Pork Shanghai', price: 128, category: 'Rice', image: 'rice/pork_shanghai.png', stock: 0, unit: 'pcs', vatable: true },
    
    // Hot Sizzlers
    { name: 'Sizzling Pork Sisig', price: 168, category: 'Sizzling', image: 'sizzling/pork_sisig.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Sizzling Liempo', price: 168, category: 'Sizzling', image: 'sizzling/liempo.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Sizzling Porkchop', price: 148, category: 'Sizzling', image: 'sizzling/porkchop.png', stock: 0, unit: 'pcs', vatable: true },
    { name: 'Sizzling Fried Chicken', price: 148, category: 'Sizzling', image: 'sizzling/fried_chicken.png', stock: 0, unit: 'pcs', vatable: true },
    
    // Party Tray
    { name: 'Pancit Bihon (S)', price: 300, category: 'Party', image: 'party/pancit_bihon_small.png', stock: 0, unit: 'trays', vatable: true },
    { name: 'Pancit Bihon (M)', price: 500, category: 'Party', image: 'party/pancit_bihon_medium.png', stock: 0, unit: 'trays', vatable: true },
    { name: 'Pancit Bihon (L)', price: 700, category: 'Party', image: 'party/pancit_bihon_large.png', stock: 0, unit: 'trays', vatable: true },
    { name: 'Pancit Canton (S)', price: 300, category: 'Party', image: 'party/pancit_canton_small.png', stock: 0, unit: 'trays', vatable: true },
    { name: 'Pancit Canton (M)', price: 500, category: 'Party', image: 'party/pancit_canton_medium.png', stock: 0, unit: 'trays', vatable: true },
    { name: 'Pancit Canton (L)', price: 700, category: 'Party', image: 'party/pancit_canton_large.png', stock: 0, unit: 'trays', vatable: true },
    { name: 'Spaghetti (S)', price: 400, category: 'Party', image: 'party/spaghetti_small.png', stock: 0, unit: 'trays', vatable: true },
    { name: 'Spaghetti (M)', price: 700, category: 'Party', image: 'party/spaghetti_medium.png', stock: 0, unit: 'trays', vatable: true },
    { name: 'Spaghetti (L)', price: 1000, category: 'Party', image: 'party/spaghetti_large.png', stock: 0, unit: 'trays', vatable: true },
    
    // Drinks
    { name: 'Cucumber Lemonade (Glass)', price: 38, category: 'Drink', image: 'drinks/cucumber_lemonade.png', stock: 0, unit: 'glasses', vatable: true },
    { name: 'Cucumber Lemonade (Pitcher)', price: 108, category: 'Drink', image: 'drinks/cucumber_lemonade_pitcher.png', stock: 0, unit: 'pitchers', vatable: true },
    { name: 'Blue Lemonade (Glass)', price: 38, category: 'Drink', image: 'drinks/blue_lemonade.png', stock: 0, unit: 'glasses', vatable: true },
    { name: 'Blue Lemonade (Pitcher)', price: 108, category: 'Drink', image: 'drinks/blue_lemonade_pitcher.png', stock: 0, unit: 'pitchers', vatable: true },
    { name: 'Red Tea (Glass)', price: 38, category: 'Drink', image: 'drinks/red_tea.png', stock: 0, unit: 'glasses', vatable: true },
    { name: 'Soda (Mismo)', price: 28, category: 'Drink', image: 'drinks/soda_mismo.png', stock: 0, unit: 'bottles', vatable: true },
    { name: 'Soda 1.5L', price: 118, category: 'Drink', image: 'drinks/soda_1.5liter.png', stock: 0, unit: 'bottles', vatable: true },
    
    // Coffee
    { name: 'Cafe Americano Tall', price: 88, category: 'Cafe', image: 'coffee/cafe_americano_tall.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Cafe Americano Grande', price: 108, category: 'Cafe', image: 'coffee/cafe_americano_grande.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Cafe Latte Tall', price: 108, category: 'Cafe', image: 'coffee/cafe_latte_tall.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Cafe Latte Grande', price: 128, category: 'Cafe', image: 'coffee/cafe_latte_grande.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Caramel Macchiato Tall', price: 108, category: 'Cafe', image: 'coffee/caramel_macchiato_tall.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Caramel Macchiato Grande', price: 128, category: 'Cafe', image: 'coffee/caramel_macchiato_grande.png', stock: 0, unit: 'cups', vatable: true },
    
    // Milk Tea
    { name: 'Milk Tea Regular HC', price: 68, category: 'Milk', image: 'milktea/Milktea_regular.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Milk Tea Regular MC', price: 88, category: 'Milk', image: 'milktea/Milktea_regular_MC.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Matcha Green Tea HC', price: 78, category: 'Milk', image: 'milktea/Matcha_greentea_HC.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Matcha Green Tea MC', price: 88, category: 'Milk', image: 'milktea/Matcha_greentea_MC.png', stock: 0, unit: 'cups', vatable: true },
    
    // Frappe
    { name: 'Matcha Green Tea HC', price: 108, category: 'Frappe', image: 'frappe/Matcha_greentea_HC.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Matcha Green Tea MC', price: 138, category: 'Frappe', image: 'frappe/Matcha_greentea_MC.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Cookies & Cream HC', price: 98, category: 'Frappe', image: 'frappe/Cookies_&Cream_HC.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Cookies & Cream MC', price: 128, category: 'Frappe', image: 'frappe/Cookies_&Cream_MC.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Strawberry & Cream HC', price: 180, category: 'Frappe', image: 'frappe/Strawberry_Cream_frappe_HC.png', stock: 0, unit: 'cups', vatable: true },
    { name: 'Mango cheese cake HC', price: 180, category: 'Frappe', image: 'frappe/Mango_cheesecake_HC.png', stock: 0, unit: 'cups', vatable: true },
    
    // Snack & Appetizer
    { name: 'Cheesy Nachos', price: 88, category: 'Snack & Appetizer', image: 'snacks/cheesy_nachos.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'Nachos Supreme', price: 108, category: 'Snack & Appetizer', image: 'snacks/nachos_supreme.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'French fries', price: 58, category: 'Snack & Appetizer', image: 'snacks/french_fries.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'Clubhouse Sandwich', price: 118, category: 'Snack & Appetizer', image: 'snacks/club_house_sandwich.png', stock: 0, unit: 'sandwiches', vatable: true },
    { name: 'Fish and Fries', price: 128, category: 'Snack & Appetizer', image: 'snacks/fish_fries.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'Cheesy Dynamite Lumpia', price: 88, category: 'Snack & Appetizer', image: 'snacks/Cheesy_dynamite.png', stock: 0, unit: 'pieces', vatable: true },
    { name: 'Lumpiang Shanghai', price: 88, category: 'Snack & Appetizer', image: 'snacks/lumpiang_shanghai.png', stock: 0, unit: 'pieces', vatable: true },
    
    // Budget Meals Served with Rice
    { name: 'Fried Chicken', price: 78, category: 'Budget Meals Served with Rice', image: 'budget/fried_chicken_Meal.png', stock: 0, unit: 'meals', vatable: true },
    { name: 'Buttered Honey Chicken', price: 78, category: 'Budget Meals Served with Rice', image: 'budget/buttered_honey_chicken.png', stock: 0, unit: 'meals', vatable: true },
    { name: 'Buttered Spicy Chicken', price: 78, category: 'Budget Meals Served with Rice', image: 'budget/buttered_spicy_chicken.png', stock: 0, unit: 'meals', vatable: true },
    { name: 'Tinapa Rice', price: 108, category: 'Budget Meals Served with Rice', image: 'budget/Tinapa_fried_rice.png', stock: 0, unit: 'meals', vatable: true },
    { name: 'Tuyo Pesto', price: 108, category: 'Budget Meals Served with Rice', image: 'budget/Tuyo_pesto.png', stock: 0, unit: 'meals', vatable: true },
    { name: 'Fried Rice', price: 128, category: 'Budget Meals Served with Rice', image: 'budget/fried_rice.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'Plain Rice', price: 18, category: 'Budget Meals Served with Rice', image: 'budget/plain_rice.png', stock: 0, unit: 'bowls', vatable: true },
    
    // Specialties
    { name: 'Sinigang (PORK)', price: 188, category: 'Specialties', image: 'specialties/sinigang_pork.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'Sinigang (Shrimp)', price: 178, category: 'Specialties', image: 'specialties/sinigang_shrimp.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'Paknet (Pakbet w/ Bagnet)', price: 188, category: 'Specialties', image: 'specialties/paknet.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'Buttered Shrimp', price: 108, category: 'Specialties', image: 'specialties/buttered_shrimp.png', stock: 0, unit: 'servings', vatable: true },
    { name: 'Special Bulalo (good for 2-3 Persons)', price: 128, category: 'Specialties', image: 'specialties/Special_Bulalo.png', stock: 0, unit: 'pots', vatable: true },
    { name: 'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)', price: 180, category: 'Specialties', image: 'specialties/Special_Bulalo_buy1_take1.png', stock: 0, unit: 'pots', vatable: false }
  ];
  console.log('⚠️ Loaded default catalog - all stocks start from 0');
  renderMenu();
}

function checkAllFieldsFilled() {
  const hasItems = currentOrder.length > 0;
  const hasOrderType = orderType && orderType !== "None";
  const hasPaymentMethod = selectedPaymentMethod && selectedPaymentMethod.trim() !== '';
  
  let hasTableNumber = true;
  if (orderType === "Dine In") {
    const tableInput = document.getElementById('tableNumber');
    hasTableNumber = tableInput && tableInput.value.trim() !== '';
  }
  
  let hasPaymentAmount = true;
  if (selectedPaymentMethod === 'cash') {
    const inputPayment = document.getElementById('inputPayment');
    hasPaymentAmount = inputPayment && inputPayment.value.trim() !== '';
  }
  
  return hasItems && hasOrderType && hasPaymentMethod && hasTableNumber && hasPaymentAmount;
}

function updatePayButtonState() {
  const payButton = document.getElementById('payButton');
  if (!payButton) return;
  
  const allFieldsFilled = checkAllFieldsFilled();
  
  if (allFieldsFilled) {
    payButton.disabled = false;
    payButton.style.opacity = '1';
    payButton.style.cursor = 'pointer';
    payButton.style.backgroundColor = '#28a745';
  } else {
    payButton.disabled = true;
    payButton.style.opacity = '0.6';
    payButton.style.cursor = 'not-allowed';
    payButton.style.backgroundColor = '#6c757d';
  }
}

function searchFood(searchTerm) {
  const container = document.getElementById('menuContainer');
  if (!container) return;
  
  if (!searchTerm.trim()) {
    renderMenu();
    return;
  }
  
  const term = searchTerm.toLowerCase().trim();
  const filteredProducts = productCatalog.filter(product => {
    if (currentCategory !== 'all' && product.category !== currentCategory) return false;
    if (product.name.toLowerCase().includes(term)) return true;
    if (product.category.toLowerCase().includes(term)) return true;
    return false;
  });
  
  container.innerHTML = '';
  
  if (filteredProducts.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>No products found</h3>
        <p>Try searching with different keywords</p>
      </div>
    `;
    return;
  }
  
  filteredProducts.forEach(product => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
  
  updatePayButtonState();
}

function renderMenu() {
  const container = document.getElementById('menuContainer');
  if (!container) return;
  container.innerHTML = '';

  const items = currentCategory === 'all'
    ? productCatalog
    : productCatalog.filter(p => p.category === currentCategory);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-utensils"></i>
        <h3>No products in this category</h3>
        <p>Try selecting a different category</p>
      </div>
    `;
    return;
  }

  items.forEach(product => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
  
  updatePayButtonState();
}

// Add these functions to your existing POS code

// Request Stock Modal Functions
function showRequestStockModal() {
  const modalHTML = `
  <div id="requestStockModal" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  ">
    <div style="
      background: white;
      padding: 25px;
      border-radius: 10px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 5px 25px rgba(0,0,0,0.2);
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid #4f46e5;
        padding-bottom: 15px;
      ">
        <h2 style="margin: 0; color: #374151;">
          <i class="fas fa-boxes" style="margin-right: 10px; color: #4f46e5;"></i>
          Request Stock
        </h2>
        <button onclick="closeRequestStockModal()" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        ">×</button>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="
          background: #f0f9ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border-left: 4px solid #3b82f6;
        ">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <i class="fas fa-info-circle" style="color: #3b82f6; margin-right: 10px;"></i>
            <h4 style="margin: 0; color: #1e40af;">Stock Request Information</h4>
          </div>
          <p style="margin: 0; color: #4b5563; font-size: 14px;">
            Request additional stock for low inventory items. This will notify the admin.
          </p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
            Select Product
          </label>
          <select id="requestStockProduct" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            background: white;
          " onchange="updateRequestStockDetails()">
            <option value="">-- Select Product --</option>
            ${productCatalog.filter(p => p.stock <= p.minStock || p.stock <= 10).map(product => `
              <option value="${product.name}" data-stock="${product.stock}" data-unit="${product.unit}" data-min="${product.minStock || 10}">
                ${product.name} (Current: ${product.stock} ${product.unit}, Low Stock)
              </option>
            `).join('')}
            ${productCatalog.filter(p => p.stock > (p.minStock || 10)).map(product => `
              <option value="${product.name}" data-stock="${product.stock}" data-unit="${product.unit}" data-min="${product.minStock || 10}">
                ${product.name} (Current: ${product.stock} ${product.unit})
              </option>
            `).join('')}
          </select>
        </div>
        
        <div id="stockDetails" style="
          display: none;
          background: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #e5e7eb;
        ">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <small style="color: #6b7280;">Current Stock</small>
              <div id="currentStockValue" style="font-weight: bold; font-size: 16px;"></div>
            </div>
            <div>
              <small style="color: #6b7280;">Minimum Required</small>
              <div id="minStockValue" style="font-weight: bold; font-size: 16px; color: #ef4444;"></div>
            </div>
            <div>
              <small style="color: #6b7280;">Unit</small>
              <div id="stockUnit" style="font-weight: bold; font-size: 16px;"></div>
            </div>
            <div>
              <small style="color: #6b7280;">Status</small>
              <div id="stockStatus" style="font-weight: bold; font-size: 16px;"></div>
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
            Request Quantity
          </label>
          <input type="number" id="requestQuantity" min="1" max="1000" value="10" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
          " oninput="validateRequestQuantity()">
          <div style="display: flex; justify-content: space-between; margin-top: 5px;">
            <small style="color: #6b7280;">Enter quantity to request</small>
            <small id="quantityError" style="color: #ef4444; display: none;"></small>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
            Priority Level
          </label>
          <div style="display: flex; gap: 10px;">
            <label style="flex: 1; display: flex; align-items: center; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
              <input type="radio" name="priority" value="low" checked style="margin-right: 8px;">
              <span>Low</span>
            </label>
            <label style="flex: 1; display: flex; align-items: center; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
              <input type="radio" name="priority" value="medium" style="margin-right: 8px;">
              <span>Medium</span>
            </label>
            <label style="flex: 1; display: flex; align-items: center; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
              <input type="radio" name="priority" value="high" style="margin-right: 8px;">
              <span>High</span>
            </label>
            <label style="flex: 1; display: flex; align-items: center; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
              <input type="radio" name="priority" value="urgent" style="margin-right: 8px;">
              <span>Urgent</span>
            </label>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
            Notes (Optional)
          </label>
          <textarea id="requestNotes" rows="3" placeholder="Add any additional notes for the admin..." style="
            width: 100%;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
          "></textarea>
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button onclick="closeRequestStockModal()" style="
          flex: 1;
          padding: 12px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button onclick="submitStockRequest()" style="
          flex: 1;
          padding: 12px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          <i class="fas fa-paper-plane"></i> Submit Request
        </button>
      </div>
    </div>
  </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeRequestStockModal() {
  const modal = document.getElementById('requestStockModal');
  if (modal) modal.remove();
}

function updateRequestStockDetails() {
  const select = document.getElementById('requestStockProduct');
  const detailsDiv = document.getElementById('stockDetails');
  const productName = select.value;
  
  if (!productName) {
    detailsDiv.style.display = 'none';
    return;
  }
  
  const product = productCatalog.find(p => p.name === productName);
  if (!product) return;
  
  const currentStock = product.stock;
  const minStock = product.minStock || 10;
  const unit = product.unit;
  
  document.getElementById('currentStockValue').textContent = `${currentStock} ${unit}`;
  document.getElementById('minStockValue').textContent = `${minStock} ${unit}`;
  document.getElementById('stockUnit').textContent = unit;
  
  // Set stock status
  let statusText = '';
  let statusColor = '';
  
  if (currentStock <= 0) {
    statusText = 'OUT OF STOCK';
    statusColor = '#ef4444';
  } else if (currentStock <= minStock) {
    statusText = 'LOW STOCK';
    statusColor = '#f97316';
  } else if (currentStock <= minStock * 2) {
    statusText = 'MEDIUM STOCK';
    statusColor = '#eab308';
  } else {
    statusText = 'GOOD STOCK';
    statusColor = '#22c55e';
  }
  
  const statusEl = document.getElementById('stockStatus');
  statusEl.textContent = statusText;
  statusEl.style.color = statusColor;
  
  detailsDiv.style.display = 'block';
  
  // Auto-set request quantity based on stock level
  const requestQtyInput = document.getElementById('requestQuantity');
  if (currentStock <= 0) {
    requestQtyInput.value = minStock * 3;
  } else if (currentStock <= minStock) {
    requestQtyInput.value = minStock * 2 - currentStock;
  } else {
    requestQtyInput.value = 10;
  }
}

function validateRequestQuantity() {
  const input = document.getElementById('requestQuantity');
  const errorEl = document.getElementById('quantityError');
  const value = parseInt(input.value);
  
  if (value < 1) {
    errorEl.textContent = 'Quantity must be at least 1';
    errorEl.style.display = 'block';
    input.style.borderColor = '#ef4444';
    return false;
  }
  
  if (value > 1000) {
    errorEl.textContent = 'Maximum quantity is 1000';
    errorEl.style.display = 'block';
    input.style.borderColor = '#ef4444';
    return false;
  }
  
  errorEl.style.display = 'none';
  input.style.borderColor = '#d1d5db';
  return true;
}

async function submitStockRequest() {
  const productName = document.getElementById('requestStockProduct').value;
  const quantity = parseInt(document.getElementById('requestQuantity').value);
  const priority = document.querySelector('input[name="priority"]:checked').value;
  const notes = document.getElementById('requestNotes').value;
  
  if (!productName) {
    alert('Please select a product');
    return;
  }
  
  if (!validateRequestQuantity()) {
    return;
  }
  
  const product = productCatalog.find(p => p.name === productName);
  if (!product) {
    alert('Product not found');
    return;
  }
  
  try {
    // Send request to server
    const response = await fetch('/api/inventory/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: product._id,
        productName: product.name,
        requestedQuantity: quantity,
        currentStock: product.stock,
        unit: product.unit,
        priority: priority,
        notes: notes,
        status: 'pending',
        requestedBy: 'POS System',
        requestedAt: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        alert(`✅ Stock request submitted successfully!\n\nProduct: ${product.name}\nQuantity: ${quantity} ${product.unit}\nPriority: ${priority}\nRequest ID: ${result.requestId}`);
        
        // Close modal
        closeRequestStockModal();
        
        // Notify admin
        await notifyAdminStockRequest(product.name, quantity, priority);
        
      } else {
        alert('Error: ' + (result.message || 'Failed to submit request'));
      }
    } else {
      throw new Error('Server error: ' + response.status);
    }
    
  } catch (error) {
    console.error('Error submitting stock request:', error);
    alert('Failed to submit stock request. Please try again.');
  }
}

async function notifyAdminStockRequest(productName, quantity, priority) {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        type: 'stock_request',
        title: `Stock Request - ${priority.toUpperCase()}`,
        message: `${productName} needs ${quantity} units`,
        data: {
          product: productName,
          quantity: quantity,
          priority: priority,
          timestamp: new Date().toISOString()
        },
        read: false
      })
    });
  } catch (error) {
    console.error('Error notifying admin:', error);
  }
}



function closeViewStockModal() {
  const modal = document.getElementById('viewStockModal');
  if (modal) modal.remove();
}

function requestSpecificStock(productName) {
  closeViewStockModal();
  
  // Show request modal with pre-selected product
  showRequestStockModal();
  
  // Set the product selection
  setTimeout(() => {
    const select = document.getElementById('requestStockProduct');
    if (select) {
      select.value = productName;
      updateRequestStockDetails();
    }
  }, 100);
}

function exportStockReport() {
  // Create CSV content
  let csvContent = "Product Name,Category,Current Stock,Unit,Min Stock,Status,Price\n";
  
  productCatalog.forEach(product => {
    const minStock = product.minStock || 10;
    let status = '';
    
    if (product.stock <= 0) {
      status = 'OUT OF STOCK';
    } else if (product.stock <= minStock) {
      status = 'LOW STOCK';
    } else if (product.stock <= 30) {
      status = 'MEDIUM STOCK';
    } else {
      status = 'GOOD STOCK';
    }
    
    csvContent += `"${product.name}","${product.category}",${product.stock},"${product.unit}",${minStock},"${status}",${product.price}\n`;
  });
  
  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `stock_report_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function refreshStockData() {
  try {
    // Show loading state
    const refreshBtn = document.querySelector('#viewStockModal button[onclick="refreshStockData()"]');
    if (refreshBtn) {
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      refreshBtn.disabled = true;
    }
    
    // Reload menu items
    await loadMenuItemsFromAPI();
    
    // Close and reopen modal to show updated data
    closeViewStockModal();
    setTimeout(() => {
      showViewStockModal();
    }, 500);
    
  } catch (error) {
    console.error('Error refreshing stock data:', error);
    alert('Failed to refresh stock data');
  }
}

// Add these buttons to your POS interface (add this to your HTML or create dynamically)
function addStockManagementButtons() {
  // Check if buttons already exist
  if (document.getElementById('stockManagementButtons')) return;
  
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'stockManagementButtons';
  buttonContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 1000;
  `;
  
  const viewStockBtn = document.createElement('button');
  viewStockBtn.innerHTML = ``;
  viewStockBtn.onmouseenter = () => {
    viewStockBtn.style.transform = 'translateY(-2px)';
    viewStockBtn.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
  };
  viewStockBtn.onmouseleave = () => {
    viewStockBtn.style.transform = 'translateY(0)';
    viewStockBtn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
  };
  viewStockBtn.onclick = showViewStockModal;
  
  const requestStockBtn = document.createElement('button');
  requestStockBtn.innerHTML = ``;
  requestStockBtn.onmouseenter = () => {
    requestStockBtn.style.transform = 'translateY(-2px)';
    requestStockBtn.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)';
  };
  requestStockBtn.onmouseleave = () => {
    requestStockBtn.style.transform = 'translateY(0)';
    requestStockBtn.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)';
  };
  requestStockBtn.onclick = showRequestStockModal;
  
  buttonContainer.appendChild(viewStockBtn);
  buttonContainer.appendChild(requestStockBtn);
  document.body.appendChild(buttonContainer);
}

// Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
  // ... existing code ...
  
  // Add stock management buttons
  setTimeout(() => {
    addStockManagementButtons();
  }, 1000);
  
  // ... existing code ...
});

// Close modals when clicking outside
document.addEventListener('click', function(event) {
  const requestModal = document.getElementById('requestStockModal');
  const viewModal = document.getElementById('viewStockModal');
  
  if (requestModal && event.target === requestModal) {
    closeRequestStockModal();
  }
  
  if (viewModal && event.target === viewModal) {
    closeViewStockModal();
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
  // Alt + S for stock view
  if (event.altKey && event.key === 's') {
    event.preventDefault();
    showViewStockModal();
  }
  
  // Alt + R for stock request
  if (event.altKey && event.key === 'r') {
    event.preventDefault();
    showRequestStockModal();
  }
  
  // Escape to close modals
  if (event.key === 'Escape') {
    closeRequestStockModal();
    closeViewStockModal();
  }
});

function openRequestStock() {
  // Show loading indicator
  const button = document.getElementById('requestStockBtn');
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  button.disabled = true;
  
  // Load and show modal
  setTimeout(() => {
    showRequestStockModal();
    button.innerHTML = originalText;
    button.disabled = false;
  }, 500);
}

function openViewStock() {
  // Show loading indicator
  const button = document.getElementById('viewStockBtn');
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  button.disabled = true;
  
  // Check if we need to refresh data first
  const lastUpdate = localStorage.getItem('lastStockUpdate');
  const currentTime = new Date().getTime();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (!lastUpdate || (currentTime - parseInt(lastUpdate)) > fiveMinutes) {
    // Refresh stock data if older than 5 minutes
    console.log('Refreshing stock data for view...');
    loadMenuItemsFromAPI().then(() => {
      localStorage.setItem('lastStockUpdate', currentTime.toString());
      showViewStockModal();
      button.innerHTML = originalText;
      button.disabled = false;
    }).catch(error => {
      console.error('Error loading stock data:', error);
      showViewStockModal(); // Show with cached data
      button.innerHTML = originalText;
      button.disabled = false;
    });
  } else {
    // Use cached data
    showViewStockModal();
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

// Updated showRequestStockModal with better UI
function showRequestStockModal() {
  // Check if modal already exists
  if (document.getElementById('requestStockModal')) {
    return;
  }
  
  // Sort products: out of stock first, then low stock
  const sortedProducts = [...productCatalog].sort((a, b) => {
    const minA = a.minStock || 10;
    const minB = b.minStock || 10;
    
    if (a.stock <= 0 && b.stock > 0) return -1;
    if (b.stock <= 0 && a.stock > 0) return 1;
    if (a.stock <= minA && b.stock > minB) return -1;
    if (b.stock <= minB && a.stock > minA) return 1;
    return a.name.localeCompare(b.name);
  });
  
  const modalHTML = `
  <div id="requestStockModal" class="stock-modal">
    <div class="stock-modal-content">
      <div class="stock-modal-header">
        <div class="stock-modal-title">
          <i class="fas fa-boxes"></i>
          <h2>Request Stock</h2>
        </div>
        <button class="stock-modal-close" onclick="closeRequestStockModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="stock-modal-body">
        <div class="stock-alert-info">
          <i class="fas fa-info-circle"></i>
          <div>
            <h4>Stock Request Information</h4>
            <p>Request additional stock for low inventory items. This will notify the admin.</p>
          </div>
        </div>
        
        <div class="form-group">
          <label for="requestStockProduct">
            <i class="fas fa-tag"></i> Select Product
          </label>
          <div class="select-wrapper">
            <select id="requestStockProduct" onchange="updateRequestStockDetails()">
              <option value="">-- Select Product --</option>
              ${sortedProducts.map(product => {
                const minStock = product.minStock || 10;
                let statusText = '';
                
                if (product.stock <= 0) {
                  statusText = '(OUT OF STOCK)';
                } else if (product.stock <= minStock) {
                  statusText = '(LOW STOCK)';
                }
                
                return `
                <option 
                  value="${product.name}" 
                  data-stock="${product.stock}" 
                  data-unit="${product.unit}" 
                  data-min="${minStock}"
                  data-id="${product._id || ''}"
                  ${product.stock <= minStock ? 'class="low-stock-option"' : ''}
                >
                  ${product.name} ${statusText} - ${product.stock} ${product.unit} available
                </option>`;
              }).join('')}
            </select>
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
        
        <div id="stockDetails" class="stock-details-card">
          <div class="stock-details-grid">
            <div class="stock-detail-item">
              <span class="detail-label">Current Stock:</span>
              <span id="currentStockValue" class="detail-value">-</span>
            </div>
            <div class="stock-detail-item">
              <span class="detail-label">Minimum Required:</span>
              <span id="minStockValue" class="detail-value min-stock">-</span>
            </div>
            <div class="stock-detail-item">
              <span class="detail-label">Unit:</span>
              <span id="stockUnit" class="detail-value">-</span>
            </div>
            <div class="stock-detail-item">
              <span class="detail-label">Status:</span>
              <span id="stockStatus" class="detail-value status">-</span>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="requestQuantity">
            <i class="fas fa-calculator"></i> Request Quantity
          </label>
          <input 
            type="number" 
            id="requestQuantity" 
            min="1" 
            max="1000" 
            value="10"
            oninput="validateRequestQuantity()"
            placeholder="Enter quantity"
          >
          <div class="input-footer">
            <span class="hint">Enter quantity to request</span>
            <span id="quantityError" class="error-message"></span>
          </div>
        </div>
        
        <div class="form-group">
          <label>
            <i class="fas fa-flag"></i> Priority Level
          </label>
          <div class="priority-buttons">
            <label class="priority-option">
              <input type="radio" name="priority" value="low" checked>
              <span class="priority-label low">
                <i class="fas fa-flag"></i> Low
              </span>
            </label>
            <label class="priority-option">
              <input type="radio" name="priority" value="medium">
              <span class="priority-label medium">
                <i class="fas fa-flag"></i> Medium
              </span>
            </label>
            <label class="priority-option">
              <input type="radio" name="priority" value="high">
              <span class="priority-label high">
                <i class="fas fa-flag"></i> High
              </span>
            </label>
            <label class="priority-option">
              <input type="radio" name="priority" value="urgent">
              <span class="priority-label urgent">
                <i class="fas fa-exclamation-triangle"></i> Urgent
              </span>
            </label>
          </div>
        </div>
        
        <div class="form-group">
          <label for="requestNotes">
            <i class="fas fa-sticky-note"></i> Notes (Optional)
          </label>
          <textarea 
            id="requestNotes" 
            rows="3" 
            placeholder="Add any additional notes for the admin..."
          ></textarea>
        </div>
      </div>
      
      <div class="stock-modal-footer">
        <button class="btn-secondary" onclick="closeRequestStockModal()">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button class="btn-primary" onclick="submitStockRequest()">
          <i class="fas fa-paper-plane"></i> Submit Request
        </button>
      </div>
    </div>
  </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add CSS for the modal
  addStockModalStyles();
  
  // Show modal with animation
  setTimeout(() => {
    const modal = document.getElementById('requestStockModal');
    if (modal) {
      modal.classList.add('show');
    }
  }, 10);
}

// Updated showViewStockModal with better UI
// Updated showViewStockModal with editable input fields
function showViewStockModal() {
  // Check if modal already exists
  if (document.getElementById('viewStockModal')) {
    return;
  }
  
  // Calculate stock statistics
  const outOfStockItems = productCatalog.filter(p => p.stock <= 0);
  const lowStockItems = productCatalog.filter(p => {
    const minStock = p.minStock || 10;
    return p.stock > 0 && p.stock <= minStock;
  });
  const mediumStockItems = productCatalog.filter(p => p.stock > 10 && p.stock <= 30);
  const goodStockItems = productCatalog.filter(p => p.stock > 30);
  
  const modalHTML = `
  <div id="viewStockModal" class="stock-modal">
    <div class="stock-modal-content wide">
      <div class="stock-modal-header">
        <div class="stock-modal-title">
          <i class="fas fa-clipboard-list"></i>
          <h2>Current Stock Levels</h2>
        </div>
        <button class="stock-modal-close" onclick="closeViewStockModal()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="stock-modal-body">
        <div class="stock-stats-grid">
          <div class="stat-card out-of-stock">
            <div class="stat-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">Out of Stock</div>
              <div class="stat-value">${outOfStockItems.length}</div>
              <div class="stat-label">Items</div>
            </div>
          </div>
          
          <div class="stat-card low-stock">
            <div class="stat-icon">
              <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">Low Stock</div>
              <div class="stat-value">${lowStockItems.length}</div>
              <div class="stat-label">Items</div>
            </div>
          </div>
          
          <div class="stat-card medium-stock">
            <div class="stat-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">Medium Stock</div>
              <div class="stat-value">${mediumStockItems.length}</div>
              <div class="stat-label">Items</div>
            </div>
          </div>
          
          <div class="stat-card good-stock">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-title">Good Stock</div>
              <div class="stat-value">${goodStockItems.length}</div>
              <div class="stat-label">Items</div>
            </div>
          </div>
        </div>
        
        <div class="stock-table-header">
          <div>
            <h3>Stock Details</h3>
            <p class="subtitle">Showing ${productCatalog.length} total products</p>
          </div>
          <button class="btn-export" onclick="exportStockReport()">
            <i class="fas fa-file-export"></i> Export Report
          </button>
        </div>
        
        <div class="stock-table-container">
          <table class="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Status</th>
                <th>Quantity Needed</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${productCatalog.map(product => {
                const minStock = product.minStock || 10;
                let status = '';
                let statusClass = '';
                
                if (product.stock <= 0) {
                  status = 'OUT OF STOCK';
                  statusClass = 'status-out';
                } else if (product.stock <= minStock) {
                  status = 'LOW STOCK';
                  statusClass = 'status-low';
                } else if (product.stock <= 30) {
                  status = 'MEDIUM';
                  statusClass = 'status-medium';
                } else {
                  status = 'GOOD';
                  statusClass = 'status-good';
                }
                
                return `
                <tr>
                  <td>
                    <div class="product-name">${product.name}</div>
                    <div class="product-unit">Unit: ${product.unit}</div>
                  </td>
                  <td class="product-category">${product.category}</td>
                  <td>
                    <div class="stock-amount">
                      <span class="stock-number">${product.stock}</span>
                      <span class="stock-unit">${product.unit}</span>
                    </div>
                  </td>
                  <td class="min-stock">${minStock} ${product.unit}</td>
                  <td>
                    <span class="status-badge ${statusClass}">${status}</span>
                  </td>
                  <td>
                    <input type="number" 
                           min="0" 
                           value="0" 
                           class="quantity-input"
                           data-product="${product.name}"
                           style="width: 80px; padding: 6px 8px; border: 1px solid #ddd; border-radius: 4px;"
                           placeholder="Qty">
                  </td>
                  <td>
                    <button class="btn-request-item" onclick="requestFromViewStock('${product.name}')">
                      <i class="fas fa-plus"></i> Request
                    </button>
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="stock-modal-footer">
        <div class="footer-left">
          <i class="fas fa-sync-alt"></i>
          Last updated: ${new Date().toLocaleTimeString()}
        </div>
        <div class="footer-right">
          <button class="btn-secondary" onclick="closeViewStockModal()">
            Close
          </button>
          <button class="btn-primary" onclick="refreshStockData()">
            <i class="fas fa-redo"></i> Refresh
          </button>
        </div>
      </div>
    </div>
  </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add CSS for the modal
  addStockModalStyles();
  
  // Show modal with animation
  setTimeout(() => {
    const modal = document.getElementById('viewStockModal');
    if (modal) {
      modal.classList.add('show');
    }
  }, 10);
}

// New function to handle requests from view stock modal
function requestFromViewStock(productName) {
  // Get the input field for this product
  const inputSelector = `input[data-product="${productName}"]`;
  const inputField = document.querySelector(inputSelector);
  
  if (!inputField) {
    alert(`Could not find input field for ${productName}`);
    return;
  }
  
  const quantity = parseInt(inputField.value);
  
  if (isNaN(quantity) || quantity <= 0) {
    alert(`Please enter a valid quantity for ${productName}`);
    inputField.focus();
    return;
  }
  
  // Find the product in catalog
  const product = productCatalog.find(p => p.name === productName);
  if (!product) {
    alert(`Product not found: ${productName}`);
    return;
  }
  
  // Close view modal
  closeViewStockModal();
  
  // Show request modal with pre-filled data
  showRequestStockModal();
  
  // Set values after a short delay to ensure modal is loaded
  setTimeout(() => {
    const select = document.getElementById('requestStockProduct');
    if (select) {
      select.value = productName;
      updateRequestStockDetails();
    }
    
    const quantityInput = document.getElementById('requestQuantity');
    if (quantityInput) {
      quantityInput.value = quantity;
      validateRequestQuantity();
    }
    
    // Focus on notes for quick editing
    const notesInput = document.getElementById('requestNotes');
    if (notesInput) {
      notesInput.focus();
    }
  }, 100);
}

// Add CSS styles for modals
function addStockModalStyles() {
  if (document.getElementById('stockModalStyles')) return;
  
  const styles = `
  <style id="stockModalStyles">
  .stock-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .stock-modal.show {
    opacity: 1;
    visibility: visible;
  }
  
  .stock-modal-content {
    background: white;
    padding: 25px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    transform: translateY(20px);
    transition: transform 0.3s ease;
  }
  
  .stock-modal.show .stock-modal-content {
    transform: translateY(0);
  }
  
  .stock-modal-content.wide {
    max-width: 900px;
  }
  
  .stock-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #4f46e5;
  }
  
  .stock-modal-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .stock-modal-title i {
    font-size: 24px;
    color: #4f46e5;
  }
  
  .stock-modal-title h2 {
    margin: 0;
    color: #374151;
    font-size: 20px;
  }
  
  .stock-modal-close {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .stock-modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .stock-modal-body {
    margin-bottom: 25px;
  }
  
  .stock-alert-info {
    background: #f0f9ff;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #3b82f6;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  
  .stock-alert-info i {
    color: #3b82f6;
    font-size: 18px;
    margin-top: 2px;
  }
  
  .stock-alert-info h4 {
    margin: 0 0 5px 0;
    color: #1e40af;
    font-size: 16px;
  }
  
  .stock-alert-info p {
    margin: 0;
    color: #4b5563;
    font-size: 14px;
    line-height: 1.4;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .form-group label i {
    color: #6b7280;
  }
  
  .select-wrapper {
    position: relative;
  }
  
  .select-wrapper select {
    width: 100%;
    padding: 12px 40px 12px 12px;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }
  
  .select-wrapper select:focus {
    outline: none;
    border-color: #4f46e5;
  }
  
  .select-wrapper i {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
    pointer-events: none;
  }
  
  .low-stock-option {
    background-color: #fef2f2;
    color: #dc2626;
  }
  
  .stock-details-card {
    background: #f9fafb;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 2px solid #e5e7eb;
    display: none;
  }
  
  .stock-details-card.show {
    display: block;
  }
  
  .stock-details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .stock-detail-item {
    display: flex;
    flex-direction: column;
  }
  
  .detail-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
  }
  
  .detail-value {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
  }
  
  .detail-value.min-stock {
    color: #ef4444;
  }
  
  .detail-value.status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    display: inline-block;
    width: fit-content;
  }
  
  input[type="number"], textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  
  input[type="number"]:focus, textarea:focus {
    outline: none;
    border-color: #4f46e5;
  }
  
  textarea {
    resize: vertical;
    min-height: 80px;
  }
  
  .input-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }
  
  .hint {
    font-size: 12px;
    color: #6b7280;
  }
  
  .error-message {
    font-size: 12px;
    color: #ef4444;
    display: none;
  }
  
  .priority-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  
  .priority-option {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .priority-option input {
    display: none;
  }
  
  .priority-label {
    width: 100%;
    padding: 10px;
    text-align: center;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.2s;
  }
  
  .priority-option input:checked + .priority-label {
    border-color: currentColor;
  }
  
  .priority-label.low {
    color: #10b981;
  }
  
  .priority-label.medium {
    color: #f59e0b;
  }
  
  .priority-label.high {
    color: #ef4444;
  }
  
  .priority-label.urgent {
    color: #dc2626;
  }
  
  .stock-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }
  
  .btn-primary, .btn-secondary {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background: #4f46e5;
    color: white;
  }
  
  .btn-primary:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }
  
  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 2px solid #e5e7eb;
  }
  
  .btn-secondary:hover {
    background: #e5e7eb;
  }
  
  /* View Stock Modal Specific Styles */
  .stock-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 25px;
  }
  
  .stat-card {
    padding: 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 15px;
  }
  
  .stat-card.out-of-stock {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-left: 4px solid #ef4444;
  }
  
  .stat-card.low-stock {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-left: 4px solid #f59e0b;
  }
  
  .stat-card.medium-stock {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-left: 4px solid #0ea5e9;
  }
  
  .stat-card.good-stock {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-left: 4px solid #10b981;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }
  
  .stat-card.out-of-stock .stat-icon {
    background: #fecaca;
    color: #dc2626;
  }
  
  .stat-card.low-stock .stat-icon {
    background: #fde68a;
    color: #d97706;
  }
  
  .stat-card.medium-stock .stat-icon {
    background: #bae6fd;
    color: #0284c7;
  }
  
  .stat-card.good-stock .stat-icon {
    background: #bbf7d0;
    color: #059669;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-title {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 2px;
  }
  
  .stat-card.out-of-stock .stat-value {
    color: #dc2626;
  }
  
  .stat-card.low-stock .stat-value {
    color: #d97706;
  }
  
  .stat-card.medium-stock .stat-value {
    color: #0284c7;
  }
  
  .stat-card.good-stock .stat-value {
    color: #059669;
  }
  
  .stat-label {
    font-size: 12px;
    color: #9ca3af;
  }
  
  .stock-table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding: 15px;
    background: #f8fafc;
    border-radius: 8px;
  }
  
  .stock-table-header h3 {
    margin: 0;
    color: #374151;
    font-size: 18px;
  }
  
  .subtitle {
    margin: 5px 0 0 0;
    color: #6b7280;
    font-size: 14px;
  }
  
  .btn-export {
    padding: 10px 20px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }
  
  .btn-export:hover {
    background: #059669;
    transform: translateY(-1px);
  }
  
  .stock-table-container {
    max-height: 400px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
  
  .stock-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  .stock-table thead {
    background: #f9fafb;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .stock-table th {
    padding: 16px 12px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
    white-space: nowrap;
  }
  
  .stock-table tbody tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s;
  }
  
  .stock-table tbody tr:hover {
    background: #f9fafb;
  }
  
  .stock-table td {
    padding: 16px 12px;
    vertical-align: top;
  }
  
  .product-name {
    font-weight: 500;
    color: #374151;
    margin-bottom: 4px;
  }
  
  .product-unit {
    font-size: 12px;
    color: #6b7280;
  }
  
  .product-category {
    color: #4b5563;
  }
  
  .stock-amount {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  
  .stock-number {
    font-weight: 700;
    color: #1f2937;
    font-size: 16px;
  }
  
  .stock-unit {
    color: #6b7280;
    font-size: 12px;
  }
  
  .min-stock {
    color: #6b7280;
  }
  
  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: inline-block;
    white-space: nowrap;
  }
  
  .status-out {
    background: #fef2f2;
    color: #dc2626;
  }
  
  .status-low {
    background: #fffbeb;
    color: #d97706;
  }
  
  .status-medium {
    background: #f0f9ff;
    color: #0284c7;
  }
  
  .status-good {
    background: #f0fdf4;
    color: #059669;
  }
  
  .btn-request-item {
    padding: 8px 16px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }
  
  .btn-request-item:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }
  
  .stock-modal-footer .footer-left {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 14px;
  }
  
  .stock-modal-footer .footer-left i {
    color: #9ca3af;
  }
  
  .stock-modal-footer .footer-right {
    display: flex;
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    .stock-modal-content {
      width: 95%;
      padding: 20px;
      max-height: 90vh;
    }
    
    .stock-stats-grid {
      grid-template-columns: 1fr;
    }
    
    .priority-buttons {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .stock-details-grid {
      grid-template-columns: 1fr;
    }
    
    .stock-table-header {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }
    
    .stock-table {
      font-size: 12px;
    }
    
    .stock-table th,
    .stock-table td {
      padding: 12px 8px;
    }
  }
  
  @media (max-width: 480px) {
    .stock-modal-content {
      padding: 15px;
    }
    
    .stock-modal-title h2 {
      font-size: 18px;
    }
    
    .btn-primary, .btn-secondary {
      padding: 10px 16px;
      font-size: 13px;
    }
  }
  </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
}

// Close modal functions with animation
function closeRequestStockModal() {
  const modal = document.getElementById('requestStockModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

function closeViewStockModal() {
  const modal = document.getElementById('viewStockModal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// Update the other functions to work with new modal structure
function updateRequestStockDetails() {
  const select = document.getElementById('requestStockProduct');
  const detailsDiv = document.getElementById('stockDetails');
  const productName = select.value;
  
  if (!productName) {
    if (detailsDiv) detailsDiv.style.display = 'none';
    return;
  }
  
  const product = productCatalog.find(p => p.name === productName);
  if (!product || !detailsDiv) return;
  
  const currentStock = product.stock;
  const minStock = product.minStock || 10;
  const unit = product.unit;
  
  document.getElementById('currentStockValue').textContent = `${currentStock} ${unit}`;
  document.getElementById('minStockValue').textContent = `${minStock} ${unit}`;
  document.getElementById('stockUnit').textContent = unit;
  
  // Set stock status
  let statusText = '';
  let statusColor = '';
  let bgColor = '';
  
  if (currentStock <= 0) {
    statusText = 'OUT OF STOCK';
    statusColor = '#dc2626';
    bgColor = '#fef2f2';
  } else if (currentStock <= minStock) {
    statusText = 'LOW STOCK';
    statusColor = '#d97706';
    bgColor = '#fffbeb';
  } else if (currentStock <= 30) {
    statusText = 'MEDIUM';
    statusColor = '#0284c7';
    bgColor = '#f0f9ff';
  } else {
    statusText = 'GOOD';
    statusColor = '#059669';
    bgColor = '#f0fdf4';
  }
  
  const statusEl = document.getElementById('stockStatus');
  statusEl.textContent = statusText;
  statusEl.style.color = statusColor;
  statusEl.style.backgroundColor = bgColor;
  
  detailsDiv.style.display = 'block';
  detailsDiv.classList.add('show');
  
  // Auto-set request quantity based on stock level
  const requestQtyInput = document.getElementById('requestQuantity');
  if (requestQtyInput) {
    if (currentStock <= 0) {
      requestQtyInput.value = minStock * 3;
    } else if (currentStock <= minStock) {
      requestQtyInput.value = Math.max(minStock * 2 - currentStock, 10);
    } else {
      requestQtyInput.value = 10;
    }
    validateRequestQuantity();
  }
}

// Add keyboard shortcuts and escape to close
document.addEventListener('keydown', function(event) {
  // Escape key closes modals
  if (event.key === 'Escape') {
    closeRequestStockModal();
    closeViewStockModal();
  }
  
  // Alt + R for request stock
  if (event.altKey && event.key === 'r') {
    event.preventDefault();
    openRequestStock();
  }
  
  // Alt + V for view stock
  if (event.altKey && event.key === 'v') {
    event.preventDefault();
    openViewStock();
  }
});

// Close modals when clicking outside
document.addEventListener('click', function(event) {
  const requestModal = document.getElementById('requestStockModal');
  const viewModal = document.getElementById('viewStockModal');
  
  if (requestModal && event.target === requestModal) {
    closeRequestStockModal();
  }
  
  if (viewModal && event.target === viewModal) {
    closeViewStockModal();
  }
});

// Create product card - NO ANIMATIONS, DISABLE IF OUT OF STOCK
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'compact-product-card';
  
  const isOutOfStock = product.stock <= 0;
  
  // DISABLE CLICK IF OUT OF STOCK
  if (isOutOfStock) {
    card.classList.add('out-of-stock');
    card.style.cursor = 'not-allowed';
    card.style.opacity = '0.6';
    card.style.pointerEvents = 'none';
  } else {
    card.style.cursor = 'pointer';
    card.style.opacity = '1';
    card.style.pointerEvents = 'auto';
    card.onclick = () => addItemToOrder(product.name, product.price, product.stock);
  }

  // TANGGALIN ANG MGA REDUNDANT STOCK DISPLAY
  // ISANG STOCK STATUS LANG ANG IPAPAKITA
  
  let stockStatus = '';
  let stockClass = '';
  
  if (product.stock <= 0) {
    stockStatus = 'Out of Stock';
    stockClass = 'out-stock';
  } else if (product.stock <= 10) {
    stockStatus = `${product.stock} ${product.unit} left`;
    stockClass = 'low-stock';
  } else if (product.stock <= 30) {
    stockStatus = `${product.stock} ${product.unit}`;
    stockClass = 'medium-stock';
  } else {
    stockStatus = `${product.stock} ${product.unit} available`;
    stockClass = 'high-stock';
  }

  card.innerHTML = `
    <img src="/images/${product.image}" 
         onerror="this.onerror=null; this.src='/images/default_food.jpg';" 
         alt="${product.name}" />
    <div class="compact-product-name">${product.name}</div>
    <div class="compact-product-category">${product.category}</div>
    <div class="compact-product-price">₱${product.price}</div>
    <!-- ISANG STOCK STATUS LANG DITO -->
    <div class="compact-product-stock ${stockClass}">
      ${stockStatus}
    </div>
  `;
  
  return card;
}

function addItemToOrder(name, price, stock) {
  const product = productCatalog.find(p => p.name === name);
  
  if (!product) {
    alert('Product Not Found In Menu');
    return;
  }
  
  // CHECK IF OUT OF STOCK
  if (product.stock <= 0) {
    alert(`Sorry, ${name} is out of stock!`);
    return;
  }
  
  const existingItem = currentOrder.find(i => i.name === name);
  
  const currentQuantity = existingItem ? existingItem.quantity : 0;
  if (currentQuantity >= product.stock) {
    alert(`Only ${product.stock} ${product.unit} of ${name} available in stock!`);
    return;
  }
  
  if (existingItem) {
    existingItem.quantity++;
  } else {
    currentOrder.push({ 
      name, 
      price, 
      quantity: 1, 
      stock: product.stock, 
      unit: product.unit, 
      vatable: product.vatable,
      _id: product._id,
      image: product.image 
    });
  }
  
  // PERMANENTLY update stock
  product.stock--;
  
  // Update display WITHOUT ANIMATION
  updateStockDisplay(name, product.stock);
  
  renderOrder();
  updateInputPaymentField();
  updatePayButtonState();
  
  console.log(`Added ${name}. Stock: ${product.stock}`);
}

function removeItemFromOrder(index) {
  const item = currentOrder[index];
  
  if (item.quantity > 1) {
    item.quantity--;
    // Update stock permanently
    updateStockOnRemoval(item.name, 1);
  } else {
    currentOrder.splice(index, 1);
    // Update stock permanently
    updateStockOnRemoval(item.name, 1);
  }
  
  renderOrder();
  updateInputPaymentField();
  updatePayButtonState();
}

function renderOrder() {
  const list = document.getElementById('productlist');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('totals');

  if (!list) {
    console.error('productlist element not found!');
    return;
  }

  list.innerHTML = '';
  let subtotal = 0;
  let vatableAmount = 0;

  currentOrder.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    if (item.vatable) {
      vatableAmount += itemTotal;
    }

    const product = productCatalog.find(p => p.name === item.name);
    const remainingStock = product ? product.stock : 0;
    
    list.innerHTML += `
      <li>
        <div class="order-item-info">
          <span class="order-item-name">${item.name}</span>
          <span class="order-item-stock">Available: ${remainingStock} ${item.unit || 'left'}</span>
        </div>
        <div class="order-item-controls">
          <span class="order-item-quantity">x${item.quantity}</span>
          <span class="order-item-price">₱${itemTotal.toFixed(2)}</span>
          <button onclick="removeItemFromOrder(${index})" class="remove-item-btn">✕</button>
        </div>
      </li>`;
  });

  const fixedTax = 0;
  const total = subtotal + fixedTax;

  if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = '₱0.12';
  if (totalEl) totalEl.textContent = `${total.toFixed(2)}`;
  
  updatePayButtonState();
}

// Update stock display - NO ANIMATIONS
function updateStockDisplay(productName, newStock) {
  const product = productCatalog.find(p => p.name === productName);
  if (!product) return;
  
  product.stock = newStock;
  
  // Update all instances of this product in the menu
  const menuContainer = document.getElementById('menuContainer');
  if (menuContainer) {
    const productCards = menuContainer.querySelectorAll('.compact-product-card');
    
    productCards.forEach(card => {
      const nameElement = card.querySelector('.compact-product-name');
      if (nameElement && nameElement.textContent === productName) {
        const stockElement = card.querySelector('.compact-product-stock');
        if (stockElement) {
          // Update stock status
          let stockStatus = '';
          let stockClass = '';
          
          if (newStock <= 0) {
            stockStatus = 'Out of Stock';
            stockClass = 'out-stock';
            
            // Disable the card
            card.classList.add('out-of-stock');
            card.style.cursor = 'not-allowed';
            card.style.opacity = '0.6';
            card.style.pointerEvents = 'none';
            card.onclick = null;
          } else if (newStock <= 10) {
            stockStatus = `${newStock} ${product.unit} left`;
            stockClass = 'low-stock';
            
            // Enable the card
            card.classList.remove('out-of-stock');
            card.style.cursor = 'pointer';
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.onclick = () => addItemToOrder(productName, product.price, newStock);
          } else if (newStock <= 30) {
            stockStatus = `${newStock} ${product.unit}`;
            stockClass = 'medium-stock';
            
            // Enable the card
            card.classList.remove('out-of-stock');
            card.style.cursor = 'pointer';
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.onclick = () => addItemToOrder(productName, product.price, newStock);
          } else {
            stockStatus = `${newStock} ${product.unit} available`;
            stockClass = 'high-stock';
            
            // Enable the card
            card.classList.remove('out-of-stock');
            card.style.cursor = 'pointer';
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
            card.onclick = () => addItemToOrder(productName, product.price, newStock);
          }
          
          stockElement.textContent = stockStatus;
          stockElement.className = `compact-product-stock ${stockClass}`;
        }
      }
    });
  }
  
  // Update order list
  updateOrderStockDisplay(productName, newStock);
}

// Update stock in order list
function updateOrderStockDisplay(productName, newStock) {
  const orderItems = document.querySelectorAll('.order-item-info');
  orderItems.forEach(item => {
    const nameElement = item.querySelector('.order-item-name');
    if (nameElement && nameElement.textContent === productName) {
      const stockElement = item.querySelector('.order-item-stock');
      if (stockElement) {
        const product = productCatalog.find(p => p.name === productName);
        if (product) {
          stockElement.textContent = `Available: ${newStock} ${product.unit}`;
        }
      }
    }
  });
}

// Update stock on removal
function updateStockOnRemoval(name, quantity) {
  const product = productCatalog.find(p => p.name === name);
  if (!product) return;
  
  product.stock += quantity;
  updateStockDisplay(name, product.stock);
}

// PERMANENT STOCK UPDATE AFTER PAYMENT
async function updateStockAfterPayment() {
  console.log('📦 Updating stock permanently after payment...');
  
  try {
    // Update stock sa server
    for (const orderItem of currentOrder) {
      const product = productCatalog.find(p => p.name === orderItem.name);
      
      if (!product || !product.inventoryItemId) {
        console.warn(`Product not found or no inventory ID: ${orderItem.name}`);
        continue;
      }
      
      // Update stock sa server (permanent)
      const response = await fetch(`/api/inventory/finished/${product.inventoryItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currentStock: product.stock,
          lastUpdated: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log(`Stock updated permanently for ${product.name}: ${product.stock} ${product.unit}`);
      } else {
        console.error(`Failed to update stock for ${product.name}`);
      }
    }
    
    console.log('✅ Stock updated permanently');
    
  } catch (error) {
    console.error('Error updating stock:', error);
  }
}

function setDineIn() {
  orderType = "Dine In";
  
  const display = document.getElementById("orderTypeDisplay");
  if (display) display.textContent = orderType;
  
  const dineInBtn = document.querySelector('.dineinandtakeout-btn:nth-child(1)');
  const takeoutBtn = document.querySelector('.dineinandtakeout-btn:nth-child(2)');
  
  if (dineInBtn) dineInBtn.classList.add('active');
  if (takeoutBtn) takeoutBtn.classList.remove('active');
  
  const tableInput = document.getElementById('tableNumber');
  if (tableInput) {
    tableInput.placeholder = "Enter Table:";
    tableInput.value = '';
    tableInput.disabled = false;
  }
  
  updatePayButtonState();
}

function setTakeout() {
  orderType = "Take Out";
  
  const display = document.getElementById("orderTypeDisplay");
  if (display) display.textContent = orderType;
  
  const dineInBtn = document.querySelector('.dineinandtakeout-btn:nth-child(1)');
  const takeoutBtn = document.querySelector('.dineinandtakeout-btn:nth-child(2)');
  
  if (dineInBtn) dineInBtn.classList.remove('active');
  if (takeoutBtn) takeoutBtn.classList.add('active');
  
  const tableInput = document.getElementById('tableNumber');
  if (tableInput) {
    tableInput.value = 'Takeout';
    tableInput.disabled = true;
  }
  
  updatePayButtonState();
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method.toLowerCase();
  
  const buttons = document.querySelectorAll('.payment-method-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    btn.style.backgroundColor = '';
    btn.style.color = '';
  });
  
  const clickedButton = event ? event.currentTarget : null;
  
  if (clickedButton) {
    clickedButton.classList.add('active');
    clickedButton.style.backgroundColor = '#28a745';
    clickedButton.style.color = 'white';
  } else {
    const buttonsArray = Array.from(buttons);
    const selectedBtn = buttonsArray.find(btn => {
      const onclickAttr = btn.getAttribute('onclick');
      return onclickAttr && onclickAttr.toLowerCase().includes(method.toLowerCase());
    });
    
    if (selectedBtn) {
      selectedBtn.classList.add('active');
      selectedBtn.style.backgroundColor = '#28a745';
      selectedBtn.style.color = 'white';
    }
  }
  
  updatePaymentMethodDisplay();
  updateInputPaymentField();
}

function updatePaymentMethodDisplay() {
  const displayElement = document.getElementById("paymentMethodDisplay");
  
  if (displayElement) {
    let displayText = "None";
    
    switch(selectedPaymentMethod) {
      case 'cash':
        displayText = 'Cash';
        break;
      case 'gcash':
        displayText = 'GCash';
        break;
      default:
        if (selectedPaymentMethod) {
          displayText = selectedPaymentMethod.charAt(0).toUpperCase() + selectedPaymentMethod.slice(1);
        }
    }
    
    displayElement.textContent = displayText;
  }
}

function updateInputPaymentField() {
  const inputPayment = document.getElementById('inputPayment');
  const changeSection = document.getElementById('changeSection');
  
  if (!inputPayment) return;
  
  if (selectedPaymentMethod === 'cash' && currentOrder.length > 0) {
    inputPayment.disabled = false;
    inputPayment.placeholder = "Enter Cash Amount";
    inputPayment.value = '';
    inputPayment.oninput = calculateChange;
    
    setTimeout(() => {
      inputPayment.focus();
    }, 100);
  } else {
    inputPayment.disabled = true;
    inputPayment.placeholder = "Select Payment Method First";
    inputPayment.value = '';
    if (changeSection) changeSection.style.display = 'none';
  }
  
  updatePayButtonState();
}

function calculateChange() {
  const inputPayment = document.getElementById('inputPayment');
  const changeSection = document.getElementById('changeSection');
  const changeAmount = document.getElementById('changeAmount');
  const totalEl = document.getElementById('totals');
  
  if (!inputPayment || !changeSection || !changeAmount || !totalEl) return;
  
  const total = parseFloat(totalEl.textContent.replace('₱', '')) || 0;
  const paid = parseFloat(inputPayment.value) || 0;
  
  if (paid >= total && paid > 0) {
    const change = paid - total;
    changeAmount.textContent = change.toFixed(2);
    changeSection.style.display = 'block';
  } else {
    changeSection.style.display = 'none';
  }
  
  updatePayButtonState();
}

// Save order locally (fallback when offline)
function saveOrderLocally(orderData) {
  try {
    let pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    pendingOrders.push({
      ...orderData,
      _localId: Date.now().toString(),
      _synced: false,
      _timestamp: new Date().toISOString()
    });
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    console.log('Order saved locally for later sync');
  } catch (error) {
    console.error('Error saving order locally:', error);
  }
}

// Sync pending orders
async function syncPendingOrders() {
  try {
    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const unsyncedOrders = pendingOrders.filter(order => !order._synced);
    
    for (const order of unsyncedOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
          credentials: 'include'
        });
        
        if (response.ok) {
          order._synced = true;
          order._syncedAt = new Date().toISOString();
        }
      } catch (syncError) {
        console.error('Error syncing order:', syncError);
      }
    }
    
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders.filter(order => !order._synced)));
    
    if (unsyncedOrders.length > 0) {
      console.log(`Synced ${unsyncedOrders.filter(o => o._synced).length} pending orders`);
    }
  } catch (error) {
    console.error('Error syncing pending orders:', error);
  }
}

// Save order to MongoDB
async function saveOrderToMongoDB(orderData) {
  try {
    console.log('Saving order to MongoDB...');
    
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('Order saved to MongoDB:', result);
      return {
        success: true,
        orderId: result.orderId,
        orderNumber: result.orderNumber
      };
    } else {
      throw new Error(result.message || 'Failed to save order');
    }
  } catch (error) {
    console.error('Error saving order to MongoDB:', error);
    
    // Fallback: Try to save locally and sync later
    saveOrderLocally(orderData);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// COMPLETE PAYMENT - PERMANENT
async function completePayment(paymentMethod, total, paid, change, tableNumber) {
  console.log('Payment processing started...');
  
  // Calculate subtotal
  const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Prepare order data
  const orderData = {
    items: currentOrder.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: "Regular",
      image: item.image || 'default_food.jpg',
      id: item._id || null
    })),
    subtotal: subtotal,
    tax: 0,
    total: total,
    type: orderType || "Dine In",
    notes: "",
    payment: {
      method: paymentMethod,
      amountPaid: paid,
      change: change
    },
    tableNumber: tableNumber
  };
  
  console.log('Sending order data to server:', orderData);
  
  try {
    // 1. Save to MongoDB
    const saved = await saveOrderToMongoDB(orderData);
    
    if (saved.success) {
      // 2. PERMANENTLY update stock on server
      await updateStockAfterPayment();
      
      // 3. Print receipt
      await printReceipt({
        ...orderData,
        orderNumber: saved.orderNumber,
        tableNumber: tableNumber,
        paymentMethod: paymentMethod,
        amountPaid: paid,
        change: change,
        vatAmount: 0,
        vatableAmount: subtotal
      });
      
      // 4. Show success message
      alert(`✅ Payment Successful!\nOrder #: ${saved.orderNumber}\nTotal: ₱${total.toFixed(2)}`);
      
      // 5. Reset UI
      resetOrderUI();
      
    } else {
      alert('Error: ' + (saved.error || 'Failed to save order'));
    }
  } catch (error) {
    console.error('Error in completePayment:', error);
    alert('Payment processed but failed to save to database. Please inform admin.');
    resetOrderUI();
  }
}

// MAIN PAYMENT FUNCTION
function Payment() {
  console.log('=== PAYMENT PROCESS STARTED ===');
  
  if (!Array.isArray(currentOrder) || currentOrder.length === 0) {
    alert("Please Add Product First");
    return;
  }
  
  if (!orderType || orderType.trim() === '' || orderType === "None") {
    alert("Please Choose if Dine or Take Out");
    return;
  }
  
  if (!selectedPaymentMethod || selectedPaymentMethod.trim() === '') {
    alert("Please Select a payment method");
    return;
  }
  
  if (orderType === "Dine In") {
    const tableInput = document.getElementById('tableNumber');
    if (!tableInput || !tableInput.value.trim()) {
      alert("Please Enter table number");
      tableInput?.focus();
      return;
    }
  }
  
  // Show confirmation modal
  showOrderConfirmation();
}

function resetOrderUI() {
  currentOrder = [];
  
  renderOrder();
  renderMenu();
  
  // Set order type back to "None"
  setOrderTypeNone();
  
  const paymentMethodDisplayEl = document.getElementById("paymentMethodDisplay");
  if (paymentMethodDisplayEl) {
    paymentMethodDisplayEl.textContent = "None";
  }
  
  document.querySelectorAll('.payment-method-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.backgroundColor = '';
    btn.style.color = '';
  });
  
  const tableInput = document.getElementById('tableNumber');
  if (tableInput) {
    tableInput.value = '';
    tableInput.disabled = false;
    tableInput.placeholder = "Enter table #";
  }
  
  const inputPayment = document.getElementById('inputPayment');
  if (inputPayment) {
    inputPayment.value = '';
    inputPayment.disabled = true;
    inputPayment.placeholder = "Select payment method first";
  }
  
  const changeSection = document.getElementById('changeSection');
  if (changeSection) changeSection.style.display = 'none';
  
  selectedPaymentMethod = null;
  
  updatePayButtonState();
  
  console.log('UI reset successfully');
}

function printReceipt(orderData) {
  return new Promise((resolve) => {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const timeString = now.toLocaleTimeString('en-PH', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const companyName = "GRAY COUNTRYSIDE CAFE";
    const storeLocation = "JD Building, Crossing, Norzagaray, Bulacan, Norzagaray, Philippines, 3013";
    const tinNumber = "XXX-XXX-XXX-XXX";
    const posSerial = "POS001";
    const minNumber = now.getTime().toString().slice(-15);
    const cashier = "CASHIER001";
    
    const invoiceNumber = `SI-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
    const transactionNumber = `TRX-${now.getTime().toString().slice(-8)}`;
    
    const totalQuantity = orderData.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = orderData.subtotal;
    const totalDue = orderData.total;
    
    let itemsHTML = '';
    currentOrder.forEach(item => {
      const itemTotal = item.price * item.quantity;
      itemsHTML += `
        <div class="item-row">
          <div class="item-left">
            <span class="item-name">${item.name}</span>
          </div>
          <div class="item-right">
            <span class="item-price">${itemTotal.toFixed(2)}</span>
          </div>
        </div>
      `;
    });
    
    itemsHTML += `
      <div class="divider">---</div>
      
      <div class="subtotal-row">
        <span>SUB-TOTAL</span>
        <span>PHP ${subtotal.toFixed(2)}</span>
      </div>
      
      <div class="divider">---</div>
      
      <div class="total-due-row">
        <span>TOTAL DUE</span>
        <span>PHP ${totalDue.toFixed(2)}</span>
      </div>
    `;
    
    // Calculate VAT
    const vatableSales = orderData.vatableAmount || subtotal;
    const vatAmount = vatableSales > 0 ? vatableSales * 0.12 : 0.00;
    
    // VAT breakdown
    let vatHTML = '';
    if (vatableSales > 0) {
      vatHTML = `
        <div class="vat-breakdown">
          <div class="vat-row">
            <span>VATable Sales</span>
            <span>${vatableSales.toFixed(2)}</span>
          </div>
          <div class="vat-row">
            <span>VAT Amount (12%)</span>
            <span>${vatAmount.toFixed(2)}</span>
          </div>
        </div>
      `;
    } else {
      vatHTML = `
        <div class="vat-breakdown">
          <div class="vat-row">
            <span>VATable Sales</span>
            <span>0.00</span>
          </div>
          <div class="vat-row">
            <span>VAT Amount (12%)</span>
            <span>0.00</span>
          </div>
        </div>
      `;
    }

    const receiptContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>POS RECEIPT</title>
    <meta charset="UTF-8">
    <style>
      @media print {
        @page {
          size: 80mm auto;
          margin: 0;
          padding: 0;
        }
        
        body {
          width: 76mm;
          margin: 0 auto;
          padding: 1mm;
          font-family: 'Courier New', monospace;
          font-size: 9px;
          line-height: 1.2;
          background: white;
          letter-spacing: -0.5px;
        }
        
        .no-print {
          display: none !important;
        }
      }
      
      @media screen {
        body {
          font-family: 'Courier New', monospace;
          font-size: 9px;
          line-height: 1.2;
          width: 76mm;
          margin: 20px auto;
          padding: 5mm;
          border: 1px solid #ccc;
          background: white;
          letter-spacing: -0.5px;
        }
      }
      
      .receipt {
        width: 100%;
        max-width: 76mm;
      }
      
      .header {
        text-align: center;
        margin-bottom: 2px;
      }
      
      .company-name {
        font-weight: bold;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 1px;
      }
      
      .store-location {
        font-size: 8px;
        line-height: 1;
        margin: 1px 0;
      }
      
      .tin-info {
        font-size: 8px;
        margin: 2px 0;
        text-align: center;
        line-height: 1;
      }
      
      .receipt-title {
        text-align: center;
        font-size: 9px;
        font-weight: bold;
        margin: 3px 0;
      }
      
      .invoice-info {
        font-size: 8px;
        margin: 2px 0;
        text-align: center;
        line-height: 1;
      }
      
      .date-time {
        text-align: center;
        font-size: 8px;
        margin: 2px 0;
        line-height: 1;
      }
      
      .divider {
        text-align: center;
        margin: 2px 0;
        border-top: 1px dashed #000;
        border-bottom: 1px dashed #000;
        padding: 1px 0;
      }
      
      .order-type {
        text-align: center;
        font-size: 8px;
        margin: 2px 0;
        line-height: 1;
      }
      
      .items-list {
        margin: 3px 0;
      }
      
      .item-row {
        margin: 1px 0;
        line-height: 1.1;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      
      .item-left {
        flex: 1;
        display: flex;
        align-items: flex-start;
      }
      
      .item-right {
        flex-shrink: 0;
        text-align: right;
      }
      
      .item-name {
        display: inline-block;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .item-price {
        display: inline-block;
        min-width: 25px;
        text-align: right;
      }
      
      .subtotal-row {
        margin-top: 3px;
        padding-top: 2px;
        font-size: 8px;
        line-height: 1.1;
        display: flex;
        justify-content: space-between;
      }
      
      .total-due-row {
        margin-top: 2px;
        font-size: 9px;
        font-weight: bold;
        line-height: 1.1;
        display: flex;
        justify-content: space-between;
      }
      
      .payment-method {
        font-size: 8px;
        margin: 2px 0;
        text-align: center;
        line-height: 1;
      }
      
      .vat-breakdown {
        font-size: 8px;
        margin: 3px 0;
        padding-top: 2px;
        border-top: 1px dashed #000;
      }
      
      .vat-row {
        margin: 1px 0;
        display: flex;
        justify-content: space-between;
      }
      
      .footer {
        text-align: center;
        font-size: 7px;
        margin-top: 5px;
        padding-top: 3px;
        border-top: 1px solid #000;
        line-height: 1;
      }
      
      .thank-you {
        text-align: center;
        font-size: 8px;
        font-weight: bold;
        margin: 3px 0;
        line-height: 1;
      }
      
      .print-btn {
        display: block;
        width: 100%;
        padding: 8px;
        margin-top: 10px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
      }
      
      .print-btn:hover {
        background: #0056b3;
      }
      
      .close-btn {
        display: block;
        width: 100%;
        padding: 8px;
        margin-top: 5px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <div class="receipt">
      <div class="header">
        <div class="company-name">${companyName}</div>
        <div class="store-location">${storeLocation}</div>
      </div>
      
      <div class="tin-info">
        TIN: ${tinNumber}<br>
        POS: ${posSerial}<br>
        MIN#: ${minNumber}
      </div>
      
      <div class="receipt-title">RECEIPT</div>
      
      <div class="invoice-info">
        Trans# ${transactionNumber}<br>
        Cashier: ${cashier}
      </div>
      
      <div class="date-time">
        ${dateString} ${timeString} #02
      </div>
      
      <div class="divider">
        ---
      </div>
      
      <div class="order-type">
        ${orderData.type || 'DINE-IN'} ${orderData.tableNumber ? `(Table: ${orderData.tableNumber})` : ''}
      </div>
      
      <div class="items-list">
        ${itemsHTML}
      </div>
      
      <div class="payment-method">
        ${orderData.paymentMethod.toUpperCase()} ${orderData.amountPaid.toFixed(2)}
      </div>
      
      ${orderData.change > 0 ? `
        <div class="subtotal-row">
          <span>CHANGE</span>
          <span>PHP ${orderData.change.toFixed(2)}</span>
        </div>
      ` : ''}
      
      ${vatHTML}
      
      <div class="thank-you">
        THANK YOU. PLEASE COME AGAIN.
      </div>
      
      <div class="footer">
        ${dateString.replace(/\//g, '').replace(/(\d{2})(\d{2})(\d{4})/, '$3$1$2')}-${timeString}-00000<br>
      </div>
      
      <button class="print-btn no-print" onclick="window.print()">Print Receipt</button>
      <button class="close-btn no-print" onclick="window.close()">Close Window</button>
    </div>
    
    <script>
      setTimeout(function() {
        try {
          window.print();
        } catch(e) {
          console.log('Print failed:', e);
        }
      }, 500);
    </script>
  </body>
  </html>
`;
    
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.name = 'receiptFrame';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(receiptContent);
      iframeDoc.close();
      
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (printError) {
          console.log('Iframe print failed:', printError);
        }
        
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve();
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.log('Print failed:', error);
      resolve();
    }
  });
}

function clearCurrentOrder() {
  if (currentOrder.length === 0) {
    alert("No items to clear");
    return;
  }
  
  if (confirm(`Clear current order with ${currentOrder.length} item(s)?`)) {
    // Restore stock for all items
    currentOrder.forEach(item => {
      updateStockOnRemoval(item.name, item.quantity);
    });
    
    currentOrder = [];
    renderOrder();
    
    const inputPayment = document.getElementById('inputPayment');
    if (inputPayment) {
      inputPayment.value = '';
    }
    
    const changeSection = document.getElementById('changeSection');
    if (changeSection) {
      changeSection.style.display = 'none';
    }
    
    alert("Order cleared successfully");
    updatePayButtonState();
  }
}

function filterCategory(category) {
  const categoryMapping = {
    'all': 'all',
    'Rice Bowl Meals': 'Rice',
    'Hot Sizzlers': 'Sizzling',
    'Party Tray': 'Party',
    'Drinks': 'Drink',
    'Coffee': 'Cafe',
    'Milk Tea': 'Milk',
    'Frappe': 'Frappe',
    'Snack & Appetizer': 'Snack & Appetizer',
    'Budget Meals Served with Rice': 'Budget Meals Served with Rice',
    'Specialties': 'Specialties'
  };
  
  const actualCategory = categoryMapping[category] || category;
  currentCategory = actualCategory;
  console.log(`Filtering category: ${category} -> ${actualCategory}`);
  renderMenu();
  
  document.querySelectorAll('.category-btn').forEach(btn => {
    const btnCategory = btn.getAttribute('data-category');
    if (btnCategory === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Add CSS for stock status
document.head.insertAdjacentHTML('beforeend', `
<style>
  .compact-product-stock {
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 3px;
    display: inline-block;
    margin-top: 5px;
  }
  
  .high-stock {
    color: #28a745;
    background-color: rgba(40, 167, 69, 0.1);
  }
  
  .medium-stock {
    color: #ffc107;
    background-color: rgba(255, 193, 7, 0.1);
  }
  
  .low-stock {
    color: #fd7e14;
    background-color: rgba(253, 126, 20, 0.1);
  }
  
  .out-stock {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
  }
  
  .out-of-stock {
    opacity: 0.6;
    filter: grayscale(100%);
  }
  
  .out-of-stock img {
    filter: grayscale(100%);
  }
  
  .out-of-stock .compact-product-name {
    text-decoration: line-through;
    color: #999;
  }
</style>
`);

// ORDER CONFIRMATION POPUP
function showOrderConfirmation() {
  const orderType = document.getElementById('orderTypeDisplay').textContent;
  const paymentMethod = document.getElementById('paymentMethodDisplay').textContent;
  const total = parseFloat(document.getElementById('totals').textContent) || 0;
  const tableNumber = document.getElementById('tableNumber').value || 'N/A';
  
  const subtotal = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const popupHTML = `
  <div id="simpleOrderPopup" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  ">
    <div style="
      background: white;
      padding: 25px;
      border-radius: 10px;
      width: 90%;
      max-width: 450px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    ">
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 2px solid #374151;
        padding-bottom: 10px;
      ">
        <h2 style="margin: 0; color: #374151;">Order Confirmation</h2>
        <button onclick="closeSimplePopup()" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        ">×</button>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
          <div>
            <small style="color: #666;">Order Type</small>
            <div style="font-weight: bold;">${orderType}</div>
          </div>
          <div>
            <small style="color: #666;">Payment Method</small>
            <div style="font-weight: bold;">${paymentMethod}</div>
          </div>
        </div>
        
        ${tableNumber !== 'N/A' ? `
        <div style="margin-bottom: 10px;">
          <small style="color: #666;">Table Number</small>
          <div style="font-weight: bold;">${tableNumber}</div>
        </div>
        ` : ''}
        
        <div style="
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
          max-height: 200px;
          overflow-y: auto;
        ">
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>Subtotal:</span>
            <span>₱${subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>Tax:</span>
            <span>₱0.12</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>Total Amount:</span>
            <span style="font-weight: bold; font-size: 18px;">₱${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button onclick="closeSimplePopup()" style="
          flex: 1;
          padding: 12px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          color: #666;
        ">Cancel</button>
        <button onclick="confirmSimpleOrder()" style="
          flex: 1;
          padding: 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        ">Confirm Order</button>
      </div>
      
      <div style="
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px solid #eee;
        text-align: center;
        color: #888;
        font-size: 12px;
      ">
        © 2026 Permanent Stock System
      </div>
    </div>
  </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', popupHTML);
}

function closeSimplePopup() {
  const popup = document.getElementById('simpleOrderPopup');
  if (popup) {
    popup.remove();
  }
}

function confirmSimpleOrder() {
  const paymentMethod = document.getElementById('paymentMethodDisplay').textContent;
  const total = parseFloat(document.getElementById('totals').textContent) || 0;
  const tableNumber = document.getElementById('tableNumber').value || 'N/A';
  
  // Close popup first
  closeSimplePopup();
  
  if (paymentMethod === 'Cash') {
    const cashAmount = parseFloat(document.getElementById('inputPayment').value) || 0;
    
    if (cashAmount < total) {
      alert(`Insufficient payment. Total: ₱${total.toFixed(2)} | Paid: ₱${cashAmount.toFixed(2)}`);
      return;
    }
    
    const change = cashAmount - total;
    
    // Process cash payment
    completePayment('cash', total, cashAmount, change, tableNumber);
    
  } else if (paymentMethod === 'GCash') {
    // Process GCash payment
    completePayment('gcash', total, total, 0, tableNumber);
    
  } else {
    alert(`Unsupported payment method: ${paymentMethod}`);
  }
}

// Load notifications from server
async function loadNotifications() {
  try {
    const response = await fetch('/api/notifications', {
      credentials: 'include'
    });
    
    if (!response.ok) return;
    
    const result = await response.json();
    if (result.success) {
      notificationCenter = result.data;
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

// Make sure to close popup if user clicks outside
document.addEventListener('click', function(event) {
  const popup = document.getElementById('simpleOrderPopup');
  if (popup && event.target === popup) {
    closeSimplePopup();
  }
});