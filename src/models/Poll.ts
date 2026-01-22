import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPoll extends Document {
  questions: string[];
  createdBy: string;
  restaurantId: mongoose.Types.ObjectId;
}

const pollSchema = new Schema<IPoll>(
  {
    questions: {
      type: [String],
      required: [true, "Questions are required"],
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
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
  (mongoose.models.Poll as Model<IPoll>) ||
  mongoose.model<IPoll>("Poll", pollSchema);

export default Poll;
