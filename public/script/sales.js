// Sales Report Page Script

let salesData = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    grossProfit: 0,
    margin: 0,
    dailySales: [],
    recentOrders: []
};

function formatCurrency(amount) {
    if (!amount || isNaN(amount)) return '₱0.00';
    return '₱' + parseFloat(amount).toFixed(2);
}

function formatPercent(value) {
    if (!value || isNaN(value)) return '0%';
    return parseFloat(value).toFixed(1) + '%';
}

async function loadSalesReport() {
    try {
        console.log('📊 Loading sales report data...');
        
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const stats = result.success ? result.data : result;
        
        console.log('📊 Sales report stats:', stats);
        
        // Update sales data
        salesData.totalRevenue = stats.totalRevenue || 0;
        salesData.totalOrders = stats.totalOrders || 0;
        salesData.totalCustomers = stats.totalCustomers || 0;
        salesData.avgOrderValue = salesData.totalOrders > 0 ? salesData.totalRevenue / salesData.totalOrders : 0;
        
        // Calculate profit (assuming 30% gross profit margin for now)
        salesData.grossProfit = salesData.totalRevenue * 0.30;
        salesData.margin = salesData.totalRevenue > 0 ? (salesData.grossProfit / salesData.totalRevenue) * 100 : 0;
        
        if (stats.recentOrders && stats.recentOrders.length > 0) {
            salesData.recentOrders = stats.recentOrders;
        }
        
        updateSalesReportDisplay();
        
    } catch (error) {
        console.error('❌ Error loading sales report:', error);
        updateSalesReportDisplay();
    }
}

function updateSalesReportDisplay() {
    // Update report period
    const today = new Date();
    const periodEl = document.getElementById('reportPeriod');
    if (periodEl) {
        periodEl.textContent = `Today's Report - ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    }
    
    // Update total revenue
    const totalRevenueEl = document.getElementById('totalRevenueCard');
    if (totalRevenueEl) {
        totalRevenueEl.textContent = formatCurrency(salesData.totalRevenue);
    }
    
    // Update total orders
    const totalOrdersEl = document.getElementById('totalOrdersCard');
    if (totalOrdersEl) {
        totalOrdersEl.textContent = salesData.totalOrders;
    }
    
    const ordersChangeEl = document.getElementById('ordersChange');
    if (ordersChangeEl) {
        ordersChangeEl.textContent = `${salesData.totalOrders} orders today`;
    }
    
    // Update total customers
    const totalCustomersEl = document.getElementById('totalCustomersCard');
    if (totalCustomersEl) {
        totalCustomersEl.textContent = salesData.totalCustomers;
    }
    
    const customersChangeEl = document.getElementById('customersChange');
    if (customersChangeEl) {
        customersChangeEl.textContent = `${salesData.totalCustomers} customers today`;
    }
    
    // Update average order value
    const avgOrderEl = document.getElementById('avgOrderValue');
    if (avgOrderEl) {
        avgOrderEl.textContent = formatCurrency(salesData.avgOrderValue);
    }
    
    // Update gross profit
    const grossProfitEl = document.getElementById('grossProfit');
    if (grossProfitEl) {
        grossProfitEl.textContent = formatCurrency(salesData.grossProfit);
    }
    
    // Update margin
    const marginEl = document.getElementById('marginValue');
    if (marginEl) {
        marginEl.textContent = formatPercent(salesData.margin);
    }
    
    // Update graph status
    const graphStatusEl = document.getElementById('graphStatus');
    if (graphStatusEl) {
        if (salesData.totalOrders > 0) {
            graphStatusEl.textContent = `${salesData.totalOrders} orders - ₱${salesData.totalRevenue.toFixed(2)} revenue`;
        } else {
            graphStatusEl.textContent = 'No sales data for today';
        }
    }
    
    // Render sales chart
    renderSalesChart(salesData);
    
    // Update sales summary table
    updateSalesTable();
}

function updateSalesTable() {
    const tableBody = document.getElementById('salesTableBody');
    if (!tableBody) return;
    
    if (salesData.totalOrders === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 20px;">No sales data available</td>
            </tr>
        `;
        return;
    }
    
    // Create today's sales summary row
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    tableBody.innerHTML = `
        <tr>
            <td>${dateStr}</td>
            <td>${salesData.totalOrders}</td>
            <td>${formatCurrency(salesData.totalRevenue)}</td>
            <td>${formatCurrency(salesData.totalRevenue * 0.70)}</td>
            <td>${formatCurrency(salesData.grossProfit)}</td>
            <td>${salesData.totalCustomers}</td>
        </tr>
    `;
    
    // Add recent orders if available
    if (salesData.recentOrders && salesData.recentOrders.length > 0) {
        const totalRow = tableBody.querySelector('tr');
        
        // Create a summary showing top 3 recent orders
        let summaryHTML = `
            <tr style="background-color: #f9f9f9; border-top: 2px solid #ddd;">
                <td colspan="6" style="padding: 10px; font-size: 12px; color: #666;">
                    <strong>Recent Orders:</strong> 
        `;
        
        salesData.recentOrders.slice(0, 5).forEach((order, index) => {
            const time = new Date(order.createdAt).toLocaleTimeString();
            summaryHTML += `Order #${order.orderNumber} (${time}) - ₱${(order.total || 0).toFixed(2)}`;
            if (index < Math.min(4, salesData.recentOrders.length - 1)) summaryHTML += ' | ';
        });
        
        summaryHTML += `</td></tr>`;
        
        tableBody.innerHTML += summaryHTML;
    }
}

function renderSalesChart(stats) {
    // Update graph status with actual sales data
    const graphStatusEl = document.getElementById('graphStatus');
    if (graphStatusEl) {
        if (stats.totalOrders > 0) {
            graphStatusEl.textContent = `${stats.totalOrders} orders - ₱${(stats.totalRevenue || 0).toFixed(2)} revenue`;
        } else {
            graphStatusEl.textContent = 'No sales data for today';
        }
    }
    
    // Check if we're on the sales report page (different chart structure)
    const chartBars = document.getElementById('chartBars');
    
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
    
    // For now, use today's total revenue as the chart value
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
    const chartSummary = document.getElementById('chartSummary');
    if (chartSummary) {
        chartSummary.textContent = `Today: ₱${totalRevenue.toFixed(2)}`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Sales Report page loaded');
    
    const isSalesPage = window.location.pathname.includes('salesandreports');
    
    if (isSalesPage) {
        console.log('🏁 Loading sales report...');
        
        // Load initial data
        loadSalesReport();
        
        // Refresh every 30 seconds
        setInterval(() => {
            console.log('🔄 Refreshing sales report...');
            loadSalesReport();
        }, 30000);
    }
});