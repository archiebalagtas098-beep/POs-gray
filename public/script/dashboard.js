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
        
        return {
            name: itemName,
            category: item.category || 'General',
            unitPrice: unitPrice,
            totalSold: salesInfo.totalSold || 0,
            totalRevenue: salesInfo.totalRevenue || 0,
            hasSales: salesInfo.totalSold > 0,
            currentStock: item.currentStock || 0,
            minStock: item.minStock || 0
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
                <td colspan="3" class="empty-state">
                    No products in menu
                </td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = topSellingProducts.map((product, index) => {
        // Determine status based on sales and stock
        let status = 'New';
        
        if (product.hasSales) {
            if (product.totalSold >= 50) {
                status = 'Bestseller';
            } else if (product.totalSold >= 20) {
                status = 'Popular';
            } else if (product.totalSold >= 1) {
                status = 'Selling';
            }
        } else if (product.currentStock <= 0) {
            status = 'Out of Stock';
        } else if (product.currentStock <= product.minStock) {
            status = 'Low Stock';
        }
        
        // Format product name
        const displayName = product.name.length > 30 
            ? product.name.substring(0, 30) + '...' 
            : product.name;
        
        // Show sales info if available, otherwise show price
        let details = '';
        if (product.hasSales) {
            details = `
                <div>
                    <span>${formatNumber(product.totalSold)} sold</span>
                    <span>${formatCurrency(product.totalRevenue)}</span>
                </div>
            `;
        } else {
            details = ``;
        }
        
        return `
        <tr>
            <td>
                <div>
                    <span>${index + 1}</span>
                    <div>
                        <div>${displayName}</div>
                        ${details}
                    </div>
                </div>
            </td>
            <td>
                ${product.hasSales ? formatCurrency(product.totalRevenue) : '₱0.00'}
            </td>
            <td>
                ${status}
            </td>
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
            
            // Refresh top selling products to include new items
            loadTopSellingProducts();
            
        } else {
            throw new Error(data.message || 'Failed to fetch menu items');
        }
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
    }
}

// NEW: Function to add product and update top selling immediately
async function addNewProduct(productData) {
    try {
        console.log('➕ Adding new product...');
        
        const response = await fetch('/api/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            console.log('✅ Product added successfully');
            
            // CRITICAL: Refresh menu items which will update top selling
            await fetchMenuItems();
            
            return { success: true, data: data.data };
        } else {
            throw new Error(data.message || 'Failed to add product');
        }
    } catch (error) {
        console.error('❌ Error adding product:', error);
        return { success: false, error: error.message };
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
            <tr><td colspan="5">No orders today</td></tr>
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
            <td>${index + 1}</td>
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
    }, 30000);
    
    console.log('✅ Dashboard initialized');
});

// Export functions
window.filterOrders = filterOrders;
window.changePage = changePage;
window.viewOrderDetails = viewOrderDetails;
window.addNewProduct = addNewProduct;

// Add minimal CSS for black text only
const dashboardCSS = document.createElement('style');
dashboardCSS.textContent = `
/* Black text only - no styling */
* {
    color: black !important;
}

table {
    border-collapse: collapse;
    width: 100%;
}

th, td {
    text-align: left;
    padding: 8px;
    border-bottom: 1px solid #ddd;
}

tr:hover {
    background-color: #f5f5f5;
}

button {
    background: none;
    border: 1px solid black;
    padding: 5px 10px;
    cursor: pointer;
    margin: 0 2px;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background-color: #f0f0f0;
}

.empty-state {
    text-align: center;
    padding: 20px;
    font-style: italic;
}
`;
document.head.appendChild(dashboardCSS);