import mongoose, { Schema, Document, Model } from "mongoose";

export interface Location {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IShift {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface IWorkingDay {
  day: number; // 0 (Sunday) to 6 (Saturday)
  shifts: IShift[];
}

export interface IRestaurant extends Document {
  name: string;
  address: string;
  imageUrl: string;
  workingHours: IWorkingDay[];
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

const shiftSchema = new Schema<IShift>({
  start: { type: String, required: true },
  end: { type: String, required: true },
});

shiftSchema.pre("validate", function (next) {
  if (this.start && this.end && this.start >= this.end) {
    next(new Error("End time must be after start time"));
  } else {
    next();
  }
});

const workingDaySchema = new Schema<IWorkingDay>({
  day: { type: Number, required: true, min: 0, max: 6 },
  shifts: [shiftSchema],
});

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    workingHours: {
      type: [workingDaySchema],
      required: [true, "Working hours are required"],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (arr: number[]) {
            return arr.length === 2;
          },
          message: "Coordinates must contain exactly [longitude, latitude]",
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

// For dev reloads, we want to ensure the latest schema is used
if (process.env.NODE_ENV !== "production" && mongoose.models.Restaurant) {
  delete mongoose.models.Restaurant;
}

const Restaurant: Model<IRestaurant> =
  mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>("Restaurant", restaurantSchema);

export default Restaurant;
