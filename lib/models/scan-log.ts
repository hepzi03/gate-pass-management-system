import mongoose from 'mongoose'

export interface IScanLog extends mongoose.Document {
  leaveId: mongoose.Types.ObjectId
  guardId: mongoose.Types.ObjectId
  scanType: 'OUT' | 'IN'
  timestamp: Date
  qrToken: string
  isValid: boolean
  errorMessage?: string
}

const scanLogSchema = new mongoose.Schema<IScanLog>({
  leaveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveRequest',
    required: true,
  },
  guardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scanType: {
    type: String,
    enum: ['OUT', 'IN'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  qrToken: {
    type: String,
    required: true,
  },
  isValid: {
    type: Boolean,
    required: true,
  },
  errorMessage: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
})

// Index for efficient queries
scanLogSchema.index({ leaveId: 1, timestamp: -1 })
scanLogSchema.index({ guardId: 1, timestamp: -1 })
scanLogSchema.index({ timestamp: -1 })

export const ScanLog = mongoose.models.ScanLog || mongoose.model<IScanLog>('ScanLog', scanLogSchema)
