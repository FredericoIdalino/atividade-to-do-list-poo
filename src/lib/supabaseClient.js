// lib/supabaseClient.js
// Este arquivo cria uma instância única do cliente Supabase
// para ser reutilizada em toda a aplicação.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Exporta um cliente compartilhado.
// Em um projeto real é importante garantir que as variáveis estejam definidas.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

