let eventSource = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrencySimple(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₱0.00';
    }
    
    const numAmount = parseFloat(amount);
    const formatted = numAmount.toFixed(2);
    
    return '₱' + formatted;
}

function updateDashboardDisplay(stats) {
    console.log('Updating dashboard with stats:', stats);
    
    const totalOrdersEl = document.getElementById('totalOrders');
    if (totalOrdersEl) {
        totalOrdersEl.textContent = formatNumber(stats.totalOrders || 0);
    }
    
    const totalRevenueEl = document.getElementById('totalRevenue');
    if (totalRevenueEl) {
        totalRevenueEl.textContent = '';
        const formattedRevenue = formatCurrencySimple(stats.totalRevenue || 0);
        totalRevenueEl.textContent = formattedRevenue;
        console.log('Total revenue formatted:', formattedRevenue);
    }
    
    const totalCustomersEl = document.getElementById('totalCustomers');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = formatNumber(stats.totalCustomers || 0);
    }
    
    const totalProductsEl = document.getElementById('totalProducts');
    if (totalProductsEl) {
        totalProductsEl.textContent = formatNumber(stats.totalProducts || 0);
    }
    
    // Render sales chart
    renderSalesChart(stats);
}

function initRealTimeUpdates() {
    console.log('🚀 Initializing real-time updates...');
    
    setupSSEConnection();
    
    fetchDashboardStats();
    
    setInterval(fetchDashboardStats, 30000);
}

function setupSSEConnection() {
    console.log('📡 Setting up SSE connection...');
    
    if (eventSource) {
        eventSource.close();
        eventSource = null;
    }
    
    eventSource = new EventSource('/api/admin/events', {
        withCredentials: true
    });
    
    eventSource.onopen = () => {
        console.log('✅ Connected to real-time server');
        isConnected = true;
        reconnectAttempts = 0;
    };
    
    eventSource.onmessage = (event) => {
        console.log('📥 Received SSE message:', event.data);
        try {
            const data = JSON.parse(event.data);
            handleSSEEvent(data);
        } catch (error) {
            console.error('❌ Error parsing SSE event:', error);
        }
    };
    
    eventSource.addEventListener('new_order', (event) => {
        try {
            const data = JSON.parse(event.data);
            handleNewOrderEvent(data);
        } catch (error) {
            console.error('❌ Error processing new order event:', error);
        }
    });
    
    eventSource.addEventListener('stats_update', (event) => {
        try {
            const data = JSON.parse(event.data);
            handleStatsUpdateEvent(data);
        } catch (error) {
            console.error('❌ Error processing stats update:', error);
        }
    });
    
    eventSource.onerror = (error) => {
        console.error('❌ SSE connection error:', error);
        isConnected = false;
        
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            const delay = Math.min(3000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts})...`);
            
            setTimeout(() => {
                setupSSEConnection();
            }, delay);
        } else {
            console.error('❌ Max reconnection attempts reached. Real-time updates disabled.');
            setInterval(fetchDashboardStats, 10000);
        }
    };
}

function handleSSEEvent(data) {
    console.log('🎯 Handling SSE event:', data.type);
    
    switch (data.type) {
        case 'connected':
            console.log('✅ ' + (data.message || 'Connected to real-time updates'));
            break;
            
        case 'new_order':
            handleNewOrderEvent(data.data);
            break;
            
        case 'stats_update':
            handleStatsUpdateEvent(data.data);
            break;
            
        default:
            console.log('❓ Unknown event type:', data.type);
    }
}

function handleNewOrderEvent(orderData) {
    console.log('🆕 New order received:', orderData.orderNumber);
    
    showOrderNotification(orderData);
    
    updateOrdersTable(orderData);
    
    fetchDashboardStats();
}

function handleStatsUpdateEvent(statsData) {
    console.log('📊 Stats update received:', statsData);
    updateDashboardDisplay(statsData);
}

function showOrderNotification(order) {
    const existing = document.querySelector('.order-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'order-notification';
    notification.innerHTML = `
        <div class="notification-header">
            <strong>🆕 New Order!</strong>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="notification-body">
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Total:</strong> ₱${(order.total || 0).toFixed(2)}</p>
            <p><strong>Type:</strong> ${order.type || 'Dine In'}</p>
            <p><strong>Items:</strong> ${order.items || 1}</p>
            <p><small>${order.timestamp || new Date().toLocaleTimeString()}</small></p>
        </div>
    `;
    
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .order-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-left: 4px solid #4CAF50;
                border-radius: 8px;
                padding: 15px;
                width: 320px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                font-family: Arial, sans-serif;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #eee;
            }
            
            .notification-header strong {
                color: #333;
                font-size: 16px;
            }
            
            .notification-header button {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
            }
            
            .notification-header button:hover {
                background: #f5f5f5;
                color: #333;
            }
            
            .notification-body p {
                margin: 5px 0;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .notification-body strong {
                color: #555;
                font-weight: 600;
                display: inline-block;
                width: 80px;
            }
            
            .notification-body small {
                color: #888;
                font-size: 12px;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 8000);
}

function updateOrdersTable(order) {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${order.orderNumber}</td>
        <td>${order.timestamp || new Date().toLocaleTimeString()}</td>
        <td>Walk-in</td>
        <td>₱${(order.total || 0).toFixed(2)}</td>
    `;
    
    newRow.style.animation = 'fadeIn 0.5s ease';
    
    if (tableBody.firstChild) {
        tableBody.insertBefore(newRow, tableBody.firstChild);
    } else {
        tableBody.appendChild(newRow);
    }
    
    const rows = tableBody.getElementsByTagName('tr');
    if (rows.length > 10) {
        tableBody.removeChild(rows[rows.length - 1]);
    }
    
    if (!document.getElementById('fadeIn-animation')) {
        const style = document.createElement('style');
        style.id = 'fadeIn-animation';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

async function fetchDashboardStats() {
    try {
        console.log('📊 Fetching dashboard stats...');
        
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 API Response:', result);
        
        const stats = result.success ? result.data : result;
        console.log('📊 Stats extracted:', stats);
        
        updateDashboardDisplay(stats);
        
        console.log('Total Revenue value:', stats.totalRevenue);
        console.log('Formatted Revenue:', formatCurrencySimple(stats.totalRevenue || 0));
        
        if (stats.recentOrders && stats.recentOrders.length > 0) {
            updateRecentOrdersTable(stats.recentOrders);
        }
        
        if (stats.topProducts && stats.topProducts.length > 0) {
            updateTopItemsTable(stats.topProducts);
        }
        
        if (stats.lowStockItems || stats.outOfStockItems) {
            loadInventoryStatus();
        }
        
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        const fallbackStats = {
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            totalProducts: 0
        };
        updateDashboardDisplay(fallbackStats);
    }
}

function updateRecentOrdersTable(orders) {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody || !orders) return;
    
    tableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderNumber || 'N/A'}</td>
            <td>${order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : 'N/A'}</td>
            <td>Walk-in</td>
            <td>₱${order.total ? order.total.toFixed(2) : '0.00'}</td>
        `;
        tableBody.appendChild(row);
    });
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

async function loadInventoryStatus() {
    try {
        console.log('📦 Loading inventory status...');
        
        const response = await fetch('/api/inventory');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const inventoryItems = result.success ? result.data : [];
        
        console.log('📦 Inventory items loaded:', inventoryItems.length);
        
        if (inventoryItems && inventoryItems.length > 0) {
            updateInventoryStatusTable(inventoryItems);
        }
    } catch (error) {
        console.error('❌ Error loading inventory:', error);
    }
}

function updateInventoryStatusTable(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Sort by stock level (low stock first)
    const sortedItems = items.sort((a, b) => a.currentStock - b.currentStock);
    
    // Display top 8 items with lowest stock
    sortedItems.slice(0, 8).forEach(item => {
        const row = document.createElement('tr');
        
        // Determine status based on stock level
        let status = 'In Stock';
        let statusClass = 'status-in-stock';
        
        if (item.currentStock === 0) {
            status = 'Out of Stock';
            statusClass = 'status-out-of-stock';
        } else if (item.currentStock <= 10) {
            status = 'Low Stock';
            statusClass = 'status-low-stock';
        }
        
        row.innerHTML = `
            <td>${item.itemName || 'N/A'}</td>
            <td>${item.currentStock || 0} ${item.unit || 'units'}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderSalesChart(stats) {
    const chartBars = document.getElementById('chartBars');
    const chartSummary = document.getElementById('chartSummary');
    
    if (!chartBars) return;
    
    chartBars.innerHTML = '';
    
    // Get today's date and last 7 days
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push(date);
    }
    
    // Get day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysLabel = last7Days.map(d => dayNames[d.getDay()]).join('|');
    
    // For now, use today's total revenue as the chart value
    // In production, this would be historical data
    const totalRevenue = stats.totalRevenue || 0;
    const maxRevenue = Math.max(totalRevenue * 1.2, 5000); // Scale appropriately
    
    // Create bars - highlight today with full height, others with lower values
    const barHeights = [10, 20, 15, 25, 35, 45, 100]; // Percentage heights (last one is today)
    
    barHeights.forEach((height, index) => {
        const bar = document.createElement('div');
        const barValue = (height / 100) * maxRevenue;
        bar.style.cssText = `
            height: ${height}%;
            background: ${index === 6 ? '#4CAF50' : '#E0E0E0'};
            margin: 0 3px;
            border-radius: 4px 4px 0 0;
            flex: 1;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
            padding-bottom: 2px;
        `;
        bar.title = `${dayNames[index]}: ₱${barValue.toFixed(2)}`;
        bar.textContent = '';
        chartBars.appendChild(bar);
    });
    
    // Update summary
    if (chartSummary) {
        chartSummary.textContent = `Today: ₱${totalRevenue.toFixed(2)}`;
    }
}

function cleanup() {
    if (eventSource) {
        eventSource.close();
        console.log('🔌 SSE connection closed');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Dashboard page loaded');
    
    const isDashboardPage = window.location.pathname.includes('admindashboard') || 
                           window.location.pathname.includes('dashboard');
    
    console.log('Is dashboard page:', isDashboardPage, 'Path:', window.location.pathname);
    
    if (isDashboardPage) {
        console.log('🏁 Starting dashboard initialization...');
        
        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl && totalRevenueEl.textContent.trim() === '') {
            totalRevenueEl.textContent = '₱0.00';
        }
        
        fetchDashboardStats();
        loadInventoryStatus();
        
        // Refresh inventory status every 30 seconds
        setInterval(() => {
            loadInventoryStatus();
        }, 30000);
        
        setTimeout(() => {
            initRealTimeUpdates();
        }, 1000);
        
        setInterval(() => {
            const revenueEl = document.getElementById('totalRevenue');
            if (revenueEl && !revenueEl.textContent.includes('₱')) {
                console.log('Emergency: Missing ₱ sign, fixing...');
                const current = revenueEl.textContent;
                revenueEl.textContent = '₱' + current.replace(/[^\d.]/g, '');
            }
        }, 2000);
    }
    
    window.addEventListener('beforeunload', cleanup);
});

window.fixPesoSign = function() {
    const revenueEl = document.getElementById('totalRevenue');
    if (revenueEl) {
        const current = revenueEl.textContent;
        if (!current.includes('₱')) {
            const number = current.replace(/[^\d.]/g, '') || '0.00';
            revenueEl.textContent = '₱' + number;
            console.log('Fixed peso sign:', revenueEl.textContent);
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateDashboardDisplay,
        fetchDashboardStats,
        initRealTimeUpdates,
        cleanup
    };
}