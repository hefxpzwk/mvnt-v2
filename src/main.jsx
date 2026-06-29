import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  AudioLines,
  BadgeDollarSign,
  Clapperboard,
  Compass,
  FileAudio,
  Grid3X3,
  Image,
  Library,
  LogOut,
  Music2,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  UploadCloud,
  Settings,
  Sparkles,
  UserRound,
  Wand2
} from 'lucide-react';
import './index.css';

const sideNav = [
  { id: 'Generate', label: '댄스', sublabel: 'Create motion', icon: Wand2 }
];
const sideNavIds = sideNav.map((item) => item.id);
const modes = [
  { name: 'Audio', icon: FileAudio },
  { name: 'YouTube', icon: Clapperboard },
  { name: 'SoundCloud', icon: AudioLines }
];
const presets = [
  'BASEBALL GAME', 'STORM GIANT', '2000S PAPARAZZI', 'DRIFT RACING', 'KUNG FU HIT', 'BLUE DEPTH',
  'CGI BREAKDOWN', 'FINAL SERVE', 'ORBITAL PRESENCE', 'FOOTBALL INVADER', 'ANDROID ASSEMBLE', 'ZOMBIE DANCE'
];
const libraryItems = ['K-pop hook draft', 'Meme bounce pack', 'Ballad silhouette', 'Neon stage camera'];
const projects = ['MVNT launch reel', 'Creator shorts pack', 'Dancer test room'];
const defaultPage = 'Generate';

const audioExtensions = /\.(mp3|wav|m4a|aac|flac|ogg|opus|aiff?|wma)$/i;

function getMusicPayload(dataTransfer) {
  const itemFiles = Array.from(dataTransfer?.items || [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter(Boolean);
  const files = [...Array.from(dataTransfer?.files || []), ...itemFiles];
  const audioFile = files.find((file) => file.type.startsWith('audio/') || audioExtensions.test(file.name));
  if (audioFile) {
    return { type: 'file', label: audioFile.name, file: audioFile };
  }

  const uri = dataTransfer?.getData?.('text/uri-list')?.trim();
  if (uri) return { type: 'link', label: uri };

  const text = dataTransfer?.getData?.('text/plain')?.trim();
  if (text) return { type: 'link', label: text };

  return null;
}

function hasDroppableMusic(event) {
  const types = Array.from(event.dataTransfer?.types || []);
  return types.includes('Files') || types.includes('text/uri-list') || types.includes('text/plain');
}

function readPageFromHash() {
  if (typeof window === 'undefined') return defaultPage;
  const value = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  return sideNavIds.includes(value) ? value : defaultPage;
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

  function navigate(page) {
    if (!sideNavIds.includes(page)) return;
    setActivePage(page);
    const nextHash = `#/${encodeURIComponent(page)}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState({ page }, '', nextHash);
    }
  }

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
        {activePage === 'Generate' && <GeneratePage musicSource={musicSource} onMusicSourceChange={setMusicSource} />}
      </main>

      {draggingMusic && <DropOverlay />}
    </div>
  );
}

function Sidebar({ open, textVisible, targetOpen, activePage, onNavigate, onToggle }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-white/10 bg-[#080808]/95 px-4 py-3 text-mvnt-muted shadow-[18px_0_70px_rgba(0,0,0,.34)] overflow-hidden backdrop-blur-2xl transition-[width] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${open ? 'w-[216px]' : 'w-[72px]'}`}>
      <div className="grid h-11 grid-cols-[40px_1fr] items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="group/brand relative isolate grid size-10 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#ffbd5a] via-[#ffad3b] to-[#ff8a00] text-[27px] font-black italic leading-none tracking-[-0.06em] text-neutral-950 shadow-[0_10px_24px_rgba(255,138,0,.28)] transition-transform duration-200 hover:scale-[1.02]"
          aria-label={targetOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={targetOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span>m</span>
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
            <button
              type="button"
              key={id}
              title={label}
              onClick={() => onNavigate(id)}
              className={`group/nav grid min-h-10 w-full grid-cols-[40px_1fr] items-center gap-2 rounded-lg px-0 text-left transition-colors duration-200 ${selected ? 'text-mvnt-text' : 'text-white/46 hover:bg-white/[.045] hover:text-mvnt-text'}`}
            >
              <Icon className="justify-self-center" size={21} strokeWidth={selected ? 2.75 : 2.35} />
              <span className={`min-w-0 truncate text-[14px] font-bold tracking-normal transition-opacity duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'} ${selected ? 'text-mvnt-text' : 'text-white/62 group-hover/nav:text-mvnt-text'}`} aria-hidden={!textVisible}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="-mx-4 mt-3 border-t border-white/10 bg-black/20">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="group/user grid min-h-[68px] w-full grid-cols-[40px_1fr_auto] items-center gap-2 px-4 py-2.5 text-left text-mvnt-text transition-colors hover:bg-white/[.07]">
              <span className="grid size-9 place-items-center justify-self-center rounded-xl bg-gradient-to-r from-mvnt-orange to-mvnt-yellow font-black text-sm text-black">J</span>
              <span className={`min-w-0 overflow-hidden transition-opacity duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'}`} aria-hidden={!textVisible}><strong className="block truncate text-[13px] font-black">Jiwon Kim</strong><small className="block truncate text-[11px] font-bold text-mvnt-muted">jiwon@mvnt.studio</small></span>
              <Settings size={15} className={`transition-[opacity] duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'} text-white/28 group-hover/user:text-white/60`} aria-hidden={!textVisible} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="right" align="end" sideOffset={10} className="z-50 w-[220px] rounded-2xl border border-white/10 bg-neutral-950 p-2 text-mvnt-text shadow-2xl">
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
        <div className="mb-6 grid size-20 place-items-center rounded-[28px] bg-gradient-to-br from-mvnt-orange to-mvnt-yellow text-black">
          <UploadCloud size={38} strokeWidth={2.5} />
        </div>
        <strong className="text-[clamp(34px,6vw,68px)] font-black leading-[1.02] tracking-[-0.02em]">Drop your music</strong>
        <span className="mt-4 max-w-md text-sm font-bold text-mvnt-muted sm:text-base">오디오 파일이나 음악 링크를 놓으면 바로 댄스 생성 입력에 들어갑니다.</span>
      </div>
    </div>
  );
}

function GeneratePage({ musicSource, onMusicSourceChange }) {
  const [mode, setMode] = useState('Audio');
  const [status, setStatus] = useState('Generate');
  const [headlineProgress, setHeadlineProgress] = useState(0);
  const [headlineHovering, setHeadlineHovering] = useState(false);
  const musicValue = musicSource?.label || '';

  function generate(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setStatus('Thinking');
    setTimeout(() => setStatus('Composing'), 500);
    setTimeout(() => setStatus('Ready'), 1200);
  }

  function updateHeadlineGradient(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const progress = ((event.clientX - rect.left) / rect.width) * 100;
    setHeadlineProgress(Math.max(0, Math.min(100, progress)));
  }

  return (
    <section className="grid min-h-screen place-items-center py-10">
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
              setHeadlineProgress(0);
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
              onChange={(event) => onMusicSourceChange(event.target.value ? { type: 'link', label: event.target.value } : null)}
            />
            <button type="button" onClick={generate} className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow px-5 font-black text-black md:col-auto">
              <Wand2 size={18} /> {status}
            </button>
          </div>
          {musicSource && (
            <p className="px-3 pt-2 text-[11px] font-bold text-mvnt-muted">
              {musicSource.type === 'file' ? 'Audio file ready' : 'Music link ready'} · {musicSource.label}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

function HomePage({ onNavigate }) {
  return (
    <PageShell eyebrow="Home" title="MVNT Studio" desc="Start with Generate, then explore presets and saved drafts.">
      <div className="grid gap-3 md:grid-cols-3">
        {['Generate a dance', 'Explore presets', 'Open projects'].map((title, index) => (
          <button type="button" key={title} onClick={() => onNavigate(['Generate', 'Explore', 'Projects'][index])} className="rounded-[24px] border border-white/10 bg-white/[.04] p-6 text-left hover:bg-white/[.07]">
            <strong className="block text-xl">{title}</strong>
            <span className="mt-2 block text-sm text-mvnt-muted">{index === 0 ? 'Upload music or paste a link.' : index === 1 ? 'Browse MVNT viral presets.' : 'Continue saved dummy work.'}</span>
          </button>
        ))}
      </div>
    </PageShell>
  );
}

function ExplorePage() {
  return (
    <PageShell eyebrow="Explore" title="MVNT Viral Presets" desc="Visual preset discovery for dance generation.">
      <PresetGrid />
    </PageShell>
  );
}

function LibraryPage() {
  return (
    <PageShell eyebrow="Library" title="Saved motions" desc="Dummy saved outputs and reusable motion assets.">
      <div className="grid gap-3 md:grid-cols-2">
        {libraryItems.map((item) => <ListCard key={item} icon={Music2} title={item} meta="Private · Demo asset" />)}
      </div>
    </PageShell>
  );
}

function ProjectsPage() {
  return (
    <PageShell eyebrow="Projects" title="Creator projects" desc="Project shells for future auth, storage, and backend render queues.">
      <div className="grid gap-3 md:grid-cols-3">
        {projects.map((item) => <ListCard key={item} icon={Library} title={item} meta="Updated just now" />)}
      </div>
    </PageShell>
  );
}

function PageShell({ eyebrow, title, desc, children }) {
  return (
    <section className="min-h-screen py-12 lg:py-16">
      <div className="mb-8">
        <span className="text-sm font-extrabold text-mvnt-orange">{eyebrow}</span>
        <h1 className="mt-2 text-[clamp(42px,7vw,92px)] font-black leading-[1.02] tracking-[-0.025em]">{title}</h1>
        <p className="mt-4 max-w-2xl text-mvnt-muted">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function PresetGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
      {presets.map((preset, index) => <PresetCard key={preset} title={preset} index={index} />)}
    </div>
  );
}

function ListCard({ icon: Icon, title, meta }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[.04] p-5">
      <div className="mb-8 grid size-9 place-items-center rounded-2xl bg-white/10 text-mvnt-orange"><Icon size={20} /></div>
      <strong className="block text-xl">{title}</strong>
      <span className="mt-2 block text-sm text-mvnt-muted">{meta}</span>
    </article>
  );
}

function DropdownItem({ icon: Icon, children }) {
  return <DropdownMenu.Item className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm text-mvnt-muted outline-none hover:bg-white/10 hover:text-mvnt-text"><Icon size={17} /> {children}</DropdownMenu.Item>;
}

function PresetCard({ title, index }) {
  return (
    <article className="min-w-0">
      <div className="preset-thumb" style={{ '--i': index }}><span>{title}</span></div>
      <strong className="mt-2 block truncate text-sm text-white/80">{title}</strong>
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
