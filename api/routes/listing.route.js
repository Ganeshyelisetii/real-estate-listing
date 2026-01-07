import express from 'express';
import { createListing,deleteListings,updateListing,getListing,getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyToken.js';


const router =express.Router()
router.post('/create', verifyToken,createListing);
router.delete('/delete/:id',verifyToken,deleteListings )
router.put('/update/:id',verifyToken,updateListing)
router.get('/getlisting/:id',getListing)
router.get('/get',getListings)
export default router;