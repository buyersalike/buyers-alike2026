// Role-based permissions system
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANALYST: 'analyst',
  ADVERTISER: 'advertiser',
  USER: 'user'
};

// Define what each role can access
export const PERMISSIONS = {
  // Admin - Full access
  [ROLES.ADMIN]: {
    label: 'Admin',
    description: 'Full platform access and control',
    canAccessAdmin: true,
    canManageUsers: true,
    canManageVendors: true,
    canManageAdvertisements: true,
    canViewAnalytics: true,
    canManageContent: true,
    canManagePartnerships: true,
    canManageOpportunities: true,
    canManageEvents: true,
    canManageForum: true,
    canDeleteContent: true,
    canAccessReports: true
  },
  
  // Manager - Management and oversight
  [ROLES.MANAGER]: {
    label: 'Manager',
    description: 'Manage users, content, and monitor platform',
    canAccessAdmin: true,
    canManageUsers: false,
    canManageVendors: true,
    canManageAdvertisements: true,
    canViewAnalytics: true,
    canManageContent: true,
    canManagePartnerships: true,
    canManageOpportunities: true,
    canManageEvents: true,
    canManageForum: true,
    canDeleteContent: true,
    canAccessReports: true
  },
  
  // Analyst - View analytics and reports
  [ROLES.ANALYST]: {
    label: 'Analyst',
    description: 'Access analytics and generate reports',
    canAccessAdmin: true,
    canManageUsers: false,
    canManageVendors: false,
    canManageAdvertisements: false,
    canViewAnalytics: true,
    canManageContent: false,
    canManagePartnerships: false,
    canManageOpportunities: false,
    canManageEvents: false,
    canManageForum: false,
    canDeleteContent: false,
    canAccessReports: true
  },
  
  // Advertiser - Manage own ads and campaigns
  [ROLES.ADVERTISER]: {
    label: 'Advertiser',
    description: 'Create and manage advertising campaigns',
    canAccessAdmin: false,
    canManageUsers: false,
    canManageVendors: false,
    canManageAdvertisements: true,
    canViewAnalytics: true,
    canManageContent: false,
    canManagePartnerships: false,
    canManageOpportunities: false,
    canManageEvents: false,
    canManageForum: false,
    canDeleteContent: false,
    canAccessReports: false
  },
  
  // User - Standard user access
  [ROLES.USER]: {
    label: 'User',
    description: 'Standard platform member',
    canAccessAdmin: false,
    canManageUsers: false,
    canManageVendors: false,
    canManageAdvertisements: false,
    canViewAnalytics: false,
    canManageContent: false,
    canManagePartnerships: false,
    canManageOpportunities: false,
    canManageEvents: false,
    canManageForum: false,
    canDeleteContent: false,
    canAccessReports: false
  }
};

// Check if user has a specific permission
export const hasPermission = (userRole, permission) => {
  const rolePermissions = PERMISSIONS[userRole];
  if (!rolePermissions) return false;
  return rolePermissions[permission] === true;
};

// Check if user can access admin panel
export const canAccessAdmin = (userRole) => {
  return hasPermission(userRole, 'canAccessAdmin');
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  return PERMISSIONS[role] || PERMISSIONS[ROLES.USER];
};

// Get role label
export const getRoleLabel = (role) => {
  return PERMISSIONS[role]?.label || role;
};

// Get role description
export const getRoleDescription = (role) => {
  return PERMISSIONS[role]?.description || '';
};