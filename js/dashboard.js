// Dashboard functionality
let currentUser = null;
let userStore = null;
let ordersStats = {
    completed: 0,
    delivery: 0,
    current: 0,
    cancelled: 0
};

// Load user data on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!authToken) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
        currentUser = JSON.parse(userStr);
        updateUserProfile();
    }
    
    // Load data
    await loadStoreData();
    await loadWallet();
    await loadOrdersStats();
    
    // Setup event listeners
    setupEventListeners();
});

function updateUserProfile() {
    if (currentUser) {
        document.getElementById('dashboardUserName').innerHTML = currentUser.fullName || currentUser.username;
        document.getElementById('profileName').innerHTML = currentUser.fullName || '---';
        document.getElementById('profileUsername').innerHTML = currentUser.username;
        document.getElementById('profilePhone').innerHTML = currentUser.mobile || '---';
    }
}

async function loadStoreData() {
    try {
        userStore = await getMyStore();
        if (userStore) {
            document.getElementById('storeNamePreview').innerHTML = userStore.store_name;
            document.getElementById('storeTypePreview').innerHTML = userStore.category;
        }
    } catch (error) {
        console.log('No store found');
    }
}

async function loadWallet() {
    try {
        const wallet = await getWalletBalance();
        document.getElementById('walletBalance').innerHTML = formatCurrency(wallet.balance);
    } catch (error) {
        console.error('Error loading wallet:', error);
    }
}

async function loadOrdersStats() {
    // This would come from your API - using mock data for now
    ordersStats = {
        completed: 24,
        delivery: 7,
        current: 12,
        cancelled: 3
    };
    
    document.getElementById('completedOrdersCount').innerText = ordersStats.completed;
    document.getElementById('deliveryOrdersCount').innerText = ordersStats.delivery;
    document.getElementById('currentOrdersCount').innerText = ordersStats.current;
    document.getElementById('cancelledOrdersCount').innerText = ordersStats.cancelled;
}

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logoutUser();
    });
    
    // Create store button
    document.getElementById('createStoreIconBtn').addEventListener('click', () => {
        showView('newStoreView');
    });
    
    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    const closeSidebar = document.getElementById('closeSidebarMobile');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            const nav = item.getAttribute('data-nav');
            if (nav === 'main') showView('dashboardView');
            else if (nav === 'products') showView('productsView');
            else if (nav === 'payments') showView('paymentsView');
            else if (nav === 'orders') showView('ordersView');
            else if (nav === 'social') showView('socialView');
            else if (nav === 'marketing') showView('marketingView');
            else if (nav === 'analytics') showView('analyticsView');
            
            // Close mobile sidebar
            if (window.innerWidth < 768) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Transfer money button
    const transferBtn = document.getElementById('transferMoneyBtn');
    if (transferBtn) {
        transferBtn.addEventListener('click', () => {
            document.getElementById('transferModal').classList.remove('hidden');
        });
    }
}

function showView(viewId) {
    const views = ['dashboardView', 'newStoreView', 'productsView', 'socialView', 
                   'paymentsView', 'ordersView', 'marketingView', 'analyticsView'];
    
    views.forEach(view => {
        const element = document.getElementById(view);
        if (element) element.classList.add('hidden');
    });
    
    const selectedView = document.getElementById(viewId);
    if (selectedView) selectedView.classList.remove('hidden');
    
    // Refresh data when showing views
    if (viewId === 'dashboardView') {
        loadWallet();
        loadOrdersStats();
    } else if (viewId === 'productsView' && typeof loadProductsList === 'function') {
        loadProductsList();
    }
}