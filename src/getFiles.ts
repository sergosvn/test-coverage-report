import { ReportFile } from './types';
import * as fs from 'fs';
import * as path from 'path';

export const findFiles = (pathName: string): ReportFile[] => {
  const regexPattern =
    /(?<serviceName>[a-z0-9]+[-[a-z0-9]+]?)-(?<testType>behat|phpunit)-coverage\.xml/;
  const result: ReportFile[] = [];
  fs.readdirSync(pathName).forEach((file): void => {
    const matches = regexPattern.exec(file);
    if (!matches) {
      return;
    }

    result.push({
      path: path.join(pathName, file),
      serviceName: matches?.groups?.serviceName,
      testType: matches?.groups?.testType,
    } as ReportFile);
  });

  return result;
};
