import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallButton() {
  const { peutInstaller, estInstalle, estIOS, installer } = usePWAInstall();
  const [aideIOSOuverte, setAideIOSOuverte] = useState(false);

  if (estInstalle) {
    return null;
  }

  if (peutInstaller) {
    return (
      <button
        type="button"
        onClick={installer}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-800 whitespace-nowrap shrink-0"
      >
        <Download className="h-3.5 w-3.5" />
        Installer l&apos;app
      </button>
    );
  }

  if (estIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setAideIOSOuverte(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Installer sur iOS
        </button>

        {aideIOSOuverte && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Installer FLASH-SHOP</h3>
                <button
                  type="button"
                  onClick={() => setAideIOSOuverte(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                1. Appuyez sur le bouton <strong>Partager</strong> dans Safari.
                <br />
                2. Choisissez <strong>Sur l&apos;écran d&apos;accueil</strong> pour installer
                l&apos;application avec son icône.
              </p>
              <button
                type="button"
                onClick={() => setAideIOSOuverte(false)}
                className="mt-4 w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
