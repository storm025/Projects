const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  age: {
    type: Number,
    min: 18,
    max: 120,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid Password!');
  }

  return jwt.sign(
    { id: user._id, username: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '3h' }
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;
