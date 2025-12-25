# Filaprint

Filaprint is a modern, premium web application designed to help 3D printing enthusiasts manage their filament inventory, track print jobs, view 3D models, and calculate costs and energy usage.

![Filaprint Dashboard](https://img.shields.io/badge/Filaprint-3D%20Print%20Manager-blue?style=for-the-badge)

## 🛠️ Technology Stack

-   **Framework:** SvelteKit (Svelte 5)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS v4 (Cerberus Theme)
-   **State Management:** Svelte 5 Runes
-   **Build Tool:** Vite
-   **3D Rendering:** Three.js (STL & OBJ loaders)
-   **Data Visualization:** Chart.js
-   **Icons:** Iconify (@iconify/svelte)
-   **Database:** MongoDB with Mongoose
-   **Authentication:** JWT with bcrypt password hashing
-   **Container:** Docker with Docker Compose

## ✨ Features

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

## 🗂️ Data Models (Mongoose Schemas)

### User Schema

-   `_id`: ObjectId
-   `username`: String (Required, Unique)
-   `password`: String (Hashed with bcrypt)
-   `role`: String (Enum: User, Admin)
-   `location`: String
-   `electricity_rate`: Number (Default: 0.12 $/kWh)
-   `currency`: String (Default: USD)
-   `createdAt`: Date

### Spool Schema

-   `_id`: ObjectId
-   `user_id`: ObjectId (Ref: User)
-   `brand`: String (Required)
-   `material`: String (Required, Enum: PLA, PETG, ABS, ASA, TPU, Other)
-   `color_hex`: String (Default: #ffffff)
-   `weight_initial_g`: Number (Required)
-   `weight_remaining_g`: Number (Required)
-   `price`: Number
-   `purchased_at`: Date
-   `is_active`: Boolean (Default: true)

### Printer Schema

-   `_id`: ObjectId
-   `user_id`: ObjectId (Ref: User)
-   `name`: String (Required)
-   `model`: String
-   `nozzle_diameter_mm`: Number (Default: 0.4)
-   `power_consumption_watts`: Number (Default: 0)

### PrintJob Schema

-   `_id`: ObjectId
-   `user_id`: ObjectId (Ref: User)
-   `printer_id`: ObjectId (Ref: Printer)
-   `spool_id`: ObjectId (Ref: Spool)
-   `name`: String
-   `duration_minutes`: Number
-   `filament_used_g`: Number
-   `calculated_cost_filament`: Number (Total cost including electricity)
-   `calculated_cost_energy`: Number (Electricity cost only)
-   `status`: String (Enum: Success, Fail, Cancelled, In Progress)
-   `started_at`: Date (For In Progress jobs)
-   `stl_file`: String (Path to uploaded 3D model)
-   `date`: Date (Default: Date.now)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+ or Bun
-   MongoDB instance (local or Atlas)
-   Docker (optional, for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/filaprint.git
cd filaprint

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

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

## 📁 Project Structure

```
filaprint/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/           # Base UI components (Button, Card, Input, Modal)
│   │   │   ├── prints/       # Print-specific components (LogPrintModal, EditPrintModal)
│   │   │   ├── STLViewer.svelte  # 3D model viewer (STL & OBJ)
│   │   │   └── Navbar.svelte
│   │   ├── models/           # Mongoose schemas
│   │   └── server/           # Server utilities (db connection, auth)
│   ├── routes/
│   │   ├── admin/users/      # Admin user management
│   │   ├── analytics/        # Analytics dashboard
│   │   ├── api/upload-stl/   # 3D model upload endpoint
│   │   ├── library/          # 3D model library
│   │   ├── login/            # Authentication
│   │   ├── printers/         # Printer management
│   │   ├── prints/           # Print job logging
│   │   ├── register/         # User registration
│   │   ├── settings/         # User settings
│   │   └── spools/           # Filament inventory
│   └── app.css               # Global styles (Cerberus theme)
├── static/
│   └── uploads/models/       # Uploaded 3D model files
├── server/                   # Production server
├── Dockerfile                # Container build instructions
├── docker-compose.yml        # Container orchestration
└── package.json
```

## ✅ Completed Features

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

## 🔮 Future Enhancements

-   [ ] QR/Barcode scanning for quick spool lookup
-   [ ] Photo uploads for print jobs
-   [ ] Export data (CSV/PDF reports)
-   [ ] Multi-language support
-   [ ] Dark/Light theme toggle
-   [ ] Email notifications
-   [ ] Print job templates
-   [ ] 3D printer integration (OctoPrint, Klipper)
-   [ ] Thumbnail generation for 3D models

## 📄 License

MIT License - See LICENSE file for details.
