$(document).ready(function () {
  $("a[href*=#]").bind("click", function (e) {
    e.preventDefault();

    var target = $(this).attr("href");

    $("html, body")
      .stop()
      .animate({ scrollTop: $(target).offset().top }, 500, function () {
        location.hash = target;
      });

    return false;
  });
});

jQuery(document).ready(function ($) {
  $("#scroll-top > button").on("click", function (e) {
    var body = $("html, body");
    body.stop().animate({ scrollTop: 0 }, 500, "swing");
  });
});

document.querySelectorAll(".plus").forEach((item) => {
  item.addEventListener("click", function () {
    let input = item.parentElement.querySelector("input");
    ++input.value;
    input.dispatchEvent(new Event("change"));
    if (item.parentElement.querySelector("input").value > 1) {
      item.parentElement.querySelector(".minus").classList.remove("min");
    }
  });
});

document.querySelectorAll(".minus").forEach((item) => {
  item.addEventListener("click", function () {
    let input = item.parentElement.querySelector("input");
    --input.value;
    input.dispatchEvent(new Event("change"));
    if (item.parentElement.querySelector("input").value < 2) {
      item.parentElement.querySelector("input").value = 1;

      item.classList.add("min");
    }
  });
});

const createOrderButton = document.getElementById("createOrder");
if (createOrderButton) {
  createOrderButton.addEventListener("click", async () => {
    const order = {
      fio: document.getElementById("fio").value,
      email: document.getElementById("email").value,
      nomer: document.getElementById("nomer").value,
      adress: document.getElementById("adress").value,
    };

    const products = [];
    const productBlocks = document.querySelectorAll(".cart-tovars");
    productBlocks.forEach((productBlock) => {
      const productInput = productBlock.querySelector(".product-quantity");
      const id = parseInt(productInput.getAttribute("data-productid"));
      const quantity = parseInt(productInput.value);
      products.push({ id, quantity });
    });

    const response = await fetch("/order", {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order,
        products,
      }),
    });

    window.location.href = response.url;
    alert("Ваш заказ успешно оформлен!\nЗаберите его по адресу: улица Центральная, дом 13/5 через 2 дня.");
  });
}

document.querySelectorAll(".product-quantity").forEach((item) => {
  item.addEventListener("change", async (event) => {
    const quantity = parseInt(event.target.value);
    const productId = parseInt(event.target.getAttribute("data-productid"));
    const priceRes = await fetch("/update_quantity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
        productId,
      }),
    });
    const priceJson = await priceRes.json();
    const price = JSON.parse(priceJson);
    document.getElementById("total-price").textContent = price;
  });
});
