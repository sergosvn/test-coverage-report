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

export interface ReportFile {
  path: string;
  testType?: string;
  serviceName?: string;
  percentage?: number;
}
