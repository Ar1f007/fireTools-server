const { ObjectId } = require('mongodb');
const { client } = require('../config/connectDB');
const ordersCollection = client.db(process.env.DB_NAME).collection('orders');
const stripe = require('stripe')(process.env.STRIPE_SK);

exports.bookOrder = async (req, res) => {
  const { name, email, address, phoneNumber, orderQuantity, total, productName, productId, paid } =
    req.body;

  if (
    !name ||
    !email ||
    !address ||
    !phoneNumber ||
    !orderQuantity ||
    !total ||
    !productName ||
    !productId ||
    paid
  ) {
    return res.status(400).send({ message: 'Fill in all the values' });
  }

  const response = await ordersCollection.insertOne({
    ...req.body,
    status: 'pending',
    orderedAt: new Date().getTime(),
  });
  return res.send(response);
};

exports.getMyOrders = async (req, res) => {
  const { userId } = req.params;

  const response = await ordersCollection.find({ userId }).sort({ orderedAt: -1 }).toArray();
  return res.status(200).send(response);
};

exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const findOrder = await ordersCollection.findOne({ _id: ObjectId(id) });

  if (!findOrder) {
    return res.status(404).send({ message: 'Not found!' });
  }

  const response = await ordersCollection.deleteOne({ _id: ObjectId(id) });

  if (response.deletedCount === 1) {
    return res.status(200).send(response);
  }

  return res.send('could not perform the task');
};

exports.getAllOrders = async (req, res) => {
  const response = await ordersCollection.find().sort({ orderedAt: -1 }).toArray();
  res.send(response);
};

exports.changeOrderStatus = async (req, res) => {
  const { orderId } = req.params;

  const filter = { _id: ObjectId(orderId) };

  const exists = await ordersCollection.findOne(filter);
  if (!exists) {
    return res.status(404).send({ message: 'Product Not found' });
  }

  const updateDoc = await ordersCollection.updateOne(filter, { $set: { status: 'shipped' } });

  res.status(200).send(updateDoc);
};

exports.generateClientSecret = async (req, res) => {
  const { total } = req.body;

  const amount = total * 100;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method_types: ['card'],
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const payment = req.body;

  const updatedDoc = {
    $set: { paid: true, transactionId: payment.transactionId },
  };

  const order = await ordersCollection.updateOne({ _id: ObjectId(id) }, updatedDoc, {
    upsert: true,
  });

  res.send(order);
};
