require('dotenv').config();
const { client } = require('./config/connectDB');

const {
  getProducts,
  getSingleProduct,
  updateAvailableQuantity,
  reUpdateAvailableQuantity,
  addProduct,
  deleteProduct,
} = require('./controllers/productsController');
const {
  createUser,
  isAdmin,
  getUsers,
  deleteUser,
  makeAdmin,
  getMyProfileInfo,
  updateMyProfile,
} = require('./controllers/usersController');
const {
  bookOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  changeOrderStatus,
} = require('./controllers/ordersController');

const cors = require('cors');
const express = require('express');
const verifyToken = require('./middleware/verifyToken');
const { addReview, getLatestReviews } = require('./controllers/reviewsController');
const { verifyAdmin } = require('./middleware/verifyAdmin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();

    app.get('/', async (req, res) => {
      res.send('Running...');
    });

    console.log('DB connection established');
    app.listen(PORT, () => console.log('Listening on port:', PORT));

    app.get('/products', getProducts);
    app.post('/products', addProduct);
    app.get('/products/details/:id', getSingleProduct);
    app.put('/products/:id', verifyToken, updateAvailableQuantity);
    app.put('/products/update-available-quantity/:id', verifyToken, reUpdateAvailableQuantity);
    app.delete('/products/:prodId', verifyToken, verifyAdmin, deleteProduct);

    app.put('/users', createUser);
    app.get('/users', getUsers);
    app.delete('/users/delete/:userId', verifyToken, verifyAdmin, deleteUser);
    app.patch('/users/make-admin/:userId', verifyToken, verifyAdmin, makeAdmin);
    app.get('/users/my-profile', verifyToken, getMyProfileInfo);
    app.put('/users/:id', verifyToken, updateMyProfile);

    app.post('/orders', verifyToken, bookOrder);
    app.get('/orders/:userId', verifyToken, getMyOrders);
    app.delete('/orders/cancel/:id', verifyToken, cancelOrder);
    app.get('/orders', verifyToken, verifyAdmin, getAllOrders);
    app.patch('/orders/:orderId', verifyToken, verifyAdmin, changeOrderStatus);

    app.post('/reviews', verifyToken, addReview);
    app.get('/reviews', getLatestReviews);

    app.get('/admin/:email', verifyToken, isAdmin);
  } finally {
  }
}

run().catch(console.dir);
