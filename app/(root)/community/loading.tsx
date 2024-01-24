import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

const Loading = () => {
  return (
    <section>
      <div className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>All Users</h1>
      </div>

      <div className='mb-12 mt-11 flex flex-wrap gap-4'>
        <Skeleton className='h-14 flex-1' />
        <Skeleton className='h-14 w-28' />
      </div>

      <div className='flex flex-wrap gap-4'>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <Skeleton key={item} className='sm:[260px] h-60 w-full rounded-2xl' />
        ))}
      </div>
    </section>
  )
}

export default Loading
