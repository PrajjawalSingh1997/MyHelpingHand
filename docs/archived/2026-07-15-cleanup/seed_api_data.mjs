import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "prajjawalsingh1997@gmail.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    console.log("🚀 Seeding User Data via API...");

    // Get the user ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const userId = users.users.find(u => u.email === email)?.id;

    if (!userId) {
      throw new Error(`User with email ${email} not found.`);
    }
    console.log(`✅ Found user ID: ${userId}`);

    // Update settings
    await supabase.from('user_profiles').update({
      display_name: 'Prajjawal Singh',
      timezone: 'Asia/Kolkata',
      debt_total: 100000,
      linkedin_url: 'https://linkedin.com/in/prajjawalsingh',
      github_url: 'https://github.com/prajjawalsingh',
      twitter_url: 'https://twitter.com/prajjawalsingh',
      portfolio_url: 'https://prajjawalsingh.com'
    }).eq('id', userId);

    // Import 90-Day Plan
    const planPath = path.join(__dirname, 'supabase', 'my-90-day-plan.json');
    if (fs.existsSync(planPath)) {
      const planData = JSON.parse(fs.readFileSync(planPath, 'utf8'));

      // 1. Create the Cycle
      const startDateStr = planData.cycle?.start_date || '2026-07-11';
      const endDateStr = planData.cycle?.end_date || '2026-10-08';

      const { data: cycleRow, error: cycleError } = await supabase.from('ninety_day_cycles').insert({
        user_id: userId,
        cycle_number: 1,
        title: planData.cycle?.title || '90-Day Growth Engine',
        goal: planData.cycle?.goal || 'Build public developer presence',
        start_date: startDateStr,
        end_date: endDateStr
      }).select().single();

      if (cycleError) console.error("Cycle insert error:", cycleError);

      if (cycleRow && planData.days && Array.isArray(planData.days)) {
        console.log(`Importing ${planData.days.length} days...`);
        const startDate = new Date(startDateStr + 'T00:00:00');

        for (const day of planData.days) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + (day.day_number - 1));

          const { data: dayRow, error: dayError } = await supabase.from('days').insert({
            cycle_id: cycleRow.id,
            user_id: userId,
            day_number: day.day_number,
            date: currentDate.toISOString().split('T')[0],
            theme: day.theme || 'Daily Focus'
          }).select().single();

          if (dayError) console.error(`Day ${day.day_number} error:`, dayError);

          if (dayRow && day.tasks) {
            const tasks = day.tasks.map((t, idx) => ({
              day_id: dayRow.id,
              user_id: userId,
              title: typeof t === 'string' ? t : t.title,
              category: t.category || 'personal',
              platform: t.platform || null,
              content: t.content || null,
              notes: t.notes || null,
              sort_order: idx
            }));
            const { error: taskError } = await supabase.from('tasks').insert(tasks);
            if (taskError) console.error(`Task error on Day ${day.day_number}:`, taskError);
          }
        }
      }
    }

    // Add Habits
    console.log("Adding Habits...");
    const habitsList = [
      { name: "Morning workout", emoji: "🏋️" },
      { name: "Read 30 min", emoji: "📚" },
      { name: "No phone before 9 AM", emoji: "📵" },
      { name: "Cold shower", emoji: "🚿" }
    ];

    const habitsToInsert = habitsList.map((h, idx) => ({
      user_id: userId,
      name: h.name,
      emoji: h.emoji,
      frequency: 'daily',
      is_active: true,
      sort_order: idx
    }));

    const { error: habitsError } = await supabase.from('habits').insert(habitsToInsert);
    if (habitsError) console.error("Habits insert error:", habitsError);

    console.log("✅ Seed complete!");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

run();
