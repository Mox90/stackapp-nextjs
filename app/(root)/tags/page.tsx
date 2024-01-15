import NoResult from '@/components/NoResult'
import TagCard from '@/components/cards/TagCard'
import Filter from '@/components/shared/Filter'
import LocalSearch from '@/components/shared/search/LocalSearch'
import { TagFilters, UserFilters } from '@/constants/filters'
import { getTags } from '@/lib/actions/tag.actions'
import { SearchParamsProps } from '@/types'
import Link from 'next/link'
import React from 'react'

const Page = async ({ searchParams }: SearchParamsProps) => {
  const result = await getTags({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
  })

  return (
    <>
      <div className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>Tags</h1>
      </div>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearch
          route='/tags'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='Search tag name...'
          otherClasses='flex-1'
        />

        <Filter
          filters={TagFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
        />
      </div>

      <section className='mt-12 flex flex-wrap gap-4'>
        {result.tags.length > 0 ? (
          result.tags.map((tag) => (
            <Link
              href={`/tags/${tag._id}`}
              key={tag._id}
              className='shadow-light100_darknone'
            >
              <article className='background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-[260px]'>
                <div className='background-light800_dark400 w-fit rounded-sm px-5 py-1.5'>
                  <p className='paragraph-semibold text-dark300_light900'>
                    {tag.name}
                  </p>
                </div>

                <p className='small-medium text-dark400_light500 mt-3.5'>
                  <span className='body-semibold primary-text-gradient mr-2.5'>
                    {tag.questions.length}+
                  </span>{' '}
                  Questions
                </p>
              </article>
            </Link>
          ))
        ) : (
          <NoResult
            head='No Tags found'
            body='It looks like there are no tags found.'
            link='/ask-question'
            linkTitle='Ask a question'
          />
        )}
      </section>
    </>
  )
}

export default Page
