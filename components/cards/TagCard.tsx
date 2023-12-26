import Link from 'next/link'

interface Props {
  tag: {
    name: string
    description: string
    questions: []
  }
}

const TagCard = ({ tag }: Props) => {
  return (
    <Link
      href={`/tag/${tag.name}}`}
      className='shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px]'
    >
      <article className='background-light900_dark200 light-border flex w-full flex-col items-center justify-start rounded-2xl border px-4 py-8 sm:w-[260px]'>
        <div className='mt-4 text-center'>
          <div className=' background-light800_dark400 w-fit rounded-sm px-5 py-1.5'>
            <p className=' paragraph-semibold text-dark300_light900'>
              {tag.name}
            </p>
          </div>
          <p className=' small-medium text-dark400_light500 mt-3.5'>
            <span className=' body-semibold primary-text-gradient mr-2.5'>
              {tag.questions.length > 0
                ? tag.questions.length + '+'
                : tag.questions.length + ''}
            </span>
            Questions
          </p>
        </div>
      </article>
    </Link>
  )
}

export default TagCard
