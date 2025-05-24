# Contributing to Public APIs

Thank you for your interest in contributing! This document provides guidelines for contributing to the Public APIs project.

## How to Contribute

### Adding a New API

1. **Fork the repository**
2. **Create a new branch** for your API addition
3. **Add the API data** following our schema
4. **Test your changes** to ensure valid JSON
5. **Submit a pull request** with a clear description

### API Requirements

Before adding an API, please ensure it meets these criteria:

#### ✅ Required
- **Public accessibility**: No private or internal APIs
- **Active maintenance**: The API should be actively maintained
- **Documentation**: Proper API documentation must exist
- **Working endpoints**: The API should be functional

#### 🎯 Preferred
- **HTTPS support**: APIs with HTTPS are preferred
- **CORS enabled**: APIs that support CORS are more developer-friendly
- **Rate limiting info**: Clear rate limiting information
- **Multiple response formats**: Support for JSON, XML, etc.
- **Authentication options**: Multiple auth methods available

### File Structure

When adding an API, create a JSON file in the `apis/` directory:

```
apis/
├── your-api-name.json
└── ...
```

### JSON Schema

Each API file must follow this structure:

```json
{
  "id": "unique-api-id",
  "name": "API Name",
  "description": "Brief description (max 100 characters)",
  "website": "https://api-documentation-url.com",
  "docs": "https://api-documentation-url.com/reference",
  "category": "One of the predefined categories",
  "auth": "apiKey|oauth|none",
  "https": true,
  "cors": true,
  "featured": false,
  "tags": ["relevant", "tags", "here"],
  "dateAdded": "YYYY-MM-DD",
  "about": {
    "overview": "Detailed overview of what the API does and its purpose",
    "features": [
      "Key feature 1",
      "Key feature 2",
      "Key feature 3"
    ],
    "useCases": [
      "Primary use case 1",
      "Primary use case 2",
      "Primary use case 3"
    ]
  },
  "examples": {
    "endpoints": [
      {
        "method": "GET",
        "path": "/api/endpoint",
        "description": "What this endpoint returns"
      }
    ],
    "codeSnippets": {
      "javascript": "fetch('https://api.example.com/data').then(res => res.json())",
      "python": "import requests\nresponse = requests.get('https://api.example.com/data')",
      "curl": "curl -X GET 'https://api.example.com/data'"
    }
  },
  "documentation": {
    "quickStart": [
      "Sign up for an account",
      "Get your API key",
      "Make your first request"
    ],
    "rateLimit": {
      "requests": 1000,
      "period": "per hour"
    },
    "authentication": {
      "type": "API Key",
      "description": "Include your API key in the Authorization header"
    },
    "sdks": [
      {
        "language": "JavaScript",
        "name": "official-sdk",
        "official": true
      }
    ]
  }
}
```

### Categories

Choose from these predefined categories:

- Animals
- Anime
- Anti-Malware
- Art & Design
- Authentication & Authorization
- Blockchain
- Books
- Business
- Calendar
- Cloud Storage & File Sharing
- Continuous Integration
- Cryptocurrency
- Currency Exchange
- Data Validation
- Development
- Dictionaries
- Documents & Productivity
- Email
- Entertainment
- Environment
- Events
- Finance
- Food & Drink
- Games & Comics
- Geocoding
- Government
- Health
- Jobs
- Machine Learning
- Music
- News
- Open Data
- Open Source Projects
- Patent
- Personality
- Phone
- Photography
- Podcasts
- Programming
- Science & Math
- Security
- Shopping
- Social
- Sports & Fitness
- Test Data
- Text Analysis
- Tracking
- Transportation
- URL Shorteners
- Vehicle
- Video
- Weather

If your API doesn't fit any category, please open an issue to discuss adding a new category.

### Pull Request Guidelines

When submitting a PR, please:

1. **Use descriptive titles**: "Add [API Name] to [Category]"
2. **Include API details**: Brief description of what the API does
3. **Verify all fields**: Ensure all required fields are filled correctly
4. **Test the links**: Make sure all URLs are working
5. **One API per PR**: Submit separate PRs for multiple APIs

### PR Template

Use this template for your pull request description:

```markdown
## API Addition: [API Name]

### Description
Brief description of what this API does.

### Category
[Category Name]

### Checklist
- [ ] API is publicly accessible
- [ ] Documentation link is working
- [ ] JSON structure follows the schema
- [ ] All required fields are filled
- [ ] API is not already listed
- [ ] Links are working and valid

### Additional Notes
Any additional information about the API.
```

## Code of Conduct

Please note that this project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to abide by its terms.

## Questions?

If you have questions about contributing, please:

1. Check existing [issues](https://github.com/bytewhat/public-api/issues)
2. Search [discussions](https://github.com/bytewhat/public-api/discussions)
3. Open a new issue with the "question" label

Thank you for contributing! 🚀
