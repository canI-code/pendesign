import mongoose, { Schema, model, models } from 'mongoose';

export interface IBooking {
    _id: string;
    resource: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    event?: mongoose.Types.ObjectId;
    club?: mongoose.Types.ObjectId;
    purpose: string;
    startTime: Date;
    endTime: Date;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    approvedBy?: mongoose.Types.ObjectId;
    approvalNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
    resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event' },
    club: { type: Schema.Types.ObjectId, ref: 'Club' },
    purpose: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: String,
}, { timestamps: true });

// Index for conflict detection
BookingSchema.index({ resource: 1, startTime: 1, endTime: 1 });

export const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);
