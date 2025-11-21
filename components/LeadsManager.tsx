import React, { useState } from 'react';
import { ParsedLead } from '../types';
import { Search, Plus, Trash2, Edit, Mail, Phone, Globe, Building2, Save, X, AlertCircle, Eye, Calendar, Hash } from 'lucide-react';

interface LeadsManagerProps {
  leads: ParsedLead[];
  onUpdateLead: (lead: ParsedLead) => void;
  onDeleteLead: (id: string) => void;
  onCreateLead: (lead: ParsedLead) => void;
}

const LeadsManager: React.FC<LeadsManagerProps> = ({ leads, onUpdateLead, onDeleteLead, onCreateLead }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Edit/Create Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ParsedLead | null>(null);
  
  // State for View Modal
  const [viewingLead, setViewingLead] = useState<ParsedLead | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ParsedLead>>({
    name: '', description: '', email: '', phone: '', website: '', potentialScore: 50
  });

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingLead(null);
    setFormData({ name: '', description: '', email: '', phone: '', website: '', potentialScore: 50 });
    setIsEditModalOpen(true);
  };

  const openEditModal = (lead: ParsedLead) => {
    setEditingLead(lead);
    setFormData({ ...lead });
    setIsEditModalOpen(true);
  };

  const openViewModal = (lead: ParsedLead) => {
    setViewingLead(lead);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) return;

    const leadToSave: ParsedLead = {
      id: editingLead ? editingLead.id : `manual-${Date.now()}`,
      name: formData.name,
      description: formData.description || 'Non spécifié',
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      potentialScore: formData.potentialScore || 50,
      contactInfo: [formData.email, formData.phone].filter(Boolean).join(" | ")
    };

    if (editingLead) {
      onUpdateLead(leadToSave);
    } else {
      onCreateLead(leadToSave);
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            placeholder="Rechercher dans mes leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau Lead
        </button>
      </div>

      {/* Table view */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden backdrop-blur-sm shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Nom / Activité</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Contact</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase">Site Web</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-center">Score</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredLeads.length > 0 ? (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-700/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">{lead.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {lead.email ? (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Mail className="w-3 h-3 text-emerald-400" /> {lead.email}
                          </div>
                        ) : <span className="text-xs text-slate-600 italic flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Email manquant</span>}
                        {lead.phone ? (
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Phone className="w-3 h-3 text-emerald-400" /> {lead.phone}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4">
                      {lead.website ? (
                        <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {lead.website}
                        </a>
                      ) : <span className="text-xs text-slate-600">Non spécifié</span>}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold border ${
                        lead.potentialScore >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                        lead.potentialScore >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                        'text-slate-400 border-slate-500/30 bg-slate-500/10'
                      }`}>
                        {lead.potentialScore}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openViewModal(lead)} className="p-2 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400 transition-colors" title="Voir détails">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(lead)} className="p-2 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-colors" title="Éditer">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteLead(lead.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    {searchTerm ? "Aucun lead ne correspond à la recherche." : "Aucun lead enregistré pour le moment."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {viewingLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex justify-between items-start bg-slate-900/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-white">{viewingLead.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 ${
                    viewingLead.potentialScore >= 80 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                    viewingLead.potentialScore >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                    'text-slate-400 border-slate-500/30 bg-slate-500/10'
                  }`}>
                    Score: {viewingLead.potentialScore}%
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{viewingLead.description}</p>
              </div>
              <button onClick={() => setViewingLead(null)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">
                    Coordonnées
                  </h4>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="p-2 bg-emerald-500/10 rounded-full">
                      <Mail className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Email</div>
                      <div className="text-slate-200 font-medium select-all">
                        {viewingLead.email || <span className="text-slate-600 italic">Non renseigné</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="p-2 bg-emerald-500/10 rounded-full">
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Téléphone</div>
                      <div className="text-slate-200 font-medium select-all">
                        {viewingLead.phone || <span className="text-slate-600 italic">Non renseigné</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">
                    Entreprise
                  </h4>

                   <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs text-slate-500">Site Web</div>
                      <div className="text-slate-200 font-medium truncate">
                         {viewingLead.website ? (
                          <a href={viewingLead.website.startsWith('http') ? viewingLead.website : `https://${viewingLead.website}`} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="text-blue-400 hover:underline">
                            {viewingLead.website}
                          </a>
                        ) : <span className="text-slate-600 italic">Non renseigné</span>}
                      </div>
                    </div>
                  </div>

                   <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <div className="p-2 bg-slate-700/30 rounded-full">
                      <Hash className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">ID Système</div>
                      <div className="text-slate-400 font-mono text-xs">
                        {viewingLead.id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setViewingLead(null);
                    openEditModal(viewingLead);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Modifier
                </button>
                <button 
                  onClick={() => setViewingLead(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                {editingLead ? <Edit className="w-4 h-4 text-blue-400"/> : <Plus className="w-4 h-4 text-emerald-400"/>}
                {editingLead ? 'Modifier le Lead' : 'Créer un nouveau Lead'}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Nom de l'entreprise</label>
                <input required type="text" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Activité</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Email</label>
                  <input type="email" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Téléphone</label>
                  <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Site Web</label>
                <input type="text" className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase mb-1">Score (0-100)</label>
                <input type="range" min="0" max="100" className="w-full" 
                  value={formData.potentialScore} onChange={e => setFormData({...formData, potentialScore: parseInt(e.target.value)})} />
                <div className="text-right text-xs text-slate-400">{formData.potentialScore}%</div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center gap-2">
                  <Save className="w-4 h-4" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsManager;