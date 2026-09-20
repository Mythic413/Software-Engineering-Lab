import React, { useState, useEffect } from 'react';
import { 
  DocumentRecord, 
  RoutingStatus, 
  UserProfile, 
  DepartmentType, 
  DocCategory,
  ClassificationResult 
} from './types';
import { DBService } from './services/dbService';
import { toast, Toaster } from 'sonner';

import LandingLogin from './components/LandingLogin';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import DashboardView from './components/DashboardView';
import RouteImageView from './components/RouteImageView';
import RoutingQueueView from './components/RoutingQueueView';
import HistoryView from './components/HistoryView';
import ProfileView from './components/ProfileView';
import DocDetails from './components/DocDetails';
import CinematicBackground from './components/CinematicBackground';
import { LayoutDashboard, FileUp, Layers, Clock, User } from 'lucide-react';

export const App: React.FC = () => {
  const [activeUser, setActiveUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('activeUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        DBService.setToken(user.token || null);
        return user;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [queueFilter, setQueueFilter] = useState<DepartmentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // Load documents when user is authenticated
  const loadUserDocuments = async (userId: string) => {
    try {
      const docs = await DBService.fetchDocuments(userId);
      setDocuments(Array.isArray(docs) ? docs : []);
    } catch {
      setDocuments([]);
    }
  };

  useEffect(() => {
    if (activeUser?.id) {
      loadUserDocuments(activeUser.id);
    }
  }, [activeUser]);

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    const profile = await DBService.authenticate(email, pass);
    setActiveUser(profile);
    localStorage.setItem('activeUser', JSON.stringify(profile));
    DBService.setToken(profile.token || null);
    toast.success(`Welcome back, ${profile.name || profile.email}!`);
  };

  const handleSignup = async (email: string, pass: string, name?: string) => {
    const profile = await DBService.signup(email, pass, name);
    setActiveUser(profile);
    localStorage.setItem('activeUser', JSON.stringify(profile));
    DBService.setToken(profile.token || null);
    toast.success(`Account created! Welcome to ImageRoute, ${profile.name || profile.email}!`);
  };

  const handleSsoLogin = async (email?: string, name?: string) => {
    const profile = await DBService.ssoLogin(email, name);
    setActiveUser(profile);
    localStorage.setItem('activeUser', JSON.stringify(profile));
    DBService.setToken(profile.token || null);
    toast.success(`Authenticated via Auth0 SSO as ${profile.name || profile.email}!`);
  };

  const handleLogout = () => {
    DBService.setToken(null);
    localStorage.removeItem('activeUser');
    setActiveUser(null);
    setSelectedDoc(null);
    toast.info('Signed out successfully.');
  };

  // Route Image Action
  const handleRouteImage = async (
    fileData: string,
    fileName: string,
    fileSize: string,
    department: DepartmentType,
    confidence: number,
    category: DocCategory,
    classification: ClassificationResult
  ) => {
    if (!activeUser) return;
    setIsProcessing(true);
    try {
      const newDoc: DocumentRecord = {
        id: `DOC-${Date.now().toString(36).toUpperCase()}`,
        name: fileName,
        timestamp: Date.now(),
        category: category,
        department: department,
        confidence: confidence,
        status: classification.engineStatus === 'FINAL' ? RoutingStatus.ROUTED : classification.engineStatus === 'QUARANTINE' ? RoutingStatus.QUARANTINED : RoutingStatus.PENDING,
        destination: `${department.toLowerCase()}/inbox`,
        summary: classification.summary || `Custom model routed this image to ${department}.`,
        fileSize: fileSize,
        thumbnail: fileData.startsWith('http') || fileData.startsWith('data:') ? fileData : `data:image/jpeg;base64,${fileData}`,
        origin: 'Upload',
        user_id: activeUser.id,
        ocrText: classification.ocrText,
        engineStatus: classification.engineStatus,
        classifierAction: classification.classifierAction,
        extractedFields: [
          ...(classification.extractedFields || []),
          { key: 'Target Department', value: department },
          { key: 'Processing Engine', value: 'ImageRoute Custom PyTorch' },
          { key: 'OCR Engine', value: 'EasyOCR' },
          { key: 'Confidence Rating', value: `${Math.round(confidence * 100)}%` }
        ]
      };

      await DBService.saveDocument(newDoc);
      setDocuments(prev => [newDoc, ...prev]);
      toast.success(`Image successfully routed to ${department}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to route image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateDept = async (id: string, newDept: DepartmentType) => {
    try {
      await DBService.updateDocument(id, { 
        department: newDept,
        destination: `${newDept.toLowerCase()}/inbox`,
        status: RoutingStatus.ROUTED
      });
      setDocuments(prev => prev.map(d => d.id === id ? { 
        ...d, 
        department: newDept,
        destination: `${newDept.toLowerCase()}/inbox`,
        status: RoutingStatus.ROUTED 
      } : d));
      if (selectedDoc && selectedDoc.id === id) {
        setSelectedDoc(prev => prev ? { 
          ...prev, 
          department: newDept,
          destination: `${newDept.toLowerCase()}/inbox`,
          status: RoutingStatus.ROUTED 
        } : null);
      }
      toast.success(`Department updated to ${newDept}.`);
    } catch (err: any) {
      toast.error('Failed to update department.');
    }
  };

  const handleNavigateToQueue = (filterDept?: DepartmentType) => {
    if (filterDept) {
      setQueueFilter(filterDept);
    } else {
      setQueueFilter('ALL');
    }
    setSelectedDoc(null);
    setActiveTab('queue');
  };

  // If not authenticated, display Screen 1 (LandingLogin)
  if (!activeUser) {
    return (
      <>
        <Toaster position="top-right" theme="dark" richColors />
        <LandingLogin
          onLogin={handleLogin}
          onSignup={handleSignup}
          onSsoLogin={handleSsoLogin}
        />
      </>
    );
  }

  // Pending count for sidebar badge
  const pendingCount = documents.filter(
    d => d.status === RoutingStatus.PENDING || d.status === RoutingStatus.QUARANTINED
  ).length;

  return (
    <div className="flex h-screen bg-[#070605] text-[#F5F5F5] overflow-hidden font-sans select-none relative">
      <CinematicBackground variant="dashboard" />
      <Toaster position="top-right" theme="dark" richColors />

      {/* Left Navigation Sidebar (Desktop) */}
      <div className="hidden md:flex relative z-20">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setSelectedDoc(null);
            setActiveTab(tab);
            if (tab === 'queue') setQueueFilter('ALL');
          }}
          pendingCount={pendingCount}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Navbar */}
        <TopNav
          user={activeUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onLogout={handleLogout}
          onOpenProfile={() => {
            setSelectedDoc(null);
            setActiveTab('profile');
          }}
        />

        {/* Viewport for Active Screen */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {/* If a document is selected for inspection, show Screen 5 DocDetails */}
            {selectedDoc ? (
              <DocDetails
                doc={selectedDoc}
                onBack={() => setSelectedDoc(null)}
                onUpdateDept={handleUpdateDept}
              />
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    user={activeUser}
                    documents={documents}
                    onSelectDoc={(doc) => setSelectedDoc(doc)}
                    onNavigateToQueue={handleNavigateToQueue}
                  />
                )}

                {activeTab === 'route' && (
                  <RouteImageView
                    onRouteImage={handleRouteImage}
                    isProcessing={isProcessing}
                  />
                )}

                {activeTab === 'queue' && (
                  <RoutingQueueView
                    documents={documents}
                    onSelectDoc={(doc) => setSelectedDoc(doc)}
                    initialFilter={queueFilter}
                  />
                )}

                {activeTab === 'history' && (
                  <HistoryView
                    documents={documents}
                    onSelectDoc={(doc) => setSelectedDoc(doc)}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfileView
                    user={activeUser}
                    onLogout={handleLogout}
                    onUpdateName={(newName) => {
                      const updated = { ...activeUser, name: newName };
                      setActiveUser(updated);
                      localStorage.setItem('activeUser', JSON.stringify(updated));
                    }}
                  />
                )}
              </>
            )}
          </div>
        </main>

        {/* Persistent Micro-Footer matching reference screenshot */}
        <footer className="h-9 px-6 bg-[rgba(10,7,5,0.85)] border-t border-[rgba(245,158,66,0.18)] hidden md:flex items-center justify-between text-[11px] text-[#77706A] font-medium shrink-0 z-20 backdrop-blur-md">
          <div>
            ImageRoute v1.0 | <span className="text-[#A8A29E]">Secure • Smart • Simple</span>
          </div>
          <div>
            Built with <span className="text-[#FFB45C] font-semibold">React, Vite and ImageRoute AI</span>
          </div>
        </footer>

        {/* Mobile Bottom Navigation Bar matching Screen 8 in reference */}
        <div className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-[rgba(10,7,5,0.92)] border-t border-[rgba(245,158,66,0.20)] flex items-center justify-around px-2 z-40 backdrop-blur-md">
          {[
            { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
            { id: 'route', label: 'Route', icon: FileUp },
            { id: 'queue', label: 'Queue', icon: Layers },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !selectedDoc;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedDoc(null);
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
                  isActive ? 'text-[#FFB45C]' : 'text-[#77706A] hover:text-[#A8A29E]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
