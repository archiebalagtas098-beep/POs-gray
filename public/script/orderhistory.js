// Order History Page Script

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// DOM Elements
const ordersTable = document.getElementById('ordersTable');
const ordersTableBody = document.getElementById('ordersTableBody');
const noOrdersMessage = document.getElementById('noOrdersMessage');
const pagination = document.getElementById('pagination');
const topItemsBody = document.getElementById('topItemsBody');
const inventoryStatusBody = document.getElementById('inventoryStatusBody');
const todaysOrdersBody = document.getElementById('todaysOrdersBody');

// Load orders on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Order History page loaded');
    
    const isOrderHistoryPage = window.location.pathname.includes('orderhistory');
    
    if (isOrderHistoryPage) {
        console.log('🏁 Loading orders...');
        
        // Only load if elements exist
        if (ordersTableBody && noOrdersMessage) {
            // Load initial data
            loadOrders();
            
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
        }
    }
});

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
        displayOrders();
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        displayNoOrders();
    }
}

function displayOrders() {
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
            .map(item => `${item.name} (x${item.quantity})`)
            .join(', ');
        
        const dateTime = new Date(order.createdAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = `status-${order.status}`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber || 'N/A'}</td>
            <td>${order.customerName || 'Walk-in'}</td>
            <td>${itemsList}</td>
            <td>₱${(order.total || 0).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
            <td>${dateTime}</td>
            <td>${order.payment?.method || 'Cash'}</td>
            <td>
                <button class="btn-view" onclick="viewOrderDetails('${order._id}')">View</button>
            </td>
        `;
        ordersTableBody.appendChild(row);
    });
    
    // Show table and hide no orders message
    ordersTable.style.display = 'table';
    noOrdersMessage.style.display = 'none';
    
    // Update pagination
    updatePagination(totalPages);
}

function displayNoOrders() {
    ordersTable.style.display = 'none';
    noOrdersMessage.style.display = 'block';
    pagination.style.display = 'none';
}

function updatePagination(totalPages) {
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    if (totalPages > 1) {
        pagination.style.display = 'flex';
        currentPageSpan.textContent = currentPage;
        totalPagesSpan.textContent = totalPages;
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
            order.orderNumber?.toLowerCase().includes(searchTerm) ||
            order.customerName?.toLowerCase().includes(searchTerm) ||
            order.items?.some(item => item.name?.toLowerCase().includes(searchTerm))
        );
    }
    currentPage = 1;
    displayOrders();
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    
    if (!statusFilter) {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => order.status === statusFilter);
    }
    currentPage = 1;
    displayOrders();
}

function filterByDate() {
    const dateFilter = document.getElementById('dateFilter').value;
    
    if (!dateFilter) {
        filteredOrders = [...allOrders];
    } else {
        const filterDate = new Date(dateFilter);
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
        alert(`Order #${order.orderNumber}\nTotal: ₱${order.total.toFixed(2)}\nStatus: ${order.status}`);
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
                <td>${item.itemName}</td>
                <td>${item.currentStock} ${item.unit}</td>
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
        
        // Load today's orders
        if (todaysOrdersBody) {
            const todayOrders = allOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                const today = new Date();
                return orderDate.toDateString() === today.toDateString();
            });
            
            todaysOrdersBody.innerHTML = '';
            
            if (todayOrders.length > 0) {
                todayOrders.slice(0, 5).forEach(order => {
                    const time = new Date(order.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${order.orderNumber}</td>
                        <td>${time}</td>
                        <td>${order.customerName || 'Walk-in'}</td>
                        <td>₱${(order.total || 0).toFixed(2)}</td>
                    `;
                    todaysOrdersBody.appendChild(row);
                });
            }
        }
        
    } catch (error) {
        console.error('Error loading top items:', error);
    }
}
