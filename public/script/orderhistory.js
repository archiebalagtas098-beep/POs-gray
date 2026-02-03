// Order History Page Script

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// Inventory and Top Selling variables
let allMenuItems = [];
let inventoryLowStockItems = [];
let topSellingProducts = [];

// DOM Elements
const ordersTable = document.getElementById('ordersTable');
const ordersTableBody = document.getElementById('ordersTableBody');
const noOrdersMessage = document.getElementById('noOrdersMessage');
const pagination = document.getElementById('pagination');
const topItemsTableBody = document.getElementById('topItemsTableBody');
const inventoryTableBody = document.getElementById('inventoryTableBody');
const todaysOrdersBody = document.getElementById('todaysOrdersBody');

// Load all data on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Dashboard page loaded');
    
    // Load initial data
    loadOrders();
    fetchAllMenuItems();
    
    // Setup search functionality
    setupSearch();
    
    // Setup refresh button
    setupRefreshButton();
    
    // Setup view all orders link
    setupViewAllOrders();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        console.log('🔄 Auto-refreshing data...');
        loadOrders();
        fetchAllMenuItems();
    }, 30000);
});

// Fetch ALL menu items from database
async function fetchAllMenuItems() {
    try {
        console.log('🍽️ Fetching all menu items...');
        
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.warn('Failed to fetch menu items');
            allMenuItems = [];
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            allMenuItems = data.data || [];
            console.log('✅ Menu items loaded:', allMenuItems.length);
            
            // Update all inventory-related displays
            updateInventoryStatus();
            updateTopSellingProducts();
        }
        
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        allMenuItems = [];
    }
}

// Update Inventory Status table
function updateInventoryStatus() {
    if (!inventoryTableBody) return;
    
    // Filter low stock and out of stock items
    inventoryLowStockItems = allMenuItems.filter(item => {
        const currentStock = parseInt(item.currentStock) || 0;
        const minStock = parseInt(item.minStock) || 10;
        return currentStock <= minStock;
    });
    
    // Sort by stock level (lowest first)
    inventoryLowStockItems.sort((a, b) => {
        const stockA = parseInt(a.currentStock) || 0;
        const stockB = parseInt(b.currentStock) || 0;
        return stockA - stockB;
    });
    
    if (inventoryLowStockItems.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <div class="no-data">
                        <i class="fas fa-check-circle"></i>
                        <p>All items are well stocked</p>
                        <small>No low stock items</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Limit to top 10 low stock items
    const displayItems = inventoryLowStockItems.slice(0, 10);
    
    const tableHTML = displayItems.map((item) => {
        const itemName = item.name || item.itemName || 'Unnamed Product';
        const currentStock = parseInt(item.currentStock) || 0;
        const minStock = parseInt(item.minStock) || 10;
        const unit = item.unit || 'pcs';
        
        let status = 'Low Stock';
        let statusClass = 'status-lowstock';
        
        if (currentStock === 0) {
            status = 'Out of Stock';
            statusClass = 'status-outofstock';
        } else if (currentStock <= 5) {
            status = 'Very Low';
            statusClass = 'status-verylow';
        }
        
        // Format display name
        const displayName = itemName.length > 25 
            ? itemName.substring(0, 25) + '...' 
            : itemName;
        
        return `
        <tr>
            <td>
                <div class="inventory-item">
                    <div class="item-name" title="${itemName}">${displayName}</div>
                    <div class="item-category">${item.category || 'General'}</div>
                </div>
            </td>
            <td class="text-center">
                <div class="stock-info">
                    <span class="current-stock">${currentStock}</span>
                    <span class="stock-unit">${unit}</span>
                </div>
            </td>
            <td class="text-center">
                <span class="status-badge ${statusClass}">${status}</span>
            </td>
        </tr>
        `;
    }).join('');
    
    inventoryTableBody.innerHTML = tableHTML;
}

// Update Top Selling Products table - PROPER ALIGNMENT
function updateTopSellingProducts() {
    if (!topItemsTableBody) return;
    
    if (allMenuItems.length === 0) {
        topItemsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="no-data">
                        <i class="fas fa-chart-line"></i>
                        <p>No products available</p>
                        <small>Add products to your menu</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Combine menu items with sales data from orders
    const combinedProducts = allMenuItems.map(item => {
        const itemName = item.name || item.itemName;
        const price = parseFloat(item.price) || 0;
        const stock = parseInt(item.currentStock) || 0;
        const minStock = parseInt(item.minStock) || 10;
        
        // Calculate sales from completed orders
        let totalSold = 0;
        let totalRevenue = 0;
        
        allOrders.forEach(order => {
            if (order.status === 'completed' || order.paymentStatus === 'paid') {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach(orderItem => {
                        if (orderItem.name === itemName) {
                            const quantity = parseInt(orderItem.quantity) || 1;
                            const itemPrice = parseFloat(orderItem.price) || price;
                            totalSold += quantity;
                            totalRevenue += quantity * itemPrice;
                        }
                    });
                }
            }
        });
        
        return {
            name: itemName,
            price: price,
            stock: stock,
            minStock: minStock,
            category: item.category || 'General',
            totalSold: totalSold,
            totalRevenue: totalRevenue,
            hasSales: totalSold > 0
        };
    });
    
    // Sort: Products with sales first (by revenue), then others (by price)
    const sortedProducts = combinedProducts.sort((a, b) => {
        if (a.hasSales && !b.hasSales) return -1;
        if (!a.hasSales && b.hasSales) return 1;
        
        if (a.hasSales && b.hasSales) {
            return b.totalRevenue - a.totalRevenue;
        }
        
        return b.price - a.price; // Higher price first if no sales
    }).slice(0, 10); // Top 10
    
    const tableHTML = sortedProducts.map((product) => {
        // Determine status
        let status = 'New';
        let statusClass = 'status-new';
        
        if (product.hasSales) {
            if (product.totalSold >= 50) {
                status = 'Bestseller';
                statusClass = 'status-bestseller';
            } else if (product.totalSold >= 20) {
                status = 'Popular';
                statusClass = 'status-popular';
            } else if (product.totalSold >= 1) {
                status = 'Selling';
                statusClass = 'status-selling';
            }
        } else if (product.stock <= 0) {
            status = 'Out of Stock';
            statusClass = 'status-outofstock';
        } else if (product.stock <= product.minStock) {
            status = 'Low Stock';
            statusClass = 'status-lowstock';
        }
        
        // Format product name
        const displayName = product.name.length > 25 
            ? product.name.substring(0, 25) + '...' 
            : product.name;
        
        // Show sales info if available
        let detailsHTML = '';
        if (product.hasSales) {
            detailsHTML = `
                <div class="product-meta">
                    <span class="price-info">Price: ${formatCurrency(product.price)}</span>                </div>
            `;
        } else {
            detailsHTML = ``;
        }
        
        // PROPER ALIGNMENT - Each in its own column
        return `
        <tr>
            <td>
                <div class="product-info">
                    <div class="product-details">
                        <div class="product-name" title="${product.name}">${displayName}</div>
                        ${detailsHTML}
                    </div>
                </div>
            </td>
            <td class="text-center">
                ${product.hasSales ? formatCurrency(product.totalRevenue) : formatCurrency(0)}
            </td>
            <td class="text-center">
                <span class="status-badge ${statusClass}">${status}</span>
            </td>
        </tr>
        `;
    }).join('');
    
    topItemsTableBody.innerHTML = tableHTML;
}

// Update Today's Orders table
function updateTodaysOrdersTable() {
    if (!todaysOrdersBody) return;
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter today's orders
    const todaysOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt || Date.now());
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    }).slice(0, 5); // Show only 5
    
    if (todaysOrders.length === 0) {
        todaysOrdersBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <div class="no-data">
                        <i class="fas fa-shopping-cart"></i>
                        <p>No orders today</p>
                        <small>No orders placed yet today</small>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = todaysOrders.map((order) => {
        const orderTime = new Date(order.createdAt || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const totalAmount = parseFloat(order.totalAmount || order.total || 0);
        const customerName = order.customerName || 'Walk-in Customer';
        
        // Truncate customer name if too long
        const displayCustomer = customerName.length > 20 
            ? customerName.substring(0, 20) + '...' 
            : customerName;
        
        return `
        <tr>
            <td>${order.orderNumber || `ORD-${order._id ? order._id.substring(0, 8) : 'N/A'}`}</td>
            <td class="text-center">${timeString}</td>
            <td title="${customerName}">${displayCustomer}</td>
            <td class="text-center">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    todaysOrdersBody.innerHTML = tableHTML;
}

// Helper functions
function formatNumber(num) {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrency(amount) {
    if (amount === undefined || amount === null) {
        return '₱0.00';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
        return '₱0.00';
    }

    try {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    } catch (error) {
        return '₱' + numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
}

// Load orders from API
async function loadOrders() {
    try {
        console.log('📦 Loading orders...');
        
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
        allOrders = result.success ? result.data : [];
        
        console.log('✅ Orders loaded:', allOrders.length);
        
        filteredOrders = [...allOrders];
        currentPage = 1;
        displayOrders();
        updateTodaysOrdersTable();
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        displayNoOrders();
    }
}

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
        let statusClass = 'status-pending';
        let statusText = 'Pending';
        
        if (order.status === 'completed' || order.paymentStatus === 'paid') {
            statusClass = 'status-completed';
            statusText = 'Completed';
        } else if (order.status === 'cancelled') {
            statusClass = 'status-cancelled';
            statusText = 'Cancelled';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center">${startIndex + index + 1}</td>
            <td>${order.orderNumber || `ORD-${order._id ? order._id.substring(0, 8) : 'N/A'}`}</td>
            <td class="text-center">${dateTime}</td>
            <td>${order.customerName || 'Walk-in Customer'}</td>
            <td class="text-center">${itemsList}</td>
            <td class="text-center">${formatCurrency(totalAmount)}</td>
            <td class="text-center"><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td class="text-center">
                <button class="btn-view" onclick="viewOrderDetails('${order._id}')">View</button>
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
    
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        if (currentPageSpan) currentPageSpan.textContent = currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    } else {
        pagination.style.display = 'none';
    }
}

// Event setup functions
function setupSearch() {
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchOrders(e.target.value);
        });
    }
}

function setupRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('🔄 Manual refresh');
            refreshData();
        });
    }
}

function setupViewAllOrders() {
    const viewAllLink = document.getElementById('viewAllOrders');
    if (viewAllLink) {
        viewAllLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Scroll to orders section
            const ordersSection = document.getElementById('ordersSection');
            if (ordersSection) {
                ordersSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Utility functions
function refreshData() {
    loadOrders();
    fetchAllMenuItems();
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayOrders();
        window.scrollTo(0, 0);
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

// Export functions to global scope
window.changePage = changePage;
window.searchOrders = searchOrders;
window.viewOrderDetails = viewOrderDetails;
window.refreshData = refreshData;

// Add CSS for all components - FIXED ALIGNMENT
const dashboardCSS = document.createElement('style');
dashboardCSS.textContent = `
/* Inventory Status Table */
#inventoryTableBody .empty-state {
    padding: 30px 20px;
    text-align: center;
    color: #6c757d;
}

#inventoryTableBody .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

#inventoryTableBody .no-data i {
    font-size: 32px;
    color: #28a745;
    margin-bottom: 10px;
}

#inventoryTableBody .no-data p {
    margin: 0;
    font-size: 14px;
    color: #495057;
}

#inventoryTableBody .no-data small {
    font-size: 12px;
    color: #6c757d;
}

.inventory-item {
    display: flex;
    flex-direction: column;
}

.item-name {
    font-weight: 500;
    color: #212529;
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
}

.item-category {
    font-size: 12px;
    color: #6c757d;
    background: #f8f9fa;
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
    width: fit-content;
}

.stock-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.current-stock {
    font-weight: 600;
    color: #212529;
    font-size: 14px;
}

.stock-unit {
    font-size: 12px;
    color: #6c757d;
}

/* Top Selling Products Table - PROPER ALIGNMENT */
#topItemsTableBody .empty-state {
    padding: 30px 20px;
    text-align: center;
    color: #6c757d;
}

#topItemsTableBody .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

#topItemsTableBody .no-data i {
    font-size: 32px;
    color: #6c757d;
    margin-bottom: 10px;
}

#topItemsTableBody .no-data p {
    margin: 0;
    font-size: 14px;
    color: #495057;
}

#topItemsTableBody .no-data small {
    font-size: 12px;
    color: #6c757d;
}

.product-info {
    display: flex;
    align-items: center;
}

.product-details {
    flex: 1;
    min-width: 0;
}

.product-name {
    font-weight: 500;
    color: #212529;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
}

.product-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 12px;
    color: #6c757d;
}

.price-info {
    color: #fd7e14;
    font-weight: 500;
}

.sales-count {
    color: #28a745;
    font-weight: 500;
}

.stock-info {
    color: #0d6efd;
    font-weight: 500;
}

/* Text alignment classes */
.text-center {
    text-align: center !important;
    vertical-align: middle !important;
}

.text-right {
    text-align: right !important;
    vertical-align: middle !important;
}

/* Today's Orders Table */
#todaysOrdersBody .empty-state {
    padding: 30px 20px;
    text-align: center;
    color: #6c757d;
}

#todaysOrdersBody .no-data {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

#todaysOrdersBody .no-data i {
    font-size: 32px;
    color: #6c757d;
    margin-bottom: 10px;
}

#todaysOrdersBody .no-data p {
    margin: 0;
    font-size: 14px;
    color: #495057;
}

#todaysOrdersBody .no-data small {
    font-size: 12px;
    color: #6c757d;
}

/* Table Styling */
table.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

table.data-table th {
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
    padding: 12px 16px;
    text-align: center;
    border-bottom: 2px solid #dee2e6;
}

table.data-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #e9ecef;
    vertical-align: middle;
}

table.data-table tbody tr:hover {
    background-color: #f8f9fa;
}

/* Status Badges */
.status-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    min-width: 80px;
    text-align: center;
}

.status-new {
    background: #cce5ff;
    color: #004085;
    border: 1px solid #b8daff;
}

.status-bestseller {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.status-popular {
    background: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
}

.status-selling {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}

.status-outofstock {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.status-lowstock {
    background: #ffe5cc;
    color: #663c00;
    border: 1px solid #ffd9b3;
}

.status-verylow {
    background: #fff0f0;
    color: #dc3545;
    border: 1px solid #f8d7da;
}

.status-completed {
    background: #d4edda;
    color: #155724;
}

.status-pending {
    background: #fff3cd;
    color: #856404;
}

.status-cancelled {
    background: #f8d7da;
    color: #721c24;
}

/* Buttons */
.btn-view {
    background: #0d6efd;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: background 0.2s;
    display: inline-block;
}

.btn-view:hover {
    background: #0b5ed7;
}

/* View All Link */
#viewAllOrders {
    color: #0d6efd;
    text-decoration: none;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-weight: 500;
}

#viewAllOrders:hover {
    text-decoration: underline;
    color: #0a58ca;
}

/* Pagination */
.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
}

.pagination-btn {
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    background: white;
    color: #0d6efd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
    min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #dee2e6;
}

.pagination-btn.active {
    background: #0d6efd;
    color: white;
    border-color: #0d6efd;
}

.pagination-btn:disabled {
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
}

.page-info {
    font-size: 14px;
    color: #6c757d;
    margin: 0 10px;
    font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
    table.data-table {
        font-size: 12px;
    }
    
    table.data-table th,
    table.data-table td {
        padding: 8px 12px;
    }
    
    .item-name,
    .product-name {
        font-size: 12px;
    }
    
    .item-category {
        font-size: 10px;
        padding: 1px 6px;
    }
    
    .product-meta {
        font-size: 10px;
    }
    
    .status-badge {
        font-size: 10px;
        padding: 4px 8px;
        min-width: 60px;
    }
    
    .btn-view {
        padding: 6px 12px;
        font-size: 10px;
    }
    
    .pagination-btn {
        padding: 6px 12px;
        font-size: 12px;
        min-width: 35px;
    }
}

/* Font Awesome icons */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
`;
document.head.appendChild(dashboardCSS);