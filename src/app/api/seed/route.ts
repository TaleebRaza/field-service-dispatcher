import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase Admin credentials' }, { status: 500 });
  }

  // Initialize Admin Client to bypass RLS and GoTrue limitations
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Demo credentials from project requirements
    const usersToCreate = [
      { email: 'dispatcher@demo.com', password: 'demo1234', role: 'dispatcher', name: 'Admin Dispatcher' },
      { email: 'tech1@demo.com', password: 'demo1234', role: 'technician', name: 'Tech One' },
      { email: 'tech2@demo.com', password: 'demo1234', role: 'technician', name: 'Tech Two' }
    ];

    const createdProfiles = [];

    for (const u of usersToCreate) {
      // 1. Create user safely via GoTrue Admin API
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true // Force confirmation so they can log in immediately
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          continue; // Skip if we already seeded this user
        }
        throw authError;
      }

      const userId = authData.user.id;

      // 2. Create the associated profile
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        full_name: u.name,
        role: u.role
      });

      if (profileError) throw profileError;

      // 3. If it is a technician, create their live map tracking record
      if (u.role === 'technician') {
        const { error: techError } = await supabaseAdmin.from('technicians').insert({
          profile_id: userId,
          // Base coordinates set near Wah, Punjab
          current_lat: 33.7744 + (Math.random() * 0.01), 
          current_lng: 72.7128 + (Math.random() * 0.01),
          status: 'available'
        });
        
        if (techError) throw techError;
      }

      createdProfiles.push(u.email);
    }

    return NextResponse.json({ message: 'Seed successful', created: createdProfiles });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}