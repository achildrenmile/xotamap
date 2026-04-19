import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { I18nProvider } from './i18n';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { Navigation } from './components/Navigation/Navigation';
import { LegalModal } from './components/LegalModal/LegalModal';

function AppLayout() {
  const [legalModal, setLegalModal] = useState<'imprint' | 'privacy' | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors flex flex-col">
      <Header />

      {/* Page content — add bottom padding on mobile to clear the bottom tab bar */}
      <main className="flex-1 overflow-auto pb-16 sm:pb-0">
        <Outlet />
      </main>

      <Footer
        onOpenImprint={() => setLegalModal('imprint')}
        onOpenPrivacy={() => setLegalModal('privacy')}
      />

      {/* Mobile bottom tab bar */}
      <Navigation variant="bottom" />

      {/* Legal modals */}
      {legalModal && (
        <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppLayout />
    </I18nProvider>
  );
}
