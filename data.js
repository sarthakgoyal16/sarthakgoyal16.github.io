// Sample data: 50 college students (name|course|year|college|subjects|best time|mode|goal)
const RAW = `Aarav Sharma|B.Tech CSE|2|IIT Delhi|DSA,Maths,Python|Night|Online|Crack placements
Priya Singh|B.Sc Physics|1|Delhi University|Physics,Maths,Chemistry|Morning|Offline|Score 9+ CGPA
Rohan Mehta|BBA|3|Symbiosis Pune|Marketing,Finance,Economics|Evening|Both|Prepare for CAT
Sneha Reddy|MBBS|2|AIIMS Delhi|Anatomy,Physiology,Biochemistry|Morning|Offline|Clear exams with distinction
Karan Gill|B.Tech ECE|3|PEC Chandigarh|Electronics,Signals,Maths|Night|Both|GATE preparation
Ananya Iyer|B.Com Hons|1|Christ University|Accounts,Economics,Statistics|Afternoon|Online|Build strong basics
Mohit Verma|B.Tech Mechanical|4|NIT Jalandhar|Thermodynamics,Mechanics,CAD|Evening|Offline|Final year project
Simran Kaur|BCA|2|Lovely Professional University|Java,Web Dev,DBMS|Afternoon|Online|Learn full-stack
Vikram Rao|B.Arch|3|CEPT Ahmedabad|Design,Structures,History of Art|Night|Offline|Portfolio building
Ishita Bansal|B.Sc Chemistry|2|Panjab University|Organic Chem,Physical Chem,Maths|Morning|Both|Prepare for MSc entrance
Arjun Nair|B.Tech IT|3|VIT Vellore|Cloud,Networks,Python|Evening|Online|Get a cloud certification
Meera Joshi|LLB|2|NLU Jodhpur|Constitutional Law,Contracts,Legal Writing|Evening|Both|Moot court prep
Harpreet Singh|B.Tech Civil|1|GNDEC Ludhiana|Maths,Physics,Drawing|Morning|Offline|Pass first year easily
Divya Menon|B.Sc Data Science|2|Christ University|Statistics,Python,Machine Learning|Night|Online|Kaggle competitions
Rahul Yadav|B.Tech CSE|4|BITS Pilani|DSA,OS,System Design|Night|Online|Product company interviews
Pooja Agarwal|BA Economics|3|St. Stephen's College|Economics,Statistics,Politics|Afternoon|Offline|Civil services foundation
Nikhil Kapoor|B.Tech AI|1|IIIT Hyderabad|Maths,C Programming,Logic|Evening|Both|Learn AI from scratch
Tanvi Desai|B.Pharm|2|Manipal University|Pharmacology,Pharmaceutics,Chemistry|Morning|Offline|Top the semester
Gurpreet Sandhu|B.Tech EEE|3|Thapar University|Circuits,Control Systems,Maths|Night|Both|GATE preparation
Aditi Rao|BBA|1|IIM Indore (IPM)|Management,Maths,English|Afternoon|Online|Improve communication
Sahil Khan|B.Sc Computer Science|2|Aligarh Muslim University|C++,DSA,Discrete Maths|Evening|Online|Competitive programming
Neha Pillai|B.Des|2|NID Bengaluru|Design,Typography,UX|Night|Both|UX internship
Yash Malhotra|B.Tech CSE|1|DTU Delhi|C Programming,Maths,Physics|Morning|Offline|Strong coding basics
Kavya Hegde|MBBS|4|JIPMER Puducherry|Medicine,Surgery,Pharmacology|Night|Offline|NEET PG preparation
Amanpreet Kaur|B.Ed|1|Punjabi University Patiala|Pedagogy,Psychology,English|Afternoon|Both|Clear CTET
Rishi Choudhary|B.Tech Chemical|3|IIT Roorkee|Fluid Mechanics,Thermodynamics,Maths|Evening|Both|Research internship
Shreya Ghosh|BA English|2|Jadavpur University|Literature,Linguistics,Writing|Evening|Online|Write a research paper
Devansh Gupta|B.Tech ECE|2|NSUT Delhi|Electronics,Maths,Embedded C|Night|Online|Build IoT projects
Lakshmi Narayanan|B.Sc Maths|3|Loyola College Chennai|Real Analysis,Algebra,Statistics|Morning|Offline|Crack IIT JAM
Jasleen Brar|B.Tech Biotech|2|Chitkara University|Biology,Genetics,Chemistry|Afternoon|Both|Lab skills and research
Ayush Tiwari|BCA|1|Amity University|Python,Maths,Computer Basics|Evening|Online|Learn programming
Riya Chatterjee|B.Com|3|St. Xavier's Kolkata|Accounts,Taxation,Business Law|Morning|Offline|CA Foundation
Tarun Bhatia|B.Tech CSE|3|IIIT Delhi|ML,Linear Algebra,Python|Night|Online|Publish a research paper
Fatima Sheikh|B.Sc Psychology|2|Mumbai University|Psychology,Statistics,Research Methods|Afternoon|Both|Plan for MA Psychology
Harsh Vardhan|B.Tech Mechanical|2|MNIT Jaipur|Mechanics,CAD,Materials|Morning|Offline|Join the SAE team
Naina Thakur|BBA|2|Chandigarh University|Marketing,HR,Business Stats|Evening|Both|Land a summer internship
Siddharth Jain|B.Tech CSE|4|VJTI Mumbai|Web Dev,DBMS,System Design|Night|Online|Startup MVP
Komal Arora|B.Sc Nursing|1|PGIMER Chandigarh|Anatomy,Nursing Basics,Biology|Morning|Offline|Hospital placement ready
Dhruv Saxena|B.Tech Aerospace|3|IIT Kanpur|Aerodynamics,Maths,MATLAB|Night|Both|Drone project
Bhavna Solanki|BA Political Science|1|Jawaharlal Nehru University|Politics,History,Sociology|Afternoon|Offline|UPSC foundation
Manav Oberoi|B.Tech IT|2|SRM Chennai|Java,Networks,DBMS|Evening|Online|Hackathon team
Zoya Ahmed|B.Tech AI|3|Jamia Millia Islamia|Deep Learning,Python,Maths|Night|Online|Master neural networks
Pranav Kulkarni|B.Sc Statistics|3|Fergusson College Pune|Probability,R Programming,Statistics|Morning|Both|Become a data analyst
Gagan Deep|B.Tech Civil|4|IIT Ropar|Structures,Concrete,Surveying|Evening|Offline|GATE preparation
Ritika Sen|BA Journalism|2|Presidency University|Media Studies,Writing,Politics|Afternoon|Both|Build a writing portfolio
Utkarsh Pandey|B.Tech CSE|2|IIT BHU|DSA,Maths,Competitive Coding|Night|Online|Reach Codeforces specialist
Mansi Rathore|B.Des Fashion|3|NIFT Delhi|Textiles,Design,Fashion History|Evening|Offline|Final collection
Jatin Sethi|B.Tech Electrical|1|Punjab Engineering College|Circuits,Maths,Physics|Morning|Both|Strong first-year start
Aisha Fernandes|B.Sc Biology|1|Goa University|Botany,Zoology,Chemistry|Afternoon|Offline|Pre-med path
Kunal Dhillon|B.Tech Production|3|PTU Jalandhar|Manufacturing,CAD,Maths|Night|Both|Core job placement`;

const PEOPLE = RAW.trim().split('\n').map((line, i) => {
  const [name, course, year, college, subs, time, mode, goal] = line.split('|');
  return {
    id: i + 1, name, course, year: +year, college,
    subjects: subs.split(','), time, mode, goal,
    bio: `${course} student at ${college}. I study best in the ${time.toLowerCase()} and prefer ${mode === 'Both' ? 'online or offline' : mode.toLowerCase()} sessions. Looking for a partner to stay consistent.`
  };
});
