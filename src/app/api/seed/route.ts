import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Missing Supabase Admin credentials' }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    const usersToCreate = [
      { email: 'dispatcher@demo.com', password: 'demo1234', role: 'dispatcher', name: 'Admin Dispatcher' },
      { email: 'tech1@demo.com', password: 'demo1234', role: 'technician', name: 'Tech One' },
      { email: 'tech2@demo.com', password: 'demo1234', role: 'technician', name: 'Tech Two' }
    ];

    const processedProfiles = [];

    for (const u of usersToCreate) {
      let userId;

      // 1. Try to create the user
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true 
      });

      // 2. Handle the "already registered" error
      if (authError) {
        if (authError.message.includes('already') && authError.message.includes('registered')) {
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = existingUsers.users.find(user => user.email === u.email);
          if (existingUser) {
            userId = existingUser.id;
          } else {
            throw authError;
          }
        } else {
          throw authError; 
        }
      } else {
        userId = authData.user.id;
      }

      // 3. Upsert the profile (id is the Primary Key, so upsert works natively here)
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: userId,
        full_name: u.name,
        role: u.role
      });

      if (profileError) throw profileError;

      // 4. THE CONSTRAINT FIX: Manually check if the tech exists to avoid the constraint error
      if (u.role === 'technician') {
        const laPayload = {
          profile_id: userId,
          current_lat: 34.0522 + (Math.random() * 0.08 - 0.04), // LA Offset
          current_lng: -118.2437 + (Math.random() * 0.08 - 0.04),
          status: 'available'
        };

        // Ask the DB if this tech already has a row
        const { data: existingTech } = await supabaseAdmin
          .from('technicians')
          .select('id')
          .eq('profile_id', userId)
          .single();

        if (existingTech) {
          // They exist! Update their location to LA.
          const { error: updateError } = await supabaseAdmin
            .from('technicians')
            .update(laPayload)
            .eq('profile_id', userId);
          if (updateError) throw updateError;
        } else {
          // They are new! Insert them into LA.
          const { error: insertError } = await supabaseAdmin
            .from('technicians')
            .insert(laPayload);
          if (insertError) throw insertError;
        }
      }

      processedProfiles.push(u.email);
    }

    return NextResponse.json({ message: 'Seed & LA Relocation successful', processed: processedProfiles });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}