// Handle login (called from login.html)
if (document.getElementById('doLoginBtn')) {
    document.getElementById('doLoginBtn').addEventListener('click', async () => {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('doLoginBtn');
        
        if (!username || !password) {
            showNotification('يرجى إدخال اسم المستخدم وكلمة المرور', 'error');
            return;
        }
        
        try {
            showLoading(btn, 'جاري الدخول...');
            await loginUser(username, password);
            window.location.href = 'dashboard.html';
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            hideLoading(btn, 'دخول');
        }
    });
}

// Handle registration (called from register.html)
if (document.getElementById('createAccountBtn')) {
    document.getElementById('createAccountBtn').addEventListener('click', async () => {
        const userData = {
            username: document.getElementById('regUsername').value.trim(),
            password: document.getElementById('regPassword').value,
            fullName: document.getElementById('regFullName').value.trim(),
            mobile: document.getElementById('regMobile').value.trim(),
            email: document.getElementById('regEmail').value.trim()
        };
        
        if (!userData.username || !userData.password || !userData.fullName || !userData.mobile) {
            showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        if (userData.password.length < 6) {
            showNotification('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }
        
        try {
            await registerUser(userData);
            showNotification('تم إنشاء الحساب بنجاح! جاري التحويل...');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

// Social login placeholders
if (document.getElementById('googleRegisterBtn')) {
    document.getElementById('googleRegisterBtn').addEventListener('click', () => {
        showNotification('سيتم إضافة تسجيل الدخول عبر جوجل قريباً', 'info');
    });
}

if (document.getElementById('microsoftRegisterBtn')) {
    document.getElementById('microsoftRegisterBtn').addEventListener('click', () => {
        showNotification('سيتم إضافة تسجيل الدخول عبر مايكروسوفت قريباً', 'info');
    });
}