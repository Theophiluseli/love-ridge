import { NextResponse } from 'next/server';

/**
 * Public "reset password by email" has been disabled: it changed any admin's password without
 * verifying ownership of the email address, which allowed full account takeover.
 *
 * Passwords can be changed by:
 *   - the signed-in user: POST /api/auth/change-password
 *   - a Super Admin for any staff member: Admin → Users → Reset password
 *     (POST /api/admin/users/[id]/reset-password, authenticated)
 */
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Self-service password reset is disabled for security. Please ask a Loveridge Super Admin to reset your password from Admin → Users.',
    },
    { status: 403 }
  );
}
