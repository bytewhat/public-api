# 🤖 Automation System

This document explains the automated README generation system for the Public APIs repository.

## Overview

The automation system ensures that the `README.md` file is always up-to-date with the latest API data whenever:
- A pull request is merged into the main branch
- Code is pushed directly to the main branch
- Changes are made to API files, categories, or featured APIs

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Data      │    │   Scripts        │    │   Workflows     │
│                 │    │                  │    │                 │
│ apis/*.json     │───▶│ generate-readme  │───▶│ update-readme   │
│ categories.json │    │ validate-apis    │    │ validate-pr     │
│ featured.json   │    │ dev-setup        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   README.md     │
                    │ (auto-generated)│
                    └─────────────────┘
```

## Components

### 1. Scripts (`scripts/`)

#### `generate-readme.js`
- **Purpose**: Generates the complete README.md from API data
- **Input**: API JSON files, categories.json, featured.json
- **Output**: Updated README.md with current statistics and API tables
- **Features**:
  - Automatically sorts APIs alphabetically within categories
  - Generates statistics (total APIs, categories, featured count)
  - Updates last modified date
  - Creates proper markdown tables with API information

#### `validate-apis.js`
- **Purpose**: Validates all API JSON files against schema and business rules
- **Features**:
  - JSON schema validation
  - Category validation against categories.json
  - Featured API validation
  - URL format checking
  - Individual file validation support
- **Usage**:
  ```bash
  pnpm run validate-apis           # Validate all APIs
  pnpm run validate-apis cat-facts # Validate specific API
  ```

#### `dev-setup.js`
- **Purpose**: Local development helper for contributors
- **Features**:
  - Dependency checking and installation
  - Full test suite
  - Statistics display
  - Example API template generation
- **Usage**:
  ```bash
  pnpm run dev test      # Run full test suite
  pnpm run dev validate  # Validate only
  pnpm run dev stats     # Show statistics
  pnpm run dev example   # Create example API
  ```

### 2. GitHub Workflows (`.github/workflows/`)

#### `update-readme.yml`
- **Triggers**:
  - Push to main/master branch (when API files change)
  - Pull request merged (when API files change)
  - Manual workflow dispatch
- **Process**:
  1. Setup Node.js and pnpm
  2. Install dependencies
  3. Validate API data
  4. Generate new README.md
  5. Commit and push changes (if any)
  6. Create action summary with statistics

#### `validate-pr.yml`
- **Triggers**: Pull requests targeting main/master (when API files change)
- **Process**:
  1. Setup environment
  2. Validate all API data
  3. Generate preview README
  4. Validate changed files individually
  5. Create validation summary

## Usage Guide

### For Contributors

#### Adding a New API

1. **Create the API file**:
   ```bash
   # Generate an example template first
   pnpm run example
   
   # Copy and modify for your API
   cp apis/example-api.json apis/your-api.json
   ```

2. **Edit the API file** with your API details:
   ```json
   {
     "id": "your-api",
     "name": "Your API",
     "description": "Brief description of your API",
     "website": "https://your-api.com/docs",
     "category": "Development",
     "auth": "apiKey",
     "https": true,
     "cors": true,
     "dateAdded": "2024-01-15",
     "featured": false,
     "tags": ["your", "api", "tags"],
     "screenshotUrl": "https://your-api.com/screenshot.png"
   }
   ```

3. **Test locally**:
   ```bash
   # Run full validation and README generation
   pnpm run test
   
   # Or individual steps
   pnpm run validate-apis your-api  # Validate your specific API
   pnpm run generate-readme         # Generate README
   ```

4. **Submit Pull Request**:
   - The validation workflow will automatically run
   - Fix any validation errors reported
   - Once merged, README will be automatically updated

#### Adding a New Category

1. Edit `categories.json`:
   ```json
   [
     "Animals",
     "Development", 
     "Machine Learning",
     "Your New Category"
   ]
   ```

2. Test and submit PR as above

#### Adding Featured APIs

1. Edit `featured.json`:
   ```json
   [
     "dog-pics",
     "openai", 
     "github",
     "your-api-id"
   ]
   ```

2. Test and submit PR as above

### For Maintainers

#### Manual README Update
```bash
# Force update README without changing API data
pnpm run generate-readme
```

#### Manual Workflow Trigger
- Go to Actions tab in GitHub
- Select "Update README" workflow
- Click "Run workflow"

#### Troubleshooting Failed Workflows

1. **Validation Failures**:
   - Check the validation step output
   - Common issues: invalid JSON, missing required fields, wrong category
   - Fix the API files and commit

2. **README Generation Failures**:
   - Usually caused by invalid API data that passed validation
   - Check for missing files or malformed JSON
   - Verify all referenced categories and featured APIs exist

## Configuration

### Workflow Triggers

The workflows are configured to trigger on specific paths:
```yaml
paths:
  - 'apis/**'           # Any API file changes
  - 'categories.json'   # Category changes
  - 'featured.json'     # Featured API changes
  - 'scripts/**'        # Script changes (update-readme only)
```

### API Schema

All APIs must conform to this schema:

**Required Fields:**
- `id`: Unique identifier (lowercase, numbers, hyphens only)
- `name`: API name (1-100 characters)
- `description`: Brief description (1-200 characters)
- `website`: Valid URL to API documentation
- `category`: Must match a category in categories.json
- `auth`: Authentication type (`'apiKey'`, `'oauth'`, or `'none'`)
- `https`: Boolean indicating HTTPS support
- `dateAdded`: Date in YYYY-MM-DD format

**Optional Fields:**
- `featured`: Boolean (default: false)
- `tags`: Array of strings (max 10 tags)
- `screenshotUrl`: Valid URL to API screenshot
- `about`: Object with overview, features, and use cases
- `examples`: Object with endpoints and code snippets
- `documentation`: Object with quick start guide and other docs

## Security

- Workflows use `GITHUB_TOKEN` with minimal required permissions
- Only runs on specific file paths to avoid unnecessary executions
- Validates all data before generating README
- Uses trusted GitHub Actions from official sources

## Monitoring

Each workflow provides:
- Detailed step-by-step logs
- Action summaries with statistics
- Failure notifications
- Validation reports for PRs

## Development

### Local Setup
```bash
# Install dependencies
pnpm install

# Run full test suite
pnpm run test

# View current stats
pnpm run stats
```

### Adding New Features

1. **New Validation Rules**: Edit `scripts/validate-apis.js`
2. **README Template Changes**: Edit `scripts/generate-readme.js`
3. **Workflow Modifications**: Edit `.github/workflows/*.yml`
4. **New Scripts**: Add to `scripts/` and update `package.json`

### Testing Workflows

Use `act` to test GitHub Actions locally:
```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Test validation workflow
act pull_request

# Test update workflow  
act push
```

## FAQ

**Q: Why isn't the README updating after my PR was merged?**
A: Check if your changes were in the monitored paths (`apis/`, `categories.json`, `featured.json`). The workflow only runs for relevant changes.

**Q: Can I manually trigger a README update?**
A: Yes, go to Actions → Update README → Run workflow, or run `pnpm run generate-readme` locally.

**Q: How often does the README get updated?**
A: Automatically on every relevant change. There's no scheduled/periodic update.

**Q: What happens if validation fails?**
A: PRs will show failed checks and must be fixed before merging. The README won't be updated until validation passes.

**Q: Can I customize the README template?**
A: Yes, edit `scripts/generate-readme.js`. The template is in the `generateReadme()` method.

## Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines 