import mongoose, { Schema, Document, Model } from "mongoose";

// Notification document interface
export interface INotification extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  postedBy: string; // clerkId
  targetUserId?: string; // Specific recipient (student)
  createdAt: Date;
  type: "worker" | "student";
}

const notifSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      default: "Obavijest",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
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
    targetUserId: {
      type: String,
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

notifSchema.index({ type: 1 });
notifSchema.index({ targetUserId: 1 });

// Use existing model if it exists to avoid OverwriteModelError
const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", notifSchema);

export default Notification;
