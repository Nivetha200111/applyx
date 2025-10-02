// Content script for ApplyX Chrome Extension

// Inject the main functionality into the page
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'scrapeJobs':
      handleScrapeJobs(sendResponse);
      break;
    case 'autoApply':
      handleAutoApply(request.data, sendResponse);
      break;
  }
});

function handleScrapeJobs(sendResponse) {
  try {
    const jobs = scrapeJobsFromPage();
    sendResponse({ success: true, jobs: jobs });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

function handleAutoApply(data, sendResponse) {
  try {
    const result = autoApplyToJobs(data.profile, data.jobs);
    sendResponse({ success: true, appliedCount: result.appliedCount });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

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

function autoApplyToJobs(profile, jobs) {
  let appliedCount = 0;
  
  jobs.forEach((job, index) => {
    setTimeout(() => {
      try {
        // Navigate to job page
        window.open(job.url, '_blank');
        
        // Wait for page to load, then auto-fill
        setTimeout(() => {
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
