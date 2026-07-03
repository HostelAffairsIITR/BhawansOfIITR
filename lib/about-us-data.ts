export interface SecretariatMember {
  name: string
  role: string
  team: string
  year?: string
  bhawan?: string
  email?: string
}

export interface HostelAffairsSecretary {
  name: string
  role: string
  year: string
  bhawan: string
  email: string
  bio: string
}

export const HOSTEL_AFFAIRS_SECRETARY: HostelAffairsSecretary = {
  name: 'Divyansh Gupta',
  role: 'Hostel Affairs Secretary, IIT Roorkee',
  year: '4th Year, B.Tech',
  bhawan: 'Rajendra Bhawan',
  email: 'has@iitr.ac.in',
  bio: 'Responsible for leading student residential policies, mess sanitation, and inter-bhawan sports/cultural leagues across the campus hostels.',
}

export const SECRETARIAT_TEAMS: SecretariatMember[] = [
  // Events Team
  { name: 'Aarav Mehta', role: 'Events Head', team: 'Events', year: '3rd Year', bhawan: 'Ganga Bhawan' },
  { name: 'Ishita Goel', role: 'Core Coordinator', team: 'Events', year: '2nd Year', bhawan: 'Sarojini Bhawan' },
  { name: 'Kabir Sen', role: 'Core Coordinator', team: 'Events', year: '3rd Year', bhawan: 'Cautley Bhawan' },
  { name: 'Riya Varma', role: 'Core Member', team: 'Events', year: '2nd Year', bhawan: 'Kasturba Bhawan' },
  { name: 'Amit Roy', role: 'Core Member', team: 'Events', year: '2nd Year', bhawan: 'Govind Bhawan' },

  // Media and Outreach Team
  { name: 'Tanya Bansal', role: 'Media & Outreach Head', team: 'Media and Outreach', year: '3rd Year', bhawan: 'Sarojini Bhawan' },
  { name: 'Aditya Roy', role: 'Outreach Lead', team: 'Media and Outreach', year: '3rd Year', bhawan: 'Jawahar Bhawan' },
  { name: 'Anushka Rao', role: 'PR Coordinator', team: 'Media and Outreach', year: '2nd Year', bhawan: 'Himalaya Bhawan' },
  { name: 'Sameer Dixit', role: 'Social Media Manager', team: 'Media and Outreach', year: '2nd Year', bhawan: 'Rajiv Bhawan' },
  { name: 'Priya Joshi', role: 'Outreach Coordinator', team: 'Media and Outreach', year: '2nd Year', bhawan: 'Kasturba Bhawan' },

  // Design Team
  { name: 'Kunal Jha', role: 'Design Head', team: 'Design', year: '3rd Year', bhawan: 'Radhakrishnan Bhawan' },
  { name: 'Srishti Das', role: 'UI/UX Lead', team: 'Design', year: '3rd Year', bhawan: 'Indira Bhawan' },
  { name: 'Madhav Nair', role: 'Creative Director', team: 'Design', year: '2nd Year', bhawan: 'Malviya Bhawan' },
  { name: 'Meera Shah', role: 'Illustrator Coordinator', team: 'Design', year: '2nd Year', bhawan: 'Sarojini Bhawan' },
  { name: 'Varun Patel', role: 'Design Member', team: 'Design', year: '2nd Year', bhawan: 'Vivekananda Bhawan' },

  // Editorials Team
  { name: 'Shreya Ghoshal', role: 'Editorials Head', team: 'Editorials', year: '3rd Year', bhawan: 'Kasturba Bhawan' },
  { name: 'Aryan Khare', role: 'Content Lead', team: 'Editorials', year: '3rd Year', bhawan: 'Ravindra Bhawan' },
  { name: 'Nisha Patel', role: 'Senior Editor', team: 'Editorials', year: '2nd Year', bhawan: 'Himalaya Bhawan' },
  { name: 'Varun Joshi', role: 'Editor', team: 'Editorials', year: '2nd Year', bhawan: 'Azad Bhawan' },
  { name: 'Rahul Sen', role: 'Writer', team: 'Editorials', year: '2nd Year', bhawan: 'Ganga Bhawan' },

  // Web Development Team
  { name: 'Dhruv Kandpal', role: 'Web Development Head', team: 'Web Development', year: '3rd Year', bhawan: 'Vivekananda Bhawan' },
  { name: 'Rohit Kumar', role: 'Full Stack Engineer', team: 'Web Development', year: '3rd Year', bhawan: 'Govind Bhawan' },
  { name: 'Neha Sharma', role: 'Frontend Engineer', team: 'Web Development', year: '2nd Year', bhawan: 'Sarojini Bhawan' },
  { name: 'Siddharth Jain', role: 'DevOps Lead', team: 'Web Development', year: '3rd Year', bhawan: 'Rajendra Bhawan' },
  { name: 'Snehal Patil', role: 'Web Developer', team: 'Web Development', year: '2nd Year', bhawan: 'Indira Bhawan' },
]
