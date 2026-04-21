// Products management
let productsList = [];

// Load products on page show
async function loadProductsList() {
    try {
        productsList = await getProducts();
        renderProductsList();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProductsList() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
    if (productsList.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">لا توجد منتجات، أضف منتجك الأول</p>';
        return;
    }
    
    container.innerHTML = productsList.map(product => `
        <div class="bg-gray-800/50 p-4 rounded-xl flex justify-between items-center hover:bg-gray-700/50 transition">
            <div class="flex-1">
                <p class="text-white font-semibold">${product.name}</p>
                <p class="text-gray-400 text-sm">${formatCurrency(product.selling_price)} | الكمية: ${product.quantity || 0}</p>
                ${product.description ? `<p class="text-gray-500 text-xs mt-1">${product.description.substring(0, 50)}</p>` : ''}
            </div>
            <button class="delete-product-btn text-red-400 hover:text-red-300 px-3 py-2" data-id="${product.id}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>
    `).join('');
    
    // Add delete handlers
    document.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = btn.getAttribute('data-id');
            if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                try {
                    await deleteProduct(productId);
                    showNotification('تم حذف المنتج بنجاح', 'success');
                    await loadProductsList();
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
        });
    });
}

// Add product with media
if (document.getElementById('addProductBtn')) {
    // Media upload trigger
    const mediaTrigger = document.getElementById('productMediaTrigger');
    const fileInput = document.getElementById('productMediaFile');
    
    mediaTrigger.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            const fileType = file.type.split('/')[0];
            showNotification(`تم اختيار ${fileType === 'image' ? 'صورة' : 'فيديو'}: ${file.name}`, 'success');
        }
    });
    
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', async () => {
        const formData = new FormData();
        formData.append('name', document.getElementById('productName').value);
        formData.append('description', document.getElementById('productDesc').value);
        formData.append('purchasePrice', document.getElementById('purchasePrice').value);
        formData.append('sellingPrice', document.getElementById('sellPrice').value);
        formData.append('discount', document.getElementById('discountPercent').value);
        formData.append('quantity', document.getElementById('productQty').value);
        
        const mediaFile = document.getElementById('productMediaFile').files[0];
        if (mediaFile) {
            formData.append('media', mediaFile);
        }
        
        if (!formData.get('name') || !formData.get('sellingPrice')) {
            showNotification('يرجى إدخال اسم المنتج وسعر البيع', 'error');
            return;
        }
        
        try {
            await addProduct(formData);
            showNotification('تم إضافة المنتج بنجاح', 'success');
            
            // Clear form
            document.getElementById('productName').value = '';
            document.getElementById('productDesc').value = '';
            document.getElementById('purchasePrice').value = '';
            document.getElementById('sellPrice').value = '';
            document.getElementById('discountPercent').value = '';
            document.getElementById('productQty').value = '';
            document.getElementById('productMediaFile').value = '';
            
            // Reload products
            await loadProductsList();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}