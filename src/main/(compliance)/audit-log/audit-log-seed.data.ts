export const DEFAULT_AUDIT_LOGS = [
    {
        userName: "Sarah Johnson",
        userRole: "Patient",
        createdAt: new Date("2026-06-01T09:14:32Z"),
        activityType: "Assessment",
        event: "Doctor approved hormone therapy assessment",
        ipAddress: "192.168.1.45",
        sessionDue: "12m 34s",
        status: "SUCCESS",
    },
    {
        userName: "Dr. Michael Chen",
        userRole: "Doctor",
        createdAt: new Date("2026-06-01T09:14:32Z"),
        activityType: "Document Upload",
        event: "Patient uploaded medical document (lab_results.pdf)",
        ipAddress: "192.168.1.45",
        sessionDue: "1h 22m",
        status: "SUCCESS",
        fileUrl: "lab_results.pdf",
    },
    {
        userName: "Jessica Martinez",
        userRole: "Employee",
        createdAt: new Date("2026-06-01T09:14:32Z"),
        activityType: "Order Update",
        event: "Employee updated order #ORD-7821 status to shipped",
        ipAddress: "192.168.1.45",
        sessionDue: "12m 34s",
        status: "SUCCESS",
    },
    {
        userName: "Michael Roberts",
        userRole: "Patient",
        createdAt: new Date("2026-06-01T08:22:45Z"),
        activityType: "Login",
        event: "Failed login attempt — invalid credentials (3rd attempt)",
        ipAddress: "10.0.0.12",
        sessionDue: "12m 34s",
        status: "FAILED",
    },
    {
        userName: "David Wilson",
        userRole: "Doctor",
        createdAt: new Date("2026-06-01T09:14:32Z"),
        activityType: "Order Approved",
        event: "Patient requested new weight loss assessment",
        ipAddress: "192.168.1.45",
        sessionDue: "12m 34s",
        status: "SUCCESS",
    },
    {
        userName: "David Wilson",
        userRole: "Admin",
        createdAt: new Date("2026-06-01T09:14:32Z"),
        activityType: "Permissions",
        event: "Admin updated permissions for Employee group",
        ipAddress: "203.0.113.77",
        sessionDue: "12m 34s",
        status: "SUCCESS",
    },
    {
        userName: "David Wilson",
        userRole: "Employee",
        createdAt: new Date("2026-06-01T09:14:32Z"),
        activityType: "Password Change",
        event: "Employee updated account password successfully",
        ipAddress: "192.168.1.45",
        sessionDue: "12m 34s",
        status: "SUCCESS",
    },
    {
        userName: "David Wilson",
        userRole: "Doctor",
        createdAt: new Date("2026-06-01T09:14:32Z"),
        activityType: "Record Edit",
        event: "Patient requested new weight loss assessment",
        ipAddress: "192.168.1.45",
        sessionDue: "12m 34s",
        status: "SUCCESS",
    },
];

// Generate some extra logs to make the counts and paginations realistic
export const generateExtraLogs = () => {
    const extraLogs: any[] = [];
    const roles = ["Admin", "Doctor", "Employee", "Patient"];
    const types = ["Login", "Data Export", "Record Edit", "Document Upload"];
    const ips = ["192.168.1.45", "10.0.0.12", "203.0.113.77", "172.16.254.1"];
    const users = ["David Wilson", "Michael Roberts", "Jessica Martinez", "Dr. Michael Chen", "Sarah Johnson"];

    // Generating ~150 logs to match active sessions/total activities metrics
    for (let i = 0; i < 150; i++) {
        const type = types[i % types.length];
        const status = (type === "Login" && i % 7 === 0) ? "FAILED" : "SUCCESS";
        extraLogs.push({
            userName: users[i % users.length],
            userRole: roles[i % roles.length],
            createdAt: new Date(Date.now() - i * 15 * 60 * 1000), // intervals of 15 minutes
            activityType: type,
            event: type === "Data Export" ? "User exported CSV data" : `${type} action completed.`,
            ipAddress: ips[i % ips.length],
            sessionDue: `${(i % 12) + 1}h ${(i % 60)}m`,
            status: status,
        });
    }
    return extraLogs;
};
