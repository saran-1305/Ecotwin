
import { Router } from 'express';
import { getHistory, addToHistory, updateProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/history', authenticateToken, getHistory);
router.post('/history', authenticateToken, addToHistory);
router.put('/profile', authenticateToken, updateProfile);

export default router;
