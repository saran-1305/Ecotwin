
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    title: string;
    description?: string;
    category?: string;
    price?: string;
    score: number;
    carbon_footprint: string;
    recyclability: string;
    labor_ethics: string;
    scannedAt: Date;
}

const ProductSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    price: { type: String },
    score: { type: Number, required: true },
    carbon_footprint: { type: String, required: true },
    recyclability: { type: String, required: true },
    labor_ethics: { type: String, required: true },
    scannedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
