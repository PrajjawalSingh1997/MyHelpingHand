import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const DATABASE_URL = process.env.DATABASE_URL; // Provide this in .env.local
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!DATABASE_URL) {
  console.error("❌ ERROR: DATABASE_URL is missing in .env.local. Please provide your Supabase Postgres connection string.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function run() {
  try {
    console.log("🚀 Starting fully automated setup...");

    // ======================================================
    // STEP 1: Run SQL Migrations & Seed Data
    // ======================================================
    console.log("\n[1/6] Running SQL Migrations & Seeds...");
    const sqlFiles = [
      'supabase/seed.sql',
      'supabase/migrations/002_life_os_enhancements.sql',
      'supabase/migrations/003_habits_brand_growth.sql',
    ];

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const query = fs.readFileSync(filePath, 'utf8');
        console.log(`Executing ${file}...`);
        await sql.unsafe(query);
        console.log(`✅ ${file} executed successfully.`);
      } else {
        console.warn(`⚠️ Warning: ${file} not found.`);
      }
    }

    // Run the extra insert for the Habits module
    console.log("Executing extra Habits module insert...");
    await sql.unsafe(`
      INSERT INTO modules (name, slug, description, icon, is_default, sort_order)
      VALUES ('Habits', 'habits', 'Daily habit tracker and streaks', 'CheckSquare', true, 15)
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log("✅ Habits module inserted.");

    // ======================================================
    // STEP 2: Sign Up at the App
    // ======================================================
    console.log("\n[2/6] Signing up the user...");
    const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "prajjawalsingh1997@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "Password123!";
    
    // We'll try to sign up. If it already exists, it might fail or return the user, which is fine.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { display_name: "Prajjawal Singh" }
    });

    let userId;
    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log("✅ User already exists. Fetching user ID...");
        const { data: existingUser } = await supabase.from('user_profiles').select('id').eq('email', email).single();
        userId = existingUser?.id;
      } else {
        throw new Error(`Failed to create user: ${authError.message}`);
      }
    } else {
      console.log("✅ User signed up successfully.");
      userId = authData.user.id;
    }

    if (!userId) {
      // Fallback: fetch via auth admin
      const { data: users } = await supabase.auth.admin.listUsers();
      userId = users.users.find(u => u.email === email)?.id;
    }

    // ======================================================
    // STEP 3: Set Yourself as Super Admin (Now managed via ENV)
    // ======================================================
    console.log("\n[3/6] Skipping DB super_admin role (now managed securely via .env.local)");

    // ======================================================
    // STEP 4: Fill Your Settings
    // ======================================================
    console.log("\n[4/6] Updating user settings (Timezone, Debt, URLs)...");
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        display_name: 'Prajjawal Singh',
        timezone: 'Asia/Kolkata',
        debt_total: 100000, // Replace with actual debt
        linkedin_url: 'https://linkedin.com/in/prajjawalsingh',
        github_url: 'https://github.com/prajjawalsingh',
        twitter_url: 'https://twitter.com/prajjawalsingh',
        portfolio_url: 'https://prajjawalsingh.com'
      })
      .eq('id', userId);

    if (profileError) throw new Error(`Profile update failed: ${profileError.message}`);
    console.log("✅ Settings updated.");

    // ======================================================
    // STEP 5: Import Your 90-Day Plan
    // ======================================================
    console.log("\n[5/6] Importing 90-Day Plan...");
    const planPath = path.join(__dirname, 'supabase', 'my-90-day-plan.json');
    if (fs.existsSync(planPath)) {
      const planData = JSON.parse(fs.readFileSync(planPath, 'utf8'));
      
      // The frontend /prompt import creates days and tasks.
      // We will do this directly using Supabase client to simulate the import.
      if (planData.days && Array.isArray(planData.days)) {
        console.log(`Found ${planData.days.length} days to import. Mapping to database...`);
        // Start date: July 11, 2026
        const startDate = new Date('2026-07-11T00:00:00');
        
        for (const day of planData.days) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + (day.day - 1));
          const dateString = currentDate.toISOString().split('T')[0];

          // Insert Day
          const { data: dayRow, error: dayError } = await supabase.from('days').insert({
            user_id: userId,
            date: dateString,
            theme: day.theme || 'Daily Focus',
            focus_area: 'General',
            status: 'pending'
          }).select().single();

          if (!dayError && dayRow) {
            // Insert Tasks
            if (day.tasks && day.tasks.length > 0) {
              const tasksToInsert = day.tasks.map((t, index) => ({
                user_id: userId,
                day_id: dayRow.id,
                title: typeof t === 'string' ? t : t.title,
                status: 'pending',
                order_index: index,
                type: 'A'
              }));
              await supabase.from('tasks').insert(tasksToInsert);
            }
          }
        }
        console.log("✅ 90-day plan imported successfully.");
      } else {
        console.warn("⚠️ Invalid 90-day plan structure.");
      }
    } else {
      console.warn("⚠️ my-90-day-plan.json not found.");
    }

    // ======================================================
    // STEP 6: Add Habits
    // ======================================================
    console.log("\n[6/6] Adding Habits...");
    const habitsList = [
      { name: "Morning workout", icon: "Dumbbell" },
      { name: "Read 30 min", icon: "Book" },
      { name: "No phone before 9 AM", icon: "SmartphoneOff" },
      { name: "Cold shower", icon: "Droplets" }
    ];

    const habitsToInsert = habitsList.map(h => ({
      user_id: userId,
      name: h.name,
      description: h.name,
      icon: h.icon,
      type: 'daily',
      frequency: ['mon','tue','wed','thu','fri','sat','sun'],
      status: 'active'
    }));
    
    // We use sql.unsafe here just in case the tables aren't perfectly synced with types yet, or simply supabase client
    const { error: habitsError } = await supabase.from('habits').insert(habitsToInsert);
    if (habitsError) {
      console.log("⚠️ Could not insert habits via API (maybe RLS). Using direct SQL...");
      for (const h of habitsToInsert) {
        await sql.unsafe(`
          INSERT INTO habits (user_id, name, description, icon, type, frequency, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [userId, h.name, h.description, h.icon, h.type, JSON.stringify(h.frequency), h.status]);
      }
    }
    console.log("✅ Habits added.");

    console.log("\n🎉 ALL DONE! Your app is fully seeded and configured.");
    console.log("👉 You can now log in at http://localhost:3000/login with:");
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    
  } catch (error) {
    console.error("\n❌ Error during setup:", error);
  } finally {
    await sql.end();
  }
}

run();
