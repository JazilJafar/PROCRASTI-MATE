export type Priority = 'low' | 'medium' | 'high';
export type Intensity = 'mild' | 'savage' | 'unhinged';
export type EventType = 'tab-hidden' | 'tab-return' | 'face-missing' | 'head-turn';
export interface Task { id: string; title: string; description: string; priority: Priority; estimate: number; completed: boolean; createdAt: number; completedAt?: number }
export interface Session { id: string; startedAt: number; endedAt: number; duration: number; taskId?: string; distractions: number; completed: boolean }
export interface Settings { intensity: Intensity; speech: boolean; sounds: boolean; duration: number; camera: boolean; chaos: boolean }
export interface Achievement { id: string; title: string; description: string; unlockedAt: number }
export interface AppData { tasks: Task[]; sessions: Session[]; achievements: Achievement[]; settings: Settings }
