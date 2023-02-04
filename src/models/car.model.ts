import mongoose, { Schema } from "mongoose";

import { ICar } from "./car.interface";

const CarSchema: Schema = new Schema({
  url: { type: String, required: true },
  userId: { type: Number, require: true }
});

export default mongoose.model<ICar>('Car', CarSchema);
