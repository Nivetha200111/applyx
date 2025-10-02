// Popup script for ApplyX Chrome Extension

let currentProfile = null;
let currentJobs = [];
let selectedFile = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Load saved profile
  const result = await chrome.storage.local.get(['profile', 'settings']);
  if (result.profile) {
    currentProfile = result.profile;
    showProfilePreview(result.profile);
  }
  
  // Set up event listeners
  setupEventListeners();
});

function setupEventListeners() {
  const fileInput = document.getElementById('resumeFile');
  const parseBtn = document.getElementById('parseBtn');
  const scrapeJobsBtn = document.getElementById('scrapeJobsBtn');
  const applyBtn = document.getElementById('applyBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const testConnectionBtn = document.getElementById('testConnectionBtn');

  fileInput.addEventListener('change', handleFileSelect);
  parseBtn.addEventListener('click', parseResume);
  scrapeJobsBtn.addEventListener('click', scrapeJobs);
  applyBtn.addEventListener('click', autoApply);
  settingsBtn.addEventListener('click', openSettings);
  testConnectionBtn.addEventListener('click', testConnection);
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  const parseBtn = document.getElementById('parseBtn');
  const fileInput = document.getElementById('fileInput');
  
  if (file) {
    selectedFile = file; // Store the file globally
    parseBtn.disabled = false;
    showStatus('FILE SELECTED: ' + file.name, 'info');
    
    // Update the display without removing the input
    const displayDiv = fileInput.querySelector('.file-display') || fileInput.appendChild(document.createElement('div'));
    displayDiv.className = 'file-display';
    displayDiv.innerHTML = `
      <div class="terminal-prompt">[SELECTED]</div>
      <div>${file.name}</div>
      <div style="font-size: 10px; color: #00aa00;">SIZE: ${(file.size / 1024).toFixed(1)} KB</div>
    `;
  } else {
    selectedFile = null;
    parseBtn.disabled = true;
    
    // Reset the display
    const displayDiv = fileInput.querySelector('.file-display');
    if (displayDiv) {
      displayDiv.innerHTML = `
        <div class="terminal-prompt">[UPLOAD]</div>
        <div>SELECT RESUME FILE (PDF/TXT/DOC)</div>
      `;
    }
  }
}

async function parseResume() {
  if (!selectedFile) {
    showStatus('ERROR: NO FILE SELECTED', 'error');
    return;
  }

  showStatus('PARSING RESUME...', 'info');
  setLoading(true);

  try {
    console.log('Starting resume parse for:', selectedFile.name);
    console.log('File type:', selectedFile.type);
    console.log('File size:', selectedFile.size);
    
    // Convert file to base64 for transmission
    const base64 = await fileToBase64(selectedFile);
    console.log('Base64 length:', base64.length);
    
    // Send to background script for processing
    const response = await chrome.runtime.sendMessage({
      action: 'parseResume',
      data: {
        filename: selectedFile.name,
        content: base64,
        type: selectedFile.type
      }
    });

    console.log('Background script response:', response);

    if (response.success) {
      currentProfile = response.profile;
      console.log('Parsed profile:', currentProfile);
      await chrome.storage.local.set({ profile: currentProfile });
      showProfilePreview(response.profile);
      showStatus('SUCCESS: RESUME PARSED', 'success');
    } else {
      console.error('Parse error:', response.error);
      showStatus('ERROR: ' + response.error, 'error');
    }
  } catch (error) {
    console.error('Parse resume error:', error);
    showStatus('ERROR: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}

async function scrapeJobs() {
  showStatus('Scraping jobs from current page...', 'info');
  setLoading(true);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'scrapeJobs'
    });

    if (response.success) {
      currentJobs = response.jobs;
      showStatus(`Found ${response.jobs.length} jobs`, 'success');
      
      const applyBtn = document.getElementById('applyBtn');
      applyBtn.disabled = false;
    } else {
      showStatus('Error: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}

async function autoApply() {
  if (!currentProfile) {
    showStatus('ERROR: NO PROFILE DATA', 'error');
    return;
  }

  showStatus('LAUNCHING TERMINAL PROCESS...', 'info');
  setLoading(true);

  try {
    // Open terminal overlay in new window
    const terminalWindow = window.open(
      chrome.runtime.getURL('terminal-overlay.html'),
      'ApplyXTerminal',
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    );
    
    // Send profile data to terminal
    setTimeout(() => {
      terminalWindow.postMessage({
        action: 'startProcess',
        profile: currentProfile,
        jobs: currentJobs
      }, '*');
    }, 1000);
    
    showStatus('TERMINAL PROCESS LAUNCHED', 'success');
  } catch (error) {
    showStatus('ERROR: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}

function openSettings() {
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
}

async function testConnection() {
  showStatus('Testing API connection...', 'info');
  setLoading(true);

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'testConnection'
    });

    if (response.success) {
      showStatus('API connection successful!', 'success');
    } else {
      showStatus('API connection failed: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
}

function showProfilePreview(profile) {
  const preview = document.getElementById('profilePreview');
  preview.innerHTML = `
    <div class="terminal-prompt">[PROFILE DATA]</div>
    <div class="terminal-preview-item"><strong>NAME:</strong> ${profile.name || 'NOT_FOUND'}</div>
    <div class="terminal-preview-item"><strong>EMAIL:</strong> ${profile.email || 'NOT_FOUND'}</div>
    <div class="terminal-preview-item"><strong>SKILLS:</strong> ${Array.isArray(profile.skills) ? profile.skills.join(', ') : 'NOT_FOUND'}</div>
    <div class="terminal-preview-item"><strong>EXP:</strong> ${profile.experience_years || 0} YEARS</div>
  `;
  preview.classList.remove('hidden');
}

function showStatus(message, type) {
  const status = document.getElementById('parseStatus');
  status.textContent = message;
  status.className = `terminal-status ${type}`;
  status.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    status.classList.add('hidden');
  }, 5000);
}

function setLoading(loading) {
  const buttons = document.querySelectorAll('.terminal-btn');
  buttons.forEach(btn => {
    btn.disabled = loading;
    if (loading) {
      btn.innerHTML = '<span class="terminal-loading"></span> PROCESSING...';
    } else {
      // Reset button text
      if (btn.id === 'parseBtn') btn.innerHTML = 'PARSE RESUME';
      else if (btn.id === 'scrapeJobsBtn') btn.innerHTML = 'SCAN JOBS';
      else if (btn.id === 'applyBtn') btn.innerHTML = 'AUTO-APPLY';
      else if (btn.id === 'testConnectionBtn') btn.innerHTML = 'TEST API';
    }
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
