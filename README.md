# test-coverage-report

## About

Github Action for coverage report stats as a comment.

* [Usage](#usage)

## Usage

```yaml
name: Tests With Coverage Report
concurrency:
  group: Tests-Coverage-Report-${{ github.head_ref }}
  cancel-in-progress: true
on:
  workflow_dispatch: null
  pull_request: null
jobs:
  tests-with-coverage:
    timeout-minutes: 5
    runs-on: ubuntu-20.04
    steps:
    - name: checkout
      uses: actions/checkout@v3.3.0
      with:
        fetch-depth: 0

    - name: Use Node.js 18
      uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: npm

    - name: Run PHPUnit tests
      run: bin/phpunit --coverage-clover=./reports/project-phpunit-coverage.xml

    - name: Run Behat tests
      run: vendor/bin/behat

    - name: Coverage Report
      if: always()
      uses: sergosvn/test-coverage-report@v1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        clover-path: "./reports"
        title: "Test coverage stats"
```
