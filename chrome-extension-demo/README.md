# ApplyX Demo Chrome Extension

This is a standalone Chrome extension that demonstrates the ApplyX automated job application system.

## Features

- **Resume Parsing**: AI-powered resume analysis
- **Job Scanning**: Automatic job platform scanning
- **Auto-Application**: Automated job application submission
- **Real-time Terminal**: Live system log output
- **24/7 Background Mode**: Continuous monitoring simulation

## Installation

### Method 1: Load as Unpacked Extension (Recommended)

1. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Or: Chrome Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to this `chrome-extension-demo` folder
   - Select the folder and click "Select Folder"

4. **Pin the Extension**
   - Click the puzzle piece icon in Chrome toolbar
   - Find "ApplyX Demo Extension" and click the pin icon

### Method 2: Pack and Install

1. **Pack the Extension**
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select this `chrome-extension-demo` folder
   - Click "Pack Extension"

2. **Install the .crx file**
   - Drag the generated `.crx` file to Chrome
   - Click "Add extension" when prompted

## Usage

1. **Click the Extension Icon**
   - Look for the green ApplyX icon in your Chrome toolbar
   - Click to open the popup

2. **Watch the Demo**
   - The demo runs automatically when opened
   - Watch the real-time terminal output
   - See the progress through each step

3. **Restart Demo**
   - Click "RESTART DEMO" to run it again
   - The demo will cycle through all steps automatically

## Demo Flow

1. **Resume Parsing** (2-3 seconds)
   - AI model loading
   - Resume analysis
   - Profile extraction

2. **Job Scanning** (2-3 seconds)
   - Platform connections
   - Job discovery
   - Match scoring

3. **Auto-Application** (4-5 seconds)
   - Browser automation
   - Form filling
   - Application submission

4. **Background Mode** (1 second)
   - 24/7 monitoring activation
   - Continuous operation simulation

## Technical Details

- **Manifest Version**: 3
- **Popup Size**: 384×384 pixels
- **Permissions**: activeTab, storage, tabs
- **No external dependencies** (uses CDN for Tailwind CSS)

## Troubleshooting

### Extension Not Loading
- Make sure Developer mode is enabled
- Check that all files are in the correct folder
- Try refreshing the extensions page

### Demo Not Starting
- Click the extension icon again
- Check browser console for errors
- Try the "RESTART DEMO" button

### Styling Issues
- Ensure internet connection for Tailwind CSS CDN
- Check that popup.html is loading correctly

## File Structure

```
chrome-extension-demo/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Demo logic and animations
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Customization

You can modify the demo by editing:
- `popup.html` - UI layout and styling
- `popup.js` - Demo logic and timing
- `manifest.json` - Extension permissions and settings

The demo is designed to be self-contained and doesn't require any external APIs or services.

