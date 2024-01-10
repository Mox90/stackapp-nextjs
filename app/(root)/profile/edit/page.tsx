import Profile from '@/components/forms/Profile'
import { getUserById } from '@/lib/actions/user.actions'
import { auth } from '@clerk/nextjs'
import React from 'react'

const Page = async () => {
  const { userId } = auth()

  if (!userId) return null
  const mongoUser = await getUserById({ userId })

  // console.log('User ID: ', userId)
  // const result = ''

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>Edit Profile</h1>

      <div className='mt-9'>
        <Profile clerkId={userId} user={JSON.stringify(mongoUser)} />
      </div>
    </>
  )
}

export default Page
