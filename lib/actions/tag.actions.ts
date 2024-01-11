'use server'

import { FilterQuery } from 'mongoose'
import Tag, { ITag } from '../models/tag.model'
import User from '../models/user.model'
import { connectToDatabase } from '../mongoose'
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from './shared.types'
import Question from '../models/question.model'

export const getTopInteractedTags = async (
  params: GetTopInteractedTagsParams
) => {
  try {
    connectToDatabase()

    const { userId } = params

    const user = await User.findById(userId)

    if (!user) throw new Error('User not found')

    // Find interactions for the user and group by tags...
    // Interaction...

    return [
      { _id: '1', name: 'tag1' },
      { _id: '2', name: 'tag2' },
      { _id: '3', name: 'tag3' },
    ]
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getTags = async (params: GetAllTagsParams) => {
  try {
    connectToDatabase()

    const tags = await Tag.find({}).sort({ createdOn: -1 })

    return { tags }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getQuestionByTagId = async (params: GetQuestionsByTagIdParams) => {
  try {
    connectToDatabase()

    const { tagId, page = 1, pageSize = 10, searchQuery } = params

    const tagFilter: FilterQuery<ITag> = { _id: tagId }

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $optins: 'i' } }
        : {},
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    })

    if (!tag) {
      throw new Error('Tag not found')
    }

    const questions = tag.questions

    return { tagTitle: tag.name, questions }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getPopularTags = async () => {
  try {
    connectToDatabase()

    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: '$questions' } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ])

    return { popularTags }
  } catch (error) {
    console.log(error)
    throw error
  }
}
