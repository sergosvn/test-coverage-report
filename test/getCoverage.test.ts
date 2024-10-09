import {
  calculatePercentageAll,
  calculatePercentage,
  calculateCoverage,
} from '../src/getCoverage';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { ReportFile } from '../src/types';

// Mock fs and xml2js
jest.mock('fs');
jest.mock('xml2js');

describe('Coverage calculation functions', () => {
  const mockedReadFileSync = fs.readFileSync as jest.Mock;
  const mockedParseStringPromise = xml2js.Parser.prototype
    .parseStringPromise as jest.Mock;

  beforeEach(() => {
    mockedReadFileSync.mockClear();
    mockedParseStringPromise.mockClear();
  });

  describe('calculateCoverage', () => {
    it('should calculate the correct percentage from valid XML data', async () => {
      // Arrange
      const mockCloverFile = './coverage/clover.xml';
      const mockXmlData = '<xml>mocked data</xml>';
      const mockXmlResult = {
        coverage: {
          project: [
            {
              metrics: [
                {
                  $: {
                    statements: '100',
                    coveredstatements: '75',
                  },
                },
              ],
            },
          ],
        },
      };

      mockedReadFileSync.mockReturnValue(mockXmlData);
      mockedParseStringPromise.mockResolvedValue(mockXmlResult);

      // Act
      const coveragePercentage = await calculateCoverage(mockCloverFile);

      // Assert
      expect(mockedReadFileSync).toHaveBeenCalledWith(mockCloverFile, 'utf-8');
      expect(mockedParseStringPromise).toHaveBeenCalledWith(mockXmlData);
      expect(coveragePercentage).toBe(75); // 75% coverage
    });

    it('should calculate the correct percentage from non valid XML data', async () => {
      // Arrange
      const mockCloverFile = './coverage/clover.xml';
      const mockXmlData = '<xml>mocked data</xml>';
      const mockXmlResult = {
        coverage: {
          project: [
            {
              metrics: [
                {
                  $: {},
                },
              ],
            },
          ],
        },
      };

      mockedReadFileSync.mockReturnValue(mockXmlData);
      mockedParseStringPromise.mockResolvedValue(mockXmlResult);

      // Act
      const coveragePercentage = await calculateCoverage(mockCloverFile);

      // Assert
      expect(mockedReadFileSync).toHaveBeenCalledWith(mockCloverFile, 'utf-8');
      expect(mockedParseStringPromise).toHaveBeenCalledWith(mockXmlData);
      expect(coveragePercentage).toBe(0); // 75% coverage
    });

    it('should return 0 if there are no statements in the XML data', async () => {
      // Arrange
      const mockCloverFile = './coverage/clover.xml';
      const mockXmlData = '<xml>mocked data</xml>';
      const mockXmlResult = {
        coverage: {
          project: [
            {
              metrics: [
                {
                  $: {
                    statements: '0',
                    coveredstatements: '0',
                  },
                },
              ],
            },
          ],
        },
      };

      mockedReadFileSync.mockReturnValue(mockXmlData);
      mockedParseStringPromise.mockResolvedValue(mockXmlResult);

      // Act
      const coveragePercentage = await calculateCoverage(mockCloverFile);

      // Assert
      expect(coveragePercentage).toBe(0); // No statements, so coverage is 0%
    });
  });

  describe('calculatePercentage', () => {
    it('should update the reportFile with the correct percentage', async () => {
      // Arrange
      const mockReportFile: ReportFile = { path: './coverage/clover.xml', percentage: 0 };
      const mockXmlData = '<xml>mocked data</xml>';
      const mockXmlResult = {
        coverage: {
          project: [
            {
              metrics: [
                {
                  $: {
                    statements: '200',
                    coveredstatements: '150',
                  },
                },
              ],
            },
          ],
        },
      };

      mockedReadFileSync.mockReturnValue(mockXmlData);
      mockedParseStringPromise.mockResolvedValue(mockXmlResult);

      // Act
      const updatedReportFile = await calculatePercentage(mockReportFile);

      // Assert
      expect(updatedReportFile.percentage).toBe(75); // 150/200 = 75%
    });
  });

  describe('calculatePercentageAll', () => {
    it('should calculate the percentage for all ReportFile entries', async () => {
      // Arrange
      const mockReportFiles: ReportFile[] = [
        { path: './coverage/clover1.xml', percentage: 0 },
        { path: './coverage/clover2.xml', percentage: 0 },
      ];
      const mockXmlData1 = '<xml>mocked data for file 1</xml>';
      const mockXmlData2 = '<xml>mocked data for file 2</xml>';
      const mockXmlResult1 = {
        coverage: {
          project: [
            {
              metrics: [
                {
                  $: {
                    statements: '100',
                    coveredstatements: '80',
                  },
                },
              ],
            },
          ],
        },
      };
      const mockXmlResult2 = {
        coverage: {
          project: [
            {
              metrics: [
                {
                  $: {
                    statements: '200',
                    coveredstatements: '100',
                  },
                },
              ],
            },
          ],
        },
      };

      mockedReadFileSync
        .mockReturnValueOnce(mockXmlData1)
        .mockReturnValueOnce(mockXmlData2);
      mockedParseStringPromise
        .mockResolvedValueOnce(mockXmlResult1)
        .mockResolvedValueOnce(mockXmlResult2);

      // Act
      const updatedReportFiles = await calculatePercentageAll(mockReportFiles);

      // Assert
      expect(updatedReportFiles).toEqual([
        { path: './coverage/clover1.xml', percentage: 80 }, // 80/100 = 80%
        { path: './coverage/clover2.xml', percentage: 50 }, // 100/200 = 50%
      ]);
    });
  });
});
