'use client';

import React, { useState, useEffect } from 'react';
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

export default function NuraApp() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ingestion' | 'reader' | 'tutor' | 'quizzes' | 'analytics'>('dashboard');
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  // Workspaces & Courses Data State
  const [workspaces, setWorkspaces] = useState<any[]>([
    { id: 'default-ws-1', name: 'Default Learning Sandbox' },
  ]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('default-ws-1');
  const [courses, setCourses] = useState<any[]>([]);
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Ingestion Form State
  const [ingestUrl, setIngestUrl] = useState('');
  const [ingestFilename, setIngestFilename] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  // Flashcard State
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Analytics State
  const [dashboardStats, setDashboardStats] = useState<any>({
    dailyStreakDays: 5,
    totalStudyMinutes: 165,
    completedLessons: 4,
    totalAssignedLessons: 6,
    completionRate: 67,
    weakAreas: [
      { lessonTitle: 'Vector Indexing & Filtering', courseTitle: 'Applied RAG Systems', score: 60 },
    ],
  });

  // Initial Load & Auth Sync
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setUser({ id: 'demo-user-1', name: 'Student Developer', email: 'student@nura.ai' });
    }
    loadMockCourses();
  }, []);

  const loadMockCourses = () => {
    const defaultCourse = {
      id: 'course-sample-1',
      title: 'Applied RAG & System Design',
      description: 'Master modular monoliths, vector embeddings, Qdrant indexes, and LLM prompt engineering.',
      difficulty: 'Intermediate',
      modules: [
        {
          id: 'mod-1',
          title: 'Module 1: Modular Monolith Architecture',
          order: 1,
          lessons: [
            {
              id: 'les-1',
              title: '1.1 Monolith to Microservices Transition',
              estimatedTime: 15,
              markdown: '# 1.1 Monolith to Microservices Transition\n\nStarting with a clean modular monolith is recommended.\n\n1. Single Deployment Artifact\n2. In-process Typesafe Calls\n3. Decoupled Modules',
              flashcards: [
                { front: 'Why start with a modular monolith?', back: 'To eliminate network latency overhead while maintaining strict domain boundary isolation.' },
                { front: 'What handles background jobs in NURA?', back: 'BullMQ queues backed by Redis.' },
              ],
              quizzes: [
                {
                  id: 'q-1',
                  questions: [
                    {
                      id: 'q-ans-1',
                      question: 'Which architecture is recommended for initial NURA MVP deployment?',
                      options: ['Microservices on K8s', 'Modular Monolith on AWS ECS', 'Serverless Lambdas', 'Monolithic PHP'],
                      answer: 'Modular Monolith on AWS ECS',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    setCourses([defaultCourse]);
    setActiveCourse(defaultCourse);
    if (defaultCourse.modules[0]?.lessons[0]) {
      setSelectedLesson(defaultCourse.modules[0].lessons[0]);
    }
  };

  const handleAutoFillAuth = () => {
    setEmail('student@nura.ai');
    setPassword('password123');
    setAuthMode('login');
    setShowAuthModal(true);
  };

  // Auth Handlers
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        const res = (await fetchApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, name }),
        })) as any;
        setUser(res);
      } else {
        const res = (await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })) as any;
        setStoredToken(res.accessToken);
        setUser(res.user);
      }
      setShowAuthModal(false);
    } catch (err: any) {
      setStoredToken('mock-jwt-token-12345');
      setUser({ id: 'demo-user-1', name: name || 'Student Developer', email });
      setShowAuthModal(false);
    }
  };

  // Ingestion Handler
  const handleTriggerIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestUrl && !ingestFilename) return;

    setIsProcessing(true);
    setProcessingStep(1);

    setTimeout(() => setProcessingStep(2), 1000);
    setTimeout(() => setProcessingStep(3), 2000);
    setTimeout(async () => {
      setProcessingStep(4);
      try {
        const newCourse = (await fetchApi('/course/generate-from-ingestion', {
          method: 'POST',
          body: JSON.stringify({
            workspaceId: selectedWorkspaceId,
            url: ingestUrl,
            filename: ingestFilename,
          }),
        })) as any;
        setCourses((prev) => [newCourse, ...prev]);
        setActiveCourse(newCourse);
      } catch (err) {
        const generatedCourse = {
          id: 'course-generated-' + Date.now(),
          title: ingestUrl.includes('github') ? 'GitHub Codebase Syllabus' : ingestFilename || 'AI Course Syllabus',
          description: 'AI-generated curriculum with chunked RAG vector indexes and flashcards.',
          difficulty: 'Intermediate',
          modules: [
            {
              id: 'mod-gen-1',
              title: 'Module 1: Ingested Knowledge Concepts',
              order: 1,
              lessons: [
                {
                  id: 'les-gen-1',
                  title: '1.1 System Architecture Overview',
                  estimatedTime: 20,
                  markdown: '# 1.1 System Architecture Overview\n\nIngested source content parsed and chunked into 1536d vectors.\n\n- Vector Database: Qdrant\n- Queue: BullMQ\n- Cache: Redis',
                  flashcards: [
                    { front: 'How does Qdrant index vectors?', back: 'Using HNSW graphs with cosine distance.' },
                  ],
                  quizzes: [
                    {
                      id: 'q-gen-1',
                      questions: [
                        {
                          id: 'q-ans-gen-1',
                          question: 'Which component indexes vector embeddings?',
                          options: ['PostgreSQL', 'Qdrant Vector DB', 'Redis', 'S3'],
                          answer: 'Qdrant Vector DB',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        };
        setCourses((prev) => [generatedCourse, ...prev]);
        setActiveCourse(generatedCourse);
      }
      setIsProcessing(false);
      setActiveTab('reader');
    }, 3000);
  };

  // Chat Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeCourse) return;

    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const currentQ = chatInput;
    setChatInput('');

    try {
      const res = (await fetchApi('/tutor/chat', {
        method: 'POST',
        body: JSON.stringify({ courseId: activeCourse.id, question: currentQ }),
      })) as any;
      setChatMessages((prev) => [
        ...prev,
        { sender: 'tutor', text: res.answer, citations: res.citations },
      ]);
    } catch (err) {
      setTimeout(() => {
        const courseTitle = activeCourse ? activeCourse.title : 'Course';
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'tutor',
            text: 'Based on your materials for "' + courseTitle + '": RAG pipelines index chunks into Qdrant vector store and retrieve them using cosine similarity.',
            citations: [
              { chunkIndex: 1, snippet: 'Vector embeddings generated with 1536 dimensions...', relevanceScore: '96%' },
            ],
          },
        ]);
      }, 600);
    }
  };

  // Quiz Submit Handler
  const handleQuizSubmit = () => {
    if (!selectedLesson?.quizzes[0]) return;
    const quiz = selectedLesson.quizzes[0];
    let correct = 0;

    quiz.questions.forEach((q: any) => {
      if ((userAnswers[q.id] || '').trim().toLowerCase() === q.answer.trim().toLowerCase()) {
        correct++;
      }
    });

    const percentage = Math.round((correct / quiz.questions.length) * 100);
    setQuizResult({
      score: correct,
      total: quiz.questions.length,
      percentage,
      passed: percentage >= 70,
    });
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.ambientBackground}>
        <div className={styles.noiseOverlay} />
      </div>
      
      <CredBanner onAutoFill={handleAutoFillAuth} />

      <Navbar
        workspaces={workspaces}
        selectedWorkspaceId={selectedWorkspaceId}
        setSelectedWorkspaceId={setSelectedWorkspaceId}
        dailyStreakDays={dashboardStats.dailyStreakDays}
        user={user}
        onSignOut={() => {
          removeStoredToken();
          setUser(null);
        }}
        onOpenAuth={() => setShowAuthModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className={styles.contentMain}>
        {activeTab === 'dashboard' && (
          <div>
            <div className="animate-fade-up">
              <HeroQASearch activeCourse={activeCourse} onGoToTutor={() => setActiveTab('tutor')} />
            </div>
            <div className="animate-fade-up delay-100">
              <FeatureStories
                onGoToIngestion={() => setActiveTab('ingestion')}
                onGoToTutor={() => setActiveTab('tutor')}
                onGoToQuizzes={() => setActiveTab('quizzes')}
              />
            </div>
            <div className="animate-fade-up delay-200">
              <BigStatement />
            </div>
            <div className="animate-fade-up delay-300">
              <DashboardTab
                stats={dashboardStats}
                courses={courses}
                onSelectCourse={(c) => {
                  setActiveCourse(c);
                  if (c.modules[0]?.lessons[0]) setSelectedLesson(c.modules[0].lessons[0]);
                  setActiveTab('reader');
                }}
                onNewCourse={() => setActiveTab('ingestion')}
              />
            </div>
          </div>
        )}

        {activeTab === 'ingestion' && (
          <div className="animate-fade-up">
            <IngestionTab
              ingestUrl={ingestUrl}
              setIngestUrl={setIngestUrl}
              ingestFilename={ingestFilename}
              setIngestFilename={setIngestFilename}
              isProcessing={isProcessing}
              processingStep={processingStep}
              onTrigger={handleTriggerIngestion}
            />
          </div>
        )}

        {activeTab === 'reader' && (
          <div className="animate-fade-up">
            <ReaderTab
              activeCourse={activeCourse}
              selectedLesson={selectedLesson}
              setSelectedLesson={setSelectedLesson}
              onGoToQuizzes={() => setActiveTab('quizzes')}
            />
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="animate-fade-up">
            <TutorTab
              activeCourse={activeCourse}
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="animate-fade-up">
            <AssessmentTab
              selectedLesson={selectedLesson}
              userAnswers={userAnswers}
              setUserAnswers={setUserAnswers}
              quizResult={quizResult}
              onSubmitQuiz={handleQuizSubmit}
              currentFcIndex={currentFcIndex}
              setCurrentFcIndex={setCurrentFcIndex}
              isFlipped={isFlipped}
              setIsFlipped={setIsFlipped}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-fade-up">
            <AnalyticsTab stats={dashboardStats} />
          </div>
        )}
      </main>

      <Footer />

      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        name={name}
        setName={setName}
        authError={authError}
        onSubmit={handleAuthSubmit}
      />
    </div>
  );
}
