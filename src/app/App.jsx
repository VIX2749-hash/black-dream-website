import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const announcementText =
  "GET 5% OFF ON ALL PREPAID ORDERS • FREE SHIPPING ABOVE ₹1500 • BLACK DREAM";

const categories = [
  "Best Sellers",
  "T-Shirts",
  "Hoodies & Jackets",
  "Oversized Fits",
  "Bottomwear",
  "New Arrivals",
  "Accessories",
];

const products = [
  {
    id: 1,
    name: "Black Oversized Hoodie",
    price: 1999,
    category: "Hoodies & Jackets",
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
    description:
      "Heavyweight cotton fleece hoodie with dropped shoulders, a roomy silhouette, and a clean monochrome finish.",
  },
  {
    id: 2,
    name: "Shadow Core T-Shirt",
    price: 1299,
    category: "T-Shirts",
    badge: "New Arrival",
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    description:
      "Structured premium tee cut with an oversized drape for layered day-to-night streetwear styling.",
  },
  {
    id: 3,
    name: "Noir Cargo Bottoms",
    price: 2199,
    category: "Bottomwear",
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=1200&q=80",
    description:
      "Relaxed cargo trousers with utility pockets, clean taper, and everyday movement comfort.",
  },
  {
    id: 4,
    name: "Midnight Bomber Jacket",
    price: 2799,
    category: "Hoodies & Jackets",
    badge: "Limited Drop",
    image:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
    description:
      "Dark bomber layer with matte hardware, sharp structure, and a premium streetwear attitude.",
  },
  {
    id: 5,
    name: "Wide Shadow Denim",
    price: 2399,
    category: "Oversized Fits",
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1200&q=80",
    description:
      "Relaxed wide-fit denim with deep black wash, clean finish, and extra room through the leg.",
  },
  {
    id: 6,
    name: "Black Dream Cap",
    price: 899,
    category: "Accessories",
    badge: "Accessory",
    image:
      "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=1200&q=80",
    description:
      "Minimal curved-brim cap with tonal detailing for an understated finishing touch.",
  },
];

const footerColumns = {
  Contact: ["supportblackdream@gmail.com", "Instagram", "Facebook"],
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

const StoreContext = createContext(null);

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

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

function useStore() {
  return useContext(StoreContext);
}

function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = window.localStorage.getItem("black-dream-cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [auth, setAuth] = useState(() => {
    const stored = window.localStorage.getItem("black-dream-auth");
    return stored ? JSON.parse(stored) : { loggedIn: false, email: "" };
  });

  useEffect(() => {
    window.localStorage.setItem("black-dream-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem("black-dream-auth", JSON.stringify(auth));
  }, [auth]);

  function addToCart(product) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (existing) {
        return items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ];
    });
  }

  function removeFromCart(productId) {
    setCart((items) => items.filter((item) => item.id !== productId));
  }

  function updateQuantity(productId, quantity) {
    setCart((items) =>
      items.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, Number(quantity)) } : item,
      ),
    );
  }

  function login(email) {
    setAuth({ loggedIn: true, email });
  }

  function logout() {
    setAuth({ loggedIn: false, email: "" });
  }

  const value = useMemo(
    () => ({
      products,
      cart,
      auth,
      addToCart,
      removeFromCart,
      updateQuantity,
      login,
      logout,
    }),
    [auth, cart],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, auth, logout } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const target = document.getElementById(id);
      if (target) {
        window.setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function goToHomeSection(sectionId) {
    navigate(`/#${sectionId}`);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="site-shell">
      <div className="announcement-bar">
        <div className="announcement-track">
          <span>{announcementText}</span>
          <span>{announcementText}</span>
        </div>
      </div>

      <header className={scrolled ? "site-header compact" : "site-header"}>
        <div className="header-row">
          <Link to="/" className="brand-mark" aria-label="Black Dream home">
            <img src="/assets/black-dream-logo.png" alt="Black Dream logo" />
            <span>BLACK DREAM</span>
          </Link>

          <nav className="desktop-nav">
            <Link to="/">Home</Link>
            <Link to="/shop">Shop</Link>
            <button onClick={() => goToHomeSection("categories")}>Categories</button>
            <button onClick={() => goToHomeSection("new-arrivals")}>New Arrivals</button>
            <button onClick={() => goToHomeSection("best-sellers")}>Best Sellers</button>
            <button onClick={() => goToHomeSection("track-order")}>Track Order</button>
            <button onClick={() => goToHomeSection("contact")}>Contact</button>
          </nav>

          <div className="header-tools">
            <label className="search-box">
              <SearchIcon />
              <input placeholder="Search pieces" />
            </label>
            <Link to="/login" className="icon-link" aria-label="Login">
              <UserIcon />
            </Link>
            <button className="icon-link" aria-label="Wishlist">
              <HeartIcon />
            </button>
            <Link to="/cart" className="icon-link" aria-label="Cart">
              <CartIcon />
              {cartCount > 0 && <small>{cartCount}</small>}
            </Link>
          </div>
        </div>

        <div className="mobile-nav">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <button onClick={() => goToHomeSection("categories")}>Categories</button>
          <button onClick={() => goToHomeSection("contact")}>Contact</button>
        </div>

        <div className="auth-pill">
          {auth.loggedIn ? (
            <>
              <span>Logged in as {auth.email}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <span>Guest mode</span>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      <footer id="contact" className="site-footer">
        <div className="footer-brand">
          <img src="/assets/black-dream-logo.png" alt="" />
          <h2>BLACK DREAM</h2>
          <p>Luxury streetwear essentials in black, white, and shadow tones.</p>
          <small>© 2026 Black Dream. All rights reserved.</small>
        </div>
        <div className="footer-grid">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title}>
              <h3>{title}</h3>
              {links.map((link) => (
                <a key={link} href="/">{link}</a>
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

function HomePage() {
  return (
    <main>
      <section className="street-hero">
        <div className="hero-shade" />
        <div className="hero-content fade-in">
          <img src="/assets/black-dream-logo.png" alt="" />
          <p>Premium streetwear built in black</p>
          <h1>Dream Loud. Dress Dark.</h1>
          <span>
            Oversized fits, heavyweight staples, and monochrome essentials for the city after
            hours.
          </span>
          <Link to="/shop" className="hero-button">
            Shop Now
          </Link>
        </div>
      </section>

      <section id="categories" className="page-section">
        <SectionTitle eyebrow="Human Clothing Only" title="Shop the Black Dream Edit" />
        <div className="category-grid">
          {categories.map((category, index) => {
            const product = products[index % products.length];
            return (
              <article
                key={category}
                className={index === 0 ? "category-card wide" : "category-card"}
              >
                <img src={product.image} alt="" />
                <div>
                  <p>{product.badge}</p>
                  <h3>{category}</h3>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="best-sellers" className="page-section shop-section">
        <SectionTitle eyebrow="Best Sellers" title="Streetwear Staples" />
        <ProductGrid items={products.slice(0, 4)} />
      </section>

      <section id="new-arrivals" className="dark-band">
        <div>
          <p>New Arrivals</p>
          <h2>Oversized silhouettes. Clean monochrome. No noise.</h2>
        </div>
        <Link to="/shop">Explore the Drop</Link>
      </section>

      <section className="page-section split-feature">
        <div>
          <p>Popular Now</p>
          <h2>Designed for layered city movement.</h2>
          <span>
            Black Dream focuses on wearable human apparel only: tees, hoodies, jackets, oversized
            fits, bottomwear, accessories, new arrivals, and best sellers.
          </span>
        </div>
        <div className="feature-list">
          {categories.slice(1, 5).map((category) => (
            <Link key={category} to="/shop">
              <span>{category}</span>
              <small>View collection</small>
            </Link>
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
          <button type="button">Track</button>
        </form>
      </section>
    </main>
  );
}

function ShopPage() {
  return (
    <main className="page-section routed-page">
      <SectionTitle eyebrow="Shop" title="All Black Dream Products" />
      <ProductGrid items={products} />
    </main>
  );
}

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const product = products.find((item) => String(item.id) === id);

  if (!product) {
    return (
      <main className="page-section routed-page">
        <SectionTitle eyebrow="Not Found" title="Product Unavailable" />
      </main>
    );
  }

  return (
    <main className="page-section routed-page">
      <div className="product-page-layout">
        <div className="product-page-media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-page-copy">
          <p>{product.category}</p>
          <h1>{product.name}</h1>
          <strong>{formatINR(product.price)}</strong>
          <span>{product.description}</span>
          <button
            className="hero-button dark"
            onClick={() => {
              addToCart(product);
              navigate("/cart");
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}

function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="page-section routed-page">
      <SectionTitle eyebrow="Cart" title="Your Cart" />
      <div className="cart-layout">
        <div className="cart-list">
          {cart.length === 0 && <p className="empty-state">Your cart is empty.</p>}
          {cart.map((item) => (
            <article key={item.id} className="cart-item-card">
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <p>{formatINR(item.price)}</p>
                <div className="cart-controls">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.id, event.target.value)}
                  />
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="cart-summary-card">
          <h3>Order Summary</h3>
          <div>
            <span>Total</span>
            <strong>{formatINR(total)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

function LoginPage() {
  const { auth, login, logout } = useStore();
  const [email, setEmail] = useState(auth.email || "");
  const [password, setPassword] = useState("");

  function submit(event) {
    event.preventDefault();
    login(email || "guest@blackdream.in");
    setPassword("");
  }

  return (
    <main className="page-section routed-page">
      <SectionTitle eyebrow="Login" title="Access Your Account" />
      <form onSubmit={submit} className="login-card">
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>
        <button type="submit">Mock Login</button>
        {auth.loggedIn && (
          <div className="login-state">
            <span>Logged in as {auth.email}</span>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </form>
    </main>
  );
}

function ProductGrid({ items }) {
  const { addToCart } = useStore();

  return (
    <div className="product-grid">
      {items.map((product, index) => (
        <article
          key={product.id}
          className="product-card fade-in"
          style={{ animationDelay: `${index * 90}ms` }}
        >
          <Link to={`/product/${product.id}`} className="product-media">
            <img src={product.image} alt={product.name} />
            <span>{product.badge}</span>
          </Link>
          <div className="product-copy">
            <p>{product.category}</p>
            <Link to={`/product/${product.id}`}>
              <h3>{product.name}</h3>
            </Link>
            <div>
              <strong>{formatINR(product.price)}</strong>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="section-title">
      <p>{eyebrow}</p>
      <h2>{title}</h2>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppLayout />
      </StoreProvider>
    </BrowserRouter>
  );
}
