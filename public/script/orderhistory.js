// Order History Page Script - FIXED VERSION

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// Inventory variables
let allMenuItems = [];
let inventoryLowStockItems = [];
let allInventoryItems = [];

// DOM Elements
const ordersTable = document.getElementById('ordersTable');
const ordersTableBody = document.getElementById('ordersTableBody');
const noOrdersMessage = document.getElementById('noOrdersMessage');
const pagination = document.getElementById('pagination');
const topItemsTableBody = document.getElementById('topItemsTableBody');
const inventoryStatusBody = document.getElementById('inventoryStatusBody');
const todaysOrdersBody = document.getElementById('todaysOrdersBody');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const inventoryTimestamp = document.getElementById('inventoryTimestamp'); // Add this

// DEBUG: Check if elements exist on load
console.log('🔍 DOM Elements check on load:');
console.log('- todaysOrdersBody:', document.getElementById('todaysOrdersBody'));
console.log('- inventoryStatusBody:', document.getElementById('inventoryStatusBody'));
console.log('- topItemsTableBody:', document.getElementById('topItemsTableBody'));

// Load all data on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Order History page loaded');
    
    // Load initial data
    loadOrders();
    fetchInventoryItems();
    fetchAllMenuItems();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        console.log('🔄 Auto-refresh triggered');
        refreshData();
    }, 30000);
});

// ==================== FETCH INVENTORY ITEMS ====================
async function fetchInventoryItems() {
    try {
        console.log('📦 Fetching inventory items...');
        
        const response = await fetch('/api/inventory', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.warn('⚠️ Inventory API error:', response.status);
            allInventoryItems = [];
            updateInventoryStatus();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            allInventoryItems = data.data || [];
            console.log('✅ Inventory items loaded:', allInventoryItems.length);
            
            // Update inventory status table
            updateInventoryStatus();
            
        } else {
            console.warn('⚠️ Inventory API returned success:false');
            allInventoryItems = [];
            updateInventoryStatus();
        }
        
    } catch (error) {
        console.error('❌ Error fetching inventory items:', error);
        allInventoryItems = [];
        updateInventoryStatus();
    }
}

// ==================== INVENTORY STATUS TABLE ====================
function updateInventoryStatus() {
    if (!inventoryStatusBody) {
        console.error('❌ ERROR: inventoryStatusBody not found!');
        return;
    }
    
    console.log('📊 Updating inventory status table...');
    
    // Update timestamp if element exists
    if (inventoryTimestamp) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        inventoryTimestamp.textContent = `Updated ${timeString}`;
    }
    
    // Use inventory items (raw ingredients only)
    const rawIngredients = allInventoryItems.filter(item => 
        item && (item.itemType === 'raw' || !item.itemType)
    );
    
    console.log('📦 Raw ingredients found:', rawIngredients.length);
    
    // Filter low stock and out of stock items
    inventoryLowStockItems = rawIngredients.filter(item => {
        if (!item) return false;
        
        const currentStock = parseFloat(item.currentStock || item.stock || 0);
        const minStock = parseFloat(item.minStock || item.minimumStock || 10);
        return currentStock <= minStock;
    });
    
    // Sort by: 1) Out of stock first, 2) Lowest stock, 3) Alphabetical
    inventoryLowStockItems.sort((a, b) => {
        const stockA = parseFloat(a.currentStock || a.stock || 0);
        const stockB = parseFloat(b.currentStock || b.stock || 0);
        
        // Out of stock first
        if (stockA === 0 && stockB > 0) return -1;
        if (stockA > 0 && stockB === 0) return 1;
        
        // Then by stock level (lowest first)
        if (stockA !== stockB) return stockA - stockB;
        
        // Then alphabetically
        const nameA = (a.itemName || a.name || '').toLowerCase();
        const nameB = (b.itemName || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    console.log('📦 Low stock items found:', inventoryLowStockItems.length);
    
    if (inventoryLowStockItems.length === 0) {
        inventoryStatusBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px;">
                    All items are well stocked
                </td>
            </tr>
        `;
        return;
    }
    
    // Show top 8 low stock items
    const displayItems = inventoryLowStockItems.slice(0, 8);
    
    const tableHTML = displayItems.map((item) => {
        const itemName = item.itemName || item.name || 'Unnamed Item';
        const currentStock = parseFloat(item.currentStock || item.stock || 0);
        const unit = item.unit || 'kg';
        
        // Format stock display
        let stockDisplay = `${currentStock} ${unit}`;
        
        // Determine status
        let status = 'Low Stock';
        
        if (currentStock === 0) {
            status = 'Out of Stock';
        } else if (currentStock <= 5) {
            status = 'Very Low';
        }
        
        // Format item name (truncate if too long)
        const displayName = itemName.length > 20 
            ? itemName.substring(0, 20) + '...' 
            : itemName;
        
        return `
        <tr>
            <td>${displayName}</td>
            <td style="text-align: center;">${stockDisplay}</td>
            <td style="text-align: center;">${status}</td>
        </tr>
        `;
    }).join('');
    
    inventoryStatusBody.innerHTML = tableHTML;
    console.log('✅ Inventory status table updated');
}

// ==================== FETCH MENU ITEMS ====================
async function fetchAllMenuItems() {
    try {
        console.log('🍽️ Fetching menu items...');
        
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.warn('⚠️ Menu API error:', response.status);
            allMenuItems = [];
            updateTopSellingProducts();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            allMenuItems = data.data || [];
            console.log('✅ Menu items loaded:', allMenuItems.length);
            updateTopSellingProducts();
        } else {
            console.warn('⚠️ Menu API returned success:false');
            allMenuItems = [];
            updateTopSellingProducts();
        }
        
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        allMenuItems = [];
    }
}

// ==================== TOP SELLING PRODUCTS ====================
function updateTopSellingProducts() {
    if (!topItemsTableBody) {
        console.error('❌ ERROR: topItemsTableBody not found!');
        return;
    }
    
    console.log('📈 Updating top selling products...');
    console.log('- All menu items:', allMenuItems.length);
    console.log('- All orders:', allOrders.length);
    
    if (allMenuItems.length === 0 && allInventoryItems.length === 0) {
        topItemsTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px;">
                    No products available
                </td>
            </tr>
        `;
        return;
    }
    
    // Combine menu items with sales data from orders
    const combinedProducts = allMenuItems.map(item => {
        const itemName = item.name || item.itemName;
        const price = parseFloat(item.price) || 0;
        const currentStock = parseFloat(item.currentStock) || 0;
        
        // Calculate sales from completed orders
        let totalSold = 0;
        let totalRevenue = 0;
        
        // Filter only completed/paid orders
        const completedOrders = allOrders.filter(order => 
            order.status === 'completed' || order.paymentStatus === 'paid'
        );
        
        console.log('✅ Completed orders:', completedOrders.length);
        
        completedOrders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(orderItem => {
                    if (orderItem && orderItem.name === itemName) {
                        const quantity = parseInt(orderItem.quantity) || 1;
                        const itemPrice = parseFloat(orderItem.price) || price;
                        totalSold += quantity;
                        totalRevenue += quantity * itemPrice;
                    }
                });
            }
        });
        
        return {
            name: itemName,
            price: price,
            currentStock: currentStock,
            minStock: parseFloat(item.minStock) || 10,
            totalSold: totalSold,
            totalRevenue: totalRevenue,
            hasSales: totalSold > 0
        };
    });
    
    // Sort by revenue (highest first) - include ALL products, not just those with sales
    const sortedProducts = combinedProducts.sort((a, b) => {
        // Products with sales first
        if (a.hasSales && !b.hasSales) return -1;
        if (!a.hasSales && b.hasSales) return 1;
        
        // Then by total revenue (highest first)
        if (a.totalRevenue !== b.totalRevenue) {
            return b.totalRevenue - a.totalRevenue;
        }
        
        // Then by price (highest first)
        return b.price - a.price;
    }).slice(0, 8); // Show top 8
    
    console.log('📊 Top products sorted:', sortedProducts.length);
    
    const tableHTML = sortedProducts.map((product, index) => {
        // Determine status
        let status = 'New';
        
        if (product.hasSales) {
            if (product.totalSold >= 50) {
                status = 'Bestseller';
            } else if (product.totalSold >= 20) {
                status = 'Popular';
            } else if (product.totalSold >= 1) {
                status = 'Selling';
            }
        } else {
            if (product.currentStock <= 0) {
                status = 'Out of Stock';
            } else if (product.currentStock <= product.minStock) {
                status = 'Low Stock';
            }
        }
        
        // Format product name
        const displayName = product.name.length > 20 
            ? product.name.substring(0, 20) + '...' 
            : product.name;
        
        // Debug log
        console.log(`Product ${index + 1}:`, product.name, 'Sales:', product.totalSold, 'Revenue:', product.totalRevenue, 'Status:', status);
        
        return `
        <tr>
            <td>${displayName}</td>
            <td style="text-align: center;">${formatCurrency(product.totalRevenue)}</td>
            <td style="text-align: center;">${status}</td>
        </tr>
        `;
    }).join('');
    
    topItemsTableBody.innerHTML = tableHTML;
    console.log('✅ Top selling table updated');
}

// ==================== TODAY'S ORDERS TABLE ====================
function updateTodaysOrdersTable() {
    console.log('🕒 Updating Today\'s Orders table...');
    
    if (!todaysOrdersBody) {
        console.error('❌ CRITICAL ERROR: todaysOrdersBody element not found!');
        // Try to find it again
        const foundElement = document.getElementById('todaysOrdersBody');
        console.log('Search result for todaysOrdersBody:', foundElement);
        return;
    }
    
    // Get today's date
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    console.log('📅 Today\'s date (start):', todayStart);
    console.log('📦 Total orders loaded:', allOrders.length);
    
    // Filter today's orders
    const todaysOrders = allOrders.filter(order => {
        if (!order || !order.createdAt) return false;
        
        try {
            const orderDate = new Date(order.createdAt);
            const orderDateStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
            
            return orderDateStart.getTime() === todayStart.getTime();
        } catch (error) {
            console.warn('⚠️ Error parsing order date:', order.createdAt);
            return false;
        }
    });
    
    console.log('✅ Today\'s orders found:', todaysOrders.length);
    
    // Log sample of today's orders
    if (todaysOrders.length > 0) {
        console.log('📋 Sample of today\'s orders:');
        todaysOrders.slice(0, 3).forEach((order, i) => {
            console.log(`  ${i + 1}. ${order.orderNumber || 'N/A'} - ${order.customerName || 'N/A'} - ₱${order.totalAmount || 0}`);
        });
    }
    
    if (todaysOrders.length === 0) {
        todaysOrdersBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    No orders today
                </td>
            </tr>
        `;
        console.log('📭 No orders found for today');
        return;
    }
    
    // Sort by time (newest first) and limit to 6
    todaysOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const displayOrders = todaysOrders.slice(0, 6);
    
    const tableHTML = displayOrders.map((order, index) => {
        let orderTime = new Date();
        try {
            orderTime = new Date(order.createdAt);
        } catch (error) {
            console.warn('⚠️ Invalid order time:', order.createdAt);
        }
        
        const timeString = orderTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
        
        const totalAmount = parseFloat(order.totalAmount || order.total || 0);
        const customerName = order.customerName || 'Walk-in Customer';
        
        // Truncate customer name if too long
        const displayCustomer = customerName.length > 15 
            ? customerName.substring(0, 15) + '...' 
            : customerName;
        
        const orderNumber = order.orderNumber || 
                           `ORD-${order._id ? order._id.substring(0, 6) : 'N/A'}`;
        
        console.log(`📝 Adding order ${index + 1}:`, orderNumber, timeString, displayCustomer, totalAmount);
        
        return `
        <tr>
            <td>${orderNumber}</td>
            <td style="text-align: center;">${timeString}</td>
            <td title="${customerName}">${displayCustomer}</td>
            <td style="text-align: center;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    todaysOrdersBody.innerHTML = tableHTML;
    console.log('✅ Today\'s Orders table updated with', displayOrders.length, 'orders');
}

// ==================== LOAD ORDERS FROM API ====================
async function loadOrders() {
    try {
        console.log('📦 Loading orders from API...');
        
        const response = await fetch('/api/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            allOrders = result.data || [];
            console.log('✅ Orders loaded:', allOrders.length);
            
            // Debug: Show first few orders
            if (allOrders.length > 0) {
                console.log('📋 Sample orders loaded:');
                allOrders.slice(0, 3).forEach((order, i) => {
                    console.log(`  ${i + 1}. ${order.orderNumber || 'N/A'} - ${order.customerName || 'Walk-in'} - ₱${order.totalAmount || 0} - ${order.createdAt}`);
                });
            }
            
            filteredOrders = [...allOrders];
            currentPage = 1;
            displayOrders();
            updateTodaysOrdersTable(); // CALL THIS!
            updateTopSellingProducts(); // CALL THIS!
            
        } else {
            console.warn('⚠️ API returned success: false', result.message);
            allOrders = [];
            displayNoOrders();
        }
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        allOrders = [];
        displayNoOrders();
    }
}

// ==================== DISPLAY ORDERS TABLE ====================
function displayOrders() {
    if (!ordersTableBody || !noOrdersMessage) return;
    
    if (filteredOrders.length === 0) {
        displayNoOrders();
        return;
    }
    
    // Sort by date descending
    filteredOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    // Clear table body
    ordersTableBody.innerHTML = '';
    
    // Add rows
    pageOrders.forEach((order, index) => {
        const items = order.items || [];
        const itemsList = items.length > 0 
            ? `${items.length} items`
            : 'No items';
        
        const dateTime = new Date(order.createdAt || Date.now()).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const totalAmount = parseFloat(order.totalAmount || order.total || 0);
        const paymentMethod = order.paymentMethod || 'Cash';
        
        let statusText = order.status || 'Pending';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber || `ORD-${order._id ? order._id.substring(0, 8) : 'N/A'}`}</td>
            <td>${order.customerName || 'Walk-in Customer'}</td>
            <td style="text-align: center;">${itemsList}</td>
            <td style="text-align: center;">${formatCurrency(totalAmount)}</td>
            <td style="text-align: center;">${statusText}</td>
            <td>${dateTime}</td>
            <td style="text-align: center;">${paymentMethod}</td>
            <td style="text-align: center;">
                <button onclick="viewOrderDetails('${order._id}')">View</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
    
    // Show table and hide no orders message
    if (ordersTable) ordersTable.style.display = 'table';
    noOrdersMessage.style.display = 'none';
    
    // Update pagination
    updatePagination(totalPages);
}

function displayNoOrders() {
    if (ordersTable) ordersTable.style.display = 'none';
    if (noOrdersMessage) noOrdersMessage.style.display = 'block';
    if (pagination) pagination.style.display = 'none';
}

function updatePagination(totalPages) {
    if (!pagination) return;
    
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        if (currentPageSpan) currentPageSpan.textContent = currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    } else {
        pagination.style.display = 'none';
    }
}

// ==================== HELPER FUNCTIONS ====================
function formatCurrency(amount) {
    if (amount === undefined || amount === null) {
        return '₱0.00';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
        return '₱0.00';
    }

    return '₱' + numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function refreshData() {
    console.log('🔄 Manual refresh triggered');
    loadOrders();
    fetchInventoryItems();
    fetchAllMenuItems();
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayOrders();
    }
}

function searchOrders(query) {
    if (!query.trim()) {
        filteredOrders = [...allOrders];
    } else {
        const searchTerm = query.toLowerCase();
        filteredOrders = allOrders.filter(order => 
            (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm)) ||
            (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
            (order._id && order._id.toLowerCase().includes(searchTerm))
        );
    }
    currentPage = 1;
    displayOrders();
}

function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (order) {
        const items = order.items || [];
        const itemsList = items.map(item => 
            `${item.name || 'Unknown Item'} x${item.quantity || 1} - ${formatCurrency(item.price || 0)}`
        ).join('\n');
        
        alert(`Order #${order.orderNumber || 'N/A'}\n\n` +
              `Customer: ${order.customerName || 'Walk-in Customer'}\n` +
              `Date: ${new Date(order.createdAt).toLocaleString()}\n` +
              `Status: ${order.status || 'Pending'}\n` +
              `Total: ${formatCurrency(order.totalAmount || order.total || 0)}\n\n` +
              `Items:\n${itemsList}`);
    }
}

// ==================== TEST/DEBUG FUNCTIONS ====================
function testAllFunctions() {
    console.log('🧪 Testing all functions...');
    console.log('1. Testing Today\'s Orders:');
    updateTodaysOrdersTable();
    
    console.log('2. Testing Top Selling:');
    updateTopSellingProducts();
    
    console.log('3. Testing Inventory Status:');
    updateInventoryStatus();
    
    console.log('📊 Current data:');
    console.log('- All orders:', allOrders.length);
    console.log('- All menu items:', allMenuItems.length);
    console.log('- All inventory items:', allInventoryItems.length);
}

// ==================== MINIMAL CSS ====================
const minimalCSS = document.createElement('style');
minimalCSS.textContent = `
/* SIMPLE BLACK TEXT - NO STYLING */
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    color: #000000;
}

th {
    font-weight: 600;
    text-align: left;
    padding: 10px 12px;
    border-bottom: 2px solid #000000;
    color: #000000;
}

td {
    padding: 8px 12px;
    border-bottom: 1px solid #dddddd;
    vertical-align: middle;
    color: #000000;
}

.text-center {
    text-align: center;
}

button {
    background: none;
    border: 1px solid #000000;
    padding: 4px 8px;
    cursor: pointer;
    color: #000000;
    font-size: 12px;
}

button:hover {
    background: #f0f0f0;
}

.no-orders {
    text-align: center;
    padding: 40px;
    color: #000000;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    color: #000000;
}

.page-info {
    font-weight: 500;
}
`;

document.head.appendChild(minimalCSS);

// ==================== EXPORT FUNCTIONS ====================
window.changePage = changePage;
window.searchOrders = searchOrders;
window.viewOrderDetails = viewOrderDetails;
window.refreshData = refreshData;
window.testAllFunctions = testAllFunctions;

console.log('✅ Order History script loaded - FIXED Today\'s Orders Version');