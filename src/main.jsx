import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  ArrowDown,
  ArrowUp,
  AudioLines,
  Clapperboard,
  FolderKanban,
  House,
  Compass,
  FileAudio,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Footprints,
  Languages,
  ExternalLink,
  Heart,
  HelpCircle,
  Image,
  Link,
  Pencil,
  Music2,
  MessageCircle,
  Search,
  Send,
  Share2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Pause,
  Play,
  Plus,
  Settings,
  Type,
  UploadCloud,
  Volume2,
  VolumeX,
  UserRound,
  Video,
  X,
  Wand2,
  Zap,
  Check,
  Crown,
  Sparkles
} from 'lucide-react';
import './index.css';
import { AutoPlayVideo } from './components/AutoPlayVideo.jsx';
import { buildPageUrl, defaultPage, readPageFromLocation, routeIds, sideNavItems } from './lib/navigation.js';
import { communityTags, communityVideos, filterCommunityVideos, getCommunityVideoTags, getVisibleCommunityTags } from './lib/community.js';
import { projectFilters, projectWorks } from './lib/projects.js';
import { describeSource, estimateTokenUse, fetchSourceMetadata, getMusicPayload, hasDroppableMusic, inferModeFromSource } from './lib/source.js';


const browserChromeTheme = '#050505';

function setBrowserChromeTheme(color = browserChromeTheme) {
  if (typeof document === 'undefined') return;

  const upsertMeta = (selector, attributes) => {
    let element = document.head.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      document.head.appendChild(element);
    }
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  };

  upsertMeta('meta[name="theme-color"]:not([media])', { name: 'theme-color', content: color });
  upsertMeta('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]', { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: color });
  upsertMeta('meta[name="theme-color"][media="(prefers-color-scheme: light)"]', { name: 'theme-color', media: '(prefers-color-scheme: light)', content: color });
  upsertMeta('meta[name="color-scheme"]', { name: 'color-scheme', content: 'dark' });
  upsertMeta('meta[name="apple-mobile-web-app-status-bar-style"]', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' });
  upsertMeta('meta[name="msapplication-navbutton-color"]', { name: 'msapplication-navbutton-color', content: color });

  document.documentElement.style.backgroundColor = color;
  document.documentElement.style.colorScheme = 'dark';
  document.body.style.backgroundColor = color;
}

const sideNavIconMap = { House, FolderKanban, Search, Compass, Footprints };
const sideNav = sideNavItems.map((item) => ({ ...item, icon: sideNavIconMap[item.icon] }));
const sourceIconMap = { AudioLines, Clapperboard, FileText, Image, Link, Music2, Video };
const modes = [
  { name: 'YouTube', icon: Clapperboard },
  { name: 'SoundCloud', icon: AudioLines },
  { name: 'Audio', icon: FileAudio }
];
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [sidebarTextVisible, setSidebarTextVisible] = useState(true);
  const [activePage, setActivePage] = useState(() => readPageFromLocation(typeof window === 'undefined' ? null : window.location));
  const [musicSource, setMusicSource] = useState(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [draggingMusic, setDraggingMusic] = useState(false);
  const mainRef = useRef(null);

  useEffect(() => {
    setBrowserChromeTheme();
  }, []);

  useEffect(() => {
    const syncFromHash = () => setActivePage(readPageFromLocation(window.location));
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
    if (!routeIds.includes(page)) return;
    const nextUrl = buildPageUrl(page);
    if (!nextUrl) return;
    setActivePage(page);
    if (`${window.location.pathname}${window.location.hash}` !== nextUrl) window.history.pushState({ page }, '', nextUrl);
  }

  function searchEverywhere(rawQuery) {
    const nextQuery = rawQuery.trim();
    setGlobalSearchQuery(nextQuery);
    navigate('Search');
  }

  function createDanceFromQuery(rawQuery) {
    const nextQuery = rawQuery.trim();
    if (nextQuery) setMusicSource({ type: 'link', label: nextQuery });
    navigate('Home');
  }

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [activePage]);

  useEffect(() => {
    let dragDepth = 0;
    const acceptMusic = (payload) => {
      if (!payload) return false;
      setMusicSource(payload);
      navigate('Home');
      return true;
    };
    const isHomePage = () => (
      activePage === 'Home' &&
      readPageFromLocation(typeof window === 'undefined' ? null : window.location) === 'Home'
    );
    const handlePaste = (event) => {
      if (!isHomePage()) return;
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
  }, [activePage]);

  if (activePage === 'Credits') {
    return <SubscriptionPage onClose={() => navigate(defaultPage)} />;
  }

  const isExplorePage = activePage === 'Explore';

  return (
    <div className="relative isolate h-screen overflow-hidden text-mvnt-text">
      <div className="app-background-gradient" aria-hidden="true" />
      <Sidebar
        open={sidebarExpanded}
        textVisible={sidebarTextVisible}
        targetOpen={sidebarOpen}
        activePage={activePage}
        onNavigate={navigate}
        onToggle={() => setSidebarOpen((value) => !value)}
      />
      <main ref={mainRef} className={`relative z-10 ${isExplorePage ? 'w-full' : 'mx-auto w-[min(1440px,calc(100vw-32px))]'} h-screen overflow-y-auto overscroll-contain transition-[padding] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${sidebarExpanded ? 'pl-[236px]' : 'pl-[88px]'}`}>
        <TopHeader
          activePage={activePage}
          sidebarExpanded={sidebarExpanded}
          onNavigate={navigate}
          onSearchSubmit={searchEverywhere}
          onCreateFromQuery={createDanceFromQuery}
        />
        <div className="relative isolate z-0">
          {activePage === 'Projects' ? (
            <ProjectsPage />
          ) : activePage === 'Search' ? (
            <SearchPage initialQuery={globalSearchQuery} onCreateFromQuery={createDanceFromQuery} sidebarExpanded={sidebarExpanded} />
          ) : activePage === 'Explore' ? (
            <ExplorePage />
          ) : activePage === 'Dance' ? (
            <DancePage />
          ) : (
            <HomePage musicSource={musicSource} onMusicSourceChange={setMusicSource} sidebarExpanded={sidebarExpanded} />
          )}
        </div>
      </main>
      {draggingMusic && <DropOverlay />}
    </div>
  );
}


function TopHeader({ activePage, sidebarExpanded, onNavigate, onSearchSubmit, onCreateFromQuery }) {
  const [headerQuery, setHeaderQuery] = useState('');
  function submitSearch(event) {
    event.preventDefault();
    onSearchSubmit(headerQuery);
  }


  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 border-b border-white/[.075] bg-[#070707]/28 shadow-[0_18px_60px_rgba(0,0,0,.16)] backdrop-blur-2xl supports-[backdrop-filter]:bg-[#070707]/22">
      <form onSubmit={submitSearch} className={`pointer-events-none absolute inset-y-0 right-[300px] hidden items-center justify-center transition-[left] duration-300 ease-[cubic-bezier(.22,1,.36,1)] md:flex lg:right-[330px] ${sidebarExpanded ? 'left-[236px]' : 'left-[88px]'}`} role="search" aria-label="전역 검색">
        <div className={`pointer-events-auto group flex h-10 w-[min(420px,100%)] items-center overflow-hidden rounded-full border bg-black/24 text-mvnt-muted shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_14px_42px_rgba(0,0,0,.22)] backdrop-blur-2xl transition focus-within:border-mvnt-orange/55 focus-within:bg-black/34 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_16px_52px_rgba(255,138,0,.14)] ${activePage === 'Search' ? 'border-mvnt-orange/35' : 'border-white/14'}`}>
            <button type="submit" className="ml-3 grid size-6 shrink-0 place-items-center rounded-full text-white/62 transition hover:bg-white/[.12] hover:text-white group-focus-within:text-white/86" aria-label="검색">
              <Search size={17} strokeWidth={2.65} />
            </button>
            <input
              className="min-w-0 flex-1 bg-transparent px-3 text-[15px] font-bold text-white outline-none placeholder:text-white/48"
              placeholder="검색"
              value={headerQuery}
              onChange={(event) => setHeaderQuery(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setHeaderQuery('')}
              className={`mr-3 grid size-6 shrink-0 place-items-center rounded-full text-white/45 transition hover:bg-white/[.12] hover:text-white ${headerQuery ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
              aria-label="검색어 지우기"
              tabIndex={headerQuery ? 0 : -1}
            >
              <X size={15} strokeWidth={2.7} />
            </button>
        </div>
      </form>

      <div className={`pointer-events-auto relative z-10 flex h-12 w-full items-center justify-end gap-4 py-0 pr-5 transition-[padding] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${sidebarExpanded ? 'pl-[236px]' : 'pl-[88px]'}`}>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={() => onNavigate('Credits')} className="hidden min-h-9 items-center rounded-full px-3 text-[11px] font-black transition hover:bg-white/[.04] sm:inline-flex">
            <span className="bg-gradient-to-r from-mvnt-orange via-pink-500 to-violet-500 bg-clip-text text-transparent">
              <span className="mr-1.5 text-[15px] leading-none">◇</span>구독
            </span>
          </button>
          <button type="button" className="hidden min-h-9 items-center rounded-full px-3 text-[11px] font-black text-mvnt-muted transition hover:bg-white/[.04] hover:text-mvnt-text md:inline-flex">API 플랫폼</button>
          <button type="button" className="group/tutorial relative grid size-7 place-items-center rounded-full text-mvnt-muted transition hover:bg-white/[.06] hover:text-mvnt-text" aria-label="Tutorial">
            <HelpCircle size={18} strokeWidth={2.5} />
            <span className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-neutral-950 px-2.5 py-1 text-xs font-black text-mvnt-text opacity-0 shadow-2xl transition-opacity group-hover/tutorial:opacity-100">
              튜토리얼
            </span>
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="grid size-7 place-items-center rounded-full text-mvnt-muted outline-none transition hover:bg-white/[.06] hover:text-mvnt-text focus-visible:bg-white/[.06]" aria-label="Change language" title="언어 변경">
                <Languages size={18} strokeWidth={2.5} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="bottom" align="end" sideOffset={8} className="z-50 w-[156px] rounded-xl border border-white/10 bg-neutral-950 p-1.5 text-mvnt-text shadow-2xl">
                <DropdownMenu.Item className="flex min-h-9 cursor-pointer items-center justify-between rounded-lg px-2.5 text-xs font-black outline-none hover:bg-white/10">
                  한국어 <span className="text-mvnt-orange">✓</span>
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex min-h-9 cursor-pointer items-center rounded-lg px-2.5 text-[11px] font-bold text-mvnt-muted outline-none hover:bg-white/10 hover:text-mvnt-text">
                  English
                </DropdownMenu.Item>
                <DropdownMenu.Item className="flex min-h-9 cursor-pointer items-center rounded-lg px-2.5 text-[11px] font-bold text-mvnt-muted outline-none hover:bg-white/10 hover:text-mvnt-text">
                  日本語
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="grid size-7 place-items-center rounded-full outline-none transition hover:bg-white/[.06] focus-visible:bg-white/[.06]" aria-label="Profile">
                <span className="grid size-7 place-items-center rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow text-xs font-black text-black ring-1 ring-white/15">J</span>
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="bottom" align="end" sideOffset={8} className="z-50 w-[200px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 p-0 text-mvnt-text shadow-2xl">
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow text-xs font-black text-black">J</span>
                  <span className="min-w-0">
                    <strong className="block truncate text-[10px] font-black">Jiwon Kim</strong>
                    <small className="mt-0.5 block truncate text-[10px] font-bold text-mvnt-muted">jiwon@mvnt.studio</small>
                  </span>
                </div>
                <div className="p-1.5">
                  <DropdownItem icon={UserRound}>Profile</DropdownItem>
                  <DropdownItem icon={Settings}>Settings</DropdownItem>
                  <DropdownItem icon={LogOut}>Log out</DropdownItem>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ open, textVisible, targetOpen, activePage, onNavigate, onToggle }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#080808]/95 px-4 pb-3 pt-0 text-mvnt-muted shadow-[18px_0_70px_rgba(0,0,0,.34)] overflow-hidden backdrop-blur-2xl transition-[width] duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${open ? 'w-[216px]' : 'w-[72px]'}`}>
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <linearGradient id="sidebar-active-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8a00" />
          <stop offset="52%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </svg>
      <div className="grid h-12 grid-cols-[40px_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (targetOpen) onNavigate('Home');
            else onToggle();
          }}
          className="group/brand relative isolate grid size-10 shrink-0 place-items-center overflow-hidden rounded-[12px] transition-transform duration-200 hover:scale-[1.02]"
          aria-label={targetOpen ? '홈으로 이동' : '사이드바 열기'}
          title={targetOpen ? '홈으로 이동' : '사이드바 열기'}
        >
          <img src="/favicon.svg" alt="MVNT" className="size-8 object-contain" />
          {!targetOpen && (
            <span className="pointer-events-none absolute -inset-px z-10 grid place-items-center rounded-[15px] bg-neutral-950 text-mvnt-text opacity-0 ring-1 ring-white/10 transition-opacity duration-200 group-hover/brand:opacity-100">
              <PanelLeftOpen size={19} strokeWidth={2.35} />
            </span>
          )}
        </button>
        <span className={`min-w-0 flex-1 overflow-hidden transition-opacity duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'}`} aria-hidden={!textVisible}>
          <strong className="block truncate text-[17px] font-black leading-[0.95] tracking-[-0.03em] text-mvnt-text">mvnt</strong>
          <small className="mt-1 block truncate text-[8px] font-black uppercase tracking-[0.12em] text-mvnt-muted">studio</small>
        </span>
        <button
          type="button"
          onClick={onToggle}
          className={`grid size-8 place-items-center rounded-lg text-mvnt-muted transition hover:bg-white/[.06] hover:text-mvnt-text ${textVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={17} strokeWidth={2.35} />
        </button>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-0.5" aria-label="Primary">
        {sideNav.map(({ id, label, icon: Icon }) => {
          const selected = activePage === id;
          return (
            <button type="button" key={id} title={label} onClick={() => onNavigate(id)} className={`group/nav grid min-h-10 w-full grid-cols-[40px_1fr] items-center gap-2 rounded-lg px-0 text-left transition-colors duration-200 ${selected ? 'text-mvnt-text' : 'text-white/46 hover:bg-white/[.045] hover:text-mvnt-text'}`}>
              <Icon className="justify-self-center" size={18} strokeWidth={2.35} color={selected ? 'url(#sidebar-active-gradient)' : 'currentColor'} />
              <span className={`min-w-0 truncate text-[14px] tracking-normal transition-opacity duration-150 ${textVisible ? 'opacity-100' : 'opacity-0'} ${selected ? 'font-bold text-mvnt-text' : 'font-normal text-white/50 group-hover/nav:text-mvnt-text'}`} aria-hidden={!textVisible}>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="-mx-4 mt-3 border-t border-white/10 bg-black/20">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button type="button" className="group/user flex min-h-[54px] w-full items-center gap-2 px-4 py-2.5 text-left text-mvnt-text outline-none transition-colors hover:bg-white/[.07] focus-visible:bg-white/[.07]" aria-label="Open profile menu">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl">
                <span className="grid size-6 place-items-center rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow font-black text-xs text-black">J</span>
              </span>
              {textVisible && (
                <>
                  <span className="min-w-0 flex-1 overflow-hidden transition-opacity duration-150"><strong className="block truncate text-[10px] font-black">Jiwon Kim</strong><small className="block truncate text-[10px] font-bold text-mvnt-muted">jiwon@mvnt.studio</small></span>
                  <Settings size={14} className="text-white/28 transition-colors duration-150 group-hover/user:text-white/60" />
                </>
              )}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="top" align="start" alignOffset={16} sideOffset={10} className="z-50 w-[184px] rounded-xl border border-white/10 bg-neutral-950 p-1.5 text-mvnt-text shadow-2xl">
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
        <div className="mb-6 grid size-20 place-items-center rounded-[18px] bg-gradient-to-br from-mvnt-orange to-mvnt-yellow text-black"><UploadCloud size={38} strokeWidth={2.5} /></div>
        <strong className="text-[clamp(34px,6vw,68px)] font-black leading-[1.02] tracking-[-0.02em]">Drop your music</strong>
        <span className="mt-4 max-w-md text-sm font-bold text-mvnt-muted sm:text-base">음악 링크나 파일을 놓으면 바로 임베드/프리뷰 카드로 표시됩니다.</span>
      </div>
    </div>
  );
}

function HomePage({ musicSource, onMusicSourceChange, sidebarExpanded }) {
  const [mode, setMode] = useState('YouTube');
  const [status, setStatus] = useState('Generate');
  const [headlineProgress, setHeadlineProgress] = useState(100);
  const [headlineHovering, setHeadlineHovering] = useState(false);
  const headlineReturnFrameRef = useRef(null);
  const statusTimersRef = useRef([]);
  const fileInputRef = useRef(null);
  const [sourceMetadata, setSourceMetadata] = useState(null);
  const musicValue = musicSource?.label || '';
  const sourceDescription = musicSource ? describeSource(musicSource) : null;
  const sourcePreview = sourceDescription ? { ...sourceDescription, Icon: sourceIconMap[sourceDescription.icon] || Link } : null;
  const tokenUse = estimateTokenUse(musicSource, mode);

  useEffect(() => {
    if (musicSource) setMode((currentMode) => inferModeFromSource(musicSource, currentMode));
  }, [musicSource]);

  useEffect(() => {
    let cancelled = false;
    setSourceMetadata(null);
    if (!sourceDescription) return undefined;

    fetchSourceMetadata(sourceDescription).then((metadata) => {
      if (!cancelled) setSourceMetadata(metadata);
    });

    return () => {
      cancelled = true;
    };
  }, [sourceDescription?.kind, sourceDescription?.url, sourceDescription?.title]);

  function clearStatusTimers() {
    statusTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    statusTimersRef.current = [];
  }

  useEffect(() => () => {
    if (headlineReturnFrameRef.current) cancelAnimationFrame(headlineReturnFrameRef.current);
    clearStatusTimers();
  }, []);

  function generate(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    clearStatusTimers();
    setStatus('Thinking');
    statusTimersRef.current = [
      window.setTimeout(() => setStatus('Composing'), 500),
      window.setTimeout(() => setStatus('Ready'), 1200)
    ];
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

          <section className="stable-composer overflow-hidden rounded-[18px] border border-white/10 bg-neutral-950">
            <div className="flex gap-1 overflow-hidden border-b border-white/10 bg-[#111]/92 px-3 pt-2">
              {modes.map(({ name, icon: Icon }) => {
                const selected = mode === name;
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setMode(name)}
                    className={`relative inline-flex min-h-12 shrink-0 select-none items-center gap-2 rounded-t-[20px] px-5 text-xs font-black transition-colors ${selected ? 'bg-black text-mvnt-text shadow-[0_-10px_34px_rgba(255,138,0,.12)] after:absolute after:left-1/2 after:-bottom-[7px] after:size-3 after:-translate-x-1/2 after:rotate-45 after:border-b after:border-r after:border-white/10 after:bg-black' : 'text-mvnt-muted/70 hover:bg-white/[.035] hover:text-mvnt-text'}`}
                    aria-current={selected ? 'true' : undefined}
                  >
                    <Icon size={14} strokeWidth={selected ? 2.8 : 2.35} />
                    {name}
                  </button>
                );
              })}
            </div>
            <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 bg-black px-4 py-2">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  onMusicSourceChange({ type: 'file', label: file.name, file });
                  setMode(inferModeFromSource({ type: 'file', label: file.name, file }, mode));
                  event.target.value = '';
                }}
              />

              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[.035] text-mvnt-muted transition hover:border-mvnt-orange/60 hover:text-mvnt-text"
                  aria-label="Upload file"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus size={20} />
                </button>
                {sourcePreview ? (
                  <AttachmentPreview
                    description={sourcePreview}
                    metadata={sourceMetadata}
                    onClear={() => onMusicSourceChange(null)}
                  />
                ) : (
                  <input
                    className="min-w-0 flex-1 bg-transparent text-base font-bold text-mvnt-text outline-none placeholder:text-mvnt-muted"
                    placeholder="Drop music, paste a link, or upload any file"
                    value={musicValue}
                    onChange={(event) => {
                      const value = event.target.value;
                      onMusicSourceChange(value ? { type: 'link', label: value } : null);
                      if (value) setMode(inferModeFromSource(value, mode));
                    }}
                  />
                )}
              </div>

              <button type="button" onClick={generate} className="justify-self-end inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mvnt-orange via-pink-500 to-violet-600 px-3 text-[11px] font-black text-white shadow-[0_12px_32px_rgba(255,138,0,.18)]">
                <span>{status}</span>
                <span className="h-3.5 w-px bg-white/26" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5 text-white/86" title="Estimated tokens used">
                  <Zap size={13} className="fill-white stroke-white" strokeWidth={0} />
                  <span>{tokenUse}</span>
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
      <CommunityExamples sidebarExpanded={sidebarExpanded} />
    </section>
  );
}



const subscriptionPlans = [
  {
    name: 'Free',
    Icon: Zap,
    annualPrice: '$0',
    monthlyPrice: '$0',
    period: '',
    description: '댄서와 TikTok 크리에이터가 레퍼런스를 탐색하기 위한 무료 플랜',
    annualHighlight: 'Dance 150s/month',
    monthlyHighlight: 'Dance 150s/month',
    action: '현재 플랜',
    current: true,
    features: ['Dance generation only', 'Browse community gallery', 'No Kling/Tripo usage']
  },
  {
    name: 'Basic',
    Icon: Sparkles,
    annualPrice: '$9.6',
    monthlyPrice: '$12',
    period: 'USD /월',
    description: '매주 AI UGC를 제작하는 크리에이터를 위한 추천 플랜',
    annualHighlight: '18,000 credits/year · Dance 150s/month',
    monthlyHighlight: '1,500 credits/month · Dance 150s/month',
    action: 'Basic으로 전환하기',
    recommended: true,
    promo: '20% OFF',
    features: ['Dance + Edit (Inpainting)', 'Kling/Tripo access', 'API access (basic rate limits)', 'Add-on credits']
  },
  {
    name: 'Creator',
    Icon: Crown,
    annualPrice: '$23.2',
    monthlyPrice: '$29',
    period: 'USD /월',
    description: 'Blender/Unreal 작업용 3D 프로덕션 에셋을 만드는 팀과 크리에이터용',
    annualHighlight: '60,000 credits/year · Dance 150s/month',
    monthlyHighlight: '5,000 credits/month · Dance 150s/month',
    action: 'Creator로 전환하기',
    promo: '20% OFF',
    features: ['FBX export for Blender/Unreal workflows', 'Early access to experimental models', 'Kling/Tripo access', 'Higher API limits + Add-ons']
  }
];


const creditsFaqItems = [
  {
    question: 'When are credits granted?',
    answer: 'Every plan gets 150 seconds of free motion generation each month. Basic, Creator, and Studio grant paid credits on your billing date. Earned credits are tracked separately.'
  },
  {
    question: 'What is the difference between credits and earned credits?',
    answer: 'For Motion, the monthly free quota is used before any credits. Only overage uses reward points first, then monthly included credits, and add-on credits last.'
  },
  {
    question: 'Do unused balances roll over?',
    answer: 'Monthly free motion seconds reset each month and do not roll over. Subscription credits reset on your billing date. Add-on credits and reward points do not expire.'
  },
  {
    question: 'Do add-ons unlock 3D Motion-gen or 2D Video-gen on Free?',
    answer: 'No. Free users can buy add-ons, but those add-ons stay Motion-only. Basic or higher is still required for Tripo and Kling.'
  },
  {
    question: 'Is the upgrade applied immediately?',
    answer: 'Yes. Upgrades apply immediately. Downgrades or cancellations take effect at the end of the current billing period.'
  },
  {
    question: 'What happens if payment fails?',
    answer: 'Access to paid features may be limited until the payment method is updated. Check your billing details in your account settings.'
  },
  {
    question: 'What are the Free plan limitations?',
    answer: 'Free includes 150 seconds of Motion per month, a 10-item library limit, and 1 concurrent job.'
  },
  {
    question: 'What happens to my balance during generation?',
    answer: 'Dance Editing places a temporary hold on your paid wallet when you submit. On success the hold is confirmed; on failure it is released and your balance is restored. Motion, Tripo, and Kling show their cost before you generate.'
  }
];

function SubscriptionPage({ onClose }) {
  const [billingPeriod, setBillingPeriod] = useState('annual');
  const isAnnual = billingPeriod === 'annual';

  return (
    <main className="subscription-page h-screen overflow-y-auto text-mvnt-text">
      <button
        type="button"
        onClick={onClose}
        className="fixed right-6 top-6 z-20 grid size-11 place-items-center rounded-[12px] bg-neutral-950/70 text-mvnt-muted shadow-[0_16px_44px_rgba(0,0,0,.32)] backdrop-blur-2xl transition hover:bg-white/[.06] hover:text-mvnt-text"
        aria-label="요금제 페이지 닫기"
      >
        <X size={24} strokeWidth={2.1} />
      </button>

      <section className="relative mx-auto flex min-h-screen w-[min(980px,calc(100vw-40px))] flex-col items-center justify-center px-4 py-20">
        <div className="mb-7 text-center">
          <h1 className="text-[clamp(21px,2.25vw,29px)] font-black tracking-[-0.055em] text-mvnt-text">플랜을 선택하세요</h1>
        </div>

        <div className="mb-8 grid h-[40px] w-[min(340px,100%)] grid-cols-2 rounded-full border border-white/10 bg-white/[.055] p-1 shadow-[0_18px_60px_rgba(0,0,0,.25)] backdrop-blur-xl" role="tablist" aria-label="Billing period">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={`rounded-full text-xs font-black transition ${!isAnnual ? 'bg-gradient-to-r from-mvnt-orange via-pink-500 to-violet-600 text-white shadow-[0_12px_34px_rgba(255,138,0,.22)]' : 'text-mvnt-muted hover:text-mvnt-text'}`}
            aria-selected={!isAnnual}
            role="tab"
          >
            월간
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('annual')}
            className={`rounded-full text-xs font-black transition ${isAnnual ? 'bg-gradient-to-r from-mvnt-orange via-pink-500 to-violet-600 text-white shadow-[0_12px_34px_rgba(255,138,0,.22)]' : 'text-mvnt-muted hover:text-mvnt-text'}`}
            aria-selected={isAnnual}
            role="tab"
          >
            연간 <span className="ml-1 text-[10px] opacity-80">20% 할인</span>
          </button>
        </div>

        <div className="grid w-full gap-5 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} billingPeriod={billingPeriod} />
          ))}
        </div>

        <CreditsFaq />
      </section>
    </main>
  );
}

function CreditsFaq() {
  return (
    <section className="mt-24 w-full" aria-label="FAQ">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-black tracking-[-0.04em] text-mvnt-text">FAQ</h2>
          <p className="mt-1 text-[11px] font-bold text-mvnt-muted">공식 Credits 페이지 기준 안내입니다.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {creditsFaqItems.map((item, index) => (
          <details key={item.question} className="group rounded-2xl border border-white/10 bg-white/[.035] px-5 py-4 open:bg-white/[.055]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-black leading-snug text-white/86 marker:hidden">
              <span>{item.question}</span>
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white/[.06] text-mvnt-muted transition group-open:rotate-45 group-open:text-mvnt-orange">
                <Plus size={14} strokeWidth={2.6} />
              </span>
            </summary>
            <p className="mt-3 border-t border-white/10 pt-3 text-[12px] font-semibold leading-relaxed text-mvnt-muted">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function PlanCard({ plan, billingPeriod }) {
  const isAnnual = billingPeriod === 'annual';
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const highlight = isAnnual ? plan.annualHighlight : plan.monthlyHighlight;
  const promo = isAnnual ? plan.promo : '';
  const tier = plan.name.toLowerCase();
  const isBasic = tier === 'basic';
  const isCreator = tier === 'creator';
  const cardClass = isCreator
    ? 'border-mvnt-orange/45 bg-[linear-gradient(180deg,rgba(24,18,14,.96),rgba(10,10,10,.92))] shadow-[0_28px_90px_rgba(255,138,0,.15)] ring-1 ring-mvnt-orange/18'
    : isBasic
      ? 'border-white/14 bg-neutral-950/88 shadow-[0_22px_70px_rgba(0,0,0,.34)] ring-1 ring-white/[.03]'
      : 'border-white/[.08] bg-neutral-950/70 shadow-[0_18px_50px_rgba(0,0,0,.24)]';
  const checkClass = isCreator
    ? 'bg-mvnt-orange text-black'
    : isBasic
      ? 'bg-mvnt-orange/14 text-mvnt-orange'
      : 'bg-white/[.055] text-white/45';
  const actionClass = plan.current
    ? 'cursor-default border-white/10 bg-white/[.025] text-mvnt-muted'
    : isCreator
      ? 'border-transparent bg-gradient-to-r from-mvnt-orange via-pink-500 to-violet-600 text-white shadow-[0_14px_34px_rgba(255,138,0,.18)] hover:brightness-110'
      : 'border-white/12 bg-white/[.035] text-mvnt-text hover:border-mvnt-orange/60 hover:bg-white/[.07]';

  return (
    <article className={`relative flex min-h-[410px] flex-col overflow-hidden rounded-[22px] border px-4 py-4 backdrop-blur-xl transition ${cardClass}`}>
      {isBasic && <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-mvnt-orange/50 to-transparent" />}
      {isCreator && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mvnt-orange via-pink-500 to-violet-600" />
          <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-mvnt-orange/12 blur-3xl" />
        </>
      )}
      {plan.recommended && (
        <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[9px] font-black ${isCreator ? 'bg-white text-black' : 'bg-mvnt-orange/14 text-mvnt-yellow ring-1 ring-mvnt-orange/24'}`}>추천</span>
      )}

      <div className="relative pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[23px] font-black leading-none tracking-[-0.04em] text-mvnt-text">{plan.name}</h2>
          {promo && <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${isCreator ? 'bg-white/10 text-white ring-1 ring-white/12' : 'bg-mvnt-orange/10 text-mvnt-yellow ring-1 ring-mvnt-orange/24'}`}>{promo}</span>}
        </div>
        <p className="mt-2 text-[11px] font-bold leading-snug text-mvnt-muted">{plan.description}</p>
      </div>

      <div className="relative mt-6">
        <div className="flex items-end gap-2">
          <span className="self-start pt-2 text-lg font-semibold text-white/38">$</span>
          <span className={`text-[48px] font-black leading-none tracking-[-0.06em] ${isCreator ? 'bg-gradient-to-r from-white via-mvnt-yellow to-mvnt-orange bg-clip-text text-transparent' : 'text-white'}`}>{price.replace('$', '')}</span>
          {plan.period && <span className="pb-1.5 text-[11px] font-bold text-mvnt-muted">{plan.period}</span>}
        </div>
        <p className={`mt-4 rounded-xl px-3 py-2.5 text-[10px] font-black ${isCreator ? 'bg-white/[.07] text-white/82 ring-1 ring-white/10' : isBasic ? 'bg-mvnt-orange/[.055] text-white/74 ring-1 ring-mvnt-orange/12' : 'bg-white/[.025] text-white/54 ring-1 ring-white/[.06]'}`}>{highlight}</p>
      </div>

      <ul className="relative mt-6 flex flex-1 flex-col gap-2">
        {plan.features.map((feature) => (
          <li key={feature} className={`grid grid-cols-[18px_1fr] items-start gap-2 text-[12px] font-bold leading-snug ${isCreator ? 'text-white/82' : isBasic ? 'text-white/72' : 'text-white/52'}`}>
            <span className={`mt-0.5 grid size-4 place-items-center rounded-full ${checkClass}`}><Check size={11} strokeWidth={3} /></span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled={plan.current}
        className={`relative mt-6 min-h-[34px] rounded-full border px-4 text-xs font-black transition ${actionClass}`}
      >
        {plan.action}
      </button>
    </article>
  );
}

function AttachmentPreview({ description, metadata, onClear }) {
  const { Icon } = description;
  const title = metadata?.title || description.title;
  const name = metadata?.name || description.eyebrow;
  const image = metadata?.image;
  const clickable = Boolean(description.url);
  const Wrapper = clickable ? 'a' : 'article';
  const wrapperProps = clickable
    ? { href: description.url, target: '_blank', rel: 'noreferrer' }
    : {};

  return (
    <Wrapper {...wrapperProps} className="flex min-w-0 max-w-[520px] shrink items-center gap-3 rounded-xl border border-white/10 bg-white/[.055] px-3 py-2 text-left no-underline shadow-[0_8px_22px_rgba(0,0,0,.22)] transition hover:border-white/18 hover:bg-white/[.075]">
      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-mvnt-orange to-mvnt-yellow text-black">
        {image ? (
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          <Icon size={21} strokeWidth={2.7} />
        )}
      </span>

      <div className="min-w-0 max-w-[410px]">
        <h3 className="truncate text-xs font-black tracking-[-0.02em] text-mvnt-text">
          {title}
        </h3>
        <p className="mt-0.5 truncate text-[11px] font-bold text-mvnt-muted">
          {name}
        </p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClear();
        }}
        className="grid size-6 shrink-0 place-items-center rounded-md text-mvnt-muted transition hover:bg-white/10 hover:text-mvnt-text"
        aria-label="Clear attachment"
      >
        <X size={14} />
      </button>
    </Wrapper>
  );
}





function CommunityVideoCard({ video, index, onClick }) {
  const Component = onClick ? 'button' : 'article';
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group relative isolate overflow-hidden border border-white/10 bg-neutral-950 p-0 text-left shadow-[0_24px_70px_rgba(0,0,0,.35)] ${onClick ? 'outline-none transition hover:-translate-y-1 hover:border-mvnt-orange/55 focus-visible:border-mvnt-orange focus-visible:ring-2 focus-visible:ring-mvnt-orange/45' : ''}`}
      aria-label={onClick ? `${video.title} 상세 보기` : undefined}
    >
      <div className={`pointer-events-none absolute inset-0 z-10 bg-gradient-to-t ${video.tone} via-transparent to-black/10 opacity-70 transition-opacity duration-300 group-hover:opacity-95`} />
      <AutoPlayVideo className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.035]" src={video.src} preload={index < 3 ? 'auto' : 'metadata'} eager={index < 2} />
      <div className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/78 to-transparent p-4 pb-12">
          <div className="flex items-center gap-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mvnt-orange to-mvnt-yellow text-xs font-black text-black ring-2 ring-white/20">{video.creator.slice(0, 1).toUpperCase()}</span>
            <span className="min-w-0 truncate text-xs font-black text-white drop-shadow">{video.creator}</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/82 to-transparent p-4 pt-20">
          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-white/90 via-mvnt-yellow to-mvnt-orange text-black shadow-[0_10px_28px_rgba(0,0,0,.45)]">
                <span className="text-lg font-black leading-none">♪</span>
              </span>
              <div className="min-w-0">
                <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/54">Song</span>
                <h3 className="truncate text-base font-black tracking-[-0.03em] text-white">{video.title}</h3>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/12 px-2 py-1 text-xs font-black text-white/90 backdrop-blur-md"><Heart size={12} fill="currentColor" /> {video.likes}</span>
          </div>
        </div>
      </div>
    </Component>
  );
}

function ReelVideo({ reel, index }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(index === 0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px 0px', threshold: 0.5 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !paused) {
      video.play().catch(() => {});
      return;
    }
    video.pause();
  }, [inView, paused, reel.src]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setPaused(false);
      video.play().catch(() => {});
    } else {
      video.pause();
      setPaused(true);
    }
  }

  return (
    <button ref={containerRef} type="button" onClick={togglePlayback} className="relative size-full cursor-pointer border-0 bg-transparent p-0 text-left" aria-label={paused ? 'Play video' : 'Pause video'}>
      <video ref={videoRef} className="size-full object-cover" src={inView ? reel.src : undefined} autoPlay={inView && !paused} muted loop playsInline preload={index < 2 ? 'auto' : 'metadata'} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/12 to-black/24" />
      {paused && (
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/58 text-white backdrop-blur-md ring-1 ring-white/12">
          <Play size={30} fill="currentColor" />
        </span>
      )}
    </button>
  );
}

function MusicIdentityOverlay({ reel, index, expanded, onExpandedChange }) {
  const hue = (index * 42 + 128) % 360;

  return (
    <aside
      className="music-identity-overlay group/music absolute left-[calc(50%+188px)] top-24 z-20 hidden h-24 w-[246px] text-white md:block"
      style={{ '--music-hue': hue }}
      aria-label={`${reel.title} sound source`}
      onMouseEnter={() => onExpandedChange(true)}
      onMouseLeave={() => onExpandedChange(false)}
      onFocus={() => onExpandedChange(true)}
      onBlur={() => onExpandedChange(false)}
    >
      <div className={`music-source-art absolute right-0 top-0 grid size-24 shrink-0 place-items-center overflow-hidden rounded-[18px] text-white shadow-[0_18px_44px_rgba(0,0,0,.42)] ring-1 ring-white/15 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${expanded ? '-translate-x-[130px] scale-[1.035]' : 'translate-x-0 scale-100'}`}>
        <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 text-[10px] font-black leading-none">
          <span className="grid h-4 w-6 place-items-center rounded-[4px] bg-white text-[hsl(var(--music-hue)_80%_34%)]"><Play size={8} fill="currentColor" strokeWidth={3} /></span>
          <span>YouTube</span>
        </div>
        <span className="absolute left-4 top-9 z-10 text-[13px] font-semibold text-white/82">Audio Library</span>
        <div className="music-speaker-beat absolute bottom-4 left-4 z-10 flex h-9 items-end gap-1.5" aria-hidden="true">
          <span className="h-5 w-2 rounded-full bg-white" />
          <span className="h-9 w-2 rounded-full bg-white" />
          <span className="h-6 w-2 rounded-full bg-white" />
          <span className="h-8 w-2 rounded-full bg-white" />
        </div>
        <span className="music-source-note relative z-20 grid size-7 place-items-center rounded-full bg-white/16 text-xl font-black text-white backdrop-blur-sm">♪</span>
      </div>
      <strong className={`music-hover-title pointer-events-none absolute left-[108px] top-1/2 w-[min(390px,calc(50vw-222px))] -translate-y-1/2 truncate text-left text-[clamp(30px,3.4vw,52px)] font-black leading-none tracking-[-0.075em] text-white drop-shadow-[0_5px_18px_rgba(0,0,0,.82)] transition duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${expanded ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'}`}>
        {reel.title}
      </strong>
    </aside>
  );
}


function ProjectsPage() {
  const [activeProjectFilter, setActiveProjectFilter] = useState('전체');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [visibilityByTitle, setVisibilityByTitle] = useState({});
  const worksWithVisibility = projectWorks.map((work) => ({ ...work, visibility: visibilityByTitle[work.workTitle] || work.visibility }));
  const visibleWorks = activeProjectFilter === '전체' ? worksWithVisibility : worksWithVisibility.filter((work) => work.kind === activeProjectFilter);
  const totalPages = Math.max(1, Math.ceil(visibleWorks.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageWorks = visibleWorks.slice(pageStart, pageStart + rowsPerPage);
  const rangeStart = visibleWorks.length ? pageStart + 1 : 0;
  const rangeEnd = Math.min(pageStart + rowsPerPage, visibleWorks.length);

  function selectFilter(filter) {
    setActiveProjectFilter(filter);
    setPage(1);
  }

  function changeRowsPerPage(event) {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  }

  function updateVisibility(workTitle, visibility) {
    setVisibilityByTitle((value) => ({
      ...value,
      [workTitle]: visibility
    }));
  }

  return (
    <section className="min-h-screen px-2 pb-20 pt-20">
      <div className="mx-auto w-[min(1220px,100%)]">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-[clamp(30px,4vw,46px)] font-black leading-none tracking-[-0.055em] text-white">프로젝트</h1>
          </div>
          <button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-3 text-[11px] font-black text-black transition hover:scale-[1.02]">
            <Wand2 size={16} /> 만들기
          </button>
        </div>

        <div>
          <div className="px-0 pt-3">
            <div className="flex gap-7 text-xs font-black">
              {projectFilters.map((filter) => {
                const selected = activeProjectFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => selectFilter(filter)}
                    className={`relative min-h-11 transition ${selected ? 'text-white' : 'text-mvnt-muted hover:text-white'}`}
                    aria-pressed={selected}
                  >
                    {filter}
                    {selected && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.22)]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-white/10 py-4 lg:flex-row lg:items-center lg:justify-between">
            <button type="button" className="inline-flex min-h-9 w-fit items-center gap-2 rounded-full border border-white/12 px-3 text-[11px] font-black text-mvnt-muted transition hover:bg-white/[.06] hover:text-white">
              <SlidersHorizontal size={15} /> 필터
            </button>
            <label className="flex min-h-10 w-full items-center gap-2 rounded-md border border-white/10 bg-white/[.025] px-3 text-mvnt-muted lg:w-[360px]">
              <Search size={16} />
              <input className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-mvnt-muted" placeholder="콘텐츠 검색" />
            </label>
          </div>

          <div className="hidden grid-cols-[minmax(430px,1fr)_130px_120px_100px_110px] gap-4 border-b border-white/10 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/38 lg:grid">
            <span>동영상</span>
            <span>구분</span>
            <span>공개 여부</span>
            <span>길이</span>
            <span>날짜</span>
          </div>

          <div className="divide-y divide-white/10">
            {pageWorks.map((work, index) => (
              <ProjectContentRow key={`${work.workTitle}-${work.src}`} work={work} index={index} onUpdateVisibility={updateVisibility} />
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 py-3 text-[11px] font-bold text-mvnt-muted sm:flex-row sm:items-center sm:justify-end">
            <label className="flex items-center gap-2">
              페이지당 행 수:
              <select value={rowsPerPage} onChange={changeRowsPerPage} className="rounded-md border border-white/10 bg-neutral-950 px-2 py-1 font-black text-white outline-none">
                {[5, 10, 25].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <span className="sm:ml-5">{rangeStart}-{rangeEnd} / {visibleWorks.length}</span>
            <div className="flex items-center gap-1 sm:ml-3">
              <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid size-7 place-items-center rounded-full text-white/70 transition hover:bg-white/[.06] disabled:cursor-default disabled:text-white/20" aria-label="이전 페이지"><ChevronLeft size={18} /></button>
              <button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="grid size-7 place-items-center rounded-full text-white/70 transition hover:bg-white/[.06] disabled:cursor-default disabled:text-white/20" aria-label="다음 페이지"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function ProjectContentRow({ work, index, onUpdateVisibility }) {
  const videoRef = useRef(null);
  function startPreview() {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
  }

  function stopPreview() {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }

  return (
    <article
      className="group grid gap-4 py-4 transition hover:bg-white/[.035] lg:grid-cols-[minmax(430px,1fr)_130px_120px_100px_110px] lg:items-center"
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      onFocus={startPreview}
      onBlur={stopPreview}
    >
      <div className="grid min-w-0 grid-cols-[150px_1fr] gap-3">
        <div className="relative isolate aspect-video overflow-hidden rounded-lg bg-black ring-1 ring-white/10">
          <video ref={videoRef} className="size-full object-cover" src={work.src} muted loop playsInline preload="metadata" />
          <div className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/78 px-1.5 py-0.5 text-[10px] font-black text-white">{work.length}</span>
        </div>
        <div className="min-w-0 py-1">
          <h2 className="truncate text-xs font-black text-white">{work.workTitle}</h2>
          <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-relaxed text-mvnt-muted">{work.source} 소스 · {work.style}</p>
          <div className="mt-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <ProjectActionButton icon={Pencil} label="수정" />
            <ProjectActionButton icon={Type} label="제목 수정" />
            <ProjectActionButton icon={Eye} label="공개 설정" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:block"><span className="text-xs font-black text-white/38 lg:hidden">구분</span><span className="text-[11px] font-bold text-white/70">{work.kind}</span></div>
      <div className="flex items-center justify-between gap-3 lg:block">
        <span className="text-xs font-black text-white/38 lg:hidden">공개 여부</span>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="group/visibility inline-flex items-center gap-2 rounded-md px-1.5 py-1 text-[11px] font-bold text-white/70 outline-none transition hover:bg-white/[.06] hover:text-white focus-visible:bg-white/[.06]"
              aria-label={`공개 여부 수정: ${work.workTitle}`}
            >
              {work.visibility === '공개' ? (
                <Eye size={16} className="text-white/72 group-hover/visibility:text-emerald-200" />
              ) : (
                <EyeOff size={16} className="text-white/42 group-hover/visibility:text-white/80" />
              )}
              <span>{work.visibility}</span>
              <ChevronDown size={13} className="text-white/36 transition group-hover/visibility:text-white/70" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="bottom" align="start" sideOffset={6} className="z-50 w-[132px] rounded-xl border border-white/10 bg-neutral-950 p-1.5 text-mvnt-text shadow-2xl">
              {['공개', '비공개'].map((visibility) => (
                <DropdownMenu.Item
                  key={visibility}
                  onSelect={() => onUpdateVisibility(work.workTitle, visibility)}
                  className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-xs font-black outline-none hover:bg-white/10"
                >
                  {visibility === '공개' ? <Eye size={15} /> : <EyeOff size={15} />}
                  <span>{visibility}</span>
                  {work.visibility === visibility && <span className="ml-auto text-mvnt-orange">✓</span>}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-white/68 lg:block"><span className="text-white/38 lg:hidden">길이</span>{work.length}</div>
      <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-white/68 lg:block"><span className="text-white/38 lg:hidden">날짜</span>{work.updated}</div>
    </article>
  );
}

function ProjectActionButton({ icon: Icon, label }) {
  return (
    <button type="button" className="group/action relative grid size-7 place-items-center rounded-full text-white/48 transition hover:bg-white/[.08] hover:text-white" aria-label={label}>
      <Icon size={14} strokeWidth={2.4} />
      <span className="pointer-events-none absolute left-1/2 top-[calc(100%+7px)] z-30 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[10px] font-black text-black opacity-0 shadow-xl transition group-hover/action:opacity-100">
        {label}
      </span>
    </button>
  );
}


function ProgressiveCommunityTagFilters({ activeTag, onTagChange, countLabel, variant = 'search', stopPointerEvents = false }) {
  const [visibleTagCount, setVisibleTagCount] = useState(1);
  const visibleTags = getVisibleCommunityTags(visibleTagCount);
  const canAddFilter = visibleTagCount < communityTags.length;
  const isHomeVariant = variant === 'home';

  const chipBaseClass = isHomeVariant
    ? 'shrink-0 min-h-11 rounded-full border px-4 py-0 text-xs font-black transition-all'
    : 'min-h-9 rounded-full border px-3 text-[11px] font-black transition';
  const selectedClass = isHomeVariant
    ? 'scale-[1.02] border-white bg-white text-black shadow-[0_10px_28px_rgba(255,255,255,.12)]'
    : 'border-white bg-white text-black';
  const idleClass = isHomeVariant
    ? 'border-white/12 bg-white/[.035] text-mvnt-muted hover:border-white/28 hover:text-white'
    : 'border-white/12 bg-white/[.035] text-mvnt-muted hover:text-white';
  const addButtonClass = isHomeVariant
    ? 'shrink-0 inline-flex min-h-11 items-center gap-2 rounded-full border border-dashed border-mvnt-orange/45 bg-mvnt-orange/[.08] px-4 text-xs font-black text-mvnt-orange transition hover:border-mvnt-orange hover:bg-mvnt-orange/15 hover:text-mvnt-yellow'
    : 'inline-flex min-h-9 items-center gap-1.5 rounded-full border border-dashed border-mvnt-orange/45 bg-mvnt-orange/[.08] px-3 text-[11px] font-black text-mvnt-orange transition hover:border-mvnt-orange hover:bg-mvnt-orange/15 hover:text-mvnt-yellow';

  function addFilter(event) {
    if (stopPointerEvents) event.stopPropagation();
    setVisibleTagCount((count) => Math.min(count + 1, communityTags.length));
  }

  function selectTag(event, tag) {
    if (stopPointerEvents) {
      event.preventDefault();
      event.stopPropagation();
    }
    onTagChange(tag);
  }

  return (
    <>
      {visibleTags.map((tag) => {
        const selected = activeTag === tag;
        return (
          <button
            key={tag}
            type="button"
            onPointerDown={stopPointerEvents ? (event) => event.stopPropagation() : undefined}
            onClick={(event) => selectTag(event, tag)}
            aria-pressed={selected}
            className={`${chipBaseClass} ${selected ? selectedClass : idleClass}`}
          >
            #{tag}
          </button>
        );
      })}
      {canAddFilter && (
        <button
          type="button"
          onPointerDown={stopPointerEvents ? (event) => event.stopPropagation() : undefined}
          onClick={addFilter}
          className={addButtonClass}
          aria-label={`${communityTags[visibleTagCount]} 필터 추가`}
        >
          <Plus size={isHomeVariant ? 15 : 13} strokeWidth={3} />
          필터 추가
        </button>
      )}
      {countLabel && <span className={isHomeVariant ? 'ml-1 shrink-0 text-xs font-black text-mvnt-muted' : 'ml-auto text-xs font-black text-mvnt-muted'}>{countLabel}</span>}
    </>
  );
}

function SearchPage({ initialQuery = '', onCreateFromQuery, sidebarExpanded }) {
  const [activeTag, setActiveTag] = useState('All');
  const [query, setQuery] = useState(initialQuery);
  const [searchSource, setSearchSource] = useState(null);
  const [searchSourceMetadata, setSearchSourceMetadata] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const trimmedQuery = query.trim();
  const visibleVideos = filterCommunityVideos({ activeTag, query });
  const searchSourceDescription = searchSource ? describeSource(searchSource) : null;
  const searchSourcePreview = searchSourceDescription ? { ...searchSourceDescription, Icon: sourceIconMap[searchSourceDescription.icon] || Link } : null;
  const connectedVideo = visibleVideos[0] || null;
  const connectedSongTitle = searchSourceMetadata?.title || searchSourcePreview?.title || connectedVideo?.title || trimmedQuery;
  const connectedSongArtist = searchSourceMetadata?.name || searchSourcePreview?.eyebrow || connectedVideo?.creator || 'Search result sound';
  const connectedSongImage = searchSourceMetadata?.image;
  const connectedSongAction = searchSource?.label || connectedVideo?.title || trimmedQuery;

  useEffect(() => {
    setQuery(initialQuery);
    setSearchSource(null);
  }, [initialQuery]);

  useEffect(() => {
    let cancelled = false;
    setSearchSourceMetadata(null);
    if (!searchSourceDescription) return undefined;

    fetchSourceMetadata(searchSourceDescription).then((metadata) => {
      if (!cancelled) setSearchSourceMetadata(metadata);
    });

    return () => {
      cancelled = true;
    };
  }, [searchSourceDescription?.kind, searchSourceDescription?.url, searchSourceDescription?.title]);

  function applySearchPaste(dataTransfer) {
    const payload = getMusicPayload(dataTransfer);
    const pastedText = dataTransfer?.getData('text/plain')?.trim();
    const nextQuery = payload?.label || pastedText;
    if (!nextQuery) return false;
    setQuery(nextQuery);
    setSearchSource(payload || null);
    return true;
  }

  useEffect(() => {
    const handlePaste = (event) => {
      const target = event.target;
      const isEditableTarget = target instanceof HTMLElement && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );
      if (isEditableTarget) return;

      if (!applySearchPaste(event.clipboardData)) return;
      event.preventDefault();
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  return (
    <>
    <section className="min-h-screen px-2 pb-20 pt-20">
      <div className="mx-auto w-[min(1180px,100%)]">
        <div className="sticky top-16 z-20 mb-6 rounded-[18px] border border-white/10 bg-neutral-950/88 p-3 shadow-[0_18px_70px_rgba(0,0,0,.34)] backdrop-blur-2xl">
          <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-white/[.055] px-4 text-mvnt-muted">
            <Search size={19} />
            {searchSourcePreview ? (
              <AttachmentPreview
                description={searchSourcePreview}
                metadata={searchSourceMetadata}
                onClear={() => {
                  setQuery('');
                  setSearchSource(null);
                  setSearchSourceMetadata(null);
                }}
              />
            ) : (
              <input
                className="min-w-0 flex-1 bg-transparent text-base font-bold text-white outline-none placeholder:text-mvnt-muted"
                placeholder="노래, 크리에이터, 장르 검색"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchSource(null);
                }}
                onPaste={(event) => {
                  if (!applySearchPaste(event.clipboardData)) return;
                  event.preventDefault();
                }}
              />
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="ARI community filters">
            <ProgressiveCommunityTagFilters activeTag={activeTag} onTagChange={setActiveTag} countLabel={`${visibleVideos.length} results`} />
          </div>
        </div>

        {trimmedQuery && connectedSongAction && (
          <section className="mb-5 flex flex-col gap-3 rounded-[22px] border border-white/10 bg-white/[.035] p-4 shadow-[0_18px_58px_rgba(0,0,0,.24)] sm:flex-row sm:items-center sm:justify-between" aria-label="검색 결과와 연결된 노래">
            <div className="flex min-w-0 items-center gap-3">
              <span className="music-source-art relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl text-white shadow-[0_14px_34px_rgba(0,0,0,.32)] ring-1 ring-white/12" style={{ '--music-hue': (visibleVideos.indexOf(connectedVideo) * 42 + 128) % 360 }}>
                {connectedSongImage ? (
                  <img src={connectedSongImage} alt="" className="relative z-10 size-full object-cover" />
                ) : (
                  <Music2 className="relative z-10 drop-shadow-[0_5px_18px_rgba(0,0,0,.55)]" size={25} strokeWidth={2.5} />
                )}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black tracking-[-0.04em] text-white">{connectedSongTitle}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onCreateFromQuery?.(connectedSongAction)}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-mvnt-orange via-pink-500 to-violet-600 px-5 text-xs font-black text-white shadow-[0_16px_38px_rgba(255,138,0,.2)] transition hover:brightness-110"
            >
              <Wand2 size={16} />
              “{connectedSongTitle}”로 새 춤 만들기
            </button>
          </section>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleVideos.map((video, index) => (
            <CommunityVideoCard
              key={`${video.src}-${index}`}
              video={video}
              index={index}
              onClick={() => setSelectedVideo({ video, index })}
            />
          ))}
        </div>
        {visibleVideos.length === 0 && (
          <div className="rounded-[18px] border border-white/10 bg-white/[.035] px-6 py-14 text-center text-sm font-bold text-mvnt-muted">
            검색 결과가 없습니다.
            {trimmedQuery && (
              <button type="button" onClick={() => onCreateFromQuery?.(trimmedQuery)} className="mx-auto mt-5 flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-black text-black transition hover:bg-mvnt-yellow">
                <Wand2 size={15} />
                “{trimmedQuery}”로 새 춤 만들기
              </button>
            )}
          </div>
        )}
      </div>
    </section>

    {selectedVideo && (
      <TrendVideoModal
        video={selectedVideo.video}
        index={selectedVideo.index}
        videos={visibleVideos}
        onSelect={(video, index) => setSelectedVideo({ video, index })}
        onClose={() => setSelectedVideo(null)}
        sidebarExpanded={sidebarExpanded}
      />
    )}
    </>
  );
}

function ExplorePage() {
  const feedRef = useRef(null);
  const [likedReels, setLikedReels] = useState({});
  const [scrollBounds, setScrollBounds] = useState({ canUp: false, canDown: true });
  const [expandedMusicIndex, setExpandedMusicIndex] = useState(null);
  const reels = communityVideos.map((video, index) => ({
    ...video,
    comment: [
      '오늘 훅 파트 느낌만 살려서 짧게 짜봤어요.',
      '원곡 박자에 맞춰 만든 쇼츠용 루틴입니다.',
      '처음 5초 동작이 포인트예요. 따라 해보세요.',
      'MVNT로 만든 초안에서 손동작만 다듬었습니다.'
    ][index % 4],
    sourceUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`
  }));

  useEffect(() => {
    const feed = feedRef.current;
    if (!feed) return undefined;

    const updateScrollBounds = () => {
      const maxScroll = Math.max(0, feed.scrollHeight - feed.clientHeight);
      setScrollBounds({
        canUp: feed.scrollTop > 2,
        canDown: feed.scrollTop < maxScroll - 2
      });
    };

    updateScrollBounds();
    feed.addEventListener('scroll', updateScrollBounds, { passive: true });
    window.addEventListener('resize', updateScrollBounds);
    return () => {
      feed.removeEventListener('scroll', updateScrollBounds);
      window.removeEventListener('resize', updateScrollBounds);
    };
  }, [reels.length]);

  function moveReel(direction) {
    const feed = feedRef.current;
    if (!feed) return;
    feed.scrollBy({ top: direction * feed.clientHeight, behavior: 'smooth' });
  }

  return (
    <section ref={feedRef} className="reels-feed h-screen overflow-x-hidden overflow-y-auto overscroll-x-none overscroll-y-contain snap-y snap-mandatory scroll-smooth">

      <div className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 md:flex">
        {scrollBounds.canUp && (
          <button type="button" onClick={() => moveReel(-1)} className="grid size-12 place-items-center text-white/72 transition hover:text-white" aria-label="Previous video">
            <ArrowUp size={32} strokeWidth={2.8} />
          </button>
        )}
        {scrollBounds.canDown && (
          <button type="button" onClick={() => moveReel(1)} className="grid size-12 place-items-center text-white/72 transition hover:text-white" aria-label="Next video">
            <ArrowDown size={32} strokeWidth={2.8} />
          </button>
        )}
      </div>
      {reels.map((reel, index) => (
        <article key={`${reel.src}-${index}`} className="relative ml-[max(16px,calc(50%-460px))] mr-auto flex min-h-screen w-[min(720px,100%)] snap-start items-stretch justify-center px-4 py-0">
          <div className={`relative isolate h-screen w-full max-w-[430px] overflow-hidden rounded-none border-x border-white/10 bg-neutral-950 shadow-[0_30px_90px_rgba(0,0,0,.55)] transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${expandedMusicIndex === index ? '-translate-x-[130px]' : 'translate-x-0'}`}>
            <ReelVideo reel={reel} index={index} />

            <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-mvnt-orange to-mvnt-yellow text-xs font-black text-black ring-2 ring-white/20">
                  {reel.creator.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <strong className="block truncate text-xs font-black text-white">{reel.creator}</strong>
                </div>
              </div>
              <h2 className="text-base font-black tracking-[-0.035em] text-white">{reel.title}</h2>
              <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-relaxed text-white/72">{reel.comment}</p>
            </div>
          </div>

          <MusicIdentityOverlay
            reel={reel}
            index={index}
            expanded={expandedMusicIndex === index}
            onExpandedChange={(expanded) => setExpandedMusicIndex(expanded ? index : null)}
          />

          <div className={`absolute bottom-8 right-[max(18px,calc(50%-300px))] z-20 flex flex-col items-center gap-3 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${expandedMusicIndex === index ? '-translate-x-[130px]' : 'translate-x-0'}`}>
            <button
              type="button"
              onClick={() => setLikedReels((value) => ({ ...value, [index]: !value[index] }))}
              className={`grid size-12 place-items-center rounded-full border border-white/10 bg-white/[.08] backdrop-blur-xl transition hover:bg-white/[.16] ${likedReels[index] ? 'text-mvnt-orange' : 'text-white'}`}
              aria-label={likedReels[index] ? 'Unlike' : 'Like'}
              aria-pressed={Boolean(likedReels[index])}
            >
              <Heart size={22} fill={likedReels[index] ? 'currentColor' : 'none'} />
            </button>
            <span className="-mt-2 text-[10px] font-black text-white/62">{reel.likes + (likedReels[index] ? 1 : 0)}</span>
            <button type="button" className="grid size-12 place-items-center rounded-full border border-white/10 bg-white/[.08] text-white backdrop-blur-xl transition hover:bg-white/[.16]" aria-label="Share">
              <Share2 size={21} />
            </button>
            <span className="-mt-2 text-[10px] font-black text-white/62">{12 + (index % 7)}</span>
            <a className="grid size-12 place-items-center rounded-full border border-white/10 bg-white/[.08] text-white backdrop-blur-xl transition hover:bg-white/[.16]" href={reel.sourceUrl} target="_blank" rel="noreferrer" aria-label="Open source video">
              <ExternalLink size={21} />
            </a>
            <span className="-mt-2 text-[10px] font-black text-white/62">{3 + (index % 5)}</span>
          </div>
        </article>
      ))}
    </section>
  );
}


function DancePage() {
  const [activeGenre, setActiveGenre] = useState('음악 분석');
  const [activePreset, setActivePreset] = useState('Studio');
  const danceGenres = ['기본', '음악 분석', '커스텀'];
  const presets = ['Studio', 'Sky', 'Peach', 'Mint', 'Night'];
  const motionModes = ['3D Motion', '2D'];
  const qualitySettings = [
    { label: 'Tracking', value: 'OFF' },
    { label: 'Skeleton', value: 'OFF' },
    { label: 'Toon', value: 'ON', active: true }
  ];

  return (
    <section className="min-h-screen bg-[#070808] px-2 pb-5 pt-20 text-white sm:px-4">
      <div className="mx-auto grid min-h-[calc(100vh-96px)] w-[min(1480px,100%)] gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[#111315] shadow-[0_28px_90px_rgba(0,0,0,.42)]">
          <div className="flex border-b border-white/8 bg-white/[.025]">
            {['DANCE', 'DANCER'].map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`relative flex min-h-[62px] flex-1 items-center justify-center gap-2 text-sm font-black tracking-[-0.02em] transition ${index === 0 ? 'bg-[#15181a] text-white' : 'text-white/36 hover:text-white/70'}`}
              >
                {index === 0 ? <Music2 size={17} /> : <UserRound size={17} />}
                {tab}
                {index === 1 && <span className="rounded-md bg-mvnt-yellow/18 px-1.5 py-0.5 text-[10px] text-mvnt-yellow">3D</span>}
                {index === 0 && <span className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-white" />}
              </button>
            ))}
          </div>

          <div className="p-5">
            <div className="rounded-[24px] border border-white/10 bg-[#181b1e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)]">
              <div>
                <h1 className="text-lg font-black tracking-[-0.04em]">댄스 음악 등록하기</h1>
                <p className="mt-1 text-xs font-bold leading-relaxed text-white/48">어떤 음악이든 좋아요. 새로운 춤을 만들어봐요!</p>
              </div>

              <div className="mt-5 rounded-[22px] border border-dashed border-white/14 bg-[#202326] p-4 text-center shadow-[inset_0_0_38px_rgba(255,255,255,.025)]">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '링크 붙여넣기', icon: Link },
                    { label: '업로드', icon: UploadCloud },
                    { label: '드래그', icon: MousePointerIcon }
                  ].map(({ label, icon: Icon }) => (
                    <button key={label} type="button" className="group grid min-h-[82px] place-items-center rounded-2xl bg-white/[.035] text-white/58 transition hover:bg-white/[.07] hover:text-white">
                      <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/[.04] transition group-hover:border-mvnt-orange/40 group-hover:text-mvnt-orange">
                        <Icon size={19} />
                      </span>
                      <span className="text-[11px] font-black">{label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-[11px] font-bold leading-relaxed text-white/36">지원 링크: YouTube, SoundCloud, Suno<br />지원 파일: mp3, wav</p>
              </div>

              <div className="mt-6 border-t border-white/8 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-black tracking-[-0.03em]">댄스 장르</h2>
                  <button type="button" className="grid size-7 place-items-center rounded-lg bg-white/[.05] text-white/42 transition hover:text-white" aria-label="장르 설정">
                    <SlidersHorizontal size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-white/[.035] p-1">
                  {danceGenres.map((genre) => {
                    const selected = activeGenre === genre;
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => setActiveGenre(genre)}
                        className={`min-h-10 rounded-xl text-[11px] font-black transition ${selected ? 'bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,.12)]' : 'text-white/48 hover:text-white'}`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button type="button" className="mt-5 flex min-h-16 w-full items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-mvnt-orange via-mvnt-yellow to-[#dcff16] text-base font-black text-black shadow-[0_18px_54px_rgba(255,184,71,.24)] transition hover:brightness-110">
              <Wand2 size={20} /> Make Dance!
            </button>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: '8s', icon: Play },
                { label: 'Auto', icon: Check },
                { label: '1080p', icon: Sparkles }
              ].map(({ label, icon: Icon }) => (
                <button key={label} type="button" className="flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-white/[.055] text-xs font-black text-white/72 transition hover:bg-white/[.08] hover:text-white">
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#f7f7f4] text-[#151515] shadow-[0_30px_100px_rgba(0,0,0,.45)]">
          <div className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="inline-flex rounded-2xl bg-black/10 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,.12)]">
              {motionModes.map((mode, index) => (
                <button key={mode} type="button" className={`min-h-11 rounded-xl px-5 text-sm font-black transition ${index === 0 ? 'bg-mvnt-orange text-black shadow-[0_10px_24px_rgba(255,138,0,.28)]' : 'text-black/34 hover:text-black/60'}`}>
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {qualitySettings.map((item) => (
                <button key={item.label} type="button" className={`min-h-10 rounded-xl border px-3 text-xs font-black shadow-sm transition ${item.active ? 'border-white bg-white text-black' : 'border-black/10 bg-black/[.06] text-black/70 hover:bg-black/[.09]'}`}>
                  {item.label} {item.value}
                </button>
              ))}
              <span className="mx-1 h-7 w-px bg-black/10" />
              {[FileAudio, UploadCloud, Image].map((Icon, index) => (
                <button key={index} type="button" className={`grid size-10 place-items-center rounded-xl border border-black/10 shadow-sm transition ${index === 2 ? 'bg-mvnt-orange text-black' : 'bg-black/[.06] text-black/70 hover:bg-black/[.09]'}`} aria-label="studio tool">
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>

          <div className="relative grid min-h-[720px] place-items-center px-6 pb-24 pt-24 lg:min-h-full">
            <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.10),transparent_55%),linear-gradient(180deg,transparent,#e6e2dc)]" />
            <div className="absolute left-1/2 top-[25%] z-10 -translate-x-1/2 rounded-[26px] border-[4px] border-[#171717] bg-white px-7 py-3 text-sm font-black shadow-[0_14px_34px_rgba(0,0,0,.12)] after:absolute after:left-1/2 after:top-[calc(100%-2px)] after:size-4 after:-translate-x-1/2 after:rotate-45 after:border-b-[4px] after:border-r-[4px] after:border-[#171717] after:bg-white">
              new song, new personality unlocked ✨
            </div>

            <div className="relative z-10 mt-20 h-[430px] w-[270px]">
              <div className="absolute left-1/2 top-[402px] h-8 w-40 -translate-x-1/2 rounded-full bg-black/16 blur-sm" />
              <div className="absolute left-[112px] top-0 size-16 rounded-full border-[3px] border-[#202020] bg-[#f0c17f] shadow-[inset_-12px_-8px_0_rgba(176,112,48,.16)]" />
              <div className="absolute left-[92px] top-[58px] h-[162px] w-[92px] rounded-[44px_44px_34px_34px] border-[3px] border-[#202020] bg-[#e8b66f] shadow-[inset_-18px_-8px_0_rgba(174,103,44,.18)]">
                <span className="absolute left-4 top-0 h-full w-0.5 bg-white/70" />
                <span className="absolute right-5 top-2 h-[88%] w-0.5 bg-white/60" />
                <span className="absolute left-2 top-12 h-0.5 w-[82%] bg-white/60" />
                <span className="absolute left-3 top-24 h-0.5 w-[74%] bg-white/55" />
              </div>
              <div className="absolute left-[38px] top-[72px] h-20 w-24 origin-right -rotate-[42deg] rounded-full border-[3px] border-[#202020] bg-[#e8b66f]" />
              <div className="absolute left-[24px] top-[50px] h-12 w-9 rotate-[18deg] rounded-full border-[3px] border-[#202020] bg-[#f0c17f]" />
              <div className="absolute right-[24px] top-[72px] h-20 w-24 origin-left rotate-[42deg] rounded-full border-[3px] border-[#202020] bg-[#e8b66f]" />
              <div className="absolute right-[10px] top-[54px] h-12 w-9 -rotate-[18deg] rounded-full border-[3px] border-[#202020] bg-[#f0c17f]" />
              <div className="absolute left-[94px] top-[208px] h-44 w-10 -rotate-[7deg] rounded-full border-[3px] border-[#202020] bg-[#e8b66f]" />
              <div className="absolute left-[83px] top-[356px] h-18 w-12 -rotate-[3deg] rounded-full border-[3px] border-[#202020] bg-[#f0c17f]" />
              <div className="absolute right-[82px] top-[204px] h-44 w-10 rotate-[16deg] rounded-full border-[3px] border-[#202020] bg-[#e8b66f]" />
              <div className="absolute right-[62px] top-[356px] h-18 w-12 rotate-[8deg] rounded-full border-[3px] border-[#202020] bg-[#f0c17f]" />
            </div>
          </div>

          <div className="absolute inset-x-5 bottom-5 z-20 rounded-[22px] border border-black/8 bg-white/88 p-3 shadow-[0_18px_58px_rgba(0,0,0,.14)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2">
              {presets.map((preset) => {
                const selected = activePreset === preset;
                return (
                  <button key={preset} type="button" onClick={() => setActivePreset(preset)} className={`min-h-9 rounded-xl px-3 text-xs font-black transition ${selected ? 'bg-mvnt-orange text-black shadow-[0_8px_18px_rgba(255,138,0,.25)]' : 'bg-black/[.055] text-black/45 hover:text-black'}`}>
                    {preset}
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-black text-black/38">Light Rotation</span>
              <div className="h-5 min-w-[180px] flex-1 rounded-full bg-black/12 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,.12)]">
                <div className="ml-[48%] size-4 rounded-full bg-mvnt-orange ring-2 ring-white" />
              </div>
              <span className="text-xs font-black text-black/38">0°</span>
              <button type="button" className="min-h-9 rounded-xl bg-black/[.08] px-3 text-xs font-black text-black/70">Fixed</button>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

function MousePointerIcon(props) {
  return <Send {...props} className={`-rotate-45 ${props.className || ''}`} />;
}

function CommunityExamples({ sidebarExpanded }) {
  const [activeTag, setActiveTag] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const visibleVideos = filterCommunityVideos({ activeTag, query });

  return (
    <>
      <section className="relative z-10 mx-auto -mt-32 w-[min(1180px,100%)] pb-20" aria-label="Community example videos">
        <div className="mb-5">
          <h2 className="inline-flex items-center gap-3 text-[clamp(28px,3.6vw,48px)] font-black leading-none tracking-[-0.045em] text-white"><Flame className="text-mvnt-orange" size={34} fill="currentColor" /> Trend</h2>
          <div className="relative z-20 mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="flex min-h-11 w-full items-center gap-2 border-b border-white/15 text-mvnt-muted lg:w-[320px] lg:shrink-0">
              <Search size={17} />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-mvnt-muted"
                placeholder="Search videos"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="relative z-30 flex items-center gap-2 overflow-hidden pb-1 lg:pb-0" aria-label="ARI community filters">
              <ProgressiveCommunityTagFilters
                activeTag={activeTag}
                onTagChange={setActiveTag}
                countLabel={`${visibleVideos.length} videos`}
                variant="home"
                stopPointerEvents
              />
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleVideos.map((video, index) => (
            <button
              type="button"
              key={`${video.src}-${index}`}
              onClick={() => setSelectedVideo({ video, index })}
              className="group relative isolate overflow-hidden border border-white/10 bg-neutral-950 p-0 text-left shadow-[0_24px_70px_rgba(0,0,0,.35)] outline-none transition hover:-translate-y-1 hover:border-mvnt-orange/55 focus-visible:border-mvnt-orange focus-visible:ring-2 focus-visible:ring-mvnt-orange/45"
              aria-label={`${video.title} 상세 보기`}
            >
              <div className={`pointer-events-none absolute inset-0 z-10 bg-gradient-to-t ${video.tone} via-transparent to-black/10 opacity-70 transition-opacity duration-300 group-hover:opacity-95`} />
              <AutoPlayVideo className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.035]" src={video.src} preload={index < 3 ? 'auto' : 'metadata'} eager={index < 2} />
              <div className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/78 to-transparent p-4 pb-12">
                  <div className="flex items-center gap-2">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-mvnt-orange to-mvnt-yellow text-xs font-black text-black ring-2 ring-white/20">{video.creator.slice(0, 1).toUpperCase()}</span>
                    <span className="min-w-0 truncate text-xs font-black text-white drop-shadow">{video.creator}</span>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/82 to-transparent p-4 pt-20">
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-white/90 via-mvnt-yellow to-mvnt-orange text-black shadow-[0_10px_28px_rgba(0,0,0,.45)]">
                        <span className="text-lg font-black leading-none">♪</span>
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-white/54">Song</span>
                        <h3 className="truncate text-base font-black tracking-[-0.03em] text-white">{video.title}</h3>
                      </div>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/12 px-2 py-1 text-xs font-black text-white/90 backdrop-blur-md"><Heart size={12} fill="currentColor" /> {video.likes}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {visibleVideos.length === 0 && (
          <div className="mt-3 rounded-[18px] border border-white/10 bg-white/[.035] px-6 py-10 text-center text-sm font-bold text-mvnt-muted">
            선택한 태그에 맞는 영상이 없습니다.
          </div>
        )}
      </section>

      {selectedVideo && (
        <TrendVideoModal
          video={selectedVideo.video}
          index={selectedVideo.index}
          videos={visibleVideos}
          onSelect={(video, index) => setSelectedVideo({ video, index })}
          onClose={() => setSelectedVideo(null)}
          sidebarExpanded={sidebarExpanded}
        />
      )}
    </>
  );
}


function TrendVideoModal({ video, index, videos, onSelect, onClose, sidebarExpanded }) {
  const videoRef = useRef(null);
  const commentCardRef = useRef(null);
  const commentButtonRef = useRef(null);
  const commentDragRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentPosition, setCommentPosition] = useState(() => ({
    x: typeof window === 'undefined' ? 520 : Math.max(24, window.innerWidth - 960),
    y: 110
  }));
  const [commentDraft, setCommentDraft] = useState('');
  const [comments, setComments] = useState([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(9);
  const [videoAspect, setVideoAspect] = useState('landscape');
  const [videoSize, setVideoSize] = useState({ width: 16, height: 9 });
  const tags = getCommunityVideoTags(video, index).filter((tag) => tag !== 'All');
  const displayTags = ['Full Dance', ...tags.slice(0, 2), video.title.includes('BLACKPINK') ? 'K-pop hook' : '3D character'];
  const [artistName, songTitle] = video.title.includes(' - ')
    ? video.title.split(' - ').map((part) => part.trim())
    : [video.creator, video.title];
  const promptDescription = `Generate a ${displayTags.includes('K-pop') ? 'K-pop inspired' : 'full-body'} 3D dance motion for “${songTitle}” with clean rhythm, expressive upper-body accents, and a loop-ready camera-safe performance.`;
  const sourceUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(video.title)}`;
  const defaultComments = [
    { author: 'momo', text: '첫 동작 타이밍이 진짜 좋네요.' },
    { author: 'loophaus', text: '이 루틴으로 짧은 쇼츠 만들기 딱 좋아요.' },
    { author: 'mvnt picks', text: '팔 라인만 조금 더 크게 잡으면 더 잘 보일 듯.' }
  ];
  const musicHue = (index * 42 + 128) % 360;
  const elapsed = Math.max(0, Math.round(progress * duration));
  const safeDuration = Math.max(1, Math.round(duration));
  const formatVideoTime = (seconds) => {
    const totalSeconds = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  const elapsedLabel = formatVideoTime(elapsed);
  const durationLabel = formatVideoTime(safeDuration);
  const previewClass = videoAspect === 'portrait'
    ? 'h-[calc(100vh-40px)] max-w-[calc(100vw-380px)]'
    : videoAspect === 'square'
      ? 'h-[calc(100vh-40px)] max-w-[calc(100vw-380px)]'
      : 'w-full max-w-[calc(100vw-380px)] max-h-[calc(100vh-40px)]';
  const previewStyle = { aspectRatio: `${videoSize.width} / ${videoSize.height}` };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setPaused(false);
    setMuted(true);
    setCommentsOpen(false);
    setCommentDraft('');
    setComments(defaultComments.slice(0, 2 + (index % 2)));
    setProgress(0);
    setVideoAspect('landscape');
    setVideoSize({ width: 16, height: 9 });
  }, [video.src]);

  function togglePlayback() {
    const player = videoRef.current;
    if (!player) return;
    if (player.paused) {
      player.play();
      setPaused(false);
    } else {
      player.pause();
      setPaused(true);
    }
  }

  function toggleMute() {
    const player = videoRef.current;
    const nextMuted = !muted;
    setMuted(nextMuted);
    if (!player) return;
    player.muted = nextMuted;
    if (!nextMuted) {
      player.volume = 1;
      player.play().catch(() => {});
      setPaused(false);
    }
  }

  function seekVideo(event) {
    const player = videoRef.current;
    const nextProgress = Number(event.currentTarget.value) / 1000;
    setProgress(nextProgress);
    if (!player || !Number.isFinite(player.duration) || player.duration <= 0) return;
    player.currentTime = nextProgress * player.duration;
  }

  async function shareVideo() {
    const sharePayload = {
      title: video.title,
      text: `${video.title} by ${video.creator}`,
      url: sourceUrl
    };
    if (navigator.share) {
      await navigator.share(sharePayload).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(sourceUrl).catch(() => {});
  }

  function submitComment(event) {
    event.preventDefault();
    const text = commentDraft.trim();
    if (!text) return;
    setComments((value) => [{ author: 'You', text }, ...value]);
    setCommentDraft('');
  }

  function toggleComments() {
    setCommentsOpen((isOpen) => {
      if (isOpen) return false;
      const rect = commentButtonRef.current?.getBoundingClientRect();
      const cardWidth = 380;
      const cardHeight = 420;
      const margin = 16;
      if (rect && typeof window !== 'undefined') {
        const maxX = Math.max(margin, window.innerWidth - cardWidth - margin);
        const maxY = Math.max(margin, window.innerHeight - cardHeight - margin);
        const preferredY = rect.top - cardHeight - 12;
        setCommentPosition({
          x: Math.min(maxX, Math.max(margin, rect.right - cardWidth)),
          y: Math.min(maxY, Math.max(margin, preferredY >= margin ? preferredY : rect.bottom + 12))
        });
      }
      return true;
    });
  }

  function startCommentDrag(event) {
    if (event.button !== 0) return;
    const rect = commentCardRef.current?.getBoundingClientRect();
    if (!rect) return;
    commentDragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveCommentDrag(event) {
    if (!commentDragRef.current) return;
    const card = commentCardRef.current;
    const width = card?.offsetWidth || 560;
    const height = card?.offsetHeight || 460;
    const maxX = Math.max(16, window.innerWidth - width - 16);
    const maxY = Math.max(16, window.innerHeight - height - 16);
    setCommentPosition({
      x: Math.min(maxX, Math.max(16, event.clientX - commentDragRef.current.offsetX)),
      y: Math.min(maxY, Math.max(16, event.clientY - commentDragRef.current.offsetY))
    });
  }

  function stopCommentDrag(event) {
    commentDragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] text-mvnt-text" role="dialog" aria-modal="true" aria-label={`${video.title} 상세 모달`}>
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/42 backdrop-blur-[30px] backdrop-saturate-75 supports-[backdrop-filter]:bg-black/34"
        aria-label="닫기"
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.42)),radial-gradient(circle_at_36%_0%,rgba(255,138,0,.14),transparent_36rem),radial-gradient(circle_at_84%_12%,rgba(124,58,237,.13),transparent_30rem)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,.62)]" />

      <div className="pointer-events-none absolute left-5 top-5 z-20 flex rounded-full border border-white/12 bg-black/42 p-1 text-[11px] font-black text-white/54 shadow-[0_12px_30px_rgba(0,0,0,.34)] backdrop-blur-xl">
        <span className="rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow px-3 py-1.5 text-black">3D</span>
        <span className="px-3 py-1.5">VID</span>
      </div>

      {commentsOpen && (
        <section
          ref={commentCardRef}
          className="fixed z-[1001] flex h-[min(420px,calc(100vh-32px))] w-[min(380px,calc(100vw-32px))] flex-col overflow-hidden rounded-[18px] border border-white/10 bg-[#111]/95 shadow-[0_18px_60px_rgba(0,0,0,.52)] backdrop-blur-xl"
          style={{ left: `${commentPosition.x}px`, top: `${commentPosition.y}px` }}
          role="dialog"
          aria-label="댓글"
        >
          <div
            className="flex cursor-move touch-none select-none items-center justify-between border-b border-white/10 px-4 py-3"
            onPointerDown={startCommentDrag}
            onPointerMove={moveCommentDrag}
            onPointerUp={stopCommentDrag}
            onPointerCancel={stopCommentDrag}
          >
            <h3 className="text-sm font-black tracking-[-0.02em] text-white">
              댓글 <span className="ml-1 text-white/38">{comments.length}</span>
            </h3>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                setCommentsOpen(false);
              }}
              className="grid size-7 place-items-center rounded-full border border-white/8 bg-white/[.035] text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label="댓글 닫기"
            >
              <X size={15} strokeWidth={2.4} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="space-y-3.5">
              {comments.map((comment, commentIndex) => (
                <article key={`${comment.author}-${comment.text}-${commentIndex}`} className="flex gap-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/8 text-[10px] font-black text-white/72 ring-1 ring-white/8">
                    {comment.author.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] leading-relaxed text-white/72">
                      <strong className="mr-1.5 font-black text-white/90">{comment.author}</strong>
                      {comment.text}
                    </p>
                    <span className="mt-1 block text-[10px] font-bold text-white/28">
                      {commentIndex === 0 && comment.author === 'You' ? '방금' : `${commentIndex + 2}분 전`}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <form onSubmit={submitComment} className="flex items-center gap-2 border-t border-white/10 px-3 py-2.5">
            <input
              className="min-w-0 flex-1 rounded-full bg-white/[.06] px-3.5 py-2 text-[13px] font-bold text-white outline-none placeholder:text-white/32 focus:bg-white/[.085]"
              placeholder="댓글 달기..."
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
            />
            <button
              type="submit"
              disabled={!commentDraft.trim()}
              className="shrink-0 rounded-full px-3 py-2 text-[12px] font-black text-mvnt-yellow transition hover:bg-white/10 hover:text-white disabled:cursor-default disabled:bg-transparent disabled:text-white/22"
            >
              게시
            </button>
          </form>
        </section>
      )}

      <div className="absolute inset-0">
        <article className="relative grid size-full grid-cols-[minmax(0,1fr)_380px] overflow-hidden bg-transparent">
          <section className="relative flex min-w-0 items-center justify-center overflow-hidden p-5">
            <div className={`group/video relative ${previewClass} overflow-hidden bg-transparent shadow-none`} style={previewStyle}>
              <video
                ref={videoRef}
                key={video.src}
                className="size-full object-cover"
                src={video.src}
                autoPlay
                muted={muted}
                loop
                playsInline
                onClick={togglePlayback}
                onPlay={() => setPaused(false)}
                onPause={() => setPaused(true)}
                onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
                onTimeUpdate={(event) => {
                  const current = event.currentTarget.currentTime || 0;
                  const total = event.currentTarget.duration || duration;
                  setDuration(Number.isFinite(total) && total > 0 ? total : duration);
                  setProgress(total ? Math.min(1, current / total) : 0);
                }}
                onLoadedMetadata={(event) => {
                  const total = event.currentTarget.duration;
                  if (Number.isFinite(total) && total > 0) setDuration(total);
                  const width = event.currentTarget.videoWidth || 0;
                  const height = event.currentTarget.videoHeight || 0;
                  if (width && height) {
                    const ratio = width / height;
                    setVideoSize({ width, height });
                    setVideoAspect(ratio < 0.85 ? 'portrait' : ratio > 1.2 ? 'landscape' : 'square');
                  }
                }}
              />


              <div className="absolute inset-x-0 bottom-0 opacity-0 transition-opacity duration-150 group-hover/video:opacity-100 group-focus-within/video:opacity-100">
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/42 to-transparent" />
                <div className="relative px-4 pb-3">
                  <div className="relative mb-2 h-1.5 rounded-full bg-white/18">
                    <div className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow" style={{ width: `${Math.max(0, progress * 100)}%` }} />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={Math.round(progress * 1000)}
                      onChange={seekVideo}
                      className="absolute inset-0 h-1.5 w-full cursor-pointer appearance-none bg-transparent opacity-0"
                      aria-label="영상 재생 위치"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,.75)]">
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={togglePlayback} className="grid size-7 place-items-center text-white transition hover:text-mvnt-yellow" aria-label={paused ? '재생' : '일시정지'}>
                        {paused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                      </button>
                      <button
                        type="button"
                        onClick={toggleMute}
                        className={`grid size-7 place-items-center transition hover:text-white ${muted ? 'text-white/58' : 'text-mvnt-yellow'}`}
                        aria-label={muted ? '음소거 해제' : '음소거'}
                        aria-pressed={!muted}
                      >
                        {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                      </button>
                    </div>
                    <span className="text-[12px] font-extrabold tracking-[-0.02em] text-white/90 [font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] [font-variant-numeric:tabular-nums]" aria-label={`재생 시간 ${elapsedLabel}, 전체 길이 ${durationLabel}`}>
                      {elapsedLabel} <span className="text-white/38">/</span> <span className="text-white/62">{durationLabel}</span>
                    </span>
                  </div>
                </div>
            </div>
            </div>
          </section>

          <aside className="relative flex min-h-0 flex-col overflow-hidden border-l border-white/10 bg-[#0d0e10]/86 p-5 shadow-[-28px_0_90px_rgba(0,0,0,.38)] backdrop-blur-2xl">
            <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full text-white/58 transition hover:bg-white/[.06] hover:text-white" aria-label="닫기">
              <X size={22} strokeWidth={2.2} />
            </button>

            <header className="mb-5 flex items-center gap-3 pr-10">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-r from-mvnt-orange to-mvnt-yellow text-sm font-black text-black">{video.creator.slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0">
                <strong className="block truncate text-sm font-black text-white">{video.creator}</strong>
                <span className="mt-0.5 block text-xs font-bold text-mvnt-muted">Creator</span>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <section className="mt-16 py-2">
                <div className="flex flex-col items-center text-center">
                  <div className="music-source-art relative grid aspect-square w-full max-w-[220px] place-items-center overflow-hidden rounded-[16px] text-white shadow-[0_22px_70px_rgba(0,0,0,.48)] ring-1 ring-white/12" style={{ '--music-hue': musicHue }}>
                    <span className="absolute left-3 top-3 z-10 grid h-5 w-8 place-items-center rounded-[6px] bg-white text-[hsl(var(--music-hue)_80%_34%)] shadow-sm"><Play size={10} fill="currentColor" strokeWidth={3} /></span>
                    <Music2 className="relative z-10 drop-shadow-[0_5px_18px_rgba(0,0,0,.55)]" size={46} strokeWidth={2.4} />
                    <span className="absolute bottom-3 left-3 right-3 z-10 truncate text-[10px] font-black uppercase tracking-[0.18em] text-white/78">{artistName}</span>
                  </div>
                  <h4 className="mt-4 max-w-full truncate text-xl font-black leading-tight tracking-[-0.045em] text-white">{songTitle}</h4>
                  <p className="mt-1 max-w-full truncate text-sm font-bold text-mvnt-muted">{artistName}</p>
                </div>
              </section>

              <section className="mt-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Prompt</h3>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-white/72">
                  {promptDescription}
                </p>
              </section>

              <section className="mt-6">
              <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Information</h3>
              <dl className="text-sm">
                <div className="flex items-center justify-between gap-4 py-1.5"><dt className="text-mvnt-muted">Feature</dt><dd className="font-black text-white">Motion</dd></div>
                <div className="flex items-center justify-between gap-4 py-1.5"><dt className="text-mvnt-muted">Quality</dt><dd className="font-black text-white">3D</dd></div>
                <div className="flex items-center justify-between gap-4 py-1.5"><dt className="text-mvnt-muted">Created</dt><dd className="font-black text-white">Apr {20 + (index % 9)}, 2026</dd></div>
              </dl>
            </section>

              <section className="mt-6">
                <h3 className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {displayTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/12 bg-black/34 px-2.5 py-1.5 text-[11px] font-black text-mvnt-yellow backdrop-blur-md"># {tag}</span>
                  ))}
                </div>
              </section>

            </div>

            <div className="shrink-0 border-t border-white/10 pt-4">
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setLiked((value) => !value)}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[.045] text-xs font-black transition hover:bg-white/[.08] ${liked ? 'text-mvnt-orange' : 'text-white/76'}`}
                  aria-pressed={liked}
                  aria-label={liked ? '좋아요 취소' : '좋아요'}
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} /> Like
                </button>
                <button
                  type="button"
                  onClick={shareVideo}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[.045] text-xs font-black text-white/76 transition hover:bg-white/[.08] hover:text-white"
                  aria-label="공유"
                >
                  <Share2 size={16} /> Share
                </button>
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[.045] text-xs font-black text-white/76 no-underline transition hover:bg-white/[.08] hover:text-white"
                  aria-label="원본 링크 열기"
                >
                  <ExternalLink size={16} /> Link
                </a>
                <button
                  ref={commentButtonRef}
                  type="button"
                  onClick={toggleComments}
                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[.045] text-xs font-black transition hover:bg-white/[.08] ${commentsOpen ? 'text-mvnt-yellow' : 'text-white/76'}`}
                  aria-expanded={commentsOpen}
                  aria-label="댓글 보기"
                >
                  <MessageCircle size={16} /> {comments.length}
                </button>
              </div>
              <div className="space-y-3">
              <button type="button" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-mvnt-orange via-pink-500 to-violet-600 px-4 text-sm font-black text-white shadow-[0_18px_46px_rgba(255,138,0,.20)] transition hover:brightness-110">
                <Wand2 size={17} /> Open in Studio
              </button>
              <button type="button" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[.035] px-4 text-sm font-black text-white/78 transition hover:bg-white/[.07] hover:text-white">
                <ArrowDown size={17} /> Download
              </button>
              </div>
            </div>
          </aside>
        </article>
      </div>
    </div>,
    document.body
  );
}

function DropdownItem({ icon: Icon, children }) {
  return <DropdownMenu.Item className="flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[11px] font-bold text-mvnt-muted outline-none hover:bg-white/10 hover:text-mvnt-text"><Icon size={15} /> {children}</DropdownMenu.Item>;
}

createRoot(document.getElementById('root')).render(<App />);
