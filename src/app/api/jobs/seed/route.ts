import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DUMMY_JOBS = [
  // --- Original 10 ---
  { customer_name: 'Crypto.com Arena', address: '1111 S Figueroa St', lat: 34.0430, lng: -118.2673, job_type: 'hvac', priority: 'urgent', estimated_duration: 120, notes: 'Suite level AC failure before game.' },
  { customer_name: 'Griffith Observatory', address: '2800 E Observatory Rd', lat: 34.1184, lng: -118.3004, job_type: 'detailing', priority: 'medium', estimated_duration: 60, notes: 'Mobile wash for director car.' },
  { customer_name: 'The Grove', address: '189 The Grove Dr', lat: 34.0722, lng: -118.3581, job_type: 'hvac', priority: 'urgent', estimated_duration: 180, notes: 'Main fountain pump maintenance.' },
  { customer_name: 'Santa Monica Pier', address: '200 Santa Monica Pier', lat: 34.0092, lng: -118.4976, job_type: 'hvac', priority: 'low', estimated_duration: 45, notes: 'Routine filter changes at restaurant.' },
  { customer_name: 'UCLA Campus', address: '405 Hilgard Ave', lat: 34.0689, lng: -118.4452, job_type: 'grooming', priority: 'medium', estimated_duration: 90, notes: 'Standard wash and trim.' },
  { customer_name: 'Rodeo Drive Boutique', address: 'Rodeo Dr, Beverly Hills', lat: 34.0678, lng: -118.4010, job_type: 'detailing', priority: 'urgent', estimated_duration: 120, notes: 'VIP client detailing in basement.' },
  { customer_name: 'Cedars-Sinai ICU', address: '8700 Beverly Blvd', lat: 34.0761, lng: -118.3804, job_type: 'hvac', priority: 'urgent', estimated_duration: 240, notes: 'Critical cooling issue in ICU.' },
  { customer_name: 'Hollywood Bowl', address: '2301 N Highland Ave', lat: 34.1122, lng: -118.3391, job_type: 'hvac', priority: 'medium', estimated_duration: 90, notes: 'Backstage climate control down.' },
  { customer_name: 'LAX Terminal 4', address: '1 World Way', lat: 33.9416, lng: -118.4085, job_type: 'hvac', priority: 'urgent', estimated_duration: 300, notes: 'Lounge AC maintenance.' },
  { customer_name: 'Venice Skatepark', address: '1800 Ocean Front Walk', lat: 33.9870, lng: -118.4730, job_type: 'detailing', priority: 'low', estimated_duration: 45, notes: 'Cleanup and wax application.' },

  // --- 10 New Dummy Jobs ---
  { customer_name: 'Dodger Stadium', address: '1000 Vin Scully Ave', lat: 34.0739, lng: -118.2400, job_type: 'hvac', priority: 'urgent', estimated_duration: 150, notes: 'Club level AC compressor failure.' },
  { customer_name: 'Universal Studios', address: '100 Universal City Plaza', lat: 34.1381, lng: -118.3534, job_type: 'detailing', priority: 'medium', estimated_duration: 75, notes: 'Tram exterior detailing for filming.' },
  { customer_name: 'Getty Center', address: '1200 Getty Center Dr', lat: 34.0775, lng: -118.4725, job_type: 'hvac', priority: 'medium', estimated_duration: 120, notes: 'Museum humidity control adjustment.' },
  { customer_name: 'Long Beach Port', address: 'Port of Long Beach', lat: 33.7562, lng: -118.2208, job_type: 'grooming', priority: 'low', estimated_duration: 60, notes: 'Fleet vehicle wash rotation.' },
  { customer_name: 'Disneyland Resort', address: '1313 Disneyland Dr', lat: 33.8121, lng: -117.9190, job_type: 'hvac', priority: 'urgent', estimated_duration: 200, notes: 'Park AC failure on main street.' },
  { customer_name: 'Pasadena City Hall', address: '100 N Garfield Ave', lat: 34.1478, lng: -118.1445, job_type: 'detailing', priority: 'low', estimated_duration: 90, notes: 'Mayoral vehicle full detail.' },
  { customer_name: 'Staples Center (now Crypto)', address: '1111 S Figueroa St', lat: 34.0430, lng: -118.2673, job_type: 'hvac', priority: 'urgent', estimated_duration: 180, notes: 'Press box AC emergency.' },
  { customer_name: 'Beverly Wilshire Hotel', address: '9500 Wilshire Blvd', lat: 34.0670, lng: -118.4000, job_type: 'hvac', priority: 'medium', estimated_duration: 100, notes: 'Lobby ventilation issue.' },
  { customer_name: 'USC Galen Center', address: '3400 S Figueroa St', lat: 34.0205, lng: -118.2850, job_type: 'detailing', priority: 'medium', estimated_duration: 65, notes: 'Event fleet prep for graduation.' },
  { customer_name: 'LA Zoo', address: '5333 Zoo Dr', lat: 34.1485, lng: -118.2842, job_type: 'hvac', priority: 'low', estimated_duration: 80, notes: 'Reptile house climate check.' }
];

export async function POST() {
  const supabase = await createClient();

  // THE FIX: Randomly pick between 3 and 6 jobs
  const numJobsToCreate = Math.floor(Math.random() * 4) + 3; 

  // Shuffle and pick the dynamic amount
  const shuffled = [...DUMMY_JOBS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numJobsToCreate).map(job => ({
    ...job,
    status: 'unassigned' 
  }));

  const { error } = await supabase.from('jobs').insert(selected);

  if (error) {
    console.error("🚨 Supabase Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: `Seeded ${numJobsToCreate} new LA jobs` });
}