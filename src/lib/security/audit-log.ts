'use server';

import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'CONTENT_CREATE'
  | 'CONTENT_UPDATE'
  | 'CONTENT_DELETE'
  | 'CONTENT_APPROVE'
  | 'CONTENT_REJECT'
  | 'DONATION_CREATED'
  | 'SETTINGS_CHANGED'
  | 'ADMIN_ACTION';

interface AuditLogOptions {
  userId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Log an audit event to the AuditLog table.
 * Non-blocking: errors are logged to console but do not propagate.
 */
export async function logAuditEvent(options: AuditLogOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: options.userId ?? null,
        action: options.action,
        resource: options.resource,
        resourceId: options.resourceId ?? null,
        metadata: options.metadata ?? undefined,
        ipAddress: options.ipAddress ?? null,
        userAgent: options.userAgent ?? null,
      },
    });
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('[AuditLog] Failed to log event:', error);
  }
}

/**
 * Retrieve paginated audit log entries (admin-only use).
 */
export async function getAuditLogs(params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: AuditAction;
  startDate?: Date;
  endDate?: Date;
}) {
  const { page = 1, pageSize = 25, userId, action, startDate, endDate } = params;
  const skip = (page - 1) * pageSize;

  // Build dynamic where clause
  const where = {
    ...(userId ? { userId } : {}),
    ...(action ? { action } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: {
          select: { displayName: true, email: true },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
