# Loading Test Data for Testing

Quick guide for loading test data into the Level Editor during development.

## Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```
   Server runs on **http://localhost:3000**

2. **Load test data:**
   Navigate to **http://localhost:3000/load-test-data.html**

3. **Click "Load Test Data into localStorage"**

4. **Click "Open Level Editor"**

You'll now see a level with:
- 5 different platform types (grass, stone, ice, basic, metal)
- 6 objects (button, door, teleport, tree, coin, checkpoint)
- 2 spawn points (player and enemy)
- Sky blue background with grid

## Why Load Test Data?

Testing with empty canvas is not realistic. Test data gives you:
- Pre-populated level to test rendering
- Multiple object types to test interactions
- Realistic data to test scrolling, zoom, selection
- Consistent baseline for manual testing

## Methods to Load Data

### Method 1: Test Data Loader (Recommended)

**Best for:** Quick manual testing

1. Go to http://localhost:3000/load-test-data.html
2. Click "Load Test Data into localStorage"
3. Click "Open Level Editor"
4. Test your feature
5. Click "Clear localStorage" to reset

### Method 2: Browser Console

**Best for:** Quick one-off testing without switching pages

1. Open http://localhost:3000
2. Press F12 → Console tab
3. Paste test data script (see `client/public/load-test-data.js`)
4. Press Enter
5. Refresh page

### Method 3: Import JSON File

**Best for:** Testing with specific level configurations

1. Create a `.json` file with level data
2. In Level Editor, click "Import" button
3. Select your JSON file
4. Level loads immediately

## Clearing Test Data

### Via Test Data Loader
1. Go to http://localhost:3000/load-test-data.html
2. Click "Clear localStorage"

### Via Browser Console
```javascript
localStorage.clear();
location.reload();
```

### Via DevTools
1. F12 → Application tab (Chrome) or Storage tab (Firefox)
2. localStorage → http://localhost:3000
3. Delete `levelEditor_levels` key

## Test Data Files

- `client/public/load-test-data.html` - Interactive test data loader
- `test-resources/test-level-data.json` - Sample test data (reference only)

## Important Notes

- **localStorage is origin-specific** - Only works on http://localhost:3000
- **File protocol won't work** - Must serve via dev server
- **Port matters** - Must use the correct port (check terminal output)
- **Auto-save** - Level Editor auto-saves every 5 seconds to localStorage

## Troubleshooting

**Data not loading?**
- Check console for errors
- Verify you're on http://localhost:3000 (not file://)
- Clear localStorage and try again

**Wrong port?**
- Check terminal output for actual port
- Default is 3000 (configurable via PORT env variable)

For JSON structure and level data format, see `docs/LEVEL_DATA_FORMAT.md`
