import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Camera, Check, ChevronRight, Clock3, Flame, ListTodo, Pause, Play, Plus, RotateCcw, Settings as SettingsIcon, Square, Target, Trash2, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { awardAchievements } from './lib/achievements';
import { chooseRoast } from './lib/roasts';
import { speakRoast } from './lib/speech';
import { playFocusChime } from './lib/sound';
import { createVisionDetector, readVisionSignal } from './features/attention/vision';
import { elapsedSeconds, formatTime } from './lib/timer';
import { defaults, loadData, saveData } from './lib/storage';
import type { AppData, EventType, Intensity, Priority, Session, Task } from './types';

type Page = 'dashboard' | 'tasks' | 'analytics' | 'settings';
const uid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
const priorityColor: Record<Priority, string> = { low: 'text-muted', medium: 'text-lime', high: 'text-coral' };

export default function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [page, setPage] = useState<Page>('dashboard');
  const [activeTask, setActiveTask] = useState<string>();
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [pausedTotal, setPausedTotal] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [distractions, setDistractions] = useState(0);
  const [roast, setRoast] = useState('');
  const [showOnboard, setShowOnboard] = useState(() => !localStorage.getItem('procrasti-mate-seen'));
  const [chaos, setChaos] = useState(false);
  const lastRoast = useRef(0);
  const lastSoundCue = useRef(0);
  const stream = useRef<MediaStream | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const detector = useRef<Awaited<ReturnType<typeof createVisionDetector>> | null>(null);
  const missingSince = useRef(0);
  const lastFaceAlert = useRef(0);
  const [cameraState, setCameraState] = useState<'off'|'loading'|'on'|'error'>('off');
  const running = startedAt !== null && pausedAt === null;
  const active = data.tasks.find(t => t.id === activeTask);
  const duration = (active?.estimate || data.settings.duration) * 60;
  const elapsed = startedAt ? Math.min(duration, Math.max(0, elapsedSeconds(startedAt, now) - pausedTotal)) : 0;
  const remaining = Math.max(0, duration - elapsed);
  const soundCount = duration <= 10 * 60 ? 3 : duration <= 25 * 60 ? 5 : 10;

  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { if (!running) return; const id = window.setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id); }, [running]);
  useEffect(() => {
    if (!running || !data.settings.sounds || duration <= 0) return;
    const cue = Math.min(soundCount, Math.floor((elapsed / duration) * (soundCount + 1)));
    if (cue > lastSoundCue.current) {
      lastSoundCue.current = cue;
      playFocusChime(cue);
    }
  }, [data.settings.sounds, duration, elapsed, running, soundCount]);
  const event = useCallback((type: EventType) => {
    if (!startedAt || pausedAt !== null) return;
    setDistractions(v => v + 1);
    const message = chooseRoast(data.settings.intensity, type, distractions + 1, lastRoast.current);
    if (!message) return;
    lastRoast.current = Date.now(); setRoast(message);
    if (data.settings.speech) speakRoast(message);
    if (type === 'face-missing' && data.settings.sounds) playFocusChime(distractions + 1);
    if (data.settings.chaos) setChaos(true);
  }, [startedAt, pausedAt, data.settings, distractions]);
  useEffect(() => {
    if (cameraState !== 'on' || !stream.current || !video.current) return;
    let cancelled = false;
    let frame = 0;
    const detect = async () => {
      if (cancelled || !video.current) return;
      if (!detector.current) {
        try { detector.current = await createVisionDetector(); }
        catch { if (!cancelled) setCameraState('error'); return; }
      }
      if (video.current.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        const signal = readVisionSignal(detector.current.detectForVideo(video.current, performance.now()) as { faceLandmarks?: Array<Array<{ x: number }>> });
        if (!signal.facePresent) {
          if (!missingSince.current) missingSince.current = Date.now();
          if (running && Date.now() - missingSince.current >= 3000 && Date.now() - lastFaceAlert.current >= 10000) {
            lastFaceAlert.current = Date.now();
            event('face-missing');
          }
        } else {
          missingSince.current = 0;
        }
      }
      frame = window.requestAnimationFrame(() => { void detect(); });
    };
    void detect();
    return () => { cancelled = true; window.cancelAnimationFrame(frame); detector.current?.close(); detector.current = null; };
  }, [cameraState, event, running]);
  useEffect(() => {
    const hiddenAt = { value: 0 };
    const onVisibility = () => { if (document.hidden) hiddenAt.value = Date.now(); else if (hiddenAt.value && Date.now() - hiddenAt.value > 5000) event('tab-return'); else if (hiddenAt.value) event('tab-hidden'); };
    document.addEventListener('visibilitychange', onVisibility); return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [event]);
  useEffect(() => { if (startedAt && remaining === 0) finish(true); }, [remaining, startedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { stream.current?.getTracks().forEach(t => t.stop()); detector.current?.close(); }, []);

  function start() { if (startedAt && pausedAt) { setPausedTotal(v => v + Date.now() - pausedAt); setPausedAt(null); } else if (!startedAt) { setStartedAt(Date.now()); setPausedTotal(0); setDistractions(0); setRoast(''); lastSoundCue.current = 0; } }
  function pause() { if (startedAt && !pausedAt) setPausedAt(Date.now()); }
  function reset() { setStartedAt(null); setPausedAt(null); setPausedTotal(0); setDistractions(0); setRoast(''); lastSoundCue.current = 0; }
  function finish(completed: boolean) {
    if (!startedAt) return;
    const session: Session = { id: uid(), startedAt, endedAt: Date.now(), duration: elapsed, taskId: activeTask, distractions, completed };
    const sessions = [...data.sessions, session];
    setData(d => ({ ...d, sessions, achievements: awardAchievements(sessions, d.tasks, d.achievements) }));
    reset();
  }
  function updateSettings(patch: Partial<AppData['settings']>) { setData(d => ({ ...d, settings: { ...d.settings, ...patch, ...(Object.prototype.hasOwnProperty.call(patch, 'sounds') ? { soundPreferenceConfigured: true } : {}) } })); }
  async function toggleCamera() {
    if (stream.current) { stream.current.getTracks().forEach(t => t.stop()); stream.current = null; setCameraState('off'); return; }
    setCameraState('loading');
    try { stream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); if (video.current) { video.current.srcObject = stream.current; await video.current.play(); } setCameraState('on'); updateSettings({ camera: true }); }
    catch { setCameraState('error'); updateSettings({ camera: false }); }
  }
  const todaySeconds = data.sessions.filter(s => new Date(s.endedAt).toDateString() === new Date().toDateString()).reduce((a, s) => a + s.duration, 0);
  const streak = data.sessions.length ? 1 : 0;
  const weekly = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const day = d.toLocaleDateString('en', { weekday: 'short' }); return { day, minutes: Math.round(data.sessions.filter(s => new Date(s.endedAt).toDateString() === d.toDateString()).reduce((a, s) => a + s.duration, 0) / 60) }; }), [data.sessions]);

  return <div className={chaos ? 'chaos min-h-screen' : 'min-h-screen'}><video ref={video} muted playsInline className="hidden" /><header className="border-b border-white/10 px-5 py-4 md:px-10 flex justify-between items-center"><div className="flex items-center gap-3"><img src="/favicon.svg" alt="" className="w-10 h-10 border border-lime/40" /><div><div className="font-display font-bold tracking-tight">PROCRASTI-MATE</div><div className="text-[10px] text-muted tracking-[.2em] uppercase">Sarcasm-powered focus</div></div></div><div className="text-xs text-muted hidden sm:block">Your potential is waiting. Unfortunately, so are you.</div></header>
    <div className="max-w-[1440px] mx-auto flex min-h-[calc(100vh-73px)]"><nav className="w-16 md:w-56 border-r border-white/10 p-3 md:p-5 flex flex-col gap-2">{([['dashboard', Target, 'Focus'],['tasks', ListTodo, 'Tasks'],['analytics', BarChart3, 'Analytics'],['settings', SettingsIcon, 'Settings']] as const).map(([id, Icon, label]) => <button key={id} onClick={() => setPage(id)} className={`flex items-center gap-3 p-3 text-left text-sm ${page === id ? 'bg-lime text-ink font-semibold' : 'text-muted hover:text-paper hover:bg-white/5'}`}><Icon size={17}/><span className="hidden md:block">{label}</span></button>)}<div className="mt-auto hidden md:block border-t border-white/10 pt-5 text-xs text-muted leading-relaxed">LOCAL ONLY<br/><span className="text-paper">No accounts. No uploads.</span></div></nav>
      <main className="flex-1 p-5 md:p-10 grid-lines overflow-hidden">{page === 'dashboard' && <Dashboard active={active} elapsed={elapsed} remaining={remaining} duration={duration} running={running} paused={!!pausedAt} roast={roast} distractions={distractions} todaySeconds={todaySeconds} streak={streak} sessions={data.sessions} sounds={data.settings.sounds} soundCount={soundCount} onStart={start} onPause={pause} onReset={reset} onFinish={() => finish(true)} onEvent={() => event('head-turn')} onTask={() => setPage('tasks')} onChaos={() => setChaos(false)} />}{page === 'tasks' && <Tasks tasks={data.tasks} activeTask={activeTask} setActive={setActiveTask} onChange={tasks => setData(d => ({ ...d, tasks }))} />}{page === 'analytics' && <Analytics sessions={data.sessions} weekly={weekly} achievements={data.achievements} />}{page === 'settings' && <Settings settings={data.settings} cameraState={cameraState} onSetting={updateSettings} onCamera={toggleCamera} />}</main></div>
    {showOnboard && <Onboarding settings={data.settings} onSave={s => { updateSettings(s); localStorage.setItem('procrasti-mate-seen', '1'); setShowOnboard(false); }} />}{chaos && <div className="fixed inset-0 z-40 bg-ink/95 grid place-items-center p-6"><div className="max-w-lg border-2 border-coral p-8 bg-[#17110f]"><div className="text-coral text-xs tracking-[.3em] uppercase mb-5">CHAOS MODE // INTERRUPTION</div><h2 className="font-display text-4xl font-bold mb-4">Your focus has been audited.</h2><p className="text-muted mb-8">{roast || 'The vibes are suspicious. Return to your task.'}</p><button onClick={() => setChaos(false)} className="bg-lime text-ink px-5 py-3 font-semibold">RETURN TO FOCUS <ChevronRight className="inline" size={17}/></button></div></div>}</div>;
}

function Dashboard(p: { active?: Task; elapsed: number; remaining: number; duration: number; running: boolean; paused: boolean; roast: string; distractions: number; todaySeconds: number; streak: number; sessions: Session[]; sounds: boolean; soundCount: number; onStart: () => void; onPause: () => void; onReset: () => void; onFinish: () => void; onEvent: () => void; onTask: () => void; onChaos: () => void }) {
  const progress = p.elapsed / p.duration * 100;
  return <section><div className="flex flex-wrap justify-between gap-4 mb-10"><div><div className="text-lime text-xs tracking-[.25em] uppercase mb-3">Control room / {new Date().toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}</div><h1 className="font-display text-4xl md:text-6xl font-bold leading-none">Let’s make<br/><span className="text-muted">one dent.</span></h1></div><button onClick={p.onTask} className="self-end border border-white/20 px-4 py-3 text-sm hover:border-lime"><Plus size={16} className="inline mr-2"/> Add task</button></div><div className="grid lg:grid-cols-[1.4fr_.8fr] gap-5"><div className="border border-white/15 bg-[#141414] p-5 md:p-9"><div className="flex justify-between text-xs uppercase tracking-widest text-muted"><span>Focus protocol</span><span>{p.active ? p.active.title : 'No task selected'}</span></div><div className="my-10 text-center"><div className="mb-5 inline-flex items-center gap-2 border border-white/15 px-3 py-2 text-[10px] uppercase tracking-widest text-muted">{p.sounds ? <Volume2 size={13} className="text-lime"/> : <VolumeX size={13}/>} {p.sounds ? `${p.soundCount} focus cues armed` : 'Focus cues muted'}</div><div className="font-mono text-[clamp(4.5rem,14vw,10rem)] leading-none tracking-[-.08em]">{formatTime(p.remaining)}</div><div className="h-1 bg-white/10 mt-7"><div className="h-full bg-lime transition-all" style={{ width: `${progress}%` }}/></div></div><div className="flex gap-2 flex-wrap justify-center">{!p.running && !p.paused ? <button onClick={p.onStart} className="bg-lime text-ink px-6 py-3 font-semibold"><Play size={16} className="inline mr-2"/>START FOCUS</button> : p.running ? <button onClick={p.onPause} className="bg-paper text-ink px-6 py-3 font-semibold"><Pause size={16} className="inline mr-2"/>PAUSE</button> : <button onClick={p.onStart} className="bg-lime text-ink px-6 py-3 font-semibold"><Play size={16} className="inline mr-2"/>RESUME</button>}<button onClick={p.onReset} className="border border-white/20 px-4 py-3"><RotateCcw size={16}/></button>{p.running && <button onClick={p.onFinish} className="border border-coral text-coral px-4 py-3"><Square size={14} className="inline mr-2"/>FINISH</button>}</div>{p.roast && <div className="mt-8 border-l-2 border-coral p-4 text-coral text-sm">“{p.roast}”</div>}</div><div className="space-y-5"><div className="border border-white/15 bg-[#141414] p-6"><div className="text-muted text-xs uppercase tracking-widest mb-5">Today, so far</div><div className="grid grid-cols-3 gap-3"><Metric value={`${Math.round(p.todaySeconds / 60)}m`} label="focus time"/><Metric value={String(p.sessions.filter(s => new Date(s.endedAt).toDateString() === new Date().toDateString()).length)} label="sessions"/><Metric value={String(p.streak)} label="streak"/></div></div><div className="border border-white/15 p-6"><div className="flex justify-between items-center"><div><div className="text-muted text-xs uppercase tracking-widest mb-2">Active task</div><div className="font-display text-xl">{p.active?.title || 'Pick a task to begin'}</div></div><Target className="text-lime" /></div>{p.active && <div className="text-xs text-muted mt-3">{p.active.estimate} min estimate · <span className={priorityColor[p.active.priority]}>{p.active.priority} priority</span></div>}</div><button onClick={p.onEvent} className="w-full border border-dashed border-white/20 p-3 text-xs text-muted hover:text-coral hover:border-coral">Demo distraction signal (for testing)</button></div></div><div className="mt-10 text-muted text-sm max-w-2xl"><span className="text-paper">Productivity summary:</span> {p.sessions.length ? `You have logged ${p.sessions.length} real session${p.sessions.length > 1 ? 's' : ''}. Keep the streak alive.` : 'No fabricated stats here. Start a session and your history will appear.'}</div></section>;
}
function Metric({ value, label }: { value: string; label: string }) { return <div><div className="font-mono text-2xl text-lime">{value}</div><div className="text-[10px] uppercase tracking-widest text-muted mt-1">{label}</div></div> }
function Tasks({ tasks, activeTask, setActive, onChange }: { tasks: Task[]; activeTask?: string; setActive: (id: string) => void; onChange: (tasks: Task[]) => void }) {
  const [editing, setEditing] = useState<Task | null>(null);
  const save = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); const task: Task = { id: editing?.id || uid(), title: String(f.get('title') || '').trim(), description: String(f.get('description') || ''), priority: f.get('priority') as Priority, estimate: Number(f.get('estimate') || 25), completed: editing?.completed || false, createdAt: editing?.createdAt || Date.now() }; if (!task.title) return; onChange(editing?.id ? tasks.map(t => t.id === task.id ? task : t) : [task, ...tasks]); setEditing(null); };
  const toggle = (task: Task) => onChange(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined } : t));
  return <section className="max-w-4xl"><div className="flex justify-between items-end mb-9"><div><div className="text-lime text-xs tracking-[.25em] uppercase mb-3">The backlog</div><h1 className="font-display text-5xl font-bold">Tasks<span className="text-lime">.</span></h1></div><button onClick={() => setEditing({ id: '', title: '', description: '', priority: 'medium', estimate: 25, completed: false, createdAt: Date.now() })} className="bg-lime text-ink px-4 py-3 font-semibold"><Plus size={16} className="inline mr-2"/>NEW TASK</button></div><div className="space-y-2">{tasks.length === 0 && <div className="border border-dashed border-white/20 p-12 text-center text-muted">Nothing here yet. An aggressively blank slate.</div>}{tasks.map(t => <div key={t.id} className={`border ${activeTask === t.id ? 'border-lime' : 'border-white/15'} bg-[#141414] p-4 flex gap-4 items-center`}><button aria-label={`Mark ${t.title} complete`} onClick={() => toggle(t)} className={`w-6 h-6 border ${t.completed ? 'bg-lime border-lime text-ink' : 'border-white/30'} grid place-items-center shrink-0`}>{t.completed && <Check size={15}/>}</button><button onClick={() => setActive(t.id)} className={`text-left flex-1 ${t.completed ? 'line-through text-muted' : ''}`}><div className="font-medium">{t.title}</div><div className="text-xs text-muted mt-1">{t.estimate} min · <span className={priorityColor[t.priority]}>{t.priority}</span>{t.description && ` · ${t.description}`}</div></button><button aria-label={`Edit ${t.title}`} onClick={() => setEditing(t)} className="text-xs text-muted hover:text-paper">EDIT</button><button aria-label={`Delete ${t.title}`} onClick={() => onChange(tasks.filter(x => x.id !== t.id))} className="text-muted hover:text-coral"><Trash2 size={16}/></button></div>)}</div>{editing && <div className="fixed inset-0 z-30 bg-ink/80 grid place-items-center p-5"><form onSubmit={save} className="bg-[#1e1e1e] border border-white/20 p-6 w-full max-w-lg"><div className="flex justify-between mb-6"><h2 className="font-display text-2xl">Define the work</h2><button type="button" onClick={() => setEditing(null)}><X/></button></div><label className="block text-xs text-muted uppercase tracking-wider mb-2">Title<input name="title" defaultValue={editing.title} autoFocus className="mt-2 w-full bg-ink border border-white/20 p-3"/></label><label className="block text-xs text-muted uppercase tracking-wider mt-4 mb-2">Description<textarea name="description" defaultValue={editing.description} className="mt-2 w-full bg-ink border border-white/20 p-3 h-20"/></label><div className="grid grid-cols-2 gap-3 mt-4"><label className="text-xs text-muted uppercase">Priority<select name="priority" defaultValue={editing.priority} className="mt-2 w-full bg-ink border border-white/20 p-3"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label className="text-xs text-muted uppercase">Minutes<input name="estimate" type="number" min="1" max="240" defaultValue={editing.estimate} className="mt-2 w-full bg-ink border border-white/20 p-3"/></label></div><button className="mt-6 bg-lime text-ink px-5 py-3 font-semibold w-full">SAVE TASK</button></form></div>}</section>;
}
function Analytics({ sessions, weekly, achievements }: { sessions: Session[]; weekly: { day: string; minutes: number }[]; achievements: AppData['achievements'] }) {
  return <section><div className="text-lime text-xs tracking-[.25em] uppercase mb-3">Evidence, not vibes</div><h1 className="font-display text-5xl font-bold mb-10">Analytics<span className="text-lime">.</span></h1><div className="grid lg:grid-cols-[1.5fr_1fr] gap-5"><div className="border border-white/15 bg-[#141414] p-5"><h2 className="font-display text-xl mb-6">Focus minutes / last 7 days</h2>{sessions.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={weekly}><CartesianGrid stroke="#ffffff12" vertical={false}/><XAxis dataKey="day" stroke="#9b9b95" tickLine={false} axisLine={false}/><YAxis stroke="#9b9b95" tickLine={false} axisLine={false}/><Tooltip contentStyle={{ background: '#1e1e1e', border: '1px solid #ffffff33' }}/><Bar dataKey="minutes" fill="#c6ff4a" /></BarChart></ResponsiveContainer></div> : <div className="h-64 grid place-items-center text-muted text-sm text-center">Complete a focus session to make<br/>this chart honest.</div>}</div><div className="border border-white/15 p-5"><h2 className="font-display text-xl mb-6">Achievements</h2>{achievements.length ? achievements.map(a => <div key={a.id} className="flex gap-3 border-t border-white/10 py-4"><Trophy className="text-lime shrink-0" size={20}/><div><div className="font-medium">{a.title}</div><div className="text-xs text-muted">{a.description}</div></div></div>) : <div className="text-muted text-sm">Your trophy shelf is empty. A session seems like a good start.</div>}</div></div><div className="mt-8 text-xs text-muted">{sessions.length} recorded session{sessions.length === 1 ? '' : 's'} · Stored only on this device · Not scientific proof of productivity.</div></section>;
}
function Settings({ settings, cameraState, onSetting, onCamera }: { settings: AppData['settings']; cameraState: string; onSetting: (p: Partial<AppData['settings']>) => void; onCamera: () => void }) {
  return <section className="max-w-3xl"><div className="text-lime text-xs tracking-[.25em] uppercase mb-3">Preferences</div><h1 className="font-display text-5xl font-bold mb-10">Settings<span className="text-lime">.</span></h1><div className="border border-white/15 divide-y divide-white/10"><Setting label="Roast intensity" hint="How much truth can you handle?"><select value={settings.intensity} onChange={e => onSetting({ intensity: e.target.value as Intensity })} className="bg-ink border border-white/20 p-2"><option value="mild">Mild</option><option value="savage">Savage</option><option value="unhinged">Unhinged</option></select></Setting><Setting label="Default focus duration" hint="Adjust the protocol"><input aria-label="Default focus duration" type="number" min="1" max="120" value={settings.duration} onChange={e => onSetting({ duration: Number(e.target.value) || 25 })} className="bg-ink border border-white/20 p-2 w-20"/> <span className="text-muted text-sm">minutes</span></Setting><Setting label="Spoken roasts" hint={'speechSynthesis' in window ? 'Conversational browser voice; no account required' : 'Not supported in this browser'}><Toggle checked={settings.speech} onChange={() => onSetting({ speech: !settings.speech })} icon={settings.speech ? <Volume2 size={16}/> : <VolumeX size={16}/>} /></Setting><Setting label="Focus chimes" hint="Short local cues: 3 under 10m, 5 at 25m, 10 at 1h"><Toggle checked={settings.sounds} onChange={() => onSetting({ sounds: !settings.sounds })} icon={settings.sounds ? <Volume2 size={16}/> : <VolumeX size={16}/>} /></Setting><Setting label="Chaos Mode" hint="Reversible visual interruptions"><Toggle checked={settings.chaos} onChange={() => onSetting({ chaos: !settings.chaos })} /></Setting><Setting label="Optional webcam monitoring" hint="Permission is requested only when you press enable. No frames are saved or uploaded."><button onClick={onCamera} className={`px-3 py-2 text-sm ${cameraState === 'on' ? 'bg-lime text-ink' : 'border border-white/20'}`}><Camera size={15} className="inline mr-2"/>{cameraState === 'loading' ? 'Requesting…' : cameraState === 'on' ? 'Stop camera' : 'Enable camera'}</button>{cameraState === 'error' && <div className="text-coral text-xs mt-2">Camera unavailable or model loading failed. Focus still works normally.</div>}{cameraState === 'on' && <div className="text-lime text-xs mt-2">Camera active. During Focus, no-face detection warns after 3 seconds.</div>}</Setting></div><div className="mt-8 border-l-2 border-lime pl-4 text-sm text-muted">Privacy baseline: tasks, preferences, sessions, and achievements never leave this browser. Camera monitoring is opt-in and stops when disabled.</div></section>;
}
function Setting({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) { return <div className="p-5 flex flex-wrap justify-between items-center gap-4"><div><div className="font-medium">{label}</div><div className="text-xs text-muted mt-1">{hint}</div></div><div>{children}</div></div> }
function Toggle({ checked, onChange, icon }: { checked: boolean; onChange: () => void; icon?: React.ReactNode }) { return <button aria-pressed={checked} onClick={onChange} className={`px-3 py-2 text-sm ${checked ? 'bg-lime text-ink' : 'border border-white/20 text-muted'}`}>{icon}{checked ? ' On' : ' Off'}</button> }
function Onboarding({ settings, onSave }: { settings: AppData['settings']; onSave: (s: Partial<AppData['settings']>) => void }) {
  const [local, setLocal] = useState(settings); return <div className="fixed inset-0 z-50 bg-ink grid place-items-center p-5"><div className="max-w-xl w-full"><div className="text-lime text-xs tracking-[.3em] uppercase mb-5">Welcome to the intervention</div><h1 className="font-display text-5xl md:text-7xl font-bold leading-[.9] mb-6">Do the thing.<br/><span className="text-muted">We’ll be annoying.</span></h1><p className="text-muted max-w-md mb-8">Procrasti-Mate is a local-first focus companion with a timer, real task history, and just enough sarcasm to keep you honest.</p><div className="grid sm:grid-cols-2 gap-3 mb-8"><label className="border border-white/20 p-4 text-sm">Roast intensity<select value={local.intensity} onChange={e => setLocal({ ...local, intensity: e.target.value as Intensity })} className="block mt-3 bg-ink border border-white/20 p-2 w-full"><option value="mild">Mild</option><option value="savage">Savage</option><option value="unhinged">Unhinged</option></select></label><label className="border border-white/20 p-4 text-sm">Focus minutes<input type="number" min="1" max="120" value={local.duration} onChange={e => setLocal({ ...local, duration: Number(e.target.value) })} className="block mt-3 bg-ink border border-white/20 p-2 w-full"/></label></div><button onClick={() => onSave(local)} className="bg-lime text-ink px-6 py-3 font-semibold">ENTER THE CONTROL ROOM <ChevronRight className="inline" size={17}/></button></div></div>;
}
