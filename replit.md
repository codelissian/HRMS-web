# OneHR - Human Resource Management System

## Overview

OneHR is a comprehensive Human Resource Management System built as a full-stack web application. It provides role-based access control for managing employees, departments, leave requests, and organisational operations. The system supports multiple user roles including system administrators, organisation administrators, HR managers, and employees, each with specific permissions and capabilities.

The application follows a modern full-stack architecture with a React frontend and Express backend, utilizing PostgreSQL for data persistence and Drizzle ORM for database operations. It's designed to handle multi-tenant organisations with proper isolation and security.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application is built with React 18 using functional components and hooks. It implements a comprehensive routing system using Wouter for client-side navigation. The UI is built on top of shadcn/ui components with Tailwind CSS for styling, providing a modern and responsive design system.

The frontend follows a layered architecture with clear separation of concerns:
- **Pages**: Route-level components for different application screens
- **Components**: Reusable UI components organized by feature (auth, layout, employees, leaves)
- **Services**: API communication layer with dedicated service classes
- **Contexts**: Global state management using React Context API for authentication and theming
- **Hooks**: Custom hooks for API calls, authentication, and UI state management

The application implements comprehensive state management through React Query for server state and Context API for client state. Authentication is handled via JWT tokens stored in localStorage with automatic token refresh capabilities.

### Backend Architecture
The server is built with Express.js and follows a RESTful API design pattern. The backend implements a modular architecture with route registration and middleware support. It uses TypeScript for type safety and includes development tooling with Vite for hot reloading.

The backend architecture includes:
- **Route Registration**: Centralized route management system
- **Storage Interface**: Abstracted data access layer supporting multiple storage implementations
- **Memory Storage**: In-memory storage implementation for development/testing
- **Middleware**: Request logging, error handling, and authentication middleware

### Database Schema
The application uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports multi-tenant architecture with proper relationships between entities:

- **Admins**: System and organisation administrators with full profile information
- **organisations**: Tenant isolation with plan-based feature access
- **Employees**: Employee records with comprehensive personal and professional details
- **Departments**: organisational structure management
- **Leave Management**: Leave types and leave request tracking with approval workflows

The database implements soft deletion patterns with `delete_flag` and `active_flag` fields for data integrity and audit trails.

### Authentication and Authorization
The system implements JWT-based authentication with role-based access control (RBAC). It supports multiple authentication methods including email/mobile login for both admins and employees. The authorization system provides fine-grained permissions based on user roles and organisational context.

Key features include:
- Multi-role authentication (admin/employee)
- JWT token management with refresh tokens
- Permission-based UI rendering
- Protected routes with role validation
- Session persistence and automatic logout

### UI/UX Design System
The application uses a comprehensive design system based on shadcn/ui components with Tailwind CSS. It implements a dark/light theme system with CSS variables for consistent theming across the application. The design follows modern Material Design principles with proper spacing, typography, and color schemes.

The UI architecture includes:
- Responsive layout system with mobile-first approach
- Comprehensive component library with consistent styling
- Modern gradient backgrounds and glass morphism effects
- Theme switching with persistence
- Accessible form controls and navigation
- Loading states and error handling UI patterns
- Mandatory field indicators (*) on all forms
- Enhanced hover effects and smooth transitions

### Calendar Component System
The application features a comprehensive calendar component system for managing leaves, holidays, and employee attendance:

**Core Components:**
- **Calendar**: Base calendar component with monthly grid view
- **CalendarView**: Enhanced calendar with filtering and management features
- **CalendarPage**: Integrated page component with routing and authentication

**Features:**
- Multi-event type support (leaves, holidays, attendance)
- Color-coded status indicators with icons
- Event filtering by type and status
- Responsive design with mobile optimization
- Dark/light mode compatibility
- Event click handlers and date selection
- Employee-specific and organisation-wide views
- Export and management capabilities

**Event Types Supported:**
- Leave requests (annual, sick, personal, maternity, emergency)
- Federal and company holidays
- Attendance tracking (present, absent, half-day)
- Custom event types with flexible configuration

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and functional components
- **Express.js**: Backend web framework for Node.js
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Build tool and development server with hot reloading

### Database and ORM
- **PostgreSQL**: Primary database (configured via DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe ORM with schema management and migrations
- **Neon Database**: Serverless PostgreSQL provider (@neondatabase/serverless)

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Modern React component library built on Radix UI primitives
- **Radix UI**: Comprehensive set of low-level UI primitives for accessibility
- **Lucide React**: Icon library for consistent iconography

### State Management and Data Fetching
- **React Query (TanStack Query)**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for forms and API data

### Authentication and Session Management
- **JWT**: JSON Web Tokens for authentication
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer
- **React Dev Tools**: Development utilities and error overlay

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Utility for constructing className strings
- **class-variance-authority**: Utility for managing component variants