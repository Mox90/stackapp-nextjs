import { Schema, model, models } from 'mongoose'

export interface IQuestion extends Document {
  title: string
  content: string
  tags: Schema.Types.ObjectId[]
  views: number
  upvotes: Schema.Types.ObjectId[]
  downvotes: Schema.Types.ObjectId[]
  author: Schema.Types.ObjectId
  answers: Schema.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true, minlength: 5, maxlength: 130 },
    content: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }], // Assuming there is a Tag model
    views: { type: Number, default: 0 },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Assuming there is a User model
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Assuming there is a User model
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming there is a User model
    answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }], // Assuming there is an Answer model
  },
  { timestamps: true } // This option adds createdAt and updatedAt fields
)

const Question = models.Question || model<IQuestion>('Question', QuestionSchema)

export default Question
