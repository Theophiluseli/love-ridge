import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function logAuditAction(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
}) {
  const payload = {
    userId: params.userId || null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    oldValue: params.oldValue ? JSON.stringify(params.oldValue) : null,
    newValue: params.newValue ? JSON.stringify(params.newValue) : null,
    createdAt: new Date().toISOString(),
  };

  // 1. Fast, non-blocking write to Supabase REST audit_logs
  try {
    Promise.resolve(supabaseAdmin.from('audit_logs').insert(payload))
      .then(() => {})
      .catch((err) => console.warn('Supabase audit log note:', err?.message || err));
  } catch (e) {
    // Non-blocking
  }

  // 2. Non-blocking Prisma background log
  try {
    prisma.auditLog
      .create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldValue: payload.oldValue,
          newValue: payload.newValue,
        },
      })
      .catch(() => {});
  } catch (err) {
    // Non-blocking
  }
}
