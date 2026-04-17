function initData() {
  if (!localStorage.getItem("products")) {
    const products = [
      { id: "P001", name: "Running Shoes", price: 2200, quantity: 20, threshold: 5 },
      { id: "P002", name: "Sports T-Shirt", price: 850, quantity: 8, threshold: 5 },
      { id: "P003", name: "Training Shorts", price: 990, quantity: 0, threshold: 3 }
    ];
    localStorage.setItem("products", JSON.stringify(products));
  }

  if (!localStorage.getItem("orders")) {
    const orders = [
      {
        orderId: "O001",
        customerId: "C001",
        productId: "P001",
        quantity: 1,
        status: "Shipped",
        trackingId: "TRK001",
        shippingStatus: "In Transit",
        deliveryStatus: "On the Way"
      },
      {
        orderId: "O002",
        customerId: "C001",
        productId: "P002",
        quantity: 2,
        status: "Processed",
        trackingId: "",
        shippingStatus: "",
        deliveryStatus: "Pending Shipment"
      }
    ];
    localStorage.setItem("orders", JSON.stringify(orders));
  }

  if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
  }
}

/* ---------- helpers ---------- */
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function getOrders() {
  return JSON.parse(localStorage.getItem("orders")) || [];
}

function saveOrders(orders) {
  localStorage.setItem("orders", JSON.stringify(orders));
}

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function showSuccess(elementId, text) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = "message success";
  el.innerHTML = text;
}

function showError(elementId, text) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = "message error";
  el.innerHTML = text;
}

function showNeutral(elementId, text) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = "message";
  el.innerHTML = text;
}

/* ---------- staff page ---------- */
function loadProducts() {
  const table = document.getElementById("productTable");
  if (!table) return;

  const products = getProducts();
  table.innerHTML = "";

  products.forEach(product => {
    table.innerHTML += `
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.price}</td>
        <td>${product.quantity}</td>
        <td>${product.threshold}</td>
      </tr>
    `;
  });
}

function updateStock() {
  const productId = document.getElementById("productId").value.trim();
  const productName = document.getElementById("productName").value.trim();
  const adjustQty = parseInt(document.getElementById("adjustQty").value);
  const supplierId = document.getElementById("supplierId").value.trim();
  const deliveredQty = parseInt(document.getElementById("deliveredQty").value);
  const deliveryDate = document.getElementById("deliveryDate").value;

  let products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!productId || !productName || !supplierId || !deliveryDate) {
    showError("staffMessage", "Error: Please complete all required fields.");
    return;
  }

  if (isNaN(adjustQty) || isNaN(deliveredQty)) {
    showError("staffMessage", "Error: Quantity fields must contain valid numbers.");
    return;
  }

  if (!product) {
    showError("staffMessage", "Error: Item Not Found. Invalid Product ID.");
    return;
  }

  if (product.name.toLowerCase() !== productName.toLowerCase()) {
    showError("staffMessage", "Error: Product name does not match the selected Product ID.");
    return;
  }

  if (adjustQty !== deliveredQty) {
    showError("staffMessage", "Error: Supplier Data Mismatch. The update has been halted.");
    return;
  }

  product.quantity += adjustQty;
  saveProducts(products);
  loadProducts();

  if (product.quantity < product.threshold) {
    showSuccess(
      "staffMessage",
      `Success: Stock updated for ${product.name}. New quantity = ${product.quantity}. Low Stock Alert sent to Staff.`
    );
  } else {
    showSuccess(
      "staffMessage",
      `Success: Stock updated for ${product.name}. New quantity = ${product.quantity}.`
    );
  }
}

function resetStaffForm() {
  const fields = ["productId", "productName", "adjustQty", "supplierId", "deliveredQty", "deliveryDate"];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  showNeutral("staffMessage", "Please enter product and supplier details.");
}

/* ---------- customer page ---------- */
function loadCatalog() {
  const catalog = document.getElementById("catalog");
  if (!catalog) return;

  const products = getProducts();
  catalog.innerHTML = "";

  products.forEach(product => {
    let stockText = "";
    let stockClass = "";

    if (product.quantity === 0) {
      stockText = "Out of Stock";
      stockClass = "stock-out";
    } else if (product.quantity <= product.threshold) {
      stockText = `Low Stock (${product.quantity} left)`;
      stockClass = "stock-low";
    } else {
      stockText = `In Stock (${product.quantity} available)`;
      stockClass = "stock-ok";
    }

    catalog.innerHTML += `
      <div class="product-card">
        <h3>${product.name}</h3>
        <p><strong>Product ID:</strong> ${product.id}</p>
        <p><strong>Price:</strong> ${product.price} THB</p>
        <p class="${stockClass}">${stockText}</p>
        <label for="qty-${product.id}">Quantity</label>
        <input type="number" id="qty-${product.id}" min="1" value="1" />
        <button class="btn" onclick="addToCart('${product.id}')">Add to Cart</button>
      </div>
    `;
  });
}

function addToCart(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    showError("customerMessage", "Error: Product not found.");
    return;
  }

  const qtyInput = document.getElementById(`qty-${productId}`);
  const qty = parseInt(qtyInput.value);

  if (isNaN(qty) || qty <= 0) {
    showError("customerMessage", "Error: Please enter a valid quantity.");
    return;
  }

  if (product.quantity === 0) {
    showError("customerMessage", "Product Out of Stock. You cannot proceed with this item.");
    return;
  }

  if (qty > product.quantity) {
    showError("customerMessage", "Requested quantity exceeds available stock.");
    return;
  }

  let cart = getCart();
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    if (existingItem.qty + qty > product.quantity) {
      showError("customerMessage", "Cannot add more than the available stock to the cart.");
      return;
    }
    existingItem.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      qty: qty
    });
  }

  saveCart(cart);
  loadCart();
  showSuccess("customerMessage", `${product.name} has been added to the cart.`);
}

function loadCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartItems || !cartTotal) return;

  const cart = getCart();

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-text">No items in cart.</p>`;
    cartTotal.textContent = "0";
    return;
  }

  let total = 0;
  cartItems.innerHTML = "";

  cart.forEach(item => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;

    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name} × ${item.qty}</span>
        <span>${lineTotal} THB</span>
      </div>
    `;
  });

  cartTotal.textContent = total;
}

function clearCart() {
  saveCart([]);
  loadCart();
  showNeutral("customerMessage", "Cart cleared.");
}

function placeOrder() {
  const cart = getCart();
  const customerId = document.getElementById("customerId").value.trim();
  const deliveryAddress = document.getElementById("deliveryAddress").value.trim();
  const discountCode = document.getElementById("discountCode").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (cart.length === 0) {
    showError("customerMessage", "Your cart is empty.");
    return;
  }

  if (!customerId || !deliveryAddress) {
    showError("customerMessage", "Please enter Customer ID and delivery address.");
    return;
  }

  let products = getProducts();

  for (let item of cart) {
    const product = products.find(p => p.id === item.id);
    if (!product || product.quantity < item.qty) {
      showError("customerMessage", "Order Rejected due to stock discrepancy.");
      return;
    }
  }

  if (paymentMethod === "fail") {
    showError("customerMessage", "Payment Failure. Please try another payment method.");
    return;
  }

  let total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (discountCode === "SAVE10") {
    total = total * 0.9;
  }

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    product.quantity -= item.qty;
  });

  saveProducts(products);

  let orders = getOrders();
  const newOrderId = "O" + String(orders.length + 1).padStart(3, "0");

  orders.push({
    orderId: newOrderId,
    customerId: customerId,
    productId: cart[0].id,
    quantity: cart[0].qty,
    status: "Processed",
    trackingId: "",
    shippingStatus: "",
    deliveryStatus: "Pending Shipment"
  });

  saveOrders(orders);
  saveCart([]);

  loadCart();
  loadCatalog();

  showSuccess(
    "customerMessage",
    `Purchase successful. Order ID: ${newOrderId}. Total paid: ${total.toFixed(2)} THB.`
  );

  document.getElementById("deliveryAddress").value = "";
  document.getElementById("discountCode").value = "";
  document.getElementById("paymentMethod").value = "success";
}

/* ---------- track page ---------- */
function trackOrder() {
  const customerId = document.getElementById("trackCustomerId").value.trim();
  const orderId = document.getElementById("trackOrderId").value.trim();

  if (!customerId || !orderId) {
    showError("trackMessage", "Please enter both Customer ID and Order ID.");
    return;
  }

  const orders = getOrders();
  const order = orders.find(o => o.orderId === orderId && o.customerId === customerId);

  if (!order) {
    showError("trackMessage", "Order ID Not Found. No record was found.");
    return;
  }

  if (!order.trackingId) {
    showSuccess(
      "trackMessage",
      `
      <strong>Order Found</strong><br>
      Order ID: ${order.orderId}<br>
      Product ID: ${order.productId}<br>
      Quantity: ${order.quantity}<br>
      Current Status: ${order.status}<br>
      Shipping Status: Pending Shipment
      `
    );
    return;
  }

  showSuccess(
    "trackMessage",
    `
    <strong>Order Found</strong><br>
    Order ID: ${order.orderId}<br>
    Product ID: ${order.productId}<br>
    Quantity: ${order.quantity}<br>
    Current Status: ${order.status}<br>
    Tracking ID: ${order.trackingId}<br>
    Shipping Status: ${order.shippingStatus}<br>
    Delivery Status: ${order.deliveryStatus}
    `
  );
}

function resetTrackForm() {
  const customerField = document.getElementById("trackCustomerId");
  const orderField = document.getElementById("trackOrderId");

  if (customerField) customerField.value = "";
  if (orderField) orderField.value = "";

  showNeutral("trackMessage", "Enter an Order ID to view the order status.");
}