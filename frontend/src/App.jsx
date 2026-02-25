import { useEffect, useMemo, useState } from "react";
import {
  clearToken,
  createInventory,
  createOrder,
  createProduct,
  getOrder,
  getProducts,
  hasToken,
  login,
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

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [authenticated, setAuthenticated] = useState(hasToken());
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState("");

  const [signupForm, setSignupForm] = useState(emptySignup);
  const [loginForm, setLoginForm] = useState(emptyLogin);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [inventoryForm, setInventoryForm] = useState({ productId: "", quantity: "" });
  const [orderForm, setOrderForm] = useState({ userId: "1", productId: "", quantity: "1", price: "" });
  const [orderLookupId, setOrderLookupId] = useState("");
  const [orderResult, setOrderResult] = useState(null);

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    [products]
  );

  async function loadProducts() {
    setLoading(true);
    setMessage("");
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setMessage(`Failed to load products: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadProducts();
    }
  }, [authenticated]);

  function onProductChange(event) {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSignup(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await signup({
        name: `${signupForm.firstName.trim()} ${signupForm.lastName.trim()}`.trim(),
        email: signupForm.email,
        password: signupForm.password
      });
      setLoginForm((prev) => ({ ...prev, email: response.email }));
      setSignupForm(emptySignup);
      setAuthMode("login");
      setMessage("Account created. Login to continue.");
    } catch (error) {
      setMessage(`Signup failed: ${error.message}`);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await login(loginForm);
      storeToken(response.token);
      setAuthenticated(true);
      setCurrentUser(response.name);
      setOrderForm((prev) => ({ ...prev, userId: String(response.userId) }));
      setLoginForm(emptyLogin);
      setMessage("Login successful.");
      await loadProducts();
    } catch (error) {
      setMessage(`Login failed: ${error.message}`);
    }
  }

  function handleLogout() {
    clearToken();
    setAuthenticated(false);
    setCurrentUser("");
    setProducts([]);
    setMessage("Logged out.");
  }

  async function submitProduct(event) {
    event.preventDefault();
    setMessage("");
    try {
      await createProduct({
        ...productForm,
        price: Number(productForm.price),
        stock: Number(productForm.stock)
      });
      setProductForm(emptyProduct);
      setMessage("Product created.");
      await loadProducts();
    } catch (error) {
      setMessage(`Create product failed: ${error.message}`);
    }
  }

  async function submitInventory(event) {
    event.preventDefault();
    setMessage("");
    try {
      await createInventory(Number(inventoryForm.productId), Number(inventoryForm.quantity));
      setMessage("Inventory saved.");
      setInventoryForm({ productId: "", quantity: "" });
    } catch (error) {
      setMessage(`Inventory failed: ${error.message}`);
    }
  }

  async function submitOrder(event) {
    event.preventDefault();
    setMessage("");
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
      setMessage(`Order created with id ${response.id}.`);
    } catch (error) {
      setMessage(`Create order failed: ${error.message}`);
    }
  }

  async function lookupOrder(event) {
    event.preventDefault();
    setMessage("");
    try {
      const response = await getOrder(Number(orderLookupId));
      setOrderResult(response);
    } catch (error) {
      setMessage(`Get order failed: ${error.message}`);
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

            {message && <div className="message">{message}</div>}

            {authMode === "signup" ? (
              <form onSubmit={handleSignup}>
                <h2>Create your account</h2>
                <input
                  placeholder="First Name"
                  value={signupForm.firstName}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
                <input
                  placeholder="Last Name"
                  value={signupForm.lastName}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
                <input
                  placeholder="Email"
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                <input
                  placeholder="Password"
                  type="password"
                  minLength={6}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button type="submit">Create Account</button>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <h2>Welcome back</h2>
                <input
                  placeholder="Email"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <button type="submit">Login</button>
              </form>
            )}
          </section>
        </main>
      </div>
    );
  }

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
            <p className="eyebrow">OPERATIONAL DASHBOARD</p>
            <h1>E-Commerce Command Center</h1>
          </div>
          <div className="user-panel">
            <span>{currentUser ? `Signed in as ${currentUser}` : "Authenticated"}</span>
            <button onClick={handleLogout} className="secondary">Logout</button>
          </div>
        </header>

        {message && <div className="message reveal">{message}</div>}

        <section className="summary-grid reveal">
          <article className="summary-card">
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </article>
          <article className="summary-card">
            <span>Total Stock</span>
            <strong>{totalStock}</strong>
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
            <input
              placeholder="Product ID"
              type="number"
              value={inventoryForm.productId}
              onChange={(e) => setInventoryForm((prev) => ({ ...prev, productId: e.target.value }))}
              required
            />
            <input
              placeholder="Quantity"
              type="number"
              value={inventoryForm.quantity}
              onChange={(e) => setInventoryForm((prev) => ({ ...prev, quantity: e.target.value }))}
              required
            />
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
            <input
              placeholder="Order ID"
              type="number"
              value={orderLookupId}
              onChange={(e) => setOrderLookupId(e.target.value)}
              required
            />
            <button type="submit">Fetch Order</button>
            {orderResult && <pre>{JSON.stringify(orderResult, null, 2)}</pre>}
          </form>
        </section>

        <section className="card products reveal">
          <div className="row">
            <h2>Products</h2>
            <button onClick={loadProducts} disabled={loading}>
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
      </main>
    </div>
  );
}
