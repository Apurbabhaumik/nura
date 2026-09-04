'use client';

import React, { useEffect, useState } from 'react';
import styles from './page.module.css';
import { fetchApi, setStoredToken, getStoredToken, removeStoredToken } from '../lib/api';
import { CredBanner } from '../components/CredBanner';
import { Navbar } from '../components/Navbar';
import { HeroQASearch } from '../components/HeroQASearch';
import { BigStatement } from '../components/BigStatement';
import { FeatureStories } from '../components/FeatureStories';
import { DashboardTab } from '../components/DashboardTab';
import { IngestionTab } from '../components/IngestionTab';
import { ReaderTab } from '../components/ReaderTab';
import { TutorTab } from '../components/TutorTab';
import { AssessmentTab } from '../components/AssessmentTab';
import { AnalyticsTab } from '../components/AnalyticsTab';
import { AuthModal } from '../components/AuthModal';
import { Footer } from '../components/Footer';
import { CommandPalette } from '../components/CommandPalette';

export default function NuraApp() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ingestion' | 'reader' | 'tutor' | 'quizzes' | 'analytics'>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [authError, setAuthError] = useState('');
  const [workspaces, setWorkspaces] = useState<any[]>([]); const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(''); const [courses, setCourses] = useState<any[]>([]); const [activeCourse, setActiveCourse] = useState<any>(null); const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [ingestUrl, setIngestUrl] = useState(''); const [ingestFilename, setIngestFilename] = useState(''); const [ingestFileContent, setIngestFileContent] = useState(''); const [isProcessing, setIsProcessing] = useState(false); const [processingStep, setProcessingStep] = useState(0);
  const [chatInput, setChatInput] = useState(''); const [chatMessages, setChatMessages] = useState<any[]>([]); const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); const [quizResult, setQuizResult] = useState<any>(null); const [currentFcIndex, setCurrentFcIndex] = useState(0); const [isFlipped, setIsFlipped] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>({ dailyStreakDays: 0, totalStudyMinutes: 0, completedLessons: 0, totalAssignedLessons: 0, completionRate: 0, averageQuizScore: 0, weakAreas: [], weeklyActivity: [] });

  const loadData = async (workspaceId?: string) => {
    const ws = await fetchApi<any[]>('/workspace'); setWorkspaces(ws); const id = workspaceId || selectedWorkspaceId || ws[0]?.id; if (!id) return; if (id !== selectedWorkspaceId) setSelectedWorkspaceId(id);
    const [courseData, stats] = await Promise.all([fetchApi<any[]>(`/course?workspaceId=${encodeURIComponent(id)}`), fetchApi<any>('/analytics/dashboard')]);
    setCourses(courseData); setDashboardStats(stats); const course = courseData[0] || null; setActiveCourse(course); setSelectedLesson(course?.modules?.[0]?.lessons?.[0] || null);
  };

  useEffect(() => {
    if (!getStoredToken()) { window.location.replace('/login'); return; }
    loadData().catch(() => { removeStoredToken(); window.location.replace('/login'); });
    const keyHandler = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setShowCommandPalette((v) => !v); } };
    window.addEventListener('keydown', keyHandler); return () => window.removeEventListener('keydown', keyHandler);
  }, []);

  useEffect(() => { if (selectedWorkspaceId && getStoredToken()) loadData(selectedWorkspaceId).catch(() => undefined); }, [selectedWorkspaceId]);

  useEffect(() => {
    if (!activeCourse || !getStoredToken()) return;
    fetchApi<any[]>(`/tutor/history/${activeCourse.id}`).then((history) => setChatMessages(history.flatMap((item) => [{ sender: 'user', text: item.question }, { sender: 'tutor', text: item.answer, citations: item.citations }]))).catch(() => setChatMessages([]));
  }, [activeCourse?.id]);

  const handleAutoFillAuth = () => { setEmail('student@nura.ai'); setPassword('password123'); setAuthMode('login'); setShowAuthModal(true); };
  const handleAuthSubmit = async (e: React.FormEvent) => { e.preventDefault(); setAuthError(''); try { if (authMode === 'register') await fetchApi('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }); const res = await fetchApi<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setStoredToken(res.accessToken); setUser(res.user); setShowAuthModal(false); await loadData(); } catch (err: any) { setAuthError(err.message || 'Authentication failed.'); } };

  const handleFileSelect = async (file: File) => { if (file.size > 50 * 1024 * 1024) { setAuthError('File is larger than 50MB.'); return; } setAuthError(''); const bytes = new Uint8Array(await file.arrayBuffer()); let binary = ''; for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); setIngestFileContent(btoa(binary)); };
  const handleTriggerIngestion = async (e: React.FormEvent) => { e.preventDefault(); if (!selectedWorkspaceId || (!ingestUrl && !ingestFileContent)) return; setIsProcessing(true); setProcessingStep(1); setAuthError(''); try { setProcessingStep(2); const course = await fetchApi<any>('/course/generate-from-ingestion', { method: 'POST', body: JSON.stringify({ workspaceId: selectedWorkspaceId, url: ingestUrl || undefined, filename: ingestFilename || undefined, fileContent: ingestFileContent || undefined }) }); setCourses((prev) => [course, ...prev]); setActiveCourse(course); setSelectedLesson(course.modules?.[0]?.lessons?.[0] || null); setProcessingStep(4); setIngestUrl(''); setIngestFilename(''); setIngestFileContent(''); setActiveTab('reader'); } catch (err: any) { setAuthError(err.message || 'Ingestion failed.'); } finally { setIsProcessing(false); } };

  const handleSendMessage = async (e: React.FormEvent) => { e.preventDefault(); if (!chatInput.trim() || !activeCourse) return; const question = chatInput.trim(); setChatMessages((prev) => [...prev, { sender: 'user', text: question }]); setChatInput(''); try { const res = await fetchApi<any>('/tutor/chat', { method: 'POST', body: JSON.stringify({ courseId: activeCourse.id, question }) }); setChatMessages((prev) => [...prev, { sender: 'tutor', text: res.answer, citations: res.citations }]); } catch (err: any) { setChatMessages((prev) => [...prev, { sender: 'tutor', text: `Unable to answer: ${err.message}` }]); } };

  const handleQuizSubmit = async () => {
    const quiz = selectedLesson?.quizzes?.[0]; if (!quiz?.questions?.length) return;
    try { const result = await fetchApi<any>('/quiz/submit', { method: 'POST', body: JSON.stringify({ lessonId: selectedLesson.id, answers: userAnswers }) }); setQuizResult(result); const refreshed = await fetchApi<any>(`/course/${activeCourse.id}`); setActiveCourse(refreshed); setCourses((prev) => prev.map((c) => c.id === refreshed.id ? refreshed : c)); setSelectedLesson(refreshed.modules?.flatMap((m: any) => m.lessons).find((l: any) => l.id === selectedLesson.id) || selectedLesson); const stats = await fetchApi<any>('/analytics/dashboard'); setDashboardStats(stats); } catch (err: any) { setAuthError(err.message || 'Quiz submission failed.'); }
  };

  const markLessonComplete = async () => { if (!activeCourse || !selectedLesson) return; try { await fetchApi(`/quiz/progress/${selectedLesson.id}`, { method: 'PATCH', body: JSON.stringify({ percentage: 100 }) }); } catch (err: any) { setAuthError(err.message || 'Could not save progress.'); } setActiveTab('quizzes'); };

  return <div className={styles.appContainer}>
    <div className={styles.ambientBackground}><div className={styles.noiseOverlay} /></div><CredBanner onAutoFill={handleAutoFillAuth} />
    <Navbar workspaces={workspaces} selectedWorkspaceId={selectedWorkspaceId} setSelectedWorkspaceId={setSelectedWorkspaceId} dailyStreakDays={dashboardStats.dailyStreakDays} user={user} onSignOut={() => { removeStoredToken(); setUser(null); setWorkspaces([]); setCourses([]); setActiveCourse(null); window.location.replace('/login'); }} onOpenAuth={() => setShowAuthModal(true)} activeTab={activeTab} setActiveTab={setActiveTab} />
    <main className={styles.contentMain}>
      {activeTab === 'dashboard' && <><div className="animate-fade-up"><HeroQASearch activeCourse={activeCourse} onGoToTutor={() => setActiveTab('tutor')} /></div><div className="animate-fade-up delay-100"><FeatureStories onGoToIngestion={() => setActiveTab('ingestion')} onGoToTutor={() => setActiveTab('tutor')} onGoToQuizzes={() => setActiveTab('quizzes')} /></div><div className="animate-fade-up delay-200"><BigStatement /></div><div className="animate-fade-up delay-300"><DashboardTab stats={dashboardStats} courses={courses} onSelectCourse={(c) => { setActiveCourse(c); setSelectedLesson(c.modules?.[0]?.lessons?.[0] || null); setActiveTab('reader'); }} onNewCourse={() => setActiveTab('ingestion')} /></div></>}
      {activeTab === 'ingestion' && <div className="animate-fade-up"><IngestionTab ingestUrl={ingestUrl} setIngestUrl={setIngestUrl} ingestFilename={ingestFilename} setIngestFilename={setIngestFilename} isProcessing={isProcessing} processingStep={processingStep} onFileSelect={handleFileSelect} onTrigger={handleTriggerIngestion} /></div>}
      {activeTab === 'reader' && <div className="animate-fade-up"><ReaderTab activeCourse={activeCourse} selectedLesson={selectedLesson} setSelectedLesson={setSelectedLesson} onGoToQuizzes={markLessonComplete} /></div>}
      {activeTab === 'tutor' && <div className="animate-fade-up"><TutorTab activeCourse={activeCourse} chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput} onSendMessage={handleSendMessage} /></div>}
      {activeTab === 'quizzes' && <div className="animate-fade-up"><AssessmentTab selectedLesson={selectedLesson} userAnswers={userAnswers} setUserAnswers={setUserAnswers} quizResult={quizResult} onSubmitQuiz={handleQuizSubmit} currentFcIndex={currentFcIndex} setCurrentFcIndex={setCurrentFcIndex} isFlipped={isFlipped} setIsFlipped={setIsFlipped} /></div>}
      {activeTab === 'analytics' && <div className="animate-fade-up"><AnalyticsTab stats={dashboardStats} /></div>}
    </main><Footer />
    <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} authMode={authMode} setAuthMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} name={name} setName={setName} authError={authError} onSubmit={handleAuthSubmit} />
    <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} setActiveTab={setActiveTab} />
  </div>;
}
