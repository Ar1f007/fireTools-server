const { client } = require('../config/connectDB');
const userCollection = client.db(process.env.DB_NAME).collection('users');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

exports.createUser = async (req, res) => {
  const { email, name } = req.body;
  const updateDoc = { $set: { email, name } };
  const response = await userCollection.updateOne({ email }, updateDoc, { upsert: true });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.send({ response, token });
};

exports.getUsers = async (req, res) => {
  const response = await userCollection.find().toArray();

  res.status(200).send(response);
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  const filter = { _id: ObjectId(userId) };
  const exists = await userCollection.findOne(filter);

  if (exists) {
    const response = await userCollection.deleteOne(filter);
    if (response) {
      return res.status(204).send(response);
    } else {
      return res.send({ message: 'could not delete the user' });
    }
  }

  return res.status(404).send({ message: 'User not found' });
};

exports.makeAdmin = async (req, res) => {
  const { userId } = req.params;
  const filter = { _id: ObjectId(userId) };
  const exists = await userCollection.findOne(filter);

  if (!exists) {
    return res.status(404).send({ message: 'user not found' });
  }

  const response = await userCollection.updateOne(
    filter,
    { $set: { role: 'admin' } },
    { upsert: true }
  );

  if (response.modifiedCount === 1) {
    return res.status(200).send(response);
  }

  return res.send({ message: 'Could not performed the task, try again.' });
};

exports.isAdmin = async (req, res) => {
  const { email } = req.params;

  const user = await userCollection.findOne({ email });

  const isAdmin = user.role === 'admin';

  res.send({ admin: isAdmin });
};

exports.getMyProfileInfo = async (req, res) => {
  const email = req.user.email;
  const user = await userCollection.findOne({ email });

  res.send(user);
};

exports.updateMyProfile = async (req, res) => {
  const { id } = req.params;

  const filter = { _id: ObjectId(id) };

  const user = await userCollection.findOne(filter);

  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  await userCollection.updateOne(filter, { $set: { ...req.body } }, { upsert: true });

  res.status(200).send('Successful');
};
