import mongoose, { Schema, Document, Model } from "mongoose";
import "./Allergen"; // Ensure Allergen schema is registered before Dish is used

// Dish document interface
export interface IDish extends Document {
  name: string;
  description: string;
  imageUrl: string;
  allergens: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const dishSchema = new Schema<IDish>(
  {
    name: {
      type: String,
      required: [true, "Dish name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    allergens: [
      {
        type: Schema.Types.ObjectId,
        ref: "Allergen",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Useful since we will need to display all items when creating a new menu, and when choosing to delete a dish
dishSchema.index({ name: 1 }, { unique: true });

// Export the model
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Dish;
}

const Dish: Model<IDish> =
  (mongoose.models.Dish as Model<IDish>) ||
  mongoose.model<IDish>("Dish", dishSchema);

export default Dish;
