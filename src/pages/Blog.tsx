import { blogPosts } from "@/data/mockData";
import { Calendar, User } from "lucide-react";

const Blog = () => (
  <div className="py-20">
    <div className="editorial-container">
      <div className="max-w-3xl mb-12">
        <h1 className="editorial-heading mb-6">
          Il <span className="italic text-primary">Blog</span>
        </h1>
        <p className="editorial-body text-muted-foreground">
          Storie, approfondimenti e interviste dal mondo delle realtà artistiche italiane.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <article key={post.id} className="group p-8 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all">
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
              {post.category}
            </span>
            <h2 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
              <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);

export default Blog;
