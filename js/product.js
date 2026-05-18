const BOT_TOKEN = "8828690268:AAGwq2Hs4eyWG50X2JgG0XYf4eb8nec1Mng";
const CHAT_ID = "6108249367";
// =============================================

let currentProduct = null;

async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    showNotFound();
    return;
  }

  try {
    const res = await fetch("product.json");
    const data = await res.json();

    if (!data[id]) {
      showNotFound();
      return;
    }

    currentProduct = { id, ...data[id] };
    renderProduct(currentProduct);
  } catch (e) {
    showNotFound();
  }
}

function renderProduct(p) {
  document.title = p.name + " — Buyurtma";

  document.getElementById("productImg").src = p.image;
  document.getElementById("productImg").alt = p.name;
  document.getElementById("productName").textContent = p.name;
  document.getElementById("productShort").textContent = p.short;
  document.getElementById("productPrice").textContent = p.price;
  document.getElementById("productDesc").textContent = p.description;

  // Features
  const list = document.getElementById("featuresList");
  if (p.features && p.features.length) {
    p.features.forEach((f) => {
      const tag = document.createElement("div");
      tag.className = "feature-tag";
      tag.textContent = f;
      list.appendChild(tag);
    });
  } else {
    document.getElementById("featuresSection").style.display = "none";
  }

  document.getElementById("mainContent").style.display = "block";
}

function showNotFound() {
  document.getElementById("notFound").style.display = "flex";
}

async function sendOrder() {
  const fname = document.getElementById("fname").value.trim();
  // const lname = document.getElementById("lname").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const btn = document.getElementById("submitBtn");
  const err = document.getElementById("errorMsg");

  err.style.display = "none";

  if (!fname || !phone) {
    err.textContent = "Iltimos, barcha maydonlarni to'ldiring.";
    err.style.display = "block";
    return;
  }

  if (!/^[\+\d\s\-\(\)]{9,16}$/.test(phone)) {
    err.textContent = "To'g'ri telefon raqam kiriting.";
    err.style.display = "block";
    return;
  }

  // Loading state
  btn.disabled = true;
  document.getElementById("btnText").textContent = "Yuborilmoqda...";
  document.getElementById("btnArrow").style.display = "none";
  const spinner = document.createElement("div");
  spinner.className = "spinner";
  btn.appendChild(spinner);

  const time = new Date().toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    dateStyle: "short",
    timeStyle: "short",
  });

  const msg = `🛍 *Yangi buyurtma!*

📦 *Mahsulot:* ${currentProduct.name}
💰 *Narxi:* ${currentProduct.price}

👤 *Ism:* ${fname}
📞 *Telefon:* ${phone}
🕐 *Vaqt:* ${time}

🔗 ID: \`${currentProduct.id}\``;

  try {
    const res = await fetch("https://telegram-bot.khusniddinovk1.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fname,
        phone: phone,
        product: currentProduct.name,
        price: currentProduct.price,
        id: currentProduct.id,
      }),
    });

    const data = await res.json();

    if (data.ok) {
      // Pixel - Purchase event
      fbq("track", "Purchase", {
        value: 0,
        currency: "UZS",
        content_name: currentProduct.name,
        content_ids: [currentProduct.id],
      });
      document.getElementById("successName").textContent = fname;
      document.getElementById("formContent").style.display = "none";
      document.getElementById("successState").style.display = "block";
    } else {
      throw new Error(data.description);
    }
  } catch (e) {
    err.textContent = "Xatolik yuz berdi. Qaytadan urinib ko'ring.";
    err.style.display = "block";
    btn.disabled = false;
    document.getElementById("btnText").textContent = "Buyurtma berish";
    document.getElementById("btnArrow").style.display = "block";
    spinner.remove();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendOrder();
});

loadProduct();
