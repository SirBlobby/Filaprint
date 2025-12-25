import mongoose from 'mongoose';

const printJobSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  spool_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spool',
    required: true
  },
  printer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Printer',
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'Untitled Print'
  },
  duration_minutes: {
    type: Number,
    required: true
  },
  filament_used_g: {
    type: Number,
    required: true
  },
  filament_used_m: {
    type: Number
  },
  calculated_cost_filament: {
    type: Number
  },
  calculated_cost_energy: {
    type: Number
  },
  status: {
    type: String,
    enum: ['In Progress', 'Success', 'Fail', 'Cancelled'],
    default: 'Success'
  },
  started_at: {
    type: Date
  },
  notes: String,
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const PrintJob = mongoose.models.PrintJob || mongoose.model('PrintJob', printJobSchema);
