# Charterhouse Lagos IT - Device Inventory Management System

A production-ready Next.js frontend for managing device inventory at Charterhouse Lagos IT. This system provides a modern, spreadsheet-style interface for tracking devices, managing workbooks, and handling CSV imports/exports.

## Features

- **Authentication**: Cookie-based authentication with secure HTTP-only cookies
- **Device Management**: 
  - Spreadsheet-style table view with inline editing
  - Responsive card view for mobile devices
  - Search, filter, and pagination capabilities
  - Bulk select and delete operations
  - Color-coded tags for visual organization
  - QR code generation for each device
- **CSV Operations**: Import and export device data via CSV files
- **Workbook Management**: Organize devices into different workbooks
- **Modern UI**: Clean, professional interface built with Tailwind CSS and shadcn/ui

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **QR Codes**: qrcode.react
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ or Bun
- Backend API running on `http://localhost:3000/api` (or configure via environment variable)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Configure environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your API base URL:
```env
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

## Running the Application

### Development Mode
```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
# or
bun run build
bun start
```

## Environment Configuration

### `.env.local`

The application requires the following environment variable:

- `NEXT_PUBLIC_API_BASE`: The base URL for your backend API (default: `http://localhost:3000/api`)

Example:
```env
NEXT_PUBLIC_API_BASE=http://localhost:3000/api
```

## API Integration

The frontend connects to a REST backend with the following endpoints:

### Authentication
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/me` - Get current user (optional)

### Devices
- `GET /api/devices` - List devices with query parameters (q, workbook, location, category, limit, offset)
- `GET /api/devices/:id` - Get single device
- `POST /api/devices` - Create new device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device
- `POST /api/devices/import` - Import devices from CSV (multipart/form-data)
- `GET /api/devices/export` - Export devices to CSV

### Workbooks
- `GET /api/workbooks` - List all workbooks
- `POST /api/workbooks` - Create new workbook
- `DELETE /api/workbooks/:id` - Delete workbook

All API requests include `credentials: 'include'` for HTTP-only cookie authentication.

## Application Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Dashboard (protected)
│   ├── login/page.tsx       # Login page
│   ├── devices/
│   │   ├── new/page.tsx     # Create device form
│   │   └── [id]/page.tsx    # Device detail/edit page
│   ├── workbooks/page.tsx   # Workbook management
│   └── import/page.tsx      # CSV import page
├── components/
│   ├── AuthProtected.tsx    # Authentication wrapper
│   ├── DeviceTable.tsx      # Device table component
│   └── ui/                  # shadcn/ui components
└── lib/
    └── api.ts               # API client with all endpoints
```

## Routes

- `/` - Dashboard (protected) - Main device list with spreadsheet view
- `/login` - Login page
- `/devices/new` - Add new device form
- `/devices/[id]` - View/edit device details with QR code
- `/workbooks` - Manage workbooks
- `/import` - CSV import page

## Features in Detail

### Dashboard
- **Search**: Real-time search across device fields
- **Filters**: Filter by workbook, location, and category
- **Inline Editing**: Double-click or use edit button to modify rows
- **Bulk Operations**: Select multiple devices for bulk deletion
- **Pagination**: Navigate through large datasets efficiently
- **Color Tags**: Visual categorization with color-coded badges
- **Export**: Download current dataset as CSV
- **Responsive**: Collapses to card view on mobile devices

### Device Management
- **Create**: Add new devices with comprehensive form validation
- **Edit**: Update device information inline or via detail page
- **Delete**: Remove devices with confirmation dialogs
- **QR Codes**: Generate scannable QR codes linking to device details

### CSV Import/Export
- **Import**: Upload CSV files with progress feedback
- **Export**: Download device inventory as CSV
- **Format Validation**: Clear requirements for CSV structure

### Security
- **Cookie-based Auth**: Secure HTTP-only cookies
- **Protected Routes**: Automatic redirect to login for unauthorized access
- **Error Handling**: Graceful 401 handling with automatic redirects

## CSV Format

### Import Requirements

CSV files must include the following headers:

```csv
device_model,serial_number,owner_name,date_enrolled,next_maintenance,location,category,color_tag,workbook,notes
```

Example row:
```csv
MacBook Pro 16,ABC123XYZ,John Doe,2024-01-15,2024-07-15,Lagos Office,Laptop,#3b82f6,Main,Engineering laptop
```

**Field Notes**:
- Dates: YYYY-MM-DD format
- color_tag: Hex color codes (e.g., #3b82f6)
- notes: Optional field

## Development

### Code Structure
- All API calls are centralized in `src/lib/api.ts`
- Authentication wrapper component handles route protection
- Components follow atomic design principles
- TypeScript for type safety throughout

### Styling
- Tailwind CSS for utility-first styling
- shadcn/ui for consistent component design
- Dark mode support via CSS variables
- Responsive design with mobile-first approach

## Troubleshooting

### Common Issues

**401 Unauthorized Errors**
- Ensure backend is running and accessible
- Verify NEXT_PUBLIC_API_BASE is correctly configured
- Check that cookies are being set by the backend

**CORS Issues**
- Backend must allow credentials: `Access-Control-Allow-Credentials: true`
- Backend must specify origin: `Access-Control-Allow-Origin: http://localhost:3000`

**Import Failures**
- Verify CSV format matches requirements
- Check that file size is under 10MB
- Ensure dates are in YYYY-MM-DD format

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables:
```env
NEXT_PUBLIC_API_BASE=https://your-api-domain.com/api
```

3. Start the production server:
```bash
npm start
```

Or deploy to platforms like Vercel, Netlify, or any Node.js hosting service.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - Charterhouse Lagos IT

## Support

For issues or questions, contact the IT department at Charterhouse Lagos.