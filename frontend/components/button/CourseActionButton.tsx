// components/button/CourseActionButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { api } from '@/lib/api';

interface CourseActionButtonProps {
  courseId: string;
  courseName: string;
  coursePrice?: number;
  className?: string;
  variant?: 'get-started' | 'make-payment';
}

export const CourseActionButton = ({ 
  courseId, 
  courseName, 
  coursePrice = 0,
  className = '',
  variant = 'get-started'
}: CourseActionButtonProps) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);

  useEffect(() => {
    if (user) {
      checkEnrollment();
    } else {
      setIsEnrolled(false);
    }
  }, [user, courseId]);

  const checkEnrollment = async () => {
    try {
      setCheckingEnrollment(true);
      const token = localStorage.getItem('token');
      
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/enrollment-status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsEnrolled(data.isEnrolled);
      }
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handleClick = async () => {
    if (authLoading || checkingEnrollment) return;

    // If not authenticated, store course and redirect to login
    if (!user) {
      sessionStorage.setItem('intended_course', courseId);
      sessionStorage.setItem('intended_course_name', courseName);
      router.push('/user/auth/login');
      return;
    }

    // If already enrolled, go to course content
    if (isEnrolled) {
      router.push(`/user/courses/${courseId}`);
      return;
    }

    // If authenticated but not enrolled, enroll and go to payment
    setIsEnrolling(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/enroll`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            course_name: courseName,
            course_price: coursePrice,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Redirect to payment page
        router.push(`/user/dashboard/payment?enrollment_id=${data.enrollment_id}&course_id=${courseId}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Failed to enroll in course. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const getButtonText = () => {
    if (authLoading || checkingEnrollment) return 'Loading...';
    if (isEnrolling) return 'Processing...';
    if (isEnrolled) return 'Continue Learning';
    if (user) return 'Make Payment';
    return 'Get Started';
  };

  const isLoading = authLoading || checkingEnrollment || isEnrolling;

  // Render based on variant
  if (variant === 'get-started' || !user) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`bg-white text-[#6C63FF] px-2 py-1 rounded-full font-semibold text-base md:text-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <span>{getButtonText()}</span>
        <span className="w-12 h-6 md:w-16 md:h-8 flex items-center justify-center rounded-full bg-[#4A3AFF] text-white">
          <img src="/icons/arrow_right_line (1).png" alt="icon" className="w-6 h-6 object-contain"/>
        </span>
      </button>
    );
  }

  // Make Payment variant (for authenticated users)
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${isEnrolled ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' : ''} ${className}`}
    >
      {getButtonText()}
    </button>
  );
};