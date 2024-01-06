'use server'

import { revalidatePath } from 'next/cache'
import Question from '../models/question.model'
import Tag from '../models/tag.model'
import User from '../models/user.model'
import Answer from '../models/answer.model'
import Interaction from '../models/interaction.model'
import { connectToDatabase } from '../mongoose'
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from './shared.types'

export const getQuestions = async (params: GetQuestionsParams) => {
  try {
    connectToDatabase()

    const questions = await Question.find({})
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .sort({ createdAt: -1 })
    // console.log(questions[0].author)
    return { questions }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getQuestionById = async (params: GetQuestionByIdParams) => {
  try {
    connectToDatabase()

    const question = await Question.findById(params.questionId)
      .populate({ path: 'tags', model: Tag, select: '_id name' })
      .populate({
        path: 'author',
        model: User,
        select: '_id clerkId name picture',
      })

    return question
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const createQuestion = async (params: CreateQuestionParams) => {
  try {
    connectToDatabase()
    const { title, content, tags, author, path } = params

    // Create the question
    const question = await Question.create({
      title,
      content,
      author,
    })

    const tagDocuments = []

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true }
      )

      tagDocuments.push(existingTag._id)
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    })

    // Create an interaction record for the user's ask_question action

    // Increment author's reputation by +5 for creating a question
    revalidatePath(path)
  } catch (error) {
    console.log(error)
  }
}

export const upvoteQuestion = async (params: QuestionVoteParams) => {
  try {
    connectToDatabase()

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    })

    if (!question) {
      throw new Error('Question not found')
    }

    // Increment author's reputation by +10 for upvoting

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const downvoteQuestion = async (params: QuestionVoteParams) => {
  try {
    connectToDatabase()

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    })

    if (!question) {
      throw new Error('Question not found')
    }

    // Increment author's reputation by +10 for upvoting

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const deleteQuestion = async (params: DeleteQuestionParams) => {
  try {
    connectToDatabase()

    const { questionId, path } = params

    await Question.deleteOne({ _id: questionId })
    await Answer.deleteMany({ question: questionId })
    await Interaction.deleteMany({ question: questionId })
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    )

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}
