# Change Monitoring Server

A file watching server that monitors changes in your Team Vortex project and provides real-time statistics and history.

## Features

- **Real-time File Watching**: Monitors changes in `src/`, `server/`, `public/`, and config files
- **Change History**: Tracks file additions, modifications, and deletions
- **Statistics**: Provides insights about file types, change frequency, and patterns
- **REST API**: JSON endpoints to query changes and statistics
- **File Preview**: Safely view file contents (project files only)

## Installation

```bash
npm install
```

## Usage

Start the change monitoring server:

```bash
npm run watch
```

The server will start on `http://localhost:7778` by default.

## API Endpoints

### Get Changes
```
GET /api/changes?limit=50&type=change&extension=.js
```

Parameters:
- `limit`: Number of changes to return (default: 50)
- `type`: Filter by event type (`change`, `add`, `delete`)
- `extension`: Filter by file extension

### Get Statistics
```
GET /api/stats
```

Returns comprehensive statistics about changes.

### Health Check
```
GET /api/health
```

Returns server status and watcher information.

### Clear History
```
POST /api/clear-history
```

Clears all change history and resets statistics.

### File Preview
```
GET /api/file/:filePath
```

Safely preview file contents (restricted to project directory).

## Monitoring Paths

The server watches these directories:
- `./src/**/*` - React source files
- `./server/**/*` - Backend server files  
- `./public/**/*` - Static assets
- `./package.json` - Dependencies
- `./tailwind.config.js` - Tailwind config
- `./postcss.config.js` - PostCSS config

## Ignored Paths

- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `*.log`
- `.DS_Store`

## Example Output

```json
{
  "changes": [
    {
      "id": 1640995200000,
      "timestamp": "2023-12-31T23:59:59.999Z",
      "eventType": "change",
      "filePath": "src/components/Header.js",
      "extension": ".js",
      "size": 2048
    }
  ],
  "total": 1,
  "stats": {
    "totalChanges": 42,
    "fileTypes": {
      ".js": 25,
      ".css": 10,
      ".json": 7
    },
    "lastChange": "2023-12-31T23:59:59.999Z",
    "changesByHour": {
      "14": 5,
      "15": 8,
      "16": 12
    }
  }
}
```

## Integration with Development

You can run this alongside your main development server:

```bash
# Run both main server and change monitor
npm run dev
npm run watch
```

Or use concurrently to run both at once:

```bash
# Add to package.json scripts:
"dev-all": "concurrently \"npm run dev\" \"npm run watch\""
```
