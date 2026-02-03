// Order History Page Script - PROPERLY FIXED VERSION

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
const inventoryTimestamp = document.getElementById('inventoryTimestamp');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Order History page loaded');
    
    // Verify all DOM elements exist
    verifyDOMElements();
    
    // Load initial data
    loadOrders();
    fetchInventoryItems();
    fetchAllMenuItems();
    
    // Setup event listeners
    setupEventListeners();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        console.log('🔄 Auto-refresh triggered');
        refreshData();
    }, 30000);
});

// ==================== DOM VERIFICATION ====================
function verifyDOMElements() {
    const requiredElements = [
        'ordersTableBody', 'noOrdersMessage', 'pagination',
        'topItemsTableBody', 'inventoryStatusBody', 'todaysOrdersBody'
    ];
    
    console.log('🔍 Verifying DOM elements:');
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`  - ${id}:`, element ? '✓ Found' : '✗ NOT FOUND');
    });
}

// ==================== SETUP EVENT LISTENERS ====================
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchOrders(e.target.value);
        });
    }
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
            
            // Log sample orders for debugging
            if (allOrders.length > 0) {
                console.log('📋 Sample orders:');
                allOrders.slice(0, 3).forEach((order, i) => {
                    console.log(`  ${i + 1}. ${order.orderNumber || 'N/A'} - ${order.customerName || 'Walk-in'} - ₱${order.totalAmount || 0}`);
                });
            }
            
            filteredOrders = [...allOrders];
            currentPage = 1;
            
            // Update all displays
            updateAllDisplays();
            
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

// ==================== UPDATE ALL DISPLAYS ====================
function updateAllDisplays() {
    displayOrders();
    updateTodaysOrdersTable();
    updateTopSellingProducts();
}

// ==================== TODAY'S ORDERS TABLE ====================
function updateTodaysOrdersTable() {
    console.log('🕒 Updating Today\'s Orders table...');
    
    if (!todaysOrdersBody) {
        console.error('❌ todaysOrdersBody not found!');
        return;
    }
    
    // Get today's date at midnight
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    console.log('📅 Today\'s date range:', todayStart);
    console.log('📊 Total orders to filter:', allOrders.length);
    
    // Filter today's orders
    const todaysOrders = allOrders.filter(order => {
        if (!order || !order.createdAt) return false;
        
        try {
            const orderDate = new Date(order.createdAt);
            const orderDateStart = new Date(
                orderDate.getFullYear(),
                orderDate.getMonth(),
                orderDate.getDate()
            );
            
            return orderDateStart.getTime() === todayStart.getTime();
        } catch (error) {
            console.warn('⚠️ Error parsing date for order:', order._id);
            return false;
        }
    });
    
    console.log('✅ Today\'s orders found:', todaysOrders.length);
    
    // Sort by most recent first
    todaysOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Display logic
    if (todaysOrders.length === 0) {
        todaysOrdersBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    No orders today
                </td>
            </tr>
        `;
        return;
    }
    
    // Limit to 6 most recent orders
    const displayOrders = todaysOrders.slice(0, 6);
    
    // Generate table HTML
    const tableHTML = displayOrders.map((order) => {
        // Format time
        let timeString = 'N/A';
        try {
            const orderTime = new Date(order.createdAt);
            timeString = orderTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).toLowerCase();
        } catch (error) {
            console.warn('⚠️ Invalid time for order:', order._id);
        }
        
        // Format customer name
        const customerName = order.customerName || 'Walk-in Customer';
        const displayCustomer = customerName.length > 15 
            ? customerName.substring(0, 15) + '...' 
            : customerName;
        
        // Format order number
        const orderNumber = order.orderNumber || 
                           (order._id ? `ORD-${order._id.substring(0, 6)}` : 'N/A');
        
        // Format total amount
        const totalAmount = parseFloat(order.totalAmount || order.total || 0);
        
        return `
        <tr>
            <td style="font-weight: 500;">${orderNumber}</td>
            <td style="text-align: center;">${timeString}</td>
            <td title="${customerName.replace(/"/g, '&quot;')}">${displayCustomer}</td>
            <td style="text-align: center; font-weight: 500;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    todaysOrdersBody.innerHTML = tableHTML;
    console.log('✅ Today\'s Orders table updated successfully');
}

// ==================== TOP SELLING PRODUCTS ====================
function updateTopSellingProducts() {
    console.log('📈 Updating top selling products...');
    
    if (!topItemsTableBody) {
        console.error('❌ topItemsTableBody not found!');
        return;
    }
    
    if (allMenuItems.length === 0) {
        topItemsTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    No menu items loaded
                </td>
            </tr>
        `;
        return;
    }
    
    // Calculate sales from all orders
    const salesMap = new Map();
    
    allOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                if (item && item.name) {
                    const itemName = item.name.trim();
                    const quantity = parseInt(item.quantity) || 1;
                    const price = parseFloat(item.price || item.unitPrice || 0);
                    
                    if (!salesMap.has(itemName)) {
                        salesMap.set(itemName, {
                            totalSold: 0,
                            totalRevenue: 0
                        });
                    }
                    
                    const current = salesMap.get(itemName);
                    current.totalSold += quantity;
                    current.totalRevenue += quantity * price;
                }
            });
        }
    });
    
    console.log('📊 Unique items with sales:', salesMap.size);
    
    // Prepare products list with sales data
    const productsWithSales = allMenuItems.map(menuItem => {
        const itemName = menuItem.name || menuItem.itemName || 'Unknown';
        const salesData = salesMap.get(itemName) || { totalSold: 0, totalRevenue: 0 };
        
        return {
            name: itemName,
            category: menuItem.category || 'Uncategorized',
            price: parseFloat(menuItem.price || 0),
            currentStock: parseFloat(menuItem.currentStock || menuItem.stock || 0),
            minStock: parseFloat(menuItem.minStock || 10),
            totalSold: salesData.totalSold,
            totalRevenue: salesData.totalRevenue,
            hasSales: salesData.totalSold > 0
        };
    });
    
    // Sort by revenue (highest first)
    productsWithSales.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Update table
    updateTopSellingTable(productsWithSales);
}

function updateTopSellingTable(products) {
    if (!topItemsTableBody) return;
    
    // Show top 10 products
    const displayProducts = products.slice(0, 10);
    
    if (displayProducts.length === 0) {
        topItemsTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    No products to display
                </td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = displayProducts.map((product, index) => {
        // Format name
        const displayName = product.name.length > 20 
            ? product.name.substring(0, 20) + '...' 
            : product.name;
        
        // Format category
        const categoryBadge = product.category ? 
            `<span style="font-size: 10px; color: #666;">${product.category}</span>` : '';
        
        // Format revenue or show "No sales"
        const revenueDisplay = product.hasSales 
            ? formatCurrency(product.totalRevenue)
            : `<span style="color: #999; font-size: 12px;">No sales yet</span>`;
        
        // Determine status
        let status = 'Normal';
        if (product.currentStock === 0) {
            status = 'Out of Stock';
        } else if (product.currentStock <= product.minStock) {
            status = 'Low Stock';
        }
        
        // Status color
        let statusColor = '#28a745'; // Green for normal
        if (status === 'Out of Stock') statusColor = '#dc3545'; // Red
        if (status === 'Low Stock') statusColor = '#ffc107'; // Yellow
        
        return `
        <tr>
            <td>
                <div style="font-weight: 500;">${displayName}</div>
                ${categoryBadge}
            </td>
            <td style="text-align: center;">${revenueDisplay}</td>
            <td style="text-align: center;">
                <span style="color: ${statusColor}; font-weight: 500;">${status}</span>
            </td>
            <td style="text-align: center;">
                <button onclick="viewProductDetails('${product.name.replace(/'/g, "\\'")}')" 
                        style="font-size: 11px; padding: 2px 8px;">
                    View
                </button>
            </td>
        </tr>
        `;
    }).join('');
    
    topItemsTableBody.innerHTML = tableHTML;
}

// ==================== INVENTORY STATUS ====================
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
            throw new Error(`Inventory API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            allInventoryItems = data.data || [];
            console.log('✅ Inventory items loaded:', allInventoryItems.length);
            updateInventoryStatus();
        } else {
            console.warn('⚠️ Inventory API returned success: false');
            allInventoryItems = [];
            updateInventoryStatus();
        }
        
    } catch (error) {
        console.error('❌ Error fetching inventory:', error);
        allInventoryItems = [];
        updateInventoryStatus();
    }
}

function updateInventoryStatus() {
    if (!inventoryStatusBody) {
        console.error('❌ inventoryStatusBody not found!');
        return;
    }
    
    console.log('📊 Updating inventory status...');
    
    // Update timestamp
    if (inventoryTimestamp) {
        const now = new Date();
        inventoryTimestamp.textContent = `Updated ${now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })}`;
    }
    
    // Filter low stock items
    const lowStockItems = allInventoryItems.filter(item => {
        if (!item) return false;
        
        const currentStock = parseFloat(item.currentStock || item.stock || 0);
        const minStock = parseFloat(item.minStock || 10);
        
        return currentStock <= minStock;
    }).sort((a, b) => {
        const stockA = parseFloat(a.currentStock || a.stock || 0);
        const stockB = parseFloat(b.currentStock || b.stock || 0);
        return stockA - stockB;
    });
    
    console.log('📦 Low stock items:', lowStockItems.length);
    
    if (lowStockItems.length === 0) {
        inventoryStatusBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px; color: #666;">
                    All items are well stocked
                </td>
            </tr>
        `;
        return;
    }
    
    // Show top 8 low stock items
    const displayItems = lowStockItems.slice(0, 8);
    
    const tableHTML = displayItems.map(item => {
        const itemName = item.itemName || item.name || 'Unknown';
        const currentStock = parseFloat(item.currentStock || item.stock || 0);
        const unit = item.unit || 'unit';
        
        // Format name
        const displayName = itemName.length > 20 
            ? itemName.substring(0, 20) + '...' 
            : itemName;
        
        // Determine status
        let status = 'Low';
        let statusColor = '#ffc107';
        
        if (currentStock === 0) {
            status = 'Out';
            statusColor = '#dc3545';
        } else if (currentStock <= 3) {
            status = 'Very Low';
            statusColor = '#fd7e14';
        }
        
        return `
        <tr>
            <td>${displayName}</td>
            <td style="text-align: center;">${currentStock} ${unit}</td>
            <td style="text-align: center;">
                <span style="color: ${statusColor}; font-weight: 500;">${status}</span>
            </td>
        </tr>
        `;
    }).join('');
    
    inventoryStatusBody.innerHTML = tableHTML;
}

// ==================== DISPLAY ORDERS TABLE ====================
function displayOrders() {
    if (!ordersTableBody || !noOrdersMessage) return;
    
    if (filteredOrders.length === 0) {
        displayNoOrders();
        return;
    }
    
    // Sort by date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    // Clear and populate table
    ordersTableBody.innerHTML = '';
    
    pageOrders.forEach(order => {
        const itemsCount = order.items?.length || 0;
        const totalAmount = parseFloat(order.totalAmount || order.total || 0);
        const paymentMethod = order.paymentMethod || 'Cash';
        const status = order.status || 'Pending';
        
        // Format date
        let dateString = 'N/A';
        try {
            dateString = new Date(order.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.warn('⚠️ Invalid date for order:', order._id);
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber || (order._id ? `ORD-${order._id.substring(0, 8)}` : 'N/A')}</td>
            <td>${order.customerName || 'Walk-in Customer'}</td>
            <td style="text-align: center;">${itemsCount} items</td>
            <td style="text-align: center;">${formatCurrency(totalAmount)}</td>
            <td style="text-align: center;">
                <span class="status-${status.toLowerCase()}">${status}</span>
            </td>
            <td>${dateString}</td>
            <td style="text-align: center;">${paymentMethod}</td>
            <td style="text-align: center;">
                <button onclick="viewOrderDetails('${order._id}')" class="view-btn">View</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
    
    // Show/hide elements
    if (ordersTable) ordersTable.style.display = 'table';
    noOrdersMessage.style.display = 'none';
    updatePagination(totalPages);
}

function displayNoOrders() {
    if (ordersTable) ordersTable.style.display = 'none';
    if (noOrdersMessage) {
        noOrdersMessage.style.display = 'block';
        noOrdersMessage.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <p style="font-size: 16px; margin-bottom: 10px;">No orders found</p>
                <p style="font-size: 14px;">Try adjusting your search or check back later</p>
            </div>
        `;
    }
    if (pagination) pagination.style.display = 'none';
}

function updatePagination(totalPages) {
    if (!pagination || !currentPageSpan || !totalPagesSpan) return;
    
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages;
    } else {
        pagination.style.display = 'none';
    }
}

// ==================== HELPER FUNCTIONS ====================
function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₱0.00';
    }
    
    const numAmount = parseFloat(amount);
    return '₱' + numAmount.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function refreshData() {
    console.log('🔄 Refreshing all data...');
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
            `• ${item.name || 'Unknown'} x${item.quantity || 1} = ${formatCurrency((item.price || 0) * (item.quantity || 1))}`
        ).join('\n');
        
        alert(
            `ORDER DETAILS\n\n` +
            `Order #: ${order.orderNumber || 'N/A'}\n` +
            `Customer: ${order.customerName || 'Walk-in'}\n` +
            `Date: ${new Date(order.createdAt).toLocaleString()}\n` +
            `Status: ${order.status || 'Pending'}\n` +
            `Payment: ${order.paymentMethod || 'Cash'}\n` +
            `Total: ${formatCurrency(order.totalAmount || order.total || 0)}\n\n` +
            `ITEMS:\n${itemsList}`
        );
    } else {
        alert('Order not found!');
    }
}

function viewProductDetails(productName) {
    alert(`Product: ${productName}\n\nMore details coming soon...`);
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
            throw new Error(`Menu API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            allMenuItems = data.data || [];
            console.log('✅ Menu items loaded:', allMenuItems.length);
            updateTopSellingProducts();
        } else {
            console.warn('⚠️ Menu API returned success: false');
            allMenuItems = [];
        }
        
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        allMenuItems = [];
    }
}

// ==================== STYLES ====================
const styles = document.createElement('style');
styles.textContent = `
.status-completed { color: #28a745; font-weight: 500; }
.status-pending { color: #ffc107; font-weight: 500; }
.status-cancelled { color: #dc3545; font-weight: 500; }
.status-processing { color: #17a2b8; font-weight: 500; }

.view-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 4px 12px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
}

.view-btn:hover {
    background: #0056b3;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

th {
    background: #f8f9fa;
    font-weight: 600;
    padding: 12px;
    border-bottom: 2px solid #dee2e6;
}

td {
    padding: 10px 12px;
    border-bottom: 1px solid #e9ecef;
}

.pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    padding: 10px;
}

.page-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 3px;
    cursor: pointer;
}

.page-btn:hover:not(:disabled) {
    background: #545b62;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
`;

document.head.appendChild(styles);

// ==================== EXPORT FUNCTIONS ====================
window.changePage = changePage;
window.searchOrders = searchOrders;
window.viewOrderDetails = viewOrderDetails;
window.refreshData = refreshData;
window.viewProductDetails = viewProductDetails;

console.log('✅ Order History script loaded successfully');