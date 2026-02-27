import { useEffect, useMemo, useState } from "react";
import {
  approveOrder,
  clearToken,
  createInventory,
  createOrder,
  createProduct,
  getAllOrders,
  getOrder,
  getOrdersByUserId,
  getProductById,
  getProducts,
  hasToken,
  login,
  rejectOrder,
  signup,
  storeToken
} from "./api";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: ""
};

const emptySignup = {
  firstName: "",
  lastName: "",
  email: "",
  password: ""
};

const emptyLogin = {
  email: "",
  password: ""
};

const ADMIN_EMAILS = new Set(["admin@ecommerce.com"]);
const USER_EMAIL_KEY = "ecommerce_user_email";
const USER_ID_KEY = "ecommerce_user_id";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function cartStorageKey(userId) {
  return `ecommerce_cart_${userId || "guest"}`;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "info", text: "" });
  const [authenticated, setAuthenticated] = useState(hasToken());
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState("");
  const [currentEmail, setCurrentEmail] = useState(localStorage.getItem(USER_EMAIL_KEY) || "");
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem(USER_ID_KEY) || "");
  const [viewMode, setViewMode] = useState("shop");

  const [signupForm, setSignupForm] = useState(emptySignup);
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [inventoryForm, setInventoryForm] = useState({ productId: "", quantity: "" });
  const [orderForm, setOrderForm] = useState({ userId: "1", productId: "", quantity: "1", price: "" });
  const [orderLookupId, setOrderLookupId] = useState("");
  const [orderResult, setOrderResult] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQty, setSelectedQty] = useState("1");
  const [cartItems, setCartItems] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [adminOrders, setAdminOrders] = useState([]);

  const isAdmin = useMemo(
    () => ADMIN_EMAILS.has((currentEmail || "").trim().toLowerCase()),
    [currentEmail]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [cartItems]
  );

  function notify(text, type = "info") {
    setFeedback({ text, type });
  }

  async function loadProducts(showSpinner = true) {
    if (showSpinner) setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      notify(`Failed to load products: ${error.message}`, "error");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function loadOrderHistory(userId) {
    if (!userId) return;
    try {
      const orders = await getOrdersByUserId(Number(userId));
      setOrderHistory(orders);
    } catch (error) {
      notify(`Unable to load order history: ${error.message}`, "error");
    }
  }

  async function loadAdminOrders() {
    if (!isAdmin) return;
    try {
      const orders = await getAllOrders();
      setAdminOrders(orders);
    } catch (error) {
      notify(`Unable to load admin orders: ${error.message}`, "error");
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadProducts();
      loadOrderHistory(currentUserId);
      if (isAdmin) {
        loadAdminOrders();
      }
      const savedCart = localStorage.getItem(cartStorageKey(currentUserId));
      setCartItems(savedCart ? JSON.parse(savedCart) : []);
    }
  }, [authenticated, currentUserId, isAdmin]);

  useEffect(() => {
    if (!authenticated) return;
    localStorage.setItem(cartStorageKey(currentUserId), JSON.stringify(cartItems));
  }, [cartItems, authenticated, currentUserId]);

  function onProductChange(event) {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSignup(event) {
    event.preventDefault();
    notify("");
    try {
      const response = await signup({
        name: `${signupForm.firstName.trim()} ${signupForm.lastName.trim()}`.trim(),
        email: signupForm.email,
        password: signupForm.password
      });
      setLoginForm((prev) => ({ ...prev, email: response.email }));
      setSignupForm(emptySignup);
      setAuthMode("login");
      notify("Account created. Login to continue.", "success");
    } catch (error) {
      notify(`Signup failed: ${error.message}`, "error");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    notify("");
    try {
      const response = await login(loginForm);
      storeToken(response.token);
      const jwtPayload = decodeJwt(response.token);
      const userId = String(response.userId || jwtPayload?.sub || "");
      setAuthenticated(true);
      setCurrentUser(response.name);
      setCurrentEmail(response.email);
      setCurrentUserId(userId);
      localStorage.setItem(USER_EMAIL_KEY, response.email);
      localStorage.setItem(USER_ID_KEY, userId);
      setOrderForm((prev) => ({ ...prev, userId }));
      setLoginForm(emptyLogin);
      const adminEmail = (response.email || "").trim().toLowerCase();
      setViewMode(ADMIN_EMAILS.has(adminEmail) ? "admin" : "shop");
      notify("Login successful.", "success");
      await loadProducts();
      await loadOrderHistory(userId);
    } catch (error) {
      notify(`Login failed: ${error.message}`, "error");
    }
  }

  function handleLogout() {
    clearToken();
    setAuthenticated(false);
    setCurrentUser("");
    setCurrentEmail("");
    setCurrentUserId("");
    setProducts([]);
    setCartItems([]);
    setSelectedProduct(null);
    setOrderHistory([]);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_ID_KEY);
    notify("Logged out.", "success");
  }

  async function submitProduct(event) {
    event.preventDefault();
    notify("");
    try {
      const createdProduct = await createProduct({
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock)
      });
      await createInventory(Number(createdProduct.id), Number(productForm.stock));
      setProductForm(emptyProduct);
      notify("Product and inventory created.", "success");
      await loadProducts(false);
    } catch (error) {
      notify(`Create product failed: ${error.message}`, "error");
    }
  }

  async function submitInventory(event) {
    event.preventDefault();
    notify("");
    try {
      await createInventory(Number(inventoryForm.productId), Number(inventoryForm.quantity));
      notify("Inventory saved.", "success");
      setInventoryForm({ productId: "", quantity: "" });
      await loadProducts(false);
    } catch (error) {
      notify(`Inventory failed: ${error.message}`, "error");
    }
  }

  async function submitOrder(event) {
    event.preventDefault();
    notify("");
    try {
      const response = await createOrder({
        userId: Number(orderForm.userId),
        orderItems: [
          {
            productId: Number(orderForm.productId),
            quantity: Number(orderForm.quantity),
            price: Number(orderForm.price)
          }
        ]
      });
      setOrderResult(response);
      notify(`Order created with id ${response.id} and is awaiting admin approval.`, "success");
      await loadAdminOrders();
    } catch (error) {
      notify(`Create order failed: ${error.message}`, "error");
    }
  }

  async function lookupOrder(event) {
    event.preventDefault();
    notify("");
    try {
      const response = await getOrder(Number(orderLookupId));
      setOrderResult(response);
    } catch (error) {
      notify(`Get order failed: ${error.message}`, "error");
    }
  }

  async function showProductDetails(productId) {
    try {
      const detail = await getProductById(productId);
      setSelectedProduct(detail);
      setSelectedQty("1");
    } catch (error) {
      notify(`Unable to load product details: ${error.message}`, "error");
    }
  }

  function addToCart(product, qtyValue) {
    const qty = Number(qtyValue);
    if (!qty || qty < 1) {
      notify("Quantity must be at least 1.", "error");
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          quantity: qty,
          price: Number(product.price)
        }
      ];
    });
    notify(`${product.name} added to cart.`, "success");
  }

  function updateCartQuantity(productId, qtyValue) {
    const qty = Number(qtyValue);
    if (!qty || qty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item
      )
    );
  }

  function removeFromCart(productId) {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  async function checkoutCart() {
    notify("");
    if (!cartItems.length) {
      notify("Your cart is empty.", "error");
      return;
    }
    try {
      const payload = {
        userId: Number(currentUserId),
        orderItems: cartItems.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      };
      const response = await createOrder(payload);
      notify(`Order placed. Order ID: ${response.id}. Waiting for admin approval.`, "success");
      setCartItems([]);
      await loadProducts(false);
      await loadOrderHistory(currentUserId);
      await loadAdminOrders();
    } catch (error) {
      notify(`Checkout failed: ${error.message}`, "error");
    }
  }

  async function approvePendingOrder(orderId) {
    notify("");
    try {
      await approveOrder(orderId);
      notify(`Order ${orderId} approved. Inventory/payment flow started.`, "success");
      await loadAdminOrders();
      await loadProducts(false);
    } catch (error) {
      notify(`Approve order failed: ${error.message}`, "error");
    }
  }

  async function rejectPendingOrder(orderId) {
    notify("");
    try {
      await rejectOrder(orderId);
      notify(`Order ${orderId} rejected.`, "success");
      await loadAdminOrders();
    } catch (error) {
      notify(`Reject order failed: ${error.message}`, "error");
    }
  }

  if (!authenticated) {
    return (
      <div className="app-shell">
        <div className="bg-orb orb-one" />
        <div className="bg-orb orb-two" />
        <div className="bg-grid" />
        <div className="bg-3d-scene" aria-hidden="true">
          <span className="cube cube-a" />
          <span className="cube cube-b" />
          <span className="cube cube-c" />
        </div>
        <main className="auth-only-layout">
          <section className="auth-panel reveal">
            <div className="auth-switch">
              <button
                type="button"
                className={authMode === "signup" ? "auth-tab active-tab" : "auth-tab"}
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </button>
              <button
                type="button"
                className={authMode === "login" ? "auth-tab active-tab" : "auth-tab"}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
            </div>
            {feedback.text && <div className={`message ${feedback.type === "error" ? "message-error" : ""}`}>{feedback.text}</div>}
            {authMode === "signup" ? (
              <form onSubmit={handleSignup}>
                <h2>Create your account</h2>
                <input placeholder="First Name" value={signupForm.firstName} onChange={(e) => setSignupForm((prev) => ({ ...prev, firstName: e.target.value }))} required />
                <input placeholder="Last Name" value={signupForm.lastName} onChange={(e) => setSignupForm((prev) => ({ ...prev, lastName: e.target.value }))} required />
                <input placeholder="Email" type="email" value={signupForm.email} onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))} required />
                <input placeholder="Password" type="password" minLength={6} value={signupForm.password} onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))} required />
                <button type="submit">Create Account</button>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <h2>Welcome back</h2>
                <input placeholder="Email" type="email" value={loginForm.email} onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))} required />
                <input placeholder="Password" type="password" value={loginForm.password} onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))} required />
                <button type="submit">Login</button>
              </form>
            )}
          </section>
        </main>
      </div>
    );
  }

  useEffect(() => {
    if (!authenticated) return;
    setViewMode(isAdmin ? "admin" : "shop");
  }, [authenticated, isAdmin]);

  const showAdminConsole = isAdmin && viewMode === "admin";

  return (
    <div className="app-shell dashboard-shell">
      <div className="bg-3d-scene" aria-hidden="true">
        <span className="cube cube-a" />
        <span className="cube cube-b" />
        <span className="cube cube-c" />
      </div>
      <main className="dashboard-layout">
        <header className="dashboard-header reveal">
          <div>
            <p className="eyebrow">{showAdminConsole ? "ADMIN CONSOLE" : "SHOPPING PORTAL"}</p>
            <h1>{showAdminConsole ? "E-Commerce Command Center" : "Discover & Buy"}</h1>
          </div>
          <div className="user-panel">
            <span>{currentUser ? `Signed in as ${currentUser}` : "Authenticated"}</span>
            {isAdmin && (
              <button className="secondary" onClick={() => setViewMode((prev) => (prev === "admin" ? "shop" : "admin"))}>
                {showAdminConsole ? "Switch to Storefront" : "Switch to Admin"}
              </button>
            )}
            <button onClick={handleLogout} className="secondary">Logout</button>
          </div>
        </header>

        {feedback.text && <div className={`message reveal ${feedback.type === "error" ? "message-error" : ""}`}>{feedback.text}</div>}

        {showAdminConsole ? (
          <>
            <section className="summary-grid reveal">
              <article className="summary-card">
                <span>Total Products</span>
                <strong>{products.length}</strong>
              </article>
              <article className="summary-card">
                <span>Total Stock</span>
                <strong>{products.reduce((sum, product) => sum + Number(product.stock || 0), 0)}</strong>
              </article>
              <article className="summary-card">
                <span>Orders Lookup</span>
                <strong>Live</strong>
              </article>
            </section>

            <section className="ops-grid">
              <form className="card reveal" onSubmit={submitProduct}>
                <h2>Create Product</h2>
                <input name="name" placeholder="Name" value={productForm.name} onChange={onProductChange} required />
                <input name="description" placeholder="Description" value={productForm.description} onChange={onProductChange} required />
                <input name="category" placeholder="Category" value={productForm.category} onChange={onProductChange} required />
                <input name="price" placeholder="Price" type="number" step="0.01" value={productForm.price} onChange={onProductChange} required />
                <input name="stock" placeholder="Stock" type="number" value={productForm.stock} onChange={onProductChange} required />
                <button type="submit">Create</button>
              </form>

              <form className="card reveal" onSubmit={submitInventory}>
                <h2>Create Inventory</h2>
                <input placeholder="Product ID" type="number" value={inventoryForm.productId} onChange={(e) => setInventoryForm((prev) => ({ ...prev, productId: e.target.value }))} required />
                <input placeholder="Quantity" type="number" value={inventoryForm.quantity} onChange={(e) => setInventoryForm((prev) => ({ ...prev, quantity: e.target.value }))} required />
                <button type="submit">Save Inventory</button>
              </form>

              <form className="card reveal" onSubmit={submitOrder}>
                <h2>Create Order</h2>
                <input placeholder="User ID" type="number" value={orderForm.userId} onChange={(e) => setOrderForm((prev) => ({ ...prev, userId: e.target.value }))} required />
                <input placeholder="Product ID" type="number" value={orderForm.productId} onChange={(e) => setOrderForm((prev) => ({ ...prev, productId: e.target.value }))} required />
                <input placeholder="Quantity" type="number" value={orderForm.quantity} onChange={(e) => setOrderForm((prev) => ({ ...prev, quantity: e.target.value }))} required />
                <input placeholder="Price" type="number" step="0.01" value={orderForm.price} onChange={(e) => setOrderForm((prev) => ({ ...prev, price: e.target.value }))} required />
                <button type="submit">Create Order</button>
              </form>

              <form className="card reveal" onSubmit={lookupOrder}>
                <h2>Check Order</h2>
                <input placeholder="Order ID" type="number" value={orderLookupId} onChange={(e) => setOrderLookupId(e.target.value)} required />
                <button type="submit">Fetch Order</button>
                {orderResult && <pre>{JSON.stringify(orderResult, null, 2)}</pre>}
              </form>
            </section>

            <section className="card products reveal">
              <div className="row">
                <h2>Pending User Orders</h2>
                <button onClick={() => loadAdminOrders()} disabled={loading}>Refresh</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOrders
                    .filter((order) => order.status === "AWAITING_APPROVAL")
                    .map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.userId}</td>
                        <td>{order.status}</td>
                        <td>${order.totalAmount}</td>
                        <td>
                          <button
                            type="button"
                            className="mini-btn"
                            onClick={() => approvePendingOrder(order.id)}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="mini-btn secondary"
                            onClick={() => rejectPendingOrder(order.id)}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  {!adminOrders.filter((order) => order.status === "AWAITING_APPROVAL").length && (
                    <tr>
                      <td colSpan="5">No orders awaiting approval.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <>
            <section className="summary-grid reveal">
              <article className="summary-card">
                <span>Products Available</span>
                <strong>{products.length}</strong>
              </article>
              <article className="summary-card">
                <span>Cart Items</span>
                <strong>{cartItems.reduce((sum, item) => sum + Number(item.quantity), 0)}</strong>
              </article>
              <article className="summary-card">
                <span>Cart Total</span>
                <strong>${cartTotal.toFixed(2)}</strong>
              </article>
            </section>

            <section className="ops-grid">
              <section className="card reveal">
                <div className="row">
                  <h2>Products</h2>
                  <button onClick={() => loadProducts()} disabled={loading}>
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>${product.price}</td>
                        <td>
                          <button type="button" className="mini-btn" onClick={() => showProductDetails(product.id)}>Details</button>
                          <button type="button" className="mini-btn" onClick={() => addToCart(product, 1)}>Add</button>
                        </td>
                      </tr>
                    ))}
                    {!products.length && (
                      <tr>
                        <td colSpan="5">No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section className="card reveal">
                <h2>Product Details</h2>
                {!selectedProduct && <p className="muted">Select a product to see details.</p>}
                {selectedProduct && (
                  <div>
                    <p><strong>{selectedProduct.name}</strong></p>
                    <p className="muted">{selectedProduct.description}</p>
                    <p>Category: {selectedProduct.category}</p>
                    <p>Price: ${selectedProduct.price}</p>
                    <div className="inline-controls">
                      <input type="number" min="1" value={selectedQty} onChange={(e) => setSelectedQty(e.target.value)} />
                      <button type="button" onClick={() => addToCart(selectedProduct, selectedQty)}>Add to Cart</button>
                    </div>
                  </div>
                )}
              </section>
            </section>

            <section className="ops-grid">
              <section className="card reveal">
                <div className="row">
                  <h2>Cart</h2>
                  <button type="button" className="secondary" onClick={() => setCartItems([])}>Clear</button>
                </div>
                {!cartItems.length && <p className="muted">Your cart is empty.</p>}
                {cartItems.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.productId}>
                          <td>{item.name}</td>
                          <td>${item.price}</td>
                          <td>
                            <input
                              className="qty-input"
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.productId, e.target.value)}
                            />
                          </td>
                          <td>${(Number(item.price) * Number(item.quantity)).toFixed(2)}</td>
                          <td>
                            <button type="button" className="mini-btn" onClick={() => removeFromCart(item.productId)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="checkout-bar">
                  <strong>Total: ${cartTotal.toFixed(2)}</strong>
                  <button type="button" onClick={checkoutCart}>Checkout</button>
                </div>
              </section>

              <section className="card reveal">
                <h2>Order History</h2>
                {!orderHistory.length && <p className="muted">No orders yet.</p>}
                {orderHistory.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.status}</td>
                          <td>${order.totalAmount}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </section>
          </>
        )}

        {showAdminConsole && (
          <section className="card products reveal">
            <div className="row">
              <h2>Products</h2>
              <button onClick={() => loadProducts()} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.price}</td>
                    <td>{product.stock}</td>
                  </tr>
                ))}
                {!products.length && (
                  <tr>
                    <td colSpan="5">No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
