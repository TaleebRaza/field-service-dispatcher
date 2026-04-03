import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DUMMY_JOBS = [
  { customer_name: 'TechFlow HQ', address: 'Plot 45, I-9/2', lat: 33.6628, lng: 73.0458, job_type: 'hvac', priority: 'urgent', estimated_duration: 120, notes: 'Main server room AC failure.' },
  { customer_name: 'Dr. Raza', address: 'F-11 Markaz', lat: 33.6844, lng: 72.9881, job_type: 'detailing', priority: 'medium', estimated_duration: 60, notes: 'Mobile wash for Land Cruiser.' },
  // FIXED: Changed 'repair' to 'hvac'
  { customer_name: 'Centaurus Mall', address: 'Jinnah Avenue', lat: 33.7077, lng: 73.0501, job_type: 'hvac', priority: 'urgent', estimated_duration: 180, notes: 'Escalator B maintenance.' },
  { customer_name: 'Blue Area Plaza', address: 'Block D, Blue Area', lat: 33.7104, lng: 73.0633, job_type: 'hvac', priority: 'low', estimated_duration: 45, notes: 'Routine filter changes.' },
  // FIXED: Changed 'repair' to 'grooming'
  { customer_name: 'NUST Campus', address: 'H-12 Sector', lat: 33.6425, lng: 72.9930, job_type: 'grooming', priority: 'medium', estimated_duration: 90, notes: 'Standard wash and trim.' },
  { customer_name: 'Safa Gold Mall', address: 'F-7 Markaz', lat: 33.7225, lng: 73.0556, job_type: 'detailing', priority: 'urgent', estimated_duration: 120, notes: 'VIP client detailing in basement.' },
  { customer_name: 'Bahria Town Hospital', address: 'Phase 8, Bahria', lat: 33.5204, lng: 73.1118, job_type: 'hvac', priority: 'urgent', estimated_duration: 240, notes: 'Critical cooling issue in ICU.' }
];

export async function POST() {
  const supabase = await createClient();

  // Shuffle and pick 5 random jobs
  const shuffled = [...DUMMY_JOBS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5).map(job => ({
    ...job,
    status: 'unassigned' // Initialize as unassigned
  }));

  const { error } = await supabase.from('jobs').insert(selected);

  if (error) {
    console.error("🚨 Supabase Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Seeded 5 new jobs' });
}