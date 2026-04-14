import React from 'react';
import { Download, Copy, Check } from 'lucide-react';

interface ReportActionsProps {
    onDownload: () => void;
    onCopy: () => void;
    copied: boolean;
}

const ReportActions: React.FC<ReportActionsProps> = ({ onDownload, onCopy, copied }) => {
    return (
        <div className="flex gap-2">
            <button
                onClick={onCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B5A47] hover:bg-emerald-100 text-[#CFE5DA] text-xs font-bold uppercase tracking-wider transition-colors"
            >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy Summary'}
            </button>
            <button
                onClick={onDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-[#F8F9FA] text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-900/20"
            >
                <Download className="w-4 h-4" />
                PDF Report
            </button>
        </div>
    );
};

export default ReportActions;
