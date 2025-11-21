import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://svwtgvxahbqcjwnxhbqk.supabase.co';
// ⚠️ REMPLACEZ LA VALEUR CI-DESSOUS PAR VOTRE CLÉ SUPABASE (ANON KEY) ⚠️
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2d3RndnhhaGJxY2p3bnhoYnFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYxNTY1MCwiZXhwIjoyMDc5MTkxNjUwfQ.rWoIuMXt2UcFjBJj3md6ERRoBPqNWz1Osi3TejTQmtA'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);