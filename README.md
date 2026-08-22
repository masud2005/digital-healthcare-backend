# Digital Healthcare Backend

A comprehensive backend system for a modern **Telehealth, Telemedicine, and Online Pharmacy** platform. This project provides robust RESTful APIs to manage users, health assessments, doctor-patient consultations, medical product e-commerce, subscriptions, and dynamic website content.

## 🚀 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL
- **Real-time Communication**: Socket.io
- **File Storage**: AWS S3 
- **Email Service**: Handlebars & Nodemailer
- **Deployment**: Docker, Caddy, Jenkins (CI/CD)

---

## 🌟 Key Features

### 🩺 Medical & Telehealth
- **Health Assessments:** Dynamic medical questionnaires and patient assessments.
- **Provider Management:** Management of medical providers, state coverage, and provider licensing.
- **Compliance:** HIPAA notices, patient consent, and side-effect reporting.
- **Medical Records:** Request and management of patient medical records.
- **Lab Testing:** Integration for patient lab tests and results.

### 🛒 E-Commerce & Online Pharmacy
- **Product Management:** Medical products, categories, and inventory.
- **Order Processing:** Cart, checkout, shipping info, and order tracking.
- **Payments & Subscriptions:** Secure payments, saved cards, billing cancellations, and recurring subscriptions for medicines.
- **Offers:** Discounts, promotional codes, and refunds.

### 📝 Content Management System (CMS)
- Dynamic management of website content including:
  - Homepage, About Us, Services, FAQ, Blogs, and Testimonials.
  - Hero Sections, CTA Sections, Coverage Sections.
  - Privacy Policy, Terms of Service.

### 💬 Communication & Support
- Real-time notifications and messaging.
- Automated email templates for orders, appointments, and alerts.
- Contact forms and lead generation.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- PostgreSQL database
- Docker & Docker Compose (optional, for containerized deployment)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/masud2005/digital-healthcare-backend.git
   cd digital-healthcare-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory based on `.env.example` (if available) and configure your PostgreSQL connection and other credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db"
   PORT=5056
   ```

4. **Database Migration & Seeding:**
   Generate the Prisma client, apply migrations, and seed initial data:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

---

## 💻 Running the Application

- **Development Mode:**
  ```bash
  npm run dev
  ```
  *(This command automatically generates Prisma models, runs migrations, seeds data, and starts the server in watch mode.)*

- **Production Build:**
  ```bash
  npm run build
  npm run start:prod
  ```

---

## 📜 Available Scripts

- `npm run dev`: Start the application in development mode with hot-reload.
- `npm run build`: Compile the TypeScript code to JavaScript (`/dist`).
- `npm run start:prod`: Run the compiled production build.
- `npm run format`: Format code using Prettier.
- `npm run lint`: Lint code using ESLint.
- `npm run prisma:generate`: Generate Prisma types.
- `npm run prisma:studio`: Open Prisma Studio to view and edit database records visually.

---

## 🐳 Deployment (Docker)
The project includes `Dockerfile` and `docker-compose.yaml` files for easy deployment.
```bash
docker-compose --profile prod up -d --build
```
*Note: Refer to the `docs/` directory for detailed Jenkins CI/CD pipeline and zero-downtime deployment notes.*

---

## 🛡️ License

This project is proprietary and confidential. Unauthorized copying of this project, via any medium is strictly prohibited.
