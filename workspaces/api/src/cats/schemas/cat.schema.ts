import * as mongoose from 'mongoose';

export const CatsSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    age: {
      required: true,
      type: Number,
    },
    breed: {
      required: false,
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
