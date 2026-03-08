import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, User, Plus, X } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author_name: string;
  category: string;
  created_at: string;
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", excerpt: "", content: "", author_name: "", category: "" });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as BlogPost[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("blog_posts").insert({
      ...formData,
      user_id: user.id,
    });
    if (!error) {
      setShowForm(false);
      setFormData({ title: "", excerpt: "", content: "", author_name: "", category: "" });
      fetchPosts();
    }
    setSubmitting(false);
  };

  return (
    <div className="py-20">
      <div className="editorial-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div className="max-w-3xl">
            <h1 className="editorial-heading mb-4">
              Il <span className="italic text-primary">Blog</span>
            </h1>
            <p className="editorial-body text-muted-foreground">
              Storie, approfondimenti e interviste dal mondo delle realtà artistiche italiane.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              {showForm ? <><X size={16} /> Chiudi</> : <><Plus size={16} /> Nuovo articolo</>}
            </button>
          )}
        </div>

        {/* New post form */}
        {showForm && user && (
          <form onSubmit={handleSubmit} className="mb-12 p-8 rounded-lg bg-card border border-border space-y-4">
            <h2 className="font-display text-xl font-semibold mb-2">Nuovo articolo</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                required
                placeholder="Titolo"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                required
                placeholder="Categoria (es. Tendenze, Interviste)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <input
              required
              placeholder="Nome autore"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              required
              placeholder="Estratto (breve descrizione)"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <textarea
              required
              placeholder="Contenuto dell'articolo..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Pubblicazione..." : "Pubblica"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center py-16 text-muted-foreground font-body">Caricamento articoli...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            Nessun articolo pubblicato ancora.{" "}
            {!user && <span>Accedi per pubblicare il primo!</span>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <article key={post.id} className="group p-8 rounded-lg bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all">
                <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-4">
                  {post.category}
                </span>
                <h2 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="font-body text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                  <span className="flex items-center gap-1"><User size={12} /> {post.author_name}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(post.created_at).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
