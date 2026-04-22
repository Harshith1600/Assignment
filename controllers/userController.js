const User = require("../models/user");

exports.load = (req, res, next) => {
  next();
};

exports.getUser = async (req, res, next) => {
  if (!req.isLoggedIn) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const user = await User.findById(req.session.user._id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};