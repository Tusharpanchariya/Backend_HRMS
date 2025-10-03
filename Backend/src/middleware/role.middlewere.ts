import { Request, Response, NextFunction } from 'express';

/**
 * Define permissions for each role
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
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
export const hasPermission = (userRoles: string[], permission: string) => {
  return userRoles.some(role => ROLE_PERMISSIONS[role]?.includes(permission));
};

/**
 * authorizeRoles - Middleware to check if the user has the required role(s)
 * @param allowedRoles - List of roles that can access the route
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure user is already authenticated
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized: User not found in request' });
      }

      // Extract roles from JWT payload
      const userRoles: string[] = user.roles || [];

      // Check if user has at least one allowed role
      const hasAccess = allowedRoles.some(role => userRoles.includes(role));
      if (!hasAccess) {
        return res.status(403).json({ message: 'Forbidden: Insufficient role permissions' });
      }

      // Proceed if authorized
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({ message: 'Internal server error during role authorization' });
    }
  };
};
