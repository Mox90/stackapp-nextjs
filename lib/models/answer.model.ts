import { Schema, model, models } from 'mongoose'

export interface IAnswer extends Document {
  content: string
  question: Schema.Types.ObjectId
  author: Schema.Types.ObjectId
  upvotes: Schema.Types.ObjectId[]
  downvotes: Schema.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const AnswerSchema = new Schema<IAnswer>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
)

const Answer = models.Answer || model('Answer', AnswerSchema)

export default Answer
