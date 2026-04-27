// 🔐 Admin access check
if (localStorage.getItem("role") !== "admin") {
  alert("Access Denied ❌");
  window.location.href = "login.html";
}

// 📦 ORDERS
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let table = document.getElementById("orderTable");

let total = 0;
let pending = 0;

orders.forEach((order, index) => {
  total += order.total;
  if (order.status === "Pending") pending++;

  let row = `
  <tr>
    <td>${order.name}</td>
    <td>${order.items.join(", ")}</td>
    <td>₹${order.total}</td>
    <td>
  <select onchange="updateStatus(${index}, this.value)">
    <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
    <option ${order.status === "Preparing" ? "selected" : ""}>Preparing</option>
    <option ${order.status === "Out for Delivery" ? "selected" : ""}>Out for Delivery</option>
    <option ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
  </select>
</td>

    <td style="color:green; font-weight:bold;">
      ${order.payment || "Pending"}
    </td>

    <td>${order.transactionId || "-"}</td>

    <td>
  <span style="color:gray;">—</span>
</td>
  </tr>
`;
  table.innerHTML += row;
});

// 📊 Dashboard data
document.getElementById("totalOrders").innerText = orders.length;
document.getElementById("totalRevenue").innerText = "₹" + total;
document.getElementById("pendingOrders").innerText = pending;

// 🚚 Mark delivered
function markDelivered(index) {
  orders[index].status = "Delivered";
  localStorage.setItem("orders", JSON.stringify(orders));
  location.reload();
}

// 🔀 Section switch
function showSection(section) {
  document.getElementById("orders-section").style.display = "none";
  document.getElementById("customers-section").style.display = "none";
  document.getElementById("products-section").style.display = "none";

  if (section === "orders") {
    document.getElementById("orders-section").style.display = "block";
  } 
  else if (section === "customers") {
    document.getElementById("customers-section").style.display = "block";
    loadCustomers();
  } 
  else if (section === "products") {
    document.getElementById("products-section").style.display = "block";
    loadProducts();
  }
}

// 👥 CUSTOMERS
function loadCustomers() {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  let table = document.getElementById("customersTable");

  table.innerHTML = "";

  let customerMap = {};

  orders.forEach(order => {
    if (!customerMap[order.email]) {
      customerMap[order.email] = {
        name: order.name,
        email: order.email,
        count: 0
      };
    }
    customerMap[order.email].count++;
  });

  Object.values(customerMap).forEach(cust => {
    let row = `
      <tr>
        <td>${cust.name}</td>
        <td>${cust.email}</td>
        <td>${cust.count}</td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

// 🛍️ PRODUCTS (NOW OUTSIDE ✅)

function loadProducts() {
  let products = JSON.parse(localStorage.getItem("products")) || [];
  let table = document.getElementById("productsTable");

  table.innerHTML = "";

  products.forEach((prod, index) => {
    let row = `
      <tr>
        <td>${prod.name}</td>
        <td>${prod.category || "Coffee"}</td>
        <td>₹${prod.price}</td>
        <td><span class="status active">Active</span></td>
        <td>
          <button class="action-btn edit">✏️</button>
          <button class="action-btn delete" onclick="deleteProduct(${index})">🗑️</button>
        </td>
      </tr>
    `;
    table.innerHTML += row;
  });
}

function addProduct() {
  let name = prompt("Enter product name:");
  let price = prompt("Enter price:");
  let category = prompt("Enter category (Coffee / Dessert / Snacks):");

  if (!name || !price || !category) return;

  let products = JSON.parse(localStorage.getItem("products")) || [];

  products.push({
    name: name,
    price: price,
    category: category
  });

  localStorage.setItem("products", JSON.stringify(products));

  loadProducts();
}

function deleteProduct(index) {
  let products = JSON.parse(localStorage.getItem("products")) || [];

  products.splice(index, 1);

  localStorage.setItem("products", JSON.stringify(products));

  loadProducts();
}

function updateStatus(index, newStatus) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  orders[index].status = newStatus;

  // ✅ AUTO UPDATE PAYMENT WHEN DELIVERED
  if (newStatus === "Delivered") {
    orders[index].payment = "Paid";
  }

  localStorage.setItem("orders", JSON.stringify(orders));

  alert("Status updated to " + newStatus + " ✅");

  location.reload();
}