// Admin role definitions and permissions
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  USER_MANAGER: 'user_manager',
  CONTENT_MANAGER: 'content_manager',
  VENDOR_MANAGER: 'vendor_manager',
  PARTNER_MANAGER: 'partner_manager',
};

// Define permissions for each role
export const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.SUPER_ADMIN]: {
    dashboard: true,
    users: true,
    partner: true,
    opportunity: true,
    interest: true,
    vendor: true,
    category: true,
    forum: true,
    profession: true,
    activity: true,
    contact: true,
    manageRoles: true, // Only super admin can manage roles
  },
  [ADMIN_ROLES.USER_MANAGER]: {
    dashboard: true,
    users: true,
    partner: false,
    opportunity: false,
    interest: false,
    vendor: false,
    category: false,
    forum: false,
    profession: false,
    activity: true,
    contact: true,
    manageRoles: false,
  },
  [ADMIN_ROLES.CONTENT_MANAGER]: {
    dashboard: true,
    users: false,
    partner: false,
    opportunity: true,
    interest: true,
    vendor: false,
    category: true,
    forum: true,
    profession: true,
    activity: true,
    contact: false,
    manageRoles: false,
  },
  [ADMIN_ROLES.VENDOR_MANAGER]: {
    dashboard: true,
    users: false,
    partner: false,
    opportunity: false,
    interest: false,
    vendor: true,
    category: false,
    forum: false,
    profession: false,
    activity: false,
    contact: false,
    manageRoles: false,
  },
  [ADMIN_ROLES.PARTNER_MANAGER]: {
    dashboard: true,
    users: false,
    partner: true,
    opportunity: false,
    interest: false,
    vendor: false,
    category: false,
    forum: false,
    profession: false,
    activity: false,
    contact: false,
    manageRoles: false,
  },
};

// Helper function to check if user has permission
export const hasPermission = (userRole, permission) => {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions ? permissions[permission] === true : false;
};

// Helper function to get role label
export const getRoleLabel = (role) => {
  const labels = {
    [ADMIN_ROLES.SUPER_ADMIN]: 'Super Admin',
    [ADMIN_ROLES.USER_MANAGER]: 'User Manager',
    [ADMIN_ROLES.CONTENT_MANAGER]: 'Content Manager',
    [ADMIN_ROLES.VENDOR_MANAGER]: 'Vendor Manager',
    [ADMIN_ROLES.PARTNER_MANAGER]: 'Partner Manager',
  };
  return labels[role] || role;
};