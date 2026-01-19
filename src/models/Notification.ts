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
  read: boolean;
  attachment?: {
    name: string;
    url: string;
    type: string;
    size: string;
  };
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
      // required: [true, "Description is required"], // Removed requirement to allow attachment-only messages
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
    },
    type: {
      type: String,
      enum: ["worker", "student"],
      required: [true, "Type is required"],
    },
    attachment: {
      name: { type: String },
      url: { type: String },
      type: { type: String },
      size: { type: String }
    },
    postedBy: {
      type: String,
      required: [true, "Posted by user ID is required"],
    },
    targetUserId: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
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

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Notification;
}

const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>("Notification", notifSchema);

export default Notification;
