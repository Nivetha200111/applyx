"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExtensionDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [showBackgroundMode, setShowBackgroundMode] = useState(false);
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
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const runAutomaticSequence = async () => {
    // Define jobs array first
    const jobsData = [
      { id: 1, title: "Senior React Developer", company: "Google", location: "Mountain View, CA", match: 95 },
      { id: 2, title: "Full Stack Engineer", company: "Meta", location: "Menlo Park, CA", match: 92 },
      { id: 3, title: "Software Engineer", company: "Netflix", location: "Los Gatos, CA", match: 88 },
      { id: 4, title: "Frontend Developer", company: "Airbnb", location: "San Francisco, CA", match: 90 },
      { id: 5, title: "JavaScript Developer", company: "Uber", location: "San Francisco, CA", match: 85 }
    ];

    // Step 1: Parse Resume
    setIsProcessing(true);
    addTerminalOutput("Initializing ApplyX...", "info");
    addTerminalOutput("Loading AI model...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    addTerminalOutput("Parsing resume...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setProfile({
      name: "John Smith",
      email: "john.smith@email.com",
      skills: ["React", "Node.js", "Python", "AWS", "TypeScript"],
      experience: 5,
      location: "San Francisco, CA"
    });
    addTerminalOutput("✓ Resume parsed successfully!", "success");
    setIsProcessing(false);
    setCurrentStep(1);

    // Step 2: Scan Jobs
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(true);
    addTerminalOutput("Scanning job platforms...", "info");
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    setJobs(jobsData);
    addTerminalOutput(`✓ Found ${jobsData.length} matching jobs!`, "success");
    setIsProcessing(false);
    setCurrentStep(2);

    // Step 3: Auto-Apply
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(true);
    setCurrentStep(3);
    addTerminalOutput("Starting auto-application...", "info");
    
    // Simulate auto-application process
    for (let i = 0; i < jobsData.length; i++) {
      const job = jobsData[i];
      addTerminalOutput(`Applying to ${job.company}...`, "info");
      
      await new Promise(resolve => setTimeout(resolve, 800));
      setApplications(prev => [...prev, {
        id: job.id,
        title: job.title,
        company: job.company,
        status: "submitted",
        timestamp: new Date().toLocaleTimeString()
      }]);
      addTerminalOutput(`✓ Application #${i + 1} submitted!`, "success");
    }
    
    addTerminalOutput("🎉 All applications completed!", "success");
    setIsProcessing(false);
    setCurrentStep(4);

    // Show background mode after completion
    setTimeout(() => {
      addTerminalOutput("Enabling 24/7 monitoring...", "info");
      addTerminalOutput("✓ Background mode active", "success");
      setShowBackgroundMode(true);
    }, 2000);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsProcessing(false);
    setProfile(null);
    setJobs([]);
    setApplications([]);
    setTerminalOutput([]);
    setShowBackgroundMode(false);
    hasStarted.current = false;
    
    setTimeout(() => {
      hasStarted.current = true;
      runAutomaticSequence();
    }, 500);
  };

  return (
    <>
      <style jsx>{`
        .terminal-fade-in { animation: fadeIn 0.5s ease-out; }
        .terminal-glow { animation: glow 2s ease-in-out infinite; }
        .terminal-spinner { animation: spin 1s linear infinite; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px #00ff00; }
          50% { box-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Chrome Extension Popup */}
      <div className="w-96 h-96 bg-black text-green-400 font-mono border border-green-400">
        {/* Extension Header */}
        <div className="bg-green-900/20 border-b border-green-400 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-400 rounded"></div>
              <h1 className="text-green-400 font-bold text-sm">ApplyX</h1>
            </div>
            <div className="text-green-600 text-xs">v1.0.0</div>
          </div>
        </div>

        {/* Extension Content */}
        <div className="p-3 space-y-3 h-full overflow-y-auto">
          {/* Status Section */}
          <div className="bg-green-900/20 border border-green-400 p-2 rounded">
            <div className="flex items-center justify-between">
              <span className="text-green-400 text-xs font-bold">STATUS</span>
              <span className="text-green-600 text-xs">{isProcessing ? "PROCESSING" : "READY"}</span>
            </div>
          </div>

          {/* Resume Status */}
          <div className="bg-green-900/20 border border-green-400 p-2 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-xs font-bold">RESUME</span>
              {profile ? (
                <span className="text-green-400 text-xs">✓ PARSED</span>
              ) : (
                <span className="text-green-600 text-xs">PROCESSING...</span>
              )}
            </div>
            {profile && (
              <div className="text-green-600 text-xs">
                <div>{profile.name}</div>
                <div>{profile.skills.length} skills • {profile.experience} years</div>
              </div>
            )}
          </div>

          {/* Jobs Found */}
          <div className="bg-green-900/20 border border-green-400 p-2 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-xs font-bold">JOBS FOUND</span>
              <span className="text-green-400 text-xs">{jobs.length}</span>
            </div>
            {jobs.length > 0 && (
              <div className="space-y-1">
                {jobs.slice(0, 3).map((job, index) => (
                  <div key={job.id} className="flex justify-between items-center text-xs">
                    <div className="truncate">
                      <div className="text-green-400 font-medium">{job.title}</div>
                      <div className="text-green-600">{job.company}</div>
                    </div>
                    <div className="text-green-400 font-bold">{job.match}%</div>
                  </div>
                ))}
                {jobs.length > 3 && (
                  <div className="text-green-600 text-xs text-center">+{jobs.length - 3} more</div>
                )}
              </div>
            )}
          </div>

          {/* Applications */}
          <div className="bg-green-900/20 border border-green-400 p-2 rounded">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-xs font-bold">APPLICATIONS</span>
              <span className="text-green-400 text-xs">{applications.length}/{jobs.length}</span>
            </div>
            {applications.length > 0 && (
              <div className="text-green-600 text-xs">
                {applications.length === jobs.length ? "✓ ALL COMPLETE" : "IN PROGRESS..."}
              </div>
            )}
          </div>

          {/* Terminal Output */}
          <div className="bg-black border border-green-400 p-2 rounded">
            <div className="text-green-400 text-xs font-bold mb-1">SYSTEM LOG</div>
            <div className="text-green-600 text-xs space-y-1 max-h-20 overflow-y-auto">
              {terminalOutput.slice(-3).map((output, index) => (
                <div key={index} className="truncate">
                  [{output.timestamp}] {output.text}
                </div>
              ))}
              {isProcessing && (
                <div className="text-green-400 animate-pulse">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  Processing...
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={resetDemo}
              className="w-full bg-green-400 text-black hover:bg-green-300 font-bold text-xs py-1"
            >
              RESTART DEMO
            </Button>
            {showBackgroundMode && (
              <div className="bg-green-900/30 border border-green-400 p-2 rounded text-center">
                <div className="text-green-400 text-xs font-bold">24/7 MODE ACTIVE</div>
                <div className="text-green-600 text-xs">Runs automatically</div>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full ${
                  step <= currentStep ? 'bg-green-400' : 'bg-green-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}