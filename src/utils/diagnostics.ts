
import { supabase } from '@/integrations/supabase/client';

// Helper function to invoke edge functions with timeout
export const invokeWithTimeout = async <T>(
  fnName: string,
  timeout = 15000
): Promise<{ data: T | null; error: any | null }> => {
  return Promise.race([
    supabase.functions.invoke<T>(fnName),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeout);
    })
  ]) as Promise<{ data: T | null; error: any | null }>;
};
