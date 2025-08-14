# Gate Pass Management System

A complete hostel gate pass management system built with Next.js, MongoDB, and TailwindCSS. The system manages student leave requests through a multi-level approval workflow and tracks entry/exit using QR codes.

## Features

### 🎯 Core Functionality
- **Multi-level Approval Workflow**: Student → Advisor → HOD → Warden
- **QR Code Generation**: Automatic QR token generation for approved leaves
- **QR Code Scanning**: Guard scanner for entry/exit tracking
- **Role-based Access Control**: Separate dashboards for each user role
- **Real-time Status Tracking**: Monitor leave request progress

### 👥 User Roles
- **Student**: Submit leave requests, view status, download QR codes
- **Advisor**: Approve/reject requests from assigned students
- **HOD**: Review advisor-approved requests
- **Warden**: Final approval authority
- **Guard**: Scan QR codes, track entry/exit

### 🚀 Technical Features
- **Next.js 14**: Latest App Router with server actions
- **MongoDB**: Mongoose ODM with efficient indexing
- **NextAuth.js**: Secure authentication with role-based access
- **TailwindCSS**: Modern, responsive UI design
- **TypeScript**: Full type safety
- **Mobile-first Design**: Optimized for all devices

## Prerequisites

- Node.js 18+ 
- MongoDB 5+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gate-pass-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/gate-pass-system
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Start MongoDB service
   - The system will automatically create collections on first use

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Initial Setup

### 1. Create Admin Users
You'll need to create initial users for each role. You can do this by:

- Using MongoDB Compass to manually insert users
- Creating a setup script
- Using the API endpoints

### 2. Sample User Structure
```javascript
// Student
{
  name: "John Doe",
  email: "john@student.com",
  password: "password123",
  role: "student",
  studentId: "STU001",
  department: "Computer Science"
}

// Advisor
{
  name: "Dr. Smith",
  email: "smith@advisor.com",
  password: "password123",
  role: "advisor",
  department: "Computer Science",
  assignedStudents: [] // Will be populated with student IDs
}

// HOD
{
  name: "Prof. Johnson",
  email: "johnson@hod.com",
  password: "password123",
  role: "hod",
  department: "Computer Science"
}

// Warden
{
  name: "Mr. Wilson",
  email: "wilson@warden.com",
  password: "password123",
  role: "warden",
  department: "Hostel Management"
}

// Guard
{
  name: "Security Guard",
  email: "guard@security.com",
  password: "password123",
  role: "guard"
}
```

## Usage

### Student Workflow
1. **Login** with student credentials
2. **Submit Leave Request** with dates, reason, destination, emergency contact
3. **Track Status** through approval stages
4. **Download QR Code** once fully approved
5. **Use QR Code** for entry/exit at gate

### Advisor Workflow
1. **Login** with advisor credentials
2. **View Pending Requests** from assigned students
3. **Review Details** and approve/reject with comments
4. **Monitor Progress** of approved requests

### HOD Workflow
1. **Login** with HOD credentials
2. **Review Advisor-approved** requests
3. **Approve/Reject** with comments
4. **Forward to Warden** if approved

### Warden Workflow
1. **Login** with warden credentials
2. **Review HOD-approved** requests
3. **Final Approval** generates QR code
4. **Monitor** all approved leaves

### Guard Workflow
1. **Login** with guard credentials
2. **Open QR Scanner** on mobile device
3. **Scan Student QR Codes** for entry/exit
4. **View Scan Logs** and history

## API Endpoints

### Student
- `GET /api/student/leave-requests` - Fetch student's leave requests
- `POST /api/student/leave-requests` - Create new leave request

### Advisor
- `GET /api/advisor/leave-requests` - Fetch assigned students' requests
- `POST /api/advisor/leave-requests/[id]/approve` - Approve/reject request

### Guard
- `POST /api/guard/scan` - Process QR code scan
- `GET /api/guard/scan-logs` - Fetch scan history

## Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['student', 'advisor', 'hod', 'warden', 'guard'],
  assignedStudents: [ObjectId], // For advisors
  studentId: String, // For students
  department: String, // For staff
  timestamps
}
```

### LeaveRequest Collection
```javascript
{
  studentId: ObjectId (ref: User),
  fromDate: Date,
  toDate: Date,
  reason: String,
  destination: String,
  emergencyContact: String,
  attachment: String (optional),
  status: Enum ['pending', 'approved', 'rejected'],
  approvals: {
    advisor: { status, comment, timestamp },
    hod: { status, comment, timestamp },
    warden: { status, comment, timestamp }
  },
  qrToken: String (unique),
  scanStatus: Enum ['not_scanned', 'out', 'in'],
  outTime: Date,
  inTime: Date,
  timestamps
}
```

### ScanLog Collection
```javascript
{
  leaveId: ObjectId (ref: LeaveRequest),
  guardId: ObjectId (ref: User),
  scanType: Enum ['OUT', 'IN'],
  timestamp: Date,
  qrToken: String,
  isValid: Boolean,
  errorMessage: String (optional),
  timestamps
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure session management
- **Role-based Access**: API route protection
- **Input Validation**: Server-side validation
- **CORS Protection**: Configured for production

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Static export with API routes
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## Roadmap

- [ ] Email notifications
- [ ] SMS alerts
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Integration with existing systems
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline support

---

Built with ❤️ using Next.js, MongoDB, and TailwindCSS
