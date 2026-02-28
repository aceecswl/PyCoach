/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Code, 
  MessageSquare, 
  Mic, 
  Terminal, 
  ChevronRight, 
  Sparkles, 
  Search, 
  Play, 
  Lightbulb, 
  Bug, 
  Zap, 
  Menu, 
  X, 
  Github, 
  Cpu, 
  Activity, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeCode, generateLesson, generateConceptImage, tutorChat, generateConceptVideo, editConceptImage } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'lessons' | 'playground' | 'chat' | 'voice';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('lessons');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('print("Hello, Python!")');
  const [analysis, setAnalysis] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [lessonTopic, setLessonTopic] = useState('Introduction to Python');

  const [conceptImage, setConceptImage] = useState<string | null>(null);
  const [conceptVideo, setConceptVideo] = useState<string | null>(null);

  const handleEditIllustration = async (prompt: string) => {
    if (!conceptImage) return;
    setIsLoading(true);
    try {
      const edited = await editConceptImage(conceptImage, prompt);
      setConceptImage(edited);
    } catch (error) {
      console.error('Error editing image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateIllustration = async () => {
    setIsLoading(true);
    try {
      const img = await generateConceptImage(lessonTopic);
      setConceptImage(img);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    setIsLoading(true);
    try {
      const videoUrl = await generateConceptVideo(lessonTopic);
      setConceptVideo(videoUrl);
    } catch (error) {
      console.error('Error generating video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateLesson = async (topic: string) => {
    setIsLoading(true);
    setConceptImage(null);
    setConceptVideo(null);
    try {
      const lesson = await generateLesson(topic);
      setCurrentLesson(lesson);
      setLessonTopic(topic);
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeCode(code);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscribe = async () => {
    // In a real app, we'd capture audio and send to Gemini.
    // For this demo, we'll simulate the transcription process.
    setIsTranscribing(true);
    try {
      // Simulate audio capture and transcription
      await new Promise(resolve => setTimeout(resolve, 2000));
      setChatInput("How do I use list comprehensions in Python?");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoading(true);
    try {
      const response = await tutorChat.sendMessage({ message: chatInput });
      setChatMessages(prev => [...prev, { role: 'model', text: response.text || 'No response' }]);
    } catch (error) {
      console.error('Error in chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'lessons' && !currentLesson) {
      handleGenerateLesson('Introduction to Python');
    }
  }, [currentView]);

  return (
    <div className="flex h-screen bg-[#F5F5F4] text-[#141414] font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-[#141414]/10 flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between">
          <div className={cn("flex items-center gap-3 overflow-hidden", !isSidebarOpen && "hidden")}>
            <div className="w-8 h-8 bg-[#141414] rounded-lg flex items-center justify-center">
              <Code className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">PyCoach</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#141414]/5 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<BookOpen size={20} />} 
            label="Lessons" 
            active={currentView === 'lessons'} 
            onClick={() => setCurrentView('lessons')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Terminal size={20} />} 
            label="Playground" 
            active={currentView === 'playground'} 
            onClick={() => setCurrentView('playground')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="AI Tutor" 
            active={currentView === 'chat'} 
            onClick={() => setCurrentView('chat')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Mic size={20} />} 
            label="Voice Practice" 
            active={currentView === 'voice'} 
            onClick={() => setCurrentView('voice')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-6 border-t border-[#141414]/10">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Activity className="text-emerald-600 w-4 h-4" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#141414]/60 uppercase tracking-wider">Level</span>
                <span className="text-sm font-bold">Beginner</span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#141414]/10 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold capitalize">{currentView}</h2>
            <div className="h-4 w-[1px] bg-[#141414]/10" />
            <div className="flex items-center gap-2 text-[#141414]/60 text-sm">
              <Sparkles size={14} className="text-amber-500" />
              <span>AI-Powered Learning</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" size={16} />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="pl-10 pr-4 py-2 bg-[#F5F5F4] border-none rounded-full text-sm focus:ring-2 focus:ring-[#141414]/10 transition-all w-64"
              />
            </div>
            <button className="w-10 h-10 rounded-full bg-[#141414] text-white flex items-center justify-center hover:scale-105 transition-transform">
              <Github size={20} />
            </button>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {currentView === 'lessons' && (
              <motion.div 
                key="lessons"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">{lessonTopic}</h1>
                    <p className="text-[#141414]/60">Master Python with interactive AI-generated content.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleGenerateIllustration}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#141414]/10 rounded-xl text-sm font-bold hover:bg-[#141414]/5 transition-colors disabled:opacity-50"
                    >
                      <Sparkles size={16} className="text-indigo-500" />
                      Illustrate
                    </button>
                    <button 
                      onClick={handleGenerateVideo}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-[#141414]/10 rounded-xl text-sm font-bold hover:bg-[#141414]/5 transition-colors disabled:opacity-50"
                    >
                      <Play size={16} className="text-rose-500" />
                      Visualize
                    </button>
                    <div className="w-[1px] h-8 bg-[#141414]/10 mx-2" />
                    {['Variables', 'Loops', 'Functions', 'Classes'].map(topic => (
                      <button 
                        key={topic}
                        onClick={() => handleGenerateLesson(topic)}
                        className="px-4 py-2 rounded-full border border-[#141414]/10 hover:bg-white transition-colors text-sm font-medium"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoading && !currentLesson ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#141414]/10 border-t-[#141414] rounded-full animate-spin" />
                    <p className="text-sm font-medium animate-pulse">Generating your custom lesson...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="bg-white rounded-3xl p-8 border border-[#141414]/10 shadow-sm prose prose-slate max-w-none">
                        <Markdown>{currentLesson || 'Select a topic to start learning.'}</Markdown>
                      </div>
                      
                      <div className="space-y-6">
                        {conceptImage && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl border border-[#141414]/10 overflow-hidden shadow-sm"
                          >
                            <div className="px-6 py-3 border-b border-[#141414]/5 bg-[#F5F5F4]/50 flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">AI Illustration</span>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEditIllustration("Add a retro filter")}
                                  className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-600"
                                >
                                  Retro Filter
                                </button>
                                <Sparkles size={14} className="text-indigo-500" />
                              </div>
                            </div>
                            <img src={conceptImage} alt="Concept Illustration" className="w-full h-auto" referrerPolicy="no-referrer" />
                          </motion.div>
                        )}
                        
                        {conceptVideo && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl border border-[#141414]/10 overflow-hidden shadow-sm"
                          >
                            <div className="px-6 py-3 border-b border-[#141414]/5 bg-[#F5F5F4]/50 flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-[#141414]/40">AI Visualization</span>
                              <Play size={14} className="text-rose-500" />
                            </div>
                            <video src={conceptVideo} controls className="w-full h-auto" />
                          </motion.div>
                        )}

                        {!conceptImage && !conceptVideo && !isLoading && (
                          <div className="h-full min-h-[300px] bg-white rounded-3xl border border-dashed border-[#141414]/10 flex flex-col items-center justify-center text-center p-8 gap-4">
                            <div className="w-16 h-16 bg-[#141414]/5 rounded-full flex items-center justify-center">
                              <Sparkles className="text-[#141414]/20" size={32} />
                            </div>
                            <div>
                              <h3 className="font-bold">Enhance your lesson</h3>
                              <p className="text-sm text-[#141414]/40">Generate AI illustrations or videos to better understand complex Python concepts.</p>
                            </div>
                          </div>
                        )}
                        
                        {isLoading && (conceptImage || conceptVideo) && (
                          <div className="flex items-center justify-center p-8">
                            <div className="w-8 h-8 border-4 border-[#141414]/10 border-t-[#141414] rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentView === 'playground' && (
              <motion.div 
                key="playground"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="h-full flex flex-col gap-6"
              >
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                  {/* Editor */}
                  <div className="bg-[#141414] rounded-3xl overflow-hidden flex flex-col shadow-xl">
                    <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                          <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                        </div>
                        <span className="text-white/40 text-xs font-mono ml-4">main.py</span>
                      </div>
                      <button 
                        onClick={handleAnalyzeCode}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        <Play size={14} fill="currentColor" />
                        Run & Analyze
                      </button>
                    </div>
                    <textarea 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 bg-transparent text-emerald-400 font-mono p-6 resize-none focus:outline-none text-sm leading-relaxed"
                      spellCheck={false}
                    />
                  </div>

                  {/* Analysis Panel */}
                  <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                    {isLoading ? (
                      <div className="flex-1 bg-white rounded-3xl border border-[#141414]/10 p-8 flex flex-col items-center justify-center gap-4">
                        <Zap className="text-amber-500 animate-bounce" size={32} />
                        <p className="font-bold">Gemini is thinking...</p>
                      </div>
                    ) : analysis ? (
                      <>
                        <div className="bg-white rounded-3xl border border-[#141414]/10 p-6 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="text-amber-500" size={20} />
                            <h3 className="font-bold">Explanation</h3>
                          </div>
                          <p className="text-sm text-[#141414]/70 leading-relaxed">{analysis.explanation}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white rounded-3xl border border-[#141414]/10 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <Bug className="text-rose-500" size={20} />
                              <h3 className="font-bold">Bugs</h3>
                            </div>
                            <ul className="space-y-2">
                              {analysis.bugs.length > 0 ? analysis.bugs.map((bug: string, i: number) => (
                                <li key={i} className="text-sm text-rose-600 flex gap-2">
                                  <span className="opacity-50">•</span> {bug}
                                </li>
                              )) : (
                                <li className="text-sm text-emerald-600">No bugs detected!</li>
                              )}
                            </ul>
                          </div>
                          <div className="bg-white rounded-3xl border border-[#141414]/10 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <Sparkles className="text-indigo-500" size={20} />
                              <h3 className="font-bold">Improvements</h3>
                            </div>
                            <ul className="space-y-2">
                              {analysis.improvements.map((imp: string, i: number) => (
                                <li key={i} className="text-sm text-indigo-600 flex gap-2">
                                  <span className="opacity-50">•</span> {imp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-[#141414] rounded-3xl p-6 shadow-xl">
                          <div className="flex items-center gap-2 mb-4">
                            <Terminal className="text-white/40" size={20} />
                            <h3 className="text-white font-bold">Simulated Output</h3>
                          </div>
                          <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap">{analysis.output}</pre>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 bg-white rounded-3xl border border-dashed border-[#141414]/20 p-8 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 bg-[#141414]/5 rounded-full flex items-center justify-center">
                          <Code className="text-[#141414]/20" size={32} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Ready to Analyze</h3>
                          <p className="text-sm text-[#141414]/40 max-w-xs mx-auto">Write some Python code and click "Run & Analyze" to get AI feedback.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto h-full flex flex-col gap-6"
              >
                <div className="flex-1 bg-white rounded-3xl border border-[#141414]/10 shadow-sm flex flex-col overflow-hidden">
                  <div className="px-8 py-6 border-b border-[#141414]/5 flex items-center justify-between bg-[#F5F5F4]/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#141414] flex items-center justify-center">
                        <Cpu className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold">PyCoach AI</h3>
                        <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Online
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center gap-4 opacity-40">
                        <MessageSquare size={48} />
                        <p className="max-w-xs">Ask me anything about Python! I can explain concepts, debug code, or suggest projects.</p>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] px-6 py-4 rounded-3xl text-sm leading-relaxed",
                          msg.role === 'user' 
                            ? "bg-[#141414] text-white rounded-tr-none" 
                            : "bg-[#F5F5F4] text-[#141414] rounded-tl-none border border-[#141414]/5"
                        )}>
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#F5F5F4] px-6 py-4 rounded-3xl rounded-tl-none border border-[#141414]/5 flex gap-1">
                          <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-[#141414]/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-white border-t border-[#141414]/5">
                    <div className="relative flex items-center gap-4">
                      <button 
                        onClick={handleTranscribe}
                        className={cn(
                          "p-4 rounded-2xl transition-all",
                          isTranscribing ? "bg-rose-500 text-white animate-pulse" : "bg-[#F5F5F4] text-[#141414]/40 hover:text-[#141414]"
                        )}
                      >
                        <Mic size={20} />
                      </button>
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isTranscribing ? "Listening..." : "Type your question..."} 
                        className="flex-1 pl-6 pr-16 py-4 bg-[#F5F5F4] border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#141414]/10 transition-all"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="absolute right-2 p-3 bg-[#141414] text-white rounded-xl hover:scale-105 transition-transform"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'voice' && (
              <motion.div 
                key="voice"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl mx-auto h-full flex flex-col items-center justify-center text-center gap-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl"
                  />
                  <div className="relative w-48 h-48 bg-white rounded-full border border-[#141414]/10 shadow-2xl flex items-center justify-center">
                    <Mic size={64} className="text-[#141414]" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-3xl font-bold mb-4">Conversational Tutor</h2>
                  <p className="text-[#141414]/60 max-w-md mx-auto">
                    Speak naturally to practice your Python knowledge. Our AI will listen and guide you through concepts in real-time.
                  </p>
                </div>

                <button className="px-8 py-4 bg-[#141414] text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3">
                  <Play size={20} fill="currentColor" />
                  Start Conversation
                </button>

                <div className="grid grid-cols-3 gap-4 w-full mt-8">
                  <VoiceStat icon={<Activity size={16} />} label="Clarity" value="98%" />
                  <VoiceStat icon={<Layers size={16} />} label="Context" value="Deep" />
                  <VoiceStat icon={<Zap size={16} />} label="Latency" value="Low" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  onClick: () => void,
  collapsed?: boolean
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
        active 
          ? "bg-[#141414] text-white shadow-lg shadow-[#141414]/10" 
          : "text-[#141414]/60 hover:bg-[#141414]/5 hover:text-[#141414]",
        collapsed && "justify-center px-0"
      )}
    >
      <div className={cn("transition-transform group-hover:scale-110", active && "scale-110")}>
        {icon}
      </div>
      {!collapsed && <span className="font-semibold text-sm">{label}</span>}
      {active && collapsed && (
        <motion.div 
          layoutId="active-pill"
          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
        />
      )}
    </button>
  );
}

function VoiceStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-[#141414]/5 flex flex-col items-center gap-1">
      <div className="text-[#141414]/40 mb-1">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#141414]/40">{label}</span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}
