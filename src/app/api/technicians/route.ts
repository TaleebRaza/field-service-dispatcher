import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // Fetch technicians and join with the profiles table (Removed 'email' from the select statement)
  const { data, error } = await supabase
    .from('technicians')
    .select(`
      *,
      profiles ( full_name )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}