import { markdownTable, markdownTableRow } from '../src/markdownTable';
import { ReportFile } from '../src/types';

describe('markdownTable', () => {
  it('should generate a correct markdown table with file paths and coverage percentages', () => {
    // Arrange
    const reportFiles: ReportFile[] = [
      { path: 'service1-behat-coverage.xml', percentage: 85.5555 },
      { path: 'service2-phpunit-coverage.xml', percentage: 90.12 },
      { path: 'service3-coverage.xml', percentage: 95 },
    ];

    // Act
    const result = markdownTable(reportFiles);

    // Assert
    const expectedOutput =
      `| File | Coverage |\n` +
      `| :--- | ---: |\n` +
      `| service1-behat-coverage.xml | 85.56% |\n` +
      `| service2-phpunit-coverage.xml | 90.12% |\n` +
      `| service3-coverage.xml | 95% |\n`;

    expect(result).toBe(expectedOutput);
  });

  it('should display "N/A" for files without a percentage', () => {
    // Arrange
    const reportFiles: ReportFile[] = [
      { path: 'service1-behat-coverage.xml', percentage: undefined },
      { path: 'service2-phpunit-coverage.xml', percentage: 88.9876 },
    ];

    // Act
    const result = markdownTable(reportFiles);

    // Assert
    const expectedOutput =
      `| File | Coverage |\n` +
      `| :--- | ---: |\n` +
      `| service1-behat-coverage.xml | N/A |\n` +
      `| service2-phpunit-coverage.xml | 88.99% |\n`;

    expect(result).toBe(expectedOutput);
  });

  it('should handle an empty reportFiles array', () => {
    // Arrange
    const reportFiles: ReportFile[] = [];

    // Act
    const result = markdownTable(reportFiles);

    // Assert
    const expectedOutput = `| File | Coverage |\n| :--- | ---: |\n`;

    expect(result).toBe(expectedOutput);
  });
});

describe('markdownTableRow', () => {
  it('should format a single row correctly with string and number values', () => {
    // Act
    const result = markdownTableRow('service1.xml', '85.55%');

    // Assert
    expect(result).toBe('| service1.xml | 85.55% |\n');
  });

  it('should handle different data types correctly', () => {
    // Act
    const result = markdownTableRow('service1.xml', 88.77);

    // Assert
    expect(result).toBe('| service1.xml | 88.77 |\n');
  });
});
