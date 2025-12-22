import User from '../models/User.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

// =======================
// SIGNUP CONTROLLER
// =======================
export const signup = async (req, res, next) => {
  try {
    const { username, email, password, avatar } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: 'User email already exists',
      });
    }

    const hashPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashPassword,
      avatar,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// SIGNIN CONTROLLER
// =======================
export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const isPasswordCorrect = bcryptjs.compareSync(
      password,
      validUser.password
    );
    if (!isPasswordCorrect)
      return next(errorHandler(401, 'Invalid password!'));

    const token = jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password, ...rest } = validUser._doc;

    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: true,       // ✅ REQUIRED (Render + Vercel)
        sameSite: 'none',   // ✅ REQUIRED (cross-domain)
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// =======================
// GOOGLE SIGNIN / SIGNUP
// =======================
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password, ...rest } = user._doc;

      return res
        .cookie('access_token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        })
        .status(200)
        .json(rest);
    }

    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    const hashPassword = bcryptjs.hashSync(generatedPassword, 10);

    const newUser = new User({
      username:
        req.body.name.split(' ').join('').toLowerCase() +
        Math.random().toString(36).slice(-4),
      email: req.body.email,
      password: hashPassword,
      avatar: req.body.photo,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password, ...rest } = newUser._doc;

    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

// =======================
// SIGN OUT
// =======================
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token', {
      secure: true,
      sameSite: 'none',
    });
    res.status(200).json('User has been logged out');
  } catch (error) {
    next(error);
  }
};
