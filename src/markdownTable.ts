import { ReportFile } from './types';

export const markdownTable = (reportFiles: ReportFile[]): string => {
  let markdown = markdownTableRow('File', 'Coverage');
  markdown += markdownTableRow(':---', '---:');
  reportFiles.map((reportFile: ReportFile) => {
    const printablePercentage = reportFile?.percentage
      ? `${Math.round((reportFile?.percentage + Number.EPSILON) * 100) / 100}%`
      : 'N/A';
    markdown += markdownTableRow(reportFile.path, printablePercentage);
  });

  return markdown;
};

export const markdownTableRow = (...values: (string | number)[]): string => {
  return `| ${values.join(' | ')} |\n`;
};
