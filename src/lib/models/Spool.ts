import mongoose from 'mongoose';

const spoolSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  material: {
    type: String,
    required: true,
    enum: ['PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'Nylon', 'PC', 'Other'],
    default: 'PLA'
  },
  color_hex: {
    type: String,
    default: '#ffffff'
  },
  weight_initial_g: {
    type: Number,
    required: true,
    min: 0
  },
  weight_remaining_g: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    min: 0
  },
  purchased_at: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Check if model already exists to prevent overwrite error in HMR/dev mode
export const Spool = mongoose.models.Spool || mongoose.model('Spool', spoolSchema);
