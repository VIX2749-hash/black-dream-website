import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { auth as firebaseAuth, firebaseEnabled, googleProvider } from "../lib/firebase";

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
    availability: "in_stock",
    keywords: ["hoodie", "oversized", "streetwear", "black hoodie", "winter"],
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
    availability: "in_stock",
    keywords: ["tshirt", "t-shirt", "tee", "shirt", "black tee", "oversized tee"],
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
    availability: "in_stock",
    keywords: ["cargo", "pants", "trousers", "bottoms", "black cargo"],
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
    availability: "out_of_stock",
    keywords: ["jacket", "bomber", "outerwear", "black jacket"],
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
    availability: "in_stock",
    keywords: ["denim", "jeans", "wide fit", "oversized", "black denim"],
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
    availability: "in_stock",
    keywords: ["cap", "hat", "accessory", "headwear"],
    image:
      "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=1200&q=80",
    description:
      "Minimal curved-brim cap with tonal detailing for an understated finishing touch.",
  },
];

const searchLogicCatalog = [
  { term: "joggers", label: "Joggers", status: "coming_soon", note: "Coming soon to Bottomwear." },
  { term: "sweatshirt", label: "Sweatshirts", status: "coming_soon", note: "Coming soon to layered essentials." },
  { term: "tank top", label: "Tank Tops", status: "coming_soon", note: "Coming soon to summer drops." },
  { term: "tshirt", label: "T-Shirts", status: "category" },
  { term: "tee", label: "T-Shirts", status: "category" },
  { term: "shirt", label: "T-Shirts", status: "category" },
  { term: "hoodie", label: "Hoodies & Jackets", status: "category" },
  { term: "jacket", label: "Hoodies & Jackets", status: "category" },
  { term: "cargo", label: "Bottomwear", status: "category" },
  { term: "jeans", label: "Oversized Fits", status: "category" },
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

function readStoredJson(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return fallback;
    }

    return JSON.parse(stored);
  } catch (error) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage cleanup failures in restricted browsers.
    }

    return fallback;
  }
}

function writeStoredJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write failures so the UI can still render.
  }
}

function normalizeSearchValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(a, b) {
  const first = normalizeSearchValue(a);
  const second = normalizeSearchValue(b);

  if (!first.length) {
    return second.length;
  }

  if (!second.length) {
    return first.length;
  }

  const matrix = Array.from({ length: first.length + 1 }, () => Array(second.length + 1).fill(0));

  for (let i = 0; i <= first.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= second.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= first.length; i += 1) {
    for (let j = 1; j <= second.length; j += 1) {
      const cost = first[i - 1] === second[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[first.length][second.length];
}

function getAvailabilityLabel(status) {
  if (status === "out_of_stock") {
    return "Out of Stock";
  }

  if (status === "coming_soon") {
    return "Coming Soon";
  }

  return "In Stock";
}

function getShortEmail(email) {
  const value = String(email || "").trim();
  if (value.length <= 24) {
    return value;
  }

  const [namePart = "", domainPart = ""] = value.split("@");
  return `${namePart.slice(0, 10)}...@${domainPart}`;
}

function getProductSearchScore(product, normalizedQuery) {
  if (!normalizedQuery) {
    return 0;
  }

  const queryTokens = normalizedQuery.split(" ");
  const haystack = normalizeSearchValue(
    [product.name, product.category, product.description, ...(product.keywords || [])].join(" "),
  );
  const words = haystack.split(" ");
  let score = 0;

  if (haystack.includes(normalizedQuery)) {
    score += 10;
  }

  if (normalizeSearchValue(product.name).includes(normalizedQuery)) {
    score += 8;
  }

  queryTokens.forEach((token) => {
    if (!token) {
      return;
    }

    if (words.some((word) => word.startsWith(token))) {
      score += 4;
    }

    if (words.some((word) => levenshteinDistance(word, token) <= 1)) {
      score += 3;
    }

    if ((product.keywords || []).some((keyword) => levenshteinDistance(keyword, token) <= 2)) {
      score += 3;
    }
  });

  return score;
}

function getSearchExperience(query) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return { products: [], suggestions: [], emptyMessage: "" };
  }

  const scoredProducts = products
    .map((product) => {
      return { product, score: getProductSearchScore(product, normalizedQuery) };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  const suggestionPool = [
    ...searchLogicCatalog.map((item) => ({
      type: item.status,
      label: item.label,
      note: item.note || "",
      score:
        normalizeSearchValue(item.term).includes(normalizedQuery) ||
        normalizedQuery.includes(normalizeSearchValue(item.term))
          ? 8
          : levenshteinDistance(item.term, normalizedQuery) <= 2
            ? 6
            : 0,
    })),
    ...products.map((product) => ({
      type: product.availability,
      label: product.name,
      note:
        product.availability === "out_of_stock"
          ? "Currently unavailable."
          : product.availability === "coming_soon"
            ? "Launching soon."
            : product.category,
      score:
        levenshteinDistance(product.name, normalizedQuery) <= 3 ||
        (product.keywords || []).some((keyword) => levenshteinDistance(keyword, normalizedQuery) <= 2)
          ? 5
          : 0,
    })),
  ];

  const suggestions = suggestionPool
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .filter((item, index, list) => list.findIndex((entry) => entry.label === item.label) === index)
    .slice(0, 4);

  let emptyMessage = "";
  if (scoredProducts.length === 0) {
    const closestSuggestion = suggestions[0];
    if (closestSuggestion?.type === "coming_soon") {
      emptyMessage = `${closestSuggestion.label} is coming soon.`;
    } else if (closestSuggestion?.type === "out_of_stock") {
      emptyMessage = `${closestSuggestion.label} is out of stock right now.`;
    } else if (closestSuggestion) {
      emptyMessage = `Showing related search ideas for "${query}".`;
    } else {
      emptyMessage = `No exact match for "${query}". Try hoodie, tee, cargo, cap, or denim.`;
    }
  }

  return {
    products: scoredProducts.map((entry) => entry.product),
    suggestions,
    emptyMessage,
  };
}

const defaultCheckoutForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
const manualPaymentQrSrc = "/assets/manual-payment-qr.png";

function getFirebaseAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again in a little while.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Google sign-in popup was blocked. Please allow popups and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return error?.message || "Authentication failed.";
  }
}

function validateCheckoutForm(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!/^\d{10}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid 10-digit phone number.";
  }

  if (!form.address.trim()) {
    errors.address = "Address is required.";
  }

  if (!form.city.trim()) {
    errors.city = "City is required.";
  }

  if (!form.state.trim()) {
    errors.state = "State is required.";
  }

  if (!/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode.";
  }

  return errors;
}

function loadRazorpayScript() {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-razorpay="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function createBackendRazorpayOrder({ cart, total, form, email }) {
  const response = await fetch(`${apiBaseUrl}/payments/razorpay/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: total * 100,
      currency: "INR",
      email: email || null,
      receipt: `bd_${Date.now()}`,
      shipping_address: {
        full_name: form.fullName,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      },
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Unable to create Razorpay order.");
  }

  return response.json();
}

async function verifyBackendRazorpayPayment(payload) {
  const response = await fetch(`${apiBaseUrl}/payments/razorpay/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || "Unable to verify Razorpay payment.");
  }

  return response.json();
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

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState("up");

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (scrollY > lastScrollY) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, []);

  return scrollDirection;
}

function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => readStoredJson("black-dream-cart", []));
  const [auth, setAuth] = useState({
    loggedIn: false,
    email: "",
    displayName: "",
    uid: "",
    loading: true,
    ready: firebaseEnabled,
  });

  useEffect(() => {
    writeStoredJson("black-dream-cart", cart);
  }, [cart]);

  useEffect(() => {
    if (!firebaseEnabled || !firebaseAuth) {
      setAuth({
        loggedIn: false,
        email: "",
        displayName: "",
        uid: "",
        loading: false,
        ready: false,
      });
      return undefined;
    }

    let active = true;

    setPersistence(firebaseAuth, browserLocalPersistence).catch(() => undefined);

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (!active) {
        return;
      }

      setAuth({
        loggedIn: Boolean(user),
        email: user?.email || "",
        displayName: user?.displayName || "",
        uid: user?.uid || "",
        loading: false,
        ready: true,
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

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

  function clearCart() {
    setCart([]);
  }

  async function login(email, password) {
    if (!firebaseEnabled || !firebaseAuth) {
      throw new Error("Firebase Authentication is not configured.");
    }

    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async function signup(email, password) {
    if (!firebaseEnabled || !firebaseAuth) {
      throw new Error("Firebase Authentication is not configured.");
    }

    await createUserWithEmailAndPassword(firebaseAuth, email, password);
  }

  async function logout() {
    if (!firebaseEnabled || !firebaseAuth) {
      throw new Error("Firebase Authentication is not configured.");
    }

    await signOut(firebaseAuth);
  }

  async function loginWithGoogle() {
    if (!firebaseEnabled || !firebaseAuth || !googleProvider) {
      throw new Error(
        "Google sign-in needs Firebase config and Google provider enabled before it can be used.",
      );
    }

    googleProvider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(firebaseAuth, googleProvider);
  }

  const value = useMemo(
    () => ({
      products,
      cart,
      auth,
      firebaseReady: firebaseEnabled,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      login,
      loginWithGoogle,
      signup,
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
  const direction = useScrollDirection();
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let previousScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const scrollingDown = currentScroll > previousScroll + 4;
      const scrollingUp = currentScroll < previousScroll - 4;

      setScrolled(currentScroll > 50);

      if (currentScroll <= 50) {
        setShowSearch(false);
      } else if (scrollingDown) {
        setShowSearch(false);
        setSearchOpen(false);
      } else if (scrollingUp) {
        setShowSearch(true);
      }

      previousScroll = currentScroll;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setShowSearch(false);
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
  const desktopSearchVisible = searchOpen || (scrolled && showSearch);
  const searchExperience = getSearchExperience(searchQuery);

  function goToHomeSection(sectionId) {
    navigate(`/#${sectionId}`);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitSearch(event) {
    event.preventDefault();

    const firstProduct = searchExperience.products[0];
    if (firstProduct) {
      navigate(`/product/${firstProduct.id}`);
      setSearchOpen(false);
      return;
    }

    navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  }

  return (
    <div className="site-shell">
      <div className="announcement-bar">
        <div className="announcement-track">
          <div className="announcement-content">
            {"GET 5% OFF ON ALL PREPAID ORDERS \u2022 FREE SHIPPING ABOVE \u20B91500 \u2022 BLACK DREAM \u2022"}
          </div>
          <div className="announcement-content">
            {"GET 5% OFF ON ALL PREPAID ORDERS \u2022 FREE SHIPPING ABOVE \u20B91500 \u2022 BLACK DREAM \u2022"}
          </div>
        </div>
      </div>

      <header
        className={
          scrolled
            ? `site-header header compact scrolled ${direction === "down" ? "hide" : ""}`.trim()
            : `site-header header ${direction === "down" ? "hide" : ""}`.trim()
        }
      >
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
            <div className="desktop-search-shell">
              <form
                className={
                  desktopSearchVisible ? "search-bar search-visible" : "search-bar search-hidden"
                }
                onSubmit={submitSearch}
              >
                <SearchIcon />
                <input
                  placeholder="Search pieces"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                {searchQuery.trim() && (
                  <SearchResultsPanel
                    query={searchQuery}
                    experience={searchExperience}
                    onPickProduct={(productId) => {
                      navigate(`/product/${productId}`);
                      setSearchOpen(false);
                    }}
                    onPickSuggestion={(value) => {
                      setSearchQuery(value);
                      navigate(`/shop?q=${encodeURIComponent(value)}`);
                      setSearchOpen(false);
                    }}
                  />
                )}
              </form>
            </div>
            <button
              className="icon-link mobile-search-trigger"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
            >
              <SearchIcon />
            </button>
            <Link
              to="/login"
              className={auth.loggedIn ? "icon-link logged-in" : "icon-link"}
              aria-label={auth.loggedIn ? `Logged in as ${auth.email}` : "Login"}
            >
              <UserIcon />
              {auth.loggedIn && <small>1</small>}
            </Link>
            <Link to="/wishlist" className="icon-link" aria-label="Wishlist">
              <HeartIcon />
            </Link>
            <Link to="/cart" className="icon-link" aria-label="Cart">
              <CartIcon />
              {cartCount > 0 && <small>{cartCount}</small>}
            </Link>
          </div>
        </div>

        <div className={searchOpen ? "mobile-search-row open" : "mobile-search-row"}>
          <div className="mobile-search-box">
            <SearchIcon />
            <input
              placeholder="Search pieces"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery.trim() && (
              <SearchResultsPanel
                query={searchQuery}
                experience={searchExperience}
                onPickProduct={(productId) => {
                  navigate(`/product/${productId}`);
                  setSearchOpen(false);
                }}
                onPickSuggestion={(value) => {
                  setSearchQuery(value);
                  navigate(`/shop?q=${encodeURIComponent(value)}`);
                  setSearchOpen(false);
                }}
              />
            )}
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
              <div className="auth-pill-user">
                <strong>{auth.displayName || auth.email}</strong>
                <small>{auth.displayName ? getShortEmail(auth.email) : "Firebase account"}</small>
              </div>
              <button onClick={() => logout()}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login / Sign Up</Link>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
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
    <main className="main-content">
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
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const searchExperience = getSearchExperience(searchQuery);
  const visibleProducts = searchQuery.trim() ? searchExperience.products : products;

  return (
    <main className="main-content page-section routed-page">
      <SectionTitle
        eyebrow={searchQuery.trim() ? "Search Results" : "Shop"}
        title={searchQuery.trim() ? `Results for "${searchQuery}"` : "All Black Dream Products"}
      />

      {searchQuery.trim() && (
        <div className="shop-search-feedback">
          {visibleProducts.length > 0 ? (
            <p>
              Showing {visibleProducts.length} match{visibleProducts.length > 1 ? "es" : ""} for
              <strong> {searchQuery}</strong>.
            </p>
          ) : (
            <>
              <p>{searchExperience.emptyMessage}</p>
              {searchExperience.suggestions.length > 0 && (
                <div className="shop-search-suggestions">
                  {searchExperience.suggestions.map((suggestion) => (
                    <span key={`${suggestion.type}-${suggestion.label}`} className="shop-suggestion-chip">
                      {suggestion.label} - {suggestion.note || getAvailabilityLabel(suggestion.type)}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <ProductGrid items={visibleProducts} />
    </main>
  );
}

function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useStore();
  const [cartMessage, setCartMessage] = useState("");
  const product = products.find((item) => String(item.id) === id);

  if (!product) {
    return (
      <main className="main-content page-section routed-page">
        <SectionTitle eyebrow="Not Found" title="Product Unavailable" />
      </main>
    );
  }

  return (
    <main className="main-content page-section routed-page">
      <div className="product-page-layout">
        <div className="product-page-media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-page-copy">
          <p>{product.category}</p>
          <h1>{product.name}</h1>
          <em className={`availability-pill ${product.availability}`}>
            {getAvailabilityLabel(product.availability)}
          </em>
          <strong>{formatINR(product.price)}</strong>
          <span>{product.description}</span>
          <button
            className="hero-button dark"
            disabled={product.availability !== "in_stock"}
            onClick={() => {
              addToCart(product);
              setCartMessage("+1");
              window.setTimeout(() => setCartMessage(""), 1200);
            }}
          >
            {product.availability === "in_stock" ? "Add to Cart" : getAvailabilityLabel(product.availability)}
          </button>
          {cartMessage && <small className="inline-feedback">{cartMessage}</small>}
        </div>
      </div>
    </main>
  );
}

function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="main-content page-section routed-page">
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
                  <div className="quantity-stepper">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.id, event.target.value)}
                    />
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
        <aside className="cart-summary-card">
          <h3>Order Summary</h3>
          <div>
            <span>Items</span>
            <strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatINR(total)}</strong>
          </div>
          <Link
            to="/checkout"
            className={cart.length === 0 ? "checkout-link disabled" : "checkout-link"}
            aria-disabled={cart.length === 0}
            onClick={(event) => {
              if (cart.length === 0) {
                event.preventDefault();
              }
            }}
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, auth } = useStore();
  const [form, setForm] = useState(defaultCheckoutForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [showMockPayment, setShowMockPayment] = useState(false);
  const [qrUnavailable, setQrUnavailable] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isLocalDev =
    window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

  useEffect(() => {
    if (cart.length === 0) {
      setStatus("Your cart is empty. Add products before checkout.");
    } else {
      setStatus("");
    }
  }, [cart.length]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function completeOrder() {
    clearCart();
    setSubmitting(false);
    setShowMockPayment(false);
    setQrUnavailable(false);
    setStatus(`Order Placed. Shipping to ${form.fullName}, ${form.city}.`);
    setForm(defaultCheckoutForm);
  }

  async function payNow(event) {
    event.preventDefault();

    const nextErrors = validateCheckoutForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("Please fill every checkout field correctly.");
      return;
    }

    if (cart.length === 0) {
      setStatus("Your cart is empty. Add products before checkout.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const order = await createBackendRazorpayOrder({
        cart,
        total,
        form,
        email: auth.email,
      });

      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady || !window.Razorpay) {
        throw new Error("Razorpay failed to load. Check your connection and try again.");
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: order.business_name,
        description: "Streetwear order",
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyBackendRazorpayPayment(response);
            completeOrder();
          } catch (verifyError) {
            setSubmitting(false);
            setStatus(verifyError.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setStatus("Payment was cancelled.");
          },
        },
        prefill: {
          name: form.fullName,
          email: auth.email,
          contact: form.phone,
        },
        notes: {
          address: `${form.address}, ${form.city}, ${form.state} - ${form.pincode}`,
        },
        theme: {
          color: "#111111",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        setSubmitting(false);
        setStatus("Payment failed. Try again.");
      });
      razorpay.open();
    } catch (error) {
      if (isLocalDev) {
        setShowMockPayment(true);
        setSubmitting(false);
        setStatus("Backend payment is not configured yet, so mock payment is being used locally.");
        return;
      }

      setSubmitting(false);
      setStatus(error.message || "Unable to start payment.");
    }
  }

  return (
    <main className="main-content page-section routed-page">
      <SectionTitle eyebrow="Checkout" title="Shipping & Payment" />
      <div className="checkout-layout">
        <form onSubmit={payNow} className="checkout-card">
          {[
            ["fullName", "Full Name"],
            ["phone", "Phone"],
            ["address", "Address"],
            ["city", "City"],
            ["state", "State"],
            ["pincode", "Pincode"],
          ].map(([field, label]) => (
            <label key={field}>
              {label}
              <input
                value={form[field]}
                onChange={(event) => updateField(field, event.target.value)}
                type={field === "phone" || field === "pincode" ? "tel" : "text"}
              />
              {errors[field] && <small className="field-error">{errors[field]}</small>}
            </label>
          ))}
          {status && <p className="checkout-status">{status}</p>}
          <button type="submit" disabled={submitting || cart.length === 0}>
            {submitting ? "Opening Razorpay..." : "Pay Now"}
          </button>
        </form>

        <aside className="cart-summary-card checkout-summary">
          <h3>Checkout Summary</h3>
          {cart.length === 0 ? (
            <>
              <p className="empty-state">No items in cart yet.</p>
              <Link to="/shop" className="checkout-link">
                Continue Shopping
              </Link>
            </>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id}>
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <strong>{formatINR(item.price * item.quantity)}</strong>
                </div>
              ))}
              <div>
                <span>Total</span>
                <strong>{formatINR(total)}</strong>
              </div>
              <button type="button" className="ghost-link" onClick={() => navigate("/cart")}>
                Back to Cart
              </button>
            </>
          )}
        </aside>
      </div>
      {showMockPayment && (
        <div className="mock-payment-overlay">
          <div className="mock-payment-card">
            <p>QR Payment</p>
            <h3>Scan to Pay</h3>
            <span>
              Local development mode is using a manual QR checkout so you can test a real scan-and-pay
              flow before the live gateway is fully connected.
            </span>
            <div className="mock-payment-qr-block">
              {!qrUnavailable ? (
                <img
                  src={manualPaymentQrSrc}
                  alt="Manual payment QR code"
                  className="mock-payment-qr"
                  onError={() => setQrUnavailable(true)}
                />
              ) : (
                <div className="mock-payment-qr-fallback">
                  QR image not added yet. Put your payment QR image at
                  <strong> /public/assets/manual-payment-qr.png</strong>.
                </div>
              )}
              <small>Scan the QR, finish payment, then click the confirm button below.</small>
            </div>
            <div className="mock-payment-summary">
              <strong>Total</strong>
              <strong>{formatINR(total)}</strong>
            </div>
            <div className="mock-payment-actions">
              <button type="button" className="ghost-link" onClick={() => setShowMockPayment(false)}>
                Cancel
              </button>
              <button type="button" onClick={completeOrder}>
                I Have Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function WishlistPage() {
  return (
    <main className="main-content page-section routed-page">
      <SectionTitle eyebrow="Wishlist" title="Saved Pieces" />
      <div className="login-card">
        <p className="empty-state">
          Your wishlist is ready. Start saving the Black Dream pieces you want to come back to.
        </p>
        <Link to="/shop" className="checkout-link">
          Browse Products
        </Link>
      </div>
    </main>
  );
}

function SearchResultsPanel({ query, experience, onPickProduct, onPickSuggestion }) {
  return (
    <div className="search-results-panel">
      {experience.products.length > 0 && (
        <div className="search-results-group">
          <p>Products</p>
          {experience.products.map((product) => (
            <button
              key={product.id}
              type="button"
              className="search-result-item"
              onClick={() => onPickProduct(product.id)}
            >
              <span>
                <strong>{product.name}</strong>
                <small>{product.category}</small>
              </span>
              <em className={`availability-pill ${product.availability}`}>
                {getAvailabilityLabel(product.availability)}
              </em>
            </button>
          ))}
        </div>
      )}

      {experience.suggestions.length > 0 && (
        <div className="search-results-group">
          <p>Related</p>
          {experience.suggestions.map((suggestion) => (
            <button
              key={`${suggestion.type}-${suggestion.label}`}
              type="button"
              className="search-result-hint"
              onClick={() => onPickSuggestion?.(suggestion.label)}
            >
              <strong>{suggestion.label}</strong>
              <small>
                {suggestion.note || getAvailabilityLabel(suggestion.type).replace("In Stock", "Available")}
              </small>
            </button>
          ))}
        </div>
      )}

      {experience.emptyMessage && (
        <div className="search-empty-state">
          <strong>No direct match for "{query}"</strong>
          <small>{experience.emptyMessage}</small>
        </div>
      )}
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { auth, login, loginWithGoogle, signup, logout, firebaseReady } = useStore();
  const [email, setEmail] = useState(auth.email || "");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setEmail(auth.email || "");
  }, [auth.email]);

  async function submit(event) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signup") {
        await signup(normalizedEmail, password);
        setMessage("Account created. You're now signed in.");
      } else {
        await login(normalizedEmail, password);
        setMessage("Welcome back.");
      }

      setPassword("");
      navigate("/");
    } catch (authError) {
      setError(getFirebaseAuthErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  }

  async function continueWithGoogle() {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await loginWithGoogle();
      setMessage("Signed in with Google.");
      navigate("/");
    } catch (authError) {
      setError(getFirebaseAuthErrorMessage(authError));
    } finally {
      setSubmitting(false);
    }
  }

  if (auth.loggedIn) {
    const memberName = auth.displayName || auth.email;

    return (
      <main className="main-content page-section routed-page">
        <SectionTitle eyebrow="Account" title={`Welcome Back, ${memberName}`} />
        <section className="account-dashboard">
          <div className="account-hero-card">
            <div className="account-avatar">{memberName.charAt(0) || "M"}</div>
            <div className="account-hero-copy">
              <p>Signed In</p>
              <h3>{memberName}</h3>
              <span>{auth.email}</span>
            </div>
            <button type="button" className="ghost-link account-logout-button" onClick={() => logout()}>
              Logout
            </button>
          </div>

          <div className="account-grid">
            <article className="account-card">
              <p>Profile</p>
              <h3>Account Status</h3>
              <span>Your Black Dream account is active and ready for checkout, tracking, and saved items.</span>
            </article>
            <article className="account-card">
              <p>Orders</p>
              <h3>No orders yet</h3>
              <span>Your upcoming purchases and shipping updates will appear here after checkout.</span>
              <Link to="/shop" className="inline-account-link">
                Start Shopping
              </Link>
            </article>
            <article className="account-card">
              <p>Saved</p>
              <h3>Wishlist & Cart</h3>
              <span>Jump back into the pieces you liked or finish checking out the items already in your cart.</span>
              <div className="account-actions">
                <Link to="/wishlist" className="inline-account-link">
                  Wishlist
                </Link>
                <Link to="/cart" className="inline-account-link">
                  Cart
                </Link>
              </div>
            </article>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main-content page-section routed-page">
      <SectionTitle eyebrow="Login" title="Access Your Account" />
      <form onSubmit={submit} className="login-card">
        <p className="auth-note">
          Create an account once, then use the same email and password to sign back in.
        </p>
        <button
          type="button"
          className="google-auth-button"
          onClick={continueWithGoogle}
          disabled={submitting || auth.loading || !firebaseReady}
        >
          Continue with Google
        </button>
        {!firebaseReady && (
          <p className="auth-note">
            Firebase Authentication is required before login, signup, or Google sign-in can work.
          </p>
        )}
        <div className="auth-mode-toggle">
          <button
            type="button"
            className={mode === "login" ? "auth-mode-button active" : "auth-mode-button"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "auth-mode-button active" : "auth-mode-button"}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>
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
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}
        <button type="submit" disabled={submitting || auth.loading || !firebaseReady}>
          {submitting ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
        </button>
        {auth.loggedIn && (
          <div className="login-state">
            <span>Logged in as {auth.email}</span>
            <button type="button" onClick={() => logout()}>
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
  const [addedProductId, setAddedProductId] = useState(null);

  function handleAddToCart(product) {
    addToCart(product);
    setAddedProductId(product.id);
    window.setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 1200);
  }

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
            <em className={`availability-pill ${product.availability}`}>
              {getAvailabilityLabel(product.availability)}
            </em>
            <div>
              <strong>{formatINR(product.price)}</strong>
              <div className="product-action-wrap">
                <button
                  disabled={product.availability !== "in_stock"}
                  onClick={() => handleAddToCart(product)}
                >
                  {product.availability === "in_stock" ? "Add to Cart" : getAvailabilityLabel(product.availability)}
                </button>
                {addedProductId === product.id && <small className="cart-plus-one">+1</small>}
              </div>
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

