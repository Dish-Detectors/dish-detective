import mongoose, { Schema, Document, Model, Types } from "mongoose";

// Menu item interface
export interface IMenuItem extends Document {
  dishId: Types.ObjectId;
  available: boolean;
  lastServed: Date;
}

// Menu document interface
export interface IMenu extends Document {
  restaurantId: Types.ObjectId;
  date: Date;
  lastUpdatedBy: string;
  items: IMenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>({
  dishId: {
    type: Schema.Types.ObjectId,
    ref: "Dish",
    required: [true, "Dish ID is required"],
  },
  available: {
    type: Boolean,
    required: [true, "Available status is required"],
    default: true,
  },
  lastServed: {
    type: Date,
    required: [true, "Last served date is required"],
  },
});

const menuSchema = new Schema<IMenu>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    lastUpdatedBy: {
      type: String,
      required: [true, "Last updated by user ID is required"],
    },
    items: {
      type: [Schema.Types.ObjectId],
      ref: "MenuItem",
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Force-clear the model in development if schema changed
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Menu;
  delete mongoose.models.MenuItem;
}

const Menu: Model<IMenu> =
  (mongoose.models.Menu as Model<IMenu>) ||
  mongoose.model<IMenu>("Menu", menuSchema);

const MenuItem: Model<IMenuItem> =
  (mongoose.models.MenuItem as Model<IMenuItem>) ||
  mongoose.model<IMenuItem>("MenuItem", menuItemSchema);

export default Menu;

export { MenuItem };
