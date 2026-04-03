import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { jobId, technicianId } = body;

  if (!jobId || !technicianId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Update the job: set status to in_progress and assign the technician
  const { data, error } = await supabase
    .from('jobs')
    .update({ 
      status: 'in_progress',
      assigned_to: technicianId,
      updated_at: new Date().toISOString()
    })
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Job assigned successfully', job: data });
}