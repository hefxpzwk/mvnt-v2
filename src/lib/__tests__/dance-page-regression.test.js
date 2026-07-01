import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Dance bottom bar icons are imported before rendering the page', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');

  assert.match(source, /ChevronUp,/);
  assert.match(source, /<ChevronUp\b/);
  assert.match(source, /className="dance-bottom-bar-handle"/);
});

test('Dance status messages render as temporary top-center toasts', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /const \[danceToast, setDanceToast\]/);
  assert.match(source, /setTimeout\(\(\) => setDanceToast\(null\), 2400\)/);
  assert.match(source, /<span>\{danceToast\}<\/span>/);
  assert.match(styles, /\.dance-active-template\s*\{[^}]*top: 22px;/s);
  assert.match(styles, /@keyframes dance-toast-pop/);
});

test('Dance edit panel shrinks the 3D stage when opened', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /dance-page[^`]*\$\{bottomBarOpen \? 'is-editing-open' : ''\}/);
  assert.match(source, /aria-label="댄스 편집 하단 바"/);
  assert.doesNotMatch(source, /Dance Timeline/);
  assert.match(styles, /\.dance-page\.is-editing-open \.dance-stage\s*\{[^}]*height: calc\(100% - var\(--dance-editor-open-height\)\);/s);
  assert.match(styles, /\.dance-bottom-bar\s*\{[^}]*height: var\(--dance-editor-open-height\);/s);
  assert.match(styles, /\.dance-bottom-bar-panel\s*\{[^}]*width: 100%;[^}]*height: 100%;/s);
  assert.match(source, /편집 패널 닫기/);
  assert.match(source, /편집 패널 열기/);
  assert.match(styles, /\.dance-bottom-bar-handle\s*\{[^}]*position: absolute;[^}]*width: 76px;[^}]*min-height: 34px;/s);
  assert.match(styles, /\.dance-bottom-bar\s*\{[^}]*grid-template-rows: minmax\(0, 1fr\);/s);
});

test('Dance edit panel exposes selectable and removable background and dance clips', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /const \[selectedTimelineItem, setSelectedTimelineItem\]/);
  assert.match(source, /const \[timelinePlayhead, setTimelinePlayhead\]/);
  assert.match(source, /const \[timelinePlaying, setTimelinePlaying\]/);
  assert.match(source, /const \[timelineZoom, setTimelineZoom\]/);
  assert.match(source, /const \[draggingTimelineItem, setDraggingTimelineItem\]/);
  assert.match(source, /draggingTimelineItemRef/);
  assert.match(source, /const \[timelineContextMenu, setTimelineContextMenu\]/);
  assert.match(source, /const \[draggingPlayhead, setDraggingPlayhead\]/);
  assert.match(source, /moveTimelinePlayhead/);
  assert.match(source, /startPlayheadDrag/);
  assert.match(source, /event\.currentTarget\.setPointerCapture/);
  assert.match(source, /dragPlayhead/);
  assert.match(source, /updateTransportPlayhead/);
  assert.match(source, /className="dance-transport-bar"/);
  assert.match(source, /aria-label="재생 위치"/);
  assert.match(source, /aria-label="타임라인 확대 축소"/);
  assert.match(source, /const timelineDuration = 300/);
  assert.match(source, /timelineTicks = \[0, 60, 120, 180, 240, 300\]/);
  assert.match(source, /const \[timelineTracks, setTimelineTracks\]/);
  assert.match(source, /label: '배경'/);
  assert.match(source, /label: '캐릭터'/);
  assert.match(source, /icon: UserRound/);
  assert.match(source, /label: '춤'/);
  assert.match(source, /deleteTimelineItem/);
  assert.match(source, /startTimelineItemDrag/);
  assert.match(source, /captureElement\.closest\('\.dance-timeline-content'\)/);
  assert.match(source, /event\.button !== 0/);
  assert.match(source, /dragTimelineItem/);
  assert.match(source, /handleTimelineClipPointerDown/);
  assert.match(source, /onPointerMove=\{dragTimelineItem\}/);
  assert.match(source, /findTimelineItem/);
  assert.match(source, /moveTimelineItem/);
  assert.match(source, /openTimelineContextMenu/);
  assert.match(source, /handleTimelineClipContextMenu/);
  assert.match(source, /data-timeline-item-id=\{item.id\}/);
  assert.match(source, /runTimelineContextAction/);
  assert.match(source, /createPortal\(/);
  assert.match(source, /document\.body/);
  assert.match(source, />Cut<|>Cut<\/button>/);
  assert.match(source, />Delete<|>Delete<\/button>/);
  assert.match(source, />Copy<|>Copy<\/button>/);
  assert.match(source, />Edit<|>Edit<\/button>/);
  assert.match(source, /className="dance-timeline-shell"/);
  assert.match(source, /className="dance-timeline-content"/);
  assert.match(source, /Math\.max\(100, timelineZoom \* 180\)/);
  assert.match(source, /className=\{`dance-timeline-clip/);
  assert.match(styles, /\.dance-timeline-track\s*\{/);
  assert.match(styles, /\.dance-timeline-zoom/);
  assert.match(styles, /\.dance-timeline-shell\s*\{[^}]*overflow-x: auto;/s);
  assert.match(styles, /\.dance-timeline-content\s*\{/);
  assert.match(styles, /\.dance-transport-bar\s*\{[^}]*transform: translateY\(-100%\);/s);
  assert.match(styles, /\.dance-bottom-bar-handle\s*\{[^}]*calc\(-100% - 36px\)/s);
  assert.match(styles, /--timeline-playhead-progress/);
  assert.match(styles, /border-radius: 999px;/);
  assert.match(styles, /\.dance-timeline-clip\.is-selected/);
  assert.match(styles, /\.dance-timeline-track-label\s*\{[^}]*position: sticky;[^}]*left: 0;/s);
  assert.match(styles, /\.dance-timeline-content::before\s*\{[^}]*position: sticky;[^}]*left: 0;[^}]*grid-row: 1 \/ -1;[^}]*background: #050505;/s);
  assert.match(styles, /\.dance-timeline-ruler::before\s*\{[^}]*position: sticky;[^}]*left: 0;[^}]*background: #050505;/s);
  assert.match(styles, /\.dance-timeline-tracks\s*\{[^}]*z-index: auto;[^}]*overflow: visible;/s);
  assert.match(styles, /\.dance-timeline-playhead\s*\{[^}]*z-index: 10;[^}]*cursor: ew-resize;/s);
  assert.match(styles, /\.dance-timeline-content::before\s*\{[^}]*z-index: 11;/s);
  assert.match(styles, /\.dance-timeline-playhead::after\s*\{[^}]*left: -10px;[^}]*width: 22px;/s);
  assert.match(styles, /\.dance-timeline-track-label span/);
  assert.match(styles, /white-space: nowrap/);
  assert.match(styles, /touch-action: none;/);
  assert.match(styles, /cursor: grab;/);
  assert.match(styles, /is-dragging/);
  assert.match(styles, /\.dance-timeline-context-menu/);
  assert.match(styles, /z-index: 9999/);
  assert.match(styles, /\.dance-timeline-clip\.is-character/);
  assert.match(styles, /\.dance-timeline-delete/);
});

test('Dance edit panel has timeline and character edit modes', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /const \[danceEditorMode, setDanceEditorMode\]/);
  assert.match(source, /const \[characterName, setCharacterName\]/);
  assert.match(source, /const \[characterPrompt, setCharacterPrompt\]/);
  assert.match(source, /const \[characterImagePreview, setCharacterImagePreview\]/);
  assert.match(source, /타임라인 편집/);
  assert.match(source, /캐릭터 편집/);
  assert.doesNotMatch(source, /dance-character-preview-card/);
  assert.doesNotMatch(source, /dance-character-identity-card/);
  assert.doesNotMatch(source, /dance-character-main-options/);
  assert.doesNotMatch(source, /dance-character-name-field/);
  assert.match(source, /캐릭터 수정 적용/);
  assert.match(source, /danceEditorMode === 'timeline' &&/);
  assert.match(source, /메인 캐릭터/);
  assert.match(source, /사진 붙여넣기 · 드래그 · 업로드/);
  assert.doesNotMatch(source, />프롬프트로 캐릭터 만들기</);
  assert.doesNotMatch(source, /createCharacterFromPrompt/);
  assert.match(source, /handleCharacterDrop/);
  assert.match(source, /handleCharacterPaste/);
  assert.match(source, /handleCharacterUpload/);
  assert.doesNotMatch(source, /춤 프롬프트/);
  assert.doesNotMatch(source, /프롬프트 · 장르/);
  assert.match(styles, /\.dance-editor-modebar/);
  assert.match(styles, /\.dance-character-editor/);
  assert.doesNotMatch(styles, /\.dance-character-preview-card/);
  assert.doesNotMatch(styles, /\.dance-character-identity-card/);
  assert.doesNotMatch(styles, /\.dance-character-main-options/);
  assert.doesNotMatch(styles, /\.dance-character-name-field/);
  assert.doesNotMatch(styles, /\.dance-character-option-grid/);
  assert.match(styles, /\.dance-character-source-drop/);
  assert.match(styles, /\.dance-character-prompt-box/);
  assert.match(styles, /background: rgba\(5, 5, 5, \.96\);/);
  assert.doesNotMatch(styles, /\.dance-character-editor\s*\{[^}]*linear-gradient/s);
});


test('Dance project picker footer shows selected music like template picker', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /className="dance-project-selected-track"/);
  assert.match(source, /selectedProject\.workTitle/);
  assert.match(source, /selectedProject\.source\} · \{selectedProject\.style\}/);
  assert.match(source, /선택한 음악과 작업 정보가 여기에 표시됩니다/);
  assert.match(styles, /\.dance-project-selected-track/);
  assert.match(styles, /\.dance-project-track-art/);
});

test('Dance 3D scene exposes tracking skeleton save and download tools', () => {
  const source = readFileSync(new URL('../../components/ThreeDanceScene.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /className=\"three-dance-camera-panel\"/);
  assert.match(source, /aria-label=\"춤 보기 도구\"/);
  assert.match(source, /<span>트래킹<\/span>/);
  assert.match(source, /three-dance-tool-state">\{tracking \? 'ON' : 'OFF'\}/);
  assert.match(source, /const toggleTracking = \(\) =>/);
  assert.match(source, /if \(!current\) resetSceneCameraRef\.current\(\)/);
  assert.match(source, /controls\.enabled = !trackingRef\.current/);
  assert.match(source, /camera\.position\.lerp\(defaultCameraPosition/);
  assert.match(source, /controls\.target\.lerp\(defaultCameraTarget/);
  assert.match(source, /new THREE\.SkeletonHelper\(model\)/);
  assert.match(source, /<span>스켈레톤<\/span>/);
  assert.match(source, /three-dance-tool-state">\{skeleton \? 'ON' : 'OFF'\}/);
  assert.match(source, /danceBackgroundThemes/);
  assert.match(source, /changeBackgroundTheme/);
  assert.match(source, /<span>배경<\/span>/);
  assert.match(source, /style=\{\{ backgroundColor: backgroundTheme\.swatch \}\}/);
  assert.match(source, /scene\.background = new THREE\.Color\(theme\.scene\)/);
  assert.match(source, /floor\.material\.color\.setHex\(theme\.floor\)/);
  assert.match(source, /window\.localStorage\?\.setItem\('mvnt-dance-saved-preview'/);
  assert.match(source, /link\.download = 'mvnt-dance-preview\.png'/);
  assert.match(source, /preserveDrawingBuffer: true/);
  assert.match(styles, /top: 24px;/);
  assert.match(styles, /background: rgba\(5, 5, 5, \.72\);/);
  assert.match(styles, /\.three-dance-tool-section/);
  assert.match(styles, /\.three-dance-tool-button/);
  assert.match(styles, /\.three-dance-color-swatch/);
  assert.match(styles, /\.three-dance-status/);
});


test('Dance start overlay highlights the Dance word with the shared rainbow gradient', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /className="dance-choice-gradient-word">댄스<\/span>를 어떻게 시작할까요\?/);
  assert.match(styles, /\.dance-choice-gradient-word\s*\{/);
  assert.match(styles, /linear-gradient\(100deg, var\(--color-mvnt-orange\)/);
  assert.match(styles, /#8b2cff/);
  const gradientRule = styles.match(/\.dance-choice-gradient-word\s*\{[^}]*\}/s)?.[0] || '';
  assert.doesNotMatch(gradientRule, /animation:/);
});


test('Dance edit panel includes a general tab for song prompt and dance generation', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /const \[generalSong, setGeneralSong\] = useState\('https:\/\/www\.youtube\.com\/watch\?v=JAldG0a6Lvo'\)/);
  assert.match(source, /const \[generalPrompt, setGeneralPrompt\] = useState\('강한 그루브에 맞춘 K-pop 스타일 포인트 안무'\)/);
  assert.match(source, /const \[generalSongMetadata, setGeneralSongMetadata\]/);
  assert.match(source, />일반<\/button>/);
  assert.match(source, /danceEditorMode === 'general'/);
  assert.match(source, /className="dance-general-editor"/);
  assert.match(source, /const generalSongDescription = generalSong\.trim\(\) \? describeSource/);
  assert.doesNotMatch(source, /placeholder="노래 링크, 제목, 파일명을 입력하세요"/);
  assert.match(source, /fetchSourceMetadata\(generalSongDescription\)/);
  assert.match(source, />노래<\/span>/);
  assert.match(source, /className="dance-general-music-preview"/);
  assert.match(source, /<MusicSourceEmbedPreview description=\{generalSongDescription\} metadata=\{generalSongMetadata\}/);
  assert.match(source, />기본 프롬프트<\/span>/);
  assert.match(source, /className="dance-general-field is-prompt"[\s\S]*>춤 생성<\/button>/);
  assert.match(source, /generateGeneralDance/);
  assert.match(styles, /\.dance-general-editor/);
  assert.match(styles, /\.dance-general-music-preview/);
  assert.match(styles, /\.dance-general-generate/);
});
