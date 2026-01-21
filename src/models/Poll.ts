import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPoll extends Document {
  questions: string[];
}

const pollSchema = new Schema<IPoll>(
  {
    questions: {
      type: [String],
      required: [true, "Questions are required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Notification;
}

const Poll: Model<IPoll> =
  (mongoose.models.Notification as Model<IPoll>) ||
  mongoose.model<IPoll>("Poll", pollSchema);

export default Poll;
