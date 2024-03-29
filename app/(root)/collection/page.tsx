import NoResult from '@/components/NoResult'
import QuestionCard from '@/components/cards/QuestionCard'
import Filter from '@/components/shared/Filter'
import Pagination from '@/components/shared/Pagination'
import LocalSearch from '@/components/shared/search/LocalSearch'
import { QuestionFilters } from '@/constants/filters'
import { getAllSavedQuestions } from '@/lib/actions/user.actions'
import { SearchParamsProps } from '@/types'
import { auth } from '@clerk/nextjs'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'DevFlow | Collection',
  description:
    'A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more. ',
  icons: {
    icon: '/assets/images/site-logo.svg',
  },
}

const Home = async ({ searchParams }: SearchParamsProps) => {
  const { userId } = auth()

  if (!userId) return null

  const result = await getAllSavedQuestions({
    clerkId: userId,
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  })

  return (
    <>
      <div className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>Save Questions</h1>
      </div>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearch
          route='/collection'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='Search for questions'
          otherClasses='flex-1'
        />
        <Filter
          filters={QuestionFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
        />
      </div>

      <div className='mt-10 flex w-full flex-col gap-6'>
        {result.questions.length > 0 ? (
          result.questions.map((question: any) => {
            return (
              <QuestionCard
                key={question._id}
                _id={question._id}
                title={question.title}
                tags={question.tags}
                author={question.author}
                upvotes={question.upvotes}
                views={question.views}
                answers={question.answers}
                createdAt={question.createdAt}
              />
            )
          })
        ) : (
          <NoResult
            head="There's no saved questions to show"
            body='Be the first to break silence! Ask a Question and kickstart the
        discussion. Our query could be the big thing others learn from. Get
        involved!'
            link='/ask-question'
            linkTitle='Ask a Question'
          />
        )}
      </div>

      <div className='mt-5'>
        <Pagination
          pageNumber={searchParams?.page ? +searchParams?.page : 1}
          isNext={result.isNext}
        />
      </div>
    </>
  )
}

export default Home
