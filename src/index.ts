import * as core from '@actions/core';
import { main } from './main';
import { ReportFile } from './types';

export const run = (): void => {
  main()
    .then((files: ReportFile[]) => {
      if (!files.length) {
        core.info('files not found.\n');
      } else {
        core.info(`files:\n ${files.map((file) => file.path).join('\n')}\n`);
      }
      core.info('success.');
    })
    .catch((err) => {
      core.error(`exception. ${err.message}`);
    });
};

run();
