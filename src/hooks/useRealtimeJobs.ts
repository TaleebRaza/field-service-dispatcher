'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Pulled fetch logic out so it can be called dynamically
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data) setJobs(data);
      if (error) console.error("Error fetching jobs:", error);
      setLoading(false);
    }
    
    // Initial fetch on page load
    fetchJobs();

    const uniqueChannelName = `realtime-jobs-${Date.now()}-${Math.random()}`;

    const channel = supabase.channel(uniqueChannelName)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs' }, 
        (payload) => {
          // LOUD DEBUGGING
          console.log("🔥 Realtime Job Event:", payload.eventType);

          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            // BULK OPERATION FIX: Guarantee 100% sync by pulling fresh data
            fetchJobs();
          } else if (payload.eventType === 'UPDATE') {
            // OPTIMISTIC UPDATE: Keep drag-and-drop lightning fast
            setJobs((prev) => prev.map((job) => job.id === payload.new.id ? payload.new : job));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { jobs, loading };
}