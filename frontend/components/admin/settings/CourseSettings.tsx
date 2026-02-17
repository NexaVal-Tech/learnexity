// components/admin/settings/CourseSettings.tsx
import React, { useState, useEffect } from 'react';
import { DollarSign, Settings, Save, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { Course } from '@/lib/types';

interface CourseSettingsProps {
  courseId: string;
}

interface PricingSettings {
  offers_one_on_one: boolean;
  offers_group_mentorship: boolean;
  offers_self_paced: boolean;
  offers_real_world_exposure: boolean;
  price_usd: number;
  price_ngn: number;
  one_on_one_price_usd: string;
  group_mentorship_price_usd: string;
  self_paced_price_usd: string;
  one_on_one_price_ngn: string;
  group_mentorship_price_ngn: string;
  self_paced_price_ngn: string;
  onetime_discount_usd: string;
  onetime_discount_ngn: string;
}

export default function CourseSettings({ courseId }: CourseSettingsProps) {
  const [settings, setSettings] = useState<PricingSettings>({
    offers_one_on_one: true,
    offers_group_mentorship: true,
    offers_self_paced: true,
    offers_real_world_exposure: false,
    price_usd: 0,
    price_ngn: 0,
    one_on_one_price_usd: '',
    group_mentorship_price_usd: '',
    self_paced_price_usd: '',
    one_on_one_price_ngn: '',
    group_mentorship_price_ngn: '',
    self_paced_price_ngn: '',
    onetime_discount_usd: '',
    onetime_discount_ngn: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [courseId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const course = await adminApi.get<Course>(`/api/admin/courses/${courseId}`);
      
      setSettings({
        offers_one_on_one: course.offers_one_on_one ?? true,
        offers_group_mentorship: course.offers_group_mentorship ?? true,
        offers_self_paced: course.offers_self_paced ?? true,
        offers_real_world_exposure: course.offers_real_world_exposure ?? false,
        price_usd: course.price_usd ?? 0,
        price_ngn: course.price_ngn ?? 0,
        one_on_one_price_usd: course.one_on_one_price_usd?.toString() || '',
        group_mentorship_price_usd: course.group_mentorship_price_usd?.toString() || '',
        self_paced_price_usd: course.self_paced_price_usd?.toString() || '',
        one_on_one_price_ngn: course.one_on_one_price_ngn?.toString() || '',
        group_mentorship_price_ngn: course.group_mentorship_price_ngn?.toString() || '',
        self_paced_price_ngn: course.self_paced_price_ngn?.toString() || '',
        onetime_discount_usd: course.onetime_discount_usd?.toString() || '',
        onetime_discount_ngn: course.onetime_discount_ngn?.toString() || '',
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load course settings');
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Handle number input with commas and large numbers
  const handleNumberChange = (field: string, value: string) => {
    const cleanValue = value.replace(/[^\d.]/g, '');
    if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
      // Cap discount fields at 100
      if (field.includes('discount')) {
        const num = parseFloat(cleanValue);
        if (!isNaN(num) && num > 100) return;
      }
      setSettings({ ...settings, [field]: cleanValue });
    }
  };

  // FIXED: Format number for display with commas
  const formatNumberDisplay = (value: string): string => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // FIXED: Convert string values to numbers properly
      const dataToSave = {
        ...settings,
        one_on_one_price_usd: parseFloat(settings.one_on_one_price_usd || '0'),
        group_mentorship_price_usd: parseFloat(settings.group_mentorship_price_usd || '0'),
        self_paced_price_usd: parseFloat(settings.self_paced_price_usd || '0'),
        one_on_one_price_ngn: parseFloat(settings.one_on_one_price_ngn || '0'),
        group_mentorship_price_ngn: parseFloat(settings.group_mentorship_price_ngn || '0'),
        self_paced_price_ngn: parseFloat(settings.self_paced_price_ngn || '0'),
        onetime_discount_usd: parseFloat(settings.onetime_discount_usd || '0'),
        onetime_discount_ngn: parseFloat(settings.onetime_discount_ngn || '0'),
      };

      console.log('💾 Saving pricing data:', dataToSave);

      await adminApi.put(`/api/admin/courses/${courseId}/pricing`, dataToSave);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Course Pricing & Settings</h2>
            <p className="text-sm text-gray-500">Configure pricing and available learning tracks</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-green-900">Success</h4>
            <p className="text-sm text-green-700">Settings saved successfully</p>
          </div>
        </div>
      )}

      {/* Learning Tracks Availability */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Learning Tracks</h3>
        <p className="text-sm text-gray-600 mb-4">Select which learning tracks are available for this course</p>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={settings.offers_one_on_one}
              onChange={(e) => setSettings({ ...settings, offers_one_on_one: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">One-on-One Coaching</div>
              <div className="text-sm text-gray-500">Private sessions with instructor</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={settings.offers_group_mentorship}
              onChange={(e) => setSettings({ ...settings, offers_group_mentorship: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Group Mentorship</div>
              <div className="text-sm text-gray-500">Weekly sessions with peer learning</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={settings.offers_self_paced}
              onChange={(e) => setSettings({ ...settings, offers_self_paced: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Self-Paced Learning</div>
              <div className="text-sm text-gray-500">Learn at your own pace with community support</div>
            </div>
          </label>
        </div>
      </div>

      {/* Pricing Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pricing Configuration</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">Set prices for each learning track in both USD and NGN</p>

        {/* USD Pricing */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">$</span>
            USD Pricing (International)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {settings.offers_one_on_one && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  One-on-One Coaching
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">$</span>
                  <input
                    type="text"
                    value={settings.one_on_one_price_usd}
                    onChange={(e) => handleNumberChange('one_on_one_price_usd', e.target.value)}
                    onBlur={(e) => {
                      const formatted = formatNumberDisplay(e.target.value);
                      setSettings({ ...settings, one_on_one_price_usd: e.target.value });
                    }}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium text-gray-900"
                    placeholder="0"
                  />
                </div>
                {settings.one_on_one_price_usd && (
                  <p className="text-xs text-gray-500 mt-1">
                    ${formatNumberDisplay(settings.one_on_one_price_usd)}
                  </p>
                )}
              </div>
            )}

            {settings.offers_group_mentorship && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Mentorship
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">$</span>
                  <input
                    type="text"
                    value={settings.group_mentorship_price_usd}
                    onChange={(e) => handleNumberChange('group_mentorship_price_usd', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium text-gray-900"
                    placeholder="0"
                  />
                </div>
                {settings.group_mentorship_price_usd && (
                  <p className="text-xs text-gray-500 mt-1">
                    ${formatNumberDisplay(settings.group_mentorship_price_usd)}
                  </p>
                )}
              </div>
            )}

            {settings.offers_self_paced && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Self-Paced Learning
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">$</span>
                  <input
                    type="text"
                    value={settings.self_paced_price_usd}
                    onChange={(e) => handleNumberChange('self_paced_price_usd', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium text-gray-900"
                    placeholder="0"
                  />
                </div>
                {settings.self_paced_price_usd && (
                  <p className="text-xs text-gray-500 mt-1">
                    ${formatNumberDisplay(settings.self_paced_price_usd)}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Payment Discount
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.onetime_discount_usd}
                  onChange={(e) => handleNumberChange('onetime_discount_usd', e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium text-gray-900"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-base font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                % off each track price when paying upfront (0–100)
              </p>
              {settings.onetime_discount_usd && (() => {
                const pct = parseFloat(settings.onetime_discount_usd);
                const tracks = [
                  { label: '1-on-1', price: parseFloat(settings.one_on_one_price_usd || '0') },
                  { label: 'Group', price: parseFloat(settings.group_mentorship_price_usd || '0') },
                  { label: 'Self-paced', price: parseFloat(settings.self_paced_price_usd || '0') },
                ].filter(t => t.price > 0);
                if (!pct || !tracks.length) return null;
                return (
                  <div className="mt-2 space-y-1">
                    {tracks.map(t => (
                      <p key={t.label} className="text-xs text-green-700 font-medium">
                        {t.label}: ${t.price.toLocaleString()} → ${(t.price * (1 - pct / 100)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        <span className="text-gray-400 ml-1">(saves ${(t.price * pct / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })})</span>
                      </p>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* NGN Pricing */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">₦</span>
            NGN Pricing (Nigeria)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {settings.offers_one_on_one && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  One-on-One Coaching
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">₦</span>
                  <input
                    type="text"
                    value={settings.one_on_one_price_ngn}
                    onChange={(e) => handleNumberChange('one_on_one_price_ngn', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium text-gray-900"
                    placeholder="0"
                  />
                </div>
                {settings.one_on_one_price_ngn && (
                  <p className="text-xs text-gray-500 mt-1">
                    ₦{formatNumberDisplay(settings.one_on_one_price_ngn)}
                  </p>
                )}
              </div>
            )}

            {settings.offers_group_mentorship && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Mentorship
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">₦</span>
                  <input
                    type="text"
                    value={settings.group_mentorship_price_ngn}
                    onChange={(e) => handleNumberChange('group_mentorship_price_ngn', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium text-gray-900"
                    placeholder="0"
                  />
                </div>
                {settings.group_mentorship_price_ngn && (
                  <p className="text-xs text-gray-500 mt-1">
                    ₦{formatNumberDisplay(settings.group_mentorship_price_ngn)}
                  </p>
                )}
              </div>
            )}

            {settings.offers_self_paced && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Self-Paced Learning
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-base">₦</span>
                  <input
                    type="text"
                    value={settings.self_paced_price_ngn}
                    onChange={(e) => handleNumberChange('self_paced_price_ngn', e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium text-gray-900"
                    placeholder="0"
                  />
                </div>
                {settings.self_paced_price_ngn && (
                  <p className="text-xs text-gray-500 mt-1">
                    ₦{formatNumberDisplay(settings.self_paced_price_ngn)}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Payment Discount
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={settings.onetime_discount_ngn}
                  onChange={(e) => handleNumberChange('onetime_discount_ngn', e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base font-medium text-gray-900"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-base font-medium">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                % off each track price when paying upfront (0–100)
              </p>
              {settings.onetime_discount_ngn && (() => {
                const pct = parseFloat(settings.onetime_discount_ngn);
                const tracks = [
                  { label: '1-on-1', price: parseFloat(settings.one_on_one_price_ngn || '0') },
                  { label: 'Group', price: parseFloat(settings.group_mentorship_price_ngn || '0') },
                  { label: 'Self-paced', price: parseFloat(settings.self_paced_price_ngn || '0') },
                ].filter(t => t.price > 0);
                if (!pct || !tracks.length) return null;
                return (
                  <div className="mt-2 space-y-1">
                    {tracks.map(t => (
                      <p key={t.label} className="text-xs text-green-700 font-medium">
                        {t.label}: ₦{t.price.toLocaleString()} → ₦{(t.price * (1 - pct / 100)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                        <span className="text-gray-400 ml-1">(saves ₦{(t.price * pct / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })})</span>
                      </p>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Payment Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Nigerian users will automatically see NGN pricing and pay via Paystack</li>
          <li>• International users will see USD pricing and pay via Stripe</li>
          <li>• Installment payments are split across 4 months (16 weeks)</li>
          <li>• Users must pay on time each month to maintain course access</li>
          <li>• One-time discount is a <strong>percentage</strong> applied to each track's price when paying upfront in full</li>
        </ul>
      </div>
    </div>
  );
}