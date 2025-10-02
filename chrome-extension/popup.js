// Popup script for ApplyX Chrome Extension

let currentProfile = null;
let currentJobs = [];

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
    parseBtn.disabled = false;
    showStatus('FILE SELECTED: ' + file.name, 'info');
    fileInput.innerHTML = `
      <div class="terminal-prompt">[SELECTED]</div>
      <div>${file.name}</div>
      <div style="font-size: 10px; color: #00aa00;">SIZE: ${(file.size / 1024).toFixed(1)} KB</div>
    `;
  } else {
    parseBtn.disabled = true;
    fileInput.innerHTML = `
      <input type="file" id="resumeFile" accept=".pdf,.txt,.doc,.docx">
      <div class="terminal-prompt">[UPLOAD]</div>
      <div>SELECT RESUME FILE (PDF/TXT/DOC)</div>
    `;
    // Re-attach event listener
    document.getElementById('resumeFile').addEventListener('change', handleFileSelect);
  }
}

async function parseResume() {
  const fileInput = document.getElementById('resumeFile');
  const file = fileInput.files[0];
  
  if (!file) {
    showStatus('ERROR: NO FILE SELECTED', 'error');
    return;
  }

  showStatus('PARSING RESUME...', 'info');
  setLoading(true);

  try {
    // Convert file to base64 for transmission
    const base64 = await fileToBase64(file);
    
    // Send to background script for processing
    const response = await chrome.runtime.sendMessage({
      action: 'parseResume',
      data: {
        filename: file.name,
        content: base64,
        type: file.type
      }
    });

    if (response.success) {
      currentProfile = response.profile;
      await chrome.storage.local.set({ profile: currentProfile });
      showProfilePreview(response.profile);
      showStatus('SUCCESS: RESUME PARSED', 'success');
    } else {
      showStatus('ERROR: ' + response.error, 'error');
    }
  } catch (error) {
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
    showStatus('Please parse a resume first', 'error');
    return;
  }

  if (currentJobs.length === 0) {
    showStatus('Please scrape jobs first', 'error');
    return;
  }

  showStatus('Starting auto-application process...', 'info');
  setLoading(true);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'autoApply',
      data: {
        profile: currentProfile,
        jobs: currentJobs
      }
    });

    if (response.success) {
      showStatus(`Applied to ${response.appliedCount} jobs successfully!`, 'success');
    } else {
      showStatus('Error: ' + response.error, 'error');
    }
  } catch (error) {
    showStatus('Error: ' + error.message, 'error');
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
