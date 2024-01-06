import mongoose from 'mongoose'

let isConnected: boolean = false

export const connectToDatabase = async () => {
  mongoose.set('strictQuery', true)

  if (!process.env.MONGODB_URI) return console.log('Missing MONGODB_URL')

  if (isConnected) return

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'DevOflowDb',
    })
    isConnected = true

    console.log('MongoDB is successfully connected')
  } catch (error) {
    console.log('MongoDB connection failed. ', error)
  }
}
