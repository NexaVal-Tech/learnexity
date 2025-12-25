import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import StudentFilters from '@/components/admin/students/StudentFilters';
import StudentsTable from '@/components/admin/students/StudentsTable';
import ComposeMessageModal from '@/components/admin/students/ComposeMessageModal';
import { api } from '@/lib/api';

const StudentsPage = () => {
  const [filters, setFilters] = useState({});
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const getSelectedRecipients = () => {
    return students
      .filter(s => selectedStudents.includes(s.id))
      .map(s => ({ id: s.id, name: s.name, email: s.email }));
  };

    const handleSendMessage = async (messageData: any) => {
    try {
        console.log('Sending message with data:', messageData);
        
        const result = await api.admin.students.sendMessage(messageData);
        
        console.log('Message queued successfully:', result);
        
        // Show success message
        alert(`✅ Success! Message has been queued and will be sent to ${messageData.student_ids.length} student(s) shortly.`);
        
        setSelectedStudents([]);
        setIsMessageModalOpen(false);
    } catch (error: any) {
        console.error('Error sending message:', error);
        console.error('Error response:', error.response?.data);
        
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to send message';
        alert(`❌ Error: ${errorMessage}`);
        
        throw error;
    }
    };
    
  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          
          <StudentFilters
            onFilterChange={setFilters}
            selectedCount={selectedStudents.length}
            onMessageClick={() => setIsMessageModalOpen(true)}
          />
          
          <StudentsTable
            filters={filters}
            selectedStudents={selectedStudents}
            onSelectionChange={setSelectedStudents}
            onStudentsLoaded={setStudents}  // Add this prop to pass students data up
          />

          <ComposeMessageModal
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            recipientCount={selectedStudents.length}
            recipients={getSelectedRecipients()}
            onSend={handleSendMessage}
          />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default StudentsPage;