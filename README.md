# Filaprint

Filaprint is a modern, premium web application designed to help 3D printing enthusiasts manage their filament inventory, track print jobs, and calculate costs and energy usage.

## 🛠️ Technology Stack

-   **Framework:** SvelteKit (Svelte 5)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS v4 (Cerberus Theme)
-   **State Management:** Svelte 5 Runes
-   **Build Tool:** Vite
-   **Data Visualization:** Chart.js
-   **Icons:** Iconify (@iconify/svelte)
-   **Database:** MongoDB with Mongoose
-   **Authentication:** JWT with bcrypt password hashing

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
    -   Duration (minutes) and Weight used (g).
    -   Calculated Cost (auto-calculated or manual override).
    -   Status: Success, Fail, Cancelled, **In Progress**.
-   **In Progress Tracking:**
    -   Assign printer and spool to active jobs.
    -   Specify elapsed time for accurate dashboard countdown.
    -   Real-time progress display on dashboard.
-   **Edit/Delete:** Full CRUD operations for print history.
-   **History:** Clickable entries with detailed information.

### 4. Printer Configuration

-   **Profiles:** Manage multiple printers with custom names.
-   **Specs:** Model name, Power consumption (Watts), Nozzle diameter (mm).
-   **Configure Button:** Edit or delete printer profiles.

### 5. Analytics

-   **Daily Filament Usage:** Line chart showing filament consumption over time.
-   **Daily Electricity Usage:** Bar chart showing power consumption in kWh.
-   **Success Rate:** Visual ring chart with percentage.
-   **Material Distribution:** Doughnut chart showing material breakdown.
-   **Stats Summary:** Total prints, success rate, total electricity used.

### 6. User Management

-   **Authentication:** Secure login/registration with JWT tokens.
-   **User Settings:** Profile editing and password change.
-   **Admin Panel:** Manage users (Admin role only).
-   **Role-Based Access:** Admin and User roles with appropriate permissions.

## 🗂️ Data Models (Mongoose Schemas)

### User Schema

-   `_id`: ObjectId
-   `username`: String (Required, Unique)
-   `email`: String
-   `password`: String (Hashed with bcrypt)
-   `role`: String (Enum: User, Admin)
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
-   `calculated_cost_filament`: Number
-   `status`: String (Enum: Success, Fail, Cancelled, In Progress)
-   `started_at`: Date (For In Progress jobs)
-   `date`: Date (Default: Date.now)

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+ or Bun
-   MongoDB instance (local or Atlas)

### Installation

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
```

### Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/filaprint
JWT_SECRET=your-super-secret-jwt-key
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # Base UI components (Button, Card, Input, Modal)
│   │   ├── prints/       # Print-specific components (LogPrintModal, EditPrintModal)
│   │   └── Navbar.svelte
│   ├── models/           # Mongoose schemas
│   └── server/           # Server utilities (db connection, auth)
├── routes/
│   ├── admin/users/      # Admin user management
│   ├── analytics/        # Analytics dashboard
│   ├── login/            # Authentication
│   ├── printers/         # Printer management
│   ├── prints/           # Print job logging
│   ├── register/         # User registration
│   ├── settings/         # User settings
│   └── spools/           # Filament inventory
└── app.css               # Global styles (Cerberus theme)
```

## ✅ Completed Features

-   [x] User authentication (Login/Register)
-   [x] Dashboard with live stats and active print tracking
-   [x] Spool management (CRUD)
-   [x] Printer management (CRUD)
-   [x] Print job logging with "In Progress" support
-   [x] Cost calculation (auto and manual)
-   [x] Filament deduction on print completion
-   [x] Analytics with Chart.js (filament, electricity, materials)
-   [x] User settings (profile, password change)
-   [x] Admin user management panel
-   [x] Browser notifications for completed prints
-   [x] Iconify icon library integration
-   [x] Responsive design

## 🔮 Future Enhancements

-   [ ] 3D spool visualization with Threlte
-   [ ] QR/Barcode scanning for quick spool lookup
-   [ ] Photo uploads for print jobs
-   [ ] Export data (CSV/PDF reports)
-   [ ] Multi-language support
-   [ ] Dark/Light theme toggle
-   [ ] Email notifications
-   [ ] Print job templates
