'use server'

import { revalidatePath } from 'next/cache'
import Answer from '../models/answer.model'
import User from '../models/user.model'
import { connectToDatabase } from '../mongoose'
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from './shared.types'
import Question from '../models/question.model'
import Interaction from '../models/interaction.model'

export const getAnswers = async (params: GetAnswersParams) => {
  try {
    connectToDatabase()

    const { questionId } = params

    const answers = await Answer.find({ question: questionId })
      .populate({
        path: 'author',
        model: User,
        select: '_id clerkId name picture',
      })
      .sort({ createdAr: -1 })
    // .populate({ path: 'tags', model: Tag, select: '_id name' })

    return { answers }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const createAnswer = async (params: CreateAnswerParams) => {
  try {
    connectToDatabase()

    const { content, author, question, path } = params

    const newAnswer = await Answer.create({ content, author, question })

    // Add the answer to the question's answers array
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    })

    // TODO: Add interaction...

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const upvoteAnswer = async (params: AnswerVoteParams) => {
  try {
    connectToDatabase()

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params

    let updateQuery = {}

    if (hasupVoted) {
      updateQuery = { $pull: { upvotes: userId } }
    } else if (hasdownVoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      }
    } else {
      updateQuery = { $addToSet: { upvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    })

    if (!answer) {
      throw new Error('Answer not found')
    }

    // Increment author's reputation by +10 for upvoting

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const downvoteAnswer = async (params: AnswerVoteParams) => {
  try {
    connectToDatabase()

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params

    let updateQuery = {}

    if (hasdownVoted) {
      updateQuery = { $pull: { downvotes: userId } }
    } else if (hasupVoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      }
    } else {
      updateQuery = { $addToSet: { downvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    })

    if (!answer) {
      throw new Error('Question not found')
    }

    // Increment author's reputation by +10 for upvoting

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const deleteAnswer = async (params: DeleteAnswerParams) => {
  try {
    connectToDatabase()

    const { answerId, path } = params

    const answer = await Answer.findById({ _id: answerId })

    if (!answer) {
      throw new Error('Answer not found')
    }

    await answer.deleteOne({ _id: answerId })
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } }
    )

    await Interaction.deleteMany({ answer: answerId })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}
