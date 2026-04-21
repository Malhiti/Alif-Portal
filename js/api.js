// API Configuration
const API_URL = 'http://localhost:3000/api'; // Change to your production URL
let authToken = localStorage.getItem('authToken');

// Generic API caller
async function apiCall(endpoint, method = 'GET', data = null, isFormData = false) {
    const headers = {};
    
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const config = {
        method,
        headers,
    };
    
    if (data) {
        config.body = isFormData ? data : JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'حدث خطأ في الاتصال');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth APIs
async function loginUser(username, password) {
    const result = await apiCall('/auth/login', 'POST', { username, password });
    if (result.token) {
        authToken = result.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
}

async function registerUser(userData) {
    const result = await apiCall('/auth/register', 'POST', userData);
    if (result.token) {
        authToken = result.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
}

function logoutUser() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    window.location.href = 'login.html';
}

// Store APIs
async function createStore(storeData) {
    return await apiCall('/stores/create', 'POST', storeData);
}

async function getMyStore() {
    return await apiCall('/stores/my-store');
}

async function updateSocialSettings(socialLinks, aiAssistant) {
    return await apiCall('/stores/social-settings', 'PUT', { socialLinks, aiAssistant });
}

// Product APIs
async function addProduct(formData) {
    return await apiCall('/products/add', 'POST', formData, true);
}

async function getProducts() {
    return await apiCall('/products/list');
}

async function deleteProduct(productId) {
    return await apiCall(`/products/${productId}`, 'DELETE');
}

// Wallet APIs
async function getWalletBalance() {
    return await apiCall('/wallet/balance');
}

async function transferMoney(toUsername, amount, notes) {
    return await apiCall('/wallet/transfer', 'POST', { toUsername, amount, notes });
}