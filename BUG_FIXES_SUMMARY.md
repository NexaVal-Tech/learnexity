# Admin Course Details - Bug Fixes Summary

## Issues Fixed

### 1. **FormData Content-Type Handling (422 Errors)**
**Problem:** When uploading files (tool icons, course images), the `Content-Type: multipart/form-data` header was being manually set, which prevented axios from properly adding the boundary parameter needed for FormData encoding.

**Solution:** 
- Modified `adminApi.ts` to NOT manually set `Content-Type` for FormData
- Let axios and the browser handle Content-Type automatically
- Axios will now properly set: `Content-Type: multipart/form-data; boundary=...`

**Files Changed:**
- `frontend/lib/adminApi.ts` - Fixed post method
- `frontend/lib/api.ts` - Fixed all FormData API calls (removeaddTool, createFormData, updateFormData, syncTools, uploadMaterialFile, sendMessage)

### 2. **Database Lookup Bug (404/422 Errors)**
**Problem:** Backend controllers were using the string `course_id` (e.g., "wed-dev") to query foreign key relationships, but foreign keys use the numeric `id` column from the `courses` table. This caused database lookups to fail.

**Solution:**
- Added `$course = Course::where('course_id', $courseId)->firstOrFail();` to get the numeric ID
- Changed all subsequent database queries to use `$course->id` instead of `$courseId`

**Files Changed:**
- `server/app/Http/Controllers/Api/AdminCourseController.php`:
  - `getDetails()` - Fixed course lookup
  - `syncTools()` - Fixed course lookup
  - `syncLearnings()` - Fixed course lookup
  - `syncBenefits()` - Fixed course lookup
  - `syncCareerPaths()` - Fixed course lookup
  - `syncIndustries()` - Fixed course lookup
  - `upsertSalary()` - Fixed course lookup

- `server/app/Http/Controllers/Api/AdminCourseDetailsController.php`:
  - `addTool()` - Fixed icon storage path
  - `addSalary()` - Fixed salary lookup query (was using $course->course_id instead of $course->id)
  - `deleteTool()` - Added course lookup
  - `deleteLearning()` - Added course lookup
  - `deleteBenefit()` - Added course lookup
  - `deleteCareerPath()` - Added course lookup
  - `deleteIndustry()` - Added course lookup

### 3. **Image Storage Path Inconsistency**
**Problem:**
- Some image paths stored with `/storage/` prefix: `/storage/tools/filename.jpg`
- Some without: `course-images/filename.jpg`
- On production, `/storage` path might not be served correctly if symlink is missing

**Solution:**
- Standardized storage folder names: `course-images`, `course-tools` (consistent naming)
- Removed the manual `/storage/` prefix from stored paths
- Added model accessors to automatically format URLs when returning data

**Files Changed:**
- `server/app/Models/Course.php` - Added `hero_image_url` and `secondary_image_url` accessors
- `server/app/Models/CourseTool.php` - Added `icon_url` accessor
- `server/app/Http/Controllers/Api/AdminCourseDetailsController.php` - Removed `/storage/` prefix insertion

### 4. **Image URL Formatting for API Responses**
**Problem:** Images displayed on localhost but not on production because paths were relative instead of absolute URLs.

**Solution:**
- Added accessors on models that automatically convert relative paths to full storage URLs
- `url('/storage/' . ltrim($path, '/'))` format used
- Handles both URLs and file paths correctly

**Files Created:**
- `server/app/Helpers/ImageHelper.php` - Utility helper for image URL formatting (optional)

## Production Setup Required

### 1. **Set Up Storage Symlink**
For production, Laravel needs a symlink from `public/storage` to `storage/app/public`:

```bash
cd /path/to/your/laravel/app
php artisan storage:link
```

Or manually:
```bash
ln -s /path/to/storage/app/public /path/to/public/storage
```

### 2. **Verify Storage Permissions**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### 3. **Verify .env Configuration**
```env
APP_URL=https://yourdomain.com  # Set to your actual domain
FILESYSTEM_DISK=public
```

### 4. **Test Image Access**
After deployment, verify images are accessible:
- Images should be served from: `https://yourdomain.com/storage/course-images/filename.jpg`
- Check that the symlink was created successfully: `ls -la public/storage`

## Testing Checklist

- [ ] Add tool with icon - should complete without 422 error
- [ ] Edit tool icon - should replace correctly
- [ ] Delete tool - icon file should be deleted from storage
- [ ] Add learning, benefit, career path, industry - should complete without 422 error
- [ ] Add/edit salary - should save correctly
- [ ] Images display on localhost
- [ ] Images display on production after storage:link
- [ ] Tool icons display correctly in course details
- [ ] Hero and secondary images display correctly

## API Endpoints Fixed

All these endpoints should now work correctly:
- `POST /api/admin/courses/{courseId}/details/tools`
- `POST /api/admin/courses/{courseId}/details/learnings`
- `POST /api/admin/courses/{courseId}/details/benefits`
- `POST /api/admin/courses/{courseId}/details/career-paths`
- `POST /api/admin/courses/{courseId}/details/industries`
- `POST /api/admin/courses/{courseId}/details/salary`
- `GET /api/admin/courses/{courseId}/details`
- `DELETE /api/admin/courses/{courseId}/details/tools/{toolId}`
- And other detail delete endpoints

## Root Cause Analysis

The primary issue was **misuse of the course_id parameter** in database queries. The system has two identifiers for courses:

1. **`courses.id`** - Numeric auto-increment ID (used for foreign keys)
2. **`courses.course_id`** - String identifier (e.g., "wed-dev", used for URL slugs)

The backend was conflating these:
- Using string `course_id` ("wed-dev") to query foreign key columns that contain numeric IDs
- This caused `firstOrFail()` to return 404, leading to validation errors appearing as 422

The fix ensures the code:
1. Uses `course_id` string to find the Course model
2. Extracts the numeric `id` from the found Course
3. Uses the numeric `id` for all subsequent database operations
