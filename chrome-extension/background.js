// Background script for ApplyX Chrome Extension

const API_BASE_URL = 'https://applyx.vercel.app/api';

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'parseResume':
      handleParseResume(request.data, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'testConnection':
      handleTestConnection(sendResponse);
      return true;
      
    case 'scrapeJobs':
      handleScrapeJobs(sendResponse);
      return true;
      
    case 'autoApply':
      handleAutoApply(request.data, sendResponse);
      return true;
  }
});

async function handleParseResume(data, sendResponse) {
  try {
    console.log('Parsing resume:', data.filename);
    console.log('File type:', data.type);
    console.log('Content length:', data.content.length);
    
    // For PDF files, we need to handle them differently
    if (data.type === 'application/pdf' || data.filename.toLowerCase().endsWith('.pdf')) {
      // For PDFs, we'll send the base64 content directly to a PDF parsing endpoint
      const response = await fetch(`${API_BASE_URL}/parse-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: data.filename,
          content: data.content,
          type: data.type
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        sendResponse({ success: true, profile: result.profile });
      } else {
        sendResponse({ success: false, error: result.error || 'Unknown parsing error' });
      }
    } else {
      // For text files, convert base64 to text
      const text = await base64ToText(data.content);
      console.log('Extracted text length:', text.length);
      console.log('Text preview:', text.substring(0, 200));
      
      // Send to API
      const response = await fetch(`${API_BASE_URL}/parse-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          filename: data.filename
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.profile) {
        sendResponse({ success: true, profile: result.profile });
      } else {
        sendResponse({ success: false, error: result.error || 'No profile data returned' });
      }
    }
  } catch (error) {
    console.error('Parse resume error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleTestConnection(sendResponse) {
  try {
    const response = await fetch(`${API_BASE_URL}/debug`);
    
    if (response.ok) {
      const result = await response.json();
      sendResponse({ success: true, data: result });
    } else {
      sendResponse({ success: false, error: `HTTP ${response.status}` });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleScrapeJobs(sendResponse) {
  try {
    // Get active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject job scraping script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: scrapeJobsFromPage
    });

    if (results && results[0] && results[0].result) {
      sendResponse({ success: true, jobs: results[0].result });
    } else {
      sendResponse({ success: false, error: 'No jobs found on this page' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function handleAutoApply(data, sendResponse) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject auto-apply script
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: autoApplyToJobs,
      args: [data.profile, data.jobs]
    });

    if (results && results[0] && results[0].result) {
      sendResponse({ success: true, appliedCount: results[0].result.appliedCount });
    } else {
      sendResponse({ success: false, error: 'Auto-apply failed' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Helper function to convert base64 to text
function base64ToText(base64) {
  try {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = atob(base64Data);
    return binaryString;
  } catch (error) {
    throw new Error('Failed to decode file: ' + error.message);
  }
}

// Job scraping function (injected into page)
function scrapeJobsFromPage() {
  const jobs = [];
  
  // LinkedIn job scraping
  if (window.location.hostname.includes('linkedin.com')) {
    const jobCards = document.querySelectorAll('[data-job-id], .jobs-search-results__list-item');
    jobCards.forEach(card => {
      const titleElement = card.querySelector('.job-card-list__title, .jobs-unified-top-card__job-title');
      const companyElement = card.querySelector('.job-card-container__company-name, .jobs-unified-top-card__company-name');
      const locationElement = card.querySelector('.job-card-container__metadata-item, .jobs-unified-top-card__bullet');
      const linkElement = card.querySelector('a[href*="/jobs/view/"]');
      
      if (titleElement && companyElement && linkElement) {
        jobs.push({
          title: titleElement.textContent.trim(),
          company: companyElement.textContent.trim(),
          location: locationElement ? locationElement.textContent.trim() : 'Remote',
          url: linkElement.href,
          platform: 'linkedin'
        });
      }
    });
  }
  
  // Indeed job scraping
  else if (window.location.hostname.includes('indeed.com')) {
    const jobCards = document.querySelectorAll('[data-jk], .jobsearch-SerpJobCard');
    jobCards.forEach(card => {
      const titleElement = card.querySelector('.jobTitle a, .jobsearch-JobInfoHeader-title');
      const companyElement = card.querySelector('.companyName, .jobsearch-CompanyReview');
      const locationElement = card.querySelector('.companyLocation, .jobsearch-JobInfoHeader-subtitle');
      
      if (titleElement && companyElement) {
        jobs.push({
          title: titleElement.textContent.trim(),
          company: companyElement.textContent.trim(),
          location: locationElement ? locationElement.textContent.trim() : 'Remote',
          url: titleElement.href || window.location.href,
          platform: 'indeed'
        });
      }
    });
  }
  
  // Glassdoor job scraping
  else if (window.location.hostname.includes('glassdoor.com')) {
    const jobCards = document.querySelectorAll('[data-test="job-listing"], .react-job-listing');
    jobCards.forEach(card => {
      const titleElement = card.querySelector('[data-test="job-title"], .jobTitle');
      const companyElement = card.querySelector('[data-test="employer-name"], .employerName');
      const locationElement = card.querySelector('[data-test="job-location"], .jobLocation');
      
      if (titleElement && companyElement) {
        jobs.push({
          title: titleElement.textContent.trim(),
          company: companyElement.textContent.trim(),
          location: locationElement ? locationElement.textContent.trim() : 'Remote',
          url: window.location.href,
          platform: 'glassdoor'
        });
      }
    });
  }
  
  return jobs;
}

// Auto-apply function (injected into page)
function autoApplyToJobs(profile, jobs) {
  let appliedCount = 0;
  
  jobs.forEach((job, index) => {
    setTimeout(() => {
      try {
        // Navigate to job page
        window.open(job.url, '_blank');
        
        // Wait for page to load, then auto-fill
        setTimeout(() => {
          // This would be implemented based on the specific job site
          // For now, we'll just simulate the application
          console.log(`Applying to ${job.title} at ${job.company}`);
          appliedCount++;
        }, 2000);
      } catch (error) {
        console.error(`Error applying to ${job.title}:`, error);
      }
    }, index * 3000); // 3 second delay between applications
  });
  
  return { appliedCount };
}
