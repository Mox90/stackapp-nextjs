import { z } from 'zod'

export const QuestionsSchema = z.object({
  title: z
    .string()
    .min(5, {
      message: 'Title must contain at least 5 character',
    })
    .max(130),
  explanation: z.string().min(100),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
})

export const AnswerSchema = z.object({
  answer: z.string().min(100),
})

export const UserSchema = z.object({
  name: z.string().min(3, {
    message: 'Name must contain at least 3 character',
  }),
  email: z.string().min(5, {
    message: 'Email must contain atleast 5 character',
  }),
  username: z.string().min(3, {
    message: 'Username must contain 3 character',
  }),
  portfolioWebsite: z.string().url().optional(),
  locations: z.string().optional(),
  bio: z.string().optional(),
})
