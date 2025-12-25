import React, { useState } from 'react';
import { X, Paperclip, Send, ArrowLeft, Mail, AlertCircle, Loader2 } from 'lucide-react';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientCount: number;
  recipients: Array<{ id: number; name: string; email: string }>;
  onSend: (data: MessageData) => Promise<void>;
}

interface MessageData {
  student_ids: number[];
  subject: string;
  message: string;
  attachment?: File;
}

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ 
  isOpen, 
  onClose, 
  recipientCount, 
  recipients,
  onSend 
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required');
      return;
    }

    try {
      setSending(true);
      setError('');
      
      await onSend({
        student_ids: recipients.map(r => r.id),
        subject,
        message,
        attachment: attachment || undefined
      });

      // Reset form
      setSubject('');
      setMessage('');
      setAttachment(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {/* Recipient Info Card */}
          <div className="bg-[#F5F3FF] rounded-xl p-4 border border-[#E0D9FE]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Mail size={20} className="text-gray-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Recipient Type:</span>
                    <span className="text-sm font-semibold text-gray-900">Selected Students</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{recipientCount} students will receive this message</p>
                </div>
              </div>
              <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">{recipientCount}</span>
            </div>
            
            <div className="border-t border-[#E0D9FE] pt-3">
              <p className="text-xs text-gray-600 mb-2">Recipients:</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {recipients.map((recipient) => (
                  <span key={recipient.id} className="px-2 py-1 bg-white border border-[#E0D9FE] rounded text-xs font-medium text-gray-700">
                    {recipient.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Input */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Subject *</label>
            <input 
              type="text" 
              placeholder="Enter message subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Message Body *</label>
            <textarea 
              placeholder="Type your message here.."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm h-40 resize-none"
            ></textarea>
          </div>

          {/* Attachments */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-900">Attachments (Optional)</label>
            <input
              type="file"
              id="attachment-input"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button 
              onClick={() => document.getElementById('attachment-input')?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white"
            >
              <Paperclip size={16} />
              {attachment ? attachment.name : 'Add Attachment'}
            </button>
            {attachment && (
              <button
                onClick={() => setAttachment(null)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Remove attachment
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSend}
              disabled={sending || !subject.trim() || !message.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Now
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComposeMessageModal;