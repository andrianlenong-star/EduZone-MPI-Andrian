/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  PromptInput,
  MediaType,
  ToneKey,
  EducationalPhase,
  SubjectType,
  phaseLabels,
  subjectLabels,
  EXAMPLE_DATA,
  EXAMPLE_TTS_DATA,
  validatePromptInput,
  generatePromptText,
  getReadyToUseTTSCode,
} from './utils/promptGenerator.ts';

export default function App() {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [phase, setPhase] = useState<EducationalPhase>('fase_c');
  const [subject, setSubject] = useState<SubjectType>('ipas');
  const [mediaType, setMediaType] = useState<MediaType>('tts_feature');
  const [objective, setObjective] = useState('');
  const [tone, setTone] = useState<ToneKey>('fun');
  const [extra, setExtra] = useState('');
  
  const [promptOutput, setPromptOutput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'code' | 'demo'>('prompt');
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);

  // Interactive Live TTS Demo State
  const [ttsState, setTtsState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [activeSentence, setActiveSentence] = useState<number>(-1);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [ttsStatusMessage, setTtsStatusMessage] = useState<string>('Siap membacakan materi');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Demo Sentences for Live Interactive TTS Preview
  const demoSentences = [
    'Selamat datang di Media Pembelajaran Interaktif EduZone!',
    'Materi hari ini membahas Ekosistem dan Hubungan Timbal Balik Antar Makhluk Hidup.',
    'Tumbuhan hijau berperan penting sebagai produsen yang menghasilkan energi makanan melalui fotosintesis.',
    'Hewan herbivora memakan tumbuhan, lalu karnivora memangsa herbivora untuk menjaga keseimbangan alam.',
    'Mari kita jaga kelestarian lingkungan agar ekosistem bumi kita tetap harmonis dan lestari.'
  ];

  // Initialize with TTS example data on first load
  useEffect(() => {
    applyExample(EXAMPLE_TTS_DATA);

    // Cancel speech on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerate = (customInput?: PromptInput) => {
    const currentTopic = customInput ? customInput.topic : topic;
    const currentAudience = customInput ? customInput.audience : audience;

    const validation = validatePromptInput(currentTopic, currentAudience);
    if (!validation.isValid) {
      setValidationError(validation.errorMessage || 'Harap lengkapi formulir.');
      return;
    }

    setValidationError(null);

    const inputData: PromptInput = customInput || {
      topic,
      audience,
      phase,
      subject,
      mediaType,
      objective,
      tone,
      extra,
    };

    const generated = generatePromptText(inputData);
    setPromptOutput(generated);

    // Highlight animation
    setIsHighlighting(true);
    setTimeout(() => {
      setIsHighlighting(false);
    }, 400);
  };

  const applyExample = (data: PromptInput) => {
    setTopic(data.topic);
    setAudience(data.audience);
    if (data.phase) setPhase(data.phase);
    if (data.subject) setSubject(data.subject);
    setMediaType(data.mediaType);
    setObjective(data.objective || '');
    setTone(data.tone);
    setExtra(data.extra || '');
    setValidationError(null);

    handleGenerate(data);
  };

  const handleCopyPrompt = async () => {
    if (!promptOutput) {
      setValidationError('Tidak ada prompt yang bisa disalin. Buat prompt terlebih dahulu!');
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(promptOutput);
      } else if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
      }
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
      }
    }
  };

  const handleCopyCode = async () => {
    const code = getReadyToUseTTSCode();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else if (codeTextareaRef.current) {
        codeTextareaRef.current.select();
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      if (codeTextareaRef.current) {
        codeTextareaRef.current.select();
        document.execCommand('copy');
        window.getSelection()?.removeAllRanges();
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  };

  const simTimerRef = useRef<any>(null);

  // Live TTS Engine Handlers with resilient visual fallback
  const speakSentenceAtIndex = (index: number, currentRate: number = speechRate) => {
    if (index >= demoSentences.length) {
      stopTTS();
      setTtsStatusMessage('Selesai membacakan seluruh materi.');
      return;
    }

    if (simTimerRef.current) {
      clearTimeout(simTimerRef.current);
      simTimerRef.current = null;
    }

    setActiveSentence(index);
    setTtsState('playing');
    setTtsStatusMessage(`Membaca kalimat ke-${index + 1} dari ${demoSentences.length}...`);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = demoSentences[index];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = currentRate;

      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
      if (idVoice) utterance.voice = idVoice;

      utterance.onend = () => {
        const nextIdx = index + 1;
        if (nextIdx < demoSentences.length) {
          speakSentenceAtIndex(nextIdx, currentRate);
        } else {
          stopTTS();
          setTtsStatusMessage('Selesai membacakan seluruh materi.');
        }
      };

      utterance.onerror = () => {
        // Fallback for headless environments or muted devices: advance visually based on text length
        const duration = Math.max(1200, (text.split(' ').length * 350) / currentRate);
        simTimerRef.current = setTimeout(() => {
          const nextIdx = index + 1;
          if (nextIdx < demoSentences.length) {
            speakSentenceAtIndex(nextIdx, currentRate);
          } else {
            stopTTS();
            setTtsStatusMessage('Selesai membacakan seluruh materi.');
          }
        }, duration);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Browser without SpeechSynthesis
      const duration = 1500 / currentRate;
      simTimerRef.current = setTimeout(() => {
        const nextIdx = index + 1;
        if (nextIdx < demoSentences.length) {
          speakSentenceAtIndex(nextIdx, currentRate);
        } else {
          stopTTS();
          setTtsStatusMessage('Selesai membacakan seluruh materi.');
        }
      }, duration);
    }
  };

  const playTTS = () => {
    if (ttsState === 'paused') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
      setTtsState('playing');
      setTtsStatusMessage('Melanjutkan pembacaan...');
      return;
    }

    const startIdx = activeSentence >= 0 && activeSentence < demoSentences.length ? activeSentence : 0;
    speakSentenceAtIndex(startIdx, speechRate);
  };

  const pauseTTS = () => {
    if (simTimerRef.current) {
      clearTimeout(simTimerRef.current);
      simTimerRef.current = null;
    }
    if ('speechSynthesis' in window && ttsState === 'playing') {
      window.speechSynthesis.pause();
    }
    setTtsState('paused');
    setTtsStatusMessage('Audio narasi dijeda.');
  };

  const stopTTS = () => {
    if (simTimerRef.current) {
      clearTimeout(simTimerRef.current);
      simTimerRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setTtsState('idle');
    setActiveSentence(-1);
    setTtsStatusMessage('Audio dihentikan.');
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    if (ttsState === 'playing' && activeSentence >= 0) {
      speakSentenceAtIndex(activeSentence, newRate);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header with Custom Logo and Creator Info */}
      <header className="w-full max-w-6xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          {/* Neon Logo EduZone */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300"></div>
            <img
              src="/assets/aistudio/Logo_EduZone_6696d678.png"
              alt="Logo EduZone"
              className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl shadow-xl object-cover bg-slate-900 border border-white/20"
            />
          </div>

          <div>
            <div className="flex flex-col md:flex-row md:items-baseline gap-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                EduZone MPI Prompt
              </h1>
            </div>

            {/* Creator Attribution */}
            <div className="mt-1 flex items-center justify-center md:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-xs">
                <i className="fa-solid fa-user-pen text-indigo-600" aria-hidden="true"></i>
                Created by: <strong>ANDRIAN, S.S.Gr.</strong>
              </span>
            </div>

            <p className="text-gray-600 mt-1.5 text-xs md:text-sm font-medium">
              Generator Media Pembelajaran Interaktif (MPI) AI untuk Gemini Canvas, Canva, dan Web App Edukasi.
            </p>
          </div>
        </div>

        {/* Badge Right */}
        <div className="mt-2 md:mt-0 bg-brand-100 text-brand-700 px-4 py-2 rounded-full text-xs md:text-sm font-semibold flex items-center gap-2 border border-brand-200 shadow-xs">
          <i className="fa-solid fa-bolt text-brand-600" aria-hidden="true"></i>
          <span>Didesain untuk Media Pembelajaran Interaktif (MPI)</span>
        </div>
      </header>

      {/* Preset Quick Selectors */}
      <section aria-label="Preset Pilihan Cepat" className="w-full max-w-6xl mb-6">
        <div className="glass-panel rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2 text-gray-700 font-semibold">
            <i className="fa-solid fa-wand-magic-sparkles text-brand-600"></i>
            <span>Preset Rekomendasi:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyExample(EXAMPLE_TTS_DATA)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <i className="fa-solid fa-volume-high"></i>
              <span>Fitur TTS Interaktif (Audio &amp; Highlight)</span>
            </button>
            <button
              type="button"
              onClick={() => applyExample(EXAMPLE_DATA)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-medium border border-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-rocket text-purple-600"></i>
              <span>Tata Surya (Web App Canvas)</span>
            </button>
            <button
              type="button"
              onClick={() => applyExample({
                topic: 'Siklus Air dan Kelestarian Lingkungan',
                audience: 'Siswa SD Kelas 5 Kurikulum Merdeka',
                phase: 'fase_c',
                subject: 'ipas',
                mediaType: 'module',
                objective: 'Siswa dapat menjelaskan tahapan evaporasi, kondensasi, presipitasi dan pentingnya hemat air.',
                tone: 'fun',
                extra: 'Sertakan contoh kasus sehari-hari dan lembar kerja eksplorasi.',
              })}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-700 font-medium border border-gray-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-cloud-showers-heavy text-blue-500"></i>
              <span>Siklus Air (Modul SD)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCurriculumModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-graduation-cap text-indigo-600"></i>
              <span>Panduan Kelas, Kurikulum &amp; Mapel</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (7 columns wide) */}
        <section aria-labelledby="form-heading" className="lg:col-span-6 glass-panel rounded-2xl shadow-xl p-6 md:p-7 w-full">
          <h2 id="form-heading" className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-sliders text-brand-600" aria-hidden="true"></i> Konfigurasi Media Pembelajaran
            </span>
            <span className="text-xs font-normal text-gray-500">EduZone Framework</span>
          </h2>

          {validationError && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between"
            >
              <span>{validationError}</span>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-red-500 hover:text-red-700 font-bold ml-2 text-sm cursor-pointer"
                aria-label="Tutup pesan peringatan"
              >
                ✕
              </button>
            </div>
          )}

          <form
            id="promptForm"
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
          >
            {/* Topic */}
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                1. Topik Materi (Apa yang ingin diajarkan?)
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Contoh: Fitur Text-to-Speech (TTS) atau Siklus Air SD"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow outline-none text-sm"
                required
              />
            </div>

            {/* Audience */}
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                2. Target Audiens (Siapa yang akan belajar?)
              </label>
              <input
                type="text"
                id="audience"
                value={audience}
                onChange={(e) => {
                  setAudience(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Contoh: Siswa Sekolah Dasar Kelas 5 / Pengembang MPI"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow outline-none text-sm"
                required
              />
            </div>

            {/* Kurikulum Merdeka Phase and Subject Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="phase" className="block text-sm font-medium text-gray-700 mb-1">
                  Fase &amp; Jenjang Kelas (Kurikulum Merdeka)
                </label>
                <select
                  id="phase"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value as EducationalPhase)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white text-gray-800 text-xs md:text-sm font-medium"
                >
                  <option value="fase_a">Fase A (Kelas 1 - 2 SD)</option>
                  <option value="fase_b">Fase B (Kelas 3 - 4 SD)</option>
                  <option value="fase_c">Fase C (Kelas 5 - 6 SD)</option>
                  <option value="umum">Umum / Terbuka (SD Kelas 1 - 6)</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Mata Pelajaran (Mapel)
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectType)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white text-gray-800 text-xs md:text-sm font-medium"
                >
                  <option value="ipas">IPAS (Alam &amp; Sosial)</option>
                  <option value="bahasa_indonesia">Bahasa Indonesia</option>
                  <option value="matematika">Matematika</option>
                  <option value="pancasila">Pendidikan Pancasila</option>
                  <option value="bahasa_inggris">Bahasa Inggris</option>
                  <option value="lainnya">Lainnya / Muatan Lokal</option>
                </select>
              </div>
            </div>

            {/* Media Type */}
            <div>
              <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-1">
                3. Jenis Multimedia / Output
              </label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white text-gray-800 text-sm font-medium"
              >
                <option value="tts_feature">⭐ Fitur Text-to-Speech (TTS) Interaktif (Web Speech API + Text Highlighting)</option>
                <option value="app_game">Web App / Game Interaktif (HTML/JS - Untuk Gemini Canvas/Code)</option>
                <option value="presentation">Slide Presentasi (Untuk di-desain di Canva)</option>
                <option value="module">Modul Ajar / Handout Interaktif (PDF/Teks)</option>
                <option value="video_script">Naskah Video Pembelajaran (Animasi/Youtube)</option>
                <option value="quiz">Kuis/Asesmen Interaktif dengan Feedback</option>
              </select>
            </div>

            {/* Learning Objective */}
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-1">
                4. Tujuan Pembelajaran (Capaian)
              </label>
              <textarea
                id="objective"
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Contoh: Siswa dapat mendengarkan narasi suara dengan penyorotan kalimat otomatis..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow outline-none resize-none text-sm"
              ></textarea>
            </div>

            {/* Tone/Style */}
            <div>
              <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
                5. Gaya Bahasa &amp; Pendekatan
              </label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as ToneKey)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none bg-white text-gray-800 text-sm"
              >
                <option value="fun">Menyenangkan, Interaktif &amp; Penuh Rasa Ingin Tahu (Fun &amp; Engaging)</option>
                <option value="formal">Formal, Akademis &amp; Terstruktur (High Education)</option>
                <option value="storytelling">Bercerita (Storytelling) berbasis Studi Kasus</option>
                <option value="simple">Sangat Sederhana, Bertahap (Step-by-step) &amp; Mudah Dicerna</option>
              </select>
            </div>

            {/* Additional Custom Instructions */}
            <div>
              <label htmlFor="extra" className="block text-sm font-medium text-gray-700 mb-1">
                6. Instruksi Tambahan (Opsional)
              </label>
              <input
                type="text"
                id="extra"
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Contoh: Tambahkan tombol play/pause/stop, kecepatan 0.8x-1.2x, suara cancel saat ganti halaman."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow outline-none text-sm"
              />
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleGenerate()}
                className="bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg shadow-brand-500/30 cursor-pointer text-sm"
              >
                <i className="fa-solid fa-gears" aria-hidden="true"></i> Buat Prompt Sekarang
              </button>
              <button
                type="button"
                onClick={() => applyExample(EXAMPLE_TTS_DATA)}
                className="bg-gray-100 hover:bg-gray-200 active:scale-[0.98] text-gray-700 px-4 py-3 rounded-lg font-medium transition-all border border-gray-300 text-sm flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-lightbulb text-yellow-500" aria-hidden="true"></i> Isi Data Contoh TTS
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Tabbed Output Panel (6 columns wide) */}
        <section aria-labelledby="result-heading" className="lg:col-span-6 flex flex-col gap-6 w-full">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-gray-200/80 p-1 rounded-xl shadow-inner text-xs md:text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'prompt'
                  ? 'bg-white text-brand-700 font-bold shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fa-solid fa-terminal"></i>
              <span>1. Prompt AI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'code'
                  ? 'bg-white text-indigo-700 font-bold shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fa-solid fa-code"></i>
              <span>2. Kode Jadi TTS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'demo'
                  ? 'bg-white text-emerald-700 font-bold shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fa-solid fa-circle-play"></i>
              <span>3. Demo TTS Live</span>
            </button>
          </div>

          {/* TAB 1: Generated AI Prompt */}
          {activeTab === 'prompt' && (
            <div className="glass-panel rounded-2xl shadow-xl p-6 flex flex-col border-t-4 border-t-brand-500 min-h-[500px]">
              <div className="flex justify-between items-center mb-3">
                <h2 id="result-heading" className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                  <i className="fa-solid fa-terminal text-brand-600" aria-hidden="true"></i> Hasil Prompt EduZone
                </h2>
                {copiedPrompt && (
                  <span
                    id="copyBadge"
                    className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider transition-opacity animate-pulse"
                  >
                    Tersalin!
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-3">
                Salin teks prompt di bawah ini lalu tempelkan (paste) ke Gemini Canvas, ChatGPT, atau AI Builder favorit Anda.
              </p>

              <div className="relative flex-grow flex flex-col">
                <textarea
                  ref={textareaRef}
                  id="promptOutput"
                  readOnly
                  value={promptOutput}
                  className={`w-full flex-grow min-h-[360px] p-4 rounded-xl border border-gray-200 text-gray-800 text-xs md:text-sm font-mono leading-relaxed outline-none resize-none transition-colors ${
                    isHighlighting ? 'bg-brand-50' : 'bg-gray-50'
                  }`}
                  placeholder="Hasil prompt akan muncul di sini..."
                ></textarea>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  id="copyBtn"
                  aria-label="Salin Prompt"
                  className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-gray-700 p-2.5 rounded-lg shadow-md border border-gray-200 transition-colors tooltip group cursor-pointer"
                >
                  {copiedPrompt ? (
                    <i className="fa-solid fa-check text-green-600" aria-hidden="true"></i>
                  ) : (
                    <i className="fa-regular fa-copy" aria-hidden="true"></i>
                  )}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Salin Prompt
                  </span>
                </button>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3 text-xs md:text-sm text-blue-800">
                <i className="fa-solid fa-circle-info mt-0.5 shrink-0" aria-hidden="true"></i>
                <p>
                  <b>Tips Guru &amp; Developer:</b> Untuk Gemini Canvas, pilih <strong>Web App / Game Interaktif</strong> atau <strong>Fitur TTS Interaktif</strong> untuk melihat AI membuatkan aplikasi utuh di jendela pratinjau samping secara langsung!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Ready-to-Use TTS Code Module */}
          {activeTab === 'code' && (
            <div className="glass-panel rounded-2xl shadow-xl p-6 flex flex-col border-t-4 border-t-indigo-500 min-h-[500px]">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <i className="fa-solid fa-code text-indigo-600"></i> Kode Modul TTS Siap Tempel
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    HTML + CSS + Web Speech API (id-ID) lengkap dengan bar kontrol dan highlight kalimat.
                  </p>
                </div>
                {copiedCode && (
                  <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider animate-pulse">
                    Kode Tersalin!
                  </span>
                )}
              </div>

              <div className="relative flex-grow flex flex-col">
                <textarea
                  ref={codeTextareaRef}
                  readOnly
                  value={getReadyToUseTTSCode()}
                  className="w-full flex-grow min-h-[350px] p-4 rounded-xl border border-gray-200 bg-slate-900 text-emerald-400 text-xs font-mono leading-relaxed outline-none resize-none"
                ></textarea>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  aria-label="Salin Kode TTS"
                  className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-md transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <i className="fa-solid fa-check text-white"></i> Berhasil Disalin
                    </>
                  ) : (
                    <>
                      <i className="fa-regular fa-copy text-white"></i> Salin Semua Kode
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-indigo-600"></i> Cara Memasang ke Proyek MPI Anda:
                </p>
                <ol className="list-decimal list-inside pl-1 space-y-0.5 text-indigo-800">
                  <li>Tempelkan bagian HTML di halaman materi/submateri Anda.</li>
                  <li>Beri kelas <code className="bg-indigo-100 px-1 py-0.5 rounded text-indigo-900 font-bold">tts-sentence</code> pada setiap judul atau paragraf yang ingin dinarasikan.</li>
                  <li>Sistem otomatis membacakan teks murni (tanpa tag HTML) dan menyorotnya secara berurutan.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Interactive Live TTS Demo */}
          {activeTab === 'demo' && (
            <div className="glass-panel rounded-2xl shadow-xl p-6 flex flex-col border-t-4 border-t-emerald-500 min-h-[500px]">
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <i className="fa-solid fa-headphones text-emerald-600"></i> Uji Coba Audio TTS EduZone
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Simulasi live Web Speech API dengan penyorotan teks real-time Bahasa Indonesia.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${ttsState === 'playing' ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`}></span>
                  {ttsState === 'playing' ? 'Sedang Membaca' : ttsState === 'paused' ? 'Dijeda' : 'Standby'}
                </span>
              </div>

              {/* Audio Controls Bar */}
              <div className="bg-slate-900 text-white p-4 rounded-xl shadow-md mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {ttsState !== 'playing' ? (
                    <button
                      type="button"
                      onClick={playTTS}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold rounded-lg text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <i className="fa-solid fa-play"></i> Putar Narasi
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseTTS}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-lg text-xs md:text-sm flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <i className="fa-solid fa-pause"></i> Jeda
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={stopTTS}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-gray-200 font-semibold rounded-lg text-xs md:text-sm flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                  >
                    <i className="fa-solid fa-stop"></i> Berhenti
                  </button>
                </div>

                {/* Speech Rate Controls */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 font-medium">Kecepatan:</span>
                  <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                    {[0.8, 1.0, 1.2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleRateChange(rate)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          speechRate === rate
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div className="text-xs text-gray-500 mb-3 flex items-center gap-1.5 italic font-medium">
                <i className="fa-solid fa-circle-notch fa-spin text-emerald-500" style={{ display: ttsState === 'playing' ? 'inline-block' : 'none' }}></i>
                <span>Status Audio: {ttsStatusMessage}</span>
              </div>

              {/* Text Area with Live Highlighting */}
              <div className="flex-grow p-4 bg-white border border-gray-200 rounded-xl space-y-3 shadow-inner">
                <h3 className={`text-base md:text-lg font-bold transition-all p-2 rounded-lg ${
                  activeSentence === 0 ? 'bg-amber-200/90 text-indigo-950 shadow-sm ring-2 ring-amber-400 font-extrabold' : 'text-gray-800'
                }`}>
                  {demoSentences[0]}
                </h3>

                {demoSentences.slice(1).map((sentence, idx) => {
                  const sentenceIdx = idx + 1;
                  const isActive = activeSentence === sentenceIdx;
                  return (
                    <p
                      key={sentenceIdx}
                      className={`text-xs md:text-sm transition-all p-2 rounded-lg leading-relaxed ${
                        isActive
                          ? 'bg-amber-200/90 text-indigo-950 font-semibold shadow-sm ring-2 ring-amber-400'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {sentence}
                    </p>
                  );
                })}
              </div>

              <div className="mt-3 text-xs text-gray-500 text-center">
                <span>💡 Sentuh atau klik <strong>Putar Narasi</strong> untuk mendengarkan pelafalan bahasa Indonesia dengan penyorotan kalimat aktif.</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Modal Panduan Jenjang, Kurikulum & Mapel */}
      {showCurriculumModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 border border-gray-100">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <i className="fa-solid fa-graduation-cap text-lg"></i>
                </div>
                <div>
                  <h3 id="modal-title" className="text-lg md:text-xl font-bold text-gray-900">
                    Cakupan Jenjang, Kurikulum &amp; Mata Pelajaran
                  </h3>
                  <p className="text-xs text-gray-500">EduZone MPI Prompt — Standar Kurikulum Merdeka Indonesia</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCurriculumModal(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-lg"
                aria-label="Tutup Panduan"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 text-xs md:text-sm text-gray-700 leading-relaxed">
              {/* Jenjang & Kelas */}
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100">
                <h4 className="font-bold text-indigo-950 mb-2 flex items-center gap-2 text-sm">
                  <i className="fa-solid fa-school text-indigo-600"></i>
                  1. Jenjang &amp; Kelas Sasaran
                </h4>
                <p className="mb-2">
                  Aplikasi ini dirancang khusus untuk jenjang <strong>Sekolah Dasar (SD Kelas 1 hingga Kelas 6)</strong>, yang terbagi dalam 3 fase perkembangan kognitif anak:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                    <span className="font-bold text-indigo-700 block text-xs">Fase A (Kelas 1 - 2 SD)</span>
                    <span className="text-[11px] text-gray-600 block mt-1">Literasi awal, audio narasi TTS bersuara ramah, visual konkret &amp; gamifikasi ringan.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                    <span className="font-bold text-indigo-700 block text-xs">Fase B (Kelas 3 - 4 SD)</span>
                    <span className="text-[11px] text-gray-600 block mt-1">Eksplorasi konsep terstruktur, pemahaman paragraf bersorot, dan simulasi interaktif dasar.</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-indigo-100 shadow-2xs">
                    <span className="font-bold text-indigo-700 block text-xs">Fase C (Kelas 5 - 6 SD)</span>
                    <span className="text-[11px] text-gray-600 block mt-1">Penalaran kritis, eksperimen sains/matematika virtual, dan asesmen formatif C1-C4.</span>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-800 mt-2 italic">
                  *Juga dapat diadaptasi untuk jenjang SMP/SMA yang membutuhkan media pembelajaran interaktif berbasis web.
                </p>
              </div>

              {/* Kurikulum */}
              <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-100">
                <h4 className="font-bold text-purple-950 mb-1.5 flex items-center gap-2 text-sm">
                  <i className="fa-solid fa-book-open text-purple-600"></i>
                  2. Kurikulum: Kurikulum Merdeka
                </h4>
                <p className="mb-2">
                  Diselaraskan 100% dengan paradigma <strong>Kurikulum Merdeka</strong> di Indonesia:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                  <li><strong>Pembelajaran Terdiferensiasi:</strong> Mendukung gaya belajar visual, auditori (Text-to-Speech), dan kinestetik (simulasi klik &amp; seret).</li>
                  <li><strong>Capaian Pembelajaran (CP) &amp; ATP:</strong> Fokus pada pemahaman mendalam bukan sekadar menghafal.</li>
                  <li><strong>Profil Pelajar Pancasila:</strong> Mengasah kemandirian, nalar kritis, dan gotong royong melalui aktivitas edukatif.</li>
                </ul>
              </div>

              {/* Mata Pelajaran */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <h4 className="font-bold text-emerald-950 mb-1.5 flex items-center gap-2 text-sm">
                  <i className="fa-solid fa-shapes text-emerald-600"></i>
                  3. Mata Pelajaran yang Didukung
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-xs">
                  <div className="p-2 bg-white rounded border border-emerald-100 font-medium text-emerald-900">
                    🌿 <strong>IPAS</strong> (Sains &amp; Sosial)
                  </div>
                  <div className="p-2 bg-white rounded border border-emerald-100 font-medium text-emerald-900">
                    📖 <strong>Bahasa Indonesia</strong> (Literasi)
                  </div>
                  <div className="p-2 bg-white rounded border border-emerald-100 font-medium text-emerald-900">
                    🔢 <strong>Matematika</strong> (Numerasi)
                  </div>
                  <div className="p-2 bg-white rounded border border-emerald-100 font-medium text-emerald-900">
                    🇮🇩 <strong>Pendidikan Pancasila</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-emerald-100 font-medium text-emerald-900">
                    🎨 <strong>Seni Budaya (SBdP)</strong>
                  </div>
                  <div className="p-2 bg-white rounded border border-emerald-100 font-medium text-emerald-900">
                    🗣️ <strong>Bahasa Inggris / Mulok</strong>
                  </div>
                </div>
              </div>

              {/* 3 Pilar Utama MPI */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100 text-xs">
                <h4 className="font-bold text-amber-950 mb-1.5 flex items-center gap-2 text-sm">
                  <i className="fa-solid fa-star text-amber-600"></i>
                  4. 3 Pilar Utama MPI EduZone (Wajib Terpenuhi)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-800">
                  <li><strong>Penjelasan Materi:</strong> Disajikan dengan bahasa ramah anak, apersepsi pemantik, dan analogi konkret.</li>
                  <li><strong>Simulasi Interaktif:</strong> Aktivitas eksplorasi langsung (slider, drag-and-drop, eksperimen virtual).</li>
                  <li><strong>Latihan Soal Terkorelasi:</strong> Asesmen formatif C1-C4 yang selaras 100% materi dilengkapi pembahasan.</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCurriculumModal(false)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs md:text-sm cursor-pointer shadow-md"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Creator and EduZone info */}
      <footer className="mt-12 text-center text-gray-500 text-xs md:text-sm pb-8 flex flex-col items-center gap-1">
        <p className="font-semibold text-gray-700">
          EduZone MPI Prompt | Media Pembelajaran Interaktif Edukasi
        </p>
        <p>
          Created by: <strong>ANDRIAN, S.S.Gr.</strong> — Dirancang khusus untuk guru, instruktur, dan pengembang MPI Kurikulum Merdeka.
        </p>
      </footer>
    </div>
  );
}
