// 카테고리 계층은 src/posts 폴더 구조를 따른다 : src/posts/{상위 카테고리}/{하위 카테고리}/{포스트}
// 이 파일은 상위 카테고리의 노출 순서와 표시 이름만 정의한다.
// 여기에 없는 상위 카테고리 폴더는 폴더명으로 표시 이름을 만들어 맨 뒤에 노출된다.
export const CATEGORY_GROUP_NAMES: Record<string, string> = {
  project: 'Project',
  error_handling: 'Error Handling',
  client: 'Client',
  backend: 'Backend',
  cs: 'CS',
  programming_language: 'Programming Language',
  skill_sheet: 'Skill Sheet',
  etc: 'Etc',
};

// 고정 상위 카테고리. All, 추천 바로 뒤에 이 순서로 노출되며, 포스트가 없어도 항상 노출된다.
export const PINNED_CATEGORY_GROUPS = ['project', 'error_handling', 'client', 'backend'];

// 하위 카테고리 표시 이름. 폴더명으로 만든 이름(dir_name -> Dir Name)이 어색할 때만 지정한다.
export const CATEGORY_PUBLIC_NAMES: Record<string, string> = {
  fast_api: 'Fast API',
  hirecore: 'HireCore',
};
