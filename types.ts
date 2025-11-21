// Structure d'un résultat de recherche de lead
export interface ParsedLead {
  id: string;
  name: string;
  website?: string;
  description: string;
  email?: string;
  phone?: string;
  contactInfo?: string; // Gardé pour compatibilité ou info brute
  potentialScore: number; // 0-100
}

// Structure pour les sources de grounding (Google Search)
export interface GroundingSource {
  uri: string;
  title: string;
}

// État global de l'application
export interface AppState {
  leads: ParsedLead[];
  sources: GroundingSource[];
  rawText: string;
  isSearching: boolean;
  searchType: 'b2b' | 'local';
}