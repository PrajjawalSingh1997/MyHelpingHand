import { LearningTopic } from "@/lib/types";

export const defaultLearningTopics: LearningTopic[] = [
  { id: "l1", title: "Three.js / React Three Fiber", category: "Portfolio", status: "not_started", resources: ["https://threejs.org/docs/", "https://docs.pmnd.rs/react-three-fiber"], notes: "For 3D portfolio effects", hoursSpent: 0 },
  { id: "l2", title: "Framer Motion", category: "Portfolio", status: "not_started", resources: ["https://www.framer.com/motion/"], notes: "Smooth scroll animations", hoursSpent: 0 },
  { id: "l3", title: "GSAP Animations", category: "Portfolio", status: "not_started", resources: ["https://gsap.com/docs/"], notes: "Advanced timeline animations", hoursSpent: 0 },
  { id: "l4", title: "Instagram Content Strategy", category: "Marketing", status: "not_started", resources: [], notes: "Short reels about building Rentlyf", hoursSpent: 0 },
  { id: "l5", title: "YouTube Shorts Creation", category: "Marketing", status: "not_started", resources: [], notes: "Day-in-the-life dev content", hoursSpent: 0 },
  { id: "l6", title: "Sales & Marketing (Rentlyf)", category: "Business", status: "not_started", resources: [], notes: "Direct outreach, referral programs", hoursSpent: 0 },
  { id: "l7", title: "Conference Talk Preparation", category: "Career", status: "not_started", resources: [], notes: "Local tech meetup about building SaaS", hoursSpent: 0 },
  { id: "l8", title: "Open Source Contributing", category: "Technical", status: "not_started", resources: ["https://github.com/prisma/prisma", "https://github.com/vercel/next.js"], notes: "Contribute to Prisma/Next.js ecosystem", hoursSpent: 0 },
];
