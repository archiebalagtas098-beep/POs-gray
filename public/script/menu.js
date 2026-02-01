// Menu Management - Connect Inventory Finished Products to Menu
let finishedProducts = [];
let menuItems = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu Management script loaded');
    initMenuSystem();
    loadFinishedProducts();
    // Start with empty menu items - don't auto-load
    menuItems = [];
    displayMenuItems();
    
    // Auto-refresh every 30 seconds to catch new finished products
    setInterval(() => {
        console.log('🔄 Auto-refreshing finished products for menu management...');
        loadFinishedProducts();
        loadMenuItems();
    }, 30000);
});

// Load all finished products from inventory
async function loadFinishedProducts() {
    try {
        const response = await fetch('/api/inventory/finished', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Failed to load finished products:', response.status);
            return;
        }

        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            finishedProducts = result.data;
            console.log('✅ Finished products loaded:', finishedProducts.length);
            displayAvailableInventory();
        }
    } catch (error) {
        console.error('Error loading finished products:', error);
    }
}

// Load existing menu items
async function loadMenuItems() {
    try {
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            console.error('Failed to load menu items:', response.status);
            return;
        }

        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            menuItems = result.data;
            console.log('✅ Menu items loaded:', menuItems.length);
            displayMenuItems();
        }
    } catch (error) {
        console.error('Error loading menu items:', error);
    }
}

// Display available inventory products that can be added to menu
function displayAvailableInventory() {
    const container = document.getElementById('availableInventoryContainer');
    if (!container) {
        return;
    }

    // Filter products already in menu
    const productsInMenu = menuItems.map(item => item.name.toLowerCase());
    const availableProducts = finishedProducts.filter(
        product => !productsInMenu.includes(product.itemName.toLowerCase())
    );

    if (availableProducts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #999;">
                All inventory products are already in the menu!
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px;">📦 Available Inventory Products (Not Yet in Menu)</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                ${availableProducts.map(product => `
                    <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; background: #f9f9f9;">
                        <h4 style="margin: 0 0 10px 0;">${product.itemName}</h4>
                        <div style="font-size: 12px; margin-bottom: 10px;">
                            <div style="margin: 5px 0;"><strong>Category:</strong> ${product.category}</div>
                            <div style="margin: 5px 0;"><strong>Stock:</strong> ${product.currentStock} ${product.unit}</div>
                            <div style="margin: 5px 0;"><strong>Price:</strong> ₱${product.price.toFixed(2)}</div>
                        </div>
                        <button onclick="addProductToMenu('${product._id}', '${product.itemName}', ${product.price}, '${product.category}')" 
                            style="width: 100%; padding: 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            ➕ Add to Menu
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Add a finished product to the menu
async function addProductToMenu(productId, name, price, category) {
    try {
        console.log(`Adding "${name}" to menu...`);
        
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                price: parseFloat(price),
                category: category,
                inventoryProductId: productId
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            showToast(`Error: ${error.message}`, 'error');
            return;
        }

        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ "${name}" added to menu successfully`);
            showToast(`"${name}" added to menu!`, 'success');
            loadMenuItems();
            displayAvailableInventory();
        }
    } catch (error) {
        console.error('Error adding product to menu:', error);
        showToast('Error adding product to menu', 'error');
    }
}

// Display current menu items
function displayMenuItems() {
    const tableBody = document.getElementById('menuTable');
    if (!tableBody) return;

    // Filter menu items based on current filter
    let filteredItems = menuItems;
    
    if (currentFilter !== 'all' && currentFilter !== '') {
        if (currentFilter === 'available') {
            filteredItems = menuItems.filter(item => item.status === 'available');
        } else if (currentFilter === 'hidden') {
            filteredItems = menuItems.filter(item => item.status === 'hidden');
        } else {
            filteredItems = menuItems.filter(item => item.category === currentFilter);
        }
    }

    // Show empty message if no items
    if (filteredItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    <p style="font-size: 16px; margin: 0;">No menu items yet.</p>
                    <p style="font-size: 14px; margin: 5px 0 0 0;">Start by adding inventory products above 👆</p>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = filteredItems.map((item, index) => {
        // Find if this menu item is linked to an inventory product
        const inventoryProduct = finishedProducts.find(
            p => p.itemName.toLowerCase() === item.name.toLowerCase()
        );
        
        const stockInfo = inventoryProduct 
            ? `${inventoryProduct.currentStock} ${inventoryProduct.unit}` 
            : 'N/A';
        
        const stockStatus = inventoryProduct ? (
            inventoryProduct.currentStock <= inventoryProduct.minStock 
                ? 'background: #fff3cd;' 
                : 'background: #d4edda;'
        ) : 'background: #e9ecef;';

        // Check if needs restock
        const needsRestock = inventoryProduct && 
                            inventoryProduct.minStock > 0 && 
                            inventoryProduct.currentStock <= inventoryProduct.minStock &&
                            inventoryProduct.currentStock > 0;
        
        const restockBtn = inventoryProduct ? (
            `<button onclick="openRestockModal('${inventoryProduct._id}', '${item.name}', ${inventoryProduct.currentStock}, ${inventoryProduct.minStock})" 
                style="padding: 6px 12px; margin-right: 5px; background: ${needsRestock ? '#ff6b6b' : '#ffc107'}; color: white; border: none; border-radius: 4px; cursor: pointer;">
                🔄 Restock
            </button>`
        ) : '';

        return `
            <tr>
                <td>${item.name}</td>
                <td>₱${item.price.toFixed(2)}</td>
                <td>${item.category}</td>
                <td style="${stockStatus} padding: 8px; border-radius: 4px;"><strong>${stockInfo}</strong></td>
                <td>
                    <span style="padding: 4px 8px; border-radius: 3px; font-size: 12px; background: ${item.status === 'available' ? '#d4edda' : '#f8d7da'}; color: ${item.status === 'available' ? '#155724' : '#721c24'};">
                        ${item.status}
                    </span>
                </td>
                <td>
                    ${restockBtn}
                    <button onclick="editMenuItem('${item._id}')" style="padding: 6px 12px; margin-right: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">✏️ Edit</button>
                    <button onclick="deleteMenuItem('${item._id}')" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function initMenuSystem() {
    // Modal elements
    const addItemBtn = document.getElementById('addItemBtn');
    const modal = document.getElementById('addItemModal') || document.getElementById('itemModal');
    
    // Check if essential elements exist
    if (!addItemBtn || !modal) {
        console.log('Note: Modal or Add button not found - may be using new menu management layout');
        setupFilterButtons();
        return;
    }
    
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = modal.querySelector('.cancel-btn') || document.getElementById('cancelBtn');
    const addItemForm = document.getElementById('addItemForm') || document.getElementById('itemForm');
    
    // Table elements
    const menuTable = document.getElementById('menuTable');
    const menuFooter = document.getElementById('menuFooter');
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter');
    
    // Setup filter buttons and modal handlers
    setupFilterButtons();
    
    if (addItemBtn) {
        addItemBtn.addEventListener('click', openAddModal);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (addItemForm) {
        addItemForm.addEventListener('submit', handleAddMenuItem);
    }
    
    // Setup restock modal event listeners
    const restockModal = document.getElementById('restockModal');
    const closeRestockBtn = document.getElementById('closeRestockModal');
    const cancelRestockBtn = document.getElementById('cancelRestockBtn');
    const completeRestockBtn = document.getElementById('completeRestockBtn');
    
    if (closeRestockBtn) {
        closeRestockBtn.addEventListener('click', closeRestockModal);
    }
    
    if (cancelRestockBtn) {
        cancelRestockBtn.addEventListener('click', closeRestockModal);
    }
    
    if (completeRestockBtn) {
        completeRestockBtn.addEventListener('click', completeRestock);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
        if (event.target === restockModal) {
            closeRestockModal();
        }
    });
}

// Setup filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            displayMenuItems();
        });
    });
}

// Open add menu modal
function openAddModal() {
    const modal = document.getElementById('addItemModal') || document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'block';
        const form = document.getElementById('addItemForm') || document.getElementById('itemForm');
        if (form) form.reset();
    }
}

// Close add menu modal
function closeModal() {
    const modal = document.getElementById('addItemModal') || document.getElementById('itemModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle adding new menu item from form
async function handleAddMenuItem(e) {
    e.preventDefault();
    
    const itemNameInput = document.getElementById('itemName');
    const itemCategoryInput = document.getElementById('itemCategory');
    const itemPriceInput = document.getElementById('itemPrice');
    
    if (!itemNameInput || !itemNameInput.value.trim() ||
        !itemCategoryInput || !itemCategoryInput.value ||
        !itemPriceInput || !itemPriceInput.value) {
        showToast('Please fill all required fields!', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: itemNameInput.value.trim(),
                price: parseFloat(itemPriceInput.value),
                category: itemCategoryInput.value
            }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const error = await response.json();
            showToast(`Error: ${error.message}`, 'error');
            return;
        }
        
        const result = await response.json();
        if (result.success) {
            showToast('Item added successfully!', 'success');
            closeModal();
            loadMenuItems();
        }
    } catch (error) {
        console.error('Error adding menu item:', error);
        showToast('Error adding menu item', 'error');
    }
}

// Logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = '/login';
    }
}

// Edit menu item
function editMenuItem(itemId) {
    const item = menuItems.find(m => m._id === itemId);
    if (!item) return;

    document.getElementById('itemName').value = item.name;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemCategories').value = item.category;
    document.getElementById('itemId').value = item._id;

    openAddModal();
}

// Delete menu item
async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
    }

    try {
        const response = await fetch(`/api/menu/${itemId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            showToast('Error deleting menu item', 'error');
            return;
        }

        const result = await response.json();
        
        if (result.success) {
            showToast('Menu item deleted successfully', 'success');
            loadMenuItems();
            displayAvailableInventory();
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showToast('Error deleting menu item', 'error');
    }
}

// Open restock modal
function openRestockModal(inventoryId, itemName, currentStock, minStock) {
    document.getElementById('restockItemName').value = itemName;
    document.getElementById('currentStockDisplay').value = currentStock;
    document.getElementById('minStockDisplay').value = minStock;
    document.getElementById('restockInventoryId').value = inventoryId;
    document.getElementById('restockQuantity').value = '';
    document.getElementById('restockNotes').value = '';
    document.getElementById('restockModal').style.display = 'block';
}

// Close restock modal
function closeRestockModal() {
    document.getElementById('restockModal').style.display = 'none';
}

// Complete restock - send to server
async function completeRestock() {
    const inventoryId = document.getElementById('restockInventoryId').value;
    const quantity = document.getElementById('restockQuantity').value;
    const notes = document.getElementById('restockNotes').value;
    
    if (!quantity || quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/inventory/${inventoryId}/restock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quantity: parseInt(quantity),
                notes: notes || ''
            })
        });

        if (!response.ok) {
            showToast('Error completing restock', 'error');
            return;
        }

        const result = await response.json();
        
        if (result.success) {
            showToast(`Restocked ${quantity} units successfully! New stock: ${result.newStock}`, 'success');
            closeRestockModal();
            loadFinishedProducts();
            loadMenuItems();
            displayMenuItems();
        }
    } catch (error) {
        console.error('Error completing restock:', error);
        showToast('Error completing restock', 'error');
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const restockModal = document.getElementById('restockModal');
    if (event.target === restockModal) {
        closeRestockModal();
    }
};

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        padding: 12px 20px;
        margin: 10px;
        border-radius: 4px;
        color: white;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        animation: slideIn 0.3s ease;
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
