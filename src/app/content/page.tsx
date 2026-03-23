"use client";
import { useTaskStore } from "@/store/task-store";
import { useSyncBlogStatus } from "@/hooks/use-sync";
import { useState, useEffect } from "react";
import { Copy, Check, Pencil, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const POSTS_PER_PAGE = 20;

export default function ContentPage() {
  const days = useTaskStore((s) => s.days);
  const editTask = useTaskStore((s) => s.editTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const rawToggle = useTaskStore((s) => s.toggleTask);
  const syncBlogToggle = useSyncBlogStatus();

  // Blog-aware toggle: if it's a blog post, sync with Blog Manager
  const togglePost = (dayNumber: number, taskId: string, category: string) => {
    if (category === "blog") {
      syncBlogToggle(dayNumber, taskId);
    } else {
      rawToggle(dayNumber, taskId);
    }
  };
  
  const [platform, setPlatform] = useState<"all" | "linkedin" | "twitter" | "blog">("all");
  const [status, setStatus] = useState<"all" | "not_posted" | "posted" | "skipped">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPostUrl, setEditPostUrl] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract all posts
  const posts = days.flatMap((d) =>
    d.tasks
      .filter((t) => t.category === "linkedin" || t.category === "twitter" || t.category === "blog")
      .map((t) => ({ ...t, date: d.date, phase: d.phase }))
  );

  const filtered = posts
    .filter((p) => platform === "all" || p.category === platform)
    .filter((p) => {
      if (status === "all") return true;
      if (status === "posted") return p.completed;
      if (status === "skipped") return p.skipped;
      return !p.completed && !p.skipped;
    });

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [platform, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  
  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [filtered.length, currentPage, totalPages]);

  const paginatedPosts = filtered.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  // Auto-advance logic: if viewing "All", and all items on this page are completed/skipped
  useEffect(() => {
    if (status === "all" && paginatedPosts.length > 0) {
      const allDone = paginatedPosts.every((p) => p.completed || p.skipped);
      if (allDone && currentPage < totalPages) {
        const timer = setTimeout(() => {
          setCurrentPage((prev) => prev + 1);
        }, 1500); // 1.5 second delay before auto-advancing
        return () => clearTimeout(timer);
      }
    }
  }, [paginatedPosts, currentPage, totalPages, status]);

  const copyPost = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (post: typeof posts[0]) => {
    setEditingId(post.id);
    setEditContent(post.postContent || "");
    setEditPostUrl(post.postUrl || "");
  };

  const saveEdit = (dayNumber: number) => {
    if (!editingId) return;
    editTask(dayNumber, editingId, {
      postContent: editContent,
      postUrl: editPostUrl || undefined,
    });
    setEditingId(null);
  };

  const platformColors: Record<string, string> = {
    linkedin: "bg-blue-500/15 text-blue-400",
    twitter: "bg-cyan-500/15 text-cyan-400",
    blog: "bg-purple-500/15 text-purple-400",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">✍️ Content Hub</h1>
      <p className="text-sm text-[#64748B]">Edit your posts before or after publishing. Changes are saved automatically.</p>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded-lg border border-[#2D2D3F] bg-[#14141F]">
            {(["all", "linkedin", "twitter", "blog"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 text-sm transition-all ${platform === p ? "bg-[#6C5CE7] text-white" : "text-[#64748B] hover:text-white"} ${p === "all" ? "rounded-l-lg" : p === "blog" ? "rounded-r-lg" : ""}`}
              >
                {p === "all" ? "All" : p === "linkedin" ? "📝 LinkedIn" : p === "twitter" ? "🐦 Twitter" : "✍️ Blog"}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-[#2D2D3F] bg-[#14141F]">
            {(["all", "not_posted", "posted", "skipped"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-2 text-xs transition-all ${status === s ? "bg-[#6C5CE7] text-white" : "text-[#64748B] hover:text-white"}`}
              >
                {s === "all" ? "All" : s === "not_posted" ? "⬜ Pending" : s === "posted" ? "✅ Posted" : "⏭️ Skipped"}
              </button>
            ))}
          </div>
          <span className="flex items-center text-xs font-semibold text-[#64748B]">{filtered.length} posts</span>
        </div>
      </div>

      {/* Post Cards */}
      <div className="space-y-3">
        {paginatedPosts.length === 0 ? (
          <div className="card text-center py-8 text-[#64748B]">No posts found for these filters.</div>
        ) : (
          paginatedPosts.map((post) => (
            <div key={post.id} className={`card transition-all ${post.completed ? "border-[#00B894]/30 bg-[#0A0A0F]/50" : post.skipped ? "border-[#FDCB6E]/30 bg-[#0A0A0F]/50" : "border-[#2D2D3F]"}`}>
              {/* Edit Mode */}
              {editingId === post.id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`badge ${platformColors[post.category] || ""}`}>
                      {post.category === "linkedin" ? "📝 LinkedIn" : post.category === "twitter" ? "🐦 Twitter" : "✍️ Blog"}
                    </span>
                    <button onClick={() => setEditingId(null)} className="text-[#64748B] hover:text-white"><X className="h-4 w-4" /></button>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748B]">Post Content</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={10}
                      className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] p-3 text-sm text-[#E2E8F0] focus:border-[#6C5CE7] focus:outline-none"
                    />
                    <p className="mt-1 text-[10px] text-[#64748B]">{editContent.length} characters</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#64748B]">Published URL (optional — link to where you posted it)</label>
                    <input
                      value={editPostUrl}
                      onChange={(e) => setEditPostUrl(e.target.value)}
                      placeholder="https://linkedin.com/posts/..."
                      className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]/50 focus:border-[#6C5CE7] focus:outline-none"
                    />
                  </div>
                  <button onClick={() => saveEdit(post.dayNumber)} className="rounded-lg bg-[#00B894] px-4 py-2 text-sm text-white hover:bg-[#00A381]">💾 Save Changes</button>
                </div>
              ) : (
                /* Display Mode */
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`badge ${platformColors[post.category] || ""}`}>
                        {post.category === "linkedin" ? "📝 LinkedIn" : post.category === "twitter" ? "🐦 Twitter" : "✍️ Blog"}
                      </span>
                      <span className="text-xs text-[#64748B]">Day {post.dayNumber}</span>
                      <span className={`badge text-[10px] ${post.completed ? "bg-[#00B894]/15 text-[#00B894]" : post.skipped ? "bg-[#FDCB6E]/15 text-[#FDCB6E]" : "bg-[#2D2D3F] text-[#64748B]"}`}>
                        {post.completed ? "✅ Posted" : post.skipped ? "⏭️ Skipped" : "⬜ Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(post)}
                        className="flex items-center gap-1 rounded-md bg-[#1E1E2E] px-3 py-1.5 text-xs text-[#64748B] transition-all hover:text-[#6C5CE7]"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this post?")) deleteTask(post.dayNumber, post.id); }}
                        className="flex items-center gap-1 rounded-md bg-[#1E1E2E] px-3 py-1.5 text-xs text-[#64748B] transition-all hover:text-[#FF6B6B]"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                      <button
                        onClick={() => copyPost(post.id, post.postContent || "")}
                        className="flex items-center gap-1 rounded-md bg-[#6C5CE7]/15 px-3 py-1.5 text-xs text-[#6C5CE7] transition-all hover:bg-[#6C5CE7]/25"
                      >
                        {copiedId === post.id ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                      </button>
                      <button
                        onClick={() => togglePost(post.dayNumber, post.id, post.category)}
                        className={`rounded-md px-3 py-1.5 text-xs transition-all ${post.completed ? "bg-[#1E1E2E] text-[#64748B] hover:text-white" : "bg-[#00B894]/15 text-[#00B894] hover:bg-[#00B894]/25"}`}
                      >
                        {post.completed ? "Undo" : "✅ Mark Posted"}
                      </button>
                      <button
                        onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                        className="rounded-md bg-[#1E1E2E] px-3 py-1.5 text-xs text-[#64748B] transition-all hover:text-white"
                      >
                        {expandedId === post.id ? "Collapse" : "Preview"}
                      </button>
                    </div>
                  </div>

                  <p className={`mt-2 text-sm ${post.completed || post.skipped ? "text-[#64748B] line-through" : "text-[#E2E8F0]"}`}>{post.title}</p>
                  {post.postUrl && (
                    <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-[#6C5CE7] hover:underline">
                      🔗 {post.postUrl}
                    </a>
                  )}

                  {expandedId === post.id && (
                    <div className="mt-3 rounded-lg bg-[#0A0A0F] p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm text-[#E2E8F0]">{post.postContent || "No content drafted yet. Click 'Edit' to start writing."}</pre>
                      <p className="mt-2 text-[10px] text-[#64748B]">{(post.postContent || "").length} characters</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between card bg-[#14141F]">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 rounded-lg bg-[#2D2D3F] px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3D3D50]"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="text-sm font-medium text-[#64748B]">
            Page <span className="text-white">{currentPage}</span> of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 rounded-lg bg-[#2D2D3F] px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#3D3D50]"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
