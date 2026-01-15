import mongoose, { Schema, Document, Model } from "mongoose";

// Dish document interface
export interface INotification extends Document {
  description: string;
  postedBy: string; // clerkId
  createdAt: Date;
  type: "worker" | "student";
}

const notifSchema = new Schema<INotification>(
  {
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["worker", "student"],
      required: [true, "Type is required"],
    },
    postedBy: {
      type: String,
      required: [true, "Posted by user ID is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

notifSchema.index({ type: 1 }, { unique: true });

// Use existing model if it exists to avoid OverwriteModelError
const Notification: Model<INotification> =
  (mongoose.models.Dish as Model<INotification>) ||
  mongoose.model<INotification>("Dish", notifSchema);

export default Notification;
