import { findFiles } from '../src/getFiles'; // Adjust path as necessary
import * as fs from 'fs';

// Mock the 'fs' module's readdirSync method
jest.mock('fs');
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')), // Simplifies path joining for testing
}));

describe('findFiles', () => {
  const mockedReaddirSync = fs.readdirSync as jest.Mock;

  beforeEach(() => {
    mockedReaddirSync.mockClear();
  });

  it('should return an array of ReportFile objects for matching files', () => {
    // Arrange
    mockedReaddirSync.mockReturnValue([
      'service1-behat-coverage.xml',
      'service2-phpunit-coverage.xml',
      'unrelated-file.txt', // This file should not match the regex
      'invalid-coverage.xml', // This file should also not match the regex
    ]);

    const expectedPath = '/mocked/path'; // Example path for the test

    // Act
    const result = findFiles(expectedPath);

    // Assert
    expect(result).toEqual([
      {
        path: '/mocked/path/service1-behat-coverage.xml',
        serviceName: 'service1',
        testType: 'behat',
      },
      {
        path: '/mocked/path/service2-phpunit-coverage.xml',
        serviceName: 'service2',
        testType: 'phpunit',
      },
    ]);

    // Ensure fs.readdirSync is called with the correct directory
    expect(mockedReaddirSync).toHaveBeenCalledWith(expectedPath);
  });

  it('should return an empty array if no files match the pattern', () => {
    // Arrange
    mockedReaddirSync.mockReturnValue([
      'random-file.txt',
      'another-file.pdf',
      'invalid-coverage.xml',
    ]);

    const expectedPath = '/mocked/path';

    // Act
    const result = findFiles(expectedPath);

    // Assert
    expect(result).toEqual([]);
  });

  it('should handle files without service name or test type', () => {
    // Arrange
    mockedReaddirSync.mockReturnValue([
      'service1--coverage.xml', // No test type
      '-phpunit-coverage.xml', // No service name
      'service1-phpunit-coverage.xml', // Valid
    ]);

    const expectedPath = '/mocked/path';

    // Act
    const result = findFiles(expectedPath);

    // Assert
    expect(result).toEqual([
      {
        path: '/mocked/path/service1-phpunit-coverage.xml',
        serviceName: 'service1',
        testType: 'phpunit',
      },
    ]);
  });

  it('should handle edge cases with hyphenated service names', () => {
    // Arrange
    mockedReaddirSync.mockReturnValue([
      'my-service-phpunit-coverage.xml', // Hyphenated service name
      'another-service-behat-coverage.xml',
    ]);

    const expectedPath = '/mocked/path';

    // Act
    const result = findFiles(expectedPath);

    // Assert
    expect(result).toEqual([
      {
        path: '/mocked/path/my-service-phpunit-coverage.xml',
        serviceName: 'my-service',
        testType: 'phpunit',
      },
      {
        path: '/mocked/path/another-service-behat-coverage.xml',
        serviceName: 'another-service',
        testType: 'behat',
      },
    ]);
  });
});
