/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Mic,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Loader2,
  Volume2,
  Clock,
  BarChart,
  BookOpen,
  Users,
  Gauge,
  Save,
  Library,
  Trash2,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LEVELS = [
  { id: 'A1', label: 'A1' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
  { id: 'C1', label: 'C1' },
  { id: 'C2', label: 'C2' }
];

interface SavedPodcast {
  id: number;
  title: string;
  level: string;
  host_count: string;
  created_at: string;
  transcript?: string;
  vocabulary?: string;
  audio_data?: string;
}

export default function App() {
  const [view, setView] = useState<'create' | 'library' | 'detail'>('create');
  const [mode, setMode] = useState<'generate' | 'script'>('generate');

  // Generate mode state
  const [subject, setSubject] = useState('');
  const [sourceType, setSourceType] = useState<'subject' | 'article'>('subject');
  const [articleSourceType, setArticleSourceType] = useState<'text' | 'url'>('text');
  const [articleText, setArticleText] = useState('');
  const [articleText2, setArticleText2] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [articleUrl2, setArticleUrl2] = useState('');
  const [specificWords, setSpecificWords] = useState('');
  const [speechSpeed, setSpeechSpeed] = useState(100);
  const [length, setLength] = useState(4);
  const [level, setLevel] = useState('B2');
  const [hostCount, setHostCount] = useState<'one' | 'two'>('two');

  // My Script mode state
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [scriptHostCount, setScriptHostCount] = useState<'one' | 'two'>('two');
  const [scriptSpeed, setScriptSpeed] = useState(100);

  // Shared output state
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [vocabularyChart, setVocabularyChart] = useState('');
  const [activeTab, setActiveTab] = useState<'transcript' | 'vocabulary'>('transcript');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [vocabCopied, setVocabCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Library state
  const [library, setLibrary] = useState<SavedPodcast[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<SavedPodcast | null>(null);
  const [detailAudioUrl, setDetailAudioUrl] = useState<string | null>(null);
  const [detailIsPlaying, setDetailIsPlaying] = useState(false);
  const [detailCurrentTime, setDetailCurrentTime] = useState(0);
  const [detailDuration, setDetailDuration] = useState(0);
  const [detailActiveTab, setDetailActiveTab] = useState<'transcript' | 'vocabulary'>('transcript');
  const detailAudioRef = useRef<HTMLAudioElement | null>(null);

  const fetchLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch('/api/podcasts');
      const data = await res.json();
      setLibrary(data);
    } finally {
      setLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (view === 'library') fetchLibrary();
  }, [view]);

  const handleSave = async () => {
    if (!transcript || !audioData) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedTitle,
          transcript,
          vocabulary: vocabularyChart,
          audioData,
          level: mode === 'script' ? '—' : level,
          hostCount: mode === 'script' ? scriptHostCount : hostCount,
        }),
      });
      const data = await res.json();
      setSavedId(data.id);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPodcast = async (podcast: SavedPodcast) => {
    const res = await fetch(`/api/podcasts/${podcast.id}`);
    const data = await res.json();
    setSelectedPodcast(data);
    if (data.audio_data) {
      const base64Standard = data.audio_data.replace(/-/g, '+').replace(/_/g, '/');
      const binaryString = atob(base64Standard);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'audio/wav' });
      setDetailAudioUrl(URL.createObjectURL(blob));
    }
    setDetailActiveTab('transcript');
    setDetailIsPlaying(false);
    setDetailCurrentTime(0);
    setView('detail');
  };

  const handleDeletePodcast = async (id: number) => {
    await fetch(`/api/podcasts/${id}`, { method: 'DELETE' });
    setLibrary(prev => prev.filter(p => p.id !== id));
  };

  // Shared audio generation: chunks script → TTS → WAV
  const generateAudio = async (
    script: string,
    hCount: 'one' | 'two',
    speed: number,
    lvl: string,
    readAsWritten: boolean
  ) => {
    const lines = script.split('\n');
    const chunks: string[] = [];
    let currentChunk = '';
    let currentSpeaker = 'Alex';

    for (const line of lines) {
      if (!line.trim()) continue;
      let processedLine = line.trim();
      if (processedLine.startsWith('Alex:')) currentSpeaker = 'Alex';
      else if (processedLine.startsWith('Sam:')) currentSpeaker = 'Sam';
      else if (hCount === 'two') processedLine = `${currentSpeaker}: ${processedLine}`;

      if ((currentChunk.length + processedLine.length) > 2500) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = processedLine + '\n';
      } else {
        currentChunk += processedLine + '\n';
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    const allPcmData: Uint8Array[] = [];
    let totalPcmLength = 0;
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      let retryCount = 0;
      const maxRetries = 7;
      let success = false;

      while (retryCount <= maxRetries && !success) {
        try {
          if (i > 0 && retryCount === 0) await sleep(3000);
          const ttsResponse = await fetch('/api/generate-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chunk, speechSpeed: speed, level: lvl, hostCount: hCount, readAsWritten }),
          });
          if (!ttsResponse.ok) {
            const errData = await ttsResponse.json();
            throw new Error(errData.error || `HTTP ${ttsResponse.status}`);
          }
          const ttsData = await ttsResponse.json();
          const base64Audio = ttsData.base64Audio;
          const mimeType = ttsData.mimeType || 'audio/pcm';
          if (!base64Audio) throw new Error("No audio data received from the model");

          if (mimeType.includes('pcm') || mimeType.includes('l16')) {
            const base64Standard = base64Audio.replace(/-/g, '+').replace(/_/g, '/');
            const binaryString = atob(base64Standard);
            const pcmData = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) pcmData[j] = binaryString.charCodeAt(j);
            allPcmData.push(pcmData);
            totalPcmLength += pcmData.length;
            success = true;
          } else {
            const audioBlob = await fetch(`data:${mimeType};base64,${base64Audio}`).then(res => res.blob());
            if (allPcmData.length === 0) {
              setAudioUrl(URL.createObjectURL(audioBlob));
              return;
            }
            success = true;
          }
        } catch (error: any) {
          if ((error?.message?.includes('429') || error?.status === 429) && retryCount < maxRetries) {
            retryCount++;
            await sleep(Math.pow(2, retryCount) * 1000);
          } else {
            throw error;
          }
        }
      }
      if (!success) throw new Error("Failed to generate audio after multiple retries due to rate limits.");
    }

    if (allPcmData.length > 0) {
      const combinedPcm = new Uint8Array(totalPcmLength);
      let offset = 0;
      for (const pcm of allPcmData) { combinedPcm.set(pcm, offset); offset += pcm.length; }

      const header = new ArrayBuffer(44);
      const dv = new DataView(header);
      const sampleRate = 24000;
      dv.setUint32(0, 0x52494646, false);
      dv.setUint32(4, 36 + totalPcmLength, true);
      dv.setUint32(8, 0x57415645, false);
      dv.setUint32(12, 0x666d7420, false);
      dv.setUint32(16, 16, true);
      dv.setUint16(20, 1, true);
      dv.setUint16(22, 1, true);
      dv.setUint32(24, sampleRate, true);
      dv.setUint32(28, sampleRate * 2, true);
      dv.setUint16(32, 2, true);
      dv.setUint16(34, 16, true);
      dv.setUint32(36, 0x64617461, false);
      dv.setUint32(40, totalPcmLength, true);

      const wavData = new Uint8Array(44 + totalPcmLength);
      wavData.set(new Uint8Array(header), 0);
      wavData.set(combinedPcm, 44);

      const audioBlob = new Blob([wavData], { type: 'audio/wav' });
      setAudioUrl(URL.createObjectURL(audioBlob));

      let binary = '';
      for (let i = 0; i < wavData.length; i++) binary += String.fromCharCode(wavData[i]);
      setAudioData(btoa(binary));
    }
  };

  const handleGenerate = async () => {
    const isSubjectMode = sourceType === 'subject';
    const isArticleUrlMode = !isSubjectMode && articleSourceType === 'url';

    if (isSubjectMode && !subject.trim()) return;
    if (!isSubjectMode && articleSourceType === 'text' && !articleText.trim()) return;
    if (isArticleUrlMode && !articleUrl.trim()) return;

    setIsGenerating(true);
    setTranscript('');
    setVocabularyChart('');
    setActiveTab('transcript');
    setAudioUrl(null);
    setAudioData(null);
    setSavedId(null);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject, sourceType, articleSourceType, articleText, articleText2,
          articleUrl, articleUrl2, specificWords, length, level, hostCount,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const fullText = data.fullText || '';

      if (fullText.startsWith("ERROR: COULD NOT ACCESS LINK")) {
        alert("The AI was unable to access the content of the link provided. Please try using the direct URL or paste the article text directly.");
        setIsGenerating(false);
        return;
      }

      const titleMatch = fullText.match(/^TITLE:\s*(.*)/i);
      const title = titleMatch ? titleMatch[1].trim() : (isSubjectMode ? subject : 'Podcast Episode');

      const vocabMatch = fullText.match(/VOCABULARY CHART[\s\S]*/i);
      const vocab = vocabMatch ? vocabMatch[0].replace(/VOCABULARY CHART/i, '').trim() : '';

      const script = fullText
        .replace(/^TITLE:.*\n?/i, '')
        .replace(/VOCABULARY CHART[\s\S]*/i, '')
        .trim();

      setGeneratedTitle(title);
      setTranscript(script);
      setVocabularyChart(vocab);

      await generateAudio(script, hostCount, speechSpeed, level, false);

    } catch (error: any) {
      console.error("Generation failed:", error);
      if (error?.message?.includes('429') || error?.status === 429) {
        alert("The AI is currently receiving too many requests. Please wait a minute and try again.");
      } else {
        alert("Failed to generate podcast: " + (error?.message || error));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScriptGenerate = async () => {
    if (!scriptTitle.trim() || !scriptText.trim()) return;

    setIsGenerating(true);
    setTranscript('');
    setVocabularyChart('');
    setActiveTab('transcript');
    setAudioUrl(null);
    setAudioData(null);
    setSavedId(null);

    setGeneratedTitle(scriptTitle);
    setTranscript(scriptText);

    try {
      await generateAudio(scriptText, scriptHostCount, scriptSpeed, 'B2', true);
    } catch (error: any) {
      console.error("Generation failed:", error);
      if (error?.message?.includes('429') || error?.status === 429) {
        alert("The AI is currently receiving too many requests. Please wait a minute and try again.");
      } else {
        alert("Failed to generate audio: " + (error?.message || error));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!audioUrl) return;
    try {
      setIsSharing(true);
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const fileName = `Podcast-${generatedTitle.replace(/\s+/g, '-')}.wav`;
      const file = new File([blob], fileName, { type: 'audio/wav' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const shareUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(`Check out this podcast: ${generatedTitle}! ${window.location.href}`)}`;
        window.open(shareUrl, '_blank');
        alert("WhatsApp Desktop requires you to download the file and drag it into the chat.\n\n1. Click Download (↓)\n2. Drag the file into WhatsApp.");
      }
    } catch (error) {
      const shareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this podcast: ${generatedTitle}! ${window.location.href}`)}`;
      window.open(shareUrl, '_blank');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(transcript); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const copyVocabToClipboard = () => { navigator.clipboard.writeText(vocabularyChart); setVocabCopied(true); setTimeout(() => setVocabCopied(false), 2000); };
  const togglePlay = () => {
    if (audioRef.current) { isPlaying ? audioRef.current.pause() : audioRef.current.play(); setIsPlaying(!isPlaying); }
  };
  const toggleDetailPlay = () => {
    if (detailAudioRef.current) { detailIsPlaying ? detailAudioRef.current.pause() : detailAudioRef.current.play(); setDetailIsPlaying(!detailIsPlaying); }
  };
  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) { audioRef.current.currentTime = time; setCurrentTime(time); }
  };
  const handleDetailSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (detailAudioRef.current) { detailAudioRef.current.currentTime = time; setDetailCurrentTime(time); }
  };
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    return `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`;
  };

  // LIBRARY VIEW
  if (view === 'library') {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 shadow-lg shadow-pink-50">
                <Mic size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Podcasts By Us</h1>
            </div>
            <button onClick={() => setView('create')} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
              <ArrowLeft size={16} /> Create New
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Library size={22} className="text-indigo-600" /> Your Library</h2>
          {loadingLibrary ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={32} /></div>
          ) : library.length === 0 ? (
            <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
              <Library size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-lg font-medium">No saved podcasts yet</p>
              <p className="text-sm">Generate a podcast and click Save</p>
            </div>
          ) : (
            <div className="space-y-3">
              {library.map(podcast => (
                <div key={podcast.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-indigo-200 transition-all cursor-pointer" onClick={() => handleOpenPodcast(podcast)}>
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <Volume2 size={18} className="text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{podcast.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {podcast.level !== '—' ? `Level ${podcast.level} · ` : ''}{podcast.host_count === 'two' ? 'Two hosts' : 'One host'} · {new Date(podcast.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDeletePodcast(podcast.id); }} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // DETAIL VIEW
  if (view === 'detail' && selectedPodcast) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 shadow-lg shadow-pink-50">
                <Mic size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold tracking-tight">Podcasts By Us</h1>
            </div>
            <button onClick={() => { setView('library'); setDetailAudioUrl(null); setDetailIsPlaying(false); }} className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
              <ArrowLeft size={16} /> Library
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 py-12 space-y-6">
          {detailAudioUrl && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <button onClick={toggleDetailPlay} className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0">
                {detailIsPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
              </button>
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-sm font-bold text-gray-900 truncate">{selectedPodcast.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-400 w-7 tabular-nums">{formatTime(detailCurrentTime)}</span>
                  <input type="range" min="0" max={detailDuration || 0} value={detailCurrentTime} onChange={handleDetailSeek} className="flex-1 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  <span className="text-[10px] text-gray-400 w-7 tabular-nums">{formatTime(detailDuration)}</span>
                </div>
              </div>
              <a href={detailAudioUrl} download={`Podcast-${selectedPodcast.title.replace(/\s+/g, '-')}.wav`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <Download size={18} />
              </a>
              <audio ref={detailAudioRef} src={detailAudioUrl} onEnded={() => setDetailIsPlaying(false)} onTimeUpdate={() => detailAudioRef.current && setDetailCurrentTime(detailAudioRef.current.currentTime)} onLoadedMetadata={() => detailAudioRef.current && setDetailDuration(detailAudioRef.current.duration)} className="hidden" />
            </div>
          )}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
            <div className="p-2 border-b border-gray-100 flex items-center bg-gray-50/50">
              <button onClick={() => setDetailActiveTab('transcript')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${detailActiveTab === 'transcript' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Transcript</button>
              {selectedPodcast.vocabulary && (
                <button onClick={() => setDetailActiveTab('vocabulary')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${detailActiveTab === 'vocabulary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Vocabulary Chart</button>
              )}
            </div>
            <div className="p-8 overflow-y-auto prose prose-indigo max-w-none">
              {detailActiveTab === 'transcript' ? (
                <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{selectedPodcast.transcript}</p>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-gray-900 font-bold mb-4">Vocabulary & Idioms</h4>
                  <div className="grid gap-3">
                    {(selectedPodcast.vocabulary || '').split('\n').filter(line => line.trim()).map((line, idx) => {
                      const [word, definition] = line.split('=');
                      return (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="font-bold text-indigo-600 block mb-1">{word?.trim()}</span>
                          <span className="text-sm text-gray-600">{definition?.trim()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // CREATE VIEW
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 shadow-lg shadow-pink-50">
              <Mic size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Podcasts By Us</h1>
          </div>
          <button onClick={() => setView('library')} className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all">
            <Library size={16} /> Library
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Mode toggle */}
        <div className="flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm mb-8 w-fit">
          <button
            onClick={() => { setMode('generate'); setTranscript(''); setAudioUrl(null); setAudioData(null); setSavedId(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'generate' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Volume2 size={15} /> Generate
          </button>
          <button
            onClick={() => { setMode('script'); setTranscript(''); setAudioUrl(null); setAudioData(null); setSavedId(null); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'script' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FileText size={15} /> My Script
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Left Column: Controls */}
          <div className="md:col-span-5 space-y-8">

            {mode === 'generate' ? (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  Configure Podcast
                </h2>

                <div className="space-y-4">
                  <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button onClick={() => setSourceType('subject')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sourceType === 'subject' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Subject</button>
                    <button onClick={() => setSourceType('article')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sourceType === 'article' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Article</button>
                  </div>

                  {sourceType === 'subject' ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-600">Subject</label>
                      <input type="text" placeholder="e.g. The history of jazz, Quantum computing..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <button onClick={() => setArticleSourceType('text')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${articleSourceType === 'text' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'}`}>Paste Text</button>
                        <button onClick={() => setArticleSourceType('url')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all ${articleSourceType === 'url' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600'}`}>Article URL</button>
                      </div>
                      {articleSourceType === 'text' ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Article 1 Text</label>
                            <textarea placeholder="Paste your first article content here..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] resize-none" value={articleText} onChange={(e) => setArticleText(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Article 2 Text (Optional)</label>
                            <textarea placeholder="Paste your second article content here..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[120px] resize-none" value={articleText2} onChange={(e) => setArticleText2(e.target.value)} />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Article 1 URL</label>
                            <input type="url" placeholder="https://example.com/article-1" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={articleUrl} onChange={(e) => setArticleUrl(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-600">Article 2 URL (Optional)</label>
                            <input type="url" placeholder="https://example.com/article-2" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={articleUrl2} onChange={(e) => setArticleUrl2(e.target.value)} />
                          </div>
                          <p className="text-[10px] text-gray-400 italic px-1">Tip: Use direct links instead of shortened "share" links for better results.</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Include specific words (optional)</label>
                    <input type="text" placeholder="e.g. innovation, synergy, paradigm shift..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" value={specificWords} onChange={(e) => setSpecificWords(e.target.value)} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Gauge size={14} /> Speech Speed</label>
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{speechSpeed}%</span>
                    </div>
                    <input type="range" min="80" max="100" step="5" value={speechSpeed} onChange={(e) => setSpeechSpeed(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium px-1">
                      <span>80%</span><span>85%</span><span>90%</span><span>95%</span><span>100%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Users size={14} /> Narrators</label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      <button onClick={() => setHostCount('one')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hostCount === 'one' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>One Host</button>
                      <button onClick={() => setHostCount('two')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${hostCount === 'two' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Two Hosts</button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Clock size={14} /> Length</label>
                      <span className="text-sm font-bold text-indigo-600">{length} min</span>
                    </div>
                    <input type="range" min="1" max="6" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" value={length} onChange={(e) => setLength(parseInt(e.target.value))} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><BarChart size={14} /> English Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LEVELS.map((l) => (
                        <button key={l.id} onClick={() => setLevel(l.id)} className={`py-2 rounded-lg text-sm font-medium transition-all ${level === l.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{l.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (sourceType === 'subject' ? !subject.trim() : (articleSourceType === 'text' ? !articleText.trim() : !articleUrl.trim()))}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100"
                >
                  {isGenerating ? (<><Loader2 className="animate-spin" size={20} />Generating...</>) : (<><Volume2 size={20} />Generate Podcast</>)}
                </button>
              </section>
            ) : (
              <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  My Script
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. My roleplay conversation..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Users size={14} /> Speakers</label>
                    <div className="flex bg-gray-100 rounded-xl p-1">
                      <button onClick={() => setScriptHostCount('one')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scriptHostCount === 'one' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>One Speaker</button>
                      <button onClick={() => setScriptHostCount('two')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${scriptHostCount === 'two' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Two Speakers</button>
                    </div>
                    {scriptHostCount === 'two' && (
                      <p className="text-[10px] text-gray-400 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
                        Format each line with the speaker name:<br />
                        <span className="font-mono text-indigo-500">Alex: Hello, how are you?</span><br />
                        <span className="font-mono text-indigo-500">Sam: I'm doing great, thanks!</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Paste your script</label>
                    <textarea
                      placeholder={scriptHostCount === 'two'
                        ? "Alex: Welcome to the show!\nSam: Thanks for having me.\nAlex: Today we're talking about..."
                        : "Paste your transcript here..."}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[200px] resize-none font-mono text-sm"
                      value={scriptText}
                      onChange={(e) => setScriptText(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-600 flex items-center gap-1"><Gauge size={14} /> Speech Speed</label>
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">{scriptSpeed}%</span>
                    </div>
                    <input type="range" min="80" max="100" step="5" value={scriptSpeed} onChange={(e) => setScriptSpeed(parseInt(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <div className="flex justify-between mt-1.5 text-[10px] text-gray-400 font-medium px-1">
                      <span>80%</span><span>85%</span><span>90%</span><span>95%</span><span>100%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleScriptGenerate}
                  disabled={isGenerating || !scriptTitle.trim() || !scriptText.trim()}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100"
                >
                  {isGenerating ? (<><Loader2 className="animate-spin" size={20} />Generating Audio...</>) : (<><Volume2 size={20} />Read My Script</>)}
                </button>
              </section>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="md:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {!transcript && !isGenerating ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400">
                  {mode === 'generate' ? (
                    <>
                      <Mic size={48} className="mb-4 text-pink-200" />
                      <p className="text-lg font-medium">Your podcast will appear here</p>
                      <p className="text-sm">Enter a subject and click generate to start</p>
                    </>
                  ) : (
                    <>
                      <FileText size={48} className="mb-4 text-indigo-200" />
                      <p className="text-lg font-medium">Audio will appear here</p>
                      <p className="text-sm">Paste your script and click Read My Script</p>
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  {audioUrl && (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <button onClick={togglePlay} className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 shrink-0">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                      </button>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate">{generatedTitle}</p>
                          {mode === 'generate' && <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">Level {LEVELS.find(l => l.id === level)?.label}</p>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 w-7 tabular-nums">{formatTime(currentTime)}</span>
                          <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="flex-1 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                          <span className="text-[10px] text-gray-400 w-7 tabular-nums">{formatTime(duration)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={handleSave} disabled={isSaving || !!savedId} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${savedId ? 'text-green-600 bg-green-50' : 'text-indigo-600 hover:bg-indigo-50'}`} title="Save to Library">
                          {isSaving ? <Loader2 className="animate-spin" size={16} /> : savedId ? <><Check size={16} />Saved</> : <><Save size={16} />Save</>}
                        </button>
                        <button onClick={handleShare} disabled={isSharing} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Share to WhatsApp">
                          {isSharing ? <Loader2 className="animate-spin" size={18} /> : (
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          )}
                        </button>
                        <a href={audioUrl} download={`Podcast-${generatedTitle.replace(/\s+/g, '-')}.wav`} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Download">
                          <Download size={18} />
                        </a>
                      </div>
                      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)} onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)} className="hidden" />
                    </div>
                  )}

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[600px]">
                    <div className="p-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <div className="flex gap-1">
                        <button onClick={() => setActiveTab('transcript')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'transcript' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Transcript</button>
                        {vocabularyChart && (
                          <button onClick={() => setActiveTab('vocabulary')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'vocabulary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Vocabulary Chart</button>
                        )}
                      </div>
                      <button onClick={activeTab === 'transcript' ? copyToClipboard : copyVocabToClipboard} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all">
                        {activeTab === 'transcript' ? (copied ? <Check size={14} /> : <Copy size={14} />) : (vocabCopied ? <Check size={14} /> : <Copy size={14} />)}
                        {activeTab === 'transcript' ? (copied ? 'Copied' : 'Copy Text') : (vocabCopied ? 'Copied' : 'Copy Chart')}
                      </button>
                    </div>
                    <div className="p-8 overflow-y-auto prose prose-indigo max-w-none">
                      {isGenerating && !transcript ? (
                        <div className="space-y-4 animate-pulse">
                          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-100 rounded w-full"></div>
                          <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                        </div>
                      ) : activeTab === 'transcript' ? (
                        <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{transcript}</p>
                      ) : (
                        <div className="space-y-4">
                          <h4 className="text-gray-900 font-bold mb-4">Vocabulary & Idioms</h4>
                          <div className="grid gap-3">
                            {vocabularyChart.split('\n').filter(line => line.trim()).map((line, idx) => {
                              const [word, definition] = line.split('=');
                              return (
                                <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                  <span className="font-bold text-indigo-600 block mb-1">{word?.trim()}</span>
                                  <span className="text-sm text-gray-600">{definition?.trim()}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
