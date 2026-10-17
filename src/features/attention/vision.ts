/**
 * Optional, local-only MediaPipe adapter. The app deliberately treats model
 * loading as an enhancement: a blocked model/CDN must never block the timer.
 */
export type VisionSignal = { facePresent: boolean; yaw: number };
export type VisionDetector = { detectForVideo: (video: HTMLVideoElement, timestamp: number) => unknown; close: () => void };
export async function createVisionDetector() {
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' },
    runningMode: 'VIDEO', numFaces: 1
  }) as unknown as VisionDetector;
}
export function readVisionSignal(result: { faceLandmarks?: Array<Array<{ x: number }>> }): VisionSignal {
  const face = result.faceLandmarks?.[0];
  if (!face?.length) return { facePresent: false, yaw: 0 };
  const nose = face[1]?.x ?? 0.5;
  return { facePresent: true, yaw: Math.round((nose - 0.5) * 180) };
}
