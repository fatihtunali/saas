# Tour Operations SaaS - Frontend

A modern, production-ready Next.js 14 frontend for the Tour Operations SaaS system.

## Tech Stack

### Core
- **Next.js 14.2.0** - React framework with App Router
- **React 18** - UI library
- **TypeScript 5.3** - Type safety
- **Node.js** - Runtime environment

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **@tailwindcss/forms** - Form styling
- **@tailwindcss/typography** - Typography plugin
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Icon library
- **class-variance-authority** - Variant management
- **clsx** & **tailwind-merge** - Utility functions

### State Management
- **Zustand** - Lightweight state management
- **@tanstack/react-query** - Server state management
- **@tanstack/react-query-devtools** - Query debugging

### Forms & Validation
- **react-hook-form** - Form management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### HTTP & API
- **Axios** - HTTP client with interceptors
- **API Client** - Pre-configured with token management

### Utilities
- **date-fns** - Date manipulation
- **recharts** - Data visualization
- **jspdf** - PDF generation
- **html2canvas** - HTML to canvas conversion

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Auth route group
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── (dashboard)/         # Dashboard route group
│   │   ├── layout.tsx       # Dashboard layout with nav
│   │   └── page.tsx         # Dashboard home page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── layout/              # Layout components
│   ├── forms/               # Form components
│   └── features/            # Feature-specific components
├── lib/
│   ├── api/
│   │   └── client.ts        # Axios client with interceptors
│   ├── hooks/
│   │   └── use-toast.ts     # Toast hook
│   ├── utils/
│   │   └── utils.ts         # Utility functions (cn, etc.)
│   └── constants/
│       └── index.ts         # App constants
├── store/                   # Zustand stores
├── types/
│   └── index.ts            # TypeScript types
└── middleware.ts           # Next.js middleware
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Backend API running on http://localhost:3000/api

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server on port 3001
npm run dev
```

Visit http://localhost:3001 to see the application.

### Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server on port 3001
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### TypeScript Configuration

- **Strict Mode**: Enabled
- **Path Aliases**: `@/*` maps to `./src/*`
- **Module Resolution**: Bundler

### Tailwind CSS

Custom color palette configured:
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

## API Client

The pre-configured API client (`src/lib/api/client.ts`) includes:

### Features
- Automatic token injection
- Request/response interceptors
- Token refresh logic
- Error handling
- TypeScript support

### Usage Example

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const users = await apiClient.get('/users');

// POST request
const newUser = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await apiClient.put('/users/123', { name: 'Jane Doe' });

// DELETE request
await apiClient.delete('/users/123');
```

### Token Management

```typescript
// Set tokens after login
apiClient.setTokens(accessToken, refreshToken);

// Tokens are automatically added to requests
// Refresh token logic is handled automatically on 401 errors
```

## Pages

### Landing Page (`/`)
- Hero section
- Feature highlights
- Links to login/register

### Login Page (`/login`)
- Email/password form
- Remember me checkbox
- Forgot password link
- Link to registration

### Register Page (`/register`)
- Full name, email, password fields
- Terms acceptance
- Link to login

### Dashboard (`/dashboard`)
- Stats cards (customers, tours, revenue, issues)
- Quick start information
- Navigation bar

## Components

### shadcn/ui Components Installed
- `Button` - Various styles and sizes
- `Input` - Text, email, password inputs
- `Select` - Dropdown selection
- `Dialog` - Modal dialogs
- `Toast` - Notification system

### Adding More Components

```bash
npx shadcn@latest add [component-name]
```

## Backend Integration

The frontend expects the backend API to be running on `http://localhost:3000/api`.

### API Endpoints Expected
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- And 300+ other endpoints...

## Styling

### Custom Colors

Use the custom color palette in your components:

```tsx
<div className="bg-primary-500 text-white">Primary</div>
<div className="bg-success-500 text-white">Success</div>
<div className="bg-warning-500 text-white">Warning</div>
<div className="bg-error-500 text-white">Error</div>
```

### Dark Mode

Dark mode is configured and can be toggled by adding the `dark` class to the `html` element.

## Best Practices

1. **Use TypeScript** - Define types for all API responses
2. **Path Aliases** - Use `@/` instead of relative imports
3. **Component Organization** - Keep components small and focused
4. **API Calls** - Use the apiClient for all HTTP requests
5. **Forms** - Use react-hook-form with Zod validation
6. **State** - Use Zustand for global state, React Query for server state

## Troubleshooting

### Port Already in Use
If port 3001 is in use, change it in `package.json`:
```json
"dev": "next dev -p [YOUR_PORT]"
```

### API Connection Issues
Verify the backend is running on http://localhost:3000/api and update `.env.local` if needed.

### Build Errors
On Windows, if you encounter ESM URL scheme errors, this is a known Next.js issue. The dev server works fine for development.

## Next Steps

1. Implement authentication with the backend API
2. Add state management stores
3. Create feature-specific components
4. Add form validation
5. Implement protected routes
6. Add loading states and error handling
7. Create additional pages (tours, customers, bookings, etc.)
8. Add data fetching with React Query
9. Implement file uploads
10. Add charts and analytics

## License

Private - Tour Operations SaaS
