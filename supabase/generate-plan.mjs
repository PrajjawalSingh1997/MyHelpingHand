// Run: node supabase/generate-plan.mjs
// Generates my-90-day-plan.json for import via /prompt page

import { writeFileSync } from 'fs'

const START = new Date('2026-07-11')

function dateOf(day) {
  const d = new Date(START)
  d.setDate(d.getDate() + day - 1)
  return d.toISOString().split('T')[0]
}

function planFor(day) {
  const d = new Date(START)
  d.setDate(d.getDate() + day - 1)
  const dow = d.getDay() // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  if (dow === 0 || dow === 3 || dow === 6) return 'C' // Sun, Wed, Sat
  if (dow === 4) return 'B' // Thu
  return 'A' // Mon, Tue, Fri
}

function weekLabel(w) {
  return ({
    1: 'Profile Setup + First Posts',
    2: 'Portfolio Completion + Tech Posts',
    3: 'Tech Deep-Dives + Freelancing Push',
    4: 'Full Portfolio Live + Content Momentum',
    5: 'Content Consistency + Month 1 Reflection',
    6: 'Company Registration Week',
    7: 'Technical Deep-Dives',
    8: 'Freelance Sprint',
    9: 'Open Source + Payments',
    10: 'B2B2C Lessons + Marketing',
    11: 'Authority Building',
    12: 'Beta Prep + Marketing',
    13: 'Final Week — 90 Day Reflection',
  })[w] || `Week ${w}`
}

function buildTasks(n) {
  const tasks = []
  let s = 0
  const add = (category, title, content = null, notes = null, platform = null) => {
    tasks.push({ title, category, platform, content, notes, sort_order: ++s })
  }

  // ── DAILY RECURRING ──
  if (n === 1) {
    add('networking', 'Send 20 connection requests to developers', null, 'Time: 12:30 PM – 1:30 PM')
  } else {
    add('networking', 'Comment on 5-10 LinkedIn posts + accept connections', null, 'Time: 12:30 PM – 1:30 PM')
  }
  const rHours = planFor(n) === 'B' ? 6 : planFor(n) === 'C' ? 2 : 5
  add('rentlyf', `Rentlyf coding / testing (${rHours} hrs)`, null, 'Time: 1:30 PM – 7:00 PM')

  // ── DAY-SPECIFIC ──
  switch (n) {
    case 1:
      add('linkedin', 'Set up LinkedIn profile (headline, about, experience, photo, banner)', null, 'Time: 12:00 PM – 1:30 PM', 'LinkedIn')
      add('linkedin', 'Publish Day 1 post: "Day 1 of building in public"',
        `Day 1 of building in public 🚀\n\nI graduated in Electrical & Electronics Engineering in July 2025.\nAfter that, I made a decision — I wanted to build software.\n\nIn December 2025, I joined a small startup team to build the backend\nof a SaaS product — a property management platform for landlords.\n\nSince then, I've:\n→ Built 200+ backend APIs\n→ Designed 16 backend modules\n→ Worked with TypeScript, Node.js, PostgreSQL, Redis, and Prisma\n→ Started building a 22-page admin dashboard with Next.js\n\nFrom today, I'm sharing this journey publicly —\nthe code, the bugs, the lessons, and the growth.\n\nLet's build. 🛠️\n\n#buildinpublic #webdevelopment #backenddeveloper #startup`,
        'Time: 8:00 PM – 9:30 PM', 'LinkedIn')
      add('github', 'Create GitHub profile README.md', null, 'Time: 10:00 PM – 11:30 PM')
      add('github', 'Update GitHub bio & profile photo', null, 'Time: 10:00 PM – 11:30 PM')
      add('learning', 'Browse Three.js / React Three Fiber tutorials', null, 'Time: 1:00 AM – 2:00 AM')
      break
    case 2:
      add('linkedin', 'Publish: "From Electrical Eng → Backend Dev"',
        `From Electrical Engineering to Backend Development —\nhere's why I made the switch.\n\nDuring my B.E., I loved the logic side of engineering —\ncircuits, algorithms, problem-solving.\n\nBut I realized I wanted to build things people actually use every day.\n\nWeb development gave me that.\n\nIn just a few months, I went from writing my first API\nto building a full backend system with:\n• 16 modules\n• JWT authentication\n• Redis caching\n• Background job processing\n• Real-time notifications\n\nThe engineering mindset transfers perfectly to software.\nLogic is logic — whether it's circuits or code.\n\n#careertransition #engineering #webdevelopment`,
        'Time: 8:00 PM – 9:30 PM', 'LinkedIn')
      add('twitter', 'Set up Twitter/X profile (bio, photo, banner, follow 50 devs)', null, 'Time: 10:00 PM – 12:00 AM', 'Twitter')
      add('learning', 'Watch 1 Three.js tutorial', null, 'Time: 1:00 AM – 2:00 AM')
      break
    case 3:
      add('github', 'Push express-typescript-api-starter repo', null, 'Time: 4:00 PM – 7:00 PM')
      add('twitter', 'Tweet: "First public repo — Express + TS + Prisma starter"',
        `Started sharing my code publicly.\n\nFirst repo: A clean Express + TypeScript + Prisma API starter.\n\nBuilding in public because the best way to learn is to ship.\n\n#buildinpublic #nodejs #typescript`,
        'Time: 8:00 PM – 8:30 PM', 'Twitter')
      add('linkedin', 'Batch write posts for Days 4, 5, 6', null, 'Time: 9:00 PM – 12:00 AM')
      add('learning', 'Try React Three Fiber — render a basic 3D cube', null, 'Time: 1:00 AM – 2:30 AM')
      break
    case 4:
      add('linkedin', 'Publish: "Software architecture lessons from startup"',
        `What building a startup backend taught me about software architecture.\n\nWhen I started, I thought backend development = writing APIs.\n\nAfter building 16 modules and 200+ endpoints for a real product,\nI learned it's actually about:\n1. How modules talk to each other\n2. Where to put business logic (services, not controllers)\n3. How to validate every input (Zod saved us countless times)\n4. How to cache expensive queries (Redis, 5-minute TTL)\n5. How to handle background jobs (BullMQ for heavy tasks)\n\nThe architecture matters more than the code.\n\nWhat's the biggest architecture lesson you've learned?\n\n#softwarearchitecture #backend #startup`,
        'Time: 8:00 PM – 9:30 PM', 'LinkedIn')
      add('portfolio', 'Next.js portfolio project setup + install deps', null, 'Time: 10:00 PM – 12:00 AM')
      add('portfolio', 'Sketch wireframe (Hero, About, Experience, Tech, Projects, Blog, Contact)', null, 'Time: 1:00 AM – 2:00 AM')
      break
    case 5:
      add('twitter', 'Tweet: "Controllers should NEVER touch the database"',
        `Hot take: The controller should NEVER touch the database.\n\nControllers handle HTTP.\nServices handle business logic.\nPrisma handles data.\n\nClean separation = maintainable code at scale.\n\n#nodejs #typescript #cleancode`,
        'Time: 8:00 PM – 8:30 PM', 'Twitter')
      add('portfolio', 'Build Hero section with 3D animated background', null, 'Time: 9:00 PM – 12:00 AM')
      add('portfolio', 'Fine-tune 3D effect (lighting, colors, animation)', null, 'Time: 1:00 AM – 2:00 AM')
      break
    case 6:
      add('linkedin', 'Publish: "3-person startup team" (tag teammates)',
        `Working with a 3-person startup team —\nhere's what it's really like.\n\nWe're 3 people building a SaaS product:\n• One handles design and the landing page\n• One handles core backend and optimisation\n• I handle backend modules, testing, and the admin dashboard\n\nWe meet every day on Discord.\nWe have a shared bug tracking sheet.\nWe iterate fast — sometimes rewriting features 3-4 times.\n\nStartup life isn't glamorous.\nIt's daily calls, tight deadlines, and constant problem-solving.\n\nBut building something from scratch with a small team?\nThat's the best education you can get.\n\nGrateful to be on this journey with @Harshit and @Shiv 🙏\n\n#startup #teamwork #buildinpublic`,
        'Time: 2:00 PM – 3:00 PM', 'LinkedIn')
      add('portfolio', 'Build About + Experience sections with Framer Motion', null, 'Time: 5:00 PM – 8:00 PM')
      add('portfolio', 'Build Tech Stack grid (icons, not bars)', null, 'Time: 9:00 PM – 12:00 AM')
      add('freelance', 'Research Fiverr top web dev sellers + draft gig description', null, 'Time: 1:00 AM – 3:00 AM')
      break
    case 7:
      add('linkedin', 'Publish Week 1 summary',
        `Week 1 of building in public — done ✅\n\nThis week I:\n→ Set up my LinkedIn and GitHub profiles properly\n→ Published my first open-source repo\n→ Shared my story: engineering → software → startup\n→ Started connecting with developers in this space\n→ Started rebuilding my portfolio with 3D effects\n\nNext week:\n→ Deep-dive into tech decisions behind our backend\n→ Push another repo\n→ Continue 3D portfolio build\n\nThe hardest part of building in public?\nHitting "Post" for the first time.\n\nAfter that, it gets easier.\n\n#weeklyreflection #buildinpublic #developer`,
        'Time: 1:00 PM – 2:00 PM', 'LinkedIn')
      add('portfolio', 'Build Projects section + Blog section', null, 'Time: 6:00 PM – 9:00 PM')
      add('blog', 'Write Blog #1: "Why I Switched from EE to Software"', null, 'Time: 10:00 PM – 12:00 AM')
      break
    case 8:
      add('linkedin', 'Publish: "Why PostgreSQL over MongoDB"',
        `Why we chose PostgreSQL over MongoDB for our SaaS product.\n\nWhen you're building a property management platform, your data is deeply relational:\n→ Accounts have Properties\n→ Properties have Units\n→ Units have Tenants\n→ Tenants have Rent Payments\n\nWith PostgreSQL + Prisma:\n• One schema, fully typed\n• JOINs are native and fast\n• Prisma generates TypeScript types automatically\n\nChoose based on your data shape, not hype.\n\n#database #postgresql #backend`,
        'Time: 8:00 PM – 9:30 PM', 'LinkedIn')
      add('portfolio', 'Build Contact section + SEO meta tags + favicon', null, 'Time: 10:00 PM – 12:00 AM')
      add('blog', 'Write Blog #2: "Why PostgreSQL over MongoDB"', null, 'Time: 1:00 AM – 2:00 AM')
      break
    case 9:
      add('github', 'Push prisma-schema-demo repo with ER diagram')
      add('twitter', 'Tweet Prisma tip: always use select',
        `Prisma tip: Always use 'select' to pick only the fields you need.\n\nSmaller payloads = faster APIs.\n\n#prisma #typescript #backend`,
        null, 'Twitter')
      add('portfolio', 'Mobile responsiveness + smooth scroll + test all links', null, 'Time: 10:00 PM – 12:00 AM')
      add('portfolio', 'Deploy portfolio to Vercel! Update LinkedIn/GitHub with link', null, 'Time: 1:00 AM – 2:00 AM')
      break
    case 10:
      add('linkedin', 'Publish: "Testing phase — finding bugs early"',
        `The testing phase — finding bugs before your users do.\n\nWhen our app reached the APK testing stage, I found edge cases everywhere:\n→ What happens when a tenant has ₹0 rent?\n→ What if a landlord has 0 properties?\n→ What if someone extends a lease by 999 months?\n\nTesting isn't finding bugs — it's understanding your system deeply.\n\n#testing #qa #softwaredevelopment`,
        'Time: 4:00 PM – 5:00 PM', 'LinkedIn')
      add('blog', 'Write Blog #3: "Edge Cases That Broke Our App"', null, 'Time: 8:00 PM – 10:00 PM')
      add('linkedin', 'Batch write remaining Week 2 posts', null, 'Time: 10:00 PM – 12:00 AM')
      break
    case 11:
      add('linkedin', 'Publish: "Building 22-page admin dashboard" + blurred screenshot',
        `Building a 22-page admin dashboard for our SaaS product.\n\nWhen you have 200+ APIs, you need a control center.\n\nOur admin dashboard gives us:\n📊 Business Intelligence — KPIs, charts, real-time analytics\n👤 Account Management — landlord profiles, subscriptions, plans\n⚙️ Platform Operations — rent, properties, tenants, maintenance\n🔒 System Admin — RBAC, audit logs, cache, reports\n\nBuilt with: Next.js 14 + TailwindCSS + Shadcn UI + TanStack Query + Recharts\n\n#webdevelopment #nextjs #dashboard #buildinpublic`,
        'Time: 8:00 PM – 9:00 PM', 'LinkedIn')
      add('freelance', 'Create Fiverr account + first gig', null, 'Time: 10:00 PM – 12:00 AM')
      add('freelance', 'Create Upwork + Freelancer + Contra accounts', null, 'Time: 12:00 AM – 1:00 AM')
      break
    case 12:
      add('twitter', 'Thread: "3 TypeScript tips from building 200+ APIs"',
        `3 TypeScript tips from building 200+ APIs 🧵\n\n1/ Use Zod for runtime validation. TypeScript checks types at compile time, Zod checks at runtime. Both = bulletproof.\n\n2/ Never use 'any'. Use 'unknown' + type guards.\n\n3/ Use discriminated unions for API responses.\n\n#typescript #nodejs #webdev`,
        null, 'Twitter')
      add('freelance', 'Build doctor-clinic landing page template', null, 'Time: 9:00 PM – 12:00 AM')
      add('blog', 'Write Blog #4: "Building Admin Dashboards with Next.js"', null, 'Time: 1:00 AM – 2:00 AM')
      break
    case 13:
      add('linkedin', 'Publish: "Why every SaaS needs admin dashboard"',
        `Why every SaaS product needs an admin dashboard.\n\nWhen you have 100+ users, you can't manage by looking at database tables.\n\nYou need:\n→ A way to see what's happening (analytics)\n→ A way to act on it (write actions)\n→ A way to track who did what (audit logs)\n→ A way to control access (RBAC)\n\n#saas #webdevelopment #startup`,
        'Time: 8:00 PM – 9:00 PM', 'LinkedIn')
      add('freelance', 'Send 5 Upwork proposals', null, 'Time: 5:00 PM – 9:00 PM')
      add('freelance', 'Finish clinic landing page + deploy to Vercel', null, 'Time: 10:00 PM – 1:00 AM')
      add('freelance', 'Approach 2-3 doctor friends via WhatsApp', null, 'Time: 2:00 AM – 3:00 AM')
      break
    case 14:
      add('linkedin', 'Publish Week 2 summary + "Portfolio is LIVE" with link', null, 'Time: 1:00 PM – 2:00 PM', 'LinkedIn')
      add('blog', 'Write Blog #5: "My Full Tech Stack in 2026"', null, 'Time: 6:00 PM – 9:00 PM')
      break
    case 15:
      add('linkedin', 'Publish: "200+ APIs — how we structure a large backend"', null, 'Time: 8:00 PM', 'LinkedIn')
      add('freelance', 'Send 5 proposals')
      add('blog', 'Write Blog #6: "How We Handle 200+ APIs"')
      break
    case 16:
      add('github', 'Push nextjs-admin-dashboard-template repo')
      add('freelance', 'Send 5 proposals')
      break
    case 17:
      add('linkedin', 'Publish: "Redis caching in production"', null, 'Time: 8:00 PM', 'LinkedIn')
      add('blog', 'Write Blog #7: "Redis Caching Patterns"')
      add('freelance', 'Send 5 proposals')
      break
    case 18:
      add('linkedin', 'Publish: Team appreciation post (tag Harshit & Shiv)', null, 'Time: 8:00 PM', 'LinkedIn')
      add('freelance', 'Client work or proposals')
      break
    case 19:
      add('linkedin', 'Publish: "JWT + rate limiting — securing SaaS"', null, 'Time: 8:00 PM', 'LinkedIn')
      add('twitter', 'Tweet security tip', null, null, 'Twitter')
      add('freelance', 'Send 5 proposals')
      break
    case 20:
      add('twitter', 'Tweet: "Prisma vs raw SQL"', null, null, 'Twitter')
      add('portfolio', 'Update portfolio with latest screenshots')
      add('blog', 'Write Blog #8: "JWT Auth + Rate Limiting"')
      add('freelance', 'Client work')
      break
    case 21:
      add('linkedin', 'Publish Week 3 summary + portfolio progress', null, 'Time: 1:00 PM', 'LinkedIn')
      add('github', 'Push portfolio update to GitHub')
      add('freelance', 'Send 3 proposals')
      break
    case 22:
      add('linkedin', 'Publish: "From backend to full-stack: admin dashboard"', null, 'Time: 8:00 PM', 'LinkedIn')
      add('blog', 'Write Blog #9: "From Backend to Full Stack"')
      add('freelance', 'Send 5 proposals')
      break
    case 23:
      add('github', 'Push portfolio update with blog posts')
      add('freelance', 'Send 5 proposals')
      break
    case 24:
      add('linkedin', 'Publish: "Edge cases that broke our app"', null, 'Time: 8:00 PM', 'LinkedIn')
      add('blog', 'Write Blog #10: "Edge Cases Nobody Warns You About"')
      break
    case 25:
      add('linkedin', 'Publish: "BullMQ — background jobs in SaaS"', null, 'Time: 8:00 PM', 'LinkedIn')
      add('freelance', 'Setup Fiverr profile if not done')
      break
    case 26:
      add('linkedin', 'Post tech stack carousel (visual graphic)', null, null, 'LinkedIn')
      add('twitter', 'Tweet: "My 2026 stack"', null, null, 'Twitter')
      add('freelance', 'Send 5 proposals')
      break
    case 27:
      add('freelance', 'Build another client template or work on project')
      add('blog', 'Write Blog #11: "BullMQ Background Jobs"')
      break
    case 28:
      add('linkedin', 'Publish Week 4 summary + "Portfolio is LIVE"', null, null, 'LinkedIn')
      add('github', 'Push final portfolio polish')
      break
    case 29:
      add('linkedin', 'Publish: "Admin dashboards with Next.js + TanStack Query"', null, null, 'LinkedIn')
      add('freelance', 'Send 5 proposals')
      break
    case 30:
      add('linkedin', '30 DAYS REFLECTION post — "30 days of building in public"', null, null, 'LinkedIn')
      add('twitter', 'Tweet: "30 days done"', null, null, 'Twitter')
      add('blog', 'Write Blog #12: "30 Days Reflection"')
      add('freelance', 'Send 5 proposals')
      break
    case 31:
      add('linkedin', 'Publish: "Payments in B2B2C SaaS"', null, null, 'LinkedIn')
      add('freelance', 'Send 5 proposals')
      break
    case 32:
      add('github', 'Push redis-caching-patterns repo')
      add('twitter', 'Tweet Redis tip', null, null, 'Twitter')
      add('freelance', 'Send 5 proposals')
      break
    case 33:
      add('linkedin', 'Publish: "Zod validation — every API needs it"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #13: "Zod Validation Patterns"')
      add('freelance', 'Send 5 proposals')
      break
    case 34:
      add('linkedin', 'Publish: "Planning features as 3-person team"', null, null, 'LinkedIn')
      add('freelance', 'Client work')
      break
    case 35:
      add('twitter', 'Tweet Express v5 tip', null, null, 'Twitter')
      add('freelance', 'Client work or proposals')
      break
    case 36:
      add('linkedin', 'RENTLYF OFFICIALLY REGISTERED! post (tag co-founders)', null, null, 'LinkedIn')
      add('personal', 'Company registration tasks')
      break
    case 37:
      add('linkedin', 'Rentlyf announcement + team story', null, null, 'LinkedIn')
      add('twitter', 'Tweet: "We registered our company"', null, null, 'Twitter')
      break
    case 38:
      add('linkedin', 'Publish: "Debugging war story — 6 hour edge case"', null, null, 'LinkedIn')
      add('freelance', 'Client work or proposals')
      break
    case 39:
      add('github', 'Push doctor-clinic-website template')
      add('freelance', 'Approach 2 doctor friends via WhatsApp')
      break
    case 40:
      add('linkedin', 'Publish: "TanStack Query — server state done right"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #14: "Server State vs Client State"')
      add('freelance', 'Approach 1 more doctor friend')
      break
    case 41:
      add('linkedin', 'Week 6 summary + freelance progress', null, null, 'LinkedIn')
      add('freelance', 'Client work')
      break
    case 42:
      add('linkedin', 'Publish: "Real-time features with Socket.io"', null, null, 'LinkedIn')
      add('twitter', 'Tweet Socket.io tip', null, null, 'Twitter')
      break
    case 43:
      add('github', 'Push react-data-table-demo repo')
      add('freelance', 'Client work')
      break
    case 44:
      add('linkedin', 'Publish: "RBAC — restricting admin actions"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #15: "RBAC in Express"')
      break
    case 45:
      add('linkedin', 'Publish: "Pino logging — console.log not enough"', null, null, 'LinkedIn')
      add('freelance', 'Send proposals')
      add('personal', 'Plan marketing strategy for Rentlyf')
      break
    case 46:
      add('twitter', 'Thread: "5 Prisma tips"', null, null, 'Twitter')
      add('freelance', 'Send proposals')
      break
    case 47:
      add('linkedin', 'Publish: "Sentry error monitoring"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #16: "Error Monitoring with Sentry"')
      add('freelance', 'Client work')
      break
    case 48:
      add('linkedin', 'Week 7 summary', null, null, 'LinkedIn')
      add('learning', 'Research Instagram content strategy')
      break
    case 49:
      add('linkedin', 'Publish: "Cloudinary file uploads in SaaS"', null, null, 'LinkedIn')
      add('freelance', 'Send proposals')
      break
    case 50:
      add('github', 'Update dashboard template repo')
      add('twitter', 'Tweet admin dashboard tip', null, null, 'Twitter')
      add('freelance', 'Client work')
      break
    case 51:
      add('linkedin', 'Publish: "Recharts — analytics dashboards"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #17: "Building Charts with Recharts"')
      break
    case 52:
      add('linkedin', 'Publish: "Rewriting features 4 times — iterative dev"', null, null, 'LinkedIn')
      add('freelance', 'Send proposals')
      break
    case 53:
      add('twitter', 'Tweet Zod v4 tip', null, null, 'Twitter')
      add('learning', 'Marketing plan draft for Rentlyf')
      break
    case 54:
      add('linkedin', 'Publish: "Express middleware — the request gauntlet"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #18: "Express Middleware Architecture"')
      add('freelance', 'Client work')
      break
    case 55:
      add('linkedin', 'Week 8 summary + first freelance project showcase', null, null, 'LinkedIn')
      add('freelance', 'Get testimonial from client')
      break
    case 56:
      add('linkedin', 'Publish: "Helmet, CORS, Rate Limiting"', null, null, 'LinkedIn')
      add('freelance', 'Send proposals')
      break
    case 57:
      add('github', 'Contribute to open source (small PR to Prisma/Next.js)')
      add('freelance', 'Send proposals')
      break
    case 58:
      add('linkedin', 'Publish: "Handling payments in SaaS"', null, null, 'LinkedIn')
      add('twitter', 'Tweet B2B2C payments insight', null, null, 'Twitter')
      break
    case 59:
      add('linkedin', 'Publish: "Daily standups keep remote teams aligned"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #19: "Remote Startup Collaboration"')
      add('personal', 'Rentlyf beta launch prep')
      break
    case 60:
      add('linkedin', '60 DAYS REFLECTION — "2 months of building in public"', null, null, 'LinkedIn')
      add('twitter', 'Tweet: "2 months done"', null, null, 'Twitter')
      break
    case 61:
      add('linkedin', 'Publish: "Launching a product — what nobody tells you"', null, null, 'LinkedIn')
      add('freelance', 'Send proposals')
      add('personal', 'Rentlyf beta prep')
      break
    case 62:
      add('github', 'Push improvements to all repos')
      add('twitter', 'Tweet launch lessons', null, null, 'Twitter')
      add('freelance', 'Client work')
      break
    case 63:
      add('linkedin', 'Publish: "Case study — rent management system"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #20: "Building a Rent Management System"')
      break
    case 64:
      add('linkedin', 'Publish: "B2B2C model — lessons from Rentlyf"', null, null, 'LinkedIn')
      add('personal', 'Share Rentlyf landing page link')
      break
    case 65:
      add('twitter', 'Thread: "Building SaaS in India"', null, null, 'Twitter')
      add('freelance', 'Send proposals')
      add('learning', 'Marketing research')
      break
    case 66:
      add('linkedin', 'Team update post (tag Harshit & Shiv)', null, null, 'LinkedIn')
      add('freelance', 'Client work')
      break
    case 67:
      add('linkedin', 'Week 10 summary', null, null, 'LinkedIn')
      add('blog', 'Write Blog #21: "B2B2C SaaS Lessons"')
      add('learning', 'Instagram content plan')
      break
    case 68:
      add('linkedin', 'Publish: "Property management is broken — tech fixes it"', null, null, 'LinkedIn')
      add('personal', 'Product problem post for Rentlyf')
      break
    case 69:
      add('github', 'Update all repo READMEs')
      add('twitter', 'Tweet PropTech insight', null, null, 'Twitter')
      add('freelance', 'Send proposals')
      break
    case 70:
      add('linkedin', 'Publish: "Building for landlords — understanding users"', null, null, 'LinkedIn')
      add('freelance', 'Client work')
      break
    case 71:
      add('linkedin', 'Publish: "0 to 500 LinkedIn connections — lessons"', null, null, 'LinkedIn')
      break
    case 72:
      add('twitter', 'Tweet portfolio tip', null, null, 'Twitter')
      add('freelance', 'Client work')
      break
    case 73:
      add('linkedin', 'Publish: "My first freelance project — lessons"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #22: "First Freelance Client Lessons"')
      add('freelance', 'Get testimonial from client')
      break
    case 74:
      add('linkedin', 'Week 11 summary', null, null, 'LinkedIn')
      add('learning', 'Plan conference talk at local tech meetup')
      break
    case 75:
      add('linkedin', 'Publish: "Scaling from 0 to 200+ APIs"', null, null, 'LinkedIn')
      add('freelance', 'Send proposals')
      break
    case 76:
      add('github', 'Push new demo project')
      add('freelance', 'Client work')
      break
    case 77:
      add('linkedin', 'Publish: "Admin dashboard managing 200+ APIs" (showcase)', null, null, 'LinkedIn')
      add('twitter', 'Tweet dashboard showcase', null, null, 'Twitter')
      add('blog', 'Write Blog #23: "Admin Dashboard Architecture"')
      break
    case 78:
      add('linkedin', 'Publish: "Learning sales as a developer"', null, null, 'LinkedIn')
      add('personal', 'Sales prep + finalize marketing plan')
      add('learning', 'Marketing plan review')
      break
    case 79:
      add('twitter', 'Thread: "Developer → Founder mindset shift"', null, null, 'Twitter')
      add('freelance', 'Client work')
      break
    case 80:
      add('linkedin', 'Publish: "Why developers should learn marketing"', null, null, 'LinkedIn')
      add('freelance', 'Client work + direct outreach to landlords')
      break
    case 81:
      add('linkedin', 'Week 12 summary', null, null, 'LinkedIn')
      add('blog', 'Write Blog #24: "Marketing as a Developer"')
      break
    case 82:
      add('linkedin', 'RENTLYF BETA IS COMING — teaser post', null, null, 'LinkedIn')
      add('twitter', 'Tweet: "Beta coming soon"', null, null, 'Twitter')
      add('personal', 'Beta teaser campaign')
      break
    case 83:
      add('github', 'Final cleanup of all repos')
      add('freelance', 'Update all freelance profiles with new testimonials')
      break
    case 84:
      add('linkedin', '"Want to try Rentlyf? DM me for early access"', null, null, 'LinkedIn')
      add('personal', 'Beta invite — direct outreach to potential users')
      break
    case 85:
      add('linkedin', 'Publish: "What 3 months of building in public taught me"', null, null, 'LinkedIn')
      break
    case 86:
      add('twitter', 'Thread: "3 month reflection"', null, null, 'Twitter')
      add('freelance', 'Update pricing + collect testimonials')
      break
    case 87:
      add('linkedin', 'Publish: "The tech stack behind Rentlyf — deep dive"', null, null, 'LinkedIn')
      add('personal', 'Full tech showcase for Rentlyf')
      add('learning', 'Plan first Instagram reel')
      break
    case 88:
      add('linkedin', 'Publish: "From EE graduate to startup co-founder in 1 year"', null, null, 'LinkedIn')
      add('blog', 'Write Blog #25: "My 1-Year Journey — EE to Startup Co-Founder"')
      break
    case 89:
      add('linkedin', 'Week 13 summary + update all goals', null, null, 'LinkedIn')
      add('github', 'Update GitHub profile README')
      add('portfolio', 'Portfolio final update with all achievements')
      break
    case 90:
      add('linkedin', '🎉 90 DAYS OF BUILDING IN PUBLIC — mega reflection post!', null, null, 'LinkedIn')
      add('twitter', 'Tweet: "90 days done — here\'s what changed"', null, null, 'Twitter')
      add('personal', 'Update freelance pricing + testimonials + plan next 90 days')
      break
    default:
      add('personal', 'Review progress and plan for tomorrow')
  }

  return tasks
}

// ── Generate JSON ──
const days = []
for (let n = 1; n <= 90; n++) {
  days.push({
    day_number: n,
    date: dateOf(n),
    plan_type: planFor(n),
    theme: weekLabel(Math.ceil(n / 7)),
    notes: null,
    tasks: buildTasks(n),
  })
}

const plan = {
  cycle: {
    title: '90-Day Developer Growth Engine — Prajjawal Singh',
    start_date: '2026-07-11',
    end_date: '2026-10-08',
    goal: 'Build public developer presence, land freelance clients, grow Rentlyf from beta to launch',
  },
  days,
}

writeFileSync('supabase/my-90-day-plan.json', JSON.stringify(plan, null, 2))
console.log(`✅ Generated: supabase/my-90-day-plan.json`)
console.log(`   Days: ${days.length}`)
console.log(`   Total tasks: ${days.reduce((s, d) => s + d.tasks.length, 0)}`)
