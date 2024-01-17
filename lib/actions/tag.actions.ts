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

    const { searchQuery, filter, page = 1, pageSize = 20 } = params

    const query: FilterQuery<typeof Tag> = {}

    const skipAmount = (page - 1) * pageSize

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, 'i') } },
        { description: { $regex: new RegExp(searchQuery, 'i') } },
      ]
    }

    let sortOptions = {}

    switch (filter) {
      case 'popular':
        sortOptions = { questions: -1 }
        break
      case 'recent':
        sortOptions = { createdOn: -1 }
        break
      case 'name':
        sortOptions = { name: 1 }
        break
      case 'old':
        sortOptions = { createdOn: 1 }
        break
      default:
        break
    }

    const tags = await Tag.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions)

    const totalTags = await Tag.countDocuments(query)

    const isNext = totalTags > skipAmount + tags.length

    return { tags, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const getQuestionByTagId = async (params: GetQuestionsByTagIdParams) => {
  try {
    connectToDatabase()

    const { tagId, page = 1, pageSize = 20, searchQuery } = params

    const skipAmount = (page - 1) * pageSize

    const tagFilter: FilterQuery<ITag> = { _id: tagId }

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: 'i' } }
        : {},
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize + 1, // +1 to check if there is next page
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    })

    const isNext = tag.questions.length > pageSize

    if (!tag) {
      throw new Error('Tag not found')
    }

    const questions = tag.questions

    return { tagTitle: tag.name, questions, isNext }
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
