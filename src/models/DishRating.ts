import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDishRating extends Document {
  dishId: string;
  restaurantId: string;
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
    restaurantId: {
      type: String,
      required: [true, "Restaurant id is required"],
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

dishRatingSchema.index(
  { dishId: 1, userId: 1, restaurantId: 1 },
  { unique: true },
);

// Force-clear the model in development if schema changed
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.DishRating;
}

const DishRating: Model<IDishRating> =
  (mongoose.models.DishRating as Model<IDishRating>) ||
  mongoose.model<IDishRating>("DishRating", dishRatingSchema);

export default DishRating;
