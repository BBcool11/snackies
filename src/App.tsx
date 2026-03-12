import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Foyer } from '@/sections/Foyer';
import { Exhibition } from '@/sections/Exhibition';
import { Curation } from '@/sections/Curation';
import { Traces } from '@/sections/Traces';
import { Archive } from '@/sections/Archive';
import { ChatPanel } from '@/components/ChatPanel';
import { SnackModal } from '@/components/SnackModal';
import { ImageManager } from '@/components/ImageManager';
import { ImageQuickActions } from '@/components/ImageQuickActions';

import Login from '@/pages/Login';
import { snacks } from '@/data/snacks';
import type { ViewType, Snack } from '@/types';
import './App.css';

function MainApp() {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('exhibition');
  const [userCollection, setUserCollection] = useState<string[]>(['001', '003', '005']);
  const [userTasted, setUserTasted] = useState<string[]>(['002', '004', '006']);
  const [selectedSnack, setSelectedSnack] = useState<Snack | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showImageManager, setShowImageManager] = useState(false);
  const [showImageTools, setShowImageTools] = useState(false);
  const [_searchQuery, setSearchQuery] = useState('');
  const [_searchResults, setSearchResults] = useState<Snack[]>([]);
  const [_isSearching, setIsSearching] = useState(false);

  // Listen for image manager open event
  useEffect(() => {
    const handleOpenImageManager = () => setShowImageManager(true);
    window.addEventListener('openImageManager' as any, handleOpenImageManager);
    return () => window.removeEventListener('openImageManager' as any, handleOpenImageManager);
  }, []);

  // Check login status
  useEffect(() => {
    const user = localStorage.getItem('snackies_user_logged_in');
    if (user) {
      setHasEntered(true);
    }
  }, []);

  const handleEnterMuseum = () => {
    setHasEntered(true);
  };

  const handleReturnHome = () => {
    setHasEntered(false);
    setCurrentView('exhibition');
    // Clear login status when returning to home
    localStorage.removeItem('snackies_user_logged_in');
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = snacks.filter(s => 
        s.name.includes(query) || 
        (s.brand && s.brand.includes(query)) ||
        (s.category && s.category.includes(query))
      );
      setSearchResults(results);
      setIsSearching(true);
      setCurrentView('exhibition');
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleCollect = (id: string) => {
    setUserCollection((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleTaste = (id: string) => {
    setUserTasted((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSnackClick = (snack: Snack) => {
    setSelectedSnack(snack);
    setIsModalOpen(true);
  };

  const handleTraceSnackClick = (snackId: string) => {
    const snack = snacks.find((s) => s.id === snackId);
    if (snack) {
      setSelectedSnack(snack);
      setIsModalOpen(true);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'exhibition':
        return (
          <Exhibition
            userCollection={userCollection}
            userTasted={userTasted}
            onCollect={handleCollect}
            onTaste={handleTaste}
          />
        );
      case 'curation':
        return <Curation />;
      case 'traces':
        return <Traces onSnackClick={handleTraceSnackClick} />;
      case 'archive':
        return (
          <Archive
            userCollection={userCollection}
            userTasted={userTasted}
            onSnackClick={handleSnackClick}
          />
        );
      default:
        return (
          <Exhibition
            userCollection={userCollection}
            userTasted={userTasted}
            onCollect={handleCollect}
            onTaste={handleTaste}
          />
        );
    }
  };

  // Show foyer if not entered yet
  if (!hasEntered) {
    return (
      <Foyer 
        onEnterMuseum={handleEnterMuseum} 
        onViewChange={handleViewChange}
      />
    );
  }

  return (
    <div className="min-h-screen bg-rice-paper">
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        onReturnHome={handleReturnHome}
        onSearch={handleSearch}
      />
      
      <main className="animate-fade-in">
        {renderView()}
      </main>

      {/* Chat Panel */}
      <ChatPanel />



      {/* Global Modal for snack details */}
      <SnackModal
        snack={selectedSnack}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSnack(null);
        }}
        onCollect={handleCollect}
        onTaste={handleTaste}
        isCollected={selectedSnack ? userCollection.includes(selectedSnack.id) : false}
        isTasted={selectedSnack ? userTasted.includes(selectedSnack.id) : false}
      />

      {/* Image Manager for Admin */}
      <ImageManager
        isOpen={showImageManager}
        onClose={() => setShowImageManager(false)}
      />

      {/* Image Quick Actions Modal */}
      {showImageTools && (
        <div className="fixed inset-0 z-[200] bg-ink/50 backdrop-blur-sm flex items-center justify-center p-4">
          <ImageQuickActions onClose={() => setShowImageTools(false)} />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
