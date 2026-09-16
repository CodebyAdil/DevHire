import { Schema, model, Types } from "mongoose";


const jobSchema = new Schema(
  {
    recruiterId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    requirements: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true }, // updatedAt is handy for "last edited" later
  },
);

const Job = model("Job", jobSchema);

export default Job;
