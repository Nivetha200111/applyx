"use client";

import { useState, useEffect, useRef } from "react";

export default function SimpleDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [showBackgroundMode, setShowBackgroundMode] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const hasStarted = useRef(false);

  const addTerminalOutput = (text, type = "info") => {
    setTerminalOutput(prev => [...prev, { text, type, timestamp: new Date().toLocaleTimeString() }]);
  };

  // Auto-run the demo sequence
  useEffect(() => {
    if (hasStarted.current) return;
    
    hasStarted.current = true;
    
    // Start the automatic sequence after a short delay
    const timer = setTimeout(() => {
      runAutomaticSequence();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const runAutomaticSequence = async () => {
    // Step 1: Parse Resume
    setIsProcessing(true);
    addTerminalOutput("Initializing ApplyX system...", "info");
    addTerminalOutput("Loading AI model (Grok-4)...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    addTerminalOutput("Parsing resume content...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProfile({
      name: "John Smith",
      email: "john.smith@email.com",
      skills: ["React", "Node.js", "Python", "AWS", "TypeScript"],
      experience: 5,
      location: "San Francisco, CA",
      education: "Computer Science, Stanford University"
    });
    addTerminalOutput("✅ Resume parsed successfully!", "success");
    setIsProcessing(false);
    setCurrentStep(1);

    // Step 2: Scan Jobs
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(true);
    addTerminalOutput("Connecting to job platforms...", "info");
    addTerminalOutput("Scanning LinkedIn Jobs...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    addTerminalOutput("Scanning Indeed...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    addTerminalOutput("Scanning Glassdoor...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setJobs([
      { id: 1, title: "Senior React Developer", company: "Google", location: "Mountain View, CA", match: 95 },
      { id: 2, title: "Full Stack Engineer", company: "Meta", location: "Menlo Park, CA", match: 92 },
      { id: 3, title: "Software Engineer", company: "Netflix", location: "Los Gatos, CA", match: 88 },
      { id: 4, title: "Frontend Developer", company: "Airbnb", location: "San Francisco, CA", match: 90 },
      { id: 5, title: "JavaScript Developer", company: "Uber", location: "San Francisco, CA", match: 85 }
    ]);
    addTerminalOutput(`✅ Found ${5} matching jobs!`, "success");
    setIsProcessing(false);
    setCurrentStep(2);

    // Step 3: Auto-Apply
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(true);
    setCurrentStep(3);
    addTerminalOutput("🚀 Starting auto-application process...", "info");
    
    // Simulate auto-application process
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      addTerminalOutput(`Applying to ${job.company} - ${job.title}...`, "info");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApplications(prev => [...prev, {
        id: job.id,
        title: job.title,
        company: job.company,
        status: "submitted",
        timestamp: new Date().toLocaleTimeString()
      }]);
      addTerminalOutput(`✅ Application submitted to ${job.company}!`, "success");
    }
    
    addTerminalOutput("🎉 All applications completed successfully!", "success");
    setIsProcessing(false);
    setCurrentStep(4);

    // Show background mode after completion
    setTimeout(() => {
      setShowBackgroundMode(true);
    }, 2000);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsProcessing(false);
    setProfile(null);
    setJobs([]);
    setApplications([]);
    setShowBackgroundMode(false);
    setTerminalOutput([]);
    hasStarted.current = false;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono" style={{ fontFamily: 'Courier New, monospace' }}>
      {/* Header */}
      <div className="border-b border-green-400 p-4" style={{ boxShadow: '0 0 10px #00ff00' }}>
        <h1 className="text-2xl font-bold text-center text-green-400" style={{ textShadow: '0 0 5px #00ff00' }}>
          APPLYX.EXE
        </h1>
        <p className="text-center text-green-600 text-sm">
          Automated Job Application System v1.0.0
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Main Demo Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Panel - Extension Interface */}
          <div className="bg-black border border-green-400 p-4">
            <h2 className="text-green-400 text-center text-lg mb-4">APPLYX EXTENSION</h2>
            
            {/* Resume Parser Section */}
            <div className="border border-green-400 p-4 mb-4">
              <h3 className="text-green-400 font-bold mb-3">RESUME PARSER</h3>
              
              {!profile ? (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-green-400 p-6 text-center">
                    <p className="text-green-400">📄 PROCESSING RESUME...</p>
                    <p className="text-green-600 text-sm">AI EXTRACTION IN PROGRESS</p>
                  </div>
                  {isProcessing && (
                    <div className="text-center">
                      <div className="inline-block w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-green-400">PARSING...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-green-900 p-3 rounded">
                    <p className="text-green-400 text-sm">✅ RESUME PARSED SUCCESSFULLY</p>
                  </div>
                  <div className="bg-black border border-green-400 p-3 text-xs">
                    <div><strong>NAME:</strong> {profile.name}</div>
                    <div><strong>EMAIL:</strong> {profile.email}</div>
                    <div><strong>SKILLS:</strong> {profile.skills.join(", ")}</div>
                    <div><strong>EXP:</strong> {profile.experience} YEARS</div>
                    <div><strong>LOCATION:</strong> {profile.location}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Job Application Section */}
            <div className="border border-green-400 p-4 mb-4">
              <h3 className="text-green-400 font-bold mb-3">JOB APPLICATION</h3>
              
              <div className="space-y-2">
                {!profile ? (
                  <div className="text-center py-4">
                    <p className="text-green-600">Waiting for resume parsing...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="inline-block w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-green-400">SCANNING JOBS...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-green-900 p-2 rounded text-center">
                      <p className="text-green-400 text-sm">✅ FOUND {jobs.length} JOBS</p>
                    </div>
                    {isProcessing && (
                      <div className="text-center">
                        <div className="inline-block w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-green-400">AUTO-APPLYING...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* System Section */}
            <div className="border border-green-400 p-4">
              <h3 className="text-green-400 font-bold mb-3">SYSTEM</h3>
              <div className="space-y-2">
                <button 
                  onClick={resetDemo}
                  className="w-full bg-black text-green-400 border border-green-400 hover:bg-green-400 hover:text-black font-bold p-2"
                >
                  RESTART SYSTEM
                </button>
                <div className="text-center">
                  <span className="text-green-600 text-xs">STATUS: {isProcessing ? "PROCESSING" : "READY"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Job Listings */}
          <div className="bg-black border border-green-400 p-4">
            <h2 className="text-green-400 text-center text-lg mb-4">JOB OPPORTUNITIES</h2>
            
            {jobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-green-600">No jobs found yet</p>
                <p className="text-green-600 text-sm">Scanning job platforms...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className="border border-green-400 p-3 bg-green-900/20"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-green-400 font-bold">{job.title}</h4>
                        <p className="text-green-600 text-sm">{job.company}</p>
                        <p className="text-green-600 text-xs">{job.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">{job.match}%</div>
                        <div className="text-green-600 text-xs">MATCH</div>
                        <div className="w-16 h-1 bg-green-900 mt-1">
                          <div 
                            className="h-full bg-green-400" 
                            style={{ width: `${job.match}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Background Mode Dashboard */}
        {showBackgroundMode && (
          <div className="mt-6 bg-black border border-green-400 p-4">
            <h2 className="text-green-400 text-center text-lg mb-4">BACKGROUND AUTOMATION DASHBOARD</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-black border border-green-400 p-4 text-center">
                <div className="text-green-400 text-sm font-bold mb-2">LAST SCRAPED</div>
                <div className="text-green-600 text-lg font-mono">2 hours ago</div>
              </div>
              <div className="bg-black border border-green-400 p-4 text-center">
                <div className="text-green-400 text-sm font-bold mb-2">NEW JOBS FOUND</div>
                <div className="text-green-600 text-lg font-mono">5</div>
                <div className="text-green-600 text-xs">automatically</div>
              </div>
              <div className="bg-black border border-green-400 p-4 text-center">
                <div className="text-green-400 text-sm font-bold mb-2">STATUS</div>
                <div className="text-green-600 text-lg font-mono">ACTIVE</div>
                <div className="text-green-600 text-xs">24/7 monitoring</div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-green-900/30 border border-green-400 p-4">
                <div className="text-green-400 text-lg font-bold mb-2">
                  🚀 RUNS 24/7 - EVEN WHILE YOU SLEEP
                </div>
                <div className="text-green-600 text-sm">
                  ApplyX continuously monitors job platforms and automatically applies to new matching opportunities
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terminal Overlay */}
        <div className="mt-6 bg-black border border-green-400 p-4">
          <h2 className="text-green-400 text-center text-lg mb-4">SYSTEM LOG</h2>
          
          <div className="bg-black border border-green-400 p-4 font-mono text-sm">
            <div className="text-green-400 mb-2">
              🚀 APPLYX SYSTEM INITIALIZED
            </div>
            
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {terminalOutput.map((output, index) => (
                <div 
                  key={index} 
                  className={`${
                    output.type === 'success' ? 'text-green-400' :
                    output.type === 'error' ? 'text-red-400' :
                    'text-green-600'
                  }`}
                >
                  <span className="text-green-600">[{output.timestamp}]</span> {output.text}
                </div>
              ))}
            </div>
            
            {isProcessing && (
              <div className="text-green-600 mt-4">
                <div className="inline-block w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                PROCESSING... {applications.length}/{jobs.length}
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  (step <= currentStep || (step === 5 && showBackgroundMode)) ? 'bg-green-400' : 'bg-green-600'
                }`}
              />
            ))}
          </div>
          <p className="text-green-600 text-sm mt-2">
            {currentStep === 0 && "Initializing system..."}
            {currentStep === 1 && "Parsing resume with AI..."}
            {currentStep === 2 && "Scanning job platforms..."}
            {currentStep === 3 && "Auto-applying to jobs..."}
            {currentStep === 4 && "Process completed successfully!"}
            {showBackgroundMode && "Background automation active - runs 24/7!"}
          </p>
        </div>
      </div>
    </div>
  );
}

