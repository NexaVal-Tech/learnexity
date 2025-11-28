import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { 
  Mail, Phone, MapPin, Calendar, BookOpen, 
  CheckCircle, Clock, MoreVertical, ArrowLeft,
  Video, TrendingUp, Circle, Award, CreditCard 
} from 'lucide-react';
import ComposeMessageModal from '@/components/admin/students/ComposeMessageModal';

const StudentDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('Course Enrollment');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Mock Data matching the screenshot
  const student = {
    name: 'Alice Johnson',
    email: 'alice.j@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York',
    initials: 'AJ',
    registrationDate: '15/10/2024',
    paymentStatus: 'Paid',
    activityStatus: 'Active',
    coursesEnrolledCount: 3,
  };

  const courses = [
    {
      id: 1,
      name: 'Web Development Bootcamp',
      status: 'Active',
      enrolledDate: '15/10/2024',
      overallProgress: 75,
      sprints: { completed: 9, total: 12 },
      topics: { completed: 36, total: 48 },
      sprintProgress: 75,
      topicProgress: 75,
    },
    {
      id: 2,
      name: 'Advanced JavaScript',
      status: 'Completed',
      enrolledDate: '20/09/2024',
      completedDate: '25/10/2024',
      overallProgress: 100,
      sprints: { completed: 8, total: 8 },
      topics: { completed: 32, total: 32 },
      sprintProgress: 100,
      topicProgress: 100,
    },
    {
      id: 3,
      name: 'React Master Class',
      status: 'Active',
      enrolledDate: '01/11/2024',
      overallProgress: 30,
      sprints: { completed: 3, total: 10 },
      topics: { completed: 12, total: 40 },
      sprintProgress: 30,
      topicProgress: 30,
    }
  ];

  const tabs = ['Course Enrollment', 'Progress Report', 'Activity Timeline'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header / Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-medium text-gray-600">
                {student.initials}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{student.name}</h1>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    {student.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={14} />
                    {student.phone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {student.location}
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsMessageModalOpen(true)}
              className="w-full md:w-auto px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <Mail size={16} />
              Send Message
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Registration Date</p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Calendar size={16} className="text-gray-400" />
                {student.registrationDate}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Payment Status</p>
              <span className="inline-flex px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-xs font-medium">
                {student.paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Activity Status</p>
              <span className="inline-flex px-2.5 py-0.5 rounded border border-green-200 bg-green-50 text-green-700 text-xs font-medium">
                {student.activityStatus}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Courses Enrolled</p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <BookOpen size={16} className="text-gray-400" />
                {student.coursesEnrolledCount} courses
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-full w-full overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {activeTab === 'Course Enrollment' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Enrolled Courses</h2>
            
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900">{course.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        course.status === 'Completed' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        Enrolled: {course.enrolledDate}
                      </div>
                      {course.completedDate && (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle size={14} />
                          Completed: {course.completedDate}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Overall Progress</span>
                        <span className="font-medium text-gray-900">{course.overallProgress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                          style={{ width: `${course.overallProgress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Sprints</p>
                        <p className="text-sm font-semibold text-gray-900">{course.sprints.completed}/{course.sprints.total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Topics</p>
                        <p className="text-sm font-semibold text-gray-900">{course.topics.completed}/{course.topics.total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Sprint Progress</p>
                        <p className="text-sm font-semibold text-gray-900">{course.sprintProgress}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Topic Progress</p>
                        <p className="text-sm font-semibold text-gray-900">{course.topicProgress}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Progress Report' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Overall Performance */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Overall Performance</h2>
                <div className="space-y-4">
                  {/* Last Active */}
                  <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-xl text-white">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Active</p>
                      <p className="text-sm font-semibold text-gray-900">03/11/2024</p>
                    </div>
                  </div>
                  {/* Attendance Rate */}
                  <div className="bg-green-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-green-500 rounded-xl text-white">
                      <Video size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Attendance Rate</p>
                      <p className="text-sm font-semibold text-gray-900">92%</p>
                    </div>
                  </div>
                  {/* Average Progress */}
                  <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-4">
                    <div className="p-3 bg-purple-500 rounded-xl text-white">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Average Progress</p>
                      <p className="text-sm font-semibold text-gray-900">68%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sprint Completion Status */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-6">Sprint Completion Status</h2>
                <div className="space-y-8">
                  {courses.filter(c => c.status === 'Active').map((course) => (
                    <div key={course.id}>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">{course.name}</h3>
                      <div className="grid grid-cols-5 gap-2 mb-2">
                        {Array.from({ length: course.sprints.total }).map((_, index) => {
                          const isCompleted = index < course.sprints.completed;
                          return (
                            <div 
                              key={index}
                              className={`h-10 rounded-lg flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-[#00C853] text-white' 
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500">
                        {course.sprints.completed} of {course.sprints.total} sprints completed
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Topics Completion Overview - Full Width */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-6">Topics Completion Overview</h2>
              <div className="space-y-6">
                {courses.map((course) => (
                  <div key={course.id}>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium text-gray-700">{course.name}</span>
                      <span className="text-gray-500">{course.topics.completed}/{course.topics.total} topics</span>
                    </div>
                    <div className="h-2.5 bg-[#E8F5E9] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00C853] rounded-full transition-all duration-500"
                        style={{ width: `${(course.topics.completed / course.topics.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Activity Timeline' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Activity Timeline</h2>
            <div className="relative pl-4 md:pl-8 space-y-8">
              {/* Vertical Line */}
              <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-0.5 bg-gray-100" />

              {[
                {
                  title: 'Completed Sprint 9',
                  desc: 'Web Development Bootcamp',
                  date: '03/11/2024',
                  icon: Award,
                  color: 'bg-[#00C853]',
                  iconColor: 'text-white'
                },
                {
                  title: '1-on-1 Consultation Booked',
                  desc: 'Career guidance session scheduled',
                  date: '02/11/2024',
                  icon: Video,
                  color: 'bg-purple-500',
                  iconColor: 'text-white'
                },
                {
                  title: 'Payment Received',
                  desc: '$299 - React Master Class',
                  date: '01/11/2024',
                  icon: CreditCard,
                  color: 'bg-orange-500',
                  iconColor: 'text-white'
                },
                {
                  title: 'Enrolled in React Master Class',
                  desc: 'New course started',
                  date: '01/11/2024',
                  icon: BookOpen,
                  color: 'bg-blue-500',
                  iconColor: 'text-white'
                },
                {
                  title: 'Course Completed!',
                  desc: 'Advanced JavaScript - 100% completion',
                  date: '25/10/2024',
                  icon: CheckCircle,
                  color: 'bg-[#00C853]',
                  iconColor: 'text-white'
                },
                {
                  title: 'Payment Received',
                  desc: '$499 - Web Development Bootcamp',
                  date: '15/10/2024',
                  icon: CreditCard,
                  color: 'bg-orange-500',
                  iconColor: 'text-white'
                },
                {
                  title: 'Enrolled in Web Development Bootcamp',
                  desc: 'New course started',
                  date: '15/10/2024',
                  icon: BookOpen,
                  color: 'bg-blue-500',
                  iconColor: 'text-white'
                }
              ].map((item, index) => (
                <div key={index} className="relative flex gap-4 md:gap-6">
                  {/* Icon */}
                  <div className={`relative z-10 flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-full ${item.color} flex items-center justify-center ${item.iconColor} ring-4 ring-white`}>
                    <item.icon size={14} className="md:w-4 md:h-4" />
                  </div>
                  
                  {/* Content Card */}
                  <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-4 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ComposeMessageModal 
        isOpen={isMessageModalOpen} 
        onClose={() => setIsMessageModalOpen(false)}
        recipientCount={1}
        recipients={[student.name]}
      />
    </AdminLayout>
  );
};

export default StudentDetail;
