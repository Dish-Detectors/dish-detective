import mongoose, { Schema, Document, Model, models, model } from "mongoose";

export interface IAllergen extends Document {
  name: string;
}

const AllergenSchema = new Schema<IAllergen>(
  {
    name: {
      type: String,
      required: [true, "Please provide an allergen name"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

// Export the model
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Allergen;
}

const Allergen: Model<IAllergen> =
  (mongoose.models.Allergen as Model<IAllergen>) ||
  mongoose.model<IAllergen>("Allergen", AllergenSchema);

export default Allergen;
