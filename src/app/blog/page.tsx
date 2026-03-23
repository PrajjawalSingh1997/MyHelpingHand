"use client";
import { useBlogStore } from "@/store/stores";
import { useSyncBlogToTask } from "@/hooks/use-sync";
import { BlogStatus, BlogPlatform } from "@/lib/types";
import { useState } from "react";
import { Pencil, X, ExternalLink, Clock, Hash, FileText, Plus, Eye } from "lucide-react";

const statusColors: Record<BlogStatus, string> = {
  to_write: "bg-[#FF6B6B]/15 text-[#FF6B6B]",
  in_progress: "bg-[#FDCB6E]/15 text-[#FDCB6E]",
  published: "bg-[#00B894]/15 text-[#00B894]",
};

const statusLabels: Record<BlogStatus, string> = {
  to_write: "To Write",
  in_progress: "In Progress",
  published: "Published",
};

const platformInfo: Record<BlogPlatform, { label: string; color: string; url: string }> = {
  hashnode: { label: "Hashnode", color: "bg-blue-600/15 text-blue-400", url: "https://hashnode.com" },
  "dev.to": { label: "DEV.to", color: "bg-gray-600/15 text-gray-300", url: "https://dev.to" },
  medium: { label: "Medium", color: "bg-green-600/15 text-green-400", url: "https://medium.com" },
  personal: { label: "Portfolio Blog", color: "bg-pink-500/15 text-pink-400", url: "" },
  linkedin: { label: "LinkedIn Article", color: "bg-blue-500/15 text-blue-400", url: "https://linkedin.com" },
  other: { label: "Other", color: "bg-gray-500/15 text-gray-400", url: "" },
};

const suggestedTags: string[] = [
  "webdev", "javascript", "react", "nextjs", "typescript", "nodejs",
  "css", "beginners", "tutorial", "career", "freelancing", "portfolio",
  "backend", "frontend", "prisma", "database", "api", "testing",
];

const columns: BlogStatus[] = ["to_write", "in_progress", "published"];
const columnLabels = { to_write: "📝 To Write", in_progress: "✏️ In Progress", published: "✅ Published" };

export default function BlogPage() {
  const blogs = useBlogStore((s) => s.blogs);
  const updateBlog = useBlogStore((s) => s.updateBlog);
  const updateBlogWithSync = useSyncBlogToTask();
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPlatform, setEditPlatform] = useState<BlogPlatform>("hashnode");
  const [editUrl, setEditUrl] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTimeSpent, setEditTimeSpent] = useState(0);
  const [tagInput, setTagInput] = useState("");

  const startEditing = (blogId: string) => {
    const blog = blogs.find((b) => b.id === blogId);
    if (!blog) return;
    setEditingId(blogId);
    setEditTitle(blog.title);
    setEditNotes(blog.notes || "");
    setEditContent(blog.content || "");
    setEditPlatform(blog.platform || "hashnode");
    setEditUrl(blog.publishedUrl || "");
    setEditTags(blog.tags || []);
    setEditTimeSpent(blog.timeSpent || 0);
    setTagInput("");
  };

  const saveEdit = () => {
    if (!editingId) return;
    const wordCount = editContent.trim().split(/\s+/).filter(Boolean).length;
    updateBlog(editingId, {
      title: editTitle,
      notes: editNotes,
      content: editContent,
      platform: editPlatform,
      publishedUrl: editUrl || undefined,
      tags: editTags,
      timeSpent: editTimeSpent,
      wordCount,
    });
    setEditingId(null);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !editTags.includes(tag.trim().toLowerCase())) {
      setEditTags([...editTags, tag.trim().toLowerCase()]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => setEditTags(editTags.filter((t) => t !== tag));

  const nextStatus = (s: BlogStatus): BlogStatus => {
    if (s === "to_write") return "in_progress";
    if (s === "in_progress") return "published";
    return "to_write";
  };

  // Stats
  const published = blogs.filter((b) => b.status === "published").length;
  const totalWords = blogs.reduce((s, b) => s + (b.wordCount || 0), 0);
  const totalTime = blogs.reduce((s, b) => s + (b.timeSpent || 0), 0);
  const withUrls = blogs.filter((b) => b.publishedUrl).length;

  // Edit Modal
  const editingBlog = blogs.find((b) => b.id === editingId);
  const previewBlog = blogs.find((b) => b.id === previewId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📝 Blog Manager</h1>
          <p className="text-sm text-[#64748B]">
            {published}/{blogs.length} published
            <span className="ml-2 text-[10px] text-[#6C5CE7]">• Synced with Today View</span>
          </p>
        </div>
        <div className="flex rounded-lg border border-[#2D2D3F] bg-[#14141F]">
          <button onClick={() => setView("kanban")} className={`px-3 py-1.5 text-xs ${view === "kanban" ? "bg-[#6C5CE7] text-white" : "text-[#64748B]"} rounded-l-lg`}>Kanban</button>
          <button onClick={() => setView("list")} className={`px-3 py-1.5 text-xs ${view === "list" ? "bg-[#6C5CE7] text-white" : "text-[#64748B]"} rounded-r-lg`}>List</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#00B894]">{published}</p>
          <p className="text-xs text-[#64748B]">Published</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{totalWords.toLocaleString()}</p>
          <p className="text-xs text-[#64748B]">Total Words</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#6C5CE7]">{totalTime}h</p>
          <p className="text-xs text-[#64748B]">Time Writing</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#FDCB6E]">{withUrls}</p>
          <p className="text-xs text-[#64748B]">With URLs</p>
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && editingBlog && (
        <div className="card border-[#6C5CE7]/30">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#E2E8F0]">✏️ Editing Blog #{editingBlog.number}</h3>
            <button onClick={() => setEditingId(null)} className="text-[#64748B] hover:text-white"><X className="h-4 w-4" /></button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-[10px] text-[#64748B]">Blog Title</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#6C5CE7] focus:outline-none" />
            </div>

            {/* Platform + Status + Time */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-[#64748B]">Platform</label>
                <select value={editPlatform} onChange={(e) => setEditPlatform(e.target.value as BlogPlatform)} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white">
                  <option value="hashnode">🔵 Hashnode</option>
                  <option value="dev.to">⬛ DEV.to</option>
                  <option value="medium">🟢 Medium</option>
                  <option value="personal">🎨 Portfolio Blog</option>
                  <option value="linkedin">📝 LinkedIn Article</option>
                  <option value="other">📌 Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#64748B]">Status</label>
                <select
                  value={editingBlog.status}
                  onChange={(e) => updateBlogWithSync(editingBlog.id, editingBlog.scheduledDay, e.target.value as BlogStatus)}
                  className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white"
                >
                  <option value="to_write">📝 To Write</option>
                  <option value="in_progress">✏️ In Progress</option>
                  <option value="published">✅ Published</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-[#64748B]">Time Spent (hours)</label>
                <input type="number" min={0} step={0.5} value={editTimeSpent} onChange={(e) => setEditTimeSpent(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#6C5CE7] focus:outline-none" />
              </div>
            </div>

            {/* Published URL */}
            <div>
              <label className="text-[10px] text-[#64748B]">Published URL</label>
              <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="https://blog.hashnode.dev/your-post" className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]/50 focus:border-[#6C5CE7] focus:outline-none" />
            </div>

            {/* Tags */}
            <div>
              <label className="text-[10px] text-[#64748B]">Tags</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {editTags.map((tag) => (
                  <span key={tag} className="badge flex items-center gap-1 bg-[#6C5CE7]/15 text-[#6C5CE7] text-[10px]">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-[#FF6B6B]"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(tagInput))} placeholder="Add tag..." className="flex-1 rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-1.5 text-xs text-white placeholder:text-[#64748B]/50 focus:border-[#6C5CE7] focus:outline-none" />
                <button onClick={() => addTag(tagInput)} className="rounded-lg bg-[#1E1E2E] px-3 py-1.5 text-xs text-[#64748B] hover:text-white"><Plus className="h-3 w-3" /></button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestedTags.filter((t) => !editTags.includes(t)).slice(0, 12).map((tag) => (
                  <button key={tag} onClick={() => addTag(tag)} className="badge bg-[#1E1E2E] text-[10px] text-[#64748B] hover:bg-[#2D2D3F] hover:text-white">
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] text-[#64748B]">Notes / Outline</label>
              <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} placeholder="Key points, outline, or research notes..." className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] p-3 text-sm text-[#E2E8F0] placeholder:text-[#64748B]/50 focus:border-[#6C5CE7] focus:outline-none" />
            </div>

            {/* Content / Draft */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-[#64748B]">Blog Content / Draft</label>
                <span className="text-[10px] text-[#64748B]">{editContent.trim().split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={10} placeholder="Write your blog post here... (supports markdown)" className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] p-3 font-mono text-sm text-[#E2E8F0] placeholder:text-[#64748B]/50 focus:border-[#6C5CE7] focus:outline-none" />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={saveEdit} className="rounded-lg bg-[#00B894] px-4 py-2 text-sm text-white hover:bg-[#00A381]">💾 Save Changes</button>
              <button onClick={() => setEditingId(null)} className="rounded-lg bg-[#2D2D3F] px-4 py-2 text-sm text-[#64748B] hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewId && previewBlog && (
        <div className="card border-[#6C5CE7]/20">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#E2E8F0]">👁️ Preview: {previewBlog.title}</h3>
            <button onClick={() => setPreviewId(null)} className="text-[#64748B] hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-[#64748B]">
            {previewBlog.platform && <span className={`badge ${platformInfo[previewBlog.platform]?.color || ""}`}>{platformInfo[previewBlog.platform]?.label}</span>}
            {previewBlog.wordCount && <span>📝 {previewBlog.wordCount} words</span>}
            {previewBlog.timeSpent && <span>⏱️ {previewBlog.timeSpent}h</span>}
            {previewBlog.tags?.map((t) => <span key={t} className="badge bg-[#6C5CE7]/10 text-[#6C5CE7]">#{t}</span>)}
          </div>
          {previewBlog.publishedUrl && (
            <a href={previewBlog.publishedUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1 text-xs text-[#6C5CE7] hover:underline">
              <ExternalLink className="h-3 w-3" /> {previewBlog.publishedUrl}
            </a>
          )}
          {previewBlog.content ? (
            <div className="mt-3 rounded-lg bg-[#0A0A0F] p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-[#E2E8F0]">{previewBlog.content}</pre>
            </div>
          ) : (
            <p className="mt-3 text-xs text-[#64748B]">No content written yet. Click Edit to start writing.</p>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => {
            const items = blogs.filter((b) => b.status === col);
            return (
              <div key={col} className="rounded-xl border border-[#2D2D3F] bg-[#0A0A0F] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#E2E8F0]">{columnLabels[col]}</h3>
                  <span className="badge bg-[#2D2D3F] text-[#64748B]">{items.length}</span>
                </div>
                <div className="space-y-3">
                  {items.map((blog) => (
                    <div key={blog.id} className="card hover:border-[#6C5CE7]">
                      <div className="flex items-center justify-between">
                        <span className="badge bg-[#6C5CE7]/15 text-[#6C5CE7] text-[10px]">#{blog.number}</span>
                        <div className="flex items-center gap-1">
                          {blog.platform && <span className={`badge text-[9px] ${platformInfo[blog.platform]?.color}`}>{platformInfo[blog.platform]?.label}</span>}
                          <span className="text-[10px] text-[#64748B]">Day {blog.scheduledDay}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-medium text-[#E2E8F0]">{blog.title}</p>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">{blog.tags.slice(0, 3).map((t) => <span key={t} className="text-[9px] text-[#6C5CE7]">#{t}</span>)}</div>
                      )}
                      {blog.notes && <p className="mt-1 text-[11px] text-[#64748B] line-clamp-2">{blog.notes}</p>}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-[#64748B]">
                        {blog.wordCount ? <span>📝 {blog.wordCount}w</span> : <span />}
                        {blog.publishedUrl && <ExternalLink className="h-3 w-3 text-[#6C5CE7]" />}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-1">
                          <button onClick={() => startEditing(blog.id)} className="rounded px-2 py-1 text-[10px] text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#6C5CE7]"><Pencil className="h-3 w-3" /></button>
                          <button onClick={() => setPreviewId(previewId === blog.id ? null : blog.id)} className="rounded px-2 py-1 text-[10px] text-[#64748B] hover:bg-[#1E1E2E] hover:text-white"><Eye className="h-3 w-3" /></button>
                        </div>
                        <button
                          onClick={() => updateBlogWithSync(blog.id, blog.scheduledDay, nextStatus(blog.status))}
                          className="text-[10px] text-[#64748B] hover:text-white"
                        >
                          Move →
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="py-8 text-center text-xs text-[#64748B]">No blogs here</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D2D3F] text-[#64748B]">
                <th className="py-2 text-left font-medium">#</th>
                <th className="py-2 text-left font-medium">Title</th>
                <th className="py-2 text-center font-medium">Platform</th>
                <th className="py-2 text-center font-medium">Day</th>
                <th className="py-2 text-center font-medium">Words</th>
                <th className="py-2 text-center font-medium">Time</th>
                <th className="py-2 text-center font-medium">Status</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-b border-[#2D2D3F]/50 hover:bg-[#1E1E2E]">
                  <td className="py-2 text-[#6C5CE7]">{blog.number}</td>
                  <td className="py-2">
                    <p className="text-[#E2E8F0]">{blog.title}</p>
                    {blog.tags && blog.tags.length > 0 && <p className="text-[10px] text-[#6C5CE7]">{blog.tags.map((t) => `#${t}`).join(" ")}</p>}
                  </td>
                  <td className="py-2 text-center">
                    {blog.platform ? <span className={`badge text-[10px] ${platformInfo[blog.platform]?.color}`}>{platformInfo[blog.platform]?.label}</span> : <span className="text-[#64748B]">—</span>}
                  </td>
                  <td className="py-2 text-center text-[#64748B]">{blog.scheduledDay}</td>
                  <td className="py-2 text-center text-[#64748B]">{blog.wordCount || "—"}</td>
                  <td className="py-2 text-center text-[#64748B]">{blog.timeSpent ? `${blog.timeSpent}h` : "—"}</td>
                  <td className="py-2 text-center"><span className={`badge text-[10px] ${statusColors[blog.status]}`}>{statusLabels[blog.status]}</span></td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEditing(blog.id)} className="rounded p-1 text-[#64748B] hover:text-[#6C5CE7]"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setPreviewId(previewId === blog.id ? null : blog.id)} className="rounded p-1 text-[#64748B] hover:text-white"><Eye className="h-3.5 w-3.5" /></button>
                      {blog.publishedUrl && (
                        <a href={blog.publishedUrl} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-[#64748B] hover:text-[#6C5CE7]">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suggested Platforms */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">💡 Where to Publish</h3>
        <div className="grid grid-cols-3 gap-3">
          {(["hashnode", "dev.to", "medium", "personal", "linkedin"] as BlogPlatform[]).map((p) => {
            const info = platformInfo[p];
            const count = blogs.filter((b) => b.platform === p && b.status === "published").length;
            return (
              <div key={p} className="flex items-center justify-between rounded-lg bg-[#0A0A0F] p-3">
                <div>
                  <p className="text-sm text-[#E2E8F0]">{info.label}</p>
                  {info.url && <a href={info.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#6C5CE7] hover:underline">{info.url}</a>}
                </div>
                <span className="badge bg-[#2D2D3F] text-[#64748B]">{count} posts</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[10px] text-[#64748B]">
          💡 <strong>Tip:</strong> Cross-post to multiple platforms for maximum reach. Write on Hashnode (canonical URL), then cross-post to DEV.to and Medium. Share each post on LinkedIn as an article.
        </p>
      </div>
    </div>
  );
}
