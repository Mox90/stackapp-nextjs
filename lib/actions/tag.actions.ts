'use server'

import Tag from '../models/tag.model'
import User from '../models/user.model'
import { connectToDatabase } from '../mongoose'
import { GetAllTagsParams, GetTopInteractedTagsParams } from './shared.types'

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
