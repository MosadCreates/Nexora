'use client'

import React from 'react'
import Link from 'next/link'
import { BackgroundBeams } from './ui/aceternity/background-beams'
import { blogPosts } from '@/data/blogData'

export function Blog () {
  return (
    <div className='min-h-screen bg-white dark:bg-black pt-20 relative'>
      <BackgroundBeams className='absolute inset-0 z-0' />
      <div className='relative z-10'>
        {/* Hero Section */}
        <div className='relative w-full pt-10 md:pt-20 pb-0'>
          <div className='max-w-7xl mx-auto px-4 flex flex-col items-center justify-between pb-10'>
            <div className='max-w-5xl mx-auto text-center'>
              <h1 className='tracking-tight font-medium text-black dark:text-white text-3xl md:text-5xl md:leading-tight'>
                Blog
              </h1>
              <h2 className='text-sm md:text-base max-w-4xl my-4 mx-auto text-muted font-normal dark:text-neutral-400 text-center'>
                Discover insightful resources and expert advice from our
                seasoned team to elevate your knowledge.
              </h2>
            </div>
          </div>
        </div>

        <div className='max-w-7xl mx-auto px-4 pb-20'>
          {/* Featured Posts Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-10 w-full mb-10'>
            {blogPosts
              .filter(post => post.featured)
              .map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
          </div>

          {/* Secondary Posts Grid */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-10 w-full'>
            {blogPosts
              .filter(post => !post.featured)
              .map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BlogCard ({ post }: { post: typeof blogPosts[0] }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className='shadow-derek rounded-3xl border border-neutral-100 dark:border-neutral-800 w-full bg-white dark:bg-neutral-900 overflow-hidden hover:scale-[1.02] transition duration-200 block'
    >
      <img
        alt={post.title}
        loading='lazy'
        width='800'
        height='800'
        className='transition duration-300 transform blur-0 scale-100 h-72 object-cover object-top w-full'
        src={post.image}
      />
      <div className='p-4 md:p-8 bg-white dark:bg-neutral-900'>
        <div className='flex space-x-2 items-center mb-2'>
          <img
            alt={post.author}
            loading='lazy'
            width='20'
            height='20'
            className='rounded-full h-5 w-5'
            src={post.authorImage}
          />
          <p className='text-sm font-normal text-muted dark:text-neutral-400'>
            {post.author}
          </p>
        </div>
        <p className='text-lg font-bold mb-4 text-black dark:text-white'>
          {post.title}
        </p>
        <p className='text-left text-sm mt-2 text-muted dark:text-neutral-500'>
          {post.description}
        </p>
      </div>
    </Link>
  )
}
