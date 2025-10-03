// ApplyX Terminal Demo - Professional Linux Terminal Style
let currentStep = 0;
let isProcessing = false;
let profile = null;
let jobs = [];
let applications = [];
let terminalOutput = [];
let hasStarted = false;
let demoInterval = null;

// DOM Elements
const terminalContent = document.getElementById('terminal-content');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!hasStarted) {
        hasStarted = true;
        startDemo();
    }
});

function startDemo() {
    // Clear terminal
    terminalContent.innerHTML = '';
    
    // Initial state (0-2 sec)
    addTerminalLine('user@applyx:~$ ./applyx --init', 'command');
    addTerminalLine('Initializing ApplyX Job Automation System...', 'info');
    addTerminalLine('Loading AI models and job scrapers...', 'info');
    
    // Set up profile immediately
    profile = {
        name: "John Smith",
        email: "john.smith@email.com",
        skills: ["React", "Node.js", "Python", "AWS", "TypeScript"],
        experience: 5,
        location: "San Francisco, CA"
    };
    
    // Start the animated sequence
    setTimeout(() => runAnimatedSequence(), 2000);
}

function runAnimatedSequence() {
    // Step 1: Resume parsed (2-3 sec)
    setTimeout(() => {
        addTerminalLine('user@applyx:~$ ./applyx --parse-resume resume.pdf', 'command');
        addTerminalLine('Parsing resume...', 'info');
        addTerminalLine('✓ Resume parsed successfully', 'success');
        addTerminalLine(`Profile: ${profile.name} | ${profile.skills.length} skills | ${profile.experience} years exp`, 'info');
        currentStep = 1;
    }, 500);
    
    // Step 2: Scanning phase (3-7 sec)
    setTimeout(() => {
        addTerminalLine('user@applyx:~$ ./applyx --scan-jobs', 'command');
        addTerminalLine('Starting job platform scanners...', 'info');
        
        setTimeout(() => {
            addTerminalLine('Scanning LinkedIn Jobs...', 'info');
        }, 800);
        
        setTimeout(() => {
            addTerminalLine('Scanning Indeed...', 'info');
        }, 1600);
        
        setTimeout(() => {
            addTerminalLine('Scanning Glassdoor...', 'info');
        }, 2400);
        
        setTimeout(() => {
            addTerminalLine('✓ Found 47 matching jobs', 'success');
            addTerminalLine('Job analysis complete - 23 jobs above 85% match', 'info');
            currentStep = 2;
        }, 3200);
    }, 1000);
    
    // Step 3: Applying phase (7-11 sec)
    setTimeout(() => {
        addTerminalLine('user@applyx:~$ ./applyx --auto-apply', 'command');
        addTerminalLine('Starting automated application process...', 'info');
        currentStep = 3;
        
        // Simulate applications with realistic timing
        const jobTitles = [
            "Senior Developer @ TechCorp",
            "Full Stack Engineer @ StartupXYZ", 
            "React Developer @ BigTech",
            "Software Engineer @ FinTech",
            "Frontend Developer @ E-commerce"
        ];
        
        let appCount = 0;
        const totalApps = 23;
        
        const applyInterval = setInterval(() => {
            if (appCount < totalApps) {
                const jobTitle = jobTitles[appCount % jobTitles.length];
                addTerminalLine(`Applying to ${jobTitle}...`, 'info');
                
                setTimeout(() => {
                    addTerminalLine('✓ Application submitted successfully', 'success');
                    appCount++;
                }, 600);
            } else {
                clearInterval(applyInterval);
                addTerminalLine(`✓ All applications completed (${totalApps}/${totalApps})`, 'success');
            }
        }, 1000);
        
    }, 5000);
    
    // Step 4: 24/7 mode activation (11-13 sec)
    setTimeout(() => {
        addTerminalLine('user@applyx:~$ ./applyx --background-mode', 'command');
        addTerminalLine('Enabling 24/7 monitoring...', 'info');
        
        setTimeout(() => {
            addTerminalLine('✓ Background mode activated', 'success');
            addTerminalLine('System running continuously - monitoring for new jobs', 'info');
            addTerminalLine('Next scan scheduled in 2h 45m', 'info');
            currentStep = 4;
        }, 1500);
    }, 11000);
    
    // Step 5: Final state (13-15 sec)
    setTimeout(() => {
        addTerminalLine('user@applyx:~$ ./applyx --status', 'command');
        addTerminalLine('=== APPLYX STATUS ===', 'info');
        addTerminalLine('Jobs Found: 47', 'success');
        addTerminalLine('Applications Sent: 23/47', 'success');
        addTerminalLine('Success Rate: 89%', 'success');
        addTerminalLine('Mode: 24/7 Background', 'success');
        addTermLine('Next scan: 2h 45m', 'info');
        addTerminalLine('', 'info');
        addTerminalLine('System running automatically - even while you sleep', 'info');
        
        // Auto-loop after 3 seconds
        setTimeout(() => {
            resetDemo();
        }, 3000);
        
    }, 13000);
}

function addTerminalLine(text, type = 'info') {
    const line = document.createElement('div');
    line.className = 'terminal-line fade-in';
    
    if (type === 'command') {
        line.innerHTML = `<span class="terminal-prompt">$</span> <span class="terminal-command">${text}</span>`;
    } else if (type === 'success') {
        line.innerHTML = `<span class="terminal-output terminal-success">${text}</span>`;
    } else if (type === 'info') {
        line.innerHTML = `<span class="terminal-output terminal-info">${text}</span>`;
    } else if (type === 'warning') {
        line.innerHTML = `<span class="terminal-output terminal-warning">${text}</span>`;
    } else if (type === 'error') {
        line.innerHTML = `<span class="terminal-output terminal-error">${text}</span>`;
    } else {
        line.innerHTML = `<span class="terminal-output">${text}</span>`;
    }
    
    terminalContent.appendChild(line);
    
    // Auto-scroll to bottom
    terminalContent.scrollTop = terminalContent.scrollHeight;
    
    // Keep only last 20 lines
    const lines = terminalContent.querySelectorAll('.terminal-line');
    if (lines.length > 20) {
        lines[0].remove();
    }
}

function addTermLine(text, type = 'info') {
    addTerminalLine(text, type);
}

function resetDemo() {
    // Clear any running intervals
    if (demoInterval) {
        clearInterval(demoInterval);
    }
    
    // Reset state
    currentStep = 0;
    isProcessing = false;
    profile = null;
    jobs = [];
    applications = [];
    terminalOutput = [];
    hasStarted = false;
    
    // Restart demo
    setTimeout(() => {
        hasStarted = true;
        startDemo();
    }, 1000);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}