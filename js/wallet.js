// Wallet functionality
if (document.getElementById('confirmTransferBtn')) {
    const modal = document.getElementById('transferModal');
    const closeBtn = document.getElementById('closeTransferModal');
    const confirmBtn = document.getElementById('confirmTransferBtn');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    confirmBtn.addEventListener('click', async () => {
        const toUsername = document.getElementById('transferToUser').value.trim();
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const notes = document.getElementById('transferNotes').value;
        
        if (!toUsername) {
            showNotification('يرجى إدخال اسم المستخدم المستلم', 'error');
            return;
        }
        
        if (!amount || amount <= 0) {
            showNotification('يرجى إدخال مبلغ صحيح', 'error');
            return;
        }
        
        try {
            const result = await transferMoney(toUsername, amount, notes);
            showNotification(`تم تحويل ${formatCurrency(amount)} إلى ${toUsername}`, 'success');
            modal.classList.add('hidden');
            
            // Refresh wallet balance
            await loadWallet();
            
            // Clear form
            document.getElementById('transferToUser').value = '';
            document.getElementById('transferAmount').value = '';
            document.getElementById('transferNotes').value = '';
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}