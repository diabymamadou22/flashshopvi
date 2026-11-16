import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * Hook simple pour détecter la possibilité d'installer l'application sur l'appareil (PWA).
 */
export function usePWAInstall() {
  const [evenementInstall, setEvenementInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [estInstalle, setEstInstalle] = useState(false);
  const [estIOS, setEstIOS] = useState(false);

  useEffect(() => {
    const modeAutonome =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setEstInstalle(modeAutonome);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setEstIOS(/iphone|ipad|ipod/.test(userAgent));

    const gererAvantInstall = (e: Event) => {
      e.preventDefault();
      setEvenementInstall(e as BeforeInstallPromptEvent);
    };

    const gererApresInstall = () => {
      setEstInstalle(true);
      setEvenementInstall(null);
    };

    window.addEventListener('beforeinstallprompt', gererAvantInstall);
    window.addEventListener('appinstalled', gererApresInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', gererAvantInstall);
      window.removeEventListener('appinstalled', gererApresInstall);
    };
  }, []);

  const installer = async () => {
    if (!evenementInstall) return false;
    await evenementInstall.prompt();
    const { outcome } = await evenementInstall.userChoice;
    if (outcome === 'accepted') {
      setEstInstalle(true);
      setEvenementInstall(null);
      return true;
    }
    return false;
  };

  return {
    peutInstaller: !!evenementInstall,
    estInstalle,
    estIOS,
    installer,
  };
}
