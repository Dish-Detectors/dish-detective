import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnswers extends Document {
  userId: string;
  pollId: string;
  answers: {
    question: string;
    rating: number;
  }[];
}

const answerSchema = new Schema<IAnswers>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
    },
    pollId: {
      type: String,
      required: [true, "Poll ID is required"],
      trim: true,
    },
    answers: [
      {
        question: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
  },
  {
    timestamps: true,
  },
);

if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Answers;
}

const Answers: Model<IAnswers> =
  (mongoose.models.Answers as Model<IAnswers>) ||
  mongoose.model<IAnswers>("Answers", answerSchema);

export default Answers;
