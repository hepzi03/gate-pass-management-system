const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB Atlas connection string - replace with your actual connection string
const MONGODB_URI = 'mongodb+srv://'
// User schemas (simplified versions)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  department: String,
  studentId: String,
  assignedStudents: [String]
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function setupUsers() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create users
    const users = [
      {
        name: 'John Student',
        email: 'student@gmail.com',
        password: 'password123',
        role: 'student',
        department: 'Computer Science',
        studentId: 'CS001'
      },
      {
        name: 'Jane Advisor',
        email: 'advisor@gmail.com',
        password: 'password123',
        role: 'advisor',
        department: 'Computer Science',
        assignedStudents: ['CS001']
      },
      {
        name: 'Bob HOD',
        email: 'hod@gmail.com',
        password: 'password123',
        role: 'hod',
        department: 'Computer Science'
      },
      {
        name: 'Alice Warden',
        email: 'warden@gmail.com',
        password: 'password123',
        role: 'warden',
        department: 'Computer Science'
      },
      {
        name: 'Guard Smith',
        email: 'guard@gmail.com',
        password: 'password123',
        role: 'guard',
        department: 'Security'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.name} (${userData.role})`);
    }

    console.log('\n✅ All users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Student: student@gmail.com / password123');
    console.log('Advisor: advisor@gmail.com / password123');
    console.log('HOD: hod@gmail.com / password123');
    console.log('Warden: warden@gmail.com / password123');
    console.log('Guard: guard@gmail.com / password123');

  } catch (error) {
    console.error('Error setting up users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupUsers();
