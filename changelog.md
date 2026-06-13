## 18-05-2026

- chore: application health check setup
- feat: Jenkins setup for continouse delivery
- fix: prisma client issues fix
- feat: category module created
- feat: product module created with full functional

## 19-05-2026

- fix: Jenkinsfile syntax error
- feat: health check endpoint created for prerelease verification
- fix: prerelase and postrelease verification setup for continouse delivery
- fix: environment variable injection fixed
- fix: Caddyfile issues fix

## **20-05-2026**

**Sabbir**

- feat: Custom minio bcuket setup for storing data
- feat: Minio setup and configuration
- feat: File upload and module complitations for upload single & multiple files
- chore: Improve code structure

**Md. Masud Rana**

- Modify get all assessment API
- Add assessment stats API
- Modify single assessment API (_A assessment with all question and option or nested question or option_)

## **21-05-2026**

**Sabbir**

- chore: Jenkins continouse delivery updated
- feat: website metadata, favicon etc common schema design and implementation
- feat: Postgress database backup script setup

## **22-05-2026**

**Md. Masud Rana**

-

## **23-05-2026**

**Sabbir**

- chore: Update jenkins pipline with green, blue indicator
- chore: Branch based prerelase and postrelease setup
  **Masud**
-

## **24-05-2026**

**Sabbir**

- chore: Improvde deployment process to make more relability
- fix: Fixed bucket issues for file upload
- fix: Fix minio storage access
- fix: assesment creating & retriving issues
- chore: rename minio service aliases to minio-storage-live and minio-storage-pre
- chore: expose MinIO S3 API and Web UI ports in release docker-compose configuration
- chore: update MinIO port mappings for live and staging environments
- chore: update Caddyfile proxy targets from docker service names to localhost
- refactor: update Caddyfile proxy ports and remove host port mapping from MinIO services
- chore: configure MinIO public URLs in release docker-compose for production and staging environments
- feat: implement OnModuleInit in StorageService to verify S3 connection on startup
- updated inti anddom
- chore: extend S3 signed URL expiration and improve MinIO proxy configuration and health checks
- chore: force recreate caddy container and add config adaptation step to deployment script
- fix: reduce pre-signed URL expiration from 1 year to 5 days
- refactor: transition storage from direct URLs to keys with dynamic signed URL resolution across services and controllers

## **25-05-2026**

**Md. Masud Rana**

- auth flow complete

## **26-05-2026**

**Sabbir**

- refactor: externalize health check endpoint path via configurable HEALTH_PATH variable
- prisma seed command added on docker compose file
- remove seed
- enable cors
- feat: add reverse proxy configuration for client.weightlossmdcherrycreek.com to Caddyfile
- chore: update reverse proxy address to localhost IPv4 in Caddyfile

**Md. Masud Rana**

- auth template modify

## **27-05-2026**

**Md. Masud Rana**

- origin added
- dashboard origin added

## **04-06-2026**

**Sabbir**

- dashboard added
- fix conflict issues
- added dashboard
- updated domain
- added locations of our dashboard

## **05-06-2026**

**Md. Masud Rana**

- registration flow change

## **06-06-2026**

**Sabbir**

- added dashboard origin

**Md. Masud Rana**

- auth related all API completed
- sms template ready
- doctor profile table add

## **07-06-2026**

**Sabbir**

- chore: hardcode admin credentials for seeding while awaiting environment variable fix
- refactor: comment out status and officeLocationId indexes in DoctorProfile model
- feat: add optional name field to User model
- chore: add dist directory to .doseignore
- chore: add npm start:docker command to service containers in docker-compose.release.yaml

## **08-06-2026**

**Sabbir**

- feat: add contact leads management module with CRUD operations and database schema
- feat: implement file upload support for contact leads using StorageService and update DTO transforms
- feat: implement admin CRUD operations for testimonials with database migration and schema support
- feat: implement discount management module with CRUD operations and database schema support

**Md. Masud Rana**

- doctor management all apis completed

## **09-06-2026**

**Sabbir**

- feat: update admin seeder to support multiple accounts using upsert logic
- feat: improve SMTP robustness with connection verification, timeouts, and error handling, and update login flow to trigger OTP delivery
- feat: add d@wlmd.net to the admin seeding email list
- feat: add d@wlmd.net to the admin seeding email whitelist

**Md. Masud Rana**

- N/A

## **11-06-2026**

**Sabbir**

- feat: implement system health monitoring module with database schema, repository, and controller endpoints
- feat: implement system health tracking and monitoring with automated status recalculations
- feat: implement incident management module and schema with supporting DTOs and API endpoints

**Md. Masud Rana**

- attachment module added
- login otp issue fixed
- assessment submission api added

## **12-06-2026**

**Md. Masud Rana**

- sms twilio service updated
- assessment submission & my submission api add

## **13-06-2026**

**Sabbir**

- feat: implement automatic testimonial database seeding with Google Places API integration and fallback data
- refactor: modularize seed data and implement automated module initialization for website settings
- feat: implement audit logging system and add homepage management module
- feat: implement audit logging for assessment operations and add CSV export functionality to audit log controller
- feat: implement lead response functionality and centralize mail service for OTP and contact lead communications.
- feat: add contact lead response fields and implement DoctorProfile entity migration
- feat: create global CSV export service and implement contact leads export functionality
- feat: implement compliance consent module with database schema, CRUD operations, and seed data
- refactor: centralize schema enums into a dedicated file and clean up migration artifacts

**Md. Masud Rana**

- category table add to payment and category module modify
- category complete
- solve
