import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { ReportFile } from './types';

export const calculatePercentageAll = async (
  arr: ReportFile[],
): Promise<ReportFile[]> => {
  const promises = arr.map((reportFile: ReportFile) => calculatePercentage(reportFile));

  return Promise.all(promises);
};

export const calculatePercentage = async (
  reportFile: ReportFile,
): Promise<ReportFile> => {
  reportFile.percentage = await calculateCoverage(reportFile.path);

  return reportFile;
};

// Function to calculate coverage from clover.xml
export const calculateCoverage = async (cloverFile: string): Promise<number> => {
  // Read the clover.xml file
  const xmlData = fs.readFileSync(cloverFile, 'utf-8');

  // Parse the XML data
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xmlData);

  // Initialize totals
  let totalStatements = 0;
  let coveredStatements = 0;

  if (result?.coverage?.project && result.coverage.project[0]?.metrics) {
    const metrics = result.coverage.project[0].metrics[0];
    totalStatements += parseInt(metrics?.$?.statements ?? '0', 10);
    coveredStatements += parseInt(metrics?.$?.coveredstatements ?? '0', 10);
  }

  // Calculate coverage percentage
  if (totalStatements === 0) {
    return 0.0; // Avoid division by zero
  }

  return (coveredStatements / totalStatements) * 100;
};
