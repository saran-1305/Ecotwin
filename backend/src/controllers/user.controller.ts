
import { Request, Response } from 'express';
import Scan from '../models/Scan';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth.middleware';

export const getHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const history = await Scan.find({ user: userId })
            .populate('product')
            .sort({ scannedAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
};

export const addToHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { productId } = req.body;

        if (!productId) {
            res.status(400).json({ message: 'Product ID is required' });
            return;
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // Create scan record
        const scan = new Scan({
            user: userId,
            product: productId
        });

        await scan.save();

        res.status(201).json(scan);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user.id;
        const { username, email } = req.body;

        // Find user
        const user = await import('../models/User').then(m => m.default.findById(userId));

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Update fields if provided
        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        // Return updated user without password
        const userResponse = {
            _id: user._id,
            username: user.username,
            email: user.email
        };

        res.json(userResponse);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
};
