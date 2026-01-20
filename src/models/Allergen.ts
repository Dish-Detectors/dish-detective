import mongoose, { Schema, Document, models, model } from "mongoose";

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

export default models.Allergen || model<IAllergen>("Allergen", AllergenSchema);
