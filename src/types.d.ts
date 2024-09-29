export interface CoverageTypeInfo {
  cobertura: CoverInfo[];
  clover: CoverInfo[];
  lcov: CoverInfo[];
  jacoco: CoverInfo[];
  junit: Junit | undefined;
}

export interface EventInfo {
  token: string;
  commentTitle: string;
  owner: string;
  repo: string;
  cloverPath: string;
  overrideComment: boolean;
  commentId: string;
  commitSha: string;
  headRef: string;
  baseRef: string;
  pwd: string;
}

export interface FilesStatus {
  all: string[];
  added: string[];
  removed: string[];
  modified: string[];
  renamed: string[];
  copied: string[];
  changed: string[];
  unchanged: string[];
}

export interface ReportFile {
  path: string;
  testType?: string;
  serviceName?: string;
  percentage?: number;
}
