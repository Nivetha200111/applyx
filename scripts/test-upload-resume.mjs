const resume = `Nivetha Sivakumar
 Chennai, TN — nnivetha373@gmail.com — +91-6381263953
 linkedin.com/in/nivetha-sivakumar2001
 github.com/Nivetha200111
 Professional Summary
 Customer-focused Software Engineer with 1+ years of experience in enterprise system development, automation,
 and infrastructure support. Proven expertise in Java development, AI, Python scripting, and cloud technologies.
 Strong problem-solving skills with experience in troubleshooting complex systems, automating workflows, and
 supporting production environments. Quick learner with demonstrated ability to manage multiple overlapping
 tasks while maintaining high-quality standards.
 Technical Skills
 Programming Languages: Java, Python, JavaScript, TypeScript, SQL
 Cloud & Infrastructure: Azure, GCP, REST APIs, Microservices Architecture
 Operating Systems: Linux/Unix fundamentals, Shell Scripting
 Automation & Tools: Git, CI/CD concepts, Automated Testing, Script Development
 Databases: MySQL, PostgreSQL, DB2, Cassandra
 Frameworks: Spring, React, Angular, Node.js, Flask
 Development Tools: Git, Postman, Maven, JIRA, Azure DevOps
 Methodologies: Agile/Scrum, DevOps practices, Code Reviews, Technical Documentation
 Professional Experience
 Tata Consultancy Services (TCS)
 Systems Engineer
 Oct 2024– Present
 Chennai, India
 • Modernized legacy systems for Fortune 500 fintech client, developing Java-based solutions and automation
 scripts to improve operational efficiency.
 • Automated critical backend processes and data migration tasks using Python scripts, reducing manual inter
 vention by 40%.
 • Troubleshot and resolved production issues, participating in incident management and root cause analysis.
 • Developed reusable automation frameworks for testing and deployment, earning Star Performer Award for
 improving team productivity.
 • Collaborated with cross-functional teams in Agile environment to deliver software solutions within scheduled
 timelines.
 • Created comprehensive technical documentation for system components and deployment procedures.
 • Participated in code reviews and implemented quality control processes to ensure system stability.
 • Worked with RAG-based AI tools to accelerate development and automated testing processes.
 KAAR Technologies
 Software Development Trainee
 Dec 2022– July 2023
 Chennai, India
 • Gained hands-on experience with enterprise software systems, cloud platforms (Azure, GCP), and automation
 tools.
 • Developed Python scripts for data processing and system automation tasks.
 • Worked on internal tools (KTern, KEBS, PMPA) focused on automation and optimization of operational
 workflows.
 • Participated in troubleshooting exercises and learned systematic approaches to root cause analysis.
 • Delivered technical presentations and collaborated on team projects in a fast-paced environment.
 1
HiLife AI Pvt Ltd
 Jan 2021– March 2021
 Full Stack Developer Intern
 • Developed and deployed web applications with focus on backend architecture and API development.
 • Implemented secure REST APIs and ensured system reliability through proper error handling.
 • Collaborated with team members to troubleshoot issues and improve application performance.
 • Created technical documentation for deployed features and API endpoints.
 Key Projects & Automation Experience
 Remote
 • FurReal- Instagram AI Animal Video Detector: This is a full-stack project scaffold for FurReal,
 an Instagram-focused app that detects AI-generated videos. Tech stack includes React, TypeScript, Vite,
 Tailwind, Node.js, Express, PostgreSQL, Redis, BullMQ, Docker. Implements video analysis pipelines, scalable
 job queue, and DB auto-initialization.
 • Enterprise System Modernization: Led automation initiatives for legacy system migration, developing
 Java-based solutions and Python scripts to streamline deployment processes and reduce manual errors.
 • AI-Powered Development IDE: Built an intelligent coding platform with automated testing capabilities
 and voice command execution, demonstrating ability to create tools that enhance developer productivity.
 • Automated Testing Framework: Developed reusable testing automation framework that improved code
 quality and reduced testing time across multiple projects.
 • SaleSavant Platform: Designed and deployed scalable web application using Flask backend and Angular
 frontend, implementing automated deployment scripts and monitoring solutions.
 • Bakery Sales Dashboard: Created automated data pipeline using Python and Power BI for real-time
 reporting, showcasing skills in data automation and visualization.
 • YouTube Sentiment Analyzer: Built NLP-based system for automated comment analysis, demonstrating
 ability to work with large-scale data processing.
 • Toto: Mental health chatbot using OpenAI API with journaling and mood tracking.
 • Smart Glasses for Alzheimer’s (Patented)– Designed a wearable assistive device using Flutter, facial
 recognition, and geo-location algorithms to help Alzheimer’s patients identify familiar faces and navigate safely.
 Recognized with a patent grant from the South African government.
 • Connect4 AI (Copyright Grant)– Implemented an unbeatable Python-based Connect4 game using Min
 imax with state-space pruning, officially granted copyright for its AI algorithm.
 Infrastructure & Deployment Experience
 • Supported staging and production deployments for enterprise applications at TCS.
 • Developed automation scripts for routine maintenance tasks and system monitoring.
 • Participated in incident response and troubleshooting for production systems.
 • Created deployment documentation and runbooks for operational procedures.
 • Worked with version control systems (Git) for code management and collaborative development.
 Education
 Bachelor of Technology in Artificial Intelligence and Data Science
 K Ramakrishnan College of Engineering
 2020– 2024
 CGPA: 9.21/10.0
 Relevant Coursework: Operating Systems, Computer Networks, Database Management, Data Structures &
 Algorithms, Software Engineering, Cloud Computing
 2
Achievements & Certifications
 • Star Performer Award at TCS for developing automation frameworks
 • Champion of Growth Award for achieving highest competencies in team
 • NPTEL Cloud Computing Certification- Top 2% performer
 • Google Data Analytics Professional Certificate
 • Top 20 finalist among 82,000 teams in TNCPL GUVI Hackathon
 • Active open-source contributor (GSSOC 2024)
 • Patent holder for innovative technology solution
 Additional Qualifications
 • Quick learner with proven ability to work on multiple overlapping tasks and adapt to new technologies
 • Strong troubleshooting and problem-solving skills demonstrated through production support experience
 • Experience working in distributed teams and collaborating across different time zones
 • Excellent communication skills with experience in technical documentation and knowledge sharing`;

const form = new FormData();
form.append("resume", new Blob([resume], { type: "text/plain" }), "resume.txt");

const res = await fetch("http://localhost:3000/api/upload-resume", {
  method: "POST",
  body: form,
});

console.log(res.status);
console.log(await res.text());


