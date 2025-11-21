import React, { useState } from 'react';
import { searchLeads, parseLeadsFromText } from '../services/geminiService';
import { ParsedLead, GroundingSource } from '../types';
import SearchForm from './SearchForm';
import LeadCard from './LeadCard';
import StatsChart from './StatsChart';
import SourceList from './SourceList';
import { LayoutDashboard, Download, AlertCircle, Send, CheckCircle, XCircle, Square, CheckSquare } from 'lucide-react';

const WEBHOOK_URL = "https://pckraz-n8n.hf.space/webhook/3f79a64a-e621-4844-a815-aa810650debb";

interface ScrapingViewProps {
  onSaveLead: (lead: ParsedLead) => void;
  savedLeadNames: Set<string>;
}

const ScrapingView: React.FC<ScrapingViewProps> = ({ onSaveLead, savedLeadNames }) => {
  const [leads, setLeads] = useState<ParsedLead[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSearch = async (industry: string, location: string, details: string, minLeads: number, maxLeads: number) => {
    setIsSearching(true);
    setError(null);
    setLeads([]);
    setSources([]);
    setHasSearched(true);
    setWebhookStatus('idle');
    setSelectedLeadIds(new Set());

    try {
      const { text, sources: foundSources } = await searchLeads(industry, location, details, minLeads, maxLeads);
      const parsedLeads = parseLeadsFromText(text);
      
      if (parsedLeads.length === 0) {
        setError("L'IA a répondu mais le formatage automatique a échoué. Essayez de reformuler.");
        console.log("Raw Text received:", text);
      } else {
        setLeads(parsedLeads);
        setSources(foundSources);
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la communication avec Gemini AI. Vérifiez votre clé API.");
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleLeadSelection = (id: string) => {
    const newSelection = new Set(selectedLeadIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedLeadIds(newSelection);
  };

  const toggleAllLeads = () => {
    if (selectedLeadIds.size === leads.length) {
      setSelectedLeadIds(new Set());
    } else {
      const allIds = new Set(leads.map(l => l.id));
      setSelectedLeadIds(allIds);
    }
  };

  const handleExport = () => {
    if (leads.length === 0) return;
    const leadsToExport = selectedLeadIds.size > 0 
      ? leads.filter(l => selectedLeadIds.has(l.id))
      : leads;
    
    const headers = ["Nom", "Site Web", "Email", "Téléphone", "Activité", "Score"];
    const csvContent = [
      headers.join(","),
      ...leadsToExport.map(lead => 
        [
          `"${lead.name}"`, 
          `"${lead.website || ''}"`, 
          `"${lead.email || ''}"`,
          `"${lead.phone || ''}"`,
          `"${lead.description.replace(/"/g, '""')}"`,
          lead.potentialScore
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToWebhook = async () => {
    if (leads.length === 0) return;
    const leadsToSend = selectedLeadIds.size > 0
      ? leads.filter(l => selectedLeadIds.has(l.id))
      : leads;
    
    setIsSending(true);
    setWebhookStatus('idle');

    try {
      const payload = {
        source: "LeadScout AI",
        timestamp: new Date().toISOString(),
        leadsCount: leadsToSend.length,
        leads: leadsToSend.map(lead => ({
          id: lead.id,
          name: lead.name,
          description: lead.description,
          website: lead.website ?? null,
          email: lead.email ?? null,
          phone: lead.phone ?? null,
          potentialScore: lead.potentialScore,
          contactInfo: lead.contactInfo ?? null
        }))
      };

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setWebhookStatus('success');
        setTimeout(() => setWebhookStatus('idle'), 3000);
      } else {
        setWebhookStatus('error');
        console.error('Webhook error:', response.status, response.statusText);
        if (response.status === 404) {
          const isTestUrl = WEBHOOK_URL.includes('webhook-test');
          const msg = isTestUrl 
            ? "Erreur 404 (Test) : Le Webhook n'écoute pas.\n\n👉 Cliquez sur 'Execute Workflow' dans n8n pour activer l'écoute."
            : "Erreur 404 (Production) : Webhook introuvable.\n\n👉 Vérifiez que le Workflow est bien activé (Switch 'Active' en haut à droite).";
          alert(msg);
        } else {
           alert(`Erreur ${response.status} lors de l'envoi au webhook.`);
        }
      }
    } catch (err) {
      console.error('Webhook network error:', err);
      setWebhookStatus('error');
      alert("Erreur réseau lors de la connexion au webhook. Vérifiez votre connexion ou l'URL.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <SearchForm onSearch={handleSearch} isSearching={isSearching} />
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {leads.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                  Résultats ({leads.length})
                </h2>
                
                <button 
                  onClick={toggleAllLeads}
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-800"
                >
                  {selectedLeadIds.size === leads.length && leads.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Tout sélectionner
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={handleExport}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                >
                  <Download className="w-4 h-4" />
                  CSV {selectedLeadIds.size > 0 ? `(${selectedLeadIds.size})` : ''}
                </button>
                
                <button 
                  onClick={handleSendToWebhook}
                  disabled={isSending || webhookStatus === 'success'}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    webhookStatus === 'success' 
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                      : webhookStatus === 'error'
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-500/20'
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi...
                    </>
                  ) : webhookStatus === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Envoyé !
                    </>
                  ) : webhookStatus === 'error' ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      Réessayer
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {selectedLeadIds.size > 0 ? `(${selectedLeadIds.size})` : `Tout`}
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leads.map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  isSelected={selectedLeadIds.has(lead.id)}
                  onToggle={toggleLeadSelection}
                  onSave={() => onSaveLead(lead)}
                  // On compare le nom minuscule car les ID scraping/Supabase sont différents
                  isSaved={savedLeadNames.has(lead.name.toLowerCase())}
                />
              ))}
            </div>
            <SourceList sources={sources} />
          </div>
        )}

        {hasSearched && leads.length === 0 && !isSearching && !error && (
           <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
             <p className="text-slate-400">Aucun lead structuré trouvé. Essayez d'élargir votre recherche.</p>
           </div>
        )}
      </div>

      <div className="space-y-6">
         {leads.length > 0 ? (
            <StatsChart leads={leads} />
         ) : (
           <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg h-64 flex items-center justify-center text-slate-500 text-sm text-center">
             <p>Lancez une recherche pour voir l'analyse des leads.</p>
           </div>
         )}
         
         <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/20">
            <h3 className="font-semibold text-blue-400 mb-2">Information</h3>
            <p className="text-sm text-blue-200/80 leading-relaxed mb-4">
              Les résultats de scraping sont temporaires. 
              Utilisez le bouton "+" sur une carte pour l'enregistrer définitivement dans votre base de données.
            </p>
         </div>
      </div>
    </div>
  );
};

export default ScrapingView;