"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { blogPosts } from "@/lib/eswen/data";

export function BlogSection() {
  return (
    <section id="blog" className="relative py-20 sm:py-28 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Blog & Insights"
          title={
            <>
              Guides for <span className="text-eswen-gradient">Beauty, Skin & Wellness</span> in Bali
            </>
          }
          description="Helpful, trusted content for expats, tourists, and locals — in English and Indonesian."
        />

        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {blogPosts.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-eswen-lavender bg-white shadow-eswen-soft hover:shadow-eswen-elevated hover:-translate-y-1 transition-all duration-500"
            >
              <div className="relative h-48 overflow-hidden bg-eswen-light-lavender">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-eswen-deep/20 to-transparent" />
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-eswen-deep">
                  <Tag className="h-3 w-3" />
                  {post.category}
                </span>
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-eswen-deep/80 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  <Globe className="h-3 w-3" />
                  {post.language}
                </span>
              </div>

              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                  <span>{post.date}</span>
                  <span className="h-1 w-1 rounded-full bg-eswen-lavender-soft" />
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-base font-bold text-eswen-deep leading-snug group-hover:text-eswen-soft-purple transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <button
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-eswen-deep hover:text-eswen-soft-purple transition-colors self-start"
                  aria-label={`Read more about ${post.title}`}
                >
                  Read Article
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            className="rounded-full border-eswen-lavender-soft text-eswen-deep bg-white hover:bg-eswen-light-lavender hover:border-eswen-soft-purple h-11 px-6 text-sm font-semibold"
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
