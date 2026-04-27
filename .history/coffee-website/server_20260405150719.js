// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());


// 🔹 Configure your email credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mona.dhameja2005@gmail.com",   // your email
    pass: "mnaawdcomioqkpgj"       // generated app password from Gmail settings
  }
});

// 📩 Contact form endpoint
app.post("/send-message", async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: "mona.dhameja2005@gmail.com", // 👈 USE YOUR EMAIL
    subject: `New message from ${name} (${email})`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, msg: "Message sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to send message." });
  }
});

// 🛒 Order confirmation endpoint
app.post("/confirm-order", async (req, res) => {
  const { name, email, orderDetails, total } = req.body;

  const userMail = {
    from: "mona.dhameja2005@gmail.com", // 👈 USE YOUR EMAIL
    to: email,
    subject: "☕ Your Coffee Bliss Order Confirmation",
    // ...
  
    html: `
      <h2>Hi ${name},</h2>
      <p>Thank you for your order at <b>Coffee Bliss</b>!</p>
      <h3>Your Order:</h3>
      <ul>${orderDetails.map(item => `<li>${item.name} - ₹${item.price}</li>`).join('')}</ul>
      <p><b>Total:</b> ₹${total}</p>
      <p>Your coffee is being prepared! ☕</p>
      <p>Warm regards,<br>Coffee Bliss Team</p>
    `
  };

  try {
    await transporter.sendMail(userMail);
    res.status(200).json({ success: true, msg: "Order confirmation sent!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, msg: "Failed to send order confirmation." });
  }
});

app.listen(5001, () => console.log("✅ Server running on http://localhost:5001"));
