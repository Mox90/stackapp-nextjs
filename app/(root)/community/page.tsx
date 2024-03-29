import UserCard from '@/components/cards/UserCard'
import Filter from '@/components/shared/Filter'
import Pagination from '@/components/shared/Pagination'
import LocalSearch from '@/components/shared/search/LocalSearch'
import { UserFilters } from '@/constants/filters'
import { getUsers } from '@/lib/actions/user.actions'
import { SearchParamsProps } from '@/types'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DevFlow | Community',
  description:
    'A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more. ',
  icons: {
    icon: '/assets/images/site-logo.svg',
  },
}

const Page = async ({ searchParams }: SearchParamsProps) => {
  // const [users, setUsers] = useState([])
  const result = await getUsers({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: searchParams.page ? +searchParams.page : 1,
  })

  return (
    <>
      <div className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>All Users</h1>
      </div>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearch
          route='/community'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='Search amazing minds here'
          otherClasses='flex-1'
        />

        <Filter
          filters={UserFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
        />
      </div>

      <section className='mt-12 flex flex-wrap gap-4'>
        {result.users.length > 0 ? (
          result.users.map((user) => (
            <UserCard key={user.clerkId} user={user} />
          ))
        ) : (
          <div className='paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center'>
            <p>No users list</p>
            <Link href={'/sig-up'} className='mt-2 font-bold text-accent-blue'>
              Join to be the first!
            </Link>
          </div>
        )}
      </section>

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
