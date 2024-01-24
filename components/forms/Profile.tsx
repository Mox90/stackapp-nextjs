'use client'

import { UserSchema } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import Image from 'next/image'
import { Textarea } from '../ui/textarea'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { updateUser } from '@/lib/actions/user.actions'
import { toast } from '../ui/use-toast'
import { cn } from '@/lib/utils'

interface Props {
  clerkId: string
  user?: string
}

const Profile = ({ clerkId, user }: Props) => {
  const parsedUser = JSON.parse(user || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      username: parsedUser.username || '',
      portfolioWebsite: parsedUser.portfolioWebsite || '',
      locations: parsedUser.locations || '',
      bio: parsedUser.bio || '',
    },
  })

  async function onSubmit(values: z.infer<typeof UserSchema>) {
    setIsSubmitting(true)
    try {
      // UpdateUser
      await updateUser({
        clerkId,
        updateData: {
          name: values.name,
          username: values.username,
          portfolioWebsite: values.portfolioWebsite,
          locations: values.locations,
          bio: values.bio,
        },
        path: pathname,
      })

      router.back()

      return toast({
        className: cn(
          'top-0 right-0 flex bg-slate-100 text-slate-900 dark:bg-slate-600'
        ),
        title: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='mt-9 flex w-full flex-col'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem className='space-y-3.5'>
              <FormLabel className='text-dark300_light900'>
                Name <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className='no-focus paragraph-regular light-border-2 background-light700_dark300 text-dark300_light900 min-h-[56px] border'
                  placeholder='Your name'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem className='space-y-3.5'>
              <FormLabel className='text-dark300_light900'>
                Username <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className='no-focus paragraph-regular light-border-2 background-light700_dark300 text-dark300_light900 min-h-[56px] border'
                  placeholder='Your username'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='portfolioWebsite'
          render={({ field }) => (
            <FormItem className='space-y-3.5'>
              <FormLabel className='text-dark300_light900'>
                Porfolio Link
              </FormLabel>
              <FormControl>
                <Input
                  type='url'
                  className='no-focus paragraph-regular light-border-2 background-light700_dark300 text-dark300_light900 min-h-[56px] border'
                  placeholder='Your portfolio URL'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='locations'
          render={({ field }) => (
            <FormItem className='space-y-3.5'>
              <FormLabel className='text-dark300_light900'>Location</FormLabel>
              <FormControl>
                <Input
                  className='no-focus paragraph-regular light-border-2 background-light700_dark300 text-dark300_light900 min-h-[56px] border'
                  placeholder='Where are you from?'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem className='space-y-3.5'>
              <FormLabel className='text-dark300_light900'>Bio</FormLabel>
              <FormControl>
                <Textarea
                  className='no-focus paragraph-regular light-border-2 background-light700_dark300 text-dark300_light900 min-h-[56px] border'
                  placeholder="What's special about your?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='mt-7 flex justify-end'>
          <Button
            type='submit'
            className='primary-gradient text-dark300_light900 w-fit'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default Profile
