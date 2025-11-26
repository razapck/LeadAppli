import React, { useState, useEffect } from 'react';
import { ParsedLead } from './types';
import Sidebar from './components/Sidebar';
import ScrapingView from './components/ScrapingView';
import LeadsManager from './components/LeadsManager';
import { Bot, Menu, Loader2, Smartphone } from 'lucide-react';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'scraping' | 'leads'>('scraping');
  const [savedLeads, setSavedLeads] = useState<ParsedLead[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- LOGIQUE PWA (INSTALLATION) ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Empêcher Chrome d'afficher la mini barre d'info automatiquement
      e.preventDefault();
      // Stocker l'événement pour le déclencher plus tard
      setDeferredPrompt(e);
      // Afficher notre bouton d'installation personnalisé
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Afficher la demande d'installation native
    deferredPrompt.prompt();
    
    // Attendre le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // On ne peut utiliser le prompt qu'une seule fois
    setDeferredPrompt(null);
    setShowInstallButton(false);
    setIsMobileMenuOpen(false); // Fermer le menu mobile si ouvert
  };
  // ----------------------------------

  // Fetch leads from Supabase on mount
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('Lead')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedLeads: ParsedLead[] = data.map((row: any) => ({
          id: row.id.toString(),
          name: row.nom || 'Inconnu',
          description: row.activite || '',
          website: row.url_site,
          email: row.email,
          phone: row.tel,
          potentialScore: row.score || 0,
          contactInfo: [row.email, row.tel].filter(Boolean).join(' | ')
        }));
        setSavedLeads(mappedLeads);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLead = async (lead: ParsedLead) => {
    // Éviter les doublons (vérification par nom côté client pour l'UI, mais idéalement contrainte UNIQUE en DB)
    if (savedLeads.some(l => l.name.toLowerCase() === lead.name.toLowerCase())) {
      alert("Ce lead existe déjà dans votre base de données.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Lead')
        .insert([
          {
            nom: lead.name,
            activite: lead.description,
            url_site: lead.website,
            email: lead.email,
            tel: lead.phone,
            score: lead.potentialScore
          }
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newLeadRow = data[0];
        const newLead: ParsedLead = {
          id: newLeadRow.id.toString(),
          name: newLeadRow.nom,
          description: newLeadRow.activite,
          website: newLeadRow.url_site,
          email: newLeadRow.email,
          phone: newLeadRow.tel,
          potentialScore: newLeadRow.score,
          contactInfo: [newLeadRow.email, newLeadRow.tel].filter(Boolean).join(' | ')
        };
        setSavedLeads(prev => [newLead, ...prev]);
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du lead:", err);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleUpdateLead = async (updatedLead: ParsedLead) => {
    try {
      const { error } = await supabase
        .from('Lead')
        .update({
          nom: updatedLead.name,
          activite: updatedLead.description,
          url_site: updatedLead.website,
          email: updatedLead.email,
          tel: updatedLead.phone,
          score: updatedLead.potentialScore
        })
        .eq('id', parseInt(updatedLead.id));

      if (error) throw error;

      setSavedLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      alert("Erreur lors de la mise à jour.");
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce lead ?")) return;

    try {
      const { error } = await supabase
        .from('Lead')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      setSavedLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression.");
    }
  };

  const handleCreateLead = async (newLead: ParsedLead) => {
    await handleSaveLead(newLead); // Réutilise la logique d'insertion
  };

  // Création d'un Set des NOMS des leads sauvegardés pour une vérification rapide dans ScrapingView
  // On utilise le Nom car l'ID temporaire du scraping ne correspond pas à l'ID Supabase
  const savedLeadNames = new Set(savedLeads.map(l => l.name.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 flex">
      {/* Sidebar (Desktop) */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }} 
        savedLeadsCount={savedLeads.length}
        showInstallButton={showInstallButton}
        onInstallClick={handleInstallClick}
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/95 z-40 md:hidden pt-20 px-6 backdrop-blur-sm">
          <nav className="flex flex-col gap-4 text-lg">
             {showInstallButton && (
                <button 
                  onClick={handleInstallClick}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 font-bold shadow-lg shadow-emerald-900/20 transition-transform active:scale-95 mb-4"
                >
                  <Smartphone className="w-6 h-6" />
                  Installer l'application
                </button>
             )}

             <button 
               onClick={() => { setCurrentView('scraping'); setIsMobileMenuOpen(false); }} 
               className={`p-4 rounded-xl flex items-center gap-3 font-medium transition-colors ${
                 currentView === 'scraping' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
               }`}
             >
               Scraping
             </button>
             
             <button 
               onClick={() => { setCurrentView('leads'); setIsMobileMenuOpen(false); }} 
               className={`p-4 rounded-xl flex items-center gap-3 font-medium transition-colors ${
                 currentView === 'leads' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
               }`}
             >
               Mes Leads 
               <span className="ml-auto bg-slate-900/50 px-2 py-0.5 rounded text-sm">{savedLeads.length}</span>
             </button>
          </nav>
        </div>
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300">
        {/* Navbar */}
        <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden">
               <button 
                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                 className="p-2 -ml-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
               >
                 <Menu className="w-7 h-7" />
               </button>
               <div className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
                 <Bot className="w-5 h-5 text-blue-500" />
                 LeadScout
               </div>
            </div>
            
            {/* Desktop Title Spacer */}
            <div className="hidden md:flex items-center gap-2 opacity-0"></div>

            <div className="flex items-center gap-4">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-400" />}
              <div className="text-xs text-slate-500 font-medium px-3 py-1 rounded-full bg-slate-800 border border-slate-700 flex items-center gap-2">
                 <Bot className="w-3 h-3" /> <span className="hidden sm:inline">Propulsé par</span> Gemini 2.5
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="mb-8 mt-2">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {currentView === 'scraping' ? 'Génération de Leads' : 'Mes Leads Enregistrés'}
              </h1>
              <p className="text-slate-400">
                {currentView === 'scraping' 
                  ? "Utilisez l'IA pour scraper le web sémantique et trouver vos prochains clients."
                  : "Gérez votre base de données Supabase, modifiez ou exportez vos contacts."
                }
              </p>
            </div>

            {/* View Content */}
            <div className="animate-fade-in">
              {currentView === 'scraping' ? (
                <ScrapingView 
                  onSaveLead={handleSaveLead}
                  savedLeadNames={savedLeadNames}
                />
              ) : (
                <LeadsManager 
                  leads={savedLeads}
                  onCreateLead={handleCreateLead}
                  onUpdateLead={handleUpdateLead}
                  onDeleteLead={handleDeleteLead}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;