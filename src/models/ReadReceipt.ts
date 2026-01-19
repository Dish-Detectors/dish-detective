import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReadReceipt extends Document {
    userId: string;
    notificationId: string; // The ID of the broadcast notification
    readAt: Date;
}

const readReceiptSchema = new Schema<IReadReceipt>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        notificationId: {
            type: String,
            required: true,
            index: true,
        },
        readAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure a user only has one receipt per notification
readReceiptSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

const ReadReceipt: Model<IReadReceipt> =
    (mongoose.models.ReadReceipt as Model<IReadReceipt>) ||
    mongoose.model<IReadReceipt>("ReadReceipt", readReceiptSchema);

export default ReadReceipt;
