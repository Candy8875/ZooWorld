var express = require('express');
var router = express.Router();
var prisma = require('@prisma/client');
var db = new prisma.PrismaClient();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');


passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await db.users.findFirst({
    where: { email: username }
  });

  if (!user) { return cb(null, false, { message: 'Неверный email' }); }
  crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) { return cb(err); }
    if (!crypto.timingSafeEqual(Buffer.from(user.hashed_password, 'hex'), hashedPassword)) {
      return cb(null, false, { message: 'Неверный пароль.' });
    }
    return cb(null, user);
  });
}))

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.email });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true
}));

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.get('/login', function(req, res, next) {
  let errorMessage = "";
  if (req?.session?.messages?.length) {
    errorMessage = req.session.messages[req.session.messages.length - 1];
  }
  res.render("login", {
    errorMessage: errorMessage
  });
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.post('/signup', async function(req, res, next) {
  var salt = crypto.randomBytes(16).toString("hex");
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
    if (err) { return next(err); }

    const user = await db.users.create({
      data: {
        email: req.body.email,
        hashed_password: hashedPassword.toString("hex"),
        salt: salt
      }
    });
    var userNode = {
      id: user.id,
      email: req.body.email
    };
    req.login(userNode, function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
});

module.exports = router;