export const navItems = [
  { id: 'create', label: 'Create', kicker: 'Music → Motion' },
  { id: 'explore', label: 'Explore', kicker: 'Community' },
  { id: 'studio', label: 'Studio', kicker: 'Drafts' },
  { id: 'credits', label: 'Credits', kicker: 'Plans' },
  { id: 'api', label: 'API', kicker: 'Developers' }
];

export const dancers = [
  { name: 'Neon Rookie', style: 'K-pop hook', tempo: '128 BPM', color: '#B8FF4D' },
  { name: 'Glass Ninja', style: 'Meme dance', tempo: '96 BPM', color: '#7AE7FF' },
  { name: 'Velvet Ballad', style: 'Slow groove', tempo: '72 BPM', color: '#FF87D4' },
  { name: 'Chrome Popper', style: 'Street pop', tempo: '112 BPM', color: '#C6B7FF' }
];

export const community = [
  { title: 'Popcorn chorus loop', source: 'YouTube', author: 'DO edit lab', stat: '42K remixes', tag: 'K-pop' },
  { title: 'City light shuffle', source: 'SoundCloud', author: 'night bus', stat: '18K saves', tag: 'Street' },
  { title: 'Ballad silhouette', source: 'Upload', author: 'studio momo', stat: '9K exports', tag: 'Slow' },
  { title: 'Festival jump cut', source: 'YouTube', author: 'mvnt picks', stat: '31K likes', tag: 'Live' },
  { title: 'Creator intro pack', source: 'SoundCloud', author: 'loop haus', stat: '12K forks', tag: 'Shorts' },
  { title: 'Arcade dancer', source: 'Upload', author: 'pixel crew', stat: '27K plays', tag: 'Meme' }
];

export const steps = [
  { title: 'Paste music', text: 'YouTube, SoundCloud, or a local filename. The demo stores only dummy text.' },
  { title: 'Pick a dancer', text: 'Choose a character, camera mood, and movement intensity before generation.' },
  { title: 'Preview motion', text: 'A 3D stage and timeline make the result feel real without a backend queue.' },
  { title: 'Export later', text: 'Download/API actions are mocked so backend wiring can be added after UX lock-in.' }
];

export const plans = [
  { name: 'Free', price: '$0', line: 'Try the flow', items: ['150 sec dummy credits', 'Community templates', 'Watermarked preview'] },
  { name: 'Creator', price: '$12', line: 'For short-form makers', items: ['More generations', 'HD preview exports', 'Private draft shelf'], featured: true },
  { name: 'Studio', price: '$29', line: 'For teams and pipelines', items: ['FBX/BVH handoff', 'API sandbox', 'Priority mock queue'] }
];

export const integrations = [
  { name: 'YouTube', text: 'Paste a link, detect chorus timing, generate a motion draft.' },
  { name: 'SoundCloud', text: 'Use track URL metadata and build dance variations for audio-first creators.' },
  { name: 'PWA', text: 'Install the studio shell and keep a mobile-friendly creator cockpit.' },
  { name: 'Analytics', text: 'GTM/GA placeholders are ready for funnel events after product validation.' }
];
