import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full text-red-600">
            <ShieldAlert size={48} />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-600">
            You do not have permission to access this resource. Please contact your system administrator if you believe this is a mistake.
          </p>
        </div>

        <div>
          <Link href="/login">
            <Button variant="primary">Return to Login</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
