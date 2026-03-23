"use client";
import { useFreelanceStore } from "@/store/stores";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FreelancePlatform, ProposalStatus } from "@/lib/types";

export default function FreelancePage() {
  const { proposals, projects, addProposal, updateProposal, deleteProposal, addProject, updateProject, toggleProjectTask } = useFreelanceStore();
  const [tab, setTab] = useState<"proposals" | "active" | "completed" | "income">("proposals");
  const [showForm, setShowForm] = useState(false);

  const totalIncome = projects.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const totalSent = proposals.length;
  const totalWon = proposals.filter((p) => p.status === "won").length;

  const handleAddProposal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addProposal({
      id: `p${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      platform: fd.get("platform") as FreelancePlatform,
      clientName: fd.get("client") as string,
      gigTitle: fd.get("gig") as string,
      amount: Number(fd.get("amount")),
      status: "sent",
      notes: fd.get("notes") as string,
    });
    setShowForm(false);
    e.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">💼 Freelance Tracker</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{totalSent}</p>
          <p className="text-xs text-[#64748B]">Proposals Sent</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#00B894]">{totalWon}</p>
          <p className="text-xs text-[#64748B]">Won</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#6C5CE7]">{totalSent > 0 ? Math.round((totalWon / totalSent) * 100) : 0}%</p>
          <p className="text-xs text-[#64748B]">Win Rate</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#FDCB6E]">₹{totalIncome.toLocaleString()}</p>
          <p className="text-xs text-[#64748B]">Total Income</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-[#2D2D3F] bg-[#14141F]">
        {(["proposals", "active", "completed", "income"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 px-4 py-2 text-sm capitalize transition-all ${tab === t ? "bg-[#6C5CE7] text-white" : "text-[#64748B] hover:text-white"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Proposals Tab */}
      {tab === "proposals" && (
        <div className="space-y-4">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm text-white transition-all hover:bg-[#5A4BD1]">
            <Plus className="h-4 w-4" /> Add Proposal
          </button>

          {showForm && (
            <form onSubmit={handleAddProposal} className="card space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <select name="platform" className="rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white">
                  <option value="upwork">Upwork</option>
                  <option value="fiverr">Fiverr</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="contra">Contra</option>
                  <option value="direct">Direct</option>
                </select>
                <input name="client" placeholder="Client Name" required className="rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]" />
                <input name="gig" placeholder="Gig / Project Title" required className="rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]" />
                <input name="amount" type="number" placeholder="Amount (₹)" className="rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]" />
                <input name="notes" placeholder="Notes" className="col-span-2 rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]" />
              </div>
              <button type="submit" className="rounded-lg bg-[#00B894] px-4 py-2 text-sm text-white hover:bg-[#00A381]">Submit</button>
            </form>
          )}

          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D2D3F] text-[#64748B]">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-left">Platform</th>
                  <th className="py-2 text-left">Client / Gig</th>
                  <th className="py-2 text-center">Amount</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id} className="border-b border-[#2D2D3F]/50">
                    <td className="py-2 text-[#64748B]">{p.date}</td>
                    <td className="py-2 capitalize text-[#E2E8F0]">{p.platform}</td>
                    <td className="py-2"><span className="text-[#E2E8F0]">{p.clientName}</span><br /><span className="text-xs text-[#64748B]">{p.gigTitle}</span></td>
                    <td className="py-2 text-center text-[#E2E8F0]">₹{p.amount.toLocaleString()}</td>
                    <td className="py-2 text-center">
                      <select
                        value={p.status}
                        onChange={(e) => updateProposal(p.id, { status: e.target.value as ProposalStatus })}
                        className={`badge cursor-pointer border-0 text-[10px] ${p.status === "won" ? "bg-[#00B894]/15 text-[#00B894]" : p.status === "rejected" ? "bg-[#FF6B6B]/15 text-[#FF6B6B]" : p.status === "replied" ? "bg-[#FDCB6E]/15 text-[#FDCB6E]" : "bg-[#2D2D3F] text-[#64748B]"}`}
                      >
                        <option value="sent">Sent</option>
                        <option value="replied">Replied</option>
                        <option value="won">Won</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => deleteProposal(p.id)} className="text-[#FF6B6B] hover:text-[#FF4040]"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
                {proposals.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-[#64748B]">No proposals yet. Start sending!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Projects */}
      {tab === "active" && (
        <div className="space-y-4">
          {projects.filter((p) => p.status === "active").map((project) => (
            <div key={project.id} className="card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#E2E8F0]">{project.clientName} — {project.projectType}</h3>
                <span className="badge bg-[#FDCB6E]/15 text-[#FDCB6E]">₹{project.amount.toLocaleString()}</span>
              </div>
              {project.tasks.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {project.tasks.map((t, i) => (
                    <li key={i} onClick={() => toggleProjectTask(project.id, i)} className="flex cursor-pointer items-center gap-2 text-sm">
                      <span>{t.completed ? "✅" : "⬜"}</span>
                      <span className={t.completed ? "text-[#64748B] line-through" : "text-[#E2E8F0]"}>{t.title}</span>
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => updateProject(project.id, { status: "completed" })} className="mt-3 text-xs text-[#00B894] hover:underline">Mark Complete</button>
            </div>
          ))}
          {projects.filter((p) => p.status === "active").length === 0 && <p className="card text-center text-sm text-[#64748B]">No active projects</p>}
        </div>
      )}

      {/* Completed */}
      {tab === "completed" && (
        <div className="space-y-3">
          {projects.filter((p) => p.status === "completed").map((project) => (
            <div key={project.id} className="card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm text-[#E2E8F0]">{project.clientName} — {project.projectType}</h3>
                <span className="badge bg-[#00B894]/15 text-[#00B894]">₹{project.amount.toLocaleString()}</span>
              </div>
              {project.testimonial && <p className="mt-2 text-xs italic text-[#64748B]">&ldquo;{project.testimonial}&rdquo;</p>}
            </div>
          ))}
          {projects.filter((p) => p.status === "completed").length === 0 && <p className="card text-center text-sm text-[#64748B]">No completed projects yet</p>}
        </div>
      )}

      {/* Income */}
      {tab === "income" && (
        <div className="card text-center">
          <p className="text-4xl font-bold text-[#00B894]">₹{totalIncome.toLocaleString()}</p>
          <p className="mt-2 text-sm text-[#64748B]">Total freelance income earned</p>
        </div>
      )}
    </div>
  );
}
