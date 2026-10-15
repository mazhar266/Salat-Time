import React from 'react';
import { X, Smartphone, Download, Share, PlusSquare } from 'lucide-react';

interface PWAInstallGuideModalProps {
  onClose: () => void;
  onInstallPrompt: () => void;
  isInstallable: boolean;
  isIOS: boolean;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  onClose,
  onInstallPrompt,
  isInstallable
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Install NoorSalat App</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Install NoorSalat directly to your Android, iPhone, or iPad home screen for an offline, full-screen native mobile experience with instant Adhan alerts and offline compass.
          </p>

          {isInstallable && (
            <div className="rounded-2xl border border-emerald-700/60 bg-emerald-950/40 p-4 text-center space-y-2">
              <div className="text-sm font-bold text-emerald-300">
                Direct Installation Ready
              </div>
              <p className="text-xs text-slate-300">
                Your browser supports one-click PWA installation.
              </p>
              <button
                onClick={() => {
                  onInstallPrompt();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Add NoorSalat to Home Screen</span>
              </button>
            </div>
          )}

          {/* iOS Safari step-by-step instructions */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>For iOS (iPhone & iPad) Safari</span>
            </h4>
            <ol className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] font-bold text-slate-300">
                  1
                </span>
                <span>
                  Tap the <strong className="text-white">Share</strong> button (
                  <Share className="inline w-3.5 h-3.5 text-emerald-400" />
                  ) at the bottom toolbar in Safari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] font-bold text-slate-300">
                  2
                </span>
                <span>
                  Scroll down the share sheet and tap <strong className="text-white">Add to Home Screen</strong> (
                  <PlusSquare className="inline w-3.5 h-3.5 text-emerald-400" />
                  ).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 font-mono text-[10px] font-bold text-slate-300">
                  3
                </span>
                <span>
                  Tap <strong className="text-emerald-400">Add</strong> in the top-right corner.
                </span>
              </li>
            </ol>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 space-y-1 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-200">Offline & Northern Latitude Features:</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>100% functional without internet connectivity</li>
              <li>High-latitude calculations for Finland & Arctic</li>
              <li>Custom audio synthesizer for Adhan & Tasbeeh</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
