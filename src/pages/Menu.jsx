import { api } from "../services/api";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Constants ──────────────────────────────── */

const MENU_CATEGORIES = [
  "كريب",
  "الشاورما",
  "وجبة عربي",
  "قشطوطة",
  "الوافل",
  "حلو ألبان قشطة",
  "الأصناف الجانبية و الإضافات",
];

const CREPE_ORDER = [
  "كريب الدجاج",
  "كريب اللحوم",
  "كريب الجبن",
  "كريب الماجنم",
  "كريب مزاجنجي",
  "كريب سي فود",
  "كريب الحلو",
];

/* ─── Helpers ────────────────────────────────── */

function getMappedCategory(catName) {
  if (catName.startsWith("كريب")) return "كريب";
  if (catName === "إضافات الوافل") return "الوافل";
  if (catName === "إضافات القشطوطة") return "قشطوطة";
  if (catName === "فتة") return "الشاورما";
  return catName;
}

/* ─── Item Controls ──────────────────────────── */

function ItemControls({ itemId, qty, onChangeQty }) {
  return (
    <div className="item-controls">
      <button className="qty-btn minus-btn" disabled={qty === 0} onClick={() => onChangeQty(itemId, -1)} aria-label="تقليل">−</button>
      <span className="qty-display">{qty}</span>
      <button className="qty-btn plus-btn" onClick={() => onChangeQty(itemId, 1)} aria-label="إضافة">+</button>
    </div>
  );
}

/* ─── Menu Item ──────────────────────────────── */

function MenuItem({ item, qty, onChangeQty }) {
  return (
    <div className={`menu-item${qty > 0 ? " selected" : ""}`}>
      <div className="item-info">
        <h3 className="item-name">{item.name}</h3>
        {item.description && <p className="item-desc">{item.description}</p>}
      </div>
      <div className="item-price-wrap">
        <span className="item-price">{item.price}</span> ج
      </div>
      <div className="item-controls">
        <ItemControls itemId={item.id} qty={qty} onChangeQty={onChangeQty} />
      </div>
    </div>
  );
}

/* ─── Section Block ──────────────────────────── */

function SectionBlock({ title, items, cart, onChangeQty }) {
  if (!items.length) return null;
  return (
    <>
      <div className="section-title">{title}</div>
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          qty={cart[item.id]?.qty || 0}
          onChangeQty={onChangeQty}
        />
      ))}
    </>
  );
}

/* ─── Menu Content ───────────────────────────── */

function MenuContent({ allData, activeCategory, cart, onChangeQty }) {
  const grouped = useMemo(() => {
    const map = {};
    allData.forEach((cat) => {
      const mapped = getMappedCategory(cat.category);
      if (!map[mapped]) map[mapped] = [];
      map[mapped].push(cat);
    });
    return map;
  }, [allData]);

  const current = grouped[activeCategory];

  if (!current?.length) return <div className="loading">لا توجد أصناف.</div>;

  if (activeCategory === "كريب") {
    const blocks = CREPE_ORDER.map((type) => {
      const cat = current.find((c) => c.category === type);
      if (!cat) return null;
      return <SectionBlock key={type} title={type} items={cat.items || []} cart={cart} onChangeQty={onChangeQty} />;
    });
    return blocks.some(Boolean) ? <>{blocks}</> : <div className="loading">لا توجد نتائج.</div>;
  }

  if (activeCategory === "قشطوطة") {
    const main = current.find((c) => c.category === "قشطوطة");
    const addons = current.find((c) => c.category === "إضافات القشطوطة");
    return (
      <>
        {main && <SectionBlock title="قشطوطة" items={main.items || []} cart={cart} onChangeQty={onChangeQty} />}
        {addons && <SectionBlock title="إضافات القشطوطة" items={addons.items || []} cart={cart} onChangeQty={onChangeQty} />}
      </>
    );
  }

  if (activeCategory === "الوافل") {
    const main = current.find((c) => c.category === "الوافل");
    const addons = current.find((c) => c.category === "إضافات الوافل");
    return (
      <>
        {main && <SectionBlock title="الوافل" items={main.items || []} cart={cart} onChangeQty={onChangeQty} />}
        {addons && <SectionBlock title="إضافات الوافل" items={addons.items || []} cart={cart} onChangeQty={onChangeQty} />}
      </>
    );
  }

  return (
    <>
      {current.map((cat, idx) => (
        <SectionBlock key={idx} title={cat.category} items={cat.items || []} cart={cart} onChangeQty={onChangeQty} />
      ))}
    </>
  );
}

/* ─── Cart Bar ───────────────────────────────── */

function CartBar({ cart, onClick }) {
  const items = Object.values(cart);
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  if (count === 0) return null;

  return (
    <div className="cart-bar" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onClick()}>
      <span className="cart-count">{count} {count === 1 ? "صنف" : "أصناف"}</span>
      <span className="cart-total">تأكيد الطلب — {total} ج</span>
    </div>
  );
}

/* ─── Main Menu Component ────────────────────── */

function Menu() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0]);
  const [menuData, setMenuData] = useState([]);
  const [status, setStatus] = useState("loading");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("menuCart") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    api.getMenu()
      .then((data) => { setMenuData(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  // Persist cart to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem("menuCart", JSON.stringify(cart));
  }, [cart]);

  const allItems = useMemo(() => menuData.flatMap((c) => c.items || []), [menuData]);

  const guards = useMemo(() => {
    const ids = Object.keys(cart);
    const hasQashtota = ids.some((id) => allItems.find((i) => String(i.id) === id)?.category === "قشطوطة");
    const hasWafel = ids.some((id) => allItems.find((i) => String(i.id) === id)?.category === "الوافل");
    return { hasQashtota, hasWafel, hasAnyItem: ids.length > 0 };
  }, [cart, allItems]);

  const isCategoryDisabled = useCallback((cat) => {
    if (cat === "الأصناف الجانبية و الإضافات") return !guards.hasAnyItem;
    return false;
  }, [guards]);

  const handleChangeQty = useCallback((id, delta) => {
    const item = allItems.find((i) => i.id === id);
    if (!item) return;

    if (delta > 0) {
      if (item.category === "إضافات القشطوطة" && !guards.hasQashtota) return;
      if (item.category === "إضافات الوافل" && !guards.hasWafel) return;
      if (item.category === "الأصناف الجانبية و الإضافات" && !guards.hasAnyItem) return;
    }

    setCart((prev) => {
      const current = prev[id]?.qty || 0;
      const newQty = current + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { id, name: item.name, price: item.price, qty: newQty } };
    });
  }, [allItems, guards]);

  function goToOrder() {
    const items = Object.values(cart);
    if (!items.length) return;
    sessionStorage.setItem("cartData", JSON.stringify(items));
    navigate("/confirm");
  }

  return (
    <section className="menu-page">
      <div className="container">

        <nav className="categories-wrap" aria-label="تصفية الأصناف">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-btn${activeCategory === cat ? " active" : ""}${isCategoryDisabled(cat) ? " disabled" : ""}`}
              onClick={() => !isCategoryDisabled(cat) && setActiveCategory(cat)}
              disabled={isCategoryDisabled(cat)}
              title={isCategoryDisabled(cat) ? "أضف صنفاً أولاً" : ""}
            >
              {cat}
            </button>
          ))}
        </nav>

        <div id="menu-container">
          {status === "loading" && <div className="loading">جاري تحميل المنيو...</div>}
          {status === "error" && <div className="loading">تعذر تحميل المنيو.</div>}
          {status === "ready" && (
            <MenuContent
              allData={menuData}
              activeCategory={activeCategory}
              cart={cart}
              onChangeQty={handleChangeQty}
            />
          )}
        </div>

        <CartBar cart={cart} onClick={goToOrder} />
      </div>
    </section>
  );
}

export default Menu;