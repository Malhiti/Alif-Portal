// Store management
if (document.getElementById('confirmCreateStoreBtn')) {
    document.getElementById('confirmCreateStoreBtn').addEventListener('click', async () => {
        const storeData = {
            storeName: document.getElementById('storeNameInput').value.trim(),
            colorPalette: document.getElementById('storeColorPalette').value,
            category: document.getElementById('storeCategoryInput').value
        };
        
        if (!storeData.storeName) {
            showNotification('يرجى إدخال اسم المتجر', 'error');
            return;
        }
        
        try {
            const result = await createStore(storeData);
            showNotification(result.message, 'success');
            
            // Refresh store data
            await loadStoreData();
            
            // Go back to dashboard
            showView('dashboardView');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

// Social media settings
if (document.getElementById('saveSocialBtn')) {
    document.getElementById('saveSocialBtn').addEventListener('click', async () => {
        const selectedPlatforms = [];
        document.querySelectorAll('#socialView input[type="checkbox"]:checked').forEach(cb => {
            selectedPlatforms.push(cb.value);
        });
        
        const aiAssistant = document.getElementById('aiAssistantSelect').value;
        
        try {
            await updateSocialSettings(selectedPlatforms, aiAssistant);
            showNotification('تم حفظ إعدادات التواصل الاجتماعي بنجاح', 'success');
            showView('dashboardView');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}