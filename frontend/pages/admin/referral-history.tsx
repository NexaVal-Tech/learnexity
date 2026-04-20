import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';


function referralHistory() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <h2>This is the referral history page</h2>
      </AdminLayout>
    </AdminRouteGuard>
  );
}

export default referralHistory; 