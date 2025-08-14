import mongoose from 'mongoose'

export interface ILeaveRequest extends mongoose.Document {
  studentId: mongoose.Types.ObjectId
  fromDate: Date
  toDate: Date
  reason: string
  destination: string
  emergencyContact: string
  attachment?: string
  status: 'pending' | 'approved' | 'rejected'
  approvals: {
    advisor: { status: 'pending' | 'approved' | 'rejected', comment?: string, timestamp?: Date }
    hod: { status: 'pending' | 'approved' | 'rejected', comment?: string, timestamp?: Date }
    warden: { status: 'pending' | 'approved' | 'rejected', comment?: string, timestamp?: Date }
  }
  qrToken?: string
  qrTokenExpiry?: Date
  scanStatus: 'not_scanned' | 'out' | 'in'
  outTime?: Date
  inTime?: Date
  createdAt: Date
  updatedAt: Date
}

const leaveRequestSchema = new mongoose.Schema<ILeaveRequest>({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  destination: {
    type: String,
    required: true,
    trim: true,
  },
  emergencyContact: {
    type: String,
    required: true,
    trim: true,
  },
  attachment: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvals: {
    advisor: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      comment: { type: String, trim: true },
      timestamp: { type: Date },
    },
    hod: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      comment: { type: String, trim: true },
      timestamp: { type: Date },
    },
    warden: {
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      comment: { type: String, trim: true },
      timestamp: { type: Date },
    },
  },
  qrToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  qrTokenExpiry: {
    type: Date,
  },
  scanStatus: {
    type: String,
    enum: ['not_scanned', 'out', 'in'],
    default: 'not_scanned',
  },
  outTime: {
    type: Date,
  },
  inTime: {
    type: Date,
  },
}, {
  timestamps: true,
})

// Index for efficient queries
leaveRequestSchema.index({ studentId: 1, createdAt: -1 })
leaveRequestSchema.index({ status: 1 })

export const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', leaveRequestSchema)
