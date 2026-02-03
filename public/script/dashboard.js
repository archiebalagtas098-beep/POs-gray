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

// Top Selling Products variables - FIXED: Keep actual sales separate
let topSellingProducts = [];
let allSalesData = []; // Store actual sales data

// Order History variables
let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const itemsPerPage = 10;

// Menu Management variables
let allMenuItems = [];

// Inventory Status variables
let inventoryStatusData = [];

// ==================== DOM ELEMENTS ====================
// Cache DOM elements for better performance
let todaysOrdersBody, ordersTableBody, topItemsTableBody, inventoryTableBody;

// ==================== FORMATTING FUNCTIONS ====================


// Sales Report Page Script with Animations

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

// Animation functions
function animateValue(element, start, end, duration, prefix = '', suffix = '') {
    if (!element) return;
    
    const startTime = performance.now();
    const isCurrency = prefix === '₱';
    const isNumber = typeof end === 'number';
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        let currentValue;
        if (isNumber) {
            currentValue = start + (end - start) * easeOut;
            
            if (isCurrency) {
                element.textContent = `${prefix}${currentValue.toFixed(2)}`;
            } else if (suffix === '%') {
                element.textContent = `${currentValue.toFixed(1)}${suffix}`;
            } else {
                element.textContent = Math.round(currentValue);
            }
        } else {
            element.textContent = end;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function fadeInElement(element, delay = 0) {
    if (!element) return;
    
    setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        // Trigger reflow
        void element.offsetWidth;
        
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, delay);
}

function pulseElement(element) {
    if (!element) return;
    
    element.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    element.style.transform = 'scale(1.05)';
    element.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    }, 300);
}

function animateProgressBar(bar, targetHeight, duration = 1000) {
    if (!bar) return;
    
    const startHeight = 0;
    const startTime = performance.now();
    
    function updateBar(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentHeight = startHeight + (targetHeight - startHeight) * easeOut;
        
        bar.style.height = `${currentHeight}%`;
        
        // Add glow effect for today's bar
        if (bar.dataset.isToday === 'true') {
            const intensity = 1 + (0.5 * easeOut);
            bar.style.boxShadow = `0 0 ${10 * intensity}px rgba(76, 175, 80, ${0.3 * easeOut})`;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateBar);
        }
    }
    
    requestAnimationFrame(updateBar);
}

async function loadSalesReport() {
    try {
        console.log('📊 Loading sales report data...');
        
        // Show loading animation
        const loadingElements = document.querySelectorAll('.card, #salesTableBody, #chartBars');
        loadingElements.forEach(el => {
            if (el) el.classList.add('loading-pulse');
        });
        
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const stats = result.success ? result.data : result;
        
        console.log('📊 Sales report stats:', stats);
        
        // Store old values for animation
        const oldData = { ...salesData };
        
        // Update sales data
        salesData.totalRevenue = stats.totalRevenue || 0;
        salesData.totalOrders = stats.totalOrders || 0;
        salesData.totalCustomers = stats.totalCustomers || 0;
        salesData.avgOrderValue = salesData.totalOrders > 0 ? salesData.totalRevenue / salesData.totalOrders : 0;
        
        // Calculate profit
        salesData.grossProfit = salesData.totalRevenue * 0.30;
        salesData.margin = salesData.totalRevenue > 0 ? (salesData.grossProfit / salesData.totalRevenue) * 100 : 0;
        
        if (stats.recentOrders && stats.recentOrders.length > 0) {
            salesData.recentOrders = stats.recentOrders;
        }
        
        // Remove loading animation
        loadingElements.forEach(el => {
            if (el) el.classList.remove('loading-pulse');
        });
        
        updateSalesReportDisplay(oldData);
        
    } catch (error) {
        console.error('❌ Error loading sales report:', error);
        
        // Remove loading animation
        document.querySelectorAll('.loading-pulse').forEach(el => {
            el.classList.remove('loading-pulse');
        });
        
        updateSalesReportDisplay();
    }
}

function updateSalesReportDisplay(oldData = null) {
    // Update report period with animation
    const today = new Date();
    const periodEl = document.getElementById('reportPeriod');
    if (periodEl) {
        periodEl.textContent = `Today's Report - ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        fadeInElement(periodEl, 100);
    }
    
    // Update total revenue with animation
    const totalRevenueEl = document.getElementById('totalRevenueCard');
    if (totalRevenueEl) {
        const startValue = oldData ? oldData.totalRevenue : 0;
        animateValue(totalRevenueEl, startValue, salesData.totalRevenue, 1000, '₱');
        fadeInElement(totalRevenueEl, 200);
        
        // Add subtle pulse on update
        setTimeout(() => pulseElement(totalRevenueEl.closest('.card')), 1200);
    }
    
    // Update total orders with animation
    const totalOrdersEl = document.getElementById('totalOrdersCard');
    if (totalOrdersEl) {
        const startValue = oldData ? oldData.totalOrders : 0;
        animateValue(totalOrdersEl, startValue, salesData.totalOrders, 800);
        fadeInElement(totalOrdersEl, 300);
    }
    
    const ordersChangeEl = document.getElementById('ordersChange');
    if (ordersChangeEl) {
        ordersChangeEl.textContent = `${salesData.totalOrders} orders today`;
        fadeInElement(ordersChangeEl, 400);
    }
    
    // Update total customers with animation
    const totalCustomersEl = document.getElementById('totalCustomersCard');
    if (totalCustomersEl) {
        const startValue = oldData ? oldData.totalCustomers : 0;
        animateValue(totalCustomersEl, startValue, salesData.totalCustomers, 800);
        fadeInElement(totalCustomersEl, 400);
    }
    
    const customersChangeEl = document.getElementById('customersChange');
    if (customersChangeEl) {
        customersChangeEl.textContent = `${salesData.totalCustomers} customers today`;
        fadeInElement(customersChangeEl, 500);
    }
    
    // Update average order value with animation
    const avgOrderEl = document.getElementById('avgOrderValue');
    if (avgOrderEl) {
        const startValue = oldData ? oldData.avgOrderValue : 0;
        animateValue(avgOrderEl, startValue, salesData.avgOrderValue, 1000, '₱');
        fadeInElement(avgOrderEl, 600);
    }
    
    // Update gross profit with animation
    const grossProfitEl = document.getElementById('grossProfit');
    if (grossProfitEl) {
        const startValue = oldData ? oldData.grossProfit : 0;
        animateValue(grossProfitEl, startValue, salesData.grossProfit, 1000, '₱');
        fadeInElement(grossProfitEl, 700);
    }
    
    // Update margin with animation
    const marginEl = document.getElementById('marginValue');
    if (marginEl) {
        const startValue = oldData ? oldData.margin : 0;
        animateValue(marginEl, startValue, salesData.margin, 800, '', '%');
        fadeInElement(marginEl, 800);
    }
    
    // Update graph status
    const graphStatusEl = document.getElementById('graphStatus');
    if (graphStatusEl) {
        if (salesData.totalOrders > 0) {
            graphStatusEl.textContent = `${salesData.totalOrders} orders - ₱${salesData.totalRevenue.toFixed(2)} revenue`;
        } else {
            graphStatusEl.textContent = 'No sales data for today';
        }
        fadeInElement(graphStatusEl, 900);
    }
    
    // Render sales chart with animation
    renderSalesChart(salesData);
    
    // Update sales summary table with animation
    updateSalesTable();
}

function updateSalesTable() {
    const tableBody = document.getElementById('salesTableBody');
    if (!tableBody) return;
    
    // Clear with fade out
    tableBody.style.opacity = '0';
    tableBody.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        if (salesData.totalOrders === 0) {
            tableBody.innerHTML = `
                <tr style="opacity: 0;">
                    <td colspan="6" style="text-align: center; padding: 20px;">No sales data available</td>
                </tr>
            `;
        } else {
            // Create today's sales summary row
            const today = new Date();
            const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            tableBody.innerHTML = `
                <tr style="opacity: 0;">
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
                let summaryHTML = `
                    <tr style="opacity: 0; background-color: #f9f9f9; border-top: 2px solid #ddd;">
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
        
        // Fade in rows one by one
        setTimeout(() => {
            tableBody.style.opacity = '1';
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach((row, index) => {
                row.style.transition = `opacity 0.5s ease ${index * 100}ms, transform 0.5s ease ${index * 100}ms`;
                row.style.transform = 'translateX(-20px)';
                void row.offsetWidth; // Trigger reflow
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            });
        }, 100);
    }, 300);
}

function renderSalesChart(stats) {
    // Update graph status
    const graphStatusEl = document.getElementById('graphStatus');
    if (graphStatusEl) {
        if (stats.totalOrders > 0) {
            graphStatusEl.textContent = `${stats.totalOrders} orders - ₱${(stats.totalRevenue || 0).toFixed(2)} revenue`;
        } else {
            graphStatusEl.textContent = 'No sales data for today';
        }
    }
    
    const chartBars = document.getElementById('chartBars');
    if (!chartBars) return;
    
    // Clear with fade out
    chartBars.style.opacity = '0';
    chartBars.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
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
        
        // Calculate chart data
        const totalRevenue = stats.totalRevenue || 0;
        const hasSales = totalRevenue > 0;
        
        // Define bar heights based on sales data
        let barHeights;
        
        if (hasSales) {
            // Kapag may sales, gumamit ng real data pattern
            const maxRevenue = Math.max(totalRevenue * 1.2, 5000);
            
            // Gumawa ng realistic pattern ng sales data
            // (Mas mababa ang previous days, mas mataas ang today)
            const basePercentage = (totalRevenue / maxRevenue) * 100;
            barHeights = [
                basePercentage * 0.3, // 6 days ago
                basePercentage * 0.4, // 5 days ago
                basePercentage * 0.35, // 4 days ago
                basePercentage * 0.5, // 3 days ago
                basePercentage * 0.6, // 2 days ago
                basePercentage * 0.75, // Yesterday
                basePercentage // Today
            ];
            
            // Siguraduhin na hindi lalagpas sa 100%
            barHeights = barHeights.map(height => Math.min(height, 95));
        } else {
            // Kapag ZERO sales, lahat ng bars ay napakababa (5-10% lang)
            barHeights = [5, 7, 6, 8, 5, 9, 10];
        }
        
        barHeights.forEach((targetHeight, index) => {
            const bar = document.createElement('div');
            const barValue = hasSales ? (targetHeight / 100) * (Math.max(totalRevenue * 1.2, 5000)) : 0;
            
            // Set initial styles - mas mababa ang starting point kapag 0 ang sales
            const initialHeight = hasSales ? 0 : 2; // Kapag 0 sales, start sa 2% para visible pero mababa
            
            bar.style.cssText = `
                height: ${initialHeight}%;
                background: ${index === 6 ? (hasSales ? '#4CAF50' : '#FF9800') : '#E0E0E0'};
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
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.5s ease ${index * 100}ms, transform 0.5s ease ${index * 100}ms;
                position: relative;
                overflow: hidden;
            `;
            
            // Add special styling for zero sales state
            if (!hasSales && index === 6) {
                bar.style.background = 'linear-gradient(to top, #FF9800, #FFB74D)';
                bar.style.boxShadow = 'inset 0 -2px 5px rgba(0,0,0,0.1)';
            }
            
            bar.title = hasSales ? 
                `${dayNames[index]}: ₱${barValue.toFixed(2)}` : 
                `${dayNames[index]}: No sales`;
            
            bar.textContent = '';
            bar.dataset.isToday = (index === 6).toString();
            bar.dataset.hasSales = hasSales.toString();
            
            chartBars.appendChild(bar);
            
            // Animate bar growth with different animation style for zero sales
            setTimeout(() => {
                if (hasSales) {
                    // Normal animation para sa may sales
                    animateProgressBar(bar, targetHeight, 800);
                } else {
                    // Special slow, subtle animation para sa zero sales
                    const startTime = performance.now();
                    const duration = 1200;
                    
                    function updateZeroBar(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Very subtle easing for zero sales
                        const easeOut = 1 - Math.pow(1 - progress, 2);
                        const currentHeight = 2 + (targetHeight - 2) * easeOut;
                        
                        bar.style.height = `${currentHeight}%`;
                        
                        // Add pulsing effect for today's zero sales bar
                        if (index === 6) {
                            const pulse = Math.sin(progress * Math.PI * 2) * 0.1;
                            bar.style.opacity = `${0.7 + pulse}`;
                        }
                        
                        if (progress < 1) {
                            requestAnimationFrame(updateZeroBar);
                        }
                    }
                    
                    requestAnimationFrame(updateZeroBar);
                }
                
                // Fade in bar
                bar.style.opacity = hasSales ? '1' : '0.8';
                bar.style.transform = 'translateY(0)';
                
                // Add floating indicator for zero sales
                if (!hasSales && index === 6) {
                    setTimeout(() => {
                        const zeroIndicator = document.createElement('div');
                        zeroIndicator.textContent = '₱0';
                        zeroIndicator.style.cssText = `
                            position: absolute;
                            top: -20px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: rgba(255, 152, 0, 0.9);
                            color: white;
                            padding: 2px 6px;
                            border-radius: 10px;
                            font-size: 9px;
                            font-weight: bold;
                            opacity: 0;
                            transition: opacity 0.5s ease, top 0.5s ease;
                        `;
                        bar.appendChild(zeroIndicator);
                        
                        setTimeout(() => {
                            zeroIndicator.style.opacity = '1';
                            zeroIndicator.style.top = '-15px';
                        }, 100);
                    }, 500);
                }
            }, index * 150);
        });
        
        // Update summary with special message for zero sales
        const chartSummary = document.getElementById('chartSummary');
        if (chartSummary) {
            if (hasSales) {
                chartSummary.textContent = `Today: ₱${totalRevenue.toFixed(2)}`;
            } else {
                chartSummary.textContent = `Today: ₱0.00 • No sales yet`;
                chartSummary.style.color = '#000000ff';
                chartSummary.style.fontWeight = 'bold';
            }
            fadeInElement(chartSummary, 1200);
        }
        
        // Fade in chart container
        chartBars.style.opacity = '1';
        
        // Add zero sales message if applicable
        if (!hasSales) {
            setTimeout(() => {
                const zeroMessage = document.createElement('div');
                zeroMessage.textContent = 'No sales recorded today';
                zeroMessage.style.cssText = `
                    position: absolute;
                    bottom: -25px;
                    left: 50%;
                    transform: translateX(-50%);
                    color: rgba(26, 183, 12, 1)
                    font-size: 11px;
                    font-weight: bold;
                    opacity: 0;
                    animation: fadeInZeroMessage 1s ease 1.5s forwards;
                `;
                chartBars.parentElement.style.position = 'relative';
                chartBars.parentElement.appendChild(zeroMessage);
            }, 1000);
        }
    }, 300);
}

// Add CSS for loading animation and zero sales effects
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes loadingPulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        @keyframes cardGlow {
            0%, 100% { box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            50% { box-shadow: 0 5px 15px rgba(76, 175, 80, 0.2); }
        }
        
        @keyframes zeroPulse {
            0%, 100% { 
                opacity: 0.7;
                box-shadow: inset 0 -2px 5px rgba(0,0,0,0.1);
            }
            50% { 
                opacity: 0.9;
                box-shadow: inset 0 -2px 5px rgba(255, 152, 0, 0.3),
                          0 0 10px rgba(255, 152, 0, 0.2);
            }
        }
        
        @keyframes fadeInZeroMessage {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        .loading-pulse {
            animation: loadingPulse 1s ease-in-out infinite;
        }
        
        .card-animated {
            transition: all 0.3s ease;
        }
        
        .card-animated:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .value-updated {
            animation: cardGlow 1s ease;
        }
        
        .zero-sales-bar {
            animation: zeroPulse 2s ease-in-out infinite;
        }
        
        .chart-container {
            position: relative;
            min-height: 200px;
        }
    `;
    document.head.appendChild(style);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Sales Report page loaded');
    
    // Add animation styles
    addAnimationStyles();
    
    const isSalesPage = window.location.pathname.includes('salesandreports');
    
    if (isSalesPage) {
        console.log('🏁 Loading sales report...');
        
        // Add animation classes to cards
        document.querySelectorAll('.card').forEach(card => {
            card.classList.add('card-animated');
        });
        
        // Add chart container class
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.classList.add('chart-container');
        }
        
        // Load initial data with slight delay for better visual effect
        setTimeout(() => {
            loadSalesReport();
        }, 500);
        
        // Refresh every 30 seconds
        setInterval(() => {
            console.log('🔄 Refreshing sales report...');
            loadSalesReport();
        }, 30000);
        
        // Add click animations to cards
        document.addEventListener('click', function(e) {
            const card = e.target.closest('.card');
            if (card) {
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            }
        });
    }
});

function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₱0.00';
    }
    
    const numAmount = parseFloat(amount);
    return '₱' + numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'N/A';
    }
}

// ==================== CACHE DOM ELEMENTS ====================
function cacheDOMElements() {
    todaysOrdersBody = document.getElementById('todaysOrdersBody');
    ordersTableBody = document.getElementById('ordersTableBody');
    topItemsTableBody = document.getElementById('topItemsTableBody');
    inventoryTableBody = document.getElementById('inventoryTableBody');
    
    console.log('🔍 DOM Elements cached:');
    console.log('- todaysOrdersBody:', todaysOrdersBody);
    console.log('- ordersTableBody:', ordersTableBody);
    console.log('- topItemsTableBody:', topItemsTableBody);
    console.log('- inventoryTableBody:', inventoryTableBody);
}

// ==================== DASHBOARD STATS ====================
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
            console.warn('⚠️ Dashboard stats API error:', response.status);
            return;
        }

        const data = await response.json();

        if (data.success) {
            dashboardStats = {
                ...dashboardStats,
                ...data.data
            };
            console.log('✅ Dashboard stats loaded');
            updateDashboardUI();
        } else {
            console.warn('⚠️ Dashboard stats API failed:', data.message);
        }
    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
    }
}

function updateDashboardUI() {
    // Update dashboard stats
    const elements = {
        'totalOrders': dashboardStats.totalOrders || 0,
        'totalProducts': allMenuItems.length || 0,
        'totalCustomers': dashboardStats.totalCustomers || 0,
        'totalRevenue': dashboardStats.totalRevenue || 0,
        'totalMenuItems': allMenuItems.length || 0
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'totalRevenue') {
                element.textContent = formatCurrency(value);
            } else {
                element.textContent = formatNumber(value);
            }
        }
    });
    
    console.log('✅ Dashboard UI updated');
}

// ==================== INVENTORY STATUS ====================
async function loadInventoryStatus() {
    try {
        console.log('📦 Loading inventory status...');
        
        // If we have menu items, use them for inventory
        if (allMenuItems.length > 0) {
            inventoryStatusData = allMenuItems.map(item => {
                const name = item.name || item.itemName || 'Unknown Item';
                const stock = parseFloat(item.currentStock || item.stock || 0);
                const maxStock = parseFloat(item.maxStock || 100);
                const minStock = parseFloat(item.minStock || 5);
                const unit = item.unit || 'unit';
                const pricePerUnit = parseFloat(item.price || item.pricePerUnit || 0);
                
                // Calculate value
                const value = stock * pricePerUnit;
                
                // Determine status
                let status = 'In Stock';
                let statusClass = 'in-stock';
                
                if (stock <= 0) {
                    status = 'Out of Stock';
                    statusClass = 'out-of-stock';
                } else if (stock <= minStock) {
                    status = 'Low Stock';
                    statusClass = 'low-stock';
                }
                
                return {
                    name: name,
                    stock: stock,
                    maxStock: maxStock,
                    unit: unit,
                    displayStock: `${formatNumber(stock)}/${formatNumber(maxStock)} ${unit}`,
                    status: status,
                    statusClass: statusClass,
                    value: value,
                    pricePerUnit: pricePerUnit
                };
            });
            
            // Sort by status priority
            inventoryStatusData.sort((a, b) => {
                const statusOrder = { 'Out of Stock': 0, 'Low Stock': 1, 'In Stock': 2 };
                return statusOrder[a.status] - statusOrder[b.status];
            });
            
            updateInventoryStatusTable();
        }
        
    } catch (error) {
        console.error('❌ Error loading inventory status:', error);
    }
}

function updateInventoryStatusTable() {
    if (!inventoryTableBody) return;
    
    if (inventoryStatusData.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    No inventory items available
                </td>
            </tr>
        `;
        return;
    }
    
    // Show only top 10 items
    const displayItems = inventoryStatusData.slice(0, 10);
    
    const tableHTML = displayItems.map(item => {
        return `
        <tr>
            <td>${item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}</td>
            <td style="text-align: center;">${item.displayStock}</td>
            <td style="text-align: center;">${formatCurrency(item.value)}</td>
            <td style="text-align: center;"><span class="${item.statusClass}">${item.status}</span></td>
        </tr>
        `;
    }).join('');
    
    inventoryTableBody.innerHTML = tableHTML;
}

// ==================== TOP SELLING PRODUCTS ====================
async function loadTopSellingProducts() {
    try {
        console.log('📈 Loading top selling products...');
        
        // Try to get actual sales data from API
        try {
            const response = await fetch('/api/orders/top-selling', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                timeout: 5000 // 5 second timeout
            });
            
            if (response && response.ok) {
                const data = await response.json();
                if (data.success) {
                    allSalesData = data.data || [];
                    console.log('✅ Sales data loaded from API:', allSalesData.length);
                }
            }
        } catch (apiError) {
            console.log('ℹ️ No sales API available, using order data');
            allSalesData = [];
        }
        
        // If no API data, calculate from orders
        if (allSalesData.length === 0 && allOrders.length > 0) {
            console.log('🔄 Calculating sales from order history...');
            allSalesData = calculateSalesFromOrders();
        }
        
        // Generate top selling products
        generateTopSellingProducts();
        
    } catch (error) {
        console.error('❌ Error loading top selling products:', error);
        generateTopSellingProducts(); // Still try to generate with available data
    }
}

function calculateSalesFromOrders() {
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
                            name: itemName,
                            totalSold: 0,
                            totalRevenue: 0
                        });
                    }
                    
                    const salesData = salesMap.get(itemName);
                    salesData.totalSold += quantity;
                    salesData.totalRevenue += quantity * price;
                }
            });
        }
    });
    
    return Array.from(salesMap.values());
}

function generateTopSellingProducts() {
    console.log('🔄 Generating top selling products...');
    
    // If we have sales data, use it
    if (allSalesData.length > 0) {
        topSellingProducts = allSalesData.map(sale => {
            // Find corresponding menu item
            const menuItem = allMenuItems.find(item => 
                (item.name || item.itemName) === sale.name ||
                (item.name && sale.name && item.name.includes(sale.name)) ||
                (sale.name && item.name && sale.name.includes(item.name))
            );
            
            const currentStock = menuItem ? parseFloat(menuItem.currentStock || item.stock || 0) : 0;
            const minStock = menuItem ? parseFloat(menuItem.minStock || 5) : 5;
            
            // Determine status based on sales and stock
            let status = 'Normal';
            
            if (currentStock <= 0) {
                status = 'Out of Stock';
            } else if (currentStock <= minStock) {
                status = 'Low Stock';
            } else if (sale.totalSold >= 100) {
                status = 'Bestseller';
            } else if (sale.totalSold >= 50) {
                status = 'Popular';
            } else if (sale.totalSold === 0) {
                status = 'No Sales';
            }
            
            return {
                name: sale.name,
                totalRevenue: sale.totalRevenue || 0,
                totalSold: sale.totalSold || 0,
                status: status,
                currentStock: currentStock
            };
        });
        
        // Sort by total revenue (highest first)
        topSellingProducts.sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        console.log('✅ Generated top selling from sales data:', topSellingProducts.length);
    } 
    // If no sales data but we have menu items
    else if (allMenuItems.length > 0) {
        console.log('⚠️ No sales data, using menu items as placeholder');
        topSellingProducts = allMenuItems.map(item => {
            const name = item.name || item.itemName;
            const currentStock = parseFloat(item.currentStock || item.stock || 0);
            const minStock = parseFloat(item.minStock || 5);
            
            let status = 'No Sales';
            if (currentStock <= 0) {
                status = 'Out of Stock';
            } else if (currentStock <= minStock) {
                status = 'Low Stock';
            }
            
            return {
                name: name,
                totalRevenue: 0,
                totalSold: 0,
                status: status,
                currentStock: currentStock
            };
        });
        
        // Sort alphabetically
        topSellingProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Update the table display
    updateTopSellingTable();
}

function updateTopSellingTable() {
    if (!topItemsTableBody) return;
    
    if (topSellingProducts.length === 0) {
        topItemsTableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 20px;">
                    No products available
                </td>
            </tr>
        `;
        return;
    }
    
    // Show top 10 products
    const displayProducts = topSellingProducts.slice(0, 10);
    
    const tableHTML = displayProducts.map(product => {
        const displayName = product.name.length > 25 
            ? product.name.substring(0, 25) + '...' 
            : product.name;
        
        const revenueDisplay = product.totalRevenue > 0 
            ? formatCurrency(product.totalRevenue)
            : '<span style="color: #999;">No sales</span>';
        
        return `
        <tr>
            <td>${displayName}</td>
            <td style="text-align: center;">${revenueDisplay}</td>
            <td style="text-align: center;"><span class="status-${product.status.toLowerCase().replace(' ', '-')}">${product.status}</span></td>
        </tr>
        `;
    }).join('');
    
    topItemsTableBody.innerHTML = tableHTML;
    
    console.log('✅ Top selling table updated');
}

// ==================== ORDER MANAGEMENT ====================
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
            throw new Error(`Orders API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            allOrders = data.data || [];
            filteredOrders = [...allOrders];
            console.log('✅ Orders loaded:', allOrders.length);
            
            // Render tables
            renderOrdersTable();
            renderPagination();
            updateTodaysOrdersTable();
            
            // After loading orders, refresh top selling products
            loadTopSellingProducts();
        } else {
            throw new Error(data.message || 'Failed to fetch orders');
        }
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        allOrders = [];
        filteredOrders = [];
    }
}

function renderOrdersTable() {
    if (!ordersTableBody) return;
    
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    if (totalPages > 0 && currentPage > totalPages) {
        currentPage = totalPages;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageOrders = filteredOrders.slice(startIndex, endIndex);
    
    if (pageOrders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    const tableHTML = pageOrders.map(order => {
        const orderTime = new Date(order.createdAt || order.orderDate || Date.now());
        const timeString = orderTime.toLocaleTimeString('en-PH', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        const totalAmount = parseFloat(order.totalAmount || order.total || order.totalPrice || 0);
        
        const orderNumber = order.orderNumber || 
                           order.orderId || 
                           order.orderNo || 
                           `ORD-${(order._id || '000000').substring(0, 8)}`;
        
        const customerName = order.customerName || order.customer || 'Walk-in Customer';
        
        return `
        <tr>
            <td>${orderNumber}</td>
            <td style="text-align: center;">${timeString}</td>
            <td>${customerName.length > 20 ? customerName.substring(0, 20) + '...' : customerName}</td>
            <td style="text-align: center;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    ordersTableBody.innerHTML = tableHTML;
}

function updateTodaysOrdersTable() {
    if (!todaysOrdersBody) {
        console.error('❌ todaysOrdersBody element not found!');
        return;
    }
    
    console.log('🕒 Updating Today\'s Orders table...');
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
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
            console.warn('⚠️ Error parsing order date:', order.createdAt);
            return false;
        }
    });
    
    console.log('✅ Today\'s orders found:', todaysOrders.length);
    
    if (todaysOrders.length === 0) {
        todaysOrdersBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px;">
                    No orders today
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by time (newest first) and limit to 6
    todaysOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const displayOrders = todaysOrders.slice(0, 6);
    
    const tableHTML = displayOrders.map(order => {
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
        
        const displayCustomer = customerName.length > 15 
            ? customerName.substring(0, 15) + '...' 
            : customerName;
        
        const orderNumber = order.orderNumber || 
                           `ORD-${order._id ? order._id.substring(0, 6) : 'N/A'}`;
        
        return `
        <tr>
            <td>${orderNumber}</td>
            <td style="text-align: center;">${timeString}</td>
            <td title="${customerName.replace(/"/g, '&quot;')}">${displayCustomer}</td>
            <td style="text-align: center;">${formatCurrency(totalAmount)}</td>
        </tr>
        `;
    }).join('');
    
    todaysOrdersBody.innerHTML = tableHTML;
    console.log('✅ Today\'s Orders table updated');
}

// ==================== MENU MANAGEMENT ====================
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
            throw new Error(`Menu API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            allMenuItems = data.data || [];
            console.log('✅ Menu items loaded:', allMenuItems.length);
            
            // Update all dependent displays
            updateDashboardUI();
            loadInventoryStatus();
            loadTopSellingProducts();
            
        } else {
            throw new Error(data.message || 'Failed to fetch menu items');
        }
    } catch (error) {
        console.error('❌ Error fetching menu items:', error);
        allMenuItems = [];
    }
}

// ==================== PAGINATION ====================
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

// ==================== FILTER ORDERS ====================
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

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard initializing...');
    
    // Cache DOM elements first
    cacheDOMElements();
    
    // Setup event listeners
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filterOrders(e.target.value);
        });
    }
    
    // Load data
    fetchDashboardStats();
    fetchMenuItems();
    loadOrders();
    
    // Auto-refresh every 30 seconds
    setInterval(() => {
        console.log('🔄 Auto-refresh triggered');
        fetchDashboardStats();
        fetchMenuItems();
        loadOrders();
    }, 30000);
    
    console.log('✅ Dashboard initialized');
});

// ==================== UTILITY FUNCTIONS ====================
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (order) {
        const items = order.items || [];
        const itemsList = items.map(item => 
            `${item.name || 'Unknown'} x${item.quantity || 1} = ${formatCurrency((item.price || 0) * (item.quantity || 1))}`
        ).join('\n');
        
        alert(
            `ORDER DETAILS\n\n` +
            `Order #: ${order.orderNumber || 'N/A'}\n` +
            `Customer: ${order.customerName || 'Walk-in'}\n` +
            `Date: ${formatDate(order.createdAt)}\n` +
            `Status: ${order.status || 'Pending'}\n` +
            `Payment: ${order.paymentMethod || 'Cash'}\n` +
            `Total: ${formatCurrency(order.totalAmount || order.total || 0)}\n\n` +
            `ITEMS:\n${itemsList}`
        );
    }
}

function updateMenuItemValue(itemName, pricePerUnit) {
    const itemIndex = allMenuItems.findIndex(item => 
        (item.name || item.itemName) === itemName
    );
    
    if (itemIndex !== -1) {
        const item = allMenuItems[itemIndex];
        const currentStock = parseFloat(item.currentStock || item.stock || 0);
        
        // Update price
        item.price = pricePerUnit;
        item.pricePerUnit = pricePerUnit;
        
        // Calculate new value
        const newValue = currentStock * pricePerUnit;
        item.value = newValue;
        
        console.log(`✅ Updated ${itemName}: Price=${formatCurrency(pricePerUnit)}, Value=${formatCurrency(newValue)}`);
        
        // Refresh displays
        loadInventoryStatus();
        loadTopSellingProducts();
        
        return true;
    }
    
    console.log(`❌ Item not found: ${itemName}`);
    return false;
}

// ==================== STYLES ====================
const dashboardCSS = document.createElement('style');
dashboardCSS.textContent = `
/* Black text only */
* {
    color: #000000 !important;
}

/* Minimal table styling */
table {
    border-collapse: collapse;
    width: 100%;
    font-size: 14px;
}

th {
    font-weight: 600;
    padding: 8px 12px;
    border-bottom: 2px solid #000000;
}

td {
    padding: 6px 12px;
    border-bottom: 1px solid #dddddd;
}

/* Status indicators */
.in-stock { color: #28a745; }
.low-stock { color: #ffc107; }
.out-of-stock { color: #dc3545; }

.status-bestseller { color: #28a745; font-weight: bold; }
.status-popular { color: #17a2b8; }
.status-normal { color: #6c757d; }
.status-no-sales { color: #999999; }

/* Plain buttons */
button {
    background: none;
    border: 1px solid #000000;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 12px;
    margin: 0 2px;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background-color: #f0f0f0;
}

/* Pagination */
#paginationContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    margin-top: 20px;
    padding: 10px;
}

/* Search input */
#orderSearch {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #000000;
    margin-bottom: 20px;
}

/* No data styling */
.empty-state {
    text-align: center;
    padding: 20px;
    color: #666666;
}
`;
document.head.appendChild(dashboardCSS);

// ==================== EXPORT FUNCTIONS ====================
window.filterOrders = filterOrders;
window.changePage = changePage;
window.viewOrderDetails = viewOrderDetails;
window.updateMenuItemValue = updateMenuItemValue;

console.log('✅ Dashboard script loaded successfully');