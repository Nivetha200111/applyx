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
      // Extract text from PDF locally and send to parse-text endpoint
      const text = await extractTextFromPDF(data.content);
      console.log('Extracted PDF text length:', text.length);
      console.log('PDF text preview:', text.substring(0, 200));
      
      // Send to working parse-text endpoint
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

// Helper function to extract text from PDF
async function extractTextFromPDF(base64) {
  try {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const binaryString = atob(base64Data);
    
    // Convert to text and extract readable content
    const pdfText = binaryString;
    console.log('PDF binary string length:', pdfText.length);
    
    // Method 1: Extract text between PDF objects (BT...ET)
    let extractedText = '';
    const textMatches = pdfText.match(/BT\s+([^E]+)ET/g);
    if (textMatches && textMatches.length > 0) {
      extractedText = textMatches
        .map(match => match.replace(/BT\s+/, '').replace(/ET/, ''))
        .join(' ')
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      console.log('Method 1 - BT/ET extraction:', extractedText.length, 'chars');
    }
    
    // Method 2: Extract text from stream objects
    if (extractedText.length < 100) {
      const streamMatches = pdfText.match(/stream\s+([^e]+)endstream/g);
      if (streamMatches && streamMatches.length > 0) {
        const streamText = streamMatches
          .map(match => match.replace(/stream\s+/, '').replace(/endstream/, ''))
          .join(' ')
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        console.log('Method 2 - Stream extraction:', streamText.length, 'chars');
        if (streamText.length > extractedText.length) {
          extractedText = streamText;
        }
      }
    }
    
    // Method 3: Extract any readable ASCII text
    if (extractedText.length < 100) {
      const asciiText = pdfText
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      console.log('Method 3 - ASCII extraction:', asciiText.length, 'chars');
      if (asciiText.length > extractedText.length) {
        extractedText = asciiText;
      }
    }
    
    // Method 4: Look for common resume keywords and extract surrounding text
    if (extractedText.length < 100) {
      const keywords = ['resume', 'cv', 'experience', 'education', 'skills', 'contact', 'email', 'phone'];
      let keywordText = '';
      
      for (const keyword of keywords) {
        const keywordIndex = pdfText.toLowerCase().indexOf(keyword);
        if (keywordIndex !== -1) {
          const start = Math.max(0, keywordIndex - 200);
          const end = Math.min(pdfText.length, keywordIndex + 200);
          const context = pdfText.substring(start, end)
            .replace(/[^\x20-\x7E\n\r]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          keywordText += context + ' ';
        }
      }
      
      if (keywordText.length > extractedText.length) {
        extractedText = keywordText;
        console.log('Method 4 - Keyword extraction:', extractedText.length, 'chars');
      }
    }
    
    // Clean up the final text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit to 10k chars
    
    console.log('Final extracted text length:', extractedText.length);
    console.log('Final text preview:', extractedText.substring(0, 300));
    
    return extractedText || 'PDF content extracted but may be incomplete. Please try a text version.';
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract PDF text: ' + error.message);
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
