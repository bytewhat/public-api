#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Development setup and testing script
 */
class DevSetup {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.apisDir = path.join(this.rootDir, 'apis');
  }

  async checkDependencies() {
    console.log('🔍 Checking dependencies...');
    
    try {
      // Check if package.json exists
      const packagePath = path.join(this.rootDir, 'package.json');
      if (!await fs.pathExists(packagePath)) {
        console.log('❌ package.json not found. Please run this from the repository root.');
        return false;
      }

      // Check if node_modules exists
      const nodeModulesPath = path.join(this.rootDir, 'node_modules');
      if (!await fs.pathExists(nodeModulesPath)) {
        console.log('📦 Installing dependencies...');
        execSync('pnpm install', { cwd: this.rootDir, stdio: 'inherit' });
      }

      console.log('✅ Dependencies ready!');
      return true;
    } catch (error) {
      console.error('❌ Error checking dependencies:', error.message);
      return false;
    }
  }

  async validateAll() {
    console.log('\n🔍 Running validation...');
    
    try {
      execSync('pnpm run validate-apis', { cwd: this.rootDir, stdio: 'inherit' });
      console.log('✅ Validation passed!');
      return true;
    } catch (error) {
      console.log('❌ Validation failed!');
      return false;
    }
  }

  async generateReadme() {
    console.log('\n📝 Generating README...');
    
    try {
      execSync('pnpm run generate-readme', { cwd: this.rootDir, stdio: 'inherit' });
      console.log('✅ README.md generated successfully!');
      return true;
    } catch (error) {
      console.error('❌ Failed to generate README:', error.message);
      return false;
    }
  }

  async createExampleApi() {
    console.log('\n🆕 Creating example API template...');
    
    const exampleApi = {
      id: "example-api",
      name: "Example API",
      description: "An example API for demonstration purposes",
      website: "https://example-api.com",
      docs: "https://example-api.com",
      category: "Development",
      auth: "apiKey",
      https: true,
      cors: true,
      dateAdded: new Date().toISOString().split('T')[0],
      featured: false,
      tags: ["example", "demo", "development"],
      screenshotUrl: "https://example-api.com/screenshot.png",
      about: {
        overview: "A comprehensive example API that demonstrates best practices for API design and documentation.",
        features: [
          "RESTful design",
          "Comprehensive documentation",
          "Rate limiting",
          "Authentication support"
        ],
        useCases: [
          "Learning API integration",
          "Testing API clients",
          "Educational purposes"
        ]
      },
      examples: {
        endpoints: [
          {
            method: "GET",
            path: "/api/users",
            description: "Get list of users"
          },
          {
            method: "POST",
            path: "/api/users",
            description: "Create a new user"
          }
        ],
        codeSnippets: {
          javascript: "fetch('https://example-api.com/api/users').then(res => res.json())",
          python: "import requests\nresponse = requests.get('https://example-api.com/api/users')",
          curl: "curl -X GET https://example-api.com/api/users"
        }
      },
      documentation: {
        quickStart: [
          "Register for an API key at example-api.com",
          "Include the API key in your request headers",
          "Make your first request to /api/users"
        ],
        rateLimit: {
          requests: 1000,
          period: "per hour"
        },
        authentication: {
          type: "API Key",
          description: "Include your API key in the Authorization header as 'Bearer YOUR_API_KEY'"
        },
        sdks: [
          {
            language: "JavaScript",
            name: "example-api-js",
            official: true
          },
          {
            language: "Python",
            name: "example-api-python",
            official: false
          }
        ]
      }
    };

    const examplePath = path.join(this.apisDir, 'example-api.json');
    
    if (await fs.pathExists(examplePath)) {
      console.log('ℹ️  Example API already exists at apis/example-api.json');
      return;
    }

    try {
      await fs.writeJSON(examplePath, exampleApi, { spaces: 2 });
      console.log('✅ Example API created at apis/example-api.json');
      console.log('💡 You can use this as a template for adding new APIs');
    } catch (error) {
      console.error('❌ Failed to create example API:', error.message);
    }
  }

  async showStats() {
    console.log('\n📊 Repository Statistics:');
    
    try {
      const apiFiles = await fs.readdir(this.apisDir);
      const jsonFiles = apiFiles.filter(f => f.endsWith('.json'));
      
      const categories = await fs.readJSON(path.join(this.rootDir, 'categories.json'));
      const featured = await fs.readJSON(path.join(this.rootDir, 'featured.json'));
      
      console.log(`- Total APIs: ${jsonFiles.length}`);
      console.log(`- Categories: ${categories.length}`);
      console.log(`- Featured APIs: ${featured.length}`);
      
      // Show APIs by category
      const apis = [];
      for (const file of jsonFiles) {
        const apiData = await fs.readJSON(path.join(this.apisDir, file));
        apis.push(apiData);
      }
      
      const apisByCategory = apis.reduce((acc, api) => {
        if (!acc[api.category]) acc[api.category] = [];
        acc[api.category].push(api.name);
        return acc;
      }, {});
      
      console.log('\n📋 APIs by Category:');
      for (const [category, apiNames] of Object.entries(apisByCategory)) {
        console.log(`  ${category}: ${apiNames.length} APIs`);
        apiNames.forEach(name => console.log(`    - ${name}`));
      }
      
    } catch (error) {
      console.error('❌ Error gathering stats:', error.message);
    }
  }

  async runTests() {
    console.log('\n🧪 Running full test suite...');
    
    const results = {
      dependencies: await this.checkDependencies(),
      validation: false,
      readme: false
    };

    if (results.dependencies) {
      results.validation = await this.validateAll();
      if (results.validation) {
        results.readme = await this.generateReadme();
      }
    }

    console.log('\n📋 Test Results:');
    console.log(`  Dependencies: ${results.dependencies ? '✅' : '❌'}`);
    console.log(`  Validation: ${results.validation ? '✅' : '❌'}`);
    console.log(`  README Generation: ${results.readme ? '✅' : '❌'}`);

    const allPassed = Object.values(results).every(r => r === true);
    console.log(`\n${allPassed ? '🎉' : '💥'} Overall: ${allPassed ? 'PASSED' : 'FAILED'}`);

    if (allPassed) {
      console.log('\n💡 Your changes look good! You can now:');
      console.log('   1. Review the generated README.md');
      console.log('   2. Commit your changes');
      console.log('   3. Submit a pull request');
    }

    return allPassed;
  }

  showHelp() {
    console.log(`
🚀 Public APIs Development Setup

Usage: node scripts/dev-setup.js [command]

Commands:
  test          Run full test suite (default)
  validate      Validate API data only
  generate      Generate README only
  stats         Show repository statistics
  example       Create example API template
  help          Show this help

Examples:
  node scripts/dev-setup.js test
  node scripts/dev-setup.js validate
  node scripts/dev-setup.js stats
`);
  }
}

// CLI handling
if (require.main === module) {
  const devSetup = new DevSetup();
  const command = process.argv[2] || 'test';

  (async () => {
    switch (command) {
      case 'test':
        const success = await devSetup.runTests();
        process.exit(success ? 0 : 1);
        break;
      case 'validate':
        await devSetup.checkDependencies();
        const valid = await devSetup.validateAll();
        process.exit(valid ? 0 : 1);
        break;
      case 'generate':
        await devSetup.checkDependencies();
        const generated = await devSetup.generateReadme();
        process.exit(generated ? 0 : 1);
        break;
      case 'stats':
        await devSetup.showStats();
        break;
      case 'example':
        await devSetup.createExampleApi();
        break;
      case 'help':
      default:
        devSetup.showHelp();
        break;
    }
  })();
}

module.exports = DevSetup; 