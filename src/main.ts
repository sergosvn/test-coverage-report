import { ReportFile } from './types';
import { buildBody, commentCoverage } from './commentCoverage';
import * as core from '@actions/core';
import { calculatePercentageAll } from './getCoverage';
import { getEventInfo } from './eventInfo';
import { findFiles } from './getFiles';

export const main = async (): Promise<ReportFile[]> => {
  try {
    const eventInfo = getEventInfo();

    const calculatedFiles = await calculatePercentageAll(findFiles(eventInfo.cloverPath));

    await commentCoverage(eventInfo, buildBody(eventInfo, calculatedFiles));

    return calculatedFiles;
  } catch (error) {
    core.setFailed(error.message);
  }

  return [];
};
