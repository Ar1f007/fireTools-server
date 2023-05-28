const { ObjectId } = require('mongodb');
const { client } = require('../config/connectDB');

const reviewCollection = client.db(process.env.DB_NAME).collection('reviews');

exports.addReview = async (req, res) => {
  const { name, testimonial, ratings } = req.body;

  if (!name || !testimonial || !ratings) {
    return res.status(400).send({ message: 'Fill out all the fields' });
  }

  const response = await reviewCollection.insertOne({
    name,
    testimonial,
    ratings,
    email: req.user.email,
    createdAt: new Date().getTime(),
  });

  res.status(201).send(response);
};

exports.getLatestReviews = async (req, res) => {
  const response = await reviewCollection.find().sort({ createdAt: -1 }).limit(6).toArray();

  res.send(response);
};

exports.getMyReviews = async (req, res) => {
  const { email } = req.params;

  const response = await reviewCollection.find({ email }).toArray();

  return res.status(200).send(response);
};

exports.getAllReviews = async (req, res) => {
  const response = await reviewCollection.find().toArray();

  return res.status(200).json(response);
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  const response = await reviewCollection.deleteOne({ _id: ObjectId(id) });

  if (!response) {
    return res.status(404).json('Not Found');
  }

  return res.status(200).json(response);
};
