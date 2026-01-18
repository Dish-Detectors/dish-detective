import mongoose, { Schema, Document, Model } from "mongoose";

// Dish document interface
export interface IDishRating extends Document {
  dishId: string;
  userId: string;
  rating: number; // e.g., 1 to 5
}

const dishRatingSchema = new Schema<IDishRating>(
  {
    dishId: {
      type: String,
      required: [true, "Dish id is required"],
      trim: true,
    },
    userId: {
      type: String,
      required: [true, "User id is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
    },
  },
  {
    timestamps: true,
  },
);

dishRatingSchema.index({ dishId: 1, userId: 1 }, { unique: true });

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.DishRating;
}

const DishRating: Model<IDishRating> =
  (mongoose.models.DishRating as Model<IDishRating>) ||
  mongoose.model<IDishRating>("DishRating", dishRatingSchema);

export default DishRating;
