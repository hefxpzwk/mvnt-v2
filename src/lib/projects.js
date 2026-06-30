import { communityVideos } from './community.js';

const workTitles = [
  'BLACKPINK GO hook motion',
  'Milkshake groove builder',
  'Krapow street draft',
  'Golden chorus loop',
  'Life is Reason slow wave',
  'Hail Mary floor sequence',
  'Neon pop routine',
  'Studio groove 01',
  'Arcade shuffle test',
  'Soft light choreo',
  'Creator loop pack',
  'Night stage cut'
];
const workKinds = ['AI 생성', '리믹스', 'AI 생성', 'AI 생성', '리믹스', 'AI 생성', '리믹스', 'AI 생성', '리믹스', 'AI 생성', '리믹스', 'AI 생성'];
const workVisibility = ['비공개', '비공개', '비공개', '비공개', '공개', '비공개', '공개', '비공개', '비공개', '공개', '비공개', '공개'];
const workActions = ['계속 제작', '수정하기', '진행 보기', '제작 시작', '수정하기', '내보내기', '수정하기', '계속 제작', '내보내기', '제작 시작', '계속 제작', '내보내기'];
const workSources = ['YouTube', 'Audio', 'YouTube', 'SoundCloud', 'Upload', 'YouTube', 'Audio', 'Upload', 'YouTube', 'SoundCloud', 'Audio', 'YouTube'];
const workLengths = ['0:18', '0:14', '0:21', '0:09', '0:24', '0:16', '0:12', '0:20', '0:11', '0:28', '0:13', '0:19'];
const workUpdatedAt = ['방금 전', '오늘', '오늘', '어제', '2일 전', '3일 전', '지난주', '지난주', '2주 전', '2주 전', '3주 전', '3주 전'];
const workStyles = ['K-pop Hook', 'Groove', 'Street', 'Loop', 'Slow Wave', 'Floor', 'Pop', 'Studio', 'Shuffle', 'Choreo', 'Loop', 'Stage'];

export const projectFilters = ['전체', 'AI 생성', '리믹스'];

export const projectWorks = communityVideos.slice(0, 12).map((video, index) => ({
  ...video,
  workTitle: workTitles[index],
  kind: workKinds[index],
  visibility: workVisibility[index],
  action: workActions[index],
  source: workSources[index],
  length: workLengths[index],
  updated: workUpdatedAt[index],
  style: workStyles[index]
}));
