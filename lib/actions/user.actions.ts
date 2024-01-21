'use server'

import { FilterQuery } from 'mongoose'
import { revalidatePath } from 'next/cache'
import User from '../models/user.model'
import { connectToDatabase } from '../mongoose'
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from './shared.types'
import Question from '../models/question.model'
import Tag from '../models/tag.model'
import Answer from '../models/answer.model'
import { BadgeCriteriaType } from '@/types'
import { assigneBadges } from '../utils'

export const getUserById = async (params: any) => {
  try {
    connectToDatabase()

    const { userId } = params
    const user = await User.findOne({ clerkId: userId })

    return user
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getUsers = async (params: GetAllUsersParams) => {
  try {
    connectToDatabase()

    const { page = 1, pageSize = 20, filter, searchQuery } = params

    const query: FilterQuery<typeof User> = {}

    const skipAmount = (page - 1) & pageSize

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, 'i') } },
        { username: { $regex: new RegExp(searchQuery, 'i') } },
        { email: { $regex: new RegExp(searchQuery, 'i') } },
      ]
    }

    let sortOptions = {}

    switch (filter) {
      case 'new_users':
        sortOptions = { joinedAt: -1 }
        break
      case 'old_users':
        sortOptions = { joinedAt: 1 }
        break
      case 'top_contributors':
        sortOptions = { reputation: -1 }
        break
      default:
        break
    }

    const users = await User.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions)

    const totalUsers = await User.countDocuments(query)

    const isNext = totalUsers > skipAmount + users.length

    return { users, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const createUser = async (userData: CreateUserParams) => {
  try {
    connectToDatabase()

    const newUser = await User.create(userData)

    return newUser
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const updateUser = async (params: UpdateUserParams) => {
  try {
    connectToDatabase()

    const { clerkId, updateData, path } = params

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const deleteUser = async (params: DeleteUserParams) => {
  try {
    connectToDatabase()

    const { clerkId } = params

    const user = await User.findOneAndDelete({ clerkId })

    if (!user) {
      throw new Error('User not found!')
    }

    // Delete everything attached to this particular user (comments, answers, etc)

    // get user questions ids
    // const userQuestionIds = await Question.find({ author: user._id }).distinct(
    //   '_id'
    // )

    // delete user questions
    await Question.deleteMany({ author: user._id })

    // TODO: delete user answers, comments, etc.

    const deletedUser = await User.findByIdAndDelete(user._id)

    return deletedUser
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const toggleSaveQuestion = async (params: ToggleSaveQuestionParams) => {
  try {
    connectToDatabase()

    const { userId, questionId, path } = params

    const user = await User.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    const isQuestionSaved = user.saved.includes(questionId)

    if (isQuestionSaved) {
      // remove question from saved
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true }
      )
    } else {
      // add question to saved
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true }
      )
    }

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getAllSavedQuestions = async (params: GetSavedQuestionsParams) => {
  try {
    connectToDatabase()

    const { clerkId, page = 1, pageSize = 20, filter, searchQuery } = params

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, 'i') } }
      : {}

    const skipAmount = (page - 1) * pageSize

    let sortOptions = {}

    switch (filter) {
      case 'most_recent':
        sortOptions = { createdAt: -1 }
        break
      case 'oldest':
        sortOptions = { createdAt: 1 }
        break
      case 'most_voted':
        sortOptions = { upvotes: -1 }
        break
      case 'most_viewed':
        sortOptions = { views: -1 }
        break
      case 'most_answered':
        sortOptions = { answers: -1 }
        break
      default:
        break
    }

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    })

    const isNext = user.saved.length > pageSize

    if (!user) {
      throw new Error('User not found')
    }

    const savedQuestions = user.saved

    return { questions: savedQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getUserInfo = async (params: GetUserByIdParams) => {
  try {
    connectToDatabase()

    const { userId } = params

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      throw new Error('User not found')
    }

    const totalQuestions = await Question.countDocuments({ author: user._id })
    const totalAnswers = await Answer.countDocuments({ author: user._id })

    const [questionUpvotes] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: '$upvotes' },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: '$upvotes' },
        },
      },
    ])

    const [answerUpvotes] = await Answer.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: '$upvotes' },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: '$upvotes' },
        },
      },
    ])

    const [questionViews] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$upvotes' },
        },
      },
    ])

    const criteria = [
      { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
      { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
      {
        type: 'QUESTION_UPVOTES' as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'ANSWER_UPVOTES' as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: 'TOTAL_VIEWS' as BadgeCriteriaType,
        count: questionViews?.totalViews || 0,
      },
    ]

    const badgeCounts = assigneBadges({ criteria })

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    }
  } catch (error) {}
}

export const getUserQuestions = async (params: GetUserStatsParams) => {
  try {
    connectToDatabase()

    const { userId, page = 1, pageSize = 20 } = params

    const skipAmount = (page - 1) * pageSize

    const totalQuestions = await Question.countDocuments({ author: userId })

    const userQuestions = await Question.find({ author: userId })
      .sort({
        createdAt: -1,
        views: -1,
        upvotes: -1,
      })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('tags', '_id name')
      .populate('author', 'Id clerkId name picture')

    const isNext = totalQuestions > skipAmount + userQuestions.length

    return { totalQuestions, questions: userQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}
export const getUserAnswers = async (params: GetUserStatsParams) => {
  try {
    connectToDatabase()

    const { userId, page = 1, pageSize = 20 } = params

    const skipAmount = (page - 1) * pageSize

    const totalAnswers = await Answer.countDocuments({ author: userId })

    const userAnswers = await Answer.find({ author: userId })
      .sort({
        upvotes: -1,
      })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('question', '_id title')
      .populate('author', 'Id clerkId name picture')

    const isNext = totalAnswers > skipAmount + userAnswers.length

    return { totalAnswers, answers: userAnswers, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}
