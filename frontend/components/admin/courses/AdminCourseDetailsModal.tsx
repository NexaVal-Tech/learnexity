import React, { useState } from 'react';
import { X, Plus, Trash2, Wrench, BookOpen, Star, Briefcase, Building2, DollarSign, Upload } from 'lucide-react';
import { api, handleApiError } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AddCourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  onSuccess: () => void;
}

type DetailSection = 'tools' | 'learnings' | 'benefits' | 'career_paths' | 'industries' | 'salary';

interface Tool {
  name: string;
  icon: File | null;
  iconPreview: string | null;
  order: number;
}

interface Learning {
  learning_point: string;
  order: number;
}

interface Benefit {
  title: string;
  text: string;
  order: number;
}

interface CareerPath {
  level: 'entry' | 'mid' | 'advanced' | 'specialized';
  position: string;
  order: number;
}

interface Industry {
  title: string;
  text: string;
  order: number;
}

interface Salary {
  entry_level: string;
  mid_level: string;
  senior_level: string;
}

const AddCourseDetailsModal: React.FC<AddCourseDetailsModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  onSuccess,
}) => {
  const [activeSection, setActiveSection] = useState<DetailSection>('tools');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tools state - now with File objects
  const [tools, setTools] = useState<Tool[]>([{ name: '', icon: null, iconPreview: null, order: 0 }]);

  // Learnings state
  const [learnings, setLearnings] = useState<Learning[]>([{ learning_point: '', order: 0 }]);

  // Benefits state
  const [benefits, setBenefits] = useState<Benefit[]>([{ title: '', text: '', order: 0 }]);

  // Career Paths state
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([
    { level: 'entry', position: '', order: 0 }
  ]);

  // Industries state
  const [industries, setIndustries] = useState<Industry[]>([{ title: '', text: '', order: 0 }]);

  // Salary state
  const [salary, setSalary] = useState<Salary>({
    entry_level: '',
    mid_level: '',
    senior_level: '',
  });

  // Tools handlers
  const addTool = () => {
    setTools([...tools, { name: '', icon: null, iconPreview: null, order: tools.length }]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const updateToolName = (index: number, value: string) => {
    const updated = [...tools];
    updated[index] = { ...updated[index], name: value };
    setTools(updated);
  };

  const updateToolIcon = (index: number, file: File | null) => {
    const updated = [...tools];
    if (file) {
      const preview = URL.createObjectURL(file);
      updated[index] = { ...updated[index], icon: file, iconPreview: preview };
    } else {
      updated[index] = { ...updated[index], icon: null, iconPreview: null };
    }
    setTools(updated);
  };

  // Learnings handlers
  const addLearning = () => {
    setLearnings([...learnings, { learning_point: '', order: learnings.length }]);
  };

  const removeLearning = (index: number) => {
    setLearnings(learnings.filter((_, i) => i !== index));
  };

  const updateLearning = (index: number, value: string) => {
    const updated = [...learnings];
    updated[index] = { ...updated[index], learning_point: value };
    setLearnings(updated);
  };

  // Benefits handlers
  const addBenefit = () => {
    setBenefits([...benefits, { title: '', text: '', order: benefits.length }]);
  };

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index: number, field: 'title' | 'text', value: string) => {
    const updated = [...benefits];
    updated[index] = { ...updated[index], [field]: value };
    setBenefits(updated);
  };

  // Career Paths handlers
  const addCareerPath = () => {
    setCareerPaths([...careerPaths, { level: 'entry', position: '', order: careerPaths.length }]);
  };

  const removeCareerPath = (index: number) => {
    setCareerPaths(careerPaths.filter((_, i) => i !== index));
  };

  const updateCareerPath = (index: number, field: keyof CareerPath, value: string) => {
    const updated = [...careerPaths];
    updated[index] = { ...updated[index], [field]: value };
    setCareerPaths(updated);
  };

  // Industries handlers
  const addIndustry = () => {
    setIndustries([...industries, { title: '', text: '', order: industries.length }]);
  };

  const removeIndustry = (index: number) => {
    setIndustries(industries.filter((_, i) => i !== index));
  };

  const updateIndustry = (index: number, field: 'title' | 'text', value: string) => {
    const updated = [...industries];
    updated[index] = { ...updated[index], [field]: value };
    setIndustries(updated);
  };

  // Salary handlers
  const updateSalary = (field: keyof Salary, value: string) => {
    setSalary({ ...salary, [field]: value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const promises = [];

      // Tools - using FormData for file upload
      const validTools = tools.filter(t => t.name && t.icon);
      if (validTools.length > 0) {
        for (let index = 0; index < validTools.length; index++) {
          const tool = validTools[index];
          const formData = new FormData();
          formData.append('name', tool.name);
          if (tool.icon) {
            formData.append('icon', tool.icon);
          }
          formData.append('order', index.toString());

          // ✅ USE api.adminCourseDetails.addTool (not api.post)
          promises.push(api.adminCourseDetails.addTool(courseId, formData));
        }
      }

      // Learnings
      const validLearnings = learnings.filter(l => l.learning_point);
      if (validLearnings.length > 0) {
        promises.push(
          ...validLearnings.map((learning, index) =>
            // ✅ USE api.adminCourseDetails.addLearning
            api.adminCourseDetails.addLearning(courseId, {
              ...learning,
              order: index,
            })
          )
        );
      }

      // Benefits
      const validBenefits = benefits.filter(b => b.title && b.text);
      if (validBenefits.length > 0) {
        promises.push(
          ...validBenefits.map((benefit, index) =>
            // ✅ USE api.adminCourseDetails.addBenefit
            api.adminCourseDetails.addBenefit(courseId, {
              ...benefit,
              order: index,
            })
          )
        );
      }

      // Career Paths
      const validCareerPaths = careerPaths.filter(c => c.position);
      if (validCareerPaths.length > 0) {
        promises.push(
          ...validCareerPaths.map((path, index) =>
            // ✅ USE api.adminCourseDetails.addCareerPath
            api.adminCourseDetails.addCareerPath(courseId, {
              ...path,
              order: index,
            })
          )
        );
      }

      // Industries
      const validIndustries = industries.filter(i => i.title && i.text);
      if (validIndustries.length > 0) {
        promises.push(
          ...validIndustries.map((industry, index) =>
            // ✅ USE api.adminCourseDetails.addIndustry
            api.adminCourseDetails.addIndustry(courseId, {
              ...industry,
              order: index,
            })
          )
        );
      }

      // Salary
      if (salary.entry_level || salary.mid_level || salary.senior_level) {
        // ✅ USE api.adminCourseDetails.addSalary
        promises.push(api.adminCourseDetails.addSalary(courseId, salary));
      }

      await Promise.all(promises);

      toast.success('Course details added successfully!');
      onSuccess();
      handleClose();
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleClose = () => {
    setActiveSection('tools');
    setTools([{ name: '', icon: null, iconPreview: null, order: 0 }]);
    setLearnings([{ learning_point: '', order: 0 }]);
    setBenefits([{ title: '', text: '', order: 0 }]);
    setCareerPaths([{ level: 'entry', position: '', order: 0 }]);
    setIndustries([{ title: '', text: '', order: 0 }]);
    setSalary({ entry_level: '', mid_level: '', senior_level: '' });
    onClose();
  };

  if (!isOpen) return null;

  const sections = [
    { id: 'tools' as DetailSection, label: 'Tools', icon: Wrench },
    { id: 'learnings' as DetailSection, label: 'What You\'ll Learn', icon: BookOpen },
    { id: 'benefits' as DetailSection, label: 'Benefits', icon: Star },
    { id: 'career_paths' as DetailSection, label: 'Career Paths', icon: Briefcase },
    { id: 'industries' as DetailSection, label: 'Industries', icon: Building2 },
    { id: 'salary' as DetailSection, label: 'Salary Info', icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-[#0F172A] to-gray-800 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Add Course Details</h2>
            <p className="text-sm text-gray-400">{courseName}</p>
          </div>

          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-white text-gray-900'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleClose}
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-colors"
          >
            <X size={18} />
            Cancel
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {sections.find(s => s.id === activeSection)?.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Add {sections.find(s => s.id === activeSection)?.label.toLowerCase()} for your course
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Tools Section */}
            {activeSection === 'tools' && (
              <div className="space-y-4">
                {tools.map((tool, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex gap-3 items-start mb-3">
                      <input
                        type="text"
                        placeholder="Tool name (e.g., React)"
                        value={tool.name}
                        onChange={(e) => updateToolName(index, e.target.value)}
                        className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                      />
                      {tools.length > 1 && (
                        <button
                          onClick={() => removeTool(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    
                    {/* Icon Upload */}
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <Upload size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Upload Icon</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            updateToolIcon(index, file);
                          }}
                          className="hidden"
                        />
                      </label>
                      {tool.iconPreview && (
                        <img 
                          src={tool.iconPreview} 
                          alt="Icon preview" 
                          className="w-12 h-12 object-contain rounded-lg border border-gray-200"
                        />
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addTool}
                  className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={18} />
                  Add Tool
                </button>
              </div>
            )}

            {/* Learnings Section */}
            {activeSection === 'learnings' && (
              <div className="space-y-4">
                {learnings.map((learning, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <input
                      type="text"
                      placeholder="What will students learn? (e.g., Master React hooks)"
                      value={learning.learning_point}
                      onChange={(e) => updateLearning(index, e.target.value)}
                      className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                    />
                    {learnings.length > 1 && (
                      <button
                        onClick={() => removeLearning(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addLearning}
                  className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={18} />
                  Add Learning Point
                </button>
              </div>
            )}

            {/* Benefits Section */}
            {activeSection === 'benefits' && (
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Benefit title"
                        value={benefit.title}
                        onChange={(e) => updateBenefit(index, 'title', e.target.value)}
                        className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                      />
                      {benefits.length > 1 && (
                        <button
                          onClick={() => removeBenefit(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <textarea
                      placeholder="Benefit description"
                      value={benefit.text}
                      onChange={(e) => updateBenefit(index, 'text', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={addBenefit}
                  className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={18} />
                  Add Benefit
                </button>
              </div>
            )}

            {/* Career Paths Section */}
            {activeSection === 'career_paths' && (
              <div className="space-y-4">
                {careerPaths.map((path, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <select
                      value={path.level}
                      onChange={(e) => updateCareerPath(index, 'level', e.target.value)}
                      className="px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                    >
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="advanced">Advanced</option>
                      <option value="specialized">Specialized</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Position (e.g., Junior Developer)"
                      value={path.position}
                      onChange={(e) => updateCareerPath(index, 'position', e.target.value)}
                      className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                    />
                    {careerPaths.length > 1 && (
                      <button
                        onClick={() => removeCareerPath(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addCareerPath}
                  className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={18} />
                  Add Career Path
                </button>
              </div>
            )}

            {/* Industries Section */}
            {activeSection === 'industries' && (
              <div className="space-y-4">
                {industries.map((industry, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        placeholder="Industry title"
                        value={industry.title}
                        onChange={(e) => updateIndustry(index, 'title', e.target.value)}
                        className="flex-1 px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                      />
                      {industries.length > 1 && (
                        <button
                          onClick={() => removeIndustry(index)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                    <textarea
                      placeholder="Industry description"
                      value={industry.text}
                      onChange={(e) => updateIndustry(index, 'text', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={addIndustry}
                  className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus size={18} />
                  Add Industry
                </button>
              </div>
            )}

            {/* Salary Section */}
            {activeSection === 'salary' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entry Level Salary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $30,000 - $55,000 USD annually"
                    value={salary.entry_level}
                    onChange={(e) => updateSalary('entry_level', e.target.value)}
                    className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mid Level Salary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $55,000 - $90,000 USD annually"
                    value={salary.mid_level}
                    onChange={(e) => updateSalary('mid_level', e.target.value)}
                    className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senior Level Salary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $150,000+ USD annually"
                    value={salary.senior_level}
                    onChange={(e) => updateSalary('senior_level', e.target.value)}
                    className="w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                You can skip sections and add details later
              </p>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#0F172A] text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save All Details'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourseDetailsModal;