import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription extends Document {
    userId: string; // Clerk ID
    menuItemId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
    {
        userId: {
            type: String,
            required: true,
        },
        menuItemId: {
            type: Schema.Types.ObjectId,
            ref: "MenuItem",
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure a user is only subscribed once to a specific item
subscriptionSchema.index({ userId: 1, menuItemId: 1 }, { unique: true });

const Subscription: Model<ISubscription> =
    mongoose.models.Subscription ||
    mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;
