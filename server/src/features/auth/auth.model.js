import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['recruiter', 'admin'],
      default: 'recruiter',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);


const userModel = mongoose.model('User', userSchema);

export default userModel;