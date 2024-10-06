import { calculateCoverage } from '../src/getCoverage';
import * as fs from 'fs';
import * as xml2js from 'xml2js';

// Mock fs and xml2js modules
jest.mock('fs');
jest.mock('xml2js');

describe('calculateCoverage', () => {
  const mockXmlData = `
    <coverage>
      <project>
        <metrics statements="100" coveredstatements="80" />
      </project>
    </coverage>
  `;

  const mockParseResult = {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate coverage correctly for valid data', async () => {
    // Mock fs.readFileSync to return the mock XML data
    (fs.readFileSync as jest.Mock).mockReturnValue(mockXmlData);

    // Mock xml2js.Parser().parseStringPromise to resolve with the mock parsed object
    (xml2js.Parser.prototype.parseStringPromise as jest.Mock).mockResolvedValue(mockParseResult);

    // Call the function and check the result
    const result = await calculateCoverage('clover.xml');
    expect(result).toBe(80); // 80% coverage (80/100 * 100)
  });

  it('should calculate coverage correctly when valid metrics data is present', async () => {
    // Mock valid XML data with proper metrics
    const validMetricsResult = {
      coverage: {
        project: [
          {
            metrics: [
              {
                $: {
                  statements: '200',       // Total statements
                  coveredstatements: '150', // Covered statements
                },
              },
            ],
          },
        ],
      },
    };

    // Mock fs.readFileSync to return the mock XML data
    (fs.readFileSync as jest.Mock).mockReturnValue('<mock-xml>');

    // Mock xml2js.Parser().parseStringPromise to resolve with valid metrics result
    (xml2js.Parser.prototype.parseStringPromise as jest.Mock).mockResolvedValue(validMetricsResult);

    // Call the function and check the result
    const result = await calculateCoverage('clover.xml');

    // The expected result should be (150 / 200) * 100 = 75%
    expect(result).toBe(75);
  });

  it('should return 0.0 if total statements are zero', async () => {
    // Mock XML data where statements are zero
    const zeroStatementsResult = {
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

    // Mock fs.readFileSync and parseStringPromise
    (fs.readFileSync as jest.Mock).mockReturnValue(mockXmlData);
    (xml2js.Parser.prototype.parseStringPromise as jest.Mock).mockResolvedValue(zeroStatementsResult);

    // Call the function and expect coverage to be 0
    const result = await calculateCoverage('clover.xml');
    expect(result).toBe(0.0);
  });

  it('should handle missing metrics data gracefully', async () => {
    // Mock XML without the metrics data
    const missingMetricsResult = {
      coverage: {
        project: [{}], // Missing metrics
      },
    };

    // Mock fs.readFileSync and parseStringPromise
    (fs.readFileSync as jest.Mock).mockReturnValue(mockXmlData);
    (xml2js.Parser.prototype.parseStringPromise as jest.Mock).mockResolvedValue(missingMetricsResult);

    // Call the function and expect coverage to be 0
    const result = await calculateCoverage('clover.xml');
    expect(result).toBe(0.0);
  });

  it('should throw an error if XML parsing fails', async () => {
    // Mock fs.readFileSync and force parseStringPromise to reject with an error
    (fs.readFileSync as jest.Mock).mockReturnValue(mockXmlData);
    (xml2js.Parser.prototype.parseStringPromise as jest.Mock).mockRejectedValue(new Error('XML parsing error'));

    // Use try-catch to verify if an error is thrown
    await expect(calculateCoverage('clover.xml')).rejects.toThrow('XML parsing error');
  });
});
