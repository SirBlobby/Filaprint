# Filaprint

Filaprint is a modern web application designed to help 3D printing enthusiasts manage their filament inventory, track print jobs, view 3D models, and calculate costs and energy usage.

![Filaprint Dashboard](https://img.shields.io/badge/Filaprint-3D%20Print%20Manager-blue?style=for-the-badge)

## Technology Stack

-   **Framework:** SvelteKit
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **3D Rendering:** Three.js (STL & OBJ loaders)
-   **Data Visualization:** Chart.js
-   **Icons:** Iconify (@iconify/svelte)
-   **Database:** MongoDB
-   **Container:** Docker with Docker Compose

## Features

### 1. Dashboard

-   **Overview Stats:** Active spools, filament on hand, printers, estimated value, and total spent.
-   **Recent Activity:** Quick view of the 5 most recent prints with status indicators.
-   **Printer Status:** Shows active print job with real-time countdown and progress bar.
-   **Browser Notifications:** Get notified when a print job completes.

### 2. Filament Inventory Management

-   **Spool Tracking:**
    -   Brand, Material (PLA, PETG, ABS, ASA, TPU, Other), Color (with hex preview).
    -   Initial Weight vs. Remaining Weight.
    -   Cost per spool and automatic cost-per-gram calculation.
    -   Purchase date tracking.
-   **Edit/Delete:** Full CRUD operations for spool management.
-   **Visual Indicators:** Color preview badges and remaining weight display.

### 3. Print Job Logging

-   **Log Prints:**
    -   Link to specific Printer and Filament Spool.
    -   Duration input with hours and minutes fields.
    -   Weight used (g) and calculated cost (auto or manual).
    -   Status: Success, Fail, Cancelled, **In Progress**.
    -   **3D Model Upload:** Attach STL or OBJ files to prints.
-   **In Progress Tracking:**
    -   Assign printer and spool to active jobs.
    -   Specify elapsed time for accurate dashboard countdown.
    -   Real-time progress display on dashboard.
-   **Cost Calculation:**
    -   Filament cost based on spool price and weight used.
    -   Electricity cost based on printer power consumption and duration.
    -   User-configurable electricity rate ($/kWh).
-   **Edit/Delete:** Full CRUD operations for print history.
-   **History:** Clickable entries with detailed information.

### 4. 3D Model Library

-   **Model Gallery:** Browse all uploaded 3D models in a grid layout.
-   **Interactive 3D Viewer:**
    -   Support for STL and OBJ file formats.
    -   Orbit controls (rotate, pan, zoom).
    -   Touch support for mobile devices.
    -   Auto-rotation with stop on interaction.
-   **Upload Progress:** Progress bar with percentage for model uploads.
-   **Full-Screen View:** Click to view models in an immersive full-screen viewer.

### 5. Printer Configuration

-   **Profiles:** Manage multiple printers with custom names.
-   **Specs:** Model name, Power consumption (Watts), Nozzle diameter (mm).
-   **Configure Button:** Edit or delete printer profiles.

### 6. Analytics

-   **Daily Filament Usage:** Line chart showing filament consumption over time.
-   **Daily Electricity Usage:** Bar chart showing power consumption in kWh.
-   **Success Rate:** Visual ring chart with percentage.
-   **Material Distribution:** Doughnut chart showing material breakdown.
-   **Stats Summary:** Total prints, success rate, total electricity used.

### 7. User Management

-   **Authentication:** Secure login/registration with JWT tokens.
-   **User Settings:**
    -   Profile editing (username, location).
    -   Electricity rate configuration ($/kWh).
    -   Password change.
-   **Admin Panel:** Manage users (Admin role only).
-   **Role-Based Access:** Admin and User roles with appropriate permissions.

## Getting Started

### Prerequisites

-   Node.js 18+ or Bun
-   MongoDB instance (local or Atlas)
-   Docker (optional, for containerized deployment)

### Docker Deployment

```bash
# Copy environment file
cp .env.example .env
# Edit .env with secure values

# Build and start containers
docker compose up -d --build

# View logs
docker compose logs -f filaprint

# Stop containers
docker compose down
```

### Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/filaprint

# JWT Secret (use a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key

# Application Origin (required for CSRF protection)
ORIGIN=http://localhost:3000

# Docker MongoDB Settings
MONGO_USER=admin
MONGO_PASSWORD=changeme
```

## Completed Features

-   [x] User authentication (Login/Register)
-   [x] Dashboard with live stats and active print tracking
-   [x] Spool management (CRUD)
-   [x] Printer management (CRUD)
-   [x] Print job logging with "In Progress" support
-   [x] Duration input with hours/minutes fields
-   [x] Cost calculation (filament + electricity)
-   [x] User-configurable electricity rate
-   [x] Filament deduction on print completion
-   [x] Analytics with Chart.js (filament, electricity, materials)
-   [x] 3D Model Library with interactive viewer
-   [x] STL and OBJ file upload with progress bar
-   [x] Mobile hamburger menu (solid background)
-   [x] User settings (profile, location, electricity rate, password)
-   [x] Admin user management panel
-   [x] Browser notifications for completed prints
-   [x] Iconify icon library integration
-   [x] Responsive design
-   [x] Docker containerization

## Future Features

-   [ ] QR/Barcode scanning for quick spool lookup
-   [ ] Multi-language support
-   [ ] Some notifications
-   [ ] Thumbnail generation for 3D models

## License

MIT License - See LICENSE file for details.
