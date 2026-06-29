import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  AudioLines,
  ChevronRight,
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
  Settings,
  Sparkles,
  UserRound,
  Wand2
} from 'lucide-react';
import './index.css';

const sideNav = ['Home', 'Generate', 'Explore', 'Library', 'Projects'];
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

function readPageFromHash() {
  if (typeof window === 'undefined') return defaultPage;
  const value = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  return sideNav.includes(value) ? value : defaultPage;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState(readPageFromHash);

  useEffect(() => {
    const syncFromHash = () => setActivePage(readPageFromHash());
    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  function navigate(page) {
    if (!sideNav.includes(page)) return;
    setActivePage(page);
    const nextHash = `#/${encodeURIComponent(page)}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState({ page }, '', nextHash);
    }
  }

  return (
    <div className="min-h-screen pb-24 text-mvnt-text">
      <Sidebar
        open={sidebarOpen}
        activePage={activePage}
        onNavigate={navigate}
        onToggle={() => setSidebarOpen((value) => !value)}
      />

      <main className={`mx-auto min-h-screen w-[min(1440px,calc(100vw-32px))] transition-[padding] duration-300 ${sidebarOpen ? 'lg:pl-[252px]' : 'lg:pl-[84px]'}`}>
        {activePage === 'Home' && <HomePage onNavigate={navigate} />}
        {activePage === 'Generate' && <GeneratePage />}
        {activePage === 'Explore' && <ExplorePage />}
        {activePage === 'Library' && <LibraryPage />}
        {activePage === 'Projects' && <ProjectsPage />}
      </main>

      <nav className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1.5 rounded-full border border-white/10 bg-neutral-950/85 p-2 shadow-2xl backdrop-blur-xl lg:hidden">
        {[[Compass, 'Explore'], [Wand2, 'Generate'], [Library, 'Library'], [UserRound, 'Profile']].map(([Icon, label]) => (
          <button type="button" key={label} onClick={() => label !== 'Profile' && navigate(label)} className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold sm:text-sm ${activePage === label ? 'bg-mvnt-text text-black' : 'text-mvnt-muted'}`}><Icon size={18} />{label}</button>
        ))}
      </nav>
    </div>
  );
}

function Sidebar({ open, activePage, onNavigate, onToggle }) {
  return (
    <aside className={`fixed bottom-[92px] left-4 top-4 z-20 flex flex-col gap-3 rounded-[28px] border border-white/10 bg-neutral-950/80 p-3 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${open ? 'w-[236px]' : 'w-[68px]'}`}>
      <div className="flex h-11 items-center gap-2">
        <button type="button" onClick={() => onNavigate('Generate')} className={`min-w-0 flex-1 rounded-full px-3 text-left text-xl font-black tracking-[-0.08em] transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>MVNT</button>
        <button type="button" onClick={onToggle} className="grid size-10 shrink-0 place-items-center rounded-full text-mvnt-muted hover:bg-white/10 hover:text-mvnt-text" aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}>
          {open ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className="grid gap-1">
        {sideNav.map((item) => (
          <button
            type="button"
            key={item}
            title={item}
            onClick={() => onNavigate(item)}
            className={`flex min-h-10 items-center rounded-full px-3 text-left text-sm font-bold ${open ? 'justify-start' : 'justify-center'} ${activePage === item ? 'bg-white/10 text-mvnt-text' : 'text-mvnt-muted hover:bg-white/10 hover:text-mvnt-text'}`}
          >
            {open ? item : item[0]}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className={`grid min-h-16 w-full items-center gap-2.5 rounded-full border border-white/10 bg-white/[.06] p-2.5 text-left ${open ? 'grid-cols-[42px_1fr]' : 'grid-cols-1 place-items-center'}`}>
              <span className="grid size-10 place-items-center rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow font-black text-black">J</span>
              {open && <span className="min-w-0"><strong className="block truncate text-sm">Jiwon Kim</strong><small className="block truncate text-xs text-mvnt-muted">jiwon@mvnt.studio</small></span>}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="top" align="start" sideOffset={8} className="z-50 w-[220px] rounded-2xl border border-white/10 bg-neutral-950 p-2 text-mvnt-text shadow-2xl">
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

function GeneratePage() {
  const [mode, setMode] = useState('Audio');
  const [status, setStatus] = useState('Generate');

  function generate(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    setStatus('Thinking');
    setTimeout(() => setStatus('Composing'), 500);
    setTimeout(() => setStatus('Ready'), 1200);
  }

  return (
    <section className="grid min-h-screen place-items-center py-10">
      <div className="w-[min(980px,100%)]">
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
            <input className="min-w-0 flex-1 bg-transparent text-base text-mvnt-text outline-none placeholder:text-mvnt-muted" placeholder="Upload music or paste a link" />
            <button type="button" onClick={generate} className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow px-5 font-black text-black md:col-auto">
              <Wand2 size={18} /> {status}
            </button>
          </div>
        </section>

        <section className="mt-10 flex flex-wrap justify-center gap-2">
          {['Super motion', 'Character', 'Canvas', 'Explore'].map((item, i) => {
            const Icon = [Sparkles, Image, Grid3X3, Compass][i];
            return <button type="button" key={item} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 text-sm font-bold text-mvnt-muted"><Icon size={17} /> {item}</button>;
          })}
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
        <h1 className="mt-2 text-[clamp(42px,7vw,92px)] font-black leading-none tracking-[-0.08em]">{title}</h1>
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
      <div className="mb-8 grid size-11 place-items-center rounded-2xl bg-white/10 text-mvnt-orange"><Icon size={20} /></div>
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
