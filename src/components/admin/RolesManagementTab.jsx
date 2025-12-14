import React from "react";
import { motion } from "framer-motion";
import { ROLES, PERMISSIONS } from "@/utils/permissions";
import { Shield, Settings, BarChart3, Megaphone, User } from "lucide-react";

const ROLE_ICONS = {
  [ROLES.ADMIN]: Shield,
  [ROLES.MANAGER]: Settings,
  [ROLES.ANALYST]: BarChart3,
  [ROLES.ADVERTISER]: Megaphone,
  [ROLES.USER]: User
};

const ROLE_COLORS = {
  [ROLES.ADMIN]: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' },
  [ROLES.MANAGER]: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', color: '#F59E0B' },
  [ROLES.ANALYST]: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', color: '#3B82F6' },
  [ROLES.ADVERTISER]: { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', color: '#8B5CF6' },
  [ROLES.USER]: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', color: '#10B981' }
};

export default function RolesManagementTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#E5EDFF' }}>
          Roles & Permissions
        </h2>
        <p style={{ color: '#7A8BA6' }}>
          Overview of all platform roles and their access levels
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(ROLES).map((roleKey, index) => {
          const role = ROLES[roleKey];
          const permissions = PERMISSIONS[role];
          const Icon = ROLE_ICONS[role];
          const colors = ROLE_COLORS[role];

          const permissionsList = Object.entries(permissions)
            .filter(([key]) => key.startsWith('can'))
            .map(([key, value]) => ({ key, value }));

          const enabledCount = permissionsList.filter(p => p.value).length;

          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: colors.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#E5EDFF' }}>
                      {permissions.label}
                    </h3>
                    <p className="text-xs" style={{ color: '#7A8BA6' }}>
                      {enabledCount} permissions
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm mb-4" style={{ color: '#B6C4E0' }}>
                {permissions.description}
              </p>

              <div className="space-y-2">
                <p className="text-xs font-semibold mb-2" style={{ color: '#7A8BA6' }}>
                  KEY PERMISSIONS
                </p>
                <div className="space-y-1.5">
                  {permissionsList.slice(0, 5).map(({ key, value }) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: value ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                          border: `1px solid ${value ? 'rgba(34, 197, 94, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`
                        }}
                      >
                        {value && <span style={{ color: '#22C55E', fontSize: '10px' }}>✓</span>}
                      </div>
                      <span className="text-xs" style={{ color: value ? '#B6C4E0' : '#7A8BA6' }}>
                        {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                  {permissionsList.length > 5 && (
                    <p className="text-xs mt-2" style={{ color: '#7A8BA6' }}>
                      +{permissionsList.length - 5} more permissions
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="glass-card p-6 rounded-2xl mt-8">
        <h3 className="text-xl font-bold mb-4" style={{ color: '#E5EDFF' }}>
          Permissions Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th className="text-left py-3 px-4" style={{ color: '#B6C4E0' }}>Permission</th>
                {Object.keys(ROLES).map(roleKey => {
                  const role = ROLES[roleKey];
                  const permissions = PERMISSIONS[role];
                  return (
                    <th key={role} className="text-center py-3 px-2" style={{ color: '#B6C4E0' }}>
                      {permissions.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Object.keys(PERMISSIONS[ROLES.ADMIN])
                .filter(key => key.startsWith('can'))
                .map((permissionKey, idx) => (
                  <tr
                    key={permissionKey}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                    }}
                  >
                    <td className="py-3 px-4 text-sm" style={{ color: '#B6C4E0' }}>
                      {permissionKey.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    {Object.keys(ROLES).map(roleKey => {
                      const role = ROLES[roleKey];
                      const hasPermission = PERMISSIONS[role][permissionKey];
                      return (
                        <td key={role} className="text-center py-3 px-2">
                          <div className="flex justify-center">
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center"
                              style={{
                                background: hasPermission ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.05)',
                                border: `1px solid ${hasPermission ? 'rgba(34, 197, 94, 0.3)' : 'rgba(107, 114, 128, 0.1)'}`
                              }}
                            >
                              {hasPermission && <span style={{ color: '#22C55E', fontSize: '12px' }}>✓</span>}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}