import mongoose, { Schema, model, models } from 'mongoose';

export interface IClub {
    _id: string;
    name: string;
    description?: string;
    category: 'technical' | 'cultural' | 'sports' | 'committee';
    logo?: string;
    isActive: boolean;
    members: Array<{
        user: mongoose.Types.ObjectId;
        role: 'head' | 'coordinator' | 'member';
        joinedAt: Date;
    }>;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ClubSchema = new Schema<IClub>({
    name: { type: String, required: true },
    description: String,
    category: { type: String, enum: ['technical', 'cultural', 'sports', 'committee'], required: true },
    logo: String,
    isActive: { type: Boolean, default: true },
    members: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['head', 'coordinator', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
    }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Club = models.Club || model<IClub>('Club', ClubSchema);
