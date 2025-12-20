
import User from '../models/User.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';

// Test route (optional)
export const test = (req, res) => {
  res.json({
    message: 'API route is working'
  });
};

// Update User Controller
export const updateUser = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      return next(errorHandler(401, 'You can only update your own account'));
    }

    const updatedData = {
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar,
    };

    // Only update password if it's provided and not empty
    if (req.body.password && req.body.password.trim() !== '') {
      updatedData.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true }
    );

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, 'You can only delete your own account'));
  }

  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token')
    return res.status(200).json({ message: 'User has been deleted' });
  } catch (error) {
    next(error);
  }
};
export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    try {
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings'));
  }
};
export const getUser=async (req,res,next)=>{
  try{
    const user=await User.findById(req.params.id);
    if(!user) return next(errorHandler(404,'user not found!'));
    const {password:pass,...rest }=user._doc;
    res.status(200).json(rest);

    
  }catch(error){
    next(error)
  }
}

  
  