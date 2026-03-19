'use client'

import React, { useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { blogPosts } from '@/data/blogData'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import DOMPurify from 'dompurify'

const BlogPost: React.FC = () => {
  const params = useParams()
  const slug = params?.slug as string
  const post = blogPosts.find(p => p.slug === slug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // Fix #8 (Audit 2): Sanitize blog post HTML content with DOMPurify
  const sanitizedContent = useMemo(() => {
    if (!post) return ''
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(post.content, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'ul', 'ol', 'li',
          'strong', 'em', 'b', 'i', 'u',
          'a', 'blockquote', 'code', 'pre',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      })
    }
    return post.content
  }, [post])

  if (!post) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-white dark:bg-black'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-4'>
            Post Not Found
          </h1>
          <Link href='/blog' className='text-blue-500 hover:underline'>
            Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-white dark:bg-black'>
      <div className='max-w-7xl mx-auto px-4 mt-16 lg:mt-32'>
        {/* Navigation & Author */}
        <div className='flex justify-between items-center px-2 py-8'>
          <Link href='/blog' className='flex space-x-2 items-center group'>
            <ArrowLeft className='w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:-translate-x-1 transition-transform' />
            <span className='text-sm text-neutral-500 dark:text-neutral-400'>
              Back
            </span>
          </Link>

          <div className='flex space-x-4 items-center'>
            <div className='flex space-x-2 items-center'>
              <img
                alt={post.author}
                loading='lazy'
                width='20'
                height='20'
                className='rounded-full h-5 w-5'
                src={post.authorImage}
              />
              <p className='text-sm font-normal text-neutral-600 dark:text-neutral-400'>
                {post.author}
              </p>
            </div>
            <div className='h-5 rounded-lg w-0.5 bg-neutral-200 dark:bg-neutral-700' />
            <time className='flex items-center text-sm text-neutral-500 dark:text-neutral-400'>
              {post.date}
            </time>
          </div>
        </div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='max-w-4xl mx-auto'
        >
          <img
            alt={post.title}
            loading='lazy'
            className='h-60 md:h-[500px] w-full object-cover rounded-3xl'
            src={post.image}
          />
        </motion.div>

        {/* Content */}
        <div className='xl:relative'>
          <div className='mx-auto max-w-2xl'>
            <article className='pb-8'>
              <header className='flex flex-col'>
                <h1 className='mt-8 text-4xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200 sm:text-5xl'>
                  {post.title}
                </h1>
              </header>

              {/* Fix #8 (Audit 2): Content sanitized with DOMPurify */}
              <div
                className='mt-8 prose prose-lg dark:prose-invert prose-neutral max-w-none'
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPost
