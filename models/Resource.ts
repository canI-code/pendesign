import mongoose, { Schema, model, models } from 'mongoose';

export interface IResource {
    _id: string;
    name: string;
    type: 'room' | 'hall' | 'lab' | 'equipment';
    description?: string;
    capacity?: number;
    location?: string;
    features?: string[];
    isAvailable: boolean;
    requiresApproval: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
    name: { type: String, required: true },
    type: { type: String, enum: ['room', 'hall', 'lab', 'equipment'], required: true },
    description: String,
    capacity: Number,
    location: String,
    features: [String],
    isAvailable: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: true },
}, { timestamps: true });

export const Resource = models.Resource || model<IResource>('Resource', ResourceSchema);
