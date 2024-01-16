'use client'

import { formUrlQuery } from '@/lib/utils'
import { Button } from '../ui/button'
import { useSearchParams, useRouter } from 'next/navigation'

interface Props {
  pageNumber: number
  isNext: boolean
}

const Pagination = ({ pageNumber, isNext }: Props) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleNavigation = (direction: string) => {
    const nextPageNumber = direction === 'prev' ? pageNumber-- : pageNumber++

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: 'page',
      value: nextPageNumber.toString(),
    })

    router.push(newUrl)
  }

  return (
    <div className='flex flex-row justify-end gap-2'>
      <Button
        className='light-border-2 btn flex min-h-[36px] items-center border'
        disabled={pageNumber === 1}
        onClick={() => handleNavigation('prev')}
      >
        <p className='body-medium text-dark200_light800'>Prev</p>
      </Button>
      <div className='flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2'>
        <p className='body-semibold text-light-900'>{pageNumber}</p>
      </div>
      <Button
        className='light-border-2 btn flex min-h-[36px] items-center border'
        disabled={!isNext}
        onClick={() => handleNavigation('next')}
      >
        <p className='body-medium text-dark200_light800'>Next</p>
      </Button>
    </div>
  )
}

export default Pagination
