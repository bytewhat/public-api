#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { groupBy, sortBy } = require('lodash');

/**
 * Generate README.md from API data
 */
class ReadmeGenerator {
  constructor() {
    this.apisDir = path.join(__dirname, '../apis');
    this.categoriesFile = path.join(__dirname, '../categories.json');
    this.featuredFile = path.join(__dirname, '../featured.json');
    this.readmeFile = path.join(__dirname, '../README.md');
  }

  async loadData() {
    try {
      // Load all API files
      const apiFiles = await fs.readdir(this.apisDir);
      this.apis = [];
      
      for (const file of apiFiles.filter(f => f.endsWith('.json'))) {
        const apiData = await fs.readJSON(path.join(this.apisDir, file));
        this.apis.push(apiData);
      }

      // Load categories and featured APIs
      this.categories = await fs.readJSON(this.categoriesFile);
      this.featured = await fs.readJSON(this.featuredFile);
      
      console.log(`Loaded ${this.apis.length} APIs, ${this.categories.length} categories`);
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  generateApiTable(categoryApis) {
    const header = '| API | Description | Auth | HTTPS | CORS |\n|---|---|---|---|---|\n';
    
    const rows = categoryApis.map(api => {
      const authDisplay = api.auth === 'none' ? 'No' : 
                         api.auth === 'apiKey' ? '`apiKey`' : 
                         api.auth === 'oauth' ? '`OAuth`' : 
                         `\`${api.auth}\``;
      
      return `| [${api.name}](${api.website}) | ${api.description} | ${authDisplay} | ${api.https ? 'Yes' : 'No'} | ${api.cors ? 'Yes' : 'No'} |`;
    }).join('\n');

    return header + rows;
  }

  generateIndex() {
    return this.categories
      .map(category => `* [${category}](#${category.toLowerCase().replace(/\s+/g, '-')})`)
      .join('\n');
  }

  generateStats() {
    const totalApis = this.apis.length;
    const totalCategories = this.categories.length;
    const featuredCount = this.featured.length;
    const lastUpdated = new Date().toISOString().split('T')[0];

    return `- **Total APIs**: ${totalApis}
- **Categories**: ${totalCategories}
- **Featured APIs**: ${featuredCount}
- **Last Updated**: ${lastUpdated}`;
  }

  generateReadme() {
    const apisByCategory = groupBy(this.apis, 'category');
    
    // Sort APIs within each category alphabetically
    Object.keys(apisByCategory).forEach(category => {
      apisByCategory[category] = sortBy(apisByCategory[category], 'name');
    });

    const categorySections = this.categories.map(category => {
      const categoryApis = apisByCategory[category] || [];
      if (categoryApis.length === 0) return '';
      
      return `### ${category}
${this.generateApiTable(categoryApis)}`;
    }).filter(section => section).join('\n\n');

    return `# Public APIs

A collective list of public APIs for use in software and web development.

<div style="text-align: center;">
    <a href="https://publicapi.cloud" target="_blank">Website</a> •
    <a href="API.md">API</a> •
    <a href="CONTRIBUTING.md">Contributing Guide</a> •
    <a href="https://github.com/bytewhat/public-api/issues">Issues</a> •
    <a href="https://github.com/bytewhat/public-api/pulls">Pull Requests</a> •
    <a href="LICENSE">License</a>
</div>

## Repository Information

${this.generateStats()}

## Index
${this.generateIndex()}

${categorySections}

## Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new APIs to include
- 🤝 Contributing to the project

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

The authors of this list do not endorse or guarantee the quality, security, or reliability of any listed APIs. Use them at your own discretion and always review the terms of service and privacy policies of any API before integration.
`;
  }

  async generate() {
    try {
      await this.loadData();
      const readme = this.generateReadme();
      await fs.writeFile(this.readmeFile, readme, 'utf8');
      console.log('✅ README.md generated successfully!');
      console.log(`📊 Stats: ${this.apis.length} APIs across ${this.categories.length} categories`);
    } catch (error) {
      console.error('❌ Error generating README:', error);
      process.exit(1);
    }
  }
}

// Run the generator
if (require.main === module) {
  const generator = new ReadmeGenerator();
  generator.generate();
}

module.exports = ReadmeGenerator; 