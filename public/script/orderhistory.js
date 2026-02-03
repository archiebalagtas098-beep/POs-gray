// Global variables
let dashboardStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalInventoryItems: 0,
    inventoryLowStock: 0,
    inventoryOutOfStock: 0,
    totalMenuItems: 0
};

// Top Selling Products variables - COMBINE ACTUAL SALES + ALL MENU ITEMS
let topSellingProducts = [];

// Order History variables
let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// Menu Management variables
let allMenuItems = [];

// Inventory Status variables
let inventoryStatusData = [];

// Formatting functions
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

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Dashboard Stats
async function fetchDashboardStats() {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        const response = await fetch('/api/dashboard/stats', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            dashboardStats = {
                ...dashboardStats,
                ...data.data
            };
            
            updateDashboardUI();
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
    }
}

function updateDashboardUI() {
    // Update total orders
    const totalOrdersElement = document.getElementById('totalOrders');
    if (totalOrdersElement) {
        totalOrdersElement.textContent = formatNumber(dashboardStats.totalOrders || 0);
    }

    // Update total products
    const totalProductsElement = document.getElementById('totalProducts');
    if (totalProductsElement) {
        totalProductsElement.textContent = formatNumber(allMenuItems.length);
    }

    // Update total customers
    const totalCustomersElement = document.getElementById('totalCustomers');
    if (totalCustomersElement) {
        totalCustomersElement.textContent = formatNumber(dashboardStats.totalCustomers || 0);
    }

    // Update total revenue
    const totalRevenueElement = document.getElementById('totalRevenue');
    if (totalRevenueElement) {
        totalRevenueElement.textContent = formatCurrency(dashboardStats.totalRevenue || 0);
    }

    // Update total menu items
    const totalMenuItemsElement = document.getElementById('totalMenuItems');
    if (totalMenuItemsElement) {
        totalMenuItemsElement.textContent = formatNumber(allMenuItems.length);
    }

    updateInventoryStatus();
}

// NEW: Load and update Inventory Status
async function loadInventoryStatus() {
    try {
        console.log('📦 Loading inventory status...');
        
        // If you have an API endpoint for inventory
        try {
            const response = await fetch('/api/inventory/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    inventoryStatusData = data.data || [];
                    updateInventoryStatusTable();
                    return;
                }
            }
        } catch (error) {
            console.log('No inventory API, using menu items data');
        }
        
        // If no inventory API, use menu items to create inventory status
        if (allMenuItems.length > 0) {
            inventoryStatusData = allMenuItems.map(item => {
                const stock = item.currentStock || 0;
                const unit = item.unit || 'kg';
                let status = 'In Stock';
                
                if (stock <= 0) {
                    status = 'Out of Stock';
                } else if (stock <= (item.minStock || 5)) {
                    status = 'Low Stock';
                }
                
                return {
                    name: item.name || item.itemName,
                    stock: `${stock} ${unit}`,
                    status: status,
                    rawStock: stock,
                    minStock: item.minStock || 5
                };
            });
            
            // Sort: Out of Stock first, then Low Stock, then alphabetically
            inventoryStatusData.sort((a, b) => {
                // Status priority
                const statusOrder = { 'Out of Stock': 0, 'Low Stock': 1, 'In Stock': 2 };
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                    return statusOrder[a.status] - statusOrder[b.status];
                }
                
                // Then alphabetical
                return a.name.localeCompare(b.name);
            });
            
            updateInventoryStatusTable();
        }
        
    } catch (error) {
        console.error('❌ Error loading inventory status:', error);
    }
}

// NEW: Update Inventory Status Table
function updateInventoryStatusTable() {
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    if (!inventoryTableBody) return;
    
    // Update timestamp
    const timestampElement = document.getElementById('inventoryTimestamp');
    if (timestampElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-PH', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        }).toUpperCase();
        timestampElement.textContent = `Updated ${timeString}`;
    }
    
    if (inventoryStatusData.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="3">No inventory items</td>
            </tr>
        `;
        return;
    }
    
    // Show only top 5-10 items (most critical)
    const displayItems = inventoryStatusData.slice(0, 10);
    
    const tableHTML = displayItems.map(item => {
        return `
        <tr>
            <td>${item.name}</td>
            <td>${item.stock}</td>
            <td>${item.status}</td>
        </tr>
        `;
    }).join('');
    
    inventoryTableBody.innerHTML = tableHTML;
}

// CRITICAL: Top Selling Products - COMBINE ACTUAL SALES + ALL MENU ITEMS
async function loadTopSellingProducts() {
    try {
        console.log('📈 Loading top selling products...');
        
        // Get sales data from API
        let salesData = [];
        try {
            const response = await fetch('/api/orders/top-selling', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    salesData = data.data || [];
                }
            }
        } catch (error) {
            console.log('Using local calculation for sales data');
        }
        
        // Combine with all menu items
        combineTopSellingWithMenuItems(salesData);
        
    } catch (error) {
        console.error('❌ Error loading top selling products:', error);
        combineTopSellingWithMenuItems([]);
    }
}

// NEW FUNCTION: Combine actual sales data with all menu items
function combineTopSellingWithMenuItems(salesData) {
    console.log('🔄 Combining sales data with menu items...');
    
    // Create a map of product sales for easy lookup
    const salesMap = {};
    salesData.forEach(item => {
        if (item.name) {
            salesMap[item.name] = {
                totalSold: item.totalSold || 0,
                totalRevenue: item.totalRevenue || 0,
                unitPrice: item.unitPrice || 0
            };
        }
    });
    
    // Combine all menu items with sales data
    const combinedProducts = allMenuItems.map(item => {
        const itemName = item.name || item.itemName;
        const salesInfo = salesMap[itemName] || { totalSold: 0, totalRevenue: 0 };
        const unitPrice = item.price || 0;
        const currentStock = item.currentStock || 0;
        const minStock = item.minStock || 0;
        
        // Determine status based on sales and stock
        let status = 'New';
        
        if (salesInfo.totalSold > 0) {
            if (currentStock <= 0) {
                status = 'Out of Stock';
            } else if (currentStock <= minStock) {
                status = 'Low Stock';
            } else if (salesInfo.totalSold >= 50) {
                status = 'Bestseller';
            } else if (salesInfo.totalSold >= 20) {
                status = 'Popular';
            } else {
                status = 'Selling';
            }
        } else {
            if (currentStock <= 0) {
                status = 'Out of Stock';
            } else if (currentStock <= minStock) {
                status = 'Low Stock';
            }
        }
        
        return {
            name: itemName,
            category: item.category || 'General',
            unitPrice: unitPrice,
            totalSold: salesInfo.totalSold || 0,
            totalRevenue: salesInfo.totalRevenue || 0,
            hasSales: salesInfo.totalSold > 0,
            currentStock: currentStock,
            minStock: minStock,
            status: status
        };
    });
    
    // Sort by: 1) Has sales, 2) Total revenue, 3) Alphabetical
    topSellingProducts = combinedProducts.sort((a, b) => {
        // Products with sales first
        if (a.hasSales && !b.hasSales) return -1;
        if (!a.hasSales && b.hasSales) return 1;
        
        // Then by total revenue (descending)
        if (a.totalRevenue !== b.totalRevenue) {
            return b.totalRevenue - a.totalRevenue;
        }
        
        // Then by product name (alphabetical)
        return a.name.localeCompare(b.name);
    }).slice(0, 15); // Show top 15
    
    console.log('✅ Combined top selling products:', topSellingProducts.length);
    updateTopSellingTable();
}

// Update table display
function updateTopSellingTable() {
    const topItemsTableBody = document.getElementById('topItemsTableBody');
    if (!topItemsTableBody) return;
    
    if (topSellingProducts.length === 0) {
        topItemsTableBody.innerHTML = `
            <tr>
                <td colspan="3">No products in menu</td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = topSellingProducts.map((product, index) => {
        // Format product name
        const displayName = product.name.length > 30 
            ? product.name.substring(0, 30) + '...' 
            : product.name;
        
        // Show sales info if available, otherwise show price
        let details = '';
        if (product.hasSales) {
            details = `
                <div>
                    <div>${displayName}</div>
                    <div>${formatNumber(product.totalSold)} sold</div>
                </div>
            `;
        } else {
            details = `<div>${displayName}</div>`;
        }
        
        return `
        <tr>
            <td>${details}</td>
            <td>${formatCurrency(product.totalRevenue)}</td>
            <td>${product.status}</td>
        </tr>
        `;
    }).join('');
    
    topItemsTableBody.innerHTML = tableHTML;
}

// Order Management
async function loadOrders() {
    try {
        console.log('📋 Loading orders...');
        
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

        const data = await response.json();

        if (data.success) {
            allOrders = data.data || [];
            filteredOrders = [...allOrders];
            console.log('✅ Orders loaded:', allOrders.length);
            renderOrdersTable();
            renderPagination();
            updateTodaysOrdersTable();
            
            // After loading orders, update top selling products with sales data
            loadTopSellingProducts();
        } else {
            throw new Error(data.message || 'Failed to fetch orders');
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
    }
}

// Menu Management - UPDATED: Update top selling when menu items change
async function fetchMenuItems() {
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            allMenuItems = data.data || [];
            console.log('✅ Menu items loaded:', allMenuItems.length);
            
            // CRITICAL: Update dashboard AND top selling products
            updateDashboardUI();
            updateInventoryStatus();
            
            // Load inventory status from menu items
            loadInventoryStatus();
            
            // Refresh top selling products to include new items
            loadTopSellingProducts();
            
        } else {
            throw new Error(data.message || 'Failed to fetch menu items');
        }
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
    }
}

// Render functions
function renderOrdersTable() {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    const tableHTML = pageOrders.map((order, index) => {
        const orderTime = new Date(order.createdAt || order.orderDate);
        const timeString = orderTime.toLocaleTimeString('en-PH', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        // Try different possible properties for total amount
        const totalAmount = parseFloat(order.totalAmount || order.total || order.totalPrice || 0);
        
        // Try different possible properties for order number
        const orderNumber = order.orderNumber || 
                           order.orderId || 
                           order.orderNo || 
                           order.id || 
                           `ORD-${(order._id || '').substring(0, 8)}`;
        
        // Try different possible properties for customer name
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        
        return `
        <tr>
            <td>${orderNumber}</td>
            <td>${timeString}</td>
            <td>${customerName}</td>
            <td>${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tableHTML;
}

function updateTodaysOrdersTable() {
    const todaysOrdersBody = document.getElementById('todaysOrdersBody');
    if (!todaysOrdersBody) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    }).slice(0, 5);
    
    if (todaysOrders.length === 0) {
        todaysOrdersBody.innerHTML = `
            <tr><td colspan="4">No orders today</td></tr>
        `;
        return;
    }
    
    const tableHTML = todaysOrders.map((order, index) => {
        const orderTime = new Date(order.createdAt || order.orderDate);
        const timeString = orderTime.toLocaleTimeString('en-PH', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        // Try different possible properties for total amount
        const totalAmount = parseFloat(order.totalAmount || order.total || order.totalPrice || 0);
        
        // Try different possible properties for order number
        const orderNumber = order.orderNumber || 
                           order.orderId || 
                           order.orderNo || 
                           order.id || 
                           `ORD-${(order._id || '').substring(0, 8)}`;
        
        // Try different possible properties for customer name
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        const displayCustomer = customerName.length > 15 
            ? customerName.substring(0, 15) + '...' 
            : customerName;
        
        return `
        <tr>
            <td>${orderNumber}</td>
            <td>${timeString}</td>
            <td>${displayCustomer}</td>
            <td>${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    todaysOrdersBody.innerHTML = tableHTML;
}

function updateInventoryStatus() {
    if (!allMenuItems || allMenuItems.length === 0) {
        return;
    }
    
    const totalItems = allMenuItems.length;
    
    if (document.getElementById('totalProducts')) {
        document.getElementById('totalProducts').textContent = formatNumber(totalItems);
    }
    
    if (document.getElementById('totalMenuItems')) {
        document.getElementById('totalMenuItems').textContent = formatNumber(totalItems);
    }
}

// Pagination functions
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
            ←
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <button ${currentPage === i ? 'style="font-weight: bold;"' : ''} onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
            →
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredOrders.length / itemsPerPage)) return;
    currentPage = page;
    renderOrdersTable();
    renderPagination();
}

// Filter orders function
function filterOrders(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => {
            const orderNumber = order.orderNumber || `ORD-${(order._id || '').substring(0, 8)}`;
            const customerName = order.customerName || order.customer || 'Walk-in Customer';
            
            return orderNumber.toLowerCase().includes(term) ||
                   customerName.toLowerCase().includes(term);
        });
    }
    
    currentPage = 1;
    renderOrdersTable();
    renderPagination();
}

// View order details function
function viewOrderDetails(orderId) {
    // Implement order details view logic here
    console.log('Viewing order details:', orderId);
    alert(`Viewing order details for: ${orderId}`);
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard initializing...');
    
    // Load all data
    fetchDashboardStats();
    loadOrders();
    fetchMenuItems();
    
    // Setup event listeners
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterOrders(e.target.value);
        });
    }
    
    // Auto-refresh
    setInterval(() => {
        fetchDashboardStats();
        loadOrders();
        loadTopSellingProducts();
        loadInventoryStatus();
    }, 30000);
    
    console.log('✅ Dashboard initialized');
});

// Export functions
window.filterOrders = filterOrders;
window.changePage = changePage;
window.viewOrderDetails = viewOrderDetails;

// Add minimal CSS for black text only - NO STYLING
const dashboardCSS = document.createElement('style');
dashboardCSS.textContent = `
/* Black text only - NO STYLING */
* {
    color: black !important;
}

/* Minimal table structure */
table {
    border-collapse: collapse;
    width: 100%;
}

th, td {
    text-align: left;
    padding: 4px;
}

/* No borders, no hover effects */
tr {
    border: none;
}

tr:hover {
    background-color: transparent !important;
}

/* Plain buttons */
button {
    background: none;
    border: 1px solid black;
    padding: 2px 6px;
    cursor: pointer;
    margin: 0 2px;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* No button hover effects */
button:hover:not(:disabled) {
    background-color: transparent;
}

/* No special empty state styling */
.empty-state {
    text-align: center;
    padding: 10px;
}
`;
document.head.appendChild(dashboardCSS);