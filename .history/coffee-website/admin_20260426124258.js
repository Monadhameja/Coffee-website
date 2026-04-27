if (localStorage.getItem("role") !== "admin") {
  alert("Access Denied ❌");
  window.location.href = "login.html";
}

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
      <td>${order.status}</td>
      <td>
        <button onclick="markDelivered(${index})">Deliver</button>
      </td>
    </tr>
  `;
  table.innerHTML += row;
});

document.getElementById("totalOrders").innerText = orders.length;
document.getElementById("totalRevenue").innerText = "₹" + total;
document.getElementById("pendingOrders").innerText = pending;

function markDelivered(index) {
  orders[index].status = "Delivered";
  localStorage.setItem("orders", JSON.stringify(orders));
  location.reload();
}

function showSection(section) {
  document.getElementById("orders-section").style.display = "none";
  document.getElementById("customers-section").style.display = "none";

  if (section === "orders") {
    document.getElementById("orders-section").style.display = "block";
  } else if (section === "customers") {
    document.getElementById("customers-section").style.display = "block";
    loadCustomers();
  }
}

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