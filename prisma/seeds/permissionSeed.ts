import { PrismaClient } from "@prisma/client";

const defaultPermissions = [
    { key: "view:dashboard", name: "View Dashboard", description: "Access to view the administrator dashboard" },
    { key: "view:doctor_management", name: "View Doctor Management", description: "Access to view doctors list" },
    { key: "manage:doctor_management", name: "Manage Doctor Management", description: "Add, edit, or delete doctors" },
    { key: "view:patient_management", name: "View Patient Management", description: "Access to view patients list" },
    { key: "manage:patient_management", name: "Manage Patient Management", description: "Add, edit, or delete patients" },
    { key: "view:orders", name: "View Orders", description: "Access to view order records" },
    { key: "manage:orders", name: "Manage Orders", description: "Update or handle orders" },
    { key: "view:contact_leads", name: "View Contact Leads", description: "Access to view contact leads" },
    { key: "manage:contact_leads", name: "Manage Contact Leads", description: "Edit or update contact leads" },
    { key: "view:payments", name: "View Payments", description: "Access to view payment history" },
    { key: "manage:payments", name: "Manage Payments", description: "Handle payment refunds or updates" },
    { key: "view:service_categories_and_plans", name: "View Service Categories & Plans", description: "View categories and plans" },
    { key: "manage:service_categories_and_plans", name: "Manage Service Categories & Plans", description: "Create or modify categories and plans" },
    { key: "view:assessments", name: "View Assessments", description: "View assessment templates" },
    { key: "manage:assessments", name: "Manage Assessments", description: "Create or edit assessment templates" },
    { key: "view:products", name: "View Products", description: "View products catalog" },
    { key: "manage:products", name: "Manage Products", description: "Create or edit products" },
    { key: "view:testimonials", name: "View Testimonials", description: "View testimonials" },
    { key: "manage:testimonials", name: "Manage Testimonials", description: "Approve or edit testimonials" },
    { key: "view:discounts_and_marketing", name: "View Discounts & Marketing", description: "View discount campaigns" },
    { key: "manage:discounts_and_marketing", name: "Manage Discounts & Marketing", description: "Create or edit discounts" },
    { key: "view:website_management", name: "View Website Management", description: "Access to view website settings" },
    { key: "manage:website_management", name: "Manage Website Management", description: "Update website pages and options" },
    { key: "view:employee_permissions", name: "View Employee Permissions", description: "Access to view employee roles and permissions" },
    { key: "manage:employee_permissions", name: "Manage Employee Permissions", description: "Create or modify roles and employee accounts" },
    { key: "view:compliance_center", name: "View Compliance Center", description: "Access to view compliance dashboards" },
    { key: "manage:compliance_center", name: "Manage Compliance Center", description: "Modify compliance files and settings" },
    { key: "view:audit_logs", name: "View Audit Logs", description: "Access compliance and activity audit logs" },
    { key: "view:consent_management", name: "View Consent Management", description: "View consent templates" },
    { key: "manage:consent_management", name: "Manage Consent Management", description: "Create or modify consent templates" },
    { key: "view:incident_management", name: "View Incident Management", description: "View incident logs" },
    { key: "manage:incident_management", name: "Manage Incident Management", description: "Create or update incident logs" },
    { key: "view:state_coverage", name: "View State Coverage", description: "View state coverage list" },
    { key: "manage:state_coverage", name: "Manage State Coverage", description: "Update state coverage parameters" },
    { key: "view:prescription_oversight", name: "View Prescription Oversight", description: "Access prescription oversight" },
    { key: "manage:prescription_oversight", name: "Manage Prescription Oversight", description: "Update provider licenses and approvals" },
    { key: "view:business_intelligence", name: "View Business Intelligence", description: "Access business reports" },
    { key: "manage:business_intelligence", name: "Manage Business Intelligence", description: "Generate or download reports" },
    { key: "view:communication_center", name: "View Communication Center", description: "View communication templates" },
    { key: "manage:communication_center", name: "Manage Communication Center", description: "Create or edit communication templates" },
    { key: "view:document_center", name: "View Document Center", description: "Access document center" },
    { key: "manage:document_center", name: "Manage Document Center", description: "Upload or edit document templates" },
    { key: "view:system_health", name: "View System Health", description: "Access system health checks" },
];

export async function permissionSeed(prisma: PrismaClient) {
    for (const perm of defaultPermissions) {
        await prisma.permission.upsert({
            where: { key: perm.key },
            update: {
                name: perm.name,
                description: perm.description,
            },
            create: {
                key: perm.key,
                name: perm.name,
                description: perm.description,
            },
        });
    }
    console.log(`✅ Seeded ${defaultPermissions.length} permissions.`);

    const adminRole = await prisma.role.findUnique({
        where: { name: "ADMIN" },
    });
    if (adminRole) {
        const allPermissions = await prisma.permission.findMany();
        for (const perm of allPermissions) {
            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: adminRole.id,
                        permissionId: perm.id,
                    },
                },
                update: {},
                create: {
                    roleId: adminRole.id,
                    permissionId: perm.id,
                },
            });
        }
        console.log("✅ Associated all permissions with ADMIN role.");
    }
}
