import mongoose, { Schema, model, models } from 'mongoose';

export interface IEvent {
    _id: string;
    title: string;
    description: string;
    eventType: 'single-day' | 'multi-day' | 'collaborative';
    startDate: Date;
    endDate: Date;
    location: string;
    maxParticipants?: number;
    budget: {
        allocated: number;
        used: number;
    };
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
    visibility: 'public' | 'private' | 'members-only';
    bannerImage?: string;
    organizers: Array<{
        club: mongoose.Types.ObjectId;
        role: string;
    }>;
    participants: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    approvedBy?: mongoose.Types.ObjectId;
    approvalNotes?: string;
    approvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
    title: { type: String, required: true },
    description: String,
    eventType: { type: String, enum: ['single-day', 'multi-day', 'collaborative'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: String,
    maxParticipants: Number,
    budget: {
        allocated: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'],
        default: 'draft'
    },
    visibility: { type: String, enum: ['public', 'private', 'members-only'], default: 'public' },
    bannerImage: String,
    organizers: [{
        club: { type: Schema.Types.ObjectId, ref: 'Club' },
        role: String,
    }],
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: String,
    approvedAt: Date,
}, { timestamps: true });

export const Event = models.Event || model<IEvent>('Event', EventSchema);
