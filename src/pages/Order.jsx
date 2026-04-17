import { api } from "../services/api";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";

/* ─── Helpers ────────────────────────────────── */

function getStoredCart() {
  try {
    const raw = sessionStorage.getItem("cartData");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* ─── Branch Option ──────────────────────────── */

function BranchOption({ branch, selected, onSelect }) {
  return (
    <label className={`branch-option${selected ? " selected" : ""}`}>
      <div className="item-info">
        <div className="item-name">{branch.name}</div>
        {branch.area || branch.address ? (
          <div className="item-desc">{[branch.area, branch.address].filter(Boolean).join(" - ")}</div>
        ) : null}
      </div>
      <input
        type="radio"
        name="branch"
        value={branch.id}
        checked={selected}
        onChange={() => onSelect(branch.id)}
        className="branch-radio"
      />
    </label>
  );
}

/* ─── Cart Item Row ──────────────────────────── */

function CartRow({ item, onChangeQty }) {
  return (
    <div className="cart-item">
      <div className="cart-item__left">
        <div className="item-name">{item.name}</div>
        <div className="item-desc">الكميه: {item.qty}</div>
      </div>
      <div className="cart-item__right">
        <div className="cart-item__price">
          <span>{item.price * item.qty}</span> ج
        </div>
        <div className="item-controls">
          <button 
            className="qty-btn minus-btn" 
            disabled={item.qty === 0} 
            onClick={() => onChangeQty(item.id, -1)} 
            aria-label="تقليل"
          >
            −
          </button>
          <span className="qty-display">{item.qty}</span>
          <button 
            className="qty-btn plus-btn" 
            onClick={() => onChangeQty(item.id, 1)} 
            aria-label="زيادة"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Order Page ─────────────────────────────── */

function Order() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState(getStoredCart);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [additionalPhone, setAdditionalPhone] = useState("");
  const [address, setAddress] = useState("");
  const [orderType, setOrderType] = useState("delivery");
  const [branches, setBranches] = useState([]);
  const [branchStatus, setBranchStatus] = useState("loading");
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.getBranches()
      .then((data) => { setBranches(Array.isArray(data) ? data : []); setBranchStatus("ready"); })
      .catch(() => setBranchStatus("error"));
  }, []);

  // Keep sessionStorage in sync whenever cart changes
  useEffect(() => {
    sessionStorage.setItem("cartData", JSON.stringify(cartItems));
  }, [cartItems]);

  const total = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.qty * i.price, 0),
    [cartItems]
  );

  const totalCount = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.qty, 0),
    [cartItems]
  );

  function handleChangeQty(id, delta) {
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + delta } : item
      ).filter((item) => item.qty > 0);
      return updated;
    });
  }

  function validate() {
    const e = {};
    if (!cartItems.length) e.cart = "السلة فارغة.";
    if (!name.trim()) e.name = "الاسم مطلوب.";
    if (!phone.trim()) e.phone = "رقم الهاتف مطلوب.";
    if (!additionalPhone.trim()) e.additionalPhone = "الرقم الإضافي مطلوب.";
    if (orderType === "delivery" && !address.trim()) e.address = "العنوان مطلوب للتوصيل.";
    if (orderType === "pickup" && !selectedBranchId) e.branch = "اختر فرعاً.";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function handleConfirm() {
    if (!validate()) return;
    const orderData = {
      name: name.trim(),
      phone: phone.trim(),
      additionalPhone: additionalPhone.trim(),
      type: orderType,
      address: orderType === "delivery" ? address.trim() : null,
      branchId: orderType === "pickup" ? selectedBranchId : null,
      notes: null,
    };
    sessionStorage.setItem("orderData", JSON.stringify(orderData));
    sessionStorage.setItem("cartData", JSON.stringify(cartItems));
    navigate("/confirm");
  }

  return (
    <section className="order-page">
      <div className="container">

        <div className="page-heading">
          <h1>اطلب الآن</h1>
          <p>راجع سلتك وأكمل بياناتك</p>
        </div>

        <div className="order-layout">

          {/* ── Right column: cart ── */}
          <div className="order-col">
            <div className="card">
              <div className="card-header">
                <h2>سلتك</h2>
                <Link to="/" className="back-link">+ أضف المزيد</Link>
              </div>

              {cartItems.length ? (
                cartItems.map((item) => (
                  <CartRow key={item.id} item={item} onChangeQty={handleChangeQty} />
                ))
              ) : (
                <div className="loading order-empty">
                  السلة فارغة.{" "}
                  <Link to="/" className="back-link">ارجع للمنيو</Link>
                </div>
              )}
              {errors.cart && <span className="error">{errors.cart}</span>}
            </div>

            <div className="card">
              <h2>بياناتك</h2>

              <div className="form-group">
                <label htmlFor="name">الاسم</label>
                <input id="name" type="text" value={name} placeholder="مثال: محمد أمجد"
                  onChange={(e) => setName(e.target.value)} />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">رقم الهاتف</label>
                <input id="phone" type="tel" value={phone} placeholder="01XXXXXXXXX"
                  onChange={(e) => setPhone(e.target.value)} />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="additionalPhone">رقم إضافي</label>
                <input id="additionalPhone" type="tel" value={additionalPhone} placeholder="01XXXXXXXXX"
                  onChange={(e) => setAdditionalPhone(e.target.value)} />
                {errors.additionalPhone && <span className="error">{errors.additionalPhone}</span>}
              </div>
            </div>
          </div>

          {/* ── Left column: delivery + summary ── */}
          <aside className="order-sidebar">
            <div className="card">
              <h2>طريقة الاستلام</h2>

              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-btn${orderType === "delivery" ? " active" : ""}`}
                  onClick={() => setOrderType("delivery")}
                >
                  توصيل
                </button>
                <button
                  type="button"
                  className={`type-btn${orderType === "pickup" ? " active" : ""}`}
                  onClick={() => setOrderType("pickup")}
                >
                  استلام من الفرع
                </button>
              </div>

              {orderType === "delivery" && (
                <div className="form-group">
                  <label htmlFor="address">العنوان</label>
                  <input id="address" type="text" value={address}
                    placeholder="الشارع، المنطقة، المدينة"
                    onChange={(e) => setAddress(e.target.value)} />
                  {errors.address && <span className="error">{errors.address}</span>}
                </div>
              )}

              {orderType === "pickup" && (
                <div className="branch-list">
                  {branchStatus === "loading" && <div className="loading">جاري تحميل الفروع...</div>}
                  {branchStatus === "error" && <div className="loading">تعذر تحميل الفروع.</div>}
                  {branchStatus === "ready" && branches.map((branch) => (
                    <BranchOption
                      key={branch.id}
                      branch={branch}
                      selected={selectedBranchId === branch.id}
                      onSelect={(id) => { setSelectedBranchId(id); setErrors((p) => ({ ...p, branch: "" })); }}
                    />
                  ))}
                  {errors.branch && <span className="error">{errors.branch}</span>}
                </div>
              )}
            </div>

            <div className="card order-summary-card">
              <h2>ملخص الطلب</h2>

              <div className="summary-row">
                <span className="row-label">عدد الأصناف</span>
                <span className="row-value">{totalCount}</span>
              </div>

              <div className="summary-row summary-total">
                <span className="total-label">الإجمالي</span>
                <span className="total-value">{total} ج</span>
              </div>

              <button className="cta-btn" onClick={handleConfirm}>
                تأكيد الطلب
              </button>
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}

export default Order;