'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1. Authenticate user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // 2. Fetch the user's role from the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      setError('Could not fetch user profile details.');
      setLoading(false);
      return;
    }

    // 3. Route them to the correct dashboard based on their role
    if (profileData.role === 'dispatcher') {
      router.push('/dispatcher');
    } else if (profileData.role === 'technician') {
      router.push('/technician');
    } else {
      setError('Invalid user role assigned.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0f11] text-[#e8e6df] p-4">
      <div className="w-full max-w-md bg-[#161a1e] p-8 rounded-lg border border-[#2a2e35] shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold mb-2">Field Service Dispatcher</h1>
          <p className="text-[#888780] text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-mono mb-2 text-[#888780]">EMAIL_ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#1e2329] border border-[#2a2e35] rounded px-4 py-2 text-[#e8e6df] focus:outline-none focus:border-[#1d9e75] transition-colors"
              placeholder="dispatcher@demo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-mono mb-2 text-[#888780]">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1e2329] border border-[#2a2e35] rounded px-4 py-2 text-[#e8e6df] focus:outline-none focus:border-[#1d9e75] transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-[#E24B4A]/10 border border-[#E24B4A]/20 rounded text-[#E24B4A] text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1d9e75] hover:bg-[#157a5a] text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs font-mono text-[#888780]">
          <p>Demo accounts:</p>
          <p>dispatcher@demo.com / demo1234</p>
          <p>tech1@demo.com / demo1234</p>
        </div>
      </div>
    </div>
  );
}