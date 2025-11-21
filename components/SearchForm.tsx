import React, { useState } from 'react';
import { Search, MapPin, Briefcase, SlidersHorizontal, Hash } from 'lucide-react';

interface SearchFormProps {
  onSearch: (industry: string, location: string, details: string, min: number, max: number) => void;
  isSearching: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isSearching }) => {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [minLeads, setMinLeads] = useState(5);
  const [maxLeads, setMaxLeads] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (industry && location) {
      onSearch(industry, location, details, minLeads, maxLeads);
    }
  };

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-blue-400" />
        Nouvelle Recherche
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase">Secteur / Activité</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Ex: Agences Marketing..."
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase">Localisation</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Ex: Paris, Lyon..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1">
               Min Leads
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min="1"
                max="50"
                value={minLeads}
                onChange={(e) => setMinLeads(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1">
               Max Leads
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="number"
                min="1"
                max="50"
                value={maxLeads}
                onChange={(e) => setMaxLeads(parseInt(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1">
             Détails spécifiques (Optionnel)
          </label>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Ex: Cherche des startups..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className={`w-full font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            isSearching
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
          }`}
        >
          {isSearching ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Recherche & Scraping en cours...
            </>
          ) : (
            <>Lancer le Scraping AI</>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;