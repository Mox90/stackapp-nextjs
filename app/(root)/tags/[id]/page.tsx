import NoResult from '@/components/NoResult'
import QuestionCard from '@/components/cards/QuestionCard'
import Pagination from '@/components/shared/Pagination'
import LocalSearch from '@/components/shared/search/LocalSearch'
import { getQuestionByTagId } from '@/lib/actions/tag.actions'
import { IQuestion } from '@/lib/models/question.model'
import { URLProps } from '@/types'
import React from 'react'

const Page = async ({ params, searchParams }: URLProps) => {
  const result = await getQuestionByTagId({
    tagId: params.id,
    page: searchParams.page ? +searchParams.page : 1,
    searchQuery: searchParams.q,
  })

  return (
    <>
      <div className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>{result.tagTitle}</h1>
      </div>

      <div className='mt-11 w-full'>
        <LocalSearch
          route={`/tags/${params.id}`}
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='Search tag questions'
          otherClasses='flex-1'
        />
      </div>

      <div className='mt-10 flex w-full flex-col gap-6'>
        {result.questions.length > 0 ? (
          result.questions.map((question: IQuestion) => {
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
            head="There's no tag questions to show"
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

export default Page
