import * as core from '@actions/core';
import { main } from './main';

export const run = (): void => {
  main()
    .then(() => {
      core.info('success');
    })
    .catch((err) => {
      core.error(`exception. ${err.message}`);
    });
};

run();
