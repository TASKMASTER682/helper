'use client';
import { useState, useEffect } from 'react';
import { adminAPI, coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Video, BookOpen, Clock, Layers, Shield, PlayCircle, Eye, Trash2, Edit2, Plus, Crown, Upload } from 'lucide-react';

export function PlanFormModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: '', price: 0, duration: 1, durationUnit: 'month', description: '', features: [''] });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.createSubscriptionPlan(form);
      toast.success('Tier architecture deployed');
      onSave();
    } catch { toast.error('Deployment failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-xl border-yellow-500/20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Deploy New Tier</h3>
            <p className="text-[10px] text-ink-500 font-bold uppercase tracking-widest mt-1">Configure clearance parameters</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-ink-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-ink-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Tier Designation</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none" placeholder="e.g. Platinum Nexus" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Credit Requirement (INR)</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: parseInt(e.target.value)})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Cycle Duration</label>
              <input type="number" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none" placeholder="1" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Temporal Unit</label>
              <select value={form.durationUnit} onChange={e => setForm({...form, durationUnit: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500/50 outline-none uppercase">
                <option value="day">Days</option>
                <option value="month">Months</option>
                <option value="year">Years</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Access Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full h-24 bg-ink-950 border border-ink-800 rounded-xl p-4 text-sm text-white focus:border-yellow-500/50 outline-none resize-none" placeholder="Primary objectives for this tier..." />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-yellow-500/10 uppercase text-xs tracking-widest">
            {saving ? 'Synchronizing...' : 'Deploy Protocol'}
          </button>
          <button onClick={onClose} className="px-8 py-4 bg-ink-900 text-ink-500 font-black rounded-2xl hover:text-white transition-all uppercase text-xs tracking-widest">Abort</button>
        </div>
      </div>
    </div>
  );
}

export function ActivateUserModal({ onClose, onActivate }: { onClose: () => void; onActivate: (userId: string, planId: string) => void }) {
  const [userId, setUserId] = useState('');
  const [planId, setPlanId] = useState('');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getSubscriptionPlans().then(res => {
      setPlans(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md border-blue-500/20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Manual Authorization</h3>
            <p className="text-[10px] text-ink-500 font-bold uppercase tracking-widest mt-1">Override system access nodes</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-ink-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-ink-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Subject ID (User MongoDB ID)</label>
            <input value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" placeholder="507f1f..." />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Authorization Tier</label>
            <select value={planId} onChange={e => setPlanId(e.target.value)} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none uppercase">
              <option value="">Select Tier</option>
              {plans.map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={() => onActivate(userId, planId)} disabled={!userId || !planId} className="flex-1 py-4 bg-blue-500 hover:bg-blue-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-blue-500/10 uppercase text-xs tracking-widest">
            Grant Access
          </button>
          <button onClick={onClose} className="px-8 py-4 bg-ink-900 text-ink-500 font-black rounded-2xl hover:text-white transition-all uppercase text-xs tracking-widest">Abort</button>
        </div>
      </div>
    </div>
  );
}

export function CourseFormModal({ course, onClose, onSave }: { course?: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: course?.title || '',
    description: course?.description || '',
    thumbnail: course?.thumbnail || '',
    category: course?.category || '',
    subject: course?.subject || '',
    instructor: course?.instructor || '',
    price: course?.price || 0,
    discountPrice: course?.discountPrice || 0,
    discountExpiry: course?.discountExpiry ? new Date(course.discountExpiry).toISOString().split('T')[0] : '',
    maxViews: course?.maxViews || 2,
    isPremium: course?.isPremium !== undefined ? course.isPremium : true
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (course) {
        await coursesAPI.updateCourse(course._id, form);
        toast.success('Module reconfigured');
      } else {
        await coursesAPI.createCourse(form);
        toast.success('New module synthesized');
      }
      onSave();
    } catch { toast.error('Sync failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-2xl border-blue-500/20 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{course ? 'Reconfigure Module' : 'Synthesize New Module'}</h3>
          <X className="cursor-pointer text-ink-400 hover:text-white" onClick={onClose} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Module Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Abstract</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full h-32 bg-ink-950 border border-ink-800 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 outline-none resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Instructor Name</label>
              <input value={form.instructor} onChange={e => setForm({...form, instructor: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest block mb-2">Module Thumbnail</label>
              <div className="flex flex-col gap-4">
                {form.thumbnail && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-ink-800 group">
                    <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setForm({...form, thumbnail: ''})}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 1 * 1024 * 1024) {
                          toast.error('Image size must be less than 1MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({...form, thumbnail: reader.result as string});
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    className="hidden" 
                    id="course-thumbnail-upload"
                  />
                  <label 
                    htmlFor="course-thumbnail-upload"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-ink-900 border border-dashed border-ink-700 rounded-xl text-xs font-bold text-ink-400 hover:border-blue-500/50 hover:text-white transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    {form.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail (Max 1MB)'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Category</label>
                <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" placeholder="e.g. GS Prelims" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Subject</label>
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" placeholder="e.g. Polity" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Base Price (INR)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: parseInt(e.target.value)})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Default Max Views</label>
                <input type="number" value={form.maxViews} onChange={e => setForm({...form, maxViews: parseInt(e.target.value)})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-ink-950 rounded-xl border border-ink-800">
              <input type="checkbox" checked={form.isPremium} onChange={e => setForm({...form, isPremium: e.target.checked})} className="w-4 h-4 rounded bg-ink-900 border-ink-700 text-blue-500" />
              <label className="text-[10px] font-black text-ink-400 uppercase tracking-widest">Premium Content</label>
            </div>

            <div className="space-y-2 pt-4 border-t border-ink-800">
              <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Promotional Price (Optional)</label>
              <input type="number" value={form.discountPrice} onChange={e => setForm({...form, discountPrice: parseInt(e.target.value)})} className="w-full bg-ink-950 border border-teal-500/20 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Promotion Expiry</label>
              <input type="date" value={form.discountExpiry} onChange={e => setForm({...form, discountExpiry: e.target.value})} className="w-full bg-ink-950 border border-teal-500/20 rounded-xl px-4 py-3 text-sm text-white focus:border-teal-500/50 outline-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-blue-500 hover:bg-blue-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-blue-500/10 uppercase text-xs tracking-widest">
            {saving ? 'Processing...' : 'Confirm Parameters'}
          </button>
          <button onClick={onClose} className="px-8 py-4 bg-ink-900 text-ink-500 font-black rounded-2xl hover:text-white transition-all uppercase text-xs tracking-widest">Abort</button>
        </div>
      </div>
    </div>
  );
}

export function LessonFormModal({ courseId, lesson, onClose, onSave }: { courseId: string; lesson?: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: lesson?.title || '',
    description: lesson?.description || '',
    videoId: lesson?.videoId || '',
    thumbnail: lesson?.thumbnail || '',
    order: lesson?.order || 0,
    isPreview: lesson?.isPreview || false
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (lesson) {
        await coursesAPI.updateLesson(lesson._id, form);
        toast.success('Video node reconfigured');
      } else {
        await coursesAPI.createLesson(courseId, form);
        toast.success('Video node appended');
      }
      onSave();
    } catch { toast.error('Sync failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-lg border-blue-500/20 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{lesson ? 'Edit Video Node' : 'Append Video Node'}</h3>
          <X className="cursor-pointer text-ink-400 hover:text-white" onClick={onClose} />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Lesson Title</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Video ID (e.g. dQw4w9WgXcQ)</label>
            <input value={form.videoId} onChange={e => setForm({...form, videoId: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" placeholder="YouTube/Vimeo Video ID" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest block mb-2">Lesson Thumbnail (Optional)</label>
            <div className="flex flex-col gap-4">
              {form.thumbnail && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-ink-800 group">
                  <img src={form.thumbnail} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setForm({...form, thumbnail: ''})}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 1 * 1024 * 1024) {
                        toast.error('Image size must be less than 1MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm({...form, thumbnail: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="hidden" 
                  id="lesson-thumbnail-upload"
                />
                <label 
                  htmlFor="lesson-thumbnail-upload"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-ink-900 border border-dashed border-ink-700 rounded-xl text-xs font-bold text-ink-400 hover:border-blue-500/50 hover:text-white transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {form.thumbnail ? 'Change Thumbnail' : 'Upload Thumbnail (Max 1MB)'}
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest">Index Order</label>
            <input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
          </div>
          <div className="flex items-center gap-3 p-4 bg-ink-950 rounded-2xl border border-ink-800">
            <input type="checkbox" checked={form.isPreview} onChange={e => setForm({...form, isPreview: e.target.checked})} className="w-4 h-4 rounded bg-ink-900 border-ink-700 text-blue-500 focus:ring-blue-500/30" />
            <label className="text-xs font-bold text-ink-400 uppercase tracking-widest">Mark as Preview Node (Free)</label>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-blue-500 hover:bg-blue-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-blue-500/10 uppercase text-xs tracking-widest">
            {saving ? 'Syncing...' : 'Deploy Node'}
          </button>
          <button onClick={onClose} className="px-8 py-4 bg-ink-900 text-ink-500 font-black rounded-2xl hover:text-white transition-all uppercase text-xs tracking-widest">Abort</button>
        </div>
      </div>
    </div>
  );
}

export function QuestionFormModal({ question, onClose, onSave }: { question?: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    questionNumber: question?.questionNumber || '',
    text: question?.text || '',
    options: {
      a: question?.options?.a || '',
      b: question?.options?.b || '',
      c: question?.options?.c || '',
      d: question?.options?.d || '',
    },
    correctAnswer: question?.correctAnswer || 'a',
    explanation: question?.explanation || '',
    subject: question?.subject || '',
    year: question?.year || new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (question) {
        await adminAPI.updateQuestion(question._id, form);
        toast.success('Question node reconfigured');
      } else {
        await adminAPI.addQuestion(form);
        toast.success('Question node synthesized');
      }
      onSave();
    } catch { toast.error('Sync failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-3xl border-yellow-500/20 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{question ? 'Reconfigure Question' : 'Synthesize New Question'}</h3>
          <X className="cursor-pointer text-ink-400 hover:text-white" onClick={onClose} />
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Number</label>
              <input type="number" value={form.questionNumber} onChange={e => setForm({...form, questionNumber: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Subject</label>
              <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-500/50" />
            </div>
            <div>
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Year</label>
              <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-white outline-none focus:border-yellow-500/50" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Question Content</label>
            <textarea value={form.text} onChange={e => setForm({...form, text: e.target.value})} className="w-full h-32 bg-ink-950 border border-ink-800 rounded-xl p-4 text-sm text-white focus:border-yellow-500/50 outline-none resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['a', 'b', 'c', 'd'].map(opt => (
              <div key={opt} className="space-y-1">
                <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest flex items-center justify-between">
                  Option {opt.toUpperCase()}
                  <input 
                    type="radio" 
                    name="correct" 
                    checked={form.correctAnswer === opt} 
                    onChange={() => setForm({...form, correctAnswer: opt})}
                    className="w-3 h-3 accent-teal-500"
                  />
                </label>
                <input value={form.options[opt as keyof typeof form.options]} onChange={e => setForm({...form, options: {...form.options, [opt]: e.target.value}})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-yellow-500/50" />
              </div>
            ))}
          </div>

          <div>
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Analytical Explanation</label>
            <textarea value={form.explanation} onChange={e => setForm({...form, explanation: e.target.value})} className="w-full h-24 bg-ink-950 border border-ink-800 rounded-xl p-4 text-sm text-white focus:border-yellow-500/50 outline-none resize-none" />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-2xl transition-all shadow-xl shadow-yellow-500/10 uppercase text-xs tracking-widest">
            {saving ? 'Processing...' : 'Synchronize Node'}
          </button>
          <button onClick={onClose} className="px-8 py-4 bg-ink-900 text-ink-500 font-black rounded-2xl hover:text-white transition-all uppercase text-xs tracking-widest">Abort</button>
        </div>
      </div>
    </div>
  );
}

export function BulkQuestionModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [jsonText, setJsonText] = useState('');
  const [parsing, setParsing] = useState(false);

  const handleImport = async () => {
    try {
      setParsing(true);
      const questions = JSON.parse(jsonText);
      if (!Array.isArray(questions)) throw new Error('Input must be an array of objects');
      await adminAPI.addBulkQuestions(questions);
      toast.success(`${questions.length} nodes integrated into database`);
      onSave();
    } catch (err: any) {
      toast.error(err.message || 'Parsing failure');
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-2xl border-purple-500/20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Bulk Data Integration</h3>
            <p className="text-[10px] text-ink-500 font-bold uppercase tracking-widest mt-1">Inject massive question arrays</p>
          </div>
          <X className="cursor-pointer text-ink-400 hover:text-white" onClick={onClose} />
        </div>
        
        <div className="space-y-4">
          <textarea 
            value={jsonText} 
            onChange={e => setJsonText(e.target.value)} 
            className="w-full h-80 bg-ink-950 border border-ink-800 rounded-2xl p-6 text-xs text-teal-400 font-mono focus:border-purple-500/30 outline-none resize-none shadow-inner"
            placeholder="[ { 'questionNumber': 1, 'text': '...', 'options': { ... }, 'correctAnswer': 'a' }, ... ]"
          />
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl">
            <p className="text-[9px] text-purple-300 font-bold uppercase tracking-widest leading-relaxed">
              * Ensure JSON schema strictly matches the question model. Improperly formatted nodes will be rejected by the validation firewall.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={handleImport} disabled={parsing || !jsonText} className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-500/10 uppercase text-xs tracking-widest">
            {parsing ? 'Parsing Stream...' : 'Initialize Integration'}
          </button>
          <button onClick={onClose} className="px-8 py-4 bg-ink-900 text-ink-500 font-black rounded-2xl hover:text-white transition-all uppercase text-xs tracking-widest">Abort</button>
        </div>
      </div>
    </div>
  );
}

export function EditTestModal({ test, onClose, onSave }: { test: any; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ ...test });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminAPI.updateTest(test._id, form);
      toast.success('Test parameters reconfigured');
      onSave();
    } catch { toast.error('Sync failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-lg border-yellow-500/20">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Test Parameters</h3>
          <X className="cursor-pointer text-ink-400 hover:text-white" onClick={onClose} />
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Designation</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-white outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Duration (Min)</label>
              <input type="number" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: parseInt(e.target.value)})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-white outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-ink-600 uppercase tracking-widest mb-2 block">Total Qs</label>
              <input type="number" value={form.totalQuestions} onChange={e => setForm({...form, totalQuestions: parseInt(e.target.value)})} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-2 text-white outline-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 text-ink-950 font-black rounded-2xl transition-all uppercase text-xs tracking-widest">
            {saving ? 'Processing...' : 'Apply Changes'}
          </button>
          <button onClick={onClose} className="px-8 py-4 bg-ink-900 text-ink-500 font-black rounded-2xl hover:text-white transition-all uppercase text-xs tracking-widest">Cancel</button>
        </div>
      </div>
    </div>
  );
}
