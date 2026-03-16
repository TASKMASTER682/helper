'use client';
import { useEffect, useState } from 'react';
import { youtubeCourseAPI } from '@/lib/api';
import { 
  Play, Plus, Trash2, Clock, CheckCircle2, Circle, 
  ChevronRight, Video, List, Loader2, X, Youtube
} from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import Link from 'next/link';

const SUBJECTS = ['Polity', 'History', 'Geography', 'Economy', 'Environment', 'Science & Tech', 'Ethics', 'Current Affairs', 'CSAT', 'Optional', 'Essay'];

export default function YouTubeCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: '', subject: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const { data } = await youtubeCourseAPI.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async () => {
    if (!form.url) { toast.error('Please enter a YouTube URL'); return; }
    setAdding(true);
    try {
      const { data } = await youtubeCourseAPI.addCourse({ 
        url: form.url, 
        subject: form.subject 
      });
      setCourses(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ url: '', subject: '' });
      toast.success('Course added successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add course');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await youtubeCourseAPI.deleteCourse(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted');
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const totalProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, c) => sum + (c.progress?.percentage || 0), 0) / courses.length)
    : 0;

  const totalVideos = courses.reduce((sum, c) => sum + (c.videos?.length || 0), 0);
  const completedVideos = courses.reduce((sum, c) => sum + (c.progress?.completedVideos || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Youtube className="w-6 h-6 text-red-500" />
            YouTube Courses
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            {courses.length} courses · {totalVideos} videos · {completedVideos} completed
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 border border-red-500/30 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold">Add YouTube Course</h3>
            <button onClick={() => setShowForm(false)} className="text-ink-500 hover:text-ink-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-ink-500 uppercase tracking-wider">
                YouTube Video or Playlist URL
              </label>
              <input
                value={form.url}
                onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                placeholder="https://youtube.com/watch?v=... or https://youtube.com/playlist?list=..."
                className="input-field w-full mt-2"
              />
              <p className="text-[10px] text-ink-600 mt-2">
                Supports single videos and playlists
              </p>
            </div>

            <div>
              <label className="text-[11px] font-mono text-ink-500 uppercase tracking-wider">
                Subject (Optional)
              </label>
              <select
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="input-field w-full mt-2"
              >
                <option value="">Select Subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleAddCourse} 
                disabled={adding} 
                className="btn-primary flex items-center gap-2"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {adding ? 'Adding...' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-ink-600 font-mono animate-pulse text-xs">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <Youtube className="w-16 h-16 text-ink-700 mx-auto mb-4" />
          <h3 className="text-ink-300 font-display text-lg mb-2">No courses yet</h3>
          <p className="text-ink-500 text-sm mb-4">Add a YouTube video or playlist to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Add Your First Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course} 
              onDelete={(e) => handleDelete(course._id, e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, onDelete }: { course: any; onDelete: (e: React.MouseEvent) => void }) {
  const progress = course.progress;
  const pct = progress?.percentage || 0;
  const isPlaylist = course.type === 'playlist';

  return (
    <Link href={`/dashboard/youtube/${course._id}`}>
      <div className="glass-card overflow-hidden transition-all duration-300 hover:border-red-500/30 group">
        <div className="relative aspect-video bg-ink-950">
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Youtube className="w-12 h-12 text-ink-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/80 mb-1">
              {isPlaylist ? (
                <><List className="w-3 h-3" /> {course.videos?.length || 0} videos</>
              ) : (
                <><Video className="w-3 h-3" /> Video</>
              )}
              {course.duration && (
                <span className="flex items-center gap-0.5 ml-2">
                  <Clock className="w-3 h-3" /> {course.duration}
                </span>
              )}
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={onDelete}
              className="p-1.5 bg-black/60 rounded-lg text-white/80 hover:text-red-400 hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-sm font-bold text-ink-100 line-clamp-2 mb-2">
            {course.title}
          </h3>
          
          {course.channelName && (
            <p className="text-[11px] text-ink-500 mb-3">{course.channelName}</p>
          )}
          
          {course.subject && (
            <span className="inline-block px-2 py-0.5 bg-ink-800 text-ink-400 text-[10px] rounded mb-3">
              {course.subject}
            </span>
          )}
          
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-1.5 bg-ink-950 rounded-full overflow-hidden">
              <div 
                className={clsx('h-full transition-all duration-500', 
                  pct >= 70 ? 'bg-teal-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                )} 
                style={{ width: `${pct}%` }} 
              />
            </div>
            <span className="text-[11px] font-mono text-ink-400">{pct}%</span>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-ink-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal-500" />
              {progress?.completedVideos || 0} / {course.videos?.length || 0}
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
