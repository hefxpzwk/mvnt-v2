export const communityVideos = [
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

export const communityTags = ['All', 'Trending', 'K-pop', 'Street', 'Loop', 'Ballad'];

export function getCommunityVideoTags(video, index) {
  const text = `${video.title} ${video.creator}`.toLowerCase();
  const tags = ['All'];
  if (index < 8 || /trend|popular|pick/i.test(text)) tags.push('Trending');
  if (/blackpink|k-pop|kpop|hook|golden|pop/i.test(text)) tags.push('K-pop');
  if (/street|krapow|arcade|chrome|bboy|shuffle/i.test(text)) tags.push('Street');
  if (/loop|pack|studio|draft|test/i.test(text)) tags.push('Loop');
  if (/ballad|slow|reason|soft|silhouette/i.test(text)) tags.push('Ballad');
  return tags;
}

export function filterCommunityVideos({ activeTag, query }) {
  const normalizedQuery = query.trim().toLowerCase();
  return communityVideos.filter((video, index) => {
    const searchText = `${video.title} ${video.creator}`.toLowerCase();
    const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery);
    const matchesTag = getCommunityVideoTags(video, index).includes(activeTag);
    return matchesQuery && matchesTag;
  });
}
