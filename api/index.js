import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import listingRouter from './routes/listing.route.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());





app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://real-estate-listing-xi.vercel.app"
  ],
  credentials: true,
}));

app.options('*', cors());



/* 🔹 ROUTES (AS YOU WANT) */
app.use('/api/auth', userRouter);
app.use('/api/user', authRouter);
app.use('/api/listing', listingRouter);

/* 🔹 ERROR HANDLER */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

/* 🔹 DB + SERVER */
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
  });
