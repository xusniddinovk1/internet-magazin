const BOT_TOKEN = "8828690268:AAGwq2Hs4eyWG50X2JgG0XYf4eb8nec1Mng";
const CHAT_ID = "6108249367";

function validatePhone(p) {
  return /^[\+\d\s\-\(\)]{9,16}$/.test(p.trim());
}

async function sendOrder() {
  const name = document.getElementById("name").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const btn = document.getElementById("submitBtn");
  const errDiv = document.getElementById("errorMsg");

  errDiv.style.display = "none";

  if (!name || !surname || !phone) {
    errDiv.textContent = "Iltimos, barcha maydonlarni to'ldiring.";
    errDiv.style.display = "block";
    return;
  }

  if (!validatePhone(phone)) {
    errDiv.textContent = "Iltimos, to'g'ri telefon raqam kiriting.";
    errDiv.style.display = "block";
    return;
  }

  btn.classList.add("loading");
  btn.disabled = true;

  const now = new Date();
  const time = now.toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    dateStyle: "short",
    timeStyle: "short",
  });

  const message = `🛍 *Yangi buyurtma!*

👤 *Ism:* ${name}
👤 *Familiya:* ${surname}
📞 *Telefon:* ${phone}
🕐 *Vaqt:* ${time}`;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      },
    );

    const data = await res.json();

    if (data.ok) {
      document.getElementById("formContent").style.display = "none";
      document.getElementById("successState").style.display = "block";
    } else {
      throw new Error(data.description || "Telegram xatoligi");
    }
  } catch (err) {
    console.error(err);
    errDiv.textContent = "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
    errDiv.style.display = "block";
    btn.classList.remove("loading");
    btn.disabled = false;
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendOrder();
});

async function loadProducts() {
  try {
    const res = await fetch("product.json");
    const data = await res.json();
    const grid = document.getElementById("productsGrid");

    Object.entries(data).forEach(([id, product]) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
              <img src="${product.image}" alt="${product.name}" />
              <div class="product-card-body">
                <div class="product-card-title">${product.name}</div>
                <div class="product-card-text">${product.short}</div>
              </div>
              <div class="product-card-footer">
                <div class="product-price-tag">${product.price}</div>
                <a class="view-btn" href="product.html?id=${encodeURIComponent(id)}">Buyurtma</a>
              </div>
            `;
      grid.appendChild(card);
    });
  } catch (err) {
    document.getElementById("productsSection").style.display = "none";
    console.error("Product list load failed:", err);
  }
}

loadProducts();
