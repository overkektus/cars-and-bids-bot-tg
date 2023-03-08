import { Schema, model, Model } from 'mongoose';

import { ICar } from './car.interface';

const carSchema: Schema<ICar> = new Schema({
  url: { type: String, required: true },
  userId: { type: Number, require: true },
  carTitle: { type: String, require: true },
  lastEventId: { type: String },
});

export const CarModel: Model<ICar> = model<ICar>('Car', carSchema);
