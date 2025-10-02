#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const https = require('https');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 ApplyX Terminal Resume Processor');
console.log('=====================================\n');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'applyx.vercel.app',
      port: 443,
      path: '/api/simple-upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON response', raw: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

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
    
    const response = await makeRequest({
      text: fileContent,
      filename: path.basename(filePath)
    });
    
    if (response.error) {
      console.log(`❌ API Error: ${response.error}`);
      if (response.raw) {
        console.log('Raw response:', response.raw);
      }
      return;
    }
    
    if (response.success) {
      console.log('\n✅ Resume parsed successfully!');
      console.log('=====================================');
      console.log(`👤 Name: ${response.profile.name || 'Not found'}`);
      console.log(`📧 Email: ${response.profile.email || 'Not found'}`);
      console.log(`🛠️  Skills: ${Array.isArray(response.profile.skills) ? response.profile.skills.join(', ') : 'Not found'}`);
      console.log(`📅 Experience: ${response.profile.experience_years || 0} years`);
      console.log('=====================================\n');
      
      // Save parsed data to file
      const outputFile = filePath.replace(/\.[^/.]+$/, '_parsed.json');
      fs.writeFileSync(outputFile, JSON.stringify(response.profile, null, 2));
      console.log(`💾 Parsed data saved to: ${outputFile}`);
      
    } else {
      console.log('❌ Parsing failed:', response.error);
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
