
import mongoose, { Schema, Document } from 'mongoose';

export interface IScan extends Document {
    user: mongoose.Schema.Types.ObjectId;
    product: mongoose.Schema.Types.ObjectId;
    scannedAt: Date;
}

const ScanSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    scannedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Check for duplicate scans by same user for same product if needed?
// For now, allow multiple scans or just updates. Let's keep it simple.

export default mongoose.model<IScan>('Scan', ScanSchema);
