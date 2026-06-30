export const audioExtensions = /\.(mp3|wav|m4a|aac|flac|ogg|opus|aiff?|wma)$/i;
export const videoExtensions = /\.(mp4|webm|mov|m4v|avi|mkv)$/i;
export const imageExtensions = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

export function extractFirstUrl(text = '') {
  return text.match(/https?:\/\/[^\s<>()"']+/i)?.[0] || '';
}

export function getFileKind(file) {
  const name = file?.name || '';
  const type = file?.type || '';
  if (type.startsWith('audio/') || audioExtensions.test(name)) return 'audio';
  if (type.startsWith('video/') || videoExtensions.test(name)) return 'video';
  if (type.startsWith('image/') || imageExtensions.test(name)) return 'image';
  return 'document';
}

export function getFileMeta(file) {
  if (!file) return '';
  const size = typeof file.size === 'number' ? file.size : 0;
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const prettySize = size ? `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}` : 'local file';
  return [file.type || 'unknown type', prettySize].filter(Boolean).join(' · ');
}

export function getYouTubeId(rawValue = '') {
  const urlText = extractFirstUrl(rawValue) || rawValue;
  try {
    const url = new URL(urlText);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || '';
    if (host.endsWith('youtube.com')) {
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/').filter(Boolean)[1] || '';
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/').filter(Boolean)[1] || '';
      return url.searchParams.get('v') || '';
    }
  } catch {
    return '';
  }
  return '';
}

export function describeSource(source) {
  const label = source?.label || '';
  const url = extractFirstUrl(label);
  const lower = label.toLowerCase();

  if (source?.type === 'file') {
    const kind = getFileKind(source.file);
    return {
      kind,
      title: source.file?.name || label || 'Uploaded file',
      eyebrow: `${kind === 'document' ? '파일' : kind[0].toUpperCase() + kind.slice(1)} 업로드가 추가되었습니다.`,
      detail: getFileMeta(source.file),
      icon: kind === 'audio' ? 'Music2' : kind === 'video' ? 'Video' : kind === 'image' ? 'Image' : 'FileText'
    };
  }

  const youtubeId = getYouTubeId(label);
  if (youtubeId) {
    return {
      kind: 'youtube',
      title: 'YouTube',
      eyebrow: '영상 링크가 추가되었습니다.',
      detail: url || label,
      url: url || label,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      icon: 'Clapperboard'
    };
  }

  if (/soundcloud\.com/.test(lower)) {
    return {
      kind: 'soundcloud',
      title: 'SoundCloud',
      eyebrow: '오디오 링크가 추가되었습니다.',
      detail: url || label,
      url: url || label,
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url || label)}&color=%23ff8a00&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`,
      icon: 'AudioLines'
    };
  }

  if (/soundflare|soundflair/.test(lower)) {
    return {
      kind: 'dummy-audio',
      title: 'Soundflare',
      eyebrow: '임베드 대신 링크 카드로 표시합니다.',
      detail: url || label || 'Embed is not available yet, so MVNT will show a styled placeholder.',
      url: url || label,
      icon: 'AudioLines'
    };
  }

  if (url) {
    return {
      kind: 'link',
      title: new URL(url).hostname.replace(/^www\./, ''),
      eyebrow: '외부 링크가 추가되었습니다.',
      detail: url,
      url,
      icon: 'Link'
    };
  }

  return {
    kind: 'text',
    title: label || 'Music source',
    eyebrow: 'Manual input',
    detail: 'Paste a YouTube/SoundCloud link or upload a file for richer preview.',
    icon: 'Link',
    playable: false
  };
}

export async function fetchSourceMetadata(description) {
  if (!description?.url) return null;

  const readOembed = async (endpoint) => {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error(`oEmbed failed: ${response.status}`);
    return response.json();
  };

  try {
    if (description.kind === 'youtube') {
      const data = await readOembed(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(description.url)}`);
      return {
        title: data.title || description.title,
        name: data.author_name || 'YouTube',
        image: data.thumbnail_url || '',
        linkLabel: description.url
      };
    }

    if (description.kind === 'soundcloud') {
      const data = await readOembed(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(description.url)}`);
      return {
        title: data.title || description.title,
        name: data.author_name || 'SoundCloud',
        image: data.thumbnail_url || '',
        linkLabel: description.url
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function estimateTokenUse(source, mode) {
  if (!source) return 25;
  if (source.type === 'file') {
    const kind = getFileKind(source.file);
    if (kind === 'video') return 80;
    if (kind === 'audio') return 45;
    if (kind === 'image') return 30;
    return 20;
  }

  const text = source.label || '';
  if (/youtu\.be|youtube\.com/.test(text.toLowerCase())) return 55;
  if (/soundcloud\.com|soundflare|soundflair/.test(text.toLowerCase())) return 45;
  return mode === 'Audio' ? 35 : 25;
}

export function getMusicPayload(dataTransfer) {
  const itemFiles = Array.from(dataTransfer?.items || [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter(Boolean);
  const files = [...Array.from(dataTransfer?.files || []), ...itemFiles];
  const file = files[0];
  if (file) return { type: 'file', label: file.name, file };
  const uri = dataTransfer?.getData?.('text/uri-list')?.trim();
  if (uri) return { type: 'link', label: uri };
  const text = dataTransfer?.getData?.('text/plain')?.trim();
  if (text) return { type: 'link', label: text };
  return null;
}

export function inferModeFromSource(value, fallback = 'YouTube') {
  const text = typeof value === 'string' ? value : value?.label || value?.name || '';
  const lower = text.toLowerCase();
  if (/youtu\.be|youtube\.com/.test(lower)) return 'YouTube';
  if (/soundcloud\.com/.test(lower)) return 'SoundCloud';
  if (value?.type === 'file' || audioExtensions.test(lower) || lower.startsWith('blob:')) return 'Audio';
  return fallback;
}

export function hasDroppableMusic(event) {
  const types = Array.from(event.dataTransfer?.types || []);
  return types.includes('Files') || types.includes('text/uri-list') || types.includes('text/plain');
}
