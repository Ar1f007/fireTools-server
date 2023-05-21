const { client } = require('../config/connectDB');

const reviewCollection = client.db(process.env.DB_NAME).collection('reviews');

exports.addReview = async (req, res) => {
  const { name, testimonial, ratings } = req.body;

  if (!name || !testimonial || !ratings) {
    return res.status(400).send({ message: 'Fill out all the fields' });
  }

  const response = await reviewCollection.insertOne(req.body);

  res.status(201).send(response);
};

exports.getLatestReviews = async (req, res) => {
  const response = await reviewCollection.find().sort({ createdAt: -1 }).limit(6).toArray();

  res.send(response);
};
