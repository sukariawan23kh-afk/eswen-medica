"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Tag, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { blogPosts } from "@/lib/eswen/data";
import { useLanguage } from "@/lib/eswen/language-store";
import { useT } from "@/lib/eswen/site-config-context";
import { tr } from "@/lib/eswen/i18n";
import type { Lang } from "@/lib/eswen/language-store";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  imageUrl: string;
  language: string;
  readTime: string;
  date: string;
};

export function BlogSection() {
  const { lang } = useLanguage();
  const t = useT();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable string — `tr(lang, ...)` returns a plain string so this effect only
  // re-runs when the language actually changes.
  const notAvail = tr(lang, "blog_desc");

  useEffect(() => {
    // Data-fetching effect: setState in the effect body and async callbacks is
    // a standard, intentional pattern here. The react-hooks/set-state-in-effect
    // rule is overly strict for this case, so it's disabled for this block.
    /* eslint-disable react-hooks/set-state-in-effect */
    let cancelled = false;
    setLoading(true);
    fetch(`/api/articles?lang=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.ok && Array.isArray(data.articles) && data.articles.length > 0) {
          setArticles(data.articles);
        } else {
          // Fallback to static defaults (mapped to the public shape)
          setArticles(
            blogPosts.map((p) => ({
              id: p.slug,
              title: p.title[lang as Lang],
              slug: p.slug,
              excerpt: p.excerpt[lang as Lang],
              category: p.category[lang as Lang],
              imageUrl: p.image,
              language: p.language,
              readTime: p.readTime[lang as Lang],
              date: p.date,
            }))
          );
        }
      })
      .catch(() => {
        if (cancelled) return;
        setArticles(
          blogPosts.map((p) => ({
            id: p.slug,
            title: p.title[lang as Lang],
            slug: p.slug,
            excerpt: p.excerpt[lang as Lang],
            category: p.category[lang as Lang],
            imageUrl: p.image,
            language: p.language,
            readTime: p.readTime[lang as Lang],
            date: p.date,
          }))
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [lang, notAvail]);

  return (
    <section id="blog" className="relative py-20 sm:py-28 bg-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("blog_eyebrow")}
          title={
            <>
              {t("blog_title_1")} <span className="text-eswen-gradient">{t("blog_title_2")}</span>
            </>
          }
          description={t("blog_desc")}
        />

        {loading ? (
          <div className="mt-14 flex items-center justify-center text-muted-foreground text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {lang === "id" ? "Memuat artikel..." : "Loading articles..."}
          </div>
        ) : (
          <div className="mt-14 grid lg:grid-cols-3 gap-6">
            {(articles ?? []).map((post, idx) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-eswen-lavender bg-white shadow-eswen-soft hover:shadow-eswen-elevated hover:-translate-y-1 transition-all duration-500"
              >
                <div className="relative h-48 overflow-hidden bg-eswen-light-lavender">
                  <img
                    src={post.imageUrl || "/images/blog-1.png"}
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
                    {post.language.toUpperCase()}
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
                    aria-label={`${t("blog_read")} - ${post.title}`}
                  >
                    {t("blog_read")}
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            className="rounded-full border-eswen-lavender-soft text-eswen-deep bg-white hover:bg-eswen-light-lavender hover:border-eswen-soft-purple h-11 px-6 text-sm font-semibold"
          >
            {t("blog_view_all")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
