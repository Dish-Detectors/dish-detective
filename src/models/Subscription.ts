import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription extends Document {
  userId: string; // Clerk ID
  dishId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: String,
      required: true,
    },
    dishId: {
      type: Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
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

// Compound index to ensure a user is only subscribed once to a specific item at a specific restaurant
subscriptionSchema.index({ userId: 1, dishId: 1, restaurantId: 1 }, { unique: true });

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Subscription;
}

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", subscriptionSchema);

// One-time cleanup of problematic index if it exists
if (mongoose.connection.readyState === 1) {
  Subscription.collection.dropIndex("userId_1_menuItemId_1").catch(() => { });
  Subscription.collection.dropIndex("userId_1_dishId_1").catch(() => { });
}

export default Subscription;
