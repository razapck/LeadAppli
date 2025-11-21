import React from 'react';
import { Database, Search, Bot } from 'lucide-react';

interface SidebarProps {
  currentView: 'scraping' | 'leads';
  onChangeView: (view: 'scraping' | 'leads') => void;
  savedLeadsCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, savedLeadsCount }) => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50 hidden md:flex">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Bot className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">LeadScout</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button
          onClick={() => onChangeView('scraping')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
            currentView === 'scraping'
              ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Search className="w-5 h-5" />
          Scraping
        </button>

        <button
          onClick={() => onChangeView('leads')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium group ${
            currentView === 'leads'
              ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Database className="w-5 h-5" />
          <span>Mes Leads</span>
          {savedLeadsCount > 0 && (
            <span className={`ml-auto text-xs py-0.5 px-2 rounded-full ${
               currentView === 'leads' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600'
            }`}>
              {savedLeadsCount}
            </span>
          )}
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="text-blue-400 font-semibold">Astuce :</span> Sauvegardez vos leads trouvés pour les retrouver dans l'onglet "Mes Leads".
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;