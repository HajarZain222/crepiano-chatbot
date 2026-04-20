import { api } from "../services/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Branch Option ──────────────────────────── */
function BranchOption({ branch, selected, onSelect }) {
  return (
    <label className={`branch-option${selected ? " selected" : ""}`}>
      <div className="item-info">
        <div className="item-name">{branch.name}</div>
        {branch.area || branch.address ? (
          <div className="item-desc">
            {[branch.area, branch.address].filter(Boolean).join(" - ")}
          </div>
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

/* ─── Order Page ─────────────────────────────── */
function Order() {
  const navigate = useNavigate();

  const [name, setName]                         = useState("");
  const [phone, setPhone]                       = useState("");
  const [additionalPhone, setAdditionalPhone]   = useState("");
  const [address, setAddress]                   = useState("");
  const [orderType, setOrderType]               = useState("delivery");
  const [branches, setBranches]                 = useState([]);
  const [branchStatus, setBranchStatus]         = useState("loading");
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [errors, setErrors]                     = useState({});
  const [isPhoneLocked, setIsPhoneLocked]       = useState(false);

  /* ─── تحميل الفروع ─────────────────────────── */
  useEffect(() => {
    api
      .getBranches()
      .then((data) => {
        setBranches(Array.isArray(data) ? data : []);
        setBranchStatus("ready");
      })
      .catch(() => setBranchStatus("error"));
  }, []);

  /* ─── قراءة رقم الهاتف من URL + جلب بيانات العميل ─────────────────────────── */
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   let phoneFromUrl = params.get("phone");

  //   if (phoneFromUrl) {
  //     // تنظيف الرقم (لو جه من الواتساب فيه @lid أو @s.whatsapp)
  //     phoneFromUrl = phoneFromUrl.split("@")[0];

  //     setPhone(phoneFromUrl);
  //     setIsPhoneLocked(true);

  //     api.getCustomer(phoneFromUrl)
  //       .then((data) => {
  //         if (data) {
  //           setName(data.name || "");
  //           setAdditionalPhone(data.additionalPhone || "");
  //           setAddress(data.address || "");
  //         }
  //       })
  //       .catch(() => {});
  //   }
  // }, []);
useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jidFromUrl = params.get("jid");

    if (jidFromUrl) {
        // *** هنا برّا أي حاجة تانية ***
        sessionStorage.setItem("customerJid", jidFromUrl);
        console.log("JID saved:", jidFromUrl);

        api.getCustomer(jidFromUrl)
            .then((data) => {
                if (data) {
                    setName(data.name || "");
                    setPhone(data.phone || "");
                    setAdditionalPhone(data.additionalPhone || "");
                    setAddress(data.address || "");
                }
            })
            .catch(() => {});
    }
}, []);

  /* ─── Validation ─────────────────────────── */
  function validate() {
    const e = {};
    if (!name.trim())            e.name            = "الاسم مطلوب.";
    if (!phone.trim())           e.phone           = "رقم الهاتف مطلوب.";
    if (!additionalPhone.trim()) e.additionalPhone = "الرقم الإضافي مطلوب.";
    if (orderType === "delivery" && !address.trim())
      e.address = "العنوان مطلوب للتوصيل.";
    if (orderType === "pickup" && !selectedBranchId)
      e.branch = "اختر فرعاً.";

    setErrors(e);
    return !Object.keys(e).length;
  }

  /* ─── Submit ─────────────────────────── */
  function handleConfirm() {
    if (!validate()) return;

    const orderData = {
      name:            name.trim(),
      phone:           phone.trim(),
      additionalPhone: additionalPhone.trim(),
      type:            orderType,
      address:         orderType === "delivery" ? address.trim() : null,
      branchId:        orderType === "pickup"   ? selectedBranchId : null,
      notes:           null,
    };

    sessionStorage.setItem("orderData", JSON.stringify(orderData));
    navigate("/menu");
  }

  return (
    <section className="order-page">
      <div className="container">

        {/* Heading */}
        <div className="page-heading">
          <h1>اطلب الآن</h1>
          <p>أدخل بياناتك لإتمام الطلب</p>
        </div>

        <div className="order-layout">

          {/* ── بيانات المستخدم ── */}
          <div className="order-col">
            <div className="card">
              <h2>بياناتك</h2>

              <div className="form-group">
                <label htmlFor="name">الاسم</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  placeholder="مثال: محمد أمجد"
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">رقم الهاتف</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  placeholder="01XXXXXXXXX"
                  disabled={isPhoneLocked}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="additionalPhone">رقم إضافي</label>
                <input
                  id="additionalPhone"
                  type="tel"
                  value={additionalPhone}
                  placeholder="01XXXXXXXXX"
                  onChange={(e) => setAdditionalPhone(e.target.value)}
                />
                {errors.additionalPhone && (
                  <span className="error">{errors.additionalPhone}</span>
                )}
              </div>
            </div>
          </div>

          {/* ── نوع الطلب ── */}
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
                  <input
                    id="address"
                    type="text"
                    value={address}
                    placeholder="الشارع، المنطقة، المدينة"
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  {errors.address && <span className="error">{errors.address}</span>}
                </div>
              )}

              {orderType === "pickup" && (
                <div className="branch-list">
                  {branchStatus === "loading" && (
                    <div className="loading">جاري تحميل الفروع...</div>
                  )}

                  {branchStatus === "error" && (
                    <div className="loading">تعذر تحميل الفروع.</div>
                  )}

                  {branchStatus === "ready" &&
                    branches.map((branch) => (
                      <BranchOption
                        key={branch.id}
                        branch={branch}
                        selected={selectedBranchId === branch.id}
                        onSelect={(id) => {
                          setSelectedBranchId(id);
                          setErrors((p) => ({ ...p, branch: "" }));
                        }}
                      />
                    ))}

                  {errors.branch && (
                    <span className="error">{errors.branch}</span>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* زر المتابعة */}
        <div
          className="cart-bar"
          role="button"
          tabIndex={0}
          onClick={handleConfirm}
          onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
        >
          <span className="cart-count">استعرض المنيو</span>
          <span className="cart-total">متابعة ←</span>
        </div>

      </div>
    </section>
  );
}

export default Order;