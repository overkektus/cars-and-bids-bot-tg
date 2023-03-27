import { Schema, model, Model } from 'mongoose';

import { ISetting } from './setting.interface';

const setttingSchema: Schema<ISetting> = new Schema({
  isBidOnly: { type: Boolean, required: true, default: false },
  userId: { type: Number, require: true },
});

export const SettingModel: Model<ISetting> = model<ISetting>(
  'Setting',
  setttingSchema
);
