<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Schema;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\CourseEnrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AdminStudentController extends Controller
{
    /**
     * Get all students with filters
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Get all users (or filter by not being admin if you have admin users)
            $query = User::query()
                ->with(['enrollments' => function($q) {
                    $q->with('course');
                }]);

            // Search filter
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                    
                    if (Schema::hasColumn('users', 'phone')) {
                        $q->orWhere('phone', 'like', "%{$search}%");
                    }
                });
            }

            // Activity status filter
            if ($request->has('activity_status') && !empty($request->activity_status)) {
                $status = $request->activity_status;
                if ($status === 'active') {
                    $query->where('updated_at', '>=', now()->subDays(7));
                } elseif ($status === 'inactive') {
                    $query->where('updated_at', '<', now()->subDays(7));
                }
            }

            // Payment status filter
            if ($request->has('payment_status') && !empty($request->payment_status)) {
                $paymentStatus = $request->payment_status;
                $query->whereHas('enrollments', function($q) use ($paymentStatus) {
                    $q->where('payment_status', $paymentStatus);
                });
            }

            // Course filter
            if ($request->has('course_id') && !empty($request->course_id)) {
                $query->whereHas('enrollments', function($q) use ($request) {
                    $q->where('course_id', $request->course_id);
                });
            }

            $perPage = $request->per_page ?? 10;
            $students = $query->latest()->paginate($perPage);

            Log::info('Students query result', [
                'total' => $students->total(),
                'per_page' => $perPage,
                'current_page' => $students->currentPage(),
            ]);

            // Add computed fields
            $students->getCollection()->transform(function($student) {
                $student->courses_count = $student->enrollments->count();
                $student->activity_status = $student->updated_at->diffInDays(now()) <= 7 ? 'active' : 'inactive';
                $student->has_paid = $student->enrollments->where('payment_status', 'completed')->count() > 0;
                
                if (!Schema::hasColumn('users', 'phone')) {
                    $student->phone = null;
                }
                
                unset($student->enrollments);
                
                return $student;
            });

            return response()->json([
                'data' => $students->items(),
                'meta' => [
                    'current_page' => $students->currentPage(),
                    'last_page' => $students->lastPage(),
                    'per_page' => $students->perPage(),
                    'total' => $students->total(),
                    'from' => $students->firstItem(),
                    'to' => $students->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching students: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Failed to fetch students',
                'message' => $e->getMessage(),
                'data' => [],
                'meta' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0
                ]
            ], 500);
        }
    }

    /**
     * Get single student details with full data
     */
    public function show(int $id): JsonResponse
    {
        try {
            $student = User::with([
                    'enrollments.course',
                ])
                ->findOrFail($id);

            $enrollments = $student->enrollments;
            $totalEnrollments = $enrollments->count();
            
            $totalProgress = 0;
            $enrollmentDetails = [];
            
            foreach ($enrollments as $enrollment) {
                $courseId = $enrollment->course_id;
                
                $materials = DB::table('course_materials')
                    ->where('course_id', $courseId)
                    ->get();
                
                $totalTopics = 0;
                $completedTopics = 0;
                
                if ($materials->count() > 0) {
                    $totalTopics = DB::table('material_items')
                        ->whereIn('course_material_id', $materials->pluck('id'))
                        ->count();
                    
                    if (Schema::hasTable('material_progress_progress')) {
                        $completedTopics = DB::table('material_progress_progress')
                            ->where('user_id', $student->id)
                            ->whereIn('material_item_id', function($query) use ($courseId) {
                                $query->select('material_items.id')
                                    ->from('material_items')
                                    ->join('course_materials', 'material_items.course_material_id', '=', 'course_materials.id')
                                    ->where('course_materials.course_id', $courseId);
                            })
                            ->where('is_completed', true)
                            ->count();
                    }
                }
                
                $progress = $totalTopics > 0 ? round(($completedTopics / $totalTopics) * 100) : 0;
                $totalProgress += $progress;
                
                $enrollmentDetails[] = [
                    'id' => $enrollment->id,
                    'course_id' => $courseId,
                    'course_name' => $enrollment->course_name,
                    'status' => $progress >= 100 ? 'Completed' : 'Active',
                    'enrolled_date' => date('d/m/Y', strtotime($enrollment->enrollment_date)),
                    'completed_date' => $progress >= 100 ? date('d/m/Y', strtotime($enrollment->updated_at)) : null,
                    'overall_progress' => $progress,
                    'sprints' => [
                        'completed' => min($materials->count(), (int)ceil($progress / 100 * max(1, $materials->count()))),
                        'total' => $materials->count()
                    ],
                    'topics' => [
                        'completed' => $completedTopics,
                        'total' => $totalTopics
                    ],
                    'sprint_progress' => $progress,
                    'topic_progress' => $progress,
                ];
            }

            $averageProgress = $totalEnrollments > 0 ? round($totalProgress / $totalEnrollments) : 0;
            $activities = $this->getStudentActivities($student->id);

            $phone = Schema::hasColumn('users', 'phone') ? $student->phone : null;

            return response()->json([
                'student' => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'phone' => $phone ?? 'N/A',
                    'location' => 'Nigeria',
                    'initials' => $this->getInitials($student->name),
                    'registration_date' => date('d/m/Y', strtotime($student->created_at)),
                    'payment_status' => $enrollments->where('payment_status', 'completed')->count() > 0 ? 'Paid' : 'Pending',
                    'activity_status' => $student->updated_at->diffInDays(now()) <= 7 ? 'Active' : 'Inactive',
                    'courses_enrolled_count' => $totalEnrollments,
                ],
                'courses' => $enrollmentDetails,
                'performance' => [
                    'last_active' => date('d/m/Y', strtotime($student->updated_at)),
                    'attendance_rate' => 92,
                    'average_progress' => $averageProgress,
                ],
                'activities' => $activities,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching student details: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Student not found',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get student activities
     */
    private function getStudentActivities(int $userId): array
    {
        $activities = [];

        try {
            $enrollments = CourseEnrollment::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->get();

            foreach ($enrollments as $enrollment) {
                if ($enrollment->payment_status === 'completed') {
                    $activities[] = [
                        'title' => 'Payment Received',
                        'description' => '$' . number_format($enrollment->course_price, 0) . ' - ' . $enrollment->course_name,
                        'date' => $enrollment->payment_date ? date('d/m/Y', strtotime($enrollment->payment_date)) : date('d/m/Y', strtotime($enrollment->enrollment_date)),
                        'type' => 'payment',
                        'icon' => 'CreditCard',
                        'color' => 'bg-orange-500',
                    ];
                }

                $activities[] = [
                    'title' => 'Enrolled in ' . $enrollment->course_name,
                    'description' => 'New course started',
                    'date' => date('d/m/Y', strtotime($enrollment->enrollment_date)),
                    'type' => 'enrollment',
                    'icon' => 'BookOpen',
                    'color' => 'bg-blue-500',
                ];
            }

            if (Schema::hasTable('material_item_progress')) {
                $completedMaterials = DB::table('material_item_progress')
                    ->join('material_items', 'material_item_progress.material_item_id', '=', 'material_items.id')
                    ->join('course_materials', 'material_items.course_material_id', '=', 'course_materials.id')
                    ->where('material_item_progress.user_id', $userId)
                    ->where('material_item_progress.is_completed', true)
                    ->select(
                        'course_materials.sprint_name', 
                        'material_item_progress.completed_at',
                        DB::raw('MAX(material_item_progress.id) as id')
                    )
                    ->groupBy('course_materials.sprint_name', 'material_item_progress.completed_at')
                    ->orderBy('material_item_progress.completed_at', 'desc')
                    ->limit(5)
                    ->get();

                foreach ($completedMaterials as $material) {
                    $activities[] = [
                        'title' => 'Completed ' . $material->sprint_name,
                        'description' => 'Sprint finished successfully',
                        'date' => date('d/m/Y', strtotime($material->completed_at)),
                        'type' => 'completion',
                        'icon' => 'Award',
                        'color' => 'bg-green-500',
                    ];
                }
            }

            usort($activities, function($a, $b) {
                $dateA = \DateTime::createFromFormat('d/m/Y', $a['date']);
                $dateB = \DateTime::createFromFormat('d/m/Y', $b['date']);
                if (!$dateA || !$dateB) return 0;
                return $dateB->getTimestamp() - $dateA->getTimestamp();
            });

            return array_slice($activities, 0, 10);
        } catch (\Exception $e) {
            Log::error('Error fetching activities: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get student statistics
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $totalStudents = User::has('enrollments')->count();
            
            $activeStudents = User::has('enrollments')
                ->where('updated_at', '>=', now()->subDays(7))
                ->count();
            
            $paidStudents = User::whereHas('enrollments', function($q) {
                    $q->where('payment_status', 'completed');
                })
                ->count();

            $unpaidStudents = $totalStudents - $paidStudents;

            return response()->json([
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'paid_students' => $paidStudents,
                'unpaid_students' => $unpaidStudents,
                'new_this_month' => User::has('enrollments')
                    ->whereMonth('created_at', now()->month)
                    ->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching student statistics: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to fetch statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send message to student(s)
     */
    /**
     * Send message to student(s)
     */
    public function sendMessage(Request $request): JsonResponse
    {
        Log::info('=== MESSAGE SEND REQUEST STARTED ===');
        Log::info('Request Method: ' . $request->method());
        Log::info('All Request Data:', $request->all());
        
        Log::info('Raw student_ids:', [
            'value' => $request->input('student_ids'),
            'type' => gettype($request->input('student_ids'))
        ]);

        try {
            // Validate the request
            $request->validate([
                'student_ids' => 'required|string',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png',
            ]);

            // Decode student IDs
            $studentIds = json_decode($request->input('student_ids'), true);
            
            Log::info('Decoded student IDs:', [
                'value' => $studentIds,
                'type' => gettype($studentIds),
                'is_array' => is_array($studentIds),
                'count' => is_array($studentIds) ? count($studentIds) : 0
            ]);

            // Validate it's a proper array
            if (!is_array($studentIds) || empty($studentIds)) {
                Log::error('Invalid student_ids format');
                return response()->json([
                    'error' => 'Invalid student IDs format'
                ], 422);
            }

            // Validate student count (optional: set a max limit)
            if (count($studentIds) > 1000) {
                return response()->json([
                    'error' => 'Cannot send to more than 1000 students at once'
                ], 422);
            }

            // Verify all students exist
            $validStudentIds = User::whereIn('id', $studentIds)->pluck('id')->toArray();
            $invalidIds = array_diff($studentIds, $validStudentIds);

            if (!empty($invalidIds)) {
                Log::warning('Some student IDs are invalid', ['invalid_ids' => $invalidIds]);
                return response()->json([
                    'error' => 'Some student IDs are invalid: ' . implode(', ', $invalidIds)
                ], 422);
            }

            Log::info('All student IDs validated successfully');
            
            // Handle file attachment
            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                Log::info('Processing attachment file...');
                $file = $request->file('attachment');
                
                // Generate unique filename
                $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
                $attachmentPath = $file->storeAs('message-attachments', $filename, 'public');
                
                Log::info('Attachment stored at: ' . $attachmentPath, [
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }

            // Get admin name
            $adminName = auth()->user()->name ?? 'Admin Team';

            // Dispatch job to queue
            \App\Jobs\SendBulkStudentMessages::dispatch(
                $validStudentIds,
                $request->input('subject'),
                $request->input('message'),
                $attachmentPath,
                $adminName
            );

            Log::info('Bulk email job dispatched successfully', [
                'total_recipients' => count($validStudentIds),
                'subject' => $request->input('subject'),
                'has_attachment' => $attachmentPath !== null,
            ]);

            Log::info('=== MESSAGE SEND REQUEST COMPLETED SUCCESSFULLY ===');

            return response()->json([
                'message' => "Message queued successfully! " . count($validStudentIds) . " student(s) will receive the email shortly.",
                'details' => [
                    'total' => count($validStudentIds),
                    'queued' => count($validStudentIds),
                    'status' => 'processing',
                ]
            ]);


        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed:', [
                'errors' => $e->errors(),
                'message' => $e->getMessage(),
            ]);
            throw $e;
            
        } catch (\Exception $e) {
            Log::error('Error in sendMessage:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return response()->json([
                'error' => 'Failed to send message',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get initials from name
     */
    private function getInitials(string $name): string
    {
        $words = explode(' ', $name);
        $initials = '';
        
        foreach ($words as $word) {
            if (!empty($word)) {
                $initials .= strtoupper($word[0]);
            }
        }
        
        return substr($initials, 0, 2);
    }
}
