// const API_BASE = 'https://crepianobot.runasp.net/api';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const api = {
    async getMenu() {
        const res = await fetch(`${API_BASE}/menu`);
        if (!res.ok) throw new Error('فشل تحميل المنيو');
        return res.json();
    },

    async getBranches() {
        const res = await fetch(`${API_BASE}/branch`);
        if (!res.ok) throw new Error('فشل تحميل الفروع');
        return res.json();
    },

    async createOrder(orderData) {
        const res = await fetch(`${API_BASE}/order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        if (!res.ok) throw new Error('فشل إرسال الطلب');
        return res.json();
    },

    async getCustomer(phone) {
        const res = await fetch(`${API_BASE}/customer?phone=${phone}`);
        if (!res.ok) return null;
        return res.json();
    }
};