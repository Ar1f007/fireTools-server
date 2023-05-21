const { client } = require('../config/connectDB');
const userCollection = client.db(process.env.DB_NAME).collection('users');

exports.verifyAdmin = async (req, res, next) => {
  const initiatorsEmail = req.user.email;
  const initiatorAccount = await userCollection.findOne({ email: initiatorsEmail });

  if (initiatorAccount.role === 'admin') {
    return next();
  }

  return res.status(403).send({ message: 'You are not allowed to perform this action' });
};
