import React from 'react';
import { ParsedLead } from '../types';
import { ExternalLink, Mail, Globe, Building2, Star, Phone, Check, Ban, PlusCircle, CheckCircle2 } from 'lucide-react';

interface LeadCardProps {
  lead: ParsedLead;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onSave?: () => void;
  isSaved?: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, isSelected, onToggle, onSave, isSaved }) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
  };

  return (
    <div 
      className={`bg-slate-800 rounded-xl border transition-all duration-300 shadow-sm hover:shadow-md group relative overflow-hidden flex flex-col h-full ${
        isSelected ? 'border-blue-500 ring-1 ring-blue-500/30' : 'border-slate-700 hover:border-blue-500/50'
      }`}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
        <Building2 className="w-24 h-24 text-blue-400 transform rotate-12" />
      </div>
      
      {/* Checkbox area */}
      <div 
        onClick={() => onToggle(lead.id)}
        className="absolute top-0 left-0 p-3 z-20 cursor-pointer"
      >
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
          isSelected 
            ? 'bg-blue-600 border-blue-600' 
            : 'bg-slate-900/50 border-slate-600 hover:border-blue-400'
        }`}>
          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>

      <div className="relative z-10 flex-1 p-5 pt-5">
        <div className="flex justify-between items-start mb-3 gap-2 pl-6">
          <h3 className="text-lg font-bold text-white truncate flex-1" title={lead.name}>{lead.name}</h3>
          <div className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 shrink-0 ${getScoreColor(lead.potentialScore)}`}>
            <Star className="w-3 h-3 fill-current" />
            {lead.potentialScore}%
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-4 line-clamp-3 min-h-[3rem] pl-1">
          {lead.description}
        </p>

        <div className="space-y-3 text-sm border-t border-slate-700/50 pt-3 mt-auto">
          {/* Website Section */}
          <div className="flex items-center">
            <Globe className={`w-4 h-4 mr-2 flex-shrink-0 ${lead.website ? 'text-blue-400' : 'text-slate-600'}`} />
            {lead.website ? (
              <a 
                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 hover:underline truncate flex items-center"
              >
                <span className="truncate max-w-[200px]">{lead.website}</span>
                <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
              </a>
            ) : (
              <span className="text-amber-500/80 italic text-xs cursor-not-allowed">à compléter</span>
            )}
          </div>
          
          {/* Email Section */}
          <div className="flex items-center justify-between group/item">
            <div className="flex items-center overflow-hidden">
              <Mail className={`w-4 h-4 mr-2 flex-shrink-0 ${lead.email ? 'text-emerald-400' : 'text-slate-600'}`} />
              {lead.email ? (
                <span className="text-slate-200 truncate select-all font-medium" title={lead.email}>{lead.email}</span>
              ) : (
                <span className="text-amber-500/80 italic text-xs flex items-center">
                  à compléter
                </span>
              )}
            </div>
            {!lead.email && (
               <Ban className="w-4 h-4 text-slate-700 flex-shrink-0" />
            )}
          </div>

          {/* Phone Section */}
          <div className="flex items-center justify-between group/item">
             <div className="flex items-center overflow-hidden">
              <Phone className={`w-4 h-4 mr-2 flex-shrink-0 ${lead.phone ? 'text-emerald-400' : 'text-slate-600'}`} />
              {lead.phone ? (
                <span className="text-slate-200 truncate select-all font-medium">{lead.phone}</span>
              ) : (
                <span className="text-amber-500/80 italic text-xs flex items-center">
                  à compléter
                </span>
              )}
            </div>
            {!lead.phone && (
               <Ban className="w-4 h-4 text-slate-700 flex-shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Save Action */}
      {onSave && (
        <div className="absolute bottom-0 right-0 w-full bg-slate-900/90 backdrop-blur translate-y-full group-hover:translate-y-0 transition-transform p-2 flex justify-end border-t border-slate-700">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (!isSaved) onSave();
            }}
            disabled={isSaved}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isSaved 
                ? 'bg-emerald-500/20 text-emerald-400 cursor-default' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
            }`}
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Enregistré
              </>
            ) : (
              <>
                <PlusCircle className="w-3.5 h-3.5" />
                Ajouter à mes leads
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadCard;