# HRMS - Human Resource Management System

A comprehensive frontend-only HRMS application built with React.js and Material UI, featuring role-based access control for Admin and Employee users.

## 🚀 Features

### 🔐 Authentication & Authorization
- User registration and login
- Role-based access control (Admin/Employee)
- Protected routes with automatic redirects
- Session management with localStorage

### 👨‍💼 Admin Features
- **Dashboard**: Overview with statistics and recent activities
- **Employee Management**: Add, edit, delete, and view employees
- **Leave Management**: Approve/reject leave requests
- **Payroll Management**: Manage employee salaries and generate reports
- **Organization Management**: Company structure overview

### 👷 Employee Features
- **Dashboard**: Personal overview with stats and quick actions
- **Leave Management**: Apply for leave and view leave history
- **Salary View**: View salary details and payslip history
- **Attendance**: Calendar-style attendance tracking

### 🎨 UI/UX Features
- Modern Material UI design
- Responsive layout for all devices
- Theme-based color architecture
- Reusable components (Tables, Cards, Forms)
- Professional navigation with sidebar

## 🛠️ Technology Stack

- **React.js** - Frontend framework
- **Material UI (MUI)** - UI component library
- **React Router v6** - Client-side routing
- **Context API** - State management
- **Vite** - Build tool and development server
- **date-fns** - Date manipulation library

## 📁 Project Structure

```
src/
├── assets/
│   └── theme.js              # MUI theme configuration
├── components/
│   ├── Layout/
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   ├── Sidebar.jsx       # Side navigation menu
│   │   └── ProtectedRoute.jsx # Route protection component
│   └── UI/
│       ├── CustomTable.jsx   # Reusable table component
│       ├── CustomCard.jsx    # Reusable card component
│       └── CustomForm.jsx    # Reusable form component
├── context/
│   └── AuthContext.jsx       # Authentication context
├── pages/
│   ├── Login.jsx             # Login page
│   ├── Register.jsx          # Registration page
│   ├── admin/
│   │   ├── Dashboard.jsx     # Admin dashboard
│   │   ├── Employees.jsx     # Employee management
│   │   ├── Leaves.jsx        # Leave management
│   │   └── Payroll.jsx       # Payroll management
│   └── employee/
│       ├── Dashboard.jsx     # Employee dashboard
│       ├── Leave.jsx         # Leave application
│       └── Salary.jsx        # Salary view
├── App.jsx                   # Main application component
└── main.jsx                  # Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hrms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 👥 User Roles & Access

### Admin Access
- **Email**: Any registered admin email
- **Password**: Any password (for demo purposes)
- **Features**: Full access to all HRMS features

### Employee Access
- **Email**: Any registered employee email
- **Password**: Any password (for demo purposes)
- **Features**: Limited access to personal data and leave management

## 📊 Data Storage

The application uses **localStorage** to simulate a backend database:

- `hrms_users` - User accounts and authentication
- `hrms_employees` - Employee records
- `hrms_leaves` - Leave requests and history
- `hrms_payroll` - Payroll records

## 🎨 Customization

### Theme Configuration
Edit `src/assets/theme.js` to customize:
- Color palette
- Typography
- Component styles
- Spacing and layout

### Adding New Features
1. Create new components in appropriate directories
2. Add routes in `App.jsx`
3. Update navigation in `Sidebar.jsx`
4. Implement role-based access control

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- Role-based route protection
- Input validation
- Session management
- Secure data handling

## 🚀 Deployment

The application can be deployed to any static hosting service:

1. **Netlify**
   ```bash
   npm run build
   # Upload dist folder to Netlify
   ```

2. **Vercel**
   ```bash
   npm run build
   # Deploy using Vercel CLI
   ```

3. **GitHub Pages**
   ```bash
   npm run build
   # Push dist folder to gh-pages branch
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Future Enhancements

- Real backend integration
- Advanced reporting features
- Email notifications
- File upload capabilities
- Advanced search and filtering
- Export functionality
- Mobile app version

---

**Note**: This is a frontend-only demonstration application. For production use, integrate with a proper backend API and database system. 