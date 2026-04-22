import { useEffect, useMemo, useState } from "react";

const navLinks = ["Home", "Shop", "Categories", "New Arrivals", "Best Sellers", "Track Order", "Contact"];

const categories = [
  {
    title: "Best Sellers",
    count: "24 pieces",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "T-Shirts",
    count: "Essential cuts",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Hoodies & Jackets",
    count: "Outerwear layers",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Oversized Fits",
    count: "Relaxed silhouettes",
    image:
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Bottomwear",
    count: "Cargos, joggers, denim",
    image:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "New Arrivals",
    count: "Fresh drops",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Accessories",
    count: "Caps, bags, details",
    image:
      "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=900&q=80",
  },
];

const products = [
  {
    name: "Shadowline Oversized Tee",
    category: "T-Shirts",
    price: 1299,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Noir Heavyweight Hoodie",
    category: "Hoodies & Jackets",
    price: 2499,
    badge: "New Arrival",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Dark Utility Cargo Pants",
    category: "Bottomwear",
    price: 2199,
    badge: "Limited",
    image:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Black Dream Crossbody",
    category: "Accessories",
    price: 1599,
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
  },
];

const footerColumns = {
  Contact: ["+91 98765 43210", "support@blackdream.in", "Instagram", "Facebook"],
  Information: [
    "About Us",
    "Terms and Conditions",
    "Privacy Policy",
    "Return and Exchange Policy",
    "Shipping Policy",
    "Contact",
  ],
  Account: ["Dashboard", "My Orders", "Account Details", "Return and Exchange"],
};

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 21S4 16.5 4 9.8A4.2 4.2 0 0 1 11.5 7 4.2 4.2 0 0 1 19 9.8C19 16.5 12 21 12 21Z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featuredCategories = useMemo(() => categories.slice(1, 5), []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-white text-[#0b0b0b]">
      <header className={scrolled ? "site-header compact" : "site-header"}>
        <a href="#home" className="brand-mark" aria-label="Black Dream home">
          <img src="/assets/black-dream-logo.png" alt="Black Dream logo" />
          <span>BLACK DREAM</span>
        </a>

        <nav className="desktop-nav">
          {navLinks.map((item) => (
            <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`}>
              {item}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <label className="search-box">
            <SearchIcon />
            <input placeholder="Search drops" />
          </label>
          <button aria-label="Account">
            <UserIcon />
          </button>
          <button aria-label="Wishlist">
            <HeartIcon />
          </button>
          <button aria-label="Cart">
            <CartIcon />
          </button>
        </div>
      </header>

      <main id="home">
        <section className="street-hero">
          <div className="hero-shade" />
          <div className="hero-content fade-in">
            <img src="/assets/black-dream-logo.png" alt="" />
            <p>Premium streetwear built in black</p>
            <h1>Dream Loud. Dress Dark.</h1>
            <span>Oversized fits, heavyweight staples, and monochrome essentials for the city after hours.</span>
            <a href="#shop" className="hero-button">Shop Now</a>
          </div>
        </section>

        <section id="categories" className="page-section">
          <div className="section-title">
            <p>Human Clothing Only</p>
            <h2>Shop the Black Dream Edit</h2>
          </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <article key={category.title} className={index === 0 ? "category-card wide" : "category-card"}>
                <img src={category.image} alt="" />
                <div>
                  <p>{category.count}</p>
                  <h3>{category.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="shop" className="page-section shop-section">
          <div className="section-title">
            <p>Best Sellers</p>
            <h2>Streetwear Staples</h2>
          </div>
          <div className="product-grid">
            {products.map((product, index) => (
              <article key={product.name} className="product-card fade-in" style={{ animationDelay: `${index * 90}ms` }}>
                <div className="product-media">
                  <img src={product.image} alt="" />
                  <span>{product.badge}</span>
                </div>
                <div className="product-copy">
                  <p>{product.category}</p>
                  <h3>{product.name}</h3>
                  <div>
                    <strong>{formatINR(product.price)}</strong>
                    <button>Add to Cart</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="new-arrivals" className="dark-band">
          <div>
            <p>New Arrivals</p>
            <h2>Oversized silhouettes. Clean monochrome. No noise.</h2>
          </div>
          <a href="#shop">Explore the Drop</a>
        </section>

        <section id="best-sellers" className="page-section split-feature">
          <div>
            <p>Popular Now</p>
            <h2>Designed for layered city movement.</h2>
            <span>
              Black Dream focuses on wearable human apparel only: tees, hoodies, jackets, oversized fits, bottomwear,
              accessories, new arrivals, and best sellers.
            </span>
          </div>
          <div className="feature-list">
            {featuredCategories.map((category) => (
              <a key={category.title} href="#shop">
                <span>{category.title}</span>
                <small>{category.count}</small>
              </a>
            ))}
          </div>
        </section>

        <section id="track-order" className="track-panel">
          <div>
            <p>Track Order</p>
            <h2>Already ordered?</h2>
            <span>Enter your order number after checkout to follow shipping updates.</span>
          </div>
          <form>
            <input placeholder="Order ID" />
            <button>Track</button>
          </form>
        </section>
      </main>

      <footer id="contact" className="site-footer">
        <div className="footer-brand">
          <img src="/assets/black-dream-logo.png" alt="" />
          <h2>BLACK DREAM</h2>
          <p>Luxury streetwear essentials in black, white, and shadow tones.</p>
        </div>
        <div className="footer-grid">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title}>
              <h3>{title}</h3>
              {links.map((link) => (
                <a key={link} href="#home">{link}</a>
              ))}
            </div>
          ))}
        </div>
      </footer>

      <button className="back-top" onClick={scrollToTop} aria-label="Back to top">
        &uarr;
      </button>
    </div>
  );
}
