var express = require("express");
var router = express.Router();
var prisma = require("@prisma/client");
var db = new prisma.PrismaClient();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", {
    user: req.user,
    page: "index",
    productsCount: req?.session?.cart?.length || 0,
  });
});

router.get("/services", function (req, res, next) {
  res.render("services", {
    user: req.user,
    page: "services",
    productsCount: req?.session?.cart?.length || 0,
  });
});

router.get("/cart", function (req, res, next) {
  res.render("cart", {
    user: req.user,
    page: "cart",
    productsCount: req?.session?.cart?.length || 0,
    cart: req.session.cart,
  });
});

router.get("/record", function (req, res, next) {
  res.render("record", {
    user: req.user,
    page: "record",
    productsCount: req?.session?.cart?.length || 0,
  });
});

router.post("/record", async function (req, res, next) {
  await db.record.create({
    data: {
      email: req.body.email,
      fio: req.body.fio,
      tel: req.body.tel,
      reason_for_recording: req.body.reason_for_recording,
      Date: new Date(req.body.Date),
    },
  });
  res.redirect("/");
});

router.post("/order", async function (req, res, next) {
  const order = req.body.order;
  const products = req.body.products;
  const newOrder = await db.orders.create({
    data: {
      fio: order.fio,
      email: order.email,
      tel: order.nomer,
      adress: order.adress,
    },
  });
  products.forEach(async (product) => {
    await db.order_lines.create({
      data: {
        order_id: newOrder.id,
        product_id: product.id,
        quantity: product.quantity,
      },
    });
  });

  if (req.session.cart) {
    req.session.cart = [];
  }

  res.redirect("/");
});

router.get("/catalog", async function (req, res, next) {
  const products = await db.products.findMany();
  const categories = await db.categories.findMany();

  res.render("catalog", {
    user: req.user,
    page: "catalog",
    productsCount: req?.session?.cart?.length || 0,
    products,
    categories,
  });
});

router.post("/add_cart", async function (req, res, next) {
  const productId = parseInt(req.body.id);
  const product = await db.products.findFirst({
    where: {
      id: productId,
    },
  });

  if (!product) {
    res.sendStatus(404);
    return;
  }

  if (!req.session.cart) {
    req.session.cart = [];
  }

  let count = 0;

  for (let i = 0; i < req.session.cart.length; i++) {
    if (req.session.cart[i].product.id === productId) {
      req.session.cart[i].quantity += 1;

      count++;
    }
  }

  if (count === 0) {
    const cart_data = {
      product,
      quantity: 1,
    };

    req.session.cart.push(cart_data);
  }

  res.redirect("/catalog");
});

router.post("/remove_cart", (req, res) => {
  const productId = parseInt(req.body.id);

  for (let i = 0; i < req.session.cart.length; i++) {
    if (req.session.cart[i].product.id === productId) {
      req.session.cart.splice(i, 1);
    }
  }

  res.redirect("/cart");
});

router.post("/update_quantity", function (req, res, next) {
  const { quantity, productId } = req.body;
  for (let i = 0; i < req.session.cart.length; i++) {
    if (req.session.cart[i].product.id === productId) {
      req.session.cart[i].quantity = quantity;
    }
  }
  var totalPrice = req.session.cart
    .map((x) => x.product.price * x.quantity)
    .reduce((prevValue, currentValue) => prevValue + currentValue);
  res.json(totalPrice);
});

module.exports = router;
