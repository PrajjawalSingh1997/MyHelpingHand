# v1 Reference Data — Archived from Source Code

This file preserves the personal plans, schedules, and content ideas that were hardcoded
in the v1 data files before the Supabase migration. Use this to re-enter data into the
v2 app through the UI (Goals page, Timetable page, Learning page, Blog page).

---

## 1. Daily Timetables — Plan A / B / C

These were in `src/data/timetables.ts`. Enter them in the **Timetable** module.

### Weekly Rhythm (which plan runs on which day)
| Day       | Focus                         | Plan | Platform                   |
|-----------|-------------------------------|------|----------------------------|
| Monday    | Coding + LinkedIn post        | A    | LinkedIn                   |
| Tuesday   | Coding + GitHub push          | A    | GitHub + Twitter           |
| Wednesday | Batch content day             | C    | LinkedIn                   |
| Thursday  | Coding + Freelancing          | B    | LinkedIn                   |
| Friday    | Coding + Showcase             | A    | LinkedIn + Twitter         |
| Saturday  | Freelancing + Portfolio       | C    | Freelance platforms        |
| Sunday    | Summary + Planning            | C    | LinkedIn                   |

### Plan A (Mon / Tue / Fri)
| Time                  | Block            | Activity                                                 | Duration |
|-----------------------|------------------|----------------------------------------------------------|----------|
| 12:00 PM – 12:30 PM   | Wake & Prep      | Morning routine, check messages                          | 30 min   |
| 12:30 PM – 1:30 PM    | Networking       | LinkedIn: comment on 5-10 posts, accept connections, reply to DMs | 1 hr |
| 1:30 PM – 4:30 PM     | Coding Block 1   | Rentlyf: Dashboard / Testing / Backend work              | 3 hrs    |
| 4:30 PM – 5:00 PM     | Break            | Snack, walk, recharge                                    | 30 min   |
| 5:00 PM – 7:00 PM     | Coding Block 2   | Rentlyf: Continue coding or bug fixes                    | 2 hrs    |
| 7:00 PM – 8:00 PM     | Dinner           | Break                                                    | 1 hr     |
| 8:00 PM – 9:30 PM     | Content Creation | Write today's LinkedIn post + prepare GitHub commit      | 1.5 hrs  |
| 9:30 PM – 10:00 PM    | Posting          | Post on LinkedIn/Twitter, reply to comments              | 30 min   |
| 10:00 PM – 1:00 AM    | Freelancing      | Build client websites / update gigs / send proposals     | 3 hrs    |
| 1:00 AM – 3:00 AM     | Learning         | Portfolio rebuild, learn Three.js, marketing research    | 2 hrs    |
| 3:00 AM – 4:00 AM     | Light Coding     | Planning for next day or light coding                    | 1 hr     |
| 4:00 AM – 4:30 AM     | Daily Wrap       | Update bug sheet, tomorrow's tasks, Discord check        | 30 min   |

### Plan B (Thu)
| Time                  | Block                  | Activity                                     | Duration |
|-----------------------|------------------------|----------------------------------------------|----------|
| 12:00 PM – 1:00 PM   | Quick Networking        | 30 min LinkedIn + 30 min messages            | 1 hr     |
| 1:00 PM – 7:00 PM    | Coding Marathon         | Rentlyf work — 6 straight hours              | 6 hrs    |
| 7:00 PM – 8:00 PM    | Dinner                  | Break                                        | 1 hr     |
| 8:00 PM – 9:00 PM    | Quick Content           | Reuse a pre-written draft, post quickly      | 1 hr     |
| 9:00 PM – 1:00 AM    | Freelancing + Coding    | Freelancing + More Coding                    | 4 hrs    |
| 1:00 AM – 3:00 AM    | Learning / Portfolio    | Learning or Portfolio work                   | 2 hrs    |

### Plan C (Wed / Sat / Sun)
| Time                  | Block                  | Activity                                     | Duration |
|-----------------------|------------------------|----------------------------------------------|----------|
| 12:00 PM – 2:00 PM   | Networking Marathon     | LinkedIn commenting spree, connections        | 2 hrs    |
| 2:00 PM – 4:00 PM    | Light Coding            | Bug fixes, small tasks                        | 2 hrs    |
| 4:00 PM – 7:00 PM    | Content Marathon        | Write 3-4 posts for the week                 | 3 hrs    |
| 7:00 PM – 8:00 PM    | Dinner                  | Break                                        | 1 hr     |
| 8:00 PM – 12:00 AM   | Freelancing             | Build client sites, send proposals           | 4 hrs    |
| 12:00 AM – 3:00 AM   | Portfolio + Learning    | Portfolio rebuild + Learning                 | 3 hrs    |

---

## 2. 90-Day Goal Scorecard Targets

These were in `src/data/goals.ts`. Enter them in the **Goals** module.

### Month 1 Targets (July 11 – Aug 9, 2026)
| Metric                      | Target    |
|-----------------------------|-----------|
| LinkedIn Posts              | 18        |
| GitHub Repos                | 4+        |
| Twitter Posts               | 6         |
| Blog Posts                  | 5+        |
| LinkedIn Connections        | 100+      |
| Portfolio Status            | LIVE      |
| Freelance Profiles Created  | 4         |
| Upwork Proposals Sent       | 50+       |
| Freelance Clients           | 0–1       |
| Rentlyf Coding Hours        | ~150 hrs  |

### Month 2 Targets (Aug 10 – Sep 8, 2026)
| Metric                          | Target    |
|---------------------------------|-----------|
| LinkedIn Posts                  | 16        |
| GitHub Repos (Total)            | 6+        |
| Blog Posts (Total)              | 12+       |
| Freelance Proposals (Total)     | 100+      |
| Freelance Clients               | 1–2       |
| Doctor Websites Built           | 1–2       |
| Freelance Income                | ₹10,000+  |
| Rentlyf Company Registered      | ✅        |
| LinkedIn Connections (Total)    | 300+      |

### Month 3 Targets (Sep 9 – Oct 8, 2026)
| Metric                          | Target    |
|---------------------------------|-----------|
| LinkedIn Posts                  | 16        |
| LinkedIn Connections (Total)    | 500+      |
| Blog Posts (Total)              | 18+       |
| Freelance Clients (Total)       | 3–5       |
| Freelance Income (Total)        | ₹30,000+  |
| Rentlyf Beta Users              | 10–20     |
| Instagram Content Started       | ✅        |
| Marketing Plan Created          | ✅        |
| GitHub Repos (Total)            | 6+        |
| GitHub Stars                    | 20+       |

---

## 3. Learning Topics

These were in `src/data/learning.ts`. Add them in the **Learning** module.

| #  | Topic                             | Category    | Resources                                                                 | Notes                                    |
|----|-----------------------------------|-------------|---------------------------------------------------------------------------|------------------------------------------|
| 1  | Three.js / React Three Fiber      | Portfolio   | https://threejs.org/docs/ · https://docs.pmnd.rs/react-three-fiber        | For 3D portfolio effects                 |
| 2  | Framer Motion                     | Portfolio   | https://www.framer.com/motion/                                            | Smooth scroll animations                 |
| 3  | GSAP Animations                   | Portfolio   | https://gsap.com/docs/                                                    | Advanced timeline animations             |
| 4  | Instagram Content Strategy        | Marketing   | —                                                                         | Short reels about building Rentlyf       |
| 5  | YouTube Shorts Creation           | Marketing   | —                                                                         | Day-in-the-life dev content              |
| 6  | Sales & Marketing (Rentlyf)       | Business    | —                                                                         | Direct outreach, referral programs       |
| 7  | Conference Talk Preparation       | Career      | —                                                                         | Local tech meetup about building SaaS    |
| 8  | Open Source Contributing          | Technical   | https://github.com/prisma/prisma · https://github.com/vercel/next.js      | Contribute to Prisma/Next.js ecosystem   |

---

## 4. Planned Blog Posts

These were in `src/data/blogs.ts`. Add them in the **Blog** module (25 posts planned).

| #  | Title                                                                        | Scheduled Day | Notes                                              |
|----|------------------------------------------------------------------------------|---------------|----------------------------------------------------|
| 1  | Why I Switched from Electrical Engineering to Software Development           | Day 7         | Personal story — engineering → web dev → startup  |
| 2  | Why We Chose PostgreSQL over MongoDB                                         | Day 8         | Relational data, JOINs, Prisma types               |
| 3  | Testing a Startup Product — Edge Cases That Broke Our App                    | Day 10        | Fun debugging stories, edge cases                  |
| 4  | Building Admin Dashboards with Next.js + TanStack Query                      | Day 12        | Dashboard architecture, server state               |
| 5  | My Full Tech Stack in 2026 — and Why I Chose Each Tool                       | Day 14        | Deep breakdown of each technology                  |
| 6  | How We Handle 200+ APIs in One Backend                                       | Day 15        | Modular architecture, controller-service           |
| 7  | Redis Caching Patterns for SaaS Applications                                 | Day 17        | Cache-aside, TTL, rate limiting                    |
| 8  | JWT Authentication + Rate Limiting in Express                                | Day 20        | Security best practices                            |
| 9  | From Backend to Full Stack — My Admin Dashboard Journey                      | Day 22        | Learning Next.js, building 22 pages                |
| 10 | Testing a Startup Product — The Edge Cases Nobody Warns You About            | Day 24        | Advanced edge case stories                         |
| 11 | BullMQ — Background Job Processing in Node.js                                | Day 27        | Queue architecture, worker patterns                |
| 12 | 30 Days of Building in Public — Reflection                                   | Day 30        | Month 1 reflection                                 |
| 13 | Zod Validation Patterns for TypeScript APIs                                  | Day 33        | Runtime vs compile-time safety                     |
| 14 | Server State vs Client State — When to Use What                              | Day 40        | React Query vs Zustand use cases                   |
| 15 | Role-Based Access Control in Express                                         | Day 44        | RBAC middleware patterns                           |
| 16 | Error Monitoring with Sentry in Production                                   | Day 47        | Setup, breadcrumbs, profiling                      |
| 17 | Building Charts with Recharts                                                | Day 51        | Area, bar, pie charts for analytics                |
| 18 | Express Middleware Architecture                                               | Day 54        | Request gauntlet pattern                           |
| 19 | Remote Startup Collaboration — Tools and Lessons                              | Day 59        | Discord standups, bug sheets, iteration            |
| 20 | Building a Rent Management System — Case Study                               | Day 63        | Technical deep-dive                                |
| 21 | B2B2C SaaS Lessons from Building Rentlyf                                     | Day 67        | Business model challenges                          |
| 22 | First Freelance Client — What I Learned                                      | Day 73        | Freelancing lessons                                |
| 23 | Admin Dashboard Architecture Guide                                           | Day 77        | Full architecture breakdown                        |
| 24 | Marketing as a Developer — Why It Matters                                    | Day 81        | Sales and marketing for devs                       |
| 25 | My 1-Year Journey — From EE Graduate to Startup Co-Founder                  | Day 88        | Full reflection post                               |
