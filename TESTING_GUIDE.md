# Comprehensive Testing Guide - Neesh AI

This document outlines the comprehensive testing strategy implemented for the Neesh AI project, covering both frontend and backend testing, along with integration and regression testing approaches.

## Table of Contents
- [Frontend Testing](#frontend-testing)
- [Backend Testing](#backend-testing)
- [Integration Testing](#integration-testing)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Regression Testing](#regression-testing)
- [Continuous Integration](#continuous-integration)

## Frontend Testing

### Technology Stack
- **Testing Framework**: Vitest
- **Testing Library**: React Testing Library
- **Mocking**: Vitest mocks
- **Coverage**: Vitest coverage with c8

### Test Structure
```
src/
├── test/
│   ├── setup.ts              # Test configuration and global mocks
│   ├── test-utils.tsx        # Custom render utilities with providers
│   ├── api-mocks.ts          # API response mocks and utilities
│   └── integration/          # Integration tests
├── pages/__tests__/          # Page component tests
├── components/__tests__/     # Component unit tests
├── hooks/__tests__/          # Custom hook tests
└── lib/__tests__/            # Utility function tests
```

### Key Testing Areas

#### 1. Component Testing
- **BlogPreview Component**: Tests for rendering, loading states, public vs private mode
- **PublicBlog Component**: Route handling, slug validation, error scenarios
- **BlogMetaTags Component**: Dynamic meta tag updates for social sharing

#### 2. Hook Testing
- **useBlogs Hook**: API interactions, error handling, data transformation
- **Custom Hooks**: Authentication, API calls, state management

#### 3. Utility Testing
- **Slug Generation**: URL generation, parsing, validation
- **API Client**: Request formatting, error handling

### Test Configuration (vitest.config.ts)
```typescript
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        }
      }
    }
  }
})
```

## Backend Testing

### Technology Stack
- **Testing Framework**: JUnit 5
- **Mocking**: Mockito
- **Integration Testing**: Spring Boot Test with TestContainers
- **Database**: H2 for unit tests, PostgreSQL TestContainers for integration

### Test Structure
```
src/test/java/com/neeshai/backend/
├── blog/
│   ├── BlogServiceTest.java                    # Service layer unit tests
│   └── BlogRepositoryTest.java                 # Repository tests
├── project/
│   ├── ProjectServiceTest.java                 # Project service tests
│   └── PublicProjectControllerTest.java        # Controller tests
├── integration/
│   └── PublicBlogSharingIntegrationTest.java   # End-to-end integration tests
└── config/
    └── TestConfiguration.java                   # Test configuration
```

### Key Testing Areas

#### 1. Service Layer Testing
- **BlogService**: CRUD operations, ownership validation, public access
- **ProjectService**: Project management, slug handling
- **Security**: Authentication, authorization, public endpoints

#### 2. Controller Testing
- **PublicProjectController**: Public API endpoints, error handling
- **Request/Response**: JSON serialization, validation
- **HTTP Status Codes**: Proper status code handling

#### 3. Repository Testing
- **Data Access**: Database operations, queries
- **Entity Relationships**: Foreign key constraints, cascading

### Test Configuration (application-test.properties)
```properties
# H2 in-memory database for fast unit tests
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop

# TestContainers for integration tests
testcontainers.postgresql.enabled=true
```

## Integration Testing

### Blog Sharing Integration Test

Tests the complete flow of blog sharing functionality:

1. **URL Generation**: Creating shareable URLs with project slugs
2. **Public Access**: Accessing blogs via public endpoints without authentication
3. **Slug Parsing**: Extracting project IDs from shareable URLs
4. **Meta Tag Generation**: Dynamic social media meta tags
5. **Error Scenarios**: Invalid slugs, non-existent blogs, malformed URLs

### Frontend Integration Tests
```typescript
describe('Blog Sharing Integration', () => {
  it('should render blog when valid slug is provided')
  it('should redirect to home when invalid slug is provided')
  it('should handle malformed UUID in slug gracefully')
  it('should redirect to home when blog is not found')
})
```

### Backend Integration Tests
```java
@SpringBootTest
@Transactional
public class PublicBlogSharingIntegrationTest {
  @Test void getPublicBlogBySlug_ShouldReturnBlogContent()
  @Test void getPublicBlogByInvalidSlug_ShouldReturn404()
  @Test void getPublicBlogForProjectWithoutBlog_ShouldReturnEmptyBlogContent()
}
```

## Running Tests

### Frontend Tests
```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Run unit tests only (excluding integration)
npm run test:unit

# Run tests with UI
npm run test:ui

# CI pipeline tests
npm run test:ci
```

### Backend Tests
```bash
# Run all tests
mvn test

# Run with coverage
mvn test jacoco:report

# Run integration tests only
mvn test -Dtest="*IntegrationTest"

# Run unit tests only
mvn test -Dtest="*Test" -DexcludeGroups="integration"

# Run specific test class
mvn test -Dtest="BlogServiceTest"
```

## Test Coverage

### Coverage Requirements
- **Minimum Coverage**: 75% for lines, branches, functions, and statements
- **Critical Components**: 90%+ coverage for core business logic
- **API Endpoints**: 100% coverage for public endpoints

### Coverage Reports
- **Frontend**: HTML reports generated in `coverage/` directory
- **Backend**: JaCoCo reports in `target/site/jacoco/`

### Monitoring Coverage
```bash
# Frontend coverage
npm run test:coverage
open coverage/index.html

# Backend coverage
mvn test jacoco:report
open target/site/jacoco/index.html
```

## Regression Testing

### Automated Regression Tests
1. **Blog Sharing Workflow**: End-to-end test of complete sharing flow
2. **API Compatibility**: Ensure backward compatibility of public APIs
3. **Database Schema**: Validate migrations don't break existing functionality
4. **Performance**: Basic performance regression tests for critical paths

### Manual Regression Checklist
- [ ] Blog creation and editing works correctly
- [ ] Public blog sharing URLs work in different browsers
- [ ] Social media sharing shows correct meta tags
- [ ] Mobile responsiveness maintained
- [ ] Authentication flows remain intact

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run test:ci

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Java
        uses: actions/setup-java@v3
        with: { java-version: '17' }
      - run: mvn test jacoco:report
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npx husky add .husky/pre-commit "npm run test:all"
```

## Best Practices

### Writing Tests
1. **Arrange, Act, Assert**: Clear test structure
2. **Descriptive Names**: Test names describe exact scenario
3. **Independent Tests**: No dependencies between tests
4. **Mock External Dependencies**: Isolate units under test
5. **Test Edge Cases**: Happy path and error scenarios

### Maintaining Tests
1. **Keep Tests Updated**: Update tests with code changes
2. **Refactor Test Code**: Apply same quality standards as production code
3. **Regular Review**: Review test coverage and effectiveness
4. **Performance**: Keep tests fast and reliable

## Troubleshooting

### Common Issues
1. **Flaky Tests**: Often related to timing or external dependencies
2. **Coverage Gaps**: Usually missing error handling or edge cases
3. **Slow Tests**: Database or network operations need optimization
4. **Mock Issues**: Outdated mocks not matching actual API responses

### Debug Commands
```bash
# Run specific failing test
npm run test -- --reporter=verbose BlogPreview.test.tsx

# Debug with browser
npm run test:ui

# Check test output
npm run test -- --reporter=verbose
```

This comprehensive testing strategy ensures code quality, prevents regressions, and provides confidence for production deployments.