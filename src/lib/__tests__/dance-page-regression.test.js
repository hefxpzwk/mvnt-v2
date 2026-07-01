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
  assert.match(source, /const \[timelineContextMenu, setTimelineContextMenu\]/);
  assert.match(source, /const \[draggingPlayhead, setDraggingPlayhead\]/);
  assert.match(source, /moveTimelinePlayhead/);
  assert.match(source, /startPlayheadDrag/);
  assert.match(source, /dragPlayhead/);
  assert.match(source, /updateTransportPlayhead/);
  assert.match(source, /className="dance-transport-bar"/);
  assert.match(source, /aria-label="재생 위치"/);
  assert.match(source, /aria-label="타임라인 확대 축소"/);
  assert.match(source, /const timelineDuration = 300/);
  assert.match(source, /timelineTicks = \[0, 60, 120, 180, 240, 300\]/);
  assert.match(source, /const \[timelineTracks, setTimelineTracks\]/);
  assert.match(source, /label: '배경'/);
  assert.match(source, /label: '춤'/);
  assert.match(source, /deleteTimelineItem/);
  assert.match(source, /startTimelineItemDrag/);
  assert.match(source, /dragTimelineItem/);
  assert.match(source, /moveTimelineItem/);
  assert.match(source, /openTimelineContextMenu/);
  assert.match(source, /runTimelineContextAction/);
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
  assert.match(styles, /touch-action: none;/);
  assert.match(styles, /cursor: grab;/);
  assert.match(styles, /\.dance-timeline-context-menu/);
  assert.match(styles, /\.dance-timeline-delete/);
});

test('Dance edit panel has timeline and prompt genre modes', () => {
  const source = readFileSync(new URL('../../main.jsx', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../../index.css', import.meta.url), 'utf8');

  assert.match(source, /const \[danceEditorMode, setDanceEditorMode\]/);
  assert.match(source, /const \[dancePrompt, setDancePrompt\]/);
  assert.match(source, /const \[selectedDanceGenre, setSelectedDanceGenre\]/);
  assert.match(source, /타임라인 편집/);
  assert.match(source, /프롬프트 · 장르/);
  assert.match(source, /danceGenreOptions/);
  assert.match(source, /춤 프롬프트/);
  assert.match(styles, /\.dance-editor-modebar/);
  assert.match(styles, /\.dance-prompt-editor/);
  assert.match(styles, /\.dance-genre-grid/);
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
  assert.match(source, /트래킹 \{tracking \? 'ON' : 'OFF'\}/);
  assert.match(source, /new THREE\.SkeletonHelper\(model\)/);
  assert.match(source, /스켈레톤 \{skeleton \? 'ON' : 'OFF'\}/);
  assert.match(source, /window\.localStorage\?\.setItem\('mvnt-dance-saved-preview'/);
  assert.match(source, /link\.download = 'mvnt-dance-preview\.png'/);
  assert.match(source, /preserveDrawingBuffer: true/);
  assert.match(styles, /\.three-dance-tool-button/);
  assert.match(styles, /\.three-dance-status/);
});
