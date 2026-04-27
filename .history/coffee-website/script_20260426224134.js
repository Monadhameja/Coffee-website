if (!localStorage.getItem("role")) {
  window.location.href = "login.html";
}
let lastOrder = null;
let orderTime = null;
let lastOrderEmail = null;
// ================= DARK MODE TOGGLE =================
const toggleBtn = document.getElementById("theme-toggle");
const body = document.body;

if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
  toggleBtn.textContent = "☀️";
}

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  const isDark = body.classList.contains("dark");
  toggleBtn.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ================= NAVBAR SCROLL EFFECT =================
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// ================= MENU DATA =================
const menuItems = [
  { name: "Espresso", price: 120, img: "images/espresso.jpg", category: "hot" },
  { name: "Cappuccino", price: 150, img: "images/cappuccino.jpg", category: "hot" },
  { name: "Latte", price: 160, img: "images/latte.jpg", category: "hot" },
  { name: "Mocha", price: 180, img: "images/mocha.jpg", category: "hot" },

  { name: "Croissant", price: 100, img: "images/croissant.jpg", category: "dessert" },
  { name: "Muffin", price: 90, img: "images/muffin.jpg", category: "dessert" },
  { name: "Donut", price: 80, img: "images/donut.jpg", category: "dessert" },
  { name: "Sandwich", price: 130, img: "images/sandwich.jpg", category: "dessert" },

  { name: "Bagel", price: 110, img: "images/bagel.jpg", category: "dessert" },
  { name: "Chocolate Cake", price: 200, img: "images/chocolatecake.jpg", category: "dessert" },
  { name: "Brownie", price: 120, img: "images/brownie.jpg", category: "dessert" },
  { name: "Cookies", price: 70, img: "images/cookies.jpg", category: "dessert" },
  { name: "Cheese Toast", price: 90, img: "images/cheesetoast.jpg", category: "dessert" }
];

// ================= DYNAMIC MENU DISPLAY =================
const menuList = document.getElementById("menu-list");
function renderMenu(items) {
  menuList.innerHTML = "";

  if (items.length === 0) {
    menuList.innerHTML = `<p>No items found 😢</p>`;
    return;
  }

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.classList.add("menu-item");
    div.style.animationDelay = `${index * 0.1}s`;

    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h3>${item.name}</h3>
      <p>₹${item.price}</p>
      <button class="order-btn" onclick="addToCart('${item.name}', ${item.price})">
        Add to Cart
      </button>
    `;

    menuList.appendChild(div);
  });
}

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

function filterMenu() {
  const searchValue = searchInput.value.toLowerCase();
  const filterValue = filterSelect.value;

  const filtered = menuItems.filter(item => {
    return (
      item.name.toLowerCase().includes(searchValue) &&
      (filterValue === "all" || item.category === filterValue)
    );
  });

  renderMenu(filtered);
}

searchInput.addEventListener("input", filterMenu);
filterSelect.addEventListener("change", filterMenu);

// ================= CART SYSTEM =================
let cart = [];
const cartModal = document.getElementById("cart-modal");
const cartBtn = document.getElementById("cart-btn");
const closeCart = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const total = document.getElementById("total");

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  updateCart();   // update UI
  saveCart();     // save data

  showToast("✅ " + name + " added to cart");
}

cartBtn.addEventListener("click", () => {
  updateCart(); 
  cartModal.classList.remove("hidden");
});

closeCart.addEventListener("click", () => {
  cartModal.classList.add("hidden");
});

function updateCart() {
  cartItems.innerHTML = "";
  let totalAmount = 0;

  cart.forEach(item => {
    totalAmount += item.price * item.quantity;

    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <span>${item.name}</span>
      <div>
        <button onclick="changeQty('${item.name}', -1)">➖</button>
        ${item.quantity}
        <button onclick="changeQty('${item.name}', 1)">➕</button>
      </div>
    `;

    cartItems.appendChild(div);
  });
  
  total.textContent = `Total: ₹${totalAmount}`;
}

function changeQty(name, change) {
  const item = cart.find(i => i.name === name);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(i => i.name !== name);
  }

  updateCart();
  saveCart();
}


function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem("cart");
  if (saved) {
    cart = JSON.parse(saved);
    updateCart();
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}



function cancelOrder() {
  console.log("❌ Cancel clicked");

  if (!lastOrder) {
    showToast("❌ No order to cancel");
    return;
  }

  const now = new Date();
  const diff = (now - orderTime) / 1000;

  if (diff > 120) {
    showToast("⏳ Cancellation time expired!");
    return;
  }

  // restore cart
  cart = [...lastOrder];

  // save email before clearing
  const emailToSend = lastOrderEmail;

  lastOrder = null;

  updateCart();
  saveCart();

  // send cancel email
  fetch("http://localhost:5001/cancel-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: emailToSend
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Cancel email response:", data);
  })
  .catch(err => {
    console.log("Cancel email error:", err);
  });

  // close modal
  document.getElementById("checkout-modal").classList.add("hidden");

  showToast("❌ Order cancelled & email sent");
}
function startOrderTracking() {
  const steps = document.querySelectorAll(".status-step");
  const progress = document.getElementById("progress");

  let currentStep = 0;

  function updateStep() {
    if (currentStep > 0) {
      steps[currentStep - 1].classList.remove("active");
    }

    if (currentStep < steps.length) {
      steps[currentStep].classList.add("active");

      // update progress bar
      const percent = ((currentStep + 1) / steps.length) * 100;
      progress.style.width = percent + "%";

      currentStep++;
    }
  }

  // first step immediately
  updateStep();

  // then every 4 sec update
  const interval = setInterval(() => {
    updateStep();

    if (currentStep === steps.length) {
      clearInterval(interval);
      showToast("🎉 Order Delivered!");
    }
  }, 4000);
}

function cancelOrder() {
  if (!lastOrderEmail) {
    showToast("⚠️ No order email found");
    return;
  }

  fetch("http://localhost:5001/cancel-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: lastOrderEmail
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast("❌ Order cancelled & email sent");
    } else {
      showToast("⚠️ Cancel failed");
    }
  })
  .catch(err => {
    console.error(err);
    showToast("⚠️ Server error");
  });
}

// ================= CHECKOUT SYSTEM =================
const checkoutModal = document.getElementById("checkout-modal");
const checkoutBtn = document.getElementById("checkout-btn");
const closeCheckout = document.getElementById("close-checkout");
const checkoutForm = document.getElementById("checkout-form");

checkoutBtn.addEventListener("click", () => {
  cartModal.classList.add("hidden");
  checkoutModal.classList.remove("hidden");
  paymentDone = false;
});

closeCheckout.addEventListener("click", () => {
  //checkoutModal.classList.add("hidden");
});

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!paymentDone) {
    alert("❌ Please complete payment first");
    return;
  }
  const name = checkoutForm.querySelector('input[placeholder="Full Name"]').value;
  const address = checkoutForm.querySelector('input[placeholder="Delivery Address"]').value;
  const email = prompt("📧 Enter your email for order confirmation:");
  lastOrderEmail = email;

  if (!email) {
    alert("❌ Please enter a valid email.");
    return;
  }

  const orderDetails = cart;
  const totalAmount = orderDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);

  try {
   const res = await fetch("http://localhost:5001/confirm-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, orderDetails, total: totalAmount }),
    });

    const data = await res.json();

if (data.success) {
  alert(`🎉 Order confirmed! A confirmation email has been sent to ${email}.`);

  // ✅ SAVE ORDER FOR ADMIN
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  let txn = document.getElementById("txn-id").value;
  orders.push({
  name: name,
  email: email,
  items: orderDetails.map(item => item.name),
  total: totalAmount,
  status: "Pending",
  payment: paymentDone ? "Paid" : "Pending",
   transactionId: txn, 
  time: new Date().toLocaleString()
});

  localStorage.setItem("orders", JSON.stringify(orders));

  // ✅ existing logic
  lastOrder = [...cart];
  orderTime = new Date();

  cart = [];
  updateCart();
  saveCart();

  showCancelOption();
  startOrderTracking();


} else {
  alert("⚠️ Failed to send confirmation email.");
}

} catch (err) {
  alert("⚠️ Server error while sending confirmation.");
}
});

// ================= CONTACT FORM EMAIL SENDING =================
const contactForm = document.getElementById("contact-form");

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = contactForm.querySelector('input[type="text"]').value;
  const email = contactForm.querySelector('input[type="email"]').value;
  const message = contactForm.querySelector("textarea").value;

  try {
   const res = await fetch("http://localhost:5001/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Message sent successfully!");
      contactForm.reset();
    } else {
      alert("❌ Failed to send message. Please try again.");
    }
  } catch (err) {
    alert("⚠️ Error connecting to server.");
  }
});

window.onload = () => {
  renderMenu(menuItems);
  loadCart();
};
// ================= SCROLL TO MENU =================
function scrollToMenu() {
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
}


let paymentDone = false;

function confirmPayment() {
  let txn = document.getElementById("txn-id").value;

  if (!txn || txn.length < 6) {
    alert("❌ Please enter valid transaction ID");
    return;
  }

  paymentDone = true;

  document.getElementById("order-status").innerText =
    "Payment Completed ✔️ (Txn: " + txn + ")";

  alert("Payment Verified ✅");

  // ✅ CLEAR INPUT AFTER SUCCESS
  document.getElementById("txn-id").value = "";
}

// ================= PAYMENT TOGGLE =================

function togglePayment() {
  let method = document.getElementById("payment-method").value;
  let section = document.getElementById("payment-section");

  if (method === "upi") {
    section.style.display = "block";
  } else {
    section.style.display = "none";
  }
}