import { supabase } from '~/lib/supabase';

describe('Supabase Configuration', () => {
  it('should have supabase client configured', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('should have auth methods available', () => {
    expect(typeof supabase.auth.getSession).toBe('function');
    expect(typeof supabase.auth.signInWithPassword).toBe('function');
    expect(typeof supabase.auth.signUp).toBe('function');
    expect(typeof supabase.auth.signOut).toBe('function');
  });

  it('should have database query methods available', () => {
    const query = supabase.from('projects');
    expect(query).toBeDefined();
    expect(typeof query.select).toBe('function');
    expect(typeof query.insert).toBe('function');
    expect(typeof query.update).toBe('function');
    expect(typeof query.delete).toBe('function');
  });
});