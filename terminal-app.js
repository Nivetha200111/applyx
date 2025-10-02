#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 ApplyX Terminal Resume Processor');
console.log('=====================================\n');

async function processResume(filePath) {
  try {
    console.log(`📄 Processing: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found!');
      return;
    }
    
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log(`📊 File size: ${fileContent.length} characters`);
    
    // Call the API
    console.log('🤖 Sending to AI for parsing...');
    
    const formData = new FormData();
    const file = new File([fileContent], path.basename(filePath), { type: 'text/plain' });
    formData.append('resume', file);
    
    const response = await fetch('https://applyx.vercel.app/api/simple-upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return;
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('\n✅ Resume parsed successfully!');
      console.log('=====================================');
      console.log(`👤 Name: ${result.profile.name || 'Not found'}`);
      console.log(`📧 Email: ${result.profile.email || 'Not found'}`);
      console.log(`🛠️  Skills: ${Array.isArray(result.profile.skills) ? result.profile.skills.join(', ') : 'Not found'}`);
      console.log(`📅 Experience: ${result.profile.experience_years || 0} years`);
      console.log('=====================================\n');
      
      // Save parsed data to file
      const outputFile = filePath.replace(/\.[^/.]+$/, '_parsed.json');
      fs.writeFileSync(outputFile, JSON.stringify(result.profile, null, 2));
      console.log(`💾 Parsed data saved to: ${outputFile}`);
      
    } else {
      console.log('❌ Parsing failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

function askForFilePath() {
  rl.question('📁 Enter the path to your resume file: ', async (filePath) => {
    if (filePath.trim() === '') {
      console.log('❌ Please enter a valid file path');
      askForFilePath();
      return;
    }
    
    await processResume(filePath.trim());
    console.log('\n');
    askForFilePath();
  });
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
});

// Start the app
askForFilePath();
