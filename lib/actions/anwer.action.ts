'use server'

import { revalidatePath } from 'next/cache'
import Answer from '../models/answer.model'
import Tag from '../models/tag.model'
import User from '../models/user.model'
import { connectToDatabase } from '../mongoose'
import { CreateAnswerParams, GetAnswersParams } from './shared.types'
import Question from '../models/question.model'

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
