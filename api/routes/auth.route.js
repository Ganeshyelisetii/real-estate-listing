import express from 'express';
import { signup, signin, google ,signOut} from '../controllers/auth.controller.js'; 





// ✅ Added google

const router = express.Router();

router.post('/signup', signup);  // POST /api/auth/signup
router.post('/signin', signin);  // POST /api/auth/signin
router.post('/google', google);  // POST /api/auth/google
router.get('/signout',signOut)

export default router;
