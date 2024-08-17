var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
var userHelpers = require('../helpers/user-helpers');

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  console.log(user);
  let cartCount = null
  if (req.session.user) {


    cartCount = await userHelpers.getcartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {

    res.render('user/view-products', { products, user:req.session.user, cartCount })
  })
});
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('user/login', { 'loginErr': req.session.loginErr })
    req.session.loginErr = false
  }
})
router.get('/signup', (req, res) => {
  res.render('user/signup')
});

router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedIn = true
    req.session.user = response
    res.redirect('/')
  })
})
router.post('/login', (req, res) => {
  
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    } else {
      req.session.loginErr = "Invalid username or password"
      res.redirect('/login')
    }
  }) 
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})
router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)
  console.log(products);
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  console.log('***' + req.session.user._id);
  const user = req.session.user._id; // Assuming user ID is stored in req.session.user

  res.render('user/cart', { products, user: req.session.user._id, total })
})

router.get('/add-to-cart/:id', verifyLogin, async(req, res) => {
  console.log("api call");

 await userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })


  })

})
router.post('/change-product-quantity', (req, res, next) => {
  console.log(req.body);

  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user)
    res.json(response)

  })
})
router.get('/place-order', verifyLogin, async (req, res) => {
  let total = await userHelpers.getTotalAmount(req.session.user._id)

  res.render('user/place-order', { total, user: req.session.user })
})
router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrice).then((response) => {
    res.json({ status: true })
  })
  console.log(req.body);

})
router.get('/order-success', verifyLogin, (req, res) => {
  res.render('user/order-success', { user: req.session.user , hideLayout: true  })
})
router.get('/view-orders', verifyLogin, async (req, res) => {
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/view-orders', { user: req.session.user, orders })
})  
router.get('/view-orders-products/:orderId', verifyLogin, async (req, res) => {
  const orderId = req.params.orderId;
  const order = await userHelpers.getOrderedProducts(orderId); // Ensure this function fetches the product and quantity details correctly

  res.render('user/view-orders-products', { user: req.session.user, orders: order });
});
router.get('/buy-now/:id', verifyLogin, async (req, res) => {
  try {
    console.log("Fetching product details");

    // Fetch product details
    const product = await userHelpers.buyNow(  req.params.id);
    if (product) {
      // Render product details page or send JSON response
      res.render('user/buy-p-details', { user:req.session.user, product }); // Adjust to your view/template system
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("An error occurred");
  }
});





module.exports = router;
 