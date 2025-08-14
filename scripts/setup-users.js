const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gate-pass-system';

// User Schema (simplified for setup)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  studentId: String,
  department: String,
  assignedStudents: [String]
});

const User = mongoose.model('User', userSchema);

// Sample users data
const sampleUsers = [
  {
    name: "John Student",
    email: "student@gmail.com",
    password: "password123",
    role: "student",
    studentId: "STU001",
    department: "Computer Science"
  },
  {
    name: "Dr. Smith Advisor",
    email: "advisor@gmail.com",
    password: "password123",
    role: "advisor",
    department: "Computer Science",
    assignedStudents: [] // Will be populated after student creation
  },
  {
    name: "Prof. Johnson HOD",
    email: "hod@gmail.com",
    password: "password123",
    role: "hod",
    department: "Computer Science"
  },
  {
    name: "Mr. Wilson Warden",
    email: "warden@gmail.com",
    password: "password123",
    role: "warden",
    department: "Hostel Management"
  },
  {
    name: "Security Guard",
    email: "guard@gmail.com",
    password: "password123",
    role: "guard"
  }
];

async function setupUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create users with hashed passwords
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    // Find the student and advisor
    const student = createdUsers.find(u => u.role === 'student');
    const advisor = createdUsers.find(u => u.role === 'advisor');

    // Assign student to advisor
    if (student && advisor) {
      advisor.assignedStudents = [student._id];
      await advisor.save();
      console.log(`✅ Assigned student ${student.name} to advisor ${advisor.name}`);
    }

    console.log('\n🎉 Setup complete! You can now login with:');
    console.log('📧 student@gmail.com / password123 (Student)');
    console.log('📧 advisor@gmail.com / password123 (Advisor)');
    console.log('📧 hod@gmail.com / password123 (HOD)');
    console.log('📧 warden@gmail.com / password123 (Warden)');
    console.log('📧 guard@gmail.com / password123 (Guard)');
    console.log('\n💡 The advisor now has the student assigned and can see leave requests!');

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupUsers();
