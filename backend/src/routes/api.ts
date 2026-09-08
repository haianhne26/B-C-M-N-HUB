import { Router } from 'express';
import { register, login, me, logout } from '../controllers/auth.controller';
import { activateKey, createKey, listKeys, revokeKey, resetKeyDevices } from '../controllers/license.controller';
import { listUsers, toggleUserStatus, resetUserPassword } from '../controllers/user.controller';
import { pushFromEA, getAccountSummary, getPositions, getTradeHistory } from '../controllers/mt5.controller';
import { analyzeChart, chatFollowUp, getConversations, getConversationMessages } from '../controllers/ai.controller';
import { listCourses, getCourseDetail } from '../controllers/course.controller';
import { listEconomicEvents } from '../controllers/calendar.controller';
import {
  listIBLandingPages,
  createIBLandingPage,
  updateIBLandingPage,
  getPublicLandingPage,
  submitLeadForm,
  listIBLeads,
  updateLeadStatus
} from '../controllers/ib.controller';
import { getLatestVersion, publishNewVersion } from '../controllers/update.controller';
import { getAdminOverview, getAuditLogs } from '../controllers/admin.controller';
import { authenticateToken, requirePermission, requireServiceLicense } from '../middlewares/auth';
import { PERMISSIONS } from '../shared';

const router = Router();

// ==========================================
// 1. Authentication
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateToken, me);
router.post('/auth/logout', authenticateToken, logout);

// ==========================================
// 2. License Key Management
// ==========================================
router.post('/licenses/activate', authenticateToken, activateKey);
router.get('/licenses', authenticateToken, requirePermission(PERMISSIONS.KEYS_VIEW), listKeys);
router.post('/licenses/create', authenticateToken, requirePermission(PERMISSIONS.KEYS_CREATE), createKey);
router.patch('/licenses/:id/revoke', authenticateToken, requirePermission(PERMISSIONS.KEYS_REVOKE), revokeKey);
router.post('/licenses/:id/reset-devices', authenticateToken, requirePermission(PERMISSIONS.KEYS_REVOKE), resetKeyDevices);

// ==========================================
// 3. User Management (Admin / Owner)
// ==========================================
router.get('/users', authenticateToken, requirePermission(PERMISSIONS.USERS_VIEW), listUsers);
router.patch('/users/:id/status', authenticateToken, requirePermission(PERMISSIONS.USERS_EDIT), toggleUserStatus);
router.post('/users/:id/reset-password', authenticateToken, requirePermission(PERMISSIONS.USERS_EDIT), resetUserPassword);

// ==========================================
// 4. MT5 Bridge & Trading Dashboard
// ==========================================
router.post('/mt5/push', pushFromEA); // Giao tiếp với MT5 EA
router.get('/mt5/summary', authenticateToken, requireServiceLicense('trading'), getAccountSummary);
router.get('/mt5/positions', authenticateToken, requireServiceLicense('trading'), getPositions);
router.get('/mt5/history', authenticateToken, requireServiceLicense('trading'), getTradeHistory);

// ==========================================
// 5. Bạc Môn AI (Google Gemini Assistant)
// ==========================================
router.post('/ai/analyze', authenticateToken, requireServiceLicense('ai'), analyzeChart);
router.post('/ai/chat', authenticateToken, requireServiceLicense('ai'), chatFollowUp);
router.get('/ai/conversations', authenticateToken, requireServiceLicense('ai'), getConversations);
router.get('/ai/conversations/:id', authenticateToken, requireServiceLicense('ai'), getConversationMessages);

// ==========================================
// 6. Courses & Education
// ==========================================
router.get('/courses', authenticateToken, listCourses);
router.get('/courses/:slug', authenticateToken, getCourseDetail);

// ==========================================
// 7. Economic Calendar
// ==========================================
router.get('/calendar', authenticateToken, listEconomicEvents);

// ==========================================
// 8. IB System (Landing Page Builder & CRM)
// ==========================================
router.get('/ib/landing-pages', authenticateToken, requirePermission(PERMISSIONS.LANDING_CREATE), listIBLandingPages);
router.post('/ib/landing-pages/create', authenticateToken, requirePermission(PERMISSIONS.LANDING_CREATE), createIBLandingPage);
router.put('/ib/landing-pages/:id', authenticateToken, requirePermission(PERMISSIONS.LANDING_EDIT), updateIBLandingPage);
router.get('/p/:slug', getPublicLandingPage); // Public view
router.post('/leads/submit', submitLeadForm); // Public lead submit
router.get('/ib/leads', authenticateToken, requirePermission(PERMISSIONS.CRM_VIEW), listIBLeads);
router.patch('/ib/leads/:id/status', authenticateToken, requirePermission(PERMISSIONS.CRM_EDIT), updateLeadStatus);

// ==========================================
// 9. Auto Update
// ==========================================
router.get('/updates/latest', getLatestVersion);
router.post('/updates/publish', authenticateToken, requirePermission(PERMISSIONS.SYSTEM_UPDATE), publishNewVersion);

// ==========================================
// 10. Admin / Owner Overview & Audit
// ==========================================
router.get('/admin/overview', authenticateToken, requirePermission(PERMISSIONS.SYSTEM_SETTINGS), getAdminOverview);
router.get('/admin/audit-logs', authenticateToken, requirePermission(PERMISSIONS.SYSTEM_LOGS), getAuditLogs);

export default router;
