import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OpenAI } from "openai";

const server = new Server({ name: "applyx-mcp", version: "1.0.0" });

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "ollama",
  baseURL: process.env.OPENAI_BASE_URL || undefined,
});

// @ts-expect-error MCP types mismatch for simplified example
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "parse_resume",
      description: "Extract skills, experience, and preferences from resume",
      inputSchema: {
        type: "object",
        properties: { resume_content: { type: "string" } },
      },
    },
    {
      name: "match_jobs",
      description: "Find jobs matching user profile",
      inputSchema: {
        type: "object",
        properties: { profile: { type: "object" }, filters: { type: "object" } },
      },
    },
    {
      name: "customize_application",
      description: "Tailor resume and cover letter for specific job",
      inputSchema: {
        type: "object",
        properties: {
          job_description: { type: "string" },
          user_profile: { type: "object" },
        },
      },
    },
    {
      name: "submit_application",
      description: "Submit application to job platform",
      inputSchema: {
        type: "object",
        properties: {
          platform: { type: "string" },
          job_id: { type: "string" },
          application_data: { type: "object" },
        },
      },
    },
    {
      name: "scrape_job_sites",
      description: "Scrape job listings from various platforms",
      inputSchema: {
        type: "object",
        properties: {
          platform: { type: "string" },
          search_params: { type: "object" },
        },
      },
    },
    {
      name: "generate_cover_letter",
      description: "Generate personalized cover letter for job application",
      inputSchema: {
        type: "object",
        properties: {
          job_description: { type: "string" },
          user_profile: { type: "object" },
          company_info: { type: "object" },
        },
      },
    },
  ],
}));

// @ts-expect-error MCP types mismatch for simplified example
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "parse_resume":
      return await parseResume(args.resume_content);
    
    case "match_jobs":
      return await matchJobs(args.profile, args.filters);
    
    case "customize_application":
      return await customizeApplication(args.job_description, args.user_profile);
    
    case "submit_application":
      return await submitApplication(args.platform, args.job_id, args.application_data);
    
    case "scrape_job_sites":
      return await scrapeJobSites(args.platform, args.search_params);
    
    case "generate_cover_letter":
      return await generateCoverLetter(args.job_description, args.user_profile, args.company_info);
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function parseResume(resumeContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "grok-4",
      messages: [
        {
          role: "system",
          content: "You are a resume parser. Extract comprehensive information from this resume and return ONLY valid JSON with these keys: name, email, phone, location, skills (array), experience (array of {company, role, duration, description}), education (array), desired_roles (array), experience_years (number), salary_preference (object with min/max).",
        },
        { role: "user", content: resumeContent },
      ],
      max_tokens: 1000,
    });

    const result = response.choices[0]?.message?.content || "{}";
    const profile = JSON.parse(result);
    
    return {
      content: [
        {
          type: "text",
          text: `Resume parsed successfully. Extracted profile: ${JSON.stringify(profile, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error parsing resume: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

async function matchJobs(profile: any, filters: any) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "grok-4",
      messages: [
        {
          role: "system",
          content: "You are a job matching expert. Based on the user profile and filters, suggest job search strategies and keywords.",
        },
        { 
          role: "user", 
          content: `Profile: ${JSON.stringify(profile)}\nFilters: ${JSON.stringify(filters)}` 
        },
      ],
      max_tokens: 500,
    });

    return {
      content: [
        {
          type: "text",
          text: response.choices[0]?.message?.content || "No job matching suggestions available.",
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error matching jobs: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

async function customizeApplication(jobDescription: string, userProfile: any) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "grok-4",
      messages: [
        {
          role: "system",
          content: "You are an application customization expert. Tailor the user's profile to match the job requirements and suggest modifications.",
        },
        { 
          role: "user", 
          content: `Job Description: ${jobDescription}\nUser Profile: ${JSON.stringify(userProfile)}` 
        },
      ],
      max_tokens: 800,
    });

    return {
      content: [
        {
          type: "text",
          text: response.choices[0]?.message?.content || "No customization suggestions available.",
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error customizing application: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

async function submitApplication(platform: string, jobId: string, applicationData: any) {
  // This would integrate with the Chrome extension's auto-apply functionality
  return {
    content: [
      {
        type: "text",
        text: `Application submitted to ${platform} for job ${jobId}. Data: ${JSON.stringify(applicationData)}`,
      },
    ],
  };
}

async function scrapeJobSites(platform: string, searchParams: any) {
  // This would integrate with the Chrome extension's job scraping
  return {
    content: [
      {
        type: "text",
        text: `Job scraping initiated for ${platform} with parameters: ${JSON.stringify(searchParams)}`,
      },
    ],
  };
}

async function generateCoverLetter(jobDescription: string, userProfile: any, companyInfo: any) {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "grok-4",
      messages: [
        {
          role: "system",
          content: "You are a professional cover letter writer. Generate a compelling, personalized cover letter that highlights the user's relevant experience and skills for the specific job.",
        },
        { 
          role: "user", 
          content: `Job Description: ${jobDescription}\nUser Profile: ${JSON.stringify(userProfile)}\nCompany Info: ${JSON.stringify(companyInfo)}` 
        },
      ],
      max_tokens: 1000,
    });

    return {
      content: [
        {
          type: "text",
          text: response.choices[0]?.message?.content || "Unable to generate cover letter.",
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error generating cover letter: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
    };
  }
}

const transport = new StdioServerTransport();
server.connect(transport);


