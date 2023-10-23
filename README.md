# js-crawler

Simple Javascript-enabled playwright wrapper API using on Crawlee and Express JS.

## Usage

The JS crawler works as a proxy to convert Javascript-based websites (running React, Vue, etc.) into raw HTML.

### Schedule URL for crawling

The crawler will process the URL using a headless browser and store it into a temporary file.

Request:
```
POST http://localhost:3000
Content-Type: application/json
Body: {
  "urls": ["http://example.com"]
}
```

It will return the list of crawled URLs and a list of the generated temporary files.

Response:
```
{
  "urls": ["http://example.com"],
  "keys": ["a249f464-cebc-4906-87ef-48f63f3027df.html"]
}
```

### Retrieve the HTML content

For each of the temporary files, you can then download them using.
```
GET http://localhost:3000/files/a249f464-cebc-4906-87ef-48f63f3027df-html
```

Temporary files are automatically deleted once they have been accessed.

