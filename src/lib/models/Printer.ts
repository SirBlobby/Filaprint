import mongoose from 'mongoose';

const printerSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  nozzle_diameter_mm: {
    type: Number,
    default: 0.4
  },
  power_consumption_watts: {
    type: Number,
    default: 0 // Used for energy calculation
  },
  bed_size_x_mm: Number,
  bed_size_y_mm: Number,
  bed_size_z_mm: Number,
  image_url: String, // Optional URL for printer image
}, {
  timestamps: true
});

export const Printer = mongoose.models.Printer || mongoose.model('Printer', printerSchema);
