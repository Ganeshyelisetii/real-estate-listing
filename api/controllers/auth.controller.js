import User from '../models/User.model.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';

const isProduction = process.env.NODE_ENV === 'production';

/* ======================================================
   SIGNUP
====================================================== */
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

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
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

/* ======================================================
   SIGNIN
====================================================== */
export const signin = async (req, res, next) => {
  try {
    const { email, password: inputPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(errorHandler(404, 'User not found'));

    const isMatch = bcryptjs.compareSync(inputPassword, user.password);
    if (!isMatch) return next(errorHandler(401, 'Invalid password'));

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password, ...rest } = user._doc;

    res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: isProduction,                 // 🔑 key fix
        sameSite: isProduction ? 'none' : 'lax',
      })
      .status(200)
      .json(rest);

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GOOGLE SIGNIN / SIGNUP
====================================================== */
export const google = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });

    // ---- LOGIN ----
    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password, ...rest } = existingUser._doc;

      return res
        .cookie('access_token', token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
        })
        .status(200)
        .json(rest);
    }

    // ---- SIGNUP ----
    const generatedPassword =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);

    const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

    const newUser = new User({
      username:
        req.body.name.replace(/\s+/g, '').toLowerCase() +
        Math.random().toString(36).slice(-4),
      email: req.body.email,
      password: hashedPassword,
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
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
      })
      .status(200)
      .json(rest);

  } catch (error) {
    next(error);
  }
};

/* ======================================================
   SIGN OUT
====================================================== */
export const signOut = async (req, res, next) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'User has been logged out',
    });
  } catch (error) {
    next(error);
  }
};
