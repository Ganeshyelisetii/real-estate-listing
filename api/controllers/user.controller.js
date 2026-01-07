
import User from '../models/User.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';

const isProduction = process.env.NODE_ENV === 'production';

// =======================
// TEST ROUTE
// =======================
export const test = (req, res) => {
  res.json({ message: 'API route is working' });
};

// =======================
// UPDATE USER
// =======================
export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id.toString() !== req.params.id.toString()) {
      console.log(typeof req.user.id, req.user.id);
      console.log(typeof req.params.id, req.params.id);

      return next(errorHandler(401, 'You can only update your own account'));

    }

    const updatedData = {
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar,
    };

    if (req.body.password?.trim()) {
      updatedData.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, 'User not found'));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// =======================
// DELETE USER (FIXED)
// =======================
export const deleteUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, 'You can only delete your own account'));
    }

    await User.findByIdAndDelete(req.params.id);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// =======================
// GET USER LISTINGS
// =======================
export const getUserListings = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, 'You can only view your own listings'));
    }

    const listings = await Listing.find({ userRef: req.params.id });
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};

// =======================
// GET SINGLE USER
// =======================
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(errorHandler(404, 'User not found'));

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
