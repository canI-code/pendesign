import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
    _id: string;
    email: string;
    passwordHash: string;
    name: string;
    department?: string;
    year?: number;
    role: 'admin' | 'organizer' | 'participant';
    phone?: string;
    bio?: string;
    profilePicture?: string;
    isVerified: boolean;
    clubs: mongoose.Types.ObjectId[];
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    department: String,
    year: Number,
    role: { type: String, enum: ['admin', 'organizer', 'participant'], default: 'participant' },
    phone: String,
    bio: String,
    profilePicture: String,
    isVerified: { type: Boolean, default: false },
    clubs: [{ type: Schema.Types.ObjectId, ref: 'Club' }],
    permissions: [String],
}, { timestamps: true });

export const User = models.User || model<IUser>('User', UserSchema);
