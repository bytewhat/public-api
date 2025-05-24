# API Guide

This document provides detailed information about using the APIs listed in this repository.

## Getting Started

### 1. Choose an API
Browse the [main README](README.md) to find an API that suits your needs.

### 2. Check Requirements
Each API has different requirements:
- **Authentication**: Some require API keys, OAuth, or no authentication
- **Rate Limits**: Most APIs have usage limits
- **CORS**: Important for browser-based applications

### 3. Read Documentation
Always check the official API documentation before integration.

## Authentication Types

### No Authentication
These APIs can be used without any authentication:
```javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data));
```

### API Key
Most common authentication method:
```javascript
fetch('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    // or sometimes:
    'X-API-Key': 'YOUR_API_KEY'
  }
})
```

### OAuth
More complex but secure authentication:
```javascript
// Usually requires a multi-step process
// 1. Redirect user to OAuth provider
// 2. Receive authorization code
// 3. Exchange code for access token
// 4. Use token in API requests
```

## Best Practices

### Error Handling
Always implement proper error handling:
```javascript
fetch('https://api.example.com/data')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Rate Limiting
Respect rate limits to avoid being blocked:
```javascript
// Simple rate limiting with delay
async function makeRequestWithDelay(url, delay = 1000) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return fetch(url);
}
```

### Caching
Cache responses when appropriate:
```javascript
// Simple cache implementation
const cache = new Map();

async function cachedFetch(url, maxAge = 300000) { // 5 minutes
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < maxAge) {
    return cached.data;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  cache.set(url, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

## Common Patterns

### Pagination
Many APIs use pagination for large datasets:
```javascript
async function fetchAllPages(baseUrl) {
  let allData = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${baseUrl}?page=${page}`);
    const data = await response.json();
    
    allData = allData.concat(data.results);
    hasMore = data.hasNext;
    page++;
  }
  
  return allData;
}
```

### Filtering and Searching
Most APIs support query parameters:
```javascript
const params = new URLSearchParams({
  q: 'search term',
  category: 'technology',
  limit: '10'
});

fetch(`https://api.example.com/search?${params}`)
```

## CORS Considerations

### Browser Compatibility
Some APIs don't support CORS for browser requests. Solutions:

1. **Use a proxy server**
2. **Make requests from your backend**
3. **Use browser extensions** (development only)

### Proxy Example
```javascript
// Instead of direct request (blocked by CORS)
// fetch('https://api.example.com/data')

// Use a proxy
fetch('/api/proxy?url=' + encodeURIComponent('https://api.example.com/data'))
```

## Testing APIs

### Using curl
```bash
# GET request
curl -X GET "https://api.example.com/data" \
  -H "Authorization: Bearer YOUR_API_KEY"

# POST request
curl -X POST "https://api.example.com/data" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"key": "value"}'
```

### Using Postman
1. Import API collection
2. Set up environment variables
3. Test different endpoints
4. Export code snippets

## Security

### Protect API Keys
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor usage for suspicious activity

### Environment Variables
```javascript
// .env file
API_KEY=your_api_key_here

// In your code
const apiKey = process.env.API_KEY;
```

## Troubleshooting

### Common Issues

1. **CORS errors**: API doesn't support browser requests
2. **401 Unauthorized**: Invalid or missing authentication
3. **429 Too Many Requests**: Rate limit exceeded
4. **404 Not Found**: Incorrect endpoint URL
5. **500 Server Error**: API is down or has issues

### Debug Tips

1. **Check the browser console** for error messages
2. **Verify API key** is correct and active
3. **Test with curl** to isolate browser issues
4. **Check API status page** if available
5. **Review rate limits** and current usage

## Resources

- [REST API Tutorial](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [JSON Schema](https://json-schema.org/)
- [OAuth 2.0 Guide](https://oauth.net/2/)

## Contributing

Found an issue with this guide or want to add more examples? Please [open an issue](https://github.com/bytewhat/public-api/issues) or submit a pull request!
