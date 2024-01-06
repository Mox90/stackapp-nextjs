import { Schema, model, models } from 'mongoose'

export interface IInteraction extends Document {
  user: Schema.Types.ObjectId
  action: string
  question: Schema.Types.ObjectId
  answer: Schema.Types.ObjectId
  tags: Schema.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const InteractionSchema = new Schema<IInteraction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    question: { type: Schema.Types.ObjectId, ref: 'Question' },
    answer: { type: Schema.Types.ObjectId, ref: 'Answer' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  },
  { timestamps: true }
)

const Interaction =
  models.Interaction || model<IInteraction>('Interaction', InteractionSchema)

export default Interaction
