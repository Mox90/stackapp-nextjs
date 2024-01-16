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
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from './shared.types'
import { FilterQuery } from 'mongoose'

export const getQuestions = async (params: GetQuestionsParams) => {
  try {
    connectToDatabase()
    const { page = 1, pageSize = 2, searchQuery, filter } = params

    const query: FilterQuery<typeof Question> = {}

    // Calculate the number of posts to skip based on the page number and page size
    const skipAmount = (page - 1) * pageSize

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, 'i') } },
        { content: { $regex: new RegExp(searchQuery, 'i') } },
      ]
    }

    let sortOptions = {}

    switch (filter) {
      case 'newest':
        sortOptions = { createdAt: -1 }
        break
      case 'recommended':
        sortOptions = { views: -1 }
        break
      case 'frequent':
        sortOptions = { views: -1 }
        break
      case 'unanswered':
        query.answers = { $size: 0 }
        break
      default:
        break
    }

    const questions = await Question.find(query)
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions)

    const totalQuestions = await Question.countDocuments(query)

    const isNext = totalQuestions > skipAmount + questions.length

    // console.log(questions[0].author)
    return { questions, isNext }
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

export const editQuestion = async (params: EditQuestionParams) => {
  try {
    connectToDatabase()

    const { questionId, title, content, path } = params

    const question = await Question.findById(questionId).populate('tags')

    if (!question) {
      throw new Error('Question not found')
    }

    question.title = title
    question.content = content

    await question.save()

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getHotQuestions = async () => {
  try {
    connectToDatabase()

    const hotQuestions = await Question.find({})
      .sort({ views: -1, upvotes: -1 })
      .limit(5)

    return { hotQuestions }
  } catch (error) {
    console.log(error)
    throw error
  }
}
