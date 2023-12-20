'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import HomeFilters from '../home/HomeFilters'

interface Props {
  filters: {
    name: string
    value: string
  }[]
  otherClasses?: string
  containerClasses?: string
}

const Filter = ({ filters, otherClasses, containerClasses }: Props) => {
  return (
    <>
      <div className={`relative mt-5 ${containerClasses}`}>
        <Select>
          <SelectTrigger
            className={`${otherClasses} body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5`}
          >
            <div className='line-clamp-1 flex-1 text-left'>
              <SelectValue placeholder='Select a Filter' />
            </div>
          </SelectTrigger>
          <SelectContent className=' bg-white dark:bg-gray-800 dark:text-white'>
            <SelectGroup>
              {filters.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <HomeFilters />
    </>
  )
}

export default Filter
