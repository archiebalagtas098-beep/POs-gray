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
        const isPaid = order.payment?.status === 'completed';
        
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
                ${!isPaid ? `<button class="btn-pay" onclick="openPaymentModal('${order._id}', '${order.orderNumber}', ${order.total})">Pay</button>` : '<span class="status-badge status-completed">Paid</span>'}
                <button class="btn-receipt" onclick="printReceipt('${order._id}')">Receipt</button>
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
// Payment Modal Functions
function openPaymentModal(orderId, orderNumber, totalAmount) {
    const modal = document.createElement('div');
    modal.id = 'paymentModal';
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="payment-modal-content">
            <div class="modal-header">
                <h2>Process Payment</h2>
                <button class="close-btn" onclick="closePaymentModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="payment-details">
                    <p><strong>Order Number:</strong> ${orderNumber}</p>
                    <p><strong>Total Amount:</strong> <span class="amount">₱${totalAmount.toFixed(2)}</span></p>
                </div>
                <form id="paymentForm">
                    <div class="form-group">
                        <label>Payment Method:</label>
                        <select id="paymentMethod" required>
                            <option value="cash">Cash</option>
                            <option value="gcash">GCash</option>
                            <option value="card">Card</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Amount Paid (₱):</label>
                        <input type="number" id="amountPaid" placeholder="Enter amount" step="0.01" min="0" required>
                    </div>
                    <div class="form-group">
                        <label>Change:</label>
                        <input type="text" id="changeDisplay" readonly placeholder="₱0.00" class="change-display">
                    </div>
                    <div id="paymentError" class="error-message" style="display: none;"></div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel" onclick="closePaymentModal()">Cancel</button>
                <button class="btn-process" onclick="processPayment('${orderId}', ${totalAmount})">Process Payment</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for change calculation
    document.getElementById('amountPaid').addEventListener('input', function() {
        const amountPaid = parseFloat(this.value) || 0;
        const change = amountPaid - totalAmount;
        const changeDisplay = document.getElementById('changeDisplay');
        
        if (change < 0) {
            changeDisplay.value = '₱' + Math.abs(change).toFixed(2) + ' (Shortfall)';
            changeDisplay.style.color = 'red';
        } else {
            changeDisplay.value = '₱' + change.toFixed(2);
            changeDisplay.style.color = 'green';
        }
    });
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.remove();
    }
}

async function processPayment(orderId, totalAmount) {
    const amountPaid = parseFloat(document.getElementById('amountPaid').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const errorDiv = document.getElementById('paymentError');
    
    // Validate
    if (!amountPaid || amountPaid <= 0) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Please enter a valid amount';
        return;
    }
    
    if (amountPaid < totalAmount) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Insufficient payment amount';
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${orderId}/pay`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amountPaid: amountPaid,
                paymentMethod: paymentMethod
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Close modal
            closePaymentModal();
            
            // Store payment data for other tabs/windows
            const paymentData = {
                orderId: orderId,
                orderNumber: result.order.orderNumber,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('orderPaymentCompleted', JSON.stringify(paymentData));
            
            // Emit custom event for same window
            window.dispatchEvent(new CustomEvent('paymentCompleted', { 
                detail: paymentData 
            }));
            
            // Show success message
            alert('Payment processed successfully!\nChange: ₱' + result.receipt.change.toFixed(2));
            
            // Reload orders to update the table
            loadOrders();
            
            // Generate and print receipt
            generateReceipt(result.receipt);
        } else {
            errorDiv.style.display = 'block';
            errorDiv.textContent = result.message || 'Failed to process payment';
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Error processing payment: ' + error.message;
    }
}

function generateReceipt(receiptData) {
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${receiptData.orderNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
                .receipt-header { text-align: center; margin-bottom: 20px; }
                .receipt-header h1 { margin: 0; font-size: 24px; }
                .receipt-header p { margin: 5px 0; color: #666; }
                .receipt-items { margin: 20px 0; border-top: 1px dashed #ddd; border-bottom: 1px dashed #ddd; padding: 10px 0; }
                .receipt-item { display: flex; justify-content: space-between; margin: 8px 0; }
                .receipt-item-name { flex: 1; }
                .receipt-item-qty { width: 40px; text-align: center; }
                .receipt-item-price { width: 80px; text-align: right; }
                .receipt-totals { margin: 20px 0; }
                .receipt-total-row { display: flex; justify-content: space-between; margin: 8px 0; }
                .receipt-total-amount { font-weight: bold; font-size: 18px; }
                .receipt-payment { margin-top: 20px; padding-top: 10px; border-top: 1px dashed #ddd; }
                .receipt-payment-row { display: flex; justify-content: space-between; margin: 5px 0; }
                .receipt-footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                @media print {
                    body { margin: 0; }
                    .btn { display: none; }
                }
                .btn { 
                    background: #007bff; 
                    color: white; 
                    padding: 10px 20px; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    margin: 10px 5px;
                    width: calc(50% - 10px);
                }
                .btn:hover { background: #0056b3; }
                .btn-container { text-align: center; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="receipt-header">
                    <h1>RECEIPT</h1>
                    <p>Order #${receiptData.orderNumber}</p>
                    <p>${receiptData.timestamp}</p>
                </div>
                
                <div class="receipt-items">
                    <h3>Items:</h3>
                    ${receiptData.items.map(item => `
                        <div class="receipt-item">
                            <div class="receipt-item-name">${item.name}</div>
                            <div class="receipt-item-qty">x${item.quantity}</div>
                            <div class="receipt-item-price">₱${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="receipt-totals">
                    <div class="receipt-total-row">
                        <span>Subtotal:</span>
                        <span>₱${receiptData.subtotal.toFixed(2)}</span>
                    </div>
                    ${receiptData.tax > 0 ? `
                        <div class="receipt-total-row">
                            <span>Tax:</span>
                            <span>₱${receiptData.tax.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="receipt-total-row receipt-total-amount">
                        <span>Total:</span>
                        <span>₱${receiptData.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="receipt-payment">
                    <h3>Payment:</h3>
                    <div class="receipt-payment-row">
                        <span>Method:</span>
                        <span>${receiptData.paymentMethod.toUpperCase()}</span>
                    </div>
                    <div class="receipt-payment-row">
                        <span>Amount Paid:</span>
                        <span>₱${receiptData.amountPaid.toFixed(2)}</span>
                    </div>
                    <div class="receipt-payment-row receipt-total-amount">
                        <span>Change:</span>
                        <span>₱${receiptData.change.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <p>Thank you for your purchase!</p>
                    <p>Gray Countryside Cafe</p>
                </div>
                
                <div class="btn-container">
                    <button class="btn" onclick="window.print()">Print Receipt</button>
                    <button class="btn" onclick="window.close()">Close</button>
                </div>
            </div>
        </body>
        </html>
    `;
    
    // Open receipt in new window
    const receiptWindow = window.open('', 'Receipt', 'width=600,height=800');
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
}

function printReceipt(orderId) {
    const order = allOrders.find(o => o._id === orderId);
    if (order) {
        const receiptData = {
            orderNumber: order.orderNumber,
            customerName: order.customerName || "Walk-in Customer",
            items: order.items,
            subtotal: order.subtotal,
            tax: order.tax,
            total: order.total,
            paymentMethod: order.payment?.method || 'Cash',
            amountPaid: order.payment?.amountPaid || order.total,
            change: order.payment?.change || 0,
            timestamp: new Date(order.createdAt).toLocaleString('en-US'),
            orderType: order.type
        };
        generateReceipt(receiptData);
    } else {
        alert('Order not found');
    }
}

// Expose functions to global scope for inline onclick handlers
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.processPayment = processPayment;
window.generateReceipt = generateReceipt;
window.printReceipt = printReceipt;
window.loadOrders = loadOrders;
window.displayOrders = displayOrders;
window.changePage = changePage;
window.searchOrders = searchOrders;
window.filterOrders = filterOrders;
window.filterByDate = filterByDate;
window.refreshOrders = refreshOrders;
window.viewOrderDetails = viewOrderDetails;
