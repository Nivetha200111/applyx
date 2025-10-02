# ApplyX Chrome Extension

A powerful Chrome extension for automated job applications with AI-powered resume parsing and intelligent job matching.

## 🚀 Features

### 📄 Advanced Resume Parsing
- **PDF Support**: Parse LaTeX-compiled PDFs and other PDF formats
- **Multiple Formats**: Supports PDF, TXT, DOC, DOCX files
- **AI Extraction**: Uses xAI (Grok) to extract comprehensive profile data
- **Smart Parsing**: Handles complex resume layouts and formats

### 🎯 Intelligent Job Application
- **Multi-Platform Support**: LinkedIn, Indeed, Glassdoor, and more
- **Auto-Scraping**: Automatically finds and extracts job listings
- **Smart Matching**: AI-powered job matching based on your profile
- **Auto-Apply**: Automated application submission with personalized content

### 🤖 AI-Powered Features
- **Resume Customization**: Tailor your resume for specific job requirements
- **Cover Letter Generation**: AI-generated personalized cover letters
- **Application Optimization**: Smart suggestions for improving applications
- **Job Matching**: Intelligent matching between your skills and job requirements

### 🔧 MCP Server Integration
- **Model Context Protocol**: Full MCP server integration for advanced AI features
- **Tool Ecosystem**: Comprehensive set of AI tools for job application automation
- **Extensible Architecture**: Easy to add new platforms and features

## 📦 Installation

### Prerequisites
- Chrome browser (version 88+)
- Node.js (for MCP server)
- xAI API key

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/applyx.git
   cd applyx/chrome-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```
   OPENAI_API_KEY=xai-your_xai_api_key_here
   OPENAI_BASE_URL=https://api.x.ai/v1
   OPENAI_MODEL=grok-2-1212
   ```

4. **Build the MCP server**:
   ```bash
   npm run build:mcp
   ```

5. **Load the extension in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

6. **Start the MCP server**:
   ```bash
   npm run start:mcp
   ```

## 🎯 Usage

### 1. Parse Your Resume
1. Click the ApplyX extension icon
2. Upload your resume (PDF, TXT, DOC, DOCX)
3. Click "Parse Resume" to extract your profile data
4. Review the extracted information

### 2. Find Jobs
1. Navigate to any job site (LinkedIn, Indeed, Glassdoor)
2. Click "Find Jobs on This Page" in the extension popup
3. The extension will automatically scrape job listings
4. Review the found jobs

### 3. Auto-Apply
1. Click "Auto-Apply to Jobs" in the extension popup
2. The extension will automatically:
   - Open each job posting
   - Fill out application forms
   - Submit applications
   - Track application status

### 4. Monitor Progress
- View application status in the extension popup
- Check detailed logs in the browser console
- Export application data for tracking

## 🔧 Configuration

### API Settings
- **xAI API Key**: Required for AI features
- **Base URL**: https://api.x.ai/v1
- **Model**: grok-2-1212 (recommended)

### Application Settings
- **Delay between applications**: 3 seconds (configurable)
- **Max applications per session**: 50 (configurable)
- **Auto-fill preferences**: Customizable form fields

### Platform Support
- **LinkedIn**: Full support for job scraping and applications
- **Indeed**: Job scraping and application automation
- **Glassdoor**: Job scraping and application automation
- **Custom platforms**: Extensible architecture for new sites

## 🛠️ Development

### Project Structure
```
chrome-extension/
├── manifest.json          # Extension manifest
├── popup.html             # Extension popup UI
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── content.js             # Content script
├── content.css            # Content styles
├── injected.js            # Injected script for page interaction
└── icons/                 # Extension icons
```

### Building
```bash
# Build MCP server
npm run build:mcp

# Build extension (if needed)
npm run build:extension
```

### Testing
```bash
# Test MCP server
npm run test:mcp

# Test extension functionality
npm run test:extension
```

## 🔒 Privacy & Security

- **Local Processing**: Resume parsing happens locally when possible
- **Secure API**: All API calls use HTTPS
- **Data Privacy**: No personal data stored on external servers
- **User Control**: Full control over what data is shared

## 🐛 Troubleshooting

### Common Issues

1. **Extension not loading**:
   - Check Chrome version (88+ required)
   - Ensure all files are present
   - Check browser console for errors

2. **Resume parsing fails**:
   - Verify xAI API key is correct
   - Check file format is supported
   - Ensure internet connection

3. **Job scraping not working**:
   - Verify you're on a supported job site
   - Check if the site layout has changed
   - Try refreshing the page

4. **Auto-apply not working**:
   - Ensure you have a parsed resume
   - Check if jobs were found
   - Verify form fields are accessible

### Debug Mode
Enable debug mode by adding `?debug=true` to any URL to see detailed logging.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Documentation**: Check the wiki for detailed guides

## 🔄 Updates

The extension automatically checks for updates. New versions will be available through the Chrome Web Store once published.

---

**ApplyX** - Making job applications effortless with AI! 🚀
