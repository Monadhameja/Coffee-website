let lastOrder = null;
let orderTime = null;
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



// ================= CHECKOUT SYSTEM =================
const checkoutModal = document.getElementById("checkout-modal");
const checkoutBtn = document.getElementById("checkout-btn");
const closeCheckout = document.getElementById("close-checkout");
const checkoutForm = document.getElementById("checkout-form");

checkoutBtn.addEventListener("click", () => {
  cartModal.classList.add("hidden");
  checkoutModal.classList.remove("hidden");
});

closeCheckout.addEventListener("click", () => {
  checkoutModal.classList.add("hidden");
});

checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = checkoutForm.querySelector('input[placeholder="Full Name"]').value;
  const address = checkoutForm.querySelector('input[placeholder="Delivery Address"]').value;
  const email = prompt("📧 Enter your email for order confirmation:");

  if (!email) {
    alert("❌ Please enter a valid email.");
    return;
  }

  const orderDetails = cart;
  const totalAmount = orderDetails.reduce((sum, item) => sum + item.price, 0);

  try {
   const res = await fetch("http://localhost:5001/confirm-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, orderDetails, total: totalAmount }),
    });

    const data = await res.json();
    if (data.success) {
  alert(`🎉 Order confirmed! A confirmation email has been sent to ${email}.`);

  // ✅ STORE ORDER
  lastOrder = [...cart];
  orderTime = new Date();

  // ✅ CLEAR CART
  cart = [];
  updateCart();

  // ✅ CLOSE MODAL
  checkoutModal.classList.add("hidden");

  // ✅ NEW FEATURES
  showCancelOption();
  startOrderTracking();

} else {
  alert("⚠️ Failed to send confirmation email.");
}
};

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
