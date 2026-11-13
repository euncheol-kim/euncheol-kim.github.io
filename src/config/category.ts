// 카테고리 계층은 src/posts 폴더 구조를 따른다 : src/posts/{상위 카테고리}/{하위 카테고리}/{포스트}
// 이 파일은 상위 카테고리의 노출 순서와 표시 이름만 정의한다.
// 여기에 없는 상위 카테고리 폴더는 폴더명으로 표시 이름을 만들어 맨 뒤에 노출된다.
export const CATEGORY_GROUP_NAMES: Record<string, string> = {
  project: 'Project',
  error_handling: 'Error Handling',
  ai: 'AI',
  client: 'Client',
  server: 'Server',
  data_storage: 'Data Storage',
  deploy: 'Deploy',
  cs: 'CS',
  architecture: 'Architecture',
  design_pattern: 'Design Pattern',
  programming_language: 'Programming Language',
  skill_sheet: 'Skill Sheet',
  etc: 'Etc',
};

// 고정 상위 카테고리의 줄 구성. 각 배열이 카테고리 탭의 한 줄이며, 첫 줄은 All, 추천 뒤에 이어진다.
// 여기에 있는 카테고리는 포스트가 없어도 항상 노출되고, 없는 카테고리는 마지막 줄 뒤에 붙는다.
export const CATEGORY_GROUP_ROWS: string[][] = [
  ['project', 'error_handling', 'ai', 'client', 'server', 'data_storage', 'deploy'],
  ['cs', 'architecture', 'design_pattern', 'programming_language', 'skill_sheet'],
];

export const PINNED_CATEGORY_GROUPS = CATEGORY_GROUP_ROWS.flat();

// 하위 카테고리 표시 이름. 폴더명으로 만든 이름(dir_name -> Dir Name)이 어색할 때만 지정한다.
export const CATEGORY_PUBLIC_NAMES: Record<string, string> = {
  design_pattern: 'design pattern',
  fast_api: 'Fast API',
  hirecore: 'HireCore',
  skill_sheet: 'skill sheet',
};
