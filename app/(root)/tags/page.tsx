import NoResult from '@/components/NoResult'
import TagCard from '@/components/cards/TagCard'
import Filter from '@/components/shared/Filter'
import LocalSearch from '@/components/shared/search/LocalSearch'
import { TagFilters, UserFilters } from '@/constants/filters'
import { getTags } from '@/lib/actions/tag.actions'
import React from 'react'

const Page = async () => {
  const result = await getTags({})

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
          result.tags.map((tag) => <TagCard key={tag.clerkId} tag={tag} />)
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
