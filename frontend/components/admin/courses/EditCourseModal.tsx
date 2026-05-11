import React, { useState, useEffect, useRef } from 'react';
import {
  X, BookOpen, DollarSign, Clock, BarChart3, Crown, Sparkles,
  Wrench, Star, Briefcase, Building2, Upload, Plus, Trash2,
  Save, ChevronRight, Image, Check, AlertCircle, Loader2
} from 'lucide-react';
import { api, handleApiError } from '@/lib/api';
import { toast } from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: any; // the course row from CoursesTable
}

type TabId =
  | 'basic'
  | 'pricing'
  | 'images'
  | 'tools'
  | 'learnings'
  | 'benefits'
  | 'career_paths'
  | 'industries'
  | 'salary';

interface Tool {
  id?: number;
  name: string;
  icon: File | null;
  iconPreview: string | null;
  icon_url?: string;
}

interface Learning { id?: number; learning_point: string }
interface Benefit  { id?: number; title: string; text: string }
interface CareerPath { id?: number; level: string; position: string }
interface Industry  { id?: number; title: string; text: string }
interface Salary { entry_level: string; mid_level: string; senior_level: string }

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'basic',       label: 'Basic Info',     icon: BookOpen   },
  { id: 'pricing',     label: 'Pricing',        icon: DollarSign },
  { id: 'images',      label: 'Images',         icon: Image      },
  { id: 'tools',       label: 'Tools',          icon: Wrench     },
  { id: 'learnings',   label: 'Learnings',      icon: BookOpen   },
  { id: 'benefits',    label: 'Benefits',       icon: Star       },
  { id: 'career_paths',label: 'Career Paths',   icon: Briefcase  },
  { id: 'industries',  label: 'Industries',     icon: Building2  },
  { id: 'salary',      label: 'Salary',         icon: DollarSign },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const INPUT =
  'w-full px-4 py-3 text-gray-700 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0F172A] focus:border-transparent transition-all bg-white';
const LABEL = 'block text-sm font-medium text-gray-700 mb-2';

function PriceInput({
  symbol,
  name,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  symbol: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
        {symbol}
      </span>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        step="0.01"
        min="0"
        disabled={disabled}
        placeholder={placeholder}
        className={`${INPUT} pl-8 disabled:bg-gray-100 disabled:cursor-not-allowed`}
      />
    </div>
  );
}

// ─── Image Drop Zone ──────────────────────────────────────────────────────────

function ImageDropZone({
  label,
  file,
  preview,
  existingUrl,
  onFileChange,
  onClear,
}: {
  label: string;
  file: File | null;
  preview: string | null;
  existingUrl?: string;
  onFileChange: (f: File | null) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = preview || existingUrl;

  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer
                   hover:border-[#0F172A] transition-colors group"
        style={{ minHeight: '180px' }}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt={label}
              className="w-full h-48 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium">Click to replace</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow text-red-500 hover:bg-red-50 transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Upload size={28} className="mb-2" />
            <span className="text-sm">Click or drag to upload</span>
            <span className="text-xs mt-1 text-gray-300">PNG, JPG, WebP up to 5MB</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
      />
      {file && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <Check size={12} /> {file.name} ready to upload
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  course,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('basic');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Basic
  const [basic, setBasic] = useState({
    title: '',
    description: '',
    project: '',
    duration: '',
    level: 'Beginner',
    is_freemium: false,
    is_premium: false,
  });

  // Pricing
  const [pricing, setPricing] = useState({
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

  // Images
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [secondaryFile, setSecondaryFile] = useState<File | null>(null);
  const [secondaryPreview, setSecondaryPreview] = useState<string | null>(null);

  // Details
  const [tools, setTools] = useState<Tool[]>([{ name: '', icon: null, iconPreview: null }]);
  const [learnings, setLearnings] = useState<Learning[]>([{ learning_point: '' }]);
  const [benefits, setBenefits] = useState<Benefit[]>([{ title: '', text: '' }]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([{ level: 'entry', position: '' }]);
  const [industries, setIndustries] = useState<Industry[]>([{ title: '', text: '' }]);
  const [salary, setSalary] = useState<Salary>({ entry_level: '', mid_level: '', senior_level: '' });

  // ── Load existing data when modal opens ───────────────────────

  useEffect(() => {
    if (!isOpen || !course) return;

    // Populate basic
    setBasic({
      title: course.title || course.name || '',
      description: course.description || '',
      project: course.project || '',
      duration: course.duration || '',
      level: course.level || 'Beginner',
      is_freemium: !!course.is_freemium,
      is_premium: !!course.is_premium,
    });

    // Populate pricing
    setPricing({
      price_usd: course.price_usd ?? '',
      price_ngn: course.price_ngn ?? '',
      offers_one_on_one: course.offers_one_on_one ?? true,
      offers_group_mentorship: course.offers_group_mentorship ?? true,
      offers_self_paced: course.offers_self_paced ?? true,
      one_on_one_price_usd: course.one_on_one_price_usd ?? '',
      group_mentorship_price_usd: course.group_mentorship_price_usd ?? '',
      self_paced_price_usd: course.self_paced_price_usd ?? '',
      one_on_one_price_ngn: course.one_on_one_price_ngn ?? '',
      group_mentorship_price_ngn: course.group_mentorship_price_ngn ?? '',
      self_paced_price_ngn: course.self_paced_price_ngn ?? '',
      onetime_discount_usd: course.onetime_discount_usd ?? '',
      onetime_discount_ngn: course.onetime_discount_ngn ?? '',
    });

    // Reset image state (existing URLs come from course object)
    setHeroFile(null);
    setHeroPreview(null);
    setSecondaryFile(null);
    setSecondaryPreview(null);

    // Load detail sections
    fetchDetails(course.course_id);
  }, [isOpen, course]);

  const fetchDetails = async (courseId: string) => {
    setLoading(true);
    try {
      const res = await api.admin.courses.getDetails(courseId);
      const d = res;

      if (d.tools?.length)        setTools(d.tools.map((t: any) => ({ id: t.id, name: t.name, icon: null, iconPreview: null, icon_url: t.icon })));
      if (d.learnings?.length)    setLearnings(d.learnings.map((l: any) => ({ id: l.id, learning_point: l.learning_point })));
      if (d.benefits?.length)     setBenefits(d.benefits.map((b: any) => ({ id: b.id, title: b.title, text: b.text })));
      if (d.career_paths?.length) setCareerPaths(d.career_paths.map((c: any) => ({ id: c.id, level: c.level, position: c.position })));
      if (d.industries?.length)   setIndustries(d.industries.map((i: any) => ({ id: i.id, title: i.title, text: i.text })));
      if (d.salary)               setSalary({ entry_level: d.salary.entry_level || '', mid_level: d.salary.mid_level || '', senior_level: d.salary.senior_level || '' });
    } catch {
      // Details may not exist yet — that's fine
    } finally {
      setLoading(false);
    }
  };

  // ── Save handlers per tab ─────────────────────────────────────

  const saveBasicAndImages = async () => {
    const formData = new FormData();
    Object.entries(basic).forEach(([k, v]) => formData.append(k, String(v)));
    if (heroFile)     formData.append('hero_image', heroFile);
    if (secondaryFile) formData.append('secondary_image', secondaryFile);
    formData.append('_method', 'PUT');

    await api.admin.courses.updateFormData(course.course_id, formData);
  };

  const savePricing = async () => {
    const payload: Record<string, any> = {};
    Object.entries(pricing).forEach(([k, v]) => {
      if (v !== '') payload[k] = typeof v === 'string' && !isNaN(Number(v)) ? parseFloat(v) : v;
    });
    await api.admin.courses.update(course.course_id, payload);
  };

  const saveTools = async () => {
    const formData = new FormData();
    tools.filter(t => t.name).forEach((tool, i) => {
      formData.append(`tools[${i}][name]`, tool.name);
      if (tool.icon) formData.append(`tool_icons[${i}]`, tool.icon);
      else if (tool.icon_url) formData.append(`tools[${i}][icon_url]`, tool.icon_url);
    });
    await api.admin.courses.syncTools(course.course_id, formData);
  };

  const saveLearnings = async () => {
    const valid = learnings.filter(l => l.learning_point.trim());
    await api.admin.courses.syncLearnings(course.course_id, { learnings: valid });
  };

  const saveBenefits = async () => {
    const valid = benefits.filter(b => b.title.trim() && b.text.trim());
    await api.admin.courses.syncBenefits(course.course_id, { benefits: valid });
  };

  const saveCareerPaths = async () => {
    const valid = careerPaths.filter(c => c.position.trim());
    await api.admin.courses.syncCareerPaths(course.course_id, { career_paths: valid });
  };

  const saveIndustries = async () => {
    const valid = industries.filter(i => i.title.trim() && i.text.trim());
    await api.admin.courses.syncIndustries(course.course_id, { industries: valid });
  };

  const saveSalary = async () => {
    await api.admin.courses.upsertSalary(course.course_id, salary);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      switch (activeTab) {
        case 'basic':        await saveBasicAndImages(); break;
        case 'images':       await saveBasicAndImages(); break;
        case 'pricing':      await savePricing();        break;
        case 'tools':        await saveTools();          break;
        case 'learnings':    await saveLearnings();      break;
        case 'benefits':     await saveBenefits();       break;
        case 'career_paths': await saveCareerPaths();    break;
        case 'industries':   await saveIndustries();     break;
        case 'salary':       await saveSalary();         break;
      }
      toast.success('Changes saved successfully');
      onSuccess();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Image change helpers ──────────────────────────────────────

  const onHeroChange = (f: File | null) => {
    setHeroFile(f);
    setHeroPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSecondaryChange = (f: File | null) => {
    setSecondaryFile(f);
    setSecondaryPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleClose = () => {
    setActiveTab('basic');
    onClose();
  };

  if (!isOpen || !course) return null;

  const courseId = course.course_id;

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-gray-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit Course</h2>
            <p className="text-sm text-gray-400 mt-0.5 truncate max-w-sm">
              {basic.title || course.title || course.name}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar tabs */}
          <aside className="w-52 shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left border-l-2
                  ${activeTab === id
                    ? 'bg-white border-[#0F172A] text-[#0F172A]'
                    : 'border-transparent text-gray-500 hover:bg-white hover:text-gray-800'
                  }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <Loader2 className="animate-spin mr-2" size={20} />
                Loading details…
              </div>
            )}

            {!loading && (
              <>
                {/* ── BASIC INFO ── */}
                {activeTab === 'basic' && (
                  <div className="space-y-5">
                    <h3 className="text-base font-semibold text-gray-900">Basic Information</h3>

                    <div>
                      <label className={LABEL}>Course Title</label>
                      <input type="text" className={INPUT} value={basic.title}
                        onChange={e => setBasic(p => ({ ...p, title: e.target.value }))} />
                    </div>

                    <div>
                      <label className={LABEL}>Description</label>
                      <textarea rows={4} className={`${INPUT} resize-none`} value={basic.description}
                        onChange={e => setBasic(p => ({ ...p, description: e.target.value }))} />
                    </div>

                    <div>
                      <label className={LABEL}>Project</label>
                      <input type="text" className={INPUT} value={basic.project}
                        onChange={e => setBasic(p => ({ ...p, project: e.target.value }))} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL}><Clock size={14} className="inline mr-1" />Duration</label>
                        <input type="text" className={INPUT} value={basic.duration} placeholder="e.g. 12 weeks"
                          onChange={e => setBasic(p => ({ ...p, duration: e.target.value }))} />
                      </div>
                      <div>
                        <label className={LABEL}><BarChart3 size={14} className="inline mr-1" />Level</label>
                        <select className={INPUT} value={basic.level}
                          onChange={e => setBasic(p => ({ ...p, level: e.target.value }))}>
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>All Levels</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Course Type</p>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={basic.is_freemium}
                            onChange={e => setBasic(p => ({ ...p, is_freemium: e.target.checked }))}
                            className="w-4 h-4 rounded" />
                          <Sparkles size={14} className="text-blue-500" />
                          <span className="text-sm text-gray-700">Freemium</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={basic.is_premium}
                            onChange={e => setBasic(p => ({ ...p, is_premium: e.target.checked }))}
                            className="w-4 h-4 rounded" />
                          <Crown size={14} className="text-amber-500" />
                          <span className="text-sm text-gray-700">Premium</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── IMAGES ── */}
                {activeTab === 'images' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-gray-900">Course Images</h3>
                    <p className="text-sm text-gray-500">
                      Upload image files directly. Existing images are shown below — click to replace.
                    </p>
                    <ImageDropZone
                      label="Hero Image"
                      file={heroFile}
                      preview={heroPreview}
                      existingUrl={course.hero_image}
                      onFileChange={onHeroChange}
                      onClear={() => { setHeroFile(null); setHeroPreview(null); }}
                    />
                    <ImageDropZone
                      label="Secondary Image"
                      file={secondaryFile}
                      preview={secondaryPreview}
                      existingUrl={course.secondary_image}
                      onFileChange={onSecondaryChange}
                      onClear={() => { setSecondaryFile(null); setSecondaryPreview(null); }}
                    />
                  </div>
                )}

                {/* ── PRICING ── */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <h3 className="text-base font-semibold text-gray-900">Pricing</h3>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Base Prices</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={LABEL}>USD</label>
                          <PriceInput symbol="$" name="price_usd" value={pricing.price_usd}
                            onChange={e => setPricing(p => ({ ...p, price_usd: e.target.value }))} placeholder="299.00" />
                        </div>
                        <div>
                          <label className={LABEL}>NGN</label>
                          <PriceInput symbol="₦" name="price_ngn" value={pricing.price_ngn}
                            onChange={e => setPricing(p => ({ ...p, price_ngn: e.target.value }))} placeholder="150000.00" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Available Tracks</p>
                      {(['offers_one_on_one', 'offers_group_mentorship', 'offers_self_paced'] as const).map(key => (
                        <label key={key} className="flex items-center gap-3 mb-2 cursor-pointer">
                          <input type="checkbox" checked={pricing[key] as boolean}
                            onChange={e => setPricing(p => ({ ...p, [key]: e.target.checked }))}
                            className="w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace('offers_', '').replace(/_/g, ' ')}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* USD track prices */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Track Prices (USD)</p>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'One-on-One', key: 'one_on_one_price_usd', flag: 'offers_one_on_one' },
                          { label: 'Group',       key: 'group_mentorship_price_usd', flag: 'offers_group_mentorship' },
                          { label: 'Self-Paced',  key: 'self_paced_price_usd', flag: 'offers_self_paced' },
                        ].map(({ label, key, flag }) => (
                          <div key={key}>
                            <label className={LABEL}>{label}</label>
                            <PriceInput symbol="$" name={key}
                              value={(pricing as any)[key]}
                              onChange={e => setPricing(p => ({ ...p, [key]: e.target.value }))}
                              disabled={!(pricing as any)[flag]} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* NGN track prices */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Track Prices (NGN)</p>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'One-on-One', key: 'one_on_one_price_ngn', flag: 'offers_one_on_one' },
                          { label: 'Group',       key: 'group_mentorship_price_ngn', flag: 'offers_group_mentorship' },
                          { label: 'Self-Paced',  key: 'self_paced_price_ngn', flag: 'offers_self_paced' },
                        ].map(({ label, key, flag }) => (
                          <div key={key}>
                            <label className={LABEL}>{label}</label>
                            <PriceInput symbol="₦" name={key}
                              value={(pricing as any)[key]}
                              onChange={e => setPricing(p => ({ ...p, [key]: e.target.value }))}
                              disabled={!(pricing as any)[flag]} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Discounts */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">One-Time Payment Discounts</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={LABEL}>USD Discount Amount</label>
                          <PriceInput symbol="$" name="onetime_discount_usd" value={pricing.onetime_discount_usd}
                            onChange={e => setPricing(p => ({ ...p, onetime_discount_usd: e.target.value }))} placeholder="50.00" />
                        </div>
                        <div>
                          <label className={LABEL}>NGN Discount Amount</label>
                          <PriceInput symbol="₦" name="onetime_discount_ngn" value={pricing.onetime_discount_ngn}
                            onChange={e => setPricing(p => ({ ...p, onetime_discount_ngn: e.target.value }))} placeholder="25000.00" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TOOLS ── */}
                {activeTab === 'tools' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Tools &amp; Technologies</h3>
                    {tools.map((tool, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex gap-3 items-center">
                          <input type="text" placeholder="Tool name (e.g. React)" value={tool.name}
                            onChange={e => {
                              const u = [...tools]; u[i] = { ...u[i], name: e.target.value }; setTools(u);
                            }}
                            className={`${INPUT} flex-1`} />
                          {tools.length > 1 && (
                            <button onClick={() => setTools(tools.filter((_, j) => j !== i))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        {/* Icon */}
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 text-sm text-gray-700">
                            <Upload size={16} />
                            {tool.icon ? 'Replace icon' : 'Upload icon'}
                            <input type="file" accept="image/*" className="hidden"
                              onChange={e => {
                                const f = e.target.files?.[0] || null;
                                const u = [...tools];
                                u[i] = { ...u[i], icon: f, iconPreview: f ? URL.createObjectURL(f) : null };
                                setTools(u);
                              }} />
                          </label>
                          {(tool.iconPreview || tool.icon_url) && (
                            <img
                              src={tool.iconPreview || tool.icon_url}
                              alt="icon"
                              className="w-10 h-10 object-contain rounded-lg border border-gray-200"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setTools([...tools, { name: '', icon: null, iconPreview: null }])}
                      className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <Plus size={16} /> Add Tool
                    </button>
                  </div>
                )}

                {/* ── LEARNINGS ── */}
                {activeTab === 'learnings' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">What Students Will Learn</h3>
                    {learnings.map((l, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input type="text" placeholder="e.g. Master React hooks"
                          value={l.learning_point}
                          onChange={e => {
                            const u = [...learnings]; u[i] = { ...u[i], learning_point: e.target.value }; setLearnings(u);
                          }}
                          className={`${INPUT} flex-1`} />
                        {learnings.length > 1 && (
                          <button onClick={() => setLearnings(learnings.filter((_, j) => j !== i))}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setLearnings([...learnings, { learning_point: '' }])}
                      className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <Plus size={16} /> Add Learning Point
                    </button>
                  </div>
                )}

                {/* ── BENEFITS ── */}
                {activeTab === 'benefits' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Course Benefits</h3>
                    {benefits.map((b, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex gap-3">
                          <input type="text" placeholder="Benefit title" value={b.title}
                            onChange={e => {
                              const u = [...benefits]; u[i] = { ...u[i], title: e.target.value }; setBenefits(u);
                            }}
                            className={`${INPUT} flex-1`} />
                          {benefits.length > 1 && (
                            <button onClick={() => setBenefits(benefits.filter((_, j) => j !== i))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <textarea rows={2} placeholder="Benefit description" value={b.text}
                          onChange={e => {
                            const u = [...benefits]; u[i] = { ...u[i], text: e.target.value }; setBenefits(u);
                          }}
                          className={`${INPUT} resize-none`} />
                      </div>
                    ))}
                    <button onClick={() => setBenefits([...benefits, { title: '', text: '' }])}
                      className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <Plus size={16} /> Add Benefit
                    </button>
                  </div>
                )}

                {/* ── CAREER PATHS ── */}
                {activeTab === 'career_paths' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Career Paths</h3>
                    {careerPaths.map((c, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <select value={c.level}
                          onChange={e => {
                            const u = [...careerPaths]; u[i] = { ...u[i], level: e.target.value }; setCareerPaths(u);
                          }}
                          className={`${INPUT} w-44 shrink-0`}>
                          <option value="entry">Entry Level</option>
                          <option value="mid">Mid Level</option>
                          <option value="advanced">Advanced</option>
                          <option value="specialized">Specialized</option>
                        </select>
                        <input type="text" placeholder="Position (e.g. Junior Developer)" value={c.position}
                          onChange={e => {
                            const u = [...careerPaths]; u[i] = { ...u[i], position: e.target.value }; setCareerPaths(u);
                          }}
                          className={`${INPUT} flex-1`} />
                        {careerPaths.length > 1 && (
                          <button onClick={() => setCareerPaths(careerPaths.filter((_, j) => j !== i))}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setCareerPaths([...careerPaths, { level: 'entry', position: '' }])}
                      className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <Plus size={16} /> Add Career Path
                    </button>
                  </div>
                )}

                {/* ── INDUSTRIES ── */}
                {activeTab === 'industries' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Industries</h3>
                    {industries.map((ind, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex gap-3">
                          <input type="text" placeholder="Industry title" value={ind.title}
                            onChange={e => {
                              const u = [...industries]; u[i] = { ...u[i], title: e.target.value }; setIndustries(u);
                            }}
                            className={`${INPUT} flex-1`} />
                          {industries.length > 1 && (
                            <button onClick={() => setIndustries(industries.filter((_, j) => j !== i))}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <textarea rows={2} placeholder="Industry description" value={ind.text}
                          onChange={e => {
                            const u = [...industries]; u[i] = { ...u[i], text: e.target.value }; setIndustries(u);
                          }}
                          className={`${INPUT} resize-none`} />
                      </div>
                    ))}
                    <button onClick={() => setIndustries([...industries, { title: '', text: '' }])}
                      className="flex items-center gap-2 px-4 py-2 text-[#0F172A] border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">
                      <Plus size={16} /> Add Industry
                    </button>
                  </div>
                )}

                {/* ── SALARY ── */}
                {activeTab === 'salary' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-semibold text-gray-900">Salary Information</h3>
                    {[
                      { label: 'Entry Level Salary', key: 'entry_level', placeholder: '$30,000 – $55,000 USD annually' },
                      { label: 'Mid Level Salary',   key: 'mid_level',   placeholder: '$55,000 – $90,000 USD annually' },
                      { label: 'Senior Level Salary',key: 'senior_level',placeholder: '$150,000+ USD annually' },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key}>
                        <label className={LABEL}>{label}</label>
                        <input type="text" placeholder={placeholder}
                          value={(salary as any)[key]}
                          onChange={e => setSalary(s => ({ ...s, [key]: e.target.value }))}
                          className={INPUT} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <span className="text-sm text-gray-400">
            Editing: <span className="font-medium text-gray-600">{TABS.find(t => t.id === activeTab)?.label}</span>
          </span>
          <div className="flex gap-3">
            <button onClick={handleClose}
              className="px-4 py-2.5 text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCourseModal;