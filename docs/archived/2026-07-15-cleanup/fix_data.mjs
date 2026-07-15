import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "prajjawalsingh1997@gmail.com";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    console.log("🚀 Fixing missing trigger data for user...");

    // Get the user ID
    const { data: users } = await supabase.auth.admin.listUsers();
    const userId = users.users.find(u => u.email === email)?.id;

    if (!userId) {
      throw new Error(`User with email ${email} not found.`);
    }
    console.log(`✅ Found user ID: ${userId}`);

    // 1. Insert user_profiles
    await supabase.from('user_profiles').upsert({
      id: userId,
      display_name: 'Prajjawal Singh',
      role: 'user', // Default role
      timezone: 'Asia/Kolkata',
      debt_total: 100000,
      linkedin_url: 'https://linkedin.com/in/prajjawalsingh',
      github_url: 'https://github.com/prajjawalsingh',
      twitter_url: 'https://twitter.com/prajjawalsingh',
      portfolio_url: 'https://prajjawalsingh.com'
    });
    console.log("✅ Fixed user_profiles");

    // 2. Insert user_settings
    await supabase.from('user_settings').upsert({
      user_id: userId,
      theme: 'dark'
    });
    console.log("✅ Fixed user_settings");

    // 3. Insert user_module_settings for all default modules
    const { data: modules } = await supabase.from('modules').select('*');
    if (modules && modules.length > 0) {
      const moduleSettings = modules.map(m => ({
        user_id: userId,
        module_id: m.id,
        is_enabled: m.is_default
      }));
      await supabase.from('user_module_settings').upsert(moduleSettings);
      console.log("✅ Fixed user_module_settings");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

run();
