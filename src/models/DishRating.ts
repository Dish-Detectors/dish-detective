import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDishRating extends Document {
  dishId: string;
  userId: string;
  rating: number;
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

const DishRating: Model<IDishRating> =
  (mongoose.models.DishRating as Model<IDishRating>) ||
  mongoose.model<IDishRating>("DishRating", dishRatingSchema);

export default DishRating;
