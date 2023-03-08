import { Schema, model, Model } from 'mongoose';

import { ICar } from './car.interface';

interface ICarModel extends Model<ICar> {}

const carSchema: Schema = new Schema<ICar, ICarModel>({
  url: { type: String, required: true },
  userId: { type: Number, require: true },
  carTitle: { type: String, require: true },
  lastEventId: { type: String },
});

export const CarModel = model<ICar>('Car', carSchema);
