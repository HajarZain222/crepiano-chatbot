import { api } from "../services/api";
import { useState, useEffect, useMemo } from "react";
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

/* ─── Menu Item (display only) ───────────────── */

function MenuItem({ item }) {
  return (
    <div className="menu-item">
      <div className="item-info" style={{ textAlign: "right", flex: 1 }}>
        <h3 className="item-name">{item.name}</h3>
        {item.description && <p className="item-desc">{item.description}</p>}
      </div>
      <div className="item-price-wrap" style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        <span className="item-price">{item.price}</span> ج
      </div>
    </div>
  );
}

/* ─── Section Block ──────────────────────────── */

function SectionBlock({ title, items }) {
  if (!items.length) return null;
  return (
    <>
      <div className="section-title">{title}</div>
      {items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </>
  );
}

/* ─── Menu Content ───────────────────────────── */

function MenuContent({ allData, activeCategory }) {
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
      return <SectionBlock key={type} title={type} items={cat.items || []} />;
    });
    return blocks.some(Boolean) ? <>{blocks}</> : <div className="loading">لا توجد نتائج.</div>;
  }

  if (activeCategory === "قشطوطة") {
    const main   = current.find((c) => c.category === "قشطوطة");
    const addons = current.find((c) => c.category === "إضافات القشطوطة");
    return (
      <>
        {main   && <SectionBlock title="قشطوطة"          items={main.items   || []} />}
        {addons && <SectionBlock title="إضافات القشطوطة" items={addons.items || []} />}
      </>
    );
  }

  if (activeCategory === "الوافل") {
    const main   = current.find((c) => c.category === "الوافل");
    const addons = current.find((c) => c.category === "إضافات الوافل");
    return (
      <>
        {main   && <SectionBlock title="الوافل"         items={main.items   || []} />}
        {addons && <SectionBlock title="إضافات الوافل"  items={addons.items || []} />}
      </>
    );
  }

  return (
    <>
      {current.map((cat, idx) => (
        <SectionBlock key={idx} title={cat.category} items={cat.items || []} />
      ))}
    </>
  );
}

/* ─── Sticky Order Button ────────────────────── */

const orderBtnStyles = `
  .order-sticky-btn {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 2rem);
    max-width: 508px;
    background: var(--cta-color, #CC1B1B);
    color: #fff;
    border: none;
    border-radius: var(--radius-lg, 16px);
    padding: 14px 20px;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    z-index: 100;
    transition: background 0.2s ease;
    box-shadow: 0 4px 20px rgba(26, 58, 143, 0.3);
  }

  .order-sticky-btn:hover {
    background: var(--cta-color-hover, #A81515);
  }

  .order-sticky-btn:active {
    transform: translateX(-50%) scale(0.98);
  }

  @media (min-width: 768px) {
    .order-sticky-btn {
      width: auto;
      right: 32px;
      left: auto;
      bottom: 32px;
      max-width: none;
      transform: none;
      border-radius: 50px;
      padding: 14px 36px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
      animation: floatBtn 3s ease-in-out infinite;
      transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    }

    .order-sticky-btn:hover {
      background: var(--color-primary-dark, #c1121f);
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.22);
      animation: none;
    }

    .order-sticky-btn:active {
      transform: translateY(-3px) scale(1.04);
    }
  }

  @keyframes floatBtn {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-5px); }
  }

  /* Prevent content from hiding behind the button */
  .browse-page .container {
    padding-bottom: 82px;
  }

  @media (min-width: 768px) {
    .browse-page .container {
      padding-bottom: 24px;
    }
  }
`;

function OrderButton({ onClick }) {
  return (
    <>
      <style>{orderBtnStyles}</style>
      <button className="order-sticky-btn" onClick={onClick}>
        اطلب الآن ←
      </button>
    </>
  );
}

/* ─── Main Browse Component ──────────────────── */

function Browse() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(MENU_CATEGORIES[0]);
  const [menuData, setMenuData]             = useState([]);
  const [status, setStatus]                 = useState("loading");

  useEffect(() => {
    api
      .getMenu()
      .then((data) => { setMenuData(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <section className="browse-page">
      <div className="container">

        {/* Category Tabs */}
        <nav className="categories-wrap" aria-label="تصفية الأصناف">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-btn${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Menu Container */}
        <div id="menu-container">
          {status === "loading" && <div className="loading">جاري تحميل المنيو...</div>}
          {status === "error"   && <div className="loading">تعذر تحميل المنيو.</div>}
          {status === "ready"   && (
            <MenuContent
              allData={menuData}
              activeCategory={activeCategory}
            />
          )}
        </div>

      </div>

      {/* Sticky Order Button — navigates directly to /order, no conditions */}
      <OrderButton onClick={() => navigate("/order")} />
    </section>
  );
}

export default Browse;