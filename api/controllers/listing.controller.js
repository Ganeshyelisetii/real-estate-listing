import { json } from "express";
import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      userRef: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteListings=async(req,res,next)=>{
  
    
    const listing=await Listing.findById(req.params.id);
    if (!listing){
       return next(errorHandler(401,'you can only delete you are own '))
    }
    if(req.user.id!==listing.userRef.toString()){
      return next(errorHandler(401,'you can only delete tour listings'))
    }
    try{
      await Listing.findByIdAndDelete(req.params.id)
      res.status(200).json({message:'listing has been deleted'})

    }catch(error){
      next(error)
    }

}

export const updateListing= async(req,res,next)=>{
  const listing=await  Listing.findById(req.params.id );
  if(!listing){
    return next(errorHandler(401,'you can upadtae your own listing'))

  }
  if(req.user.id!==listing.userRef.toString()){
    return next(errorHandler(401,'you updateyour own listing'))
  }
  try {
     const updatelisting=await Listing.findByIdAndUpdate(
         req.params.id,
         {$set:req.body},
         {new:true}
     );
     res.status(200).json(updatelisting)
    }catch(error){
      next(error)
     }
  
}
export const getListing=async (req,res,next)=>{
  try{
  const listing=await Listing.findById(req.params.id)
  if(!listing){
    return next(errorHandler(404,'listing is not found'))
  }
  res.status(200).json(listing);
  }catch(error){
    next(error)
  }
}
export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === 'false') {
      offer = { $in: [true, false] };
    } else {
      offer = offer === 'true';
    }

    let parking = req.query.parking;
    if (parking === undefined || parking === 'false') {
      parking = { $in: [true, false] };
    } else {
      parking = parking === 'true';
    }

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [true, false] };
    } else {
      furnished = furnished === 'true';
    }

    let type = req.query.type;
    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
       type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    // ✅ RETURN THE LISTINGS
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
