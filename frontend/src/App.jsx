import { useEffect, useState } from "react";
import {
  createInventory,
  createOrder,
  createProduct,
  getOrder,
  getProducts
} from "./api";

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: ""
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [productForm, setProductForm] = useState(emptyProduct);
  const [inventoryForm, setInventoryForm] = useState({ productId: "", quantity: "" });
  const [orderForm, setOrderForm] = useState({ userId: "1", productId: "", quantity: "1", price: "" });
  const [orderLookupId, setOrderLookupId] = useState("");
  const [orderResult, setOrderResult] = useState(null);

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
    loadProducts();
  }, []);

  function onProductChange(event) {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
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
      setMessage("Inventory created/updated.");
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

  return (
    <div className="page">
      <header>
        <h1>E-Commerce Dashboard</h1>
        <p>React frontend for your microservices gateway.</p>
      </header>

      {message && <div className="message">{message}</div>}

      <section className="grid">
        <form className="card" onSubmit={submitProduct}>
          <h2>Create Product</h2>
          <input name="name" placeholder="Name" value={productForm.name} onChange={onProductChange} required />
          <input name="description" placeholder="Description" value={productForm.description} onChange={onProductChange} required />
          <input name="category" placeholder="Category" value={productForm.category} onChange={onProductChange} required />
          <input name="price" placeholder="Price" type="number" step="0.01" value={productForm.price} onChange={onProductChange} required />
          <input name="stock" placeholder="Stock" type="number" value={productForm.stock} onChange={onProductChange} required />
          <button type="submit">Create</button>
        </form>

        <form className="card" onSubmit={submitInventory}>
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

        <form className="card" onSubmit={submitOrder}>
          <h2>Create Order</h2>
          <input placeholder="User ID" type="number" value={orderForm.userId} onChange={(e) => setOrderForm((p) => ({ ...p, userId: e.target.value }))} required />
          <input placeholder="Product ID" type="number" value={orderForm.productId} onChange={(e) => setOrderForm((p) => ({ ...p, productId: e.target.value }))} required />
          <input placeholder="Quantity" type="number" value={orderForm.quantity} onChange={(e) => setOrderForm((p) => ({ ...p, quantity: e.target.value }))} required />
          <input placeholder="Price" type="number" step="0.01" value={orderForm.price} onChange={(e) => setOrderForm((p) => ({ ...p, price: e.target.value }))} required />
          <button type="submit">Create Order</button>
        </form>

        <form className="card" onSubmit={lookupOrder}>
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

      <section className="card products">
        <div className="row">
          <h2>Products</h2>
          <button onClick={loadProducts} disabled={loading}>{loading ? "Loading..." : "Refresh"}</button>
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
    </div>
  );
}