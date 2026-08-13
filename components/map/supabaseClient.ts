// supabaseClient.ts
// Redirigimos al cliente unificado para evitar múltiples instancias (Warning GoTrueClient)
export { supabase } from '@/app/lib/supabase';