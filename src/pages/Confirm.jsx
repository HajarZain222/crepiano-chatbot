import { api } from "../services/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Confirm() {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const order = JSON.parse(sessionStorage.getItem("orderData") || "null");
    const cart = JSON.parse(sessionStorage.getItem("cartData") || "null");
    if (!order || !cart) { navigate("/order"); return; }
    setOrderData(order);
    setCartData(cart);
  }, [navigate]);

  const total = cartData
    ? cartData.reduce((sum, i) => sum + i.qty * i.price, 0)
    : 0;

  const totalCount = cartData
    ? cartData.reduce((sum, i) => sum + i.qty, 0)
    : 0;

  async function submitOrder() {
    setLoading(true);
    setError(null);

    // const payload = {
    //   customerName: orderData.name,
    //   customerPhone: orderData.phone,
    //   customerAdditionalPhone: orderData.additionalPhone,
    //   type: orderData.type === "delivery" ? 0 : 1,
    //   address: orderData.address || null,
    //   notes: orderData.notes || null,
    //   branchId: orderData.branchId || null,
    //   items: cartData.map((i) => ({ menuItemId: i.id, quantity: i.qty })),
    // };
    const jid = sessionStorage.getItem("customerJid");

    const payload = {
      customerName: orderData.name,
      customerPhone: orderData.phone,
      customerJid: jid || null,
      customerAdditionalPhone: orderData.additionalPhone,
      type: orderData.type === "delivery" ? 0 : 1,
      address: orderData.address || null,
      notes: orderData.notes || null,
      branchId: orderData.branchId || null,
      items: cartData.map((i) => ({ menuItemId: i.id, quantity: i.qty })),
    };

    try {
      await api.createOrder(payload);
      sessionStorage.clear();
      setSubmitted(true);
    } catch {
      setError("حصل خطأ، حاول تاني.");
    } finally {
      setLoading(false);
    }
  }

  if (!orderData || !cartData) return null;

  /* ── Success screen ── */
  if (submitted) {
    return (
      <section className="confirm-page">
        <div className="container">
          <div className="success-block">
            <div className="success-icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>تم إرسال طلبك!</h2>
            <p>انتظر تأكيد المطعم على واتساب.</p>
            <button className="cta-btn" style={{ marginTop: "1.5rem" }} onClick={() => navigate("/")}>
              طلب جديد
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ── Confirm screen ── */
  return (
    <section className="confirm-page">
      <div className="container">

        <div className="page-heading">
          <h1>تأكيد الطلب</h1>
          <p>راجع طلبك قبل الإرسال</p>
        </div>

        {/* Customer data */}
        <div className="card">
          <h2>بياناتك</h2>

          <div className="summary-row">
            <span className="row-label">الاسم</span>
            <span className="row-value">{orderData.name}</span>
          </div>
          <div className="summary-row">
            <span className="row-label">الموبايل</span>
            <span className="row-value">{orderData.phone}</span>
          </div>
          {orderData.additionalPhone && (
            <div className="summary-row">
              <span className="row-label">الرقم الإضافي</span>
              <span className="row-value">{orderData.additionalPhone}</span>
            </div>
          )}
          <div className="summary-row">
            <span className="row-label">الاستلام</span>
            <span className="row-value">
              {orderData.type === "delivery" ? "توصيل" : "استلام من فرع"}
            </span>
          </div>
          {orderData.type === "delivery" && orderData.address && (
            <div className="summary-row">
              <span className="row-label">العنوان</span>
              <span className="row-value">{orderData.address}</span>
            </div>
          )}
        </div>

        {/* Order items */}
        <div className="card">
          <h2>الطلبات</h2>
          {cartData.map((item) => (
            <div className="order-row" key={item.id}>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-desc">× {item.qty}</div>
              </div>
              <span className="item-price">{item.qty * item.price} ج</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="card total-card">
          <div>
            <span className="total-label">الإجمالي</span>
            <span className="row-label" style={{ marginRight: "8px" }}>({totalCount} صنف)</span>
          </div>
          <span className="total-value">{total} ج</span>
        </div>

        {error && (
          <p className="confirm-error">{error}</p>
        )}

        <button className="cta-btn" onClick={submitOrder} disabled={loading}>
          {loading ? "جاري الإرسال..." : "تأكيد الطلب"}
        </button>

        <button className="back-btn" onClick={() => navigate("/menu")}>
          تعديل الطلب
        </button>

      </div>
    </section>
  );
}

export default Confirm;