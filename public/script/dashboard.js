let dashboardStats = {
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalInventoryItems: 0,
    inventoryLowStock: 0,
    inventoryOutOfStock: 0
};

// Order History variables
let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// DOM Elements
let ordersTable, ordersTableBody, noOrdersMessage, pagination;
let topItemsBody, inventoryStatusBody, todaysOrdersBody;

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

// Listen for payment completion events from other tabs/windows
window.addEventListener('storage', function(e) {
    if (e.key === 'orderPaymentCompleted') {
        console.log('💳 Payment detected from another tab');
        fetchDashboardStats();
        loadOrders();
    }
});

// Listen for payment completion events in same window
window.addEventListener('paymentCompleted', function(e) {
    console.log('💳 Payment completed in this window:', e.detail);
    fetchDashboardStats();
    loadOrders();
});

// Dashboard functions
async function fetchDashboardStats() {
    try {
        console.log('Fetching dashboard stats...');

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
            dashboardStats = data.data;
            updateDashboardDisplay();
            console.log('Dashboard stats updated:', dashboardStats);
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard stats');
        }
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showToast('Failed to load dashboard data', 'error');
    }
}

function updateDashboardDisplay() {
    // Update stat cards
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalProductsEl = document.getElementById('totalProducts');
    const totalCustomersEl = document.getElementById('totalCustomers');
    const totalRevenueEl = document.getElementById('totalRevenue');

    if (totalOrdersEl) totalOrdersEl.textContent = formatNumber(dashboardStats.totalOrders || 0);
    if (totalProductsEl) totalProductsEl.textContent = formatNumber(dashboardStats.totalProducts || 0);
    if (totalCustomersEl) totalCustomersEl.textContent = formatNumber(dashboardStats.totalCustomers || 0);
    if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(dashboardStats.totalRevenue || 0);

    // Update top items table
    if (dashboardStats.topProducts && dashboardStats.topProducts.length > 0) {
        updateTopItemsTable(dashboardStats.topProducts);
    }

    // Update today's orders in dashboard if element exists
    updateTodaysOrdersDashboard();

    console.log('Dashboard display updated');
}

function updateTopItemsTable(topProducts) {
    const tableBody = document.getElementById('topItemsTableBody');
    if (!tableBody || !topProducts) return;
    
    tableBody.innerHTML = '';
    
    topProducts.slice(0, 10).forEach((product, index) => {
        const row = document.createElement('tr');
        const totalSales = product.quantity ? product.quantity : 0;
        const status = index < 3 ? '<span class="status-badge status-hot">🔥 Hot</span>' : '<span class="status-badge status-trending">📈 Trending</span>';
        
        row.innerHTML = `
            <td>${product.name || 'Unknown'}</td>
            <td>${totalSales} units</td>
            <td>${status}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateTodaysOrdersDashboard() {
    // This function updates today's orders specifically in the dashboard
    // FIX: Changed from todaysOrdersDashboard to ordersTableBody
    const todaysOrdersTable = document.getElementById('ordersTableBody');
    if (!todaysOrdersTable) {
        console.log('Dashboard today\'s orders table not found');
        return;
    }
    
    const today = new Date();
    const todayString = today.toDateString();
    
    const todayOrders = allOrders.filter(order => {
        if (!order || !order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === todayString;
    });
    
    todaysOrdersTable.innerHTML = '';
    
    if (todayOrders.length > 0) {
        // Sort by time descending (most recent first)
        todayOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        todayOrders.slice(0, 5).forEach(order => {
            const time = new Date(order.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            
            // Generate a short order ID
            const orderId = order.orderNumber || 
                           (order._id ? order._id.substring(0, 8) : 'N/A');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${orderId}</td>
                <td>${time}</td>
                <td>${order.customerName || 'Walk-in'}</td>
                <td>₱${(order.total || 0).toFixed(2)}</td>
            `;
            todaysOrdersTable.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="text-center">No orders today</td>';
        todaysOrdersTable.appendChild(row);
    }
}

function debounceSearch(query) {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
        performMenuSearch(query);
    }, 300);
}

function performMenuSearch(query) {
    console.log('Searching menu items:', query);
}

function showSection(section) {
    console.log('📱 Showing section:', section);
}

// Order History functions
async function loadOrders() {
    try {
        console.log('📦 Loading orders...');
        
        const response = await fetch('/api/orders');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        allOrders = result.success ? result.data : [];
        
        console.log('📦 Orders loaded:', allOrders.length);
        
        filteredOrders = [...allOrders];
        currentPage = 1;
        
        // Check which page we're on and update accordingly
        const path = window.location.pathname;
        const isDashboard = path === '/' || path.includes('dashboard');
        const isOrderHistory = path.includes('orderhistory');
        
        if (isDashboard) {
            // Update today's orders in dashboard
            updateTodaysOrdersDashboard();
        } else if (isOrderHistory) {
            // Display orders in order history page
            displayOrders();
        }
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        const path = window.location.pathname;
        if (path.includes('orderhistory')) {
            displayNoOrders();
        }
    }
}

function displayOrders() {
    // This function is only for order history page
    if (!ordersTableBody) return;
    
    if (filteredOrders.length === 0) {
        displayNoOrders();
        return;
    }
    
    // Sort by date descending
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    // Clear table body
    ordersTableBody.innerHTML = '';
    
    // Add rows
    pageOrders.forEach(order => {
        const itemsList = order.items
            ? order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')
            : 'No items';
        
        const dateTime = new Date(order.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = `status-${order.status || 'pending'}`;
        
        // Generate a short order ID
        const orderId = order.orderNumber || 
                       (order._id ? order._id.substring(0, 8) : 'N/A');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${orderId}</td>
            <td>${order.customerName || 'Walk-in'}</td>
            <td>${itemsList}</td>
            <td>₱${(order.total || 0).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${order.status || 'Pending'}</span></td>
            <td>${dateTime}</td>
            <td>${order.payment?.method || 'Cash'}</td>
            <td>
                <button class="btn-view" onclick="viewOrderDetails('${order._id}')">View</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
    
    // Show table and hide no orders message
    if (ordersTable) ordersTable.style.display = 'table';
    if (noOrdersMessage) noOrdersMessage.style.display = 'none';
    
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
            (order.orderNumber || '').toLowerCase().includes(searchTerm) ||
            (order.customerName || '').toLowerCase().includes(searchTerm) ||
            (order.items && order.items.some(item => (item.name || '').toLowerCase().includes(searchTerm)))
        );
    }
    currentPage = 1;
    displayOrders();
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter');
    if (!statusFilter) return;
    
    const status = statusFilter.value;
    
    if (!status) {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => order.status === status);
    }
    currentPage = 1;
    displayOrders();
}

function filterByDate() {
    const dateFilter = document.getElementById('dateFilter');
    if (!dateFilter) return;
    
    const dateValue = dateFilter.value;
    
    if (!dateValue) {
        filteredOrders = [...allOrders];
    } else {
        const filterDate = new Date(dateValue);
        filterDate.setHours(0, 0, 0, 0);
        
        filteredOrders = allOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === filterDate.getTime();
        });
    }
    currentPage = 1;
    displayOrders();
}

function refreshOrders() {
    console.log('🔄 Manual refresh');
    loadOrders();
}

function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (order) {
        alert(`Order #${order.orderNumber || order._id}\nTotal: ₱${order.total?.toFixed(2) || '0.00'}\nStatus: ${order.status || 'Unknown'}`);
    }
}

async function loadInventoryStatus() {
    try {
        if (!inventoryStatusBody) return;
        
        const response = await fetch('/api/inventory');
        if (!response.ok) throw new Error('Failed to load inventory');
        
        const result = await response.json();
        const items = result.success ? result.data : [];
        
        // Sort by stock level
        items.sort((a, b) => a.currentStock - b.currentStock);
        
        inventoryStatusBody.innerHTML = '';
        items.slice(0, 5).forEach(item => {
            let status = 'In Stock';
            let statusClass = 'status-in-stock';
            
            if (item.currentStock === 0) {
                status = 'Out of Stock';
                statusClass = 'status-out-of-stock';
            } else if (item.currentStock <= 10) {
                status = 'Low Stock';
                statusClass = 'status-low-stock';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.itemName || 'Unknown'}</td>
                <td>${item.currentStock || 0} ${item.unit || ''}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
            `;
            inventoryStatusBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

async function loadTopItems() {
    try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error('Failed to load stats');
        
        const result = await response.json();
        const stats = result.success ? result.data : {};
        
        if (topItemsBody) {
            topItemsBody.innerHTML = '';
            
            if (stats.topProducts && stats.topProducts.length > 0) {
                stats.topProducts.slice(0, 5).forEach(product => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.name || 'Unknown'}</td>
                        <td>${product.quantity || 0}</td>
                        <td><span class="status-badge status-success">Top Seller</span></td>
                    `;
                    topItemsBody.appendChild(row);
                });
            }
        }
        
        // Load today's orders for order history page - FIXED VERSION
        if (todaysOrdersBody) {
            const today = new Date();
            const todayString = today.toDateString();
            
            const todayOrders = allOrders.filter(order => {
                if (!order || !order.createdAt) return false;
                const orderDate = new Date(order.createdAt);
                return orderDate.toDateString() === todayString;
            });
            
            todaysOrdersBody.innerHTML = '';
            
            if (todayOrders.length > 0) {
                // Sort by time descending (most recent first)
                todayOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                todayOrders.slice(0, 5).forEach(order => {
                    const time = new Date(order.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                    
                    // Generate a short order ID
                    const orderId = order.orderNumber || 
                                   (order._id ? order._id.substring(0, 8) : 'N/A');
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${orderId}</td>
                        <td>${time}</td>
                        <td>${order.customerName || 'Walk-in'}</td>
                        <td>₱${(order.total || 0).toFixed(2)}</td>
                    `;
                    todaysOrdersBody.appendChild(row);
                });
            } else {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="4" class="text-center">No orders today</td>';
                todaysOrdersBody.appendChild(row);
            }
        }
        
    } catch (error) {
        console.error('Error loading top items:', error);
    }
}

// Common functions
function handleLogout() {
    showLoading("Logging out...");

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

function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        const spinner = overlay.querySelector('.spinner');
        if (spinner) {
            spinner.textContent = message;
        }
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

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

// Initialize page based on current URL
function initializePage() {
    const path = window.location.pathname;
    console.log('Initializing page for path:', path);
    
    // Get DOM elements
    ordersTable = document.getElementById('ordersTable');
    ordersTableBody = document.getElementById('ordersTableBody');
    noOrdersMessage = document.getElementById('noOrdersMessage');
    pagination = document.getElementById('pagination');
    topItemsBody = document.getElementById('topItemsBody');
    inventoryStatusBody = document.getElementById('inventoryStatusBody');
    todaysOrdersBody = document.getElementById('todaysOrdersBody');
    
    // Dashboard page
    if (path === '/' || path.includes('dashboard')) {
        console.log('Loading dashboard...');
        fetchDashboardStats();
        
        // Also load orders for today's orders section
        loadOrders();
        
        // Refresh dashboard stats every 30 seconds
        setInterval(() => {
            fetchDashboardStats();
            loadOrders(); // Also refresh orders data
        }, 30000);
        
        // Setup payment update listener
        setupPaymentListener();
    }
    
    // Order History page
    if (path.includes('orderhistory')) {
        console.log('Loading order history...');
        
        if (ordersTableBody && noOrdersMessage) {
            loadOrders();
            
            // Load additional data if elements exist
            if (inventoryStatusBody || topItemsBody || todaysOrdersBody) {
                loadInventoryStatus();
                loadTopItems();
            }
            
            // Refresh every 30 seconds
            setInterval(() => {
                console.log('🔄 Refreshing orders...');
                loadOrders();
                
                if (inventoryStatusBody || topItemsBody || todaysOrdersBody) {
                    loadInventoryStatus();
                    loadTopItems();
                }
            }, 30000);
            
            // Setup payment update listener
            setupPaymentListener();
        }
    }
}

// Setup listener for payment updates across windows/tabs
function setupPaymentListener() {
    // Listen for payment completion via storage event (same browser)
    window.addEventListener('storage', (e) => {
        if (e.key === 'orderPaymentCompleted') {
            const paymentData = JSON.parse(e.newValue);
            console.log('💳 Payment completed in another tab/window:', paymentData);
            
            // Refresh orders and stats
            loadOrders();
            fetchDashboardStats();
            loadInventoryStatus();
            loadTopItems();
        }
    });
    
    // Listen for custom payment event
    window.addEventListener('paymentCompleted', (e) => {
        console.log('💳 Payment completed event received:', e.detail);
        
        // Refresh data immediately
        loadOrders();
        fetchDashboardStats();
        loadInventoryStatus();
        loadTopItems();
    });
}

// Single DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded');
    initializePage();
});

// Expose functions to global scope
window.handleLogout = handleLogout;
window.debounceSearch = debounceSearch;
window.showSection = showSection;
window.changePage = changePage;
window.searchOrders = searchOrders;
window.filterOrders = filterOrders;
window.filterByDate = filterByDate;
window.refreshOrders = refreshOrders;
window.viewOrderDetails = viewOrderDetails;window.setupPaymentListener = setupPaymentListener;
window.fetchDashboardStats = fetchDashboardStats;
