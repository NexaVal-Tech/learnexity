import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';


function Kids() {
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <h2>kids page</h2>
      </AdminLayout>
    </AdminRouteGuard>
  );
}

export default Kids; 