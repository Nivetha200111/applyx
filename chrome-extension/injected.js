// Injected script for advanced PDF parsing and MCP integration

class ApplyXPDFParser {
  constructor() {
    this.pdfjsLib = null;
    this.initializePDFJS();
  }

  async initializePDFJS() {
    try {
      // Load PDF.js dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        this.pdfjsLib = window.pdfjsLib;
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to load PDF.js:', error);
    }
  }

  async parsePDF(file) {
    if (!this.pdfjsLib) {
      throw new Error('PDF.js not loaded');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await this.pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText;
    } catch (error) {
      throw new Error('PDF parsing failed: ' + error.message);
    }
  }
}

class ApplyXMCPClient {
  constructor() {
    this.baseUrl = 'https://applyx.vercel.app/api';
  }

  async parseResume(file) {
    try {
      const parser = new ApplyXPDFParser();
      let text;

      if (file.type === 'application/pdf') {
        text = await parser.parsePDF(file);
      } else {
        text = await file.text();
      }

      const response = await fetch(`${this.baseUrl}/parse-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          filename: file.name
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error('Resume parsing failed: ' + error.message);
    }
  }

  async scrapeJobs() {
    const jobs = [];
    const currentUrl = window.location.href;

    // LinkedIn job scraping
    if (currentUrl.includes('linkedin.com/jobs')) {
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
            platform: 'linkedin',
            description: this.extractJobDescription(card)
          });
        }
      });
    }
    
    // Indeed job scraping
    else if (currentUrl.includes('indeed.com')) {
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
            platform: 'indeed',
            description: this.extractJobDescription(card)
          });
        }
      });
    }
    
    // Glassdoor job scraping
    else if (currentUrl.includes('glassdoor.com')) {
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
            platform: 'glassdoor',
            description: this.extractJobDescription(card)
          });
        }
      });
    }

    return jobs;
  }

  extractJobDescription(card) {
    const descriptionElement = card.querySelector('.job-snippet, .jobsearch-JobMetadataHeader-summary, .jobDescription');
    return descriptionElement ? descriptionElement.textContent.trim() : '';
  }

  async autoApply(profile, jobs) {
    let appliedCount = 0;
    const results = [];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      try {
        // Open job in new tab
        const newTab = window.open(job.url, '_blank');
        
        // Wait for page to load
        await this.waitForPageLoad(newTab);
        
        // Auto-fill application form
        const success = await this.fillApplicationForm(newTab, profile, job);
        
        if (success) {
          appliedCount++;
          results.push({ job: job.title, company: job.company, status: 'success' });
        } else {
          results.push({ job: job.title, company: job.company, status: 'failed' });
        }
        
        // Close tab after application
        newTab.close();
        
        // Delay between applications
        await this.delay(3000);
        
      } catch (error) {
        console.error(`Error applying to ${job.title}:`, error);
        results.push({ job: job.title, company: job.company, status: 'error', error: error.message });
      }
    }

    return { appliedCount, results };
  }

  async waitForPageLoad(tab) {
    return new Promise((resolve) => {
      const checkLoaded = () => {
        try {
          if (tab.document.readyState === 'complete') {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        } catch (error) {
          // Tab might be closed or inaccessible
          resolve();
        }
      };
      checkLoaded();
    });
  }

  async fillApplicationForm(tab, profile, job) {
    try {
      // This would be implemented based on the specific job site
      // For now, we'll simulate the form filling
      
      const doc = tab.document;
      
      // LinkedIn form filling
      if (job.platform === 'linkedin') {
        const nameField = doc.querySelector('input[name="name"], input[placeholder*="name"]');
        const emailField = doc.querySelector('input[name="email"], input[type="email"]');
        const phoneField = doc.querySelector('input[name="phone"], input[type="tel"]');
        
        if (nameField) nameField.value = profile.name || '';
        if (emailField) emailField.value = profile.email || '';
        if (phoneField) phoneField.value = profile.phone || '';
      }
      
      // Indeed form filling
      else if (job.platform === 'indeed') {
        const nameField = doc.querySelector('input[name="name"], input[placeholder*="name"]');
        const emailField = doc.querySelector('input[name="email"], input[type="email"]');
        
        if (nameField) nameField.value = profile.name || '';
        if (emailField) emailField.value = profile.email || '';
      }
      
      return true;
    } catch (error) {
      console.error('Form filling error:', error);
      return false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize the MCP client
window.applyXMCP = new ApplyXMCPClient();

// Add visual indicators for job cards
function addJobIndicators() {
  const jobCards = document.querySelectorAll('[data-job-id], .jobs-search-results__list-item, [data-jk], .jobsearch-SerpJobCard');
  
  jobCards.forEach(card => {
    if (!card.querySelector('.applyx-indicator')) {
      const indicator = document.createElement('div');
      indicator.className = 'applyx-indicator';
      indicator.innerHTML = '🚀 ApplyX Ready';
      indicator.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: #4CAF50;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
        font-weight: bold;
        z-index: 1000;
      `;
      card.style.position = 'relative';
      card.appendChild(indicator);
    }
  });
}

// Run job indicators when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addJobIndicators);
} else {
  addJobIndicators();
}

// Re-run indicators when new content loads (for SPA sites)
const observer = new MutationObserver(() => {
  addJobIndicators();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
