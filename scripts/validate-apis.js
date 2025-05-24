#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const Ajv = require('ajv');

/**
 * Validate API JSON files against schema
 */
class ApiValidator {
  constructor() {
    this.apisDir = path.join(__dirname, '../apis');
    this.categoriesFile = path.join(__dirname, '../categories.json');
    this.featuredFile = path.join(__dirname, '../featured.json');
    
    // Define the API schema
    this.apiSchema = {
      type: 'object',
      required: ['id', 'name', 'description', 'website', 'category', 'auth', 'https', 'cors', 'dateAdded'],
      properties: {
        id: { type: 'string', pattern: '^[a-z0-9-]+$' },
        name: { type: 'string', minLength: 1, maxLength: 100 },
        description: { type: 'string', minLength: 1, maxLength: 200 },
        website: { type: 'string', format: 'uri' },
        docs: { type: 'string', format: 'uri' },
        category: { type: 'string', minLength: 1 },
        auth: { enum: ['apiKey', 'oauth', 'none'] },
        https: { type: 'boolean' },
        cors: { type: 'boolean' },
        featured: { type: 'boolean' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          maxItems: 10
        },
        dateAdded: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        screenshotUrl: { type: 'string', format: 'uri' },
        about: {
          type: 'object',
          properties: {
            overview: { type: 'string', minLength: 1 },
            features: {
              type: 'array',
              items: { type: 'string' }
            },
            useCases: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['overview', 'features', 'useCases'],
          additionalProperties: false
        },
        examples: {
          type: 'object',
          properties: {
            endpoints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  method: { type: 'string' },
                  path: { type: 'string' },
                  description: { type: 'string' }
                },
                required: ['method', 'path', 'description'],
                additionalProperties: false
              }
            },
            codeSnippets: {
              type: 'object',
              properties: {
                javascript: { type: 'string' },
                python: { type: 'string' },
                curl: { type: 'string' }
              },
              required: [],
              additionalProperties: false
            }
          },
          required: ['endpoints', 'codeSnippets'],
          additionalProperties: false
        },
        documentation: {
          type: 'object',
          properties: {
            quickStart: {
              type: 'array',
              items: { type: 'string' }
            },
            rateLimit: {
              type: 'object',
              properties: {
                requests: { type: 'number', minimum: 1 },
                period: { type: 'string' }
              },
              required: ['requests', 'period'],
              additionalProperties: false
            },
            authentication: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                description: { type: 'string' }
              },
              required: ['type', 'description'],
              additionalProperties: false
            },
            sdks: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  language: { type: 'string' },
                  name: { type: 'string' },
                  official: { type: 'boolean' }
                },
                required: ['language', 'name', 'official'],
                additionalProperties: false
              }
            }
          },
          required: ['quickStart'],
          additionalProperties: false
        }
      },
      additionalProperties: false
    };

    this.ajv = new Ajv();
    require('ajv-formats')(this.ajv);
    this.validateApi = this.ajv.compile(this.apiSchema);
  }

  async loadCategories() {
    try {
      this.categories = await fs.readJSON(this.categoriesFile);
      return this.categories;
    } catch (error) {
      console.error('❌ Error loading categories:', error.message);
      return [];
    }
  }

  async loadFeatured() {
    try {
      this.featured = await fs.readJSON(this.featuredFile);
      return this.featured;
    } catch (error) {
      console.error('❌ Error loading featured APIs:', error.message);
      return [];
    }
  }

  async validateApiFile(filePath) {
    const errors = [];
    
    try {
      const apiData = await fs.readJSON(filePath);
      const fileName = path.basename(filePath, '.json');
      
      // Validate against schema
      const isValid = this.validateApi(apiData);
      if (!isValid) {
        errors.push(`Schema validation failed: ${this.ajv.errorsText(this.validateApi.errors)}`);
      }

      // Additional business logic validations
      if (apiData.id !== fileName) {
        errors.push(`ID mismatch: expected '${fileName}', got '${apiData.id}'`);
      }

      if (this.categories && !this.categories.includes(apiData.category)) {
        errors.push(`Invalid category: '${apiData.category}'. Valid categories: ${this.categories.join(', ')}`);
      }

      if (apiData.website && !apiData.website.startsWith('https://') && !apiData.website.startsWith('http://')) {
        errors.push(`Invalid website URL: ${apiData.website}`);
      }

      return { valid: errors.length === 0, errors, data: apiData };
    } catch (error) {
      return { 
        valid: false, 
        errors: [`Failed to parse JSON: ${error.message}`],
        data: null 
      };
    }
  }

  async validateAll() {
    console.log('🔍 Starting API validation...\n');
    
    await this.loadCategories();
    await this.loadFeatured();

    const apiFiles = await fs.readdir(this.apisDir);
    const jsonFiles = apiFiles.filter(f => f.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('⚠️  No API files found in apis/ directory');
      return false;
    }

    let allValid = true;
    const results = [];

    for (const file of jsonFiles) {
      const filePath = path.join(this.apisDir, file);
      const result = await this.validateApiFile(filePath);
      results.push({ file, ...result });

      if (result.valid) {
        console.log(`✅ ${file}: Valid`);
      } else {
        console.log(`❌ ${file}: Invalid`);
        result.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
        allValid = false;
      }
    }

    // Validate featured APIs exist
    if (this.featured && this.featured.length > 0) {
      console.log('\n🌟 Validating featured APIs...');
      const validApiIds = results.filter(r => r.valid).map(r => r.data?.id);
      
      for (const featuredId of this.featured) {
        if (!validApiIds.includes(featuredId)) {
          console.log(`❌ Featured API '${featuredId}' not found or invalid`);
          allValid = false;
        } else {
          console.log(`✅ Featured API '${featuredId}': Valid`);
        }
      }
    }

    // Summary
    console.log('\n📊 Validation Summary:');
    console.log(`Total files: ${jsonFiles.length}`);
    console.log(`Valid: ${results.filter(r => r.valid).length}`);
    console.log(`Invalid: ${results.filter(r => !r.valid).length}`);
    console.log(`Categories: ${this.categories?.length || 0}`);
    console.log(`Featured APIs: ${this.featured?.length || 0}`);

    if (allValid) {
      console.log('\n🎉 All validations passed!');
    } else {
      console.log('\n💥 Validation failed. Please fix the errors above.');
    }

    return allValid;
  }

  async validateSingle(apiId) {
    const filePath = path.join(this.apisDir, `${apiId}.json`);
    
    if (!await fs.pathExists(filePath)) {
      console.log(`❌ API file not found: ${apiId}.json`);
      return false;
    }

    await this.loadCategories();
    const result = await this.validateApiFile(filePath);
    
    if (result.valid) {
      console.log(`✅ ${apiId}.json: Valid`);
      return true;
    } else {
      console.log(`❌ ${apiId}.json: Invalid`);
      result.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
      return false;
    }
  }
}

// CLI handling
if (require.main === module) {
  const validator = new ApiValidator();
  const apiId = process.argv[2];

  if (apiId) {
    // Validate single API
    validator.validateSingle(apiId).then(isValid => {
      process.exit(isValid ? 0 : 1);
    });
  } else {
    // Validate all APIs
    validator.validateAll().then(allValid => {
      process.exit(allValid ? 0 : 1);
    });
  }
}

module.exports = ApiValidator; 