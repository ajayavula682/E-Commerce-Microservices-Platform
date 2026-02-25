const API_BASE = "/api";
const TOKEN_KEY = "ecommerce_jwt";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function withAuthHeaders(headers = {}) {
  const token = getToken();
  if (!token) {
    return headers;
  }
  return { ...headers, Authorization: `Bearer ${token}` };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: withAuthHeaders({
      "Content-Type": "application/json",
      ...(options.headers || {})
    }),
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken() {
  return Boolean(getToken());
}

export function signup(payload) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getProducts() {
  return request("/products");
}

export function createProduct(payload) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createInventory(productId, quantity) {
  return request(`/inventory?productId=${productId}&quantity=${quantity}`, {
    method: "POST"
  });
}

export function createOrder(payload) {
  return request("/orders", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getOrder(orderId) {
  return request(`/orders/${orderId}`);
}
