import type { Achievement, Session, Task } from '../types';
export function awardAchievements(sessions: Session[], tasks: Task[], current: Achievement[]): Achievement[] {
  const ids = new Set(current.map(a => a.id)); const completed = sessions.filter(s => s.completed); const result = [...current];
  const add = (id: string, title: string, description: string) => { if (!ids.has(id)) result.push({ id, title, description, unlockedAt: Date.now() }); };
  if (completed.length) add('first-blood', 'First Blood', 'Complete your first focus session.');
  if (completed.some(s => s.duration >= 25 * 60)) add('locked-in', 'Locked In', 'Complete a 25-minute session.');
  if (completed.some(s => s.distractions === 0)) add('unbothered', 'Unbothered', 'Complete a session without a distraction.');
  if (completed.some(s => s.distractions > 1 && s.taskId && tasks.some(t => t.id === s.taskId && t.completed))) add('redemption', 'Redemption Arc', 'Complete a task after multiple distractions.');
  return result;
}
