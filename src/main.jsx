import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  AudioLines,
  Clapperboard,
  FileAudio,
  Flame,
  Heart,
  Search,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  UploadCloud,
  UserRound,
  Wand2
} from 'lucide-react';
import './index.css';

const sideNav = [{ id: 'Generate', label: '댄스', icon: Wand2 }];
const sideNavIds = sideNav.map((item) => item.id);
const modes = [
  { name: 'YouTube', icon: Clapperboard },
  { name: 'SoundCloud', icon: AudioLines },
  { name: 'Audio', icon: FileAudio }
];
const defaultPage = 'Generate';

const communityVideos = [
  { title: 'Kelis - Milkshake', creator: 'CorrespondingHarlequin', likes: 36, src: '/community/milkshake.mp4', tone: 'from-[#e5de1f]/40' },
  { title: 'BLACKPINK - ‘GO’', creator: '공룡킹', likes: 33, src: '/community/blackpink-go.mp4', tone: 'from-white/30' },
  { title: 'Omega Sapien - Krapow', creator: 'Joon', likes: 17, src: '/community/krapow.mp4', tone: 'from-mvnt-orange/35' },
  { title: 'Golden', creator: 'Q', likes: 17, src: '/community/golden.mp4', tone: 'from-mvnt-yellow/35' },
  { title: 'Life is Reason', creator: 'bboyxai', likes: 14, src: '/community/hail-mary.mp4', tone: 'from-sky-300/25' },
  { title: 'Life is Reason', creator: 'kaistseiok', likes: 14, src: '/community/hail-mary-2.mp4', tone: 'from-violet-300/25' },
  { title: 'Neon Pop Routine', creator: 'motionlab', likes: 29, src: '/community/blackpink-go.mp4', tone: 'from-mvnt-orange/35' },
  { title: 'Studio Groove 01', creator: 'mvnt picks', likes: 25, src: '/community/milkshake.mp4', tone: 'from-mvnt-yellow/35' },
  { title: 'Arcade Shuffle', creator: 'pixelcrew', likes: 23, src: '/community/krapow.mp4', tone: 'from-violet-300/25' },
  { title: 'Soft Light Choreo', creator: 'momo', likes: 21, src: '/community/hail-mary.mp4', tone: 'from-sky-300/25' },
  { title: 'Creator Loop Pack', creator: 'loophaus', likes: 19, src: '/community/golden.mp4', tone: 'from-white/30' },
  { title: 'Night Stage Cut', creator: 'nightbus', likes: 18, src: '/community/hail-mary-2.mp4', tone: 'from-[#e5de1f]/40' },
  { title: 'Street Pop Draft', creator: 'do edit lab', likes: 16, src: '/community/krapow.mp4', tone: 'from-mvnt-orange/35' },
  { title: 'Festival Jump', creator: 'studio momo', likes: 15, src: '/community/blackpink-go.mp4', tone: 'from-mvnt-yellow/35' },
  { title: 'Chrome Dancer', creator: 'chromeclub', likes: 13, src: '/community/milkshake.mp4', tone: 'from-sky-300/25' },
  { title: 'Ballad Silhouette', creator: 'slowmotion', likes: 12, src: '/community/hail-mary.mp4', tone: 'from-violet-300/25' },
  { title: 'Meme Dance Take', creator: 'memehaus', likes: 11, src: '/community/golden.mp4', tone: 'from-white/30' },
  { title: 'K-pop Hook Test', creator: 'hookstudio', likes: 10, src: '/community/hail-mary-2.mp4', tone: 'from-[#e5de1f]/40' }
];

const communityTags = ['All', 'Trending', 'K-pop', 'Street', 'Loop', 'Ballad'];

const audioExtensions = /\.(mp3|wav|m4a|aac|flac|ogg|opus|aiff?|wma)$/i;

function readPageFromHash() {
  if (typeof window === 'undefined') return defaultPage;
  const value = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  return sideNavIds.includes(value) ? value : defaultPage;
}

function getMusicPayload(dataTransfer) {
  const itemFiles = Array.from(dataTransfer?.items || [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter(Boolean);
  const files = [...Array.from(dataTransfer?.files || []), ...itemFiles];
  const audioFile = files.find((file) => file.type.startsWith('audio/') || audioExtensions.test(file.name));
  if (audioFile) return { type: 'file', label: audioFile.name, file: audioFile };
  const uri = dataTransfer?.getData?.('text/uri-list')?.trim();
  if (uri) return { type: 'link', label: uri };
  const text = dataTransfer?.getData?.('text/plain')?.trim();
  if (text) return { type: 'link', label: text };
  return null;
}

function inferModeFromSource(value, fallback = 'YouTube') {
  const text = typeof value === 'string' ? value : value?.label || value?.name || '';
  const lower = text.toLowerCase();
  if (/youtu\.be|youtube\.com/.test(lower)) return 'YouTube';
  if (/soundcloud\.com/.test(lower)) return 'SoundCloud';
  if (value?.type === 'file' || audioExtensions.test(lower) || lower.startsWith('blob:')) return 'Audio';
  return fallback;
}

function hasDroppableMusic(event) {
  const types = Array.from(event.dataTransfer?.types || []);
  return types.includes('Files') || types.includes('text/uri-list') || types.includes('text/plain');
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarTextVisible, setSidebarTextVisible] = useState(true);
  const [activePage, setActivePage] = useState(readPageFromHash);
  const [musicSource, setMusicSource] = useState(null);
  const [draggingMusic, setDraggingMusic] = useState(false);

  useEffect(() => {
    const syncFromHash = () => setActivePage(readPageFromHash());
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  useEffect(() => {
    if (sidebarOpen) {
      setSidebarExpanded(true);
      const showText = window.setTimeout(() => setSidebarTextVisible(true), 150);
      return () => window.clearTimeout(showText);
    }
    setSidebarTextVisible(false);
    const collapseRail = window.setTimeout(() => setSidebarExpanded(false), 130);
    return () => window.clearTimeout(collapseRail);
  }, [sidebarOpen]);

  function navigate(page) {
    if (!sideNavIds.includes(page)) return;
    setActivePage(page);
    const nextHash = `#/${encodeURIComponent(page)}`;
    if (window.location.hash !== nextHash) window.history.pushState({ page }, '', nextHash);
  }

  useEffect(() => {
    let dragDepth = 0;
    const acceptMusic = (payload) => {
      if (!payload) return false;
      setMusicSource(payload);
      navigate('Generate');
      return true;
    };
    const handlePaste = (event) => {
      const payload = getMusicPayload(event.clipboardData);
      if (!payload) return;
      event.preventDefault();
      acceptMusic(payload);
    };
    const handleDragEnter = (event) => {
      if (!hasDroppableMusic(event)) return;
      event.preventDefault();
      dragDepth += 1;
      setDraggingMusic(true);
    };
    const handleDragOver = (event) => {
      if (!hasDroppableMusic(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      setDraggingMusic(true);
    };
    const handleDragLeave = (event) => {
      if (!hasDroppableMusic(event)) return;
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) setDraggingMusic(false);
    };
    const handleDrop = (event) => {
      if (!hasDroppableMusic(event)) return;
      event.preventDefault();
      dragDepth = 0;
      setDraggingMusic(false);
      acceptMusic(getMusicPayload(event.dataTransfer));
    };
    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div className="h-screen overflow-hidden text-mvnt-text">
      <Sidebar
        open={sidebarExpanded}
        textVisible={sidebarTextVisible}
        targetOpen={sidebarOpen}
        activePage={activePage}
        onNavigate={navigate}
        onToggle={() => setSidebarOpen((value) => !value)}
      />
      <main className={`mx-auto h-screen w-[min(1440px,calc(100vw-32px))] overflow-y-auto overscroll-contain transition-[padding] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${sidebarExpanded ? 'pl-[236px]' : 'pl-[88px]'}`}>
        <GeneratePage musicSource={musicSource} onMusicSourceChange={setMusicSource} />
      </main>
      {draggingMusic && <DropOverlay />}
    </div>
  );
}

function Sidebar({ open, textVisible, targetOpen, activePage, onNavigate, onToggle }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-white/10 bg-[#080808]/95 px-4 py-3 text-mvnt-muted shadow-[18px_0_70px_rgba(0,0,0,.34)] overflow-hidden backdrop-blur-2xl transition-[width] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${open ? 'w-[216px]' : 'w-[72px]'}`}>
      <div className="grid h-11 grid-cols-[40px_1fr] items-center gap-2">
        <button type="button" onClick={onToggle} className="group/brand relative isolate grid size-10 shrink-0 place-items-center overflow-hidden rounded-[14px] text-neutral-950 transition-transform duration-200 hover:scale-[1.02]" aria-label={targetOpen ? 'Collapse sidebar' : 'Expand sidebar'} title={targetOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          <img src="/favicon.svg" alt="MVNT" className="size-8 object-contain" />
          <span className="pointer-events-none absolute -inset-px z-10 grid place-items-center rounded-[15px] bg-neutral-950 text-mvnt-text opacity-0 ring-1 ring-white/10 transition-opacity duration-200 group-hover/brand:opacity-100">
            {targetOpen ? <PanelLeftClose size={18} strokeWidth={2.35} /> : <PanelLeftOpen size={19} strokeWidth={2.35} />}
          </span>
        </button>
        <span className={`min-w-0 flex-1 overflow-hidden transition-opacity duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'}`} aria-hidden={!textVisible}>
          <strong className="block truncate text-[17px] font-black leading-[0.95] tracking-[-0.03em] text-mvnt-text">mvnt</strong>
          <small className="mt-1 block truncate text-[8px] font-black uppercase tracking-[0.12em] text-mvnt-muted">studio</small>
        </span>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-0.5" aria-label="Primary">
        {sideNav.map(({ id, label, icon: Icon }) => {
          const selected = activePage === id;
          return (
            <button type="button" key={id} title={label} onClick={() => onNavigate(id)} className={`group/nav grid min-h-10 w-full grid-cols-[40px_1fr] items-center gap-2 rounded-lg px-0 text-left transition-colors duration-200 ${selected ? 'text-mvnt-text' : 'text-white/46 hover:bg-white/[.045] hover:text-mvnt-text'}`}>
              <Icon className="justify-self-center" size={21} strokeWidth={selected ? 2.75 : 2.35} />
              <span className={`min-w-0 truncate text-[14px] font-bold tracking-normal transition-opacity duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'} ${selected ? 'text-mvnt-text' : 'text-white/62 group-hover/nav:text-mvnt-text'}`} aria-hidden={!textVisible}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="-mx-4 mt-3 border-t border-white/10 bg-black/20">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="group/user grid min-h-[68px] w-full grid-cols-[40px_1fr_auto] items-center gap-2 px-4 py-2.5 text-left text-mvnt-text outline-none transition-colors hover:bg-white/[.07] focus:outline-none focus-visible:bg-white/[.07]">
              <span className="grid size-9 place-items-center justify-self-center rounded-xl bg-gradient-to-r from-mvnt-orange to-mvnt-yellow font-black text-sm text-black">J</span>
              <span className={`min-w-0 overflow-hidden transition-opacity duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'}`} aria-hidden={!textVisible}><strong className="block truncate text-[13px] font-black">Jiwon Kim</strong><small className="block truncate text-[11px] font-bold text-mvnt-muted">jiwon@mvnt.studio</small></span>
              <Settings size={15} className={`transition-opacity duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'} text-white/28 group-hover/user:text-white/60`} aria-hidden={!textVisible} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="top" align="center" sideOffset={10} className="z-50 w-[184px] rounded-xl border border-white/10 bg-neutral-950 p-1.5 text-mvnt-text shadow-2xl">
              <DropdownItem icon={UserRound}>Profile</DropdownItem>
              <DropdownItem icon={Settings}>Settings</DropdownItem>
              <DropdownItem icon={LogOut}>Log out</DropdownItem>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </aside>
  );
}

function DropOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-black/72 p-6 backdrop-blur-xl">
      <div className="grid w-[min(640px,calc(100vw-48px))] place-items-center rounded-[36px] border-2 border-dashed border-mvnt-orange/80 bg-neutral-950/90 px-8 py-14 text-center shadow-[0_0_90px_rgba(255,138,0,.32)]">
        <div className="mb-6 grid size-20 place-items-center rounded-[28px] bg-gradient-to-br from-mvnt-orange to-mvnt-yellow text-black"><UploadCloud size={38} strokeWidth={2.5} /></div>
        <strong className="text-[clamp(34px,6vw,68px)] font-black leading-[1.02] tracking-[-0.02em]">Drop your music</strong>
        <span className="mt-4 max-w-md text-sm font-bold text-mvnt-muted sm:text-base">오디오 파일이나 음악 링크를 놓으면 바로 댄스 생성 입력에 들어갑니다.</span>
      </div>
    </div>
  );
}

function GeneratePage({ musicSource, onMusicSourceChange }) {
  const [mode, setMode] = useState('YouTube');
  const [status, setStatus] = useState('Generate');
  const [headlineProgress, setHeadlineProgress] = useState(100);
  const [headlineHovering, setHeadlineHovering] = useState(false);
  const headlineReturnFrameRef = useRef(null);
  const musicValue = musicSource?.label || '';

  useEffect(() => {
    if (musicSource) setMode(inferModeFromSource(musicSource, mode));
  }, [musicSource]);

  useEffect(() => () => {
    if (headlineReturnFrameRef.current) cancelAnimationFrame(headlineReturnFrameRef.current);
  }, []);

  function generate(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setStatus('Thinking');
    setTimeout(() => setStatus('Composing'), 500);
    setTimeout(() => setStatus('Ready'), 1200);
  }

  function updateHeadlineGradient(event) {
    if (headlineReturnFrameRef.current) cancelAnimationFrame(headlineReturnFrameRef.current);
    const rect = event.currentTarget.getBoundingClientRect();
    const progress = ((event.clientX - rect.left) / rect.width) * 100;
    setHeadlineProgress(Math.max(0, Math.min(100, progress)));
  }

  function returnHeadlineGradient() {
    if (headlineReturnFrameRef.current) cancelAnimationFrame(headlineReturnFrameRef.current);
    const start = headlineProgress;
    const duration = 520;
    const startedAt = performance.now();
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);

    const tick = (now) => {
      const elapsed = Math.min(1, (now - startedAt) / duration);
      const eased = easeOutCubic(elapsed);
      setHeadlineProgress(start + (100 - start) * eased);
      if (elapsed < 1) {
        headlineReturnFrameRef.current = requestAnimationFrame(tick);
      } else {
        headlineReturnFrameRef.current = null;
      }
    };

    headlineReturnFrameRef.current = requestAnimationFrame(tick);
  }

  return (
    <section className="min-h-screen py-10">
      <div className="flex min-h-[calc(100vh-80px)] -translate-y-8 items-center justify-center">
        <div className="w-[min(980px,100%)]">
          <div className="mb-8 text-center">
          <h1
            className={`hero-gradient-text text-[clamp(42px,6.5vw,84px)] font-black leading-[1.02] tracking-[-0.025em] ${headlineHovering ? 'is-hovering' : ''}`}
            data-text="Music in, dance out."
            style={{ '--hero-gradient-stop': `${headlineProgress}%` }}
            onMouseEnter={(event) => {
              setHeadlineHovering(true);
              updateHeadlineGradient(event);
            }}
            onMouseMove={updateHeadlineGradient}
            onMouseLeave={() => {
              setHeadlineHovering(false);
              returnHeadlineGradient();
            }}
          >
            Music in, dance out.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-relaxed text-mvnt-muted sm:text-lg">음악 파일을 드롭하거나 링크를 붙여넣으면, 바로 움직임 초안으로 변환할 준비를 시작합니다.</p>
        </div>

          <section className="stable-composer rounded-[30px] border border-white/10 bg-neutral-950 p-2.5">
            <div className="flex gap-1.5 overflow-auto pb-2">
              {modes.map(({ name, icon: Icon }) => (
                <button type="button" key={name} onClick={() => setMode(name)} className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm font-bold ${mode === name ? 'border-mvnt-text bg-mvnt-text text-black' : 'border-white/10 bg-white/[.04] text-mvnt-muted'}`}>
                  <Icon size={16} /> {name}
                </button>
              ))}
            </div>
            <div className="grid min-h-16 grid-cols-[auto_1fr] items-center gap-3 rounded-[22px] border border-white/10 bg-black px-4 py-2 md:flex">
              <Plus size={20} className="text-mvnt-muted" />
              <input
                className="min-w-0 flex-1 bg-transparent text-base text-mvnt-text outline-none placeholder:text-mvnt-muted"
                placeholder="Drop music, paste a link, or upload audio"
                value={musicValue}
                onChange={(event) => {
                  const value = event.target.value;
                  onMusicSourceChange(value ? { type: 'link', label: value } : null);
                  if (value) setMode(inferModeFromSource(value, mode));
                }}
              />
              <button type="button" onClick={generate} className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow px-5 font-black text-black md:col-auto"><Wand2 size={18} /> {status}</button>
            </div>
          </section>
        </div>
      </div>
      <CommunityExamples />
    </section>
  );
}

function CommunityExamples() {
  const [activeTag, setActiveTag] = useState('All');
  const [query, setQuery] = useState('');

  return (
    <section className="mx-auto -mt-32 w-[min(1180px,100%)] pb-20" aria-label="Community example videos">
      <div className="mb-5">
        <h2 className="inline-flex items-center gap-3 text-[clamp(28px,3.6vw,48px)] font-black leading-none tracking-[-0.045em] text-white"><Flame className="text-mvnt-orange" size={34} fill="currentColor" /> Trend</h2>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex min-h-11 w-full items-center gap-2 border-b border-white/15 text-mvnt-muted lg:w-[320px] lg:shrink-0">
            <Search size={17} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-mvnt-muted"
              placeholder="Search videos"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="flex gap-2 overflow-auto pb-1 lg:pb-0" aria-label="Community video tags">
            {communityTags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`shrink-0 min-h-11 rounded-full border px-4 py-0 text-sm font-black transition-colors ${activeTag === tag ? 'border-white bg-white text-black' : 'border-white/12 bg-white/[.035] text-mvnt-muted hover:border-white/28 hover:text-white'}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {communityVideos.map((video, index) => (
          <article key={`${video.src}-${index}`} className="group relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 shadow-[0_24px_70px_rgba(0,0,0,.35)]">
            <div className={`pointer-events-none absolute inset-0 z-10 bg-gradient-to-t ${video.tone} via-transparent to-black/10 opacity-70 transition-opacity duration-300 group-hover:opacity-95`} />
            <video className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.035]" src={video.src} autoPlay muted loop playsInline preload={index < 3 ? 'auto' : 'metadata'} />
            <div className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/78 to-transparent p-4 pb-12">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mvnt-orange to-mvnt-yellow text-xs font-black text-black ring-2 ring-white/20">{video.creator.slice(0, 1).toUpperCase()}</span>
                  <span className="min-w-0 truncate text-sm font-black text-white drop-shadow">{video.creator}</span>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/82 to-transparent p-4 pt-20">
                <div className="flex items-end justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-white/90 via-mvnt-yellow to-mvnt-orange text-black shadow-[0_10px_28px_rgba(0,0,0,.45)]">
                      <span className="text-lg font-black leading-none">♪</span>
                    </span>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-black uppercase tracking-[0.14em] text-white/54">Song</span>
                      <h3 className="truncate text-base font-black tracking-[-0.03em] text-white">{video.title}</h3>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/12 px-2.5 py-1.5 text-xs font-black text-white/90 backdrop-blur-md"><Heart size={12} fill="currentColor" /> {video.likes}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DropdownItem({ icon: Icon, children }) {
  return <DropdownMenu.Item className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs font-bold text-mvnt-muted outline-none hover:bg-white/10 hover:text-mvnt-text"><Icon size={15} /> {children}</DropdownMenu.Item>;
}

createRoot(document.getElementById('root')).render(<App />);
