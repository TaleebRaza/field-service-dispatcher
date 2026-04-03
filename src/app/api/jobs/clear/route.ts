import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE() {
  const supabase = await createClient();

  // Delete all jobs to reset the board completely
  const { error } = await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Hack to delete all rows safely

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Database cleared' });
}