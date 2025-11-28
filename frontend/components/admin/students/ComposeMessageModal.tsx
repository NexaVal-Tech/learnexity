import React from 'react';
import { X, Users, Paperclip, Eye, Save, Calendar, Send, ArrowLeft } from 'lucide-react';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientCount: number;
  recipients: string[];
}

const ComposeMessageModal = ({ isOpen, onClose, recipientCount, recipients }: ComposeMessageModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-white w-full h-full md:h-auto md:w-[600px] md:max-h-[90vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="md:hidden p-1 -ml-1 text-gray-600">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compose Message</h2>
              <p className="text-xs text-gray-500">Send a message to your students</p>
            </div>
          </div>
          <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
          <div className="flex gap-3 md:hidden">
             {/* Mobile Header Actions if needed */}
             <Eye size={20} className="text-gray-600" />
             <Calendar size={20} className="text-gray-600" />
             <Send size={20} className="text-gray-600" />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Recipient Info Card */}
          <div className="bg-[#F5F3FF] rounded-xl p-4 border border-[#E0D9FE]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Users size={20} className="text-gray-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Recipient Type:</span>
                    <span className="text-sm font-semibold text-gray-900">Filtered Group</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{recipientCount} students will receive this message</p>
                </div>
              </div>
              <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">{recipientCount}</span>
            </div>
            
            <div className="border-t border-[#E0D9FE] pt-3">
              <p className="text-xs text-gray-600 mb-2">Recipients:</p>
              <div className="flex flex-wrap gap-2">
                {recipients.map((name, index) => (
                  <span key={index} className="px-2 py-1 bg-white border border-[#E0D9FE] rounded text-xs font-medium text-gray-700">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Subject</label>
            <input 
              type="text" 
              placeholder="Enter message subject"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Message Body</label>
            <textarea 
              placeholder="Type your message here.."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm h-40 resize-none"
            ></textarea>
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Attachments (Optional)</label>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
              <Paperclip size={16} />
              Add Attachment
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="hidden md:block p-4 md:p-6 border-t border-gray-100 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Eye size={16} />
                Preview
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Save size={16} />
                Save Draft
              </button>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Calendar size={16} />
                Schedule
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                <Send size={16} />
                Send Now
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComposeMessageModal;
