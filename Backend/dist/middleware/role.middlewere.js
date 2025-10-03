"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.hasPermission = exports.ROLE_PERMISSIONS = void 0;
/**
 * Define permissions for each role
 */
exports.ROLE_PERMISSIONS = {
    Admin: [
        'manage_users',
        'manage_roles',
        'manage_attendance',
        'manage_leave',
        'manage_payroll',
        'manage_employees',
        'manage_departments',
        'manage_timesheets',
        'manage_documents'
    ],
    Manager: [
        'view_team_attendance',
        'manage_team_leave',
        'view_team_timesheets'
    ],
    HR: [
        'manage_employee_profiles',
        'manage_leave',
        'manage_attendance',
        'manage_timesheets',
        'manage_documents',
        'view_payroll'
    ],
    Employee: [
        'view_own_profile',
        'edit_own_profile',
        'apply_leave',
        'view_leave_balance',
        'view_own_attendance',
        'view_own_payslips',
        'add_timesheet',
        'view_own_timesheet'
    ]
};
/**
 * hasPermission - Check if user has a specific permission
 */
const hasPermission = (userRoles, permission) => {
    return userRoles.some(role => exports.ROLE_PERMISSIONS[role]?.includes(permission));
};
exports.hasPermission = hasPermission;
/**
 * authorizeRoles - Middleware to check if the user has the required role(s)
 * @param allowedRoles - List of roles that can access the route
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // Ensure user is already authenticated
            const user = req.user;
            if (!user) {
                return res.status(401).json({ message: 'Unauthorized: User not found in request' });
            }
            // Extract roles from JWT payload
            const userRoles = user.roles || [];
            // Check if user has at least one allowed role
            const hasAccess = allowedRoles.some(role => userRoles.includes(role));
            if (!hasAccess) {
                return res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
            }
            // Proceed if authorized
            next();
        }
        catch (error) {
            console.error('Role authorization error:', error);
            return res.status(500).json({ message: 'Internal server error during role authorization' });
        }
    };
};
exports.authorizeRoles = authorizeRoles;
