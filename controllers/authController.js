const User = require('../models/userModel');

const bcrypt = require('bcryptjs');

exports.signUp = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const hashpassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({ username, password: hashpassword });

    req.session.user = newUser;
    res.status(201).json({ status: 'success', data: { newUser } });
  } catch (e) {
    res.status(400).json({ status: 'fail' });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User not found' });
    } else {
      const comparePassword = await bcrypt.compare(password, user.password);

      if (comparePassword) {
        req.session.user = user;
        res.status(200).json({ status: 'success' });
      } else {
        res
          .status(400)
          .json({ status: 'fail', message: 'Incorrect username/password' });
      }
    }
  } catch (e) {
    res.status(400).json({ status: 'fail' });
  }
};
