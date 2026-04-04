#!/bin/bash
# Test Commands Quick Reference
# Save this file to reference common testing commands

# =============================================
# BASIC TEST COMMANDS
# =============================================

# Run all tests once
npm test -- --watch=false

# Run tests in watch mode (auto-reload on changes)
npm test

# Run specific test file
npm test Decorator.test.js
npm test Observer.test.js
npm test NotificationContext.test.js

# =============================================
# FILTERING & FOCUSING
# =============================================

# Run only tests matching pattern
npm test -- -t "should apply 20%"

# Run only a specific test file
npm test -- Decorator.test.js --testNamePattern="PercentageDiscount"

# Skip a test (prefix with 'x')
# test.skip('should apply discount', () => {})

# Focus on one test (prefix with 'only')
# test.only('should apply discount', () => {})

# =============================================
# COVERAGE ANALYSIS
# =============================================

# Generate coverage report
npm test -- --coverage --watch=false

# Coverage with specific file
npm test -- --coverage --collectCoverageFrom="src/patterns/**"

# View HTML coverage report
npm test -- --coverage --watch=false
# Then open: coverage/lcov-report/index.html

# =============================================
# VERBOSE OUTPUT
# =============================================

# Show detailed test output
npm test -- --verbose --watch=false

# Show which tests are slow
npm test -- --detectOpenHandles --watch=false

# =============================================
# DEBUG MODE
# =============================================

# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Or with Chrome DevTools
chrome://inspect

# =============================================
# CI/CONTINUOUS INTEGRATION
# =============================================

# Run tests once (no watch mode)
CI=true npm test

# Generate coverage and exit
CI=true npm test -- --coverage

# =============================================
# CLEARING & CLEANUP
# =============================================

# Clear Jest cache
npm test -- --clearCache

# Clear cache and run all tests
npm test -- --clearCache --watchAll=false

# =============================================
# TEST STATISTICS
# =============================================

# Run with timing info
npm test -- --logHeapUsage --watch=false

# Show slowest tests
npm test -- --detectOpenHandles

# =============================================
# SNAPSHOT TESTING (if we add snapshots)
# =============================================

# Update snapshots
npm test -- -u

# Check snapshot differences
npm test -- --testNamePattern="snapshot"

# =============================================
# INTEGRATION WITH CI/CD
# =============================================

# Run tests with coverage for GitHub Actions
npm test -- --coverage --watchAll=false --passWithNoTests

# Generate coverage badges
npm test -- --coverage --coverageReporters=text-summary

# =============================================
# USEFUL DEBUGGING APPROACHES
# =============================================

# 1. Add console.log in test:
# console.log('Value:', variable);
# npm test -- --testNamePattern="test name" 2>&1 | grep "Value:"

# 2. Use debugger in test:
# debugger;
# node --inspect-brk node_modules/.bin/jest --runInBand

# 3. Check specific test output:
# npm test -- -t "specific test name" --verbose

# 4. List all tests without running:
# npm test -- --listTests

# 5. Show test names without running:
# npm test -- --testNamePattern=".*" --listTests

# =============================================
# GiftShop Specific Commands
# =============================================

# Test Decorator Pattern (Discounts)
npm test -- Decorator.test.js

# Test Observer Pattern (Notifications)
npm test -- Observer.test.js

# Test React Integration
npm test -- NotificationContext.test.js

# Test everything with coverage
npm test -- --coverage --watchAll=false

# Run in CI environment (exit immediately)
CI=true npm test

# =============================================
# EXPECTED OUTPUT
# =============================================

# When all tests pass:
# PASS  src/patterns/Decorator.test.js (3.245s)
#   Decorator Pattern - Discount System
#     PriceComponent
#       ✓ should create a PriceComponent with correct price (5ms)
#       ✓ should format price correctly in description (1ms)
#     PercentageDiscount
#       ✓ should apply 20% discount (2ms)
#       ... more tests ...
#
# PASS  src/patterns/Observer.test.js (2.481s)
# PASS  src/contexts/NotificationContext.test.js (5.123s)
#
# Test Suites: 3 passed, 3 total
# Tests:       120 passed, 120 total
# Snapshots:   0 total
# Time:        10.85 s

# =============================================
# TROUBLESHOOTING
# =============================================

# Problem: Tests hang or timeout
# Solution: Add timeout: npm test -- --testTimeout=10000

# Problem: "Cannot find module"
# Solution: Clear cache: npm test -- --clearCache

# Problem: Port already in use
# Solution: Change port or kill process: 
# netstat -ano | findstr :3000
# taskkill /PID <PID> /F

# Problem: Tests fail with "not defined"
# Solution: Check if imports are correct in test files
# Ensure: import { Class } from './path'

# =============================================
notes:
# - All test files should use .test.js suffix
# - Keep tests isolated and independent
# - Use describe() to group related tests
# - Follow AAA pattern: Arrange, Act, Assert
# - Test behavior, not implementation
# - Test edge cases and error scenarios
# - Use meaningful test descriptions
# - Avoid test interdependencies
# - Clean up after tests (beforeEach/afterEach)
# - Mock external dependencies
# - Use async/await for async tests
# - Keep tests fast (< 100ms average)
# - Aim for >80% code coverage
