import Listing from "../models/listing.model.js";
import { errorHandler } from "../utils/error.js";

/* ======================================================
   CREATE LISTING (PROTECTED)
====================================================== */
export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create({
      ...req.body,
      userRef: req.user.id, // comes from verifyToken
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   DELETE LISTING (OWNER ONLY)
====================================================== */
export const deleteListings = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    if (req.user.id !== listing.userRef.toString()) {
      return next(errorHandler(401, 'You can delete only your own listing'));
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Listing has been deleted',
    });
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   UPDATE LISTING (OWNER ONLY)
====================================================== */
export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    if (req.user.id !== listing.userRef.toString()) {
      return next(errorHandler(401, 'You can update only your own listing'));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET SINGLE LISTING (PUBLIC)
====================================================== */
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

/* ======================================================
   GET LISTINGS WITH FILTERS (PUBLIC)
====================================================== */
export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    // ---- FILTERS ----
    let offer =
      req.query.offer === undefined
        ? { $in: [true, false] }
        : req.query.offer === 'true';

    let parking =
      req.query.parking === undefined
        ? { $in: [true, false] }
        : req.query.parking === 'true';

    let furnished =
      req.query.furnished === undefined
        ? { $in: [true, false] }
        : req.query.furnished === 'true';

    let type =
      req.query.type === undefined || req.query.type === 'all'
        ? { $in: ['sale', 'rent'] }
        : req.query.type;

    const searchTerm = req.query.searchTerm || '';
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      parking,
      furnished,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
