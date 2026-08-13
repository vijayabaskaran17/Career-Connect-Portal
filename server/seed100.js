require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');
const Feedback = require('./models/Feedback');

const companies = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb',
  'Stripe', 'Coinbase', 'Salesforce', 'Oracle', 'IBM', 'Intel', 'Cisco', 'Adobe',
  'Spotify', 'Shopify', 'Twitter', 'LinkedIn', 'Palantir', 'Snowflake', 'Databricks', 'Twilio'
];

const jobTitles = [
  'Full Stack Engineering Lead', 'Frontend React Developer', 'Backend Node.js Engineer',
  'AI / Machine Learning Researcher', 'Data Scientist', 'DevOps & Cloud Specialist',
  'Mobile App Developer (React Native)', 'iOS Mobile Engineer', 'Android Developer',
  'Cybersecurity Analyst', 'Site Reliability Engineer (SRE)', 'Cloud Architect (AWS/Azure)',
  'Database Administrator', 'QA Automation Engineer', 'UI/UX Product Designer',
  'Blockchain Developer', 'Embedded Systems Engineer', 'Full Stack Intern',
  'Data Engineer', 'Systems Performance Engineer'
];

const locations = [
  'Chennai, Tamil Nadu (Hybrid)', 'Coimbatore, Tamil Nadu (Remote)', 'Bengaluru, Karnataka (India)',
  'Madurai, Tamil Nadu', 'Tiruchirappalli (Trichy), Tamil Nadu', 'Hyderabad, Telangana (India)',
  'Remote (Tamil Nadu)', 'Mumbai, Maharashtra (India)', 'Pune, Maharashtra (India)',
  'Salem, Tamil Nadu', 'Gurgaon, Delhi NCR (India)', 'Kochi, Kerala (India)'
];

const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance', 'Apprenticeship'];

const salaryRanges = [
  '₹12 LPA - ₹18 LPA', '₹16 LPA - ₹25 LPA', '₹8 LPA - ₹14 LPA',
  '₹600 - ₹1,200 / hr', '₹10 LPA - ₹15 LPA', '₹22 LPA - ₹35 LPA',
  '₹25,000 - ₹45,000 / month stipend', '₹18 LPA - ₹28 LPA'
];

const skillPool = [
  'React', 'Node.js', 'TypeScript', 'MongoDB', 'Python', 'Docker', 'Kubernetes',
  'AWS', 'C++', 'Java', 'Go', 'GraphQL', 'PostgreSQL', 'Redis', 'TensorFlow',
  'PyTorch', 'Next.js', 'TailwindCSS', 'Flutter', 'Swift', 'Kotlin', 'System Design'
];

const studentNames = [
  'Jane Doe', 'John Smith', 'Emily Chen', 'Michael Brown', 'Priya Sharma',
  'Rahul Patel', 'David Kim', 'Sophia Lee', 'Alex Rivera', 'Jessica Taylor',
  'Daniel Garcia', 'Olivia Martinez', 'Liam Johnson', 'Emma Wilson', 'Noah Anderson',
  'Ava Thomas', 'Ethan Jackson', 'Isabella White', 'Mason Harris', 'Mia Martin',
  'Lucas Thompson', 'Charlotte Moore', 'Benjamin Young', 'Amelia King', 'Henry Wright',
  'Harper Scott', 'Alexander Torres', 'Evelyn Nguyen', 'Sebastian Hill', 'Abigail Flores',
  'Jack Green', 'Ella Adams', 'Owen Nelson', 'Scarlett Baker', 'Samuel Hall',
  'Grace Rivera', 'Matthew Campbell', 'Chloe Mitchell', 'Joseph Carter', 'Victoria Roberts'
];

const generate100Data = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/careerconnect';
    await mongoose.connect(connUri);
    console.log('⚡ Connected to MongoDB for bulk 100+ record generation...');

    // Clear previous data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('🧹 Cleared existing database collections.');

    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // 1. Admin
    await User.create({
      name: 'Placement Admin',
      email: 'admin@careerconnect.com',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('✅ Admin account created.');

    // 2. Create 24 Recruiters
    const recruiterDocs = [];
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      recruiterDocs.push({
        name: `${company} Talent Lead`,
        email: `recruiter.${company.toLowerCase()}@careerconnect.com`,
        password: hashedPassword,
        role: 'recruiter',
        company: company,
        isApproved: true,
      });
    }
    const recruiters = await User.insertMany(recruiterDocs);
    console.log(`✅ Created ${recruiters.length} Recruiter accounts.`);

    // 3. Create 40 Students
    const studentDocs = [];
    for (let i = 0; i < studentNames.length; i++) {
      const name = studentNames[i];
      const email = `${name.toLowerCase().replace(/ /g, '.')}@university.edu`;
      
      // Select 3 to 6 random skills
      const shuffledSkills = [...skillPool].sort(() => 0.5 - Math.random());
      const studentSkills = shuffledSkills.slice(0, 3 + Math.floor(Math.random() * 4));

      studentDocs.push({
        name: name,
        email: email,
        password: hashedPassword,
        role: 'student',
        skills: studentSkills,
        education: `B.Tech Computer Science (${2024 + (i % 3)})`,
        resumeUrl: `https://example.com/resumes/${name.toLowerCase().replace(/ /g, '_')}_resume.pdf`,
      });
    }
    const students = await User.insertMany(studentDocs);
    console.log(`✅ Created ${students.length} Student accounts.`);

    // 4. Create 60 Job Listings
    const jobDocs = [];
    for (let i = 0; i < 60; i++) {
      const recruiter = recruiters[i % recruiters.length];
      const title = jobTitles[i % jobTitles.length];
      const location = locations[i % locations.length];
      const jobType = jobTypes[i % jobTypes.length];
      const salaryRange = salaryRanges[i % salaryRanges.length];
      
      const shuffledSkills = [...skillPool].sort(() => 0.5 - Math.random());
      const requiredSkills = shuffledSkills.slice(0, 3 + Math.floor(Math.random() * 3));

      jobDocs.push({
        title: `${title} (${recruiter.company})`,
        description: `We are hiring a skilled ${title} to join our high-impact team at ${recruiter.company}. You will work on cutting-edge features, scalable cloud infrastructure, and collaborative projects.`,
        company: recruiter.company,
        recruiter: recruiter._id,
        skillsRequired: requiredSkills,
        location: location,
        jobType: jobType,
        salaryRange: salaryRange,
        deadline: new Date(Date.now() + (10 + (i % 50)) * 24 * 60 * 60 * 1000),
        status: 'open',
      });
    }
    const jobs = await Job.insertMany(jobDocs);
    console.log(`✅ Created ${jobs.length} Job Listings.`);

    // 5. Create 50 Applications
    const applicationDocs = [];
    const statuses = ['pending', 'shortlisted', 'selected', 'rejected'];
    for (let i = 0; i < 50; i++) {
      const student = students[i % students.length];
      const job = jobs[i % jobs.length];
      const status = statuses[i % statuses.length];

      applicationDocs.push({
        job: job._id,
        student: student._id,
        coverNote: `Hello! I am ${student.name}. I have hands-on experience in ${student.skills.slice(0, 2).join(', ')} and would be excited to contribute to ${job.company}!`,
        status: status,
      });
    }
    const applications = await Application.insertMany(applicationDocs);
    console.log(`✅ Created ${applications.length} Candidate Applications.`);

    // 6. Create Feedback Submissions for Admin from Students & Recruiters
    await Feedback.deleteMany({});
    const sampleFeedbacks = [
      {
        name: 'Jane Doe',
        email: 'jane.doe@university.edu',
        role: 'student',
        user: students[0]._id,
        category: 'General Inquiry',
        subject: 'Request for Summer Internship Filters in Chennai',
        message: 'Hi Admin team! I love the platform and skill workouts. Could we get a specific filter for summer internships in Tamil Nadu?',
        rating: 5,
        status: 'New',
      },
      {
        name: recruiters[0].name,
        email: recruiters[0].email,
        role: 'recruiter',
        user: recruiters[0]._id,
        category: 'Recruiter Support',
        subject: 'Candidate Resume CSV Export Feature',
        message: 'Excellent platform for shortlisting tech talent! It would be great if recruiters could bulk export candidate profiles or skill scores to CSV.',
        rating: 5,
        status: 'In Progress',
        adminNotes: 'Assigned to dev backlog for Q3 release.',
      },
      {
        name: 'Rahul Patel',
        email: 'rahul.patel@university.edu',
        role: 'student',
        user: students[5]._id,
        category: 'Feature Request',
        subject: 'Add React Native & Mobile Modules to Practice Section',
        message: 'The DSA and System Design workouts are super helpful. Please consider adding React Native and Flutter practice quizzes as well!',
        rating: 4,
        status: 'Resolved',
        adminNotes: 'Added mobile practice modules in latest update.',
      },
      {
        name: recruiters[1].name,
        email: recruiters[1].email,
        role: 'recruiter',
        user: recruiters[1]._id,
        category: 'Feedback',
        subject: 'Verified Candidate Skill Score Feedback',
        message: 'The candidate readiness score is extremely accurate for initial applicant screening. Great work on the platform design!',
        rating: 5,
        status: 'Resolved',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@university.edu',
        role: 'student',
        user: students[4]._id,
        category: 'Bug Report',
        subject: 'Notification Bell Badge Count Refresh Issue',
        message: 'Sometimes after marking all notifications read, the bell icon badge takes a page refresh to update.',
        rating: 4,
        status: 'In Progress',
        adminNotes: 'Investigating state sync in navbar component.',
      },
      {
        name: recruiters[2].name,
        email: recruiters[2].email,
        role: 'recruiter',
        user: recruiters[2]._id,
        category: 'General Inquiry',
        subject: 'Bulk Candidate Messaging Permissions',
        message: 'Can recruiters directly message top-tier shortlisted candidates through the platform dashboard?',
        rating: 5,
        status: 'New',
      },
    ];
    const feedbacks = await Feedback.insertMany(sampleFeedbacks);
    console.log(`✅ Created ${feedbacks.length} Feedback Submissions for Admin.`);

    const totalRecords = 1 + recruiters.length + students.length + jobs.length + applications.length + feedbacks.length;

    console.log('\n======================================================');
    console.log(`🚀 SUCCESSFULLY INSTALLED ${totalRecords} RECORDS IN MONGODB!`);
    console.log('======================================================');
    console.log('Breakdown of inserted database records:');
    console.log(`  • Admin:        1`);
    console.log(`  • Recruiters:   ${recruiters.length}`);
    console.log(`  • Students:     ${students.length}`);
    console.log(`  • Jobs:         ${jobs.length}`);
    console.log(`  • Applications: ${applications.length}`);
    console.log(`  • Feedbacks:    ${feedbacks.length}`);
    console.log(`  • TOTAL:        ${totalRecords} Documents`);
    console.log(`  • TOTAL:        ${totalRecords} Documents`);
    console.log('======================================================');
    console.log('Login credentials for testing (Password: Password@123):');
    console.log('  👑 Admin:     admin@careerconnect.com');
    console.log('  🏢 Recruiter: recruiter.google@careerconnect.com');
    console.log('  🏢 Recruiter: recruiter.microsoft@careerconnect.com');
    console.log('  🎓 Student:   jane.doe@university.edu');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error executing bulk seed:', err.message);
    process.exit(1);
  }
};

generate100Data();
