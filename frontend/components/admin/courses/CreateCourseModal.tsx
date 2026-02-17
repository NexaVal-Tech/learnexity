import React, { useState } from 'react';
import { X, BookOpen, DollarSign, Clock, BarChart3, Crown, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { api, handleApiError } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (course?: any) => void;
}

type Step = 1 | 2 | 3;

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step 1: Basic Information
  const [formData, setFormData] = useState({
    title: '',
    course_id: '',
    description: '',
    project: '',
    duration: '',
    level: 'Beginner',
    is_freemium: false,
    is_premium: false,
  });

  // Step 2: Pricing (USD & NGN)
  const [pricingData, setPricingData] = useState({
    // Base prices
    price_usd: '',
    price_ngn: '',
    
    // Track availability
    offers_one_on_one: true,
    offers_group_mentorship: true,
    offers_self_paced: true,
    
    // Track prices (USD)
    one_on_one_price_usd: '',
    group_mentorship_price_usd: '',
    self_paced_price_usd: '',
    
    // Track prices (NGN)
    one_on_one_price_ngn: '',
    group_mentorship_price_ngn: '',
    self_paced_price_ngn: '',
    
    // One-time discounts
    onetime_discount_usd: '',
    onetime_discount_ngn: '',
  });

  // Step 3: Images
  const [imageData, setImageData] = useState({
    hero_image: '',
    secondary_image: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePricingChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    
    setPricingData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    
    setImageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateCourseId = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      course_id: generateCourseId(title),
    }));
  };

  const validateStep1 = () => {
    if (!formData.title || !formData.course_id || !formData.description) {
      toast.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!pricingData.price_usd || !pricingData.price_ngn) {
      toast.error('Please set base prices for both USD and NGN');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    
    setCurrentStep((prev) => Math.min(3, prev + 1) as Step);
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Create the course with all data
      const courseData = {
        // Basic info
        title: formData.title,
        course_id: formData.course_id,
        description: formData.description,
        project: formData.project || undefined,
        duration: formData.duration || undefined,
        level: formData.level || undefined,
        is_freemium: formData.is_freemium,
        is_premium: formData.is_premium,
        
        // Images
        hero_image: imageData.hero_image || undefined,
        secondary_image: imageData.secondary_image || undefined,
        
        // Pricing
        price: parseFloat(pricingData.price_usd),
        price_usd: parseFloat(pricingData.price_usd),
        price_ngn: parseFloat(pricingData.price_ngn),
        
        // Track availability
        offers_one_on_one: pricingData.offers_one_on_one,
        offers_group_mentorship: pricingData.offers_group_mentorship,
        offers_self_paced: pricingData.offers_self_paced,
        
        // Track prices (USD)
        one_on_one_price_usd: pricingData.one_on_one_price_usd ? parseFloat(pricingData.one_on_one_price_usd) : undefined,
        group_mentorship_price_usd: pricingData.group_mentorship_price_usd ? parseFloat(pricingData.group_mentorship_price_usd) : undefined,
        self_paced_price_usd: pricingData.self_paced_price_usd ? parseFloat(pricingData.self_paced_price_usd) : undefined,
        
        // Track prices (NGN)
        one_on_one_price_ngn: pricingData.one_on_one_price_ngn ? parseFloat(pricingData.one_on_one_price_ngn) : undefined,
        group_mentorship_price_ngn: pricingData.group_mentorship_price_ngn ? parseFloat(pricingData.group_mentorship_price_ngn) : undefined,
        self_paced_price_ngn: pricingData.self_paced_price_ngn ? parseFloat(pricingData.self_paced_price_ngn) : undefined,
        
        // Discounts
        onetime_discount_usd: pricingData.onetime_discount_usd ? parseFloat(pricingData.onetime_discount_usd) : undefined,
        onetime_discount_ngn: pricingData.onetime_discount_ngn ? parseFloat(pricingData.onetime_discount_ngn) : undefined,
      };

      const response = await api.admin.courses.create(courseData);

      toast.success('Course created successfully! Add more details?', {
        duration: 5000,
      });
      
      // Pass the created course info to parent so it can show AddCourseDetailsModal
      onSuccess(response.course);
      handleClose();
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      course_id: '',
      description: '',
      project: '',
      duration: '',
      level: 'Beginner',
      is_freemium: false,
      is_premium: false,
    });
    setPricingData({
      price_usd: '',
      price_ngn: '',
      offers_one_on_one: true,
      offers_group_mentorship: true,
      offers_self_paced: true,
      one_on_one_price_usd: '',
      group_mentorship_price_usd: '',
      self_paced_price_usd: '',
      one_on_one_price_ngn: '',
      group_mentorship_price_ngn: '',
      self_paced_price_ngn: '',
      onetime_discount_usd: '',
      onetime_discount_ngn: '',
    });
    setImageData({
      hero_image: '',
      secondary_image: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-gray-800 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Create New Course</h2>
                <p className="text-sm text-gray-300 mt-0.5">Step {currentStep} of 3</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`flex-1 h-2 rounded-full transition-all ${
                    step <= currentStep ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                  placeholder="e.g., Advanced Web Development"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-700 border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                  placeholder="auto-generated-from-title"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-generated from title. Customize if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all resize-none"
                  placeholder="Describe what students will learn..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project (Optional)
                </label>
                <input
                  type="text"
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                  placeholder="e.g., Build a Full-Stack E-commerce Platform"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                    placeholder="e.g., 12 weeks"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BarChart3 className="w-4 h-4 inline mr-1" />
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Course Type</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="is_freemium"
                      checked={formData.is_freemium}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#0F172A] focus:ring-2 focus:ring-[#0F172A]"
                    />
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        Freemium (Free tier available)
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="is_premium"
                      checked={formData.is_premium}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-[#0F172A] focus:ring-2 focus:ring-[#0F172A]"
                    />
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        Premium (Exclusive content)
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Base Prices */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Base Prices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      USD Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="price_usd"
                        value={pricingData.price_usd}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                        placeholder="299.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NGN Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        type="number"
                        name="price_ngn"
                        value={pricingData.price_ngn}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                        placeholder="150000.00"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Learning Tracks */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Learning Tracks</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="offers_one_on_one"
                      checked={pricingData.offers_one_on_one}
                      onChange={handlePricingChange}
                      className="w-5 h-5 text-gray-700 rounded border-gray-300 text-[#0F172A]"
                    />
                    <span className="text-sm text-gray-700">One-on-One Mentorship</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="offers_group_mentorship"
                      checked={pricingData.offers_group_mentorship}
                      onChange={handlePricingChange}
                      className="w-5 h-5 text-gray-700 rounded border-gray-300 text-[#0F172A]"
                    />
                    <span className="text-sm text-gray-700">Group Mentorship</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="offers_self_paced"
                      checked={pricingData.offers_self_paced}
                      onChange={handlePricingChange}
                      className="w-5 h-5 text-gray-700 rounded border-gray-300 text-[#0F172A]"
                    />
                    <span className="text-sm text-gray-700">Self-Paced</span>
                  </label>
                </div>
              </div>

              {/* Track Pricing - USD */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Track Pricing (USD)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      One-on-One
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="one_on_one_price_usd"
                        value={pricingData.one_on_one_price_usd}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        disabled={!pricingData.offers_one_on_one}
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="499.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="group_mentorship_price_usd"
                        value={pricingData.group_mentorship_price_usd}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        disabled={!pricingData.offers_group_mentorship}
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="349.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Self-Paced
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="self_paced_price_usd"
                        value={pricingData.self_paced_price_usd}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        disabled={!pricingData.offers_self_paced}
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="199.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Pricing - NGN */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Track Pricing (NGN)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      One-on-One
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        type="number"
                        name="one_on_one_price_ngn"
                        value={pricingData.one_on_one_price_ngn}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        disabled={!pricingData.offers_one_on_one}
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="250000.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Group
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        type="number"
                        name="group_mentorship_price_ngn"
                        value={pricingData.group_mentorship_price_ngn}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        disabled={!pricingData.offers_group_mentorship}
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="175000.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Self-Paced
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        type="number"
                        name="self_paced_price_ngn"
                        value={pricingData.self_paced_price_ngn}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        disabled={!pricingData.offers_self_paced}
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="100000.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* One-time Discounts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">One-Time Payment Discounts (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      USD Discount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="onetime_discount_usd"
                        value={pricingData.onetime_discount_usd}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                        placeholder="50.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NGN Discount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                      <input
                        type="number"
                        name="onetime_discount_ngn"
                        value={pricingData.onetime_discount_ngn}
                        onChange={handlePricingChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                        placeholder="25000.00"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Images should be uploaded to your storage and their URLs provided here. 
                  Make sure images are publicly accessible.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Image URL
                </label>
                <input
                  type="url"
                  name="hero_image"
                  value={imageData.hero_image}
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                  placeholder="https://example.com/images/course-hero.jpg"
                />
                {imageData.hero_image && (
                  <div className="mt-3">
                    <img 
                      src={imageData.hero_image} 
                      alt="Hero preview" 
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-course.jpg';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Image URL
                </label>
                <input
                  type="url"
                  name="secondary_image"
                  value={imageData.secondary_image}
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all"
                  placeholder="https://example.com/images/course-secondary.jpg"
                />
                {imageData.secondary_image && (
                  <div className="mt-3">
                    <img 
                      src={imageData.secondary_image} 
                      alt="Secondary preview" 
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-course.jpg';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> After creating the course, you can add additional details like tools, 
                  learnings, benefits, career paths, industries, and salary expectations from the course detail page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              Previous
            </button>
          )}
          
          <div className="flex-1" />
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Create Course
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCourseModal;