# NPLS - New Product Layout System

A modern Angular 18 application for Storm Products Inc. engineering and marketing teams to manage bowling ball product specifications and create spec sheets.

## Features

- **Dashboard**: Overview of products, statistics, and quick actions
- **Product Management**: Create, edit, and manage bowling ball products
- **NPLS Form**: Comprehensive form for new product creation matching the original Excel layout
- **Core Specifications**: View and manage core RG/differential data by weight
- **Reference Data**: Manage lookup data (coverstocks, finishes, weight blocks, brands, lines)
- **Spec Sheet Export**: Generate downloadable spec sheets for products
- **Responsive Design**: Works on desktop and mobile devices
- **Offline-First**: Uses localStorage for data persistence with API-ready services

## Tech Stack

- **Angular 18** with standalone components
- **Angular Material** for UI components
- **TypeScript** with strict mode
- **SCSS** for styling
- **RxJS** for reactive state management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

\`\`\`bash
cd npls-app
npm install
\`\`\`

### Development Server

\`\`\`bash
npm start
# or
ng serve
\`\`\`

Navigate to \`http://localhost:4200/\`

### Build

\`\`\`bash
npm run build
\`\`\`

Build artifacts will be stored in the \`dist/\` directory.

## Project Structure

\`\`\`
src/app/
├── components/
│   ├── layout/           # Main layout with navigation
│   ├── dashboard/        # Dashboard with stats and quick actions
│   ├── npls-form/        # Main product creation form
│   ├── product-list/     # Product listing with filtering
│   ├── core-specs/       # Core specifications viewer
│   └── reference-data/   # Reference data management
├── models/               # TypeScript interfaces
│   ├── ball.model.ts     # Ball/Product interfaces
│   ├── core.model.ts     # Core specification interfaces
│   └── reference-data.model.ts
├── services/             # Data services
│   ├── storage.service.ts      # LocalStorage wrapper
│   ├── ball.service.ts         # Product CRUD operations
│   ├── core.service.ts         # Core specifications
│   └── reference-data.service.ts
└── assets/               # Seed data from Excel
    ├── balls-seed.json
    ├── rg-seed.json
    └── reference-data.json
\`\`\`

## Data Flow

1. **Initial Load**: Data is loaded from JSON seed files (extracted from the Excel file)
2. **LocalStorage**: All data is cached in localStorage for offline use
3. **API Ready**: Services are structured to easily connect to a SQL backend API

## API Integration

The services are designed for easy API integration. Replace the localStorage operations with HTTP calls when your SQL backend is ready.

## Future Enhancements

- [ ] User authentication and role-based access
- [ ] SQL Server/PostgreSQL backend API
- [ ] Workflow tracking for product approval process
- [ ] PDF spec sheet generation
- [ ] Image upload for product photos
- [ ] Batch import/export functionality
- [ ] Real-time collaboration features

## License

Proprietary - Storm Products, Inc.
