import { EventInfo, ReportFile } from './types';
import { buildBody, commentCoverage } from './commentCoverage';
import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { calculateCoverage } from './getCoverage';
import { getEventInfo } from './eventInfo';

export const main = async (): Promise<void> => {
  try {
    const eventInfo: EventInfo = getEventInfo();
    const files = findFiles(eventInfo.cloverPath);

    const calculatedFiles = await calculatePercentageAll(files);
    const commentBody = buildBody(eventInfo, calculatedFiles);

    await commentCoverage(eventInfo, commentBody);
  } catch (error) {
    core.setFailed(error.message);
  }
};

const calculatePercentageAll = async (arr: ReportFile[]): Promise<ReportFile[]> => {
  const promises = arr.map((reportFile: ReportFile) => calculatePercentage(reportFile));

  return Promise.all(promises);
};

const calculatePercentage = async (reportFile: ReportFile): Promise<ReportFile> => {
  reportFile.percentage = await calculateCoverage(reportFile.path);

  return reportFile;
};

const findFiles = (pathName: string): ReportFile[] => {
  const regexPattern =
    /(?<serviceName>[a-z]+[-[a-z]+]?)-(?<testType>behat|phpunit)-coverage\.xml/;
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
