// Terminal Overlay Script for ApplyX
class TerminalOverlay {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentStep = 0;
    this.totalSteps = 0;
    this.applicationsSent = 0;
    this.applicationsSuccessful = 0;
    this.applicationsFailed = 0;
    this.jobs = [];
    this.currentJob = null;
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.startProcess();
  }
  
  setupEventListeners() {
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('stopBtn').addEventListener('click', () => this.stopProcess());
    document.getElementById('closeBtn').addEventListener('click', () => this.closeOverlay());
  }
  
  async startProcess() {
    this.isRunning = true;
    this.totalSteps = 8; // Total number of steps
    
    await this.delay(1000);
    await this.step1_InitializeSystem();
    await this.delay(1500);
    await this.step2_ParseResume();
    await this.delay(2000);
    await this.step3_ScanJobs();
    await this.delay(1500);
    await this.step4_StartApplications();
    await this.delay(1000);
    await this.step5_ProcessJobs();
    await this.delay(1000);
    await this.step6_GenerateReports();
    await this.delay(1000);
    await this.step7_CompleteProcess();
  }
  
  async step1_InitializeSystem() {
    this.addLine('Initializing AI engine...', 'output');
    await this.delay(500);
    this.addLine('Loading resume parser...', 'output');
    await this.delay(500);
    this.addLine('Connecting to job databases...', 'output');
    await this.delay(500);
    this.addLine('✓ System initialized successfully', 'success');
    this.updateProgress(1);
  }
  
  async step2_ParseResume() {
    this.addLine('', '');
    this.addCommand('./applyx --parse-resume');
    this.addLine('Parsing resume: resume.pdf', 'output');
    await this.delay(800);
    this.addLine('Extracting text content...', 'output');
    await this.delay(600);
    this.addLine('Analyzing skills and experience...', 'output');
    await this.delay(800);
    this.addLine('Generating profile data...', 'output');
    await this.delay(600);
    this.addLine('✓ Resume parsed successfully', 'success');
    this.updateProgress(2);
  }
  
  async step3_ScanJobs() {
    this.addLine('', '');
    this.addCommand('./applyx --scan-jobs');
    this.addLine('Scanning job platforms...', 'output');
    await this.delay(1000);
    this.addLine('Found 47 job listings', 'output');
    await this.delay(800);
    this.addLine('Filtering by relevance...', 'output');
    await this.delay(1000);
    this.addLine('Selected 12 high-priority jobs', 'output');
    await this.delay(600);
    this.addLine('✓ Job scan completed', 'success');
    this.updateProgress(3);
  }
  
  async step4_StartApplications() {
    this.addLine('', '');
    this.addCommand('./applyx --auto-apply');
    this.addLine('Starting automated application process...', 'output');
    await this.delay(800);
    this.addLine('Processing job applications...', 'output');
    await this.delay(600);
    this.addLine('', '');
    this.updateProgress(4);
  }
  
  async step5_ProcessJobs() {
    // Simulate processing multiple jobs with more realistic scenarios
    const jobs = [
      { title: 'Senior Software Engineer', company: 'TechCorp Inc.', platform: 'LinkedIn', status: 'success', time: 3200 },
      { title: 'Full Stack Developer', company: 'StartupXYZ', platform: 'Indeed', status: 'success', time: 2800 },
      { title: 'React Developer', company: 'WebSolutions', platform: 'Glassdoor', status: 'success', time: 2500 },
      { title: 'Node.js Developer', company: 'CloudTech', platform: 'LinkedIn', status: 'failed', reason: 'Form validation error', time: 1800 },
      { title: 'Frontend Engineer', company: 'DesignStudio', platform: 'Indeed', status: 'success', time: 2200 },
      { title: 'JavaScript Developer', company: 'CodeMasters', platform: 'Glassdoor', status: 'success', time: 2600 },
      { title: 'Software Engineer', company: 'DataFlow', platform: 'LinkedIn', status: 'success', time: 3000 },
      { title: 'Web Developer', company: 'CreativeAgency', platform: 'Indeed', status: 'success', time: 2400 },
      { title: 'Full Stack Engineer', company: 'InnovationLab', platform: 'Glassdoor', status: 'success', time: 2700 },
      { title: 'React Developer', company: 'TechStartup', platform: 'LinkedIn', status: 'success', time: 2300 },
      { title: 'Frontend Developer', company: 'DigitalAgency', platform: 'Indeed', status: 'success', time: 2100 },
      { title: 'Software Developer', company: 'EnterpriseCorp', platform: 'Glassdoor', status: 'success', time: 2900 }
    ];
    
    this.addLine('', '');
    this.addLine('=== JOB APPLICATION PROCESS ===', 'info');
    this.addLine('', '');
    
    for (let i = 0; i < jobs.length; i++) {
      if (this.isPaused) {
        await this.waitForResume();
      }
      
      const job = jobs[i];
      this.currentJob = job;
      
      this.addLine(`[${i + 1}/${jobs.length}] ${job.title}`, 'info');
      this.addLine(`    Company: ${job.company}`, 'output');
      this.addLine(`    Platform: ${job.platform}`, 'output');
      this.addLine('', '');
      
      // Step-by-step application process
      this.addLine('    → Navigating to job page...', 'output');
      await this.delay(400);
      
      this.addLine('    → Analyzing application form...', 'output');
      await this.delay(300);
      
      this.addLine('    → Filling personal information...', 'output');
      await this.delay(500);
      
      this.addLine('    → Uploading resume file...', 'output');
      await this.delay(400);
      
      this.addLine('    → Generating personalized cover letter...', 'output');
      await this.delay(600);
      
      this.addLine('    → Answering application questions...', 'output');
      await this.delay(400);
      
      this.addLine('    → Validating form data...', 'output');
      await this.delay(300);
      
      this.addLine('    → Submitting application...', 'output');
      await this.delay(500);
      
      if (job.status === 'success') {
        this.addLine(`    ✓ Application submitted successfully (${job.time}ms)`, 'success');
        this.applicationsSuccessful++;
      } else {
        this.addLine(`    ✗ Application failed: ${job.reason || 'Unknown error'}`, 'error');
        this.applicationsFailed++;
      }
      
      this.applicationsSent++;
      this.updateProgress(4 + (i + 1) / jobs.length);
      
      // Add some realistic delays between applications
      if (i < jobs.length - 1) {
        this.addLine('    → Waiting before next application...', 'output');
        await this.delay(800);
      }
      
      this.addLine('', '');
    }
  }
  
  async step6_GenerateReports() {
    this.addLine('', '');
    this.addLine('Generating application report...', 'output');
    await this.delay(800);
    this.addLine('Calculating success rates...', 'output');
    await this.delay(600);
    this.addLine('Preparing summary data...', 'output');
    await this.delay(600);
    this.addLine('✓ Report generated successfully', 'success');
    this.updateProgress(7);
  }
  
  async step7_CompleteProcess() {
    this.addLine('', '');
    this.addLine('=== APPLICATION PROCESS COMPLETE ===', 'success');
    this.addLine('', '');
    this.addLine(`Total Applications Sent: ${this.applicationsSent}`, 'info');
    this.addLine(`Successful Applications: ${this.applicationsSuccessful}`, 'success');
    this.addLine(`Failed Applications: ${this.applicationsFailed}`, 'error');
    this.addLine(`Success Rate: ${((this.applicationsSuccessful / this.applicationsSent) * 100).toFixed(1)}%`, 'info');
    this.addLine('', '');
    this.addLine('Process completed at ' + new Date().toLocaleTimeString(), 'info');
    this.addLine('', '');
    this.addLine('Press CLOSE to exit terminal', 'warning');
    this.updateProgress(8);
    this.isRunning = false;
  }
  
  addLine(text, type = 'output') {
    const content = document.getElementById('terminalContent');
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    if (type === 'command') {
      line.innerHTML = `<span class="terminal-prompt">root@applyx:~$</span> <span class="terminal-command">${text}</span>`;
    } else if (type === 'success') {
      line.innerHTML = `<span class="terminal-success">${text}</span>`;
    } else if (type === 'error') {
      line.innerHTML = `<span class="terminal-error">${text}</span>`;
    } else if (type === 'warning') {
      line.innerHTML = `<span class="terminal-warning">${text}</span>`;
    } else if (type === 'info') {
      line.innerHTML = `<span class="terminal-info">${text}</span>`;
    } else {
      line.innerHTML = `<span class="terminal-output">${text}</span>`;
    }
    
    content.appendChild(line);
    content.scrollTop = content.scrollHeight;
  }
  
  addCommand(command) {
    this.addLine(command, 'command');
  }
  
  updateProgress(step) {
    const progress = (step / this.totalSteps) * 100;
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${Math.round(progress)}%`;
    }
  }
  
  togglePause() {
    this.isPaused = !this.isPaused;
    const btn = document.getElementById('pauseBtn');
    btn.textContent = this.isPaused ? 'RESUME' : 'PAUSE';
    
    if (this.isPaused) {
      this.addLine('Process paused by user', 'warning');
    } else {
      this.addLine('Process resumed', 'info');
    }
  }
  
  async waitForResume() {
    while (this.isPaused) {
      await this.delay(100);
    }
  }
  
  stopProcess() {
    this.isRunning = false;
    this.addLine('Process stopped by user', 'error');
    this.addLine('Cleaning up...', 'output');
    this.addLine('Process terminated', 'error');
  }
  
  closeOverlay() {
    // Send message to parent to close overlay
    if (window.parent) {
      window.parent.postMessage({ action: 'closeOverlay' }, '*');
    }
    // Or close the window if opened in new tab
    window.close();
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize terminal overlay when page loads
document.addEventListener('DOMContentLoaded', () => {
  new TerminalOverlay();
});

// Handle messages from parent window
window.addEventListener('message', (event) => {
  if (event.data.action === 'startProcess') {
    // Start the process
  }
});
