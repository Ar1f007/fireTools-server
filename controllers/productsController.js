const { ObjectId } = require('mongodb');
const { client } = require('../config/connectDB');
const productCollection = client.db(process.env.DB_NAME).collection('products');

exports.getProducts = async (req, res) => {
  const products = await productCollection.find().sort({ createdAt: -1 }).limit(6).toArray();
  res.send(products);
};

exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(404).send({ message: 'Product not found' });
  }

  const product = await productCollection.findOne({ _id: ObjectId(id) });

  res.send(product);
};

exports.addProduct = async (req, res) => {
  const { name, description, price, available_quantity, min_order_quantity, image } = req.body;

  if (!name || !description || !price || !available_quantity || !image || !min_order_quantity) {
    return res.status(400).send({ message: 'Fill up all the fields please' });
  }

  const response = await productCollection.insertOne({
    name,
    description,
    price,
    available_quantity,
    min_order_quantity,
    image,
    createdAt: new Date().getTime(),
  });

  return res.status(201).send(response);
};

exports.updateAvailableQuantity = async (req, res) => {
  const { id } = req.params;
  const { available_quantity } = req.body;

  const exists = await productCollection.findOne({ _id: ObjectId(id) });

  if (!exists) {
    return res.status(404).send({ message: 'Product not found.' });
  }

  await productCollection.updateOne({ _id: ObjectId(id) }, { $set: { available_quantity } });

  return res.status(200).send('Success');
};

exports.reUpdateAvailableQuantity = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const { available_quantity } = await productCollection.findOne({ _id: ObjectId(id) });

  const newQuantity = available_quantity + quantity;

  const response = await productCollection.updateOne(
    { _id: ObjectId(id) },
    { $set: { available_quantity: newQuantity } }
  );

  res.status(200).send(response);
};

exports.deleteProduct = async (req, res) => {
  const { prodId } = req.params;
  const filter = { _id: ObjectId(prodId) };
  const exists = await productCollection.findOne(filter);

  if (!exists) {
    return res.status(404).send({ message: 'Product not found' });
  }

  const response = await productCollection.deleteOne(filter);

  return res.status(200).send(response);
};
