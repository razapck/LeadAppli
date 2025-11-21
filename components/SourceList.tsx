import React from 'react';
import { GroundingSource } from '../types';
import { Link2 } from 'lucide-react';

interface SourceListProps {
  sources: GroundingSource[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3 flex items-center gap-2">
        <Link2 className="w-4 h-4" /> Sources Vérifiées (Google)
      </h3>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 border border-slate-700 hover:border-blue-500 text-slate-300 text-xs py-1.5 px-3 rounded-full transition-all hover:bg-slate-800 truncate max-w-[200px]"
            title={source.title}
          >
            {source.title}
          </a>
        ))}
      </div>
    </div>
  );
};

export default SourceList;
