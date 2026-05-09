// ========== Web Audio API 音频管理工具 ==========

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// ========== 音量管理 ==========

const VOLUME_KEY = 'heritage_audio_volume';
const MUTE_KEY = 'heritage_audio_muted';

export function getVolume(): number {
  const v = localStorage.getItem(VOLUME_KEY);
  return v ? parseFloat(v) : 0.5;
}

export function setVolume(v: number): void {
  localStorage.setItem(VOLUME_KEY, String(Math.max(0, Math.min(1, v))));
}

export function isMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === 'true';
}

export function setMuted(m: boolean): void {
  localStorage.setItem(MUTE_KEY, String(m));
}

// ========== 音效类型 ==========

export type SoundEffectType =
  | 'click'        // 按钮点击音效（短促的"叮"声）
  | 'navigate'     // 页面切换音效（柔和的过渡音）
  | 'travel'       // 时空穿梭音效（低频到高频的扫描声）
  | 'send'         // 消息发送音效（短促的"嗖"声）
  | 'reply'        // AI 回复完成音效（柔和的提示音）
  ;

// ========== 基础音效播放 ==========

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.1,
  delay: number = 0
): void {
  if (isMuted()) return;
  const ctx = getAudioContext();
  const masterVolume = getVolume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);

  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume * masterVolume, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

// ========== 各类音效实现 ==========

export function playClickSound(): void {
  // 短促的"叮"声：高频正弦波，快速衰减
  playTone(1200, 0.1, 'sine', 0.08);
  playTone(1800, 0.08, 'sine', 0.04, 0.02);
}

export function playNavigateSound(): void {
  // 柔和的过渡音：两个音阶的平滑过渡
  playTone(523, 0.2, 'sine', 0.06);  // C5
  playTone(659, 0.2, 'sine', 0.06, 0.08);  // E5
  playTone(784, 0.25, 'sine', 0.05, 0.16);  // G5
}

export function playTravelSound(): void {
  // 低频到高频的扫描声
  if (isMuted()) return;
  const ctx = getAudioContext();
  const masterVolume = getVolume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 2);

  gain.gain.setValueAtTime(0.08 * masterVolume, ctx.currentTime);
  gain.gain.setValueAtTime(0.08 * masterVolume, ctx.currentTime + 1.5);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2);

  // 叠加高频闪烁
  playTone(3000, 0.15, 'triangle', 0.03, 0.5);
  playTone(3500, 0.12, 'triangle', 0.03, 1.0);
  playTone(4000, 0.1, 'triangle', 0.04, 1.5);
}

export function playSendSound(): void {
  // 短促的"嗖"声：快速上升的频率
  if (isMuted()) return;
  const ctx = getAudioContext();
  const masterVolume = getVolume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);

  gain.gain.setValueAtTime(0.06 * masterVolume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

export function playReplySound(): void {
  // 柔和的提示音：两个和谐的音符
  playTone(880, 0.15, 'sine', 0.06);   // A5
  playTone(1100, 0.2, 'sine', 0.05, 0.1);  // C#6
}

// ========== 统一播放接口 ==========

export function playSound(type: SoundEffectType): void {
  switch (type) {
    case 'click':
      playClickSound();
      break;
    case 'navigate':
      playNavigateSound();
      break;
    case 'travel':
      playTravelSound();
      break;
    case 'send':
      playSendSound();
      break;
    case 'reply':
      playReplySound();
      break;
  }
}

// ========== 背景音乐（环境音） ==========

let bgMusicNodes: {
  osc1: OscillatorNode | null;
  osc2: OscillatorNode | null;
  gain1: GainNode | null;
  gain2: GainNode | null;
  lfo: OscillatorNode | null;
  lfoGain: GainNode | null;
  shimmerOsc: OscillatorNode | null;
  shimmerGain: GainNode | null;
  shimmerTimer: ReturnType<typeof setInterval> | null;
} = {
  osc1: null,
  osc2: null,
  gain1: null,
  gain2: null,
  lfo: null,
  lfoGain: null,
  shimmerOsc: null,
  shimmerGain: null,
  shimmerTimer: null,
};

let bgMusicActive = false;

export function startBackgroundMusic(): void {
  if (bgMusicActive) return;
  if (isMuted()) return;

  const ctx = getAudioContext();
  const masterVolume = getVolume();

  // 低频嗡鸣（基音）
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(80, ctx.currentTime);
  gain1.gain.setValueAtTime(0.03 * masterVolume, ctx.currentTime);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start();

  // 低频嗡鸣（泛音）
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(120, ctx.currentTime);
  gain2.gain.setValueAtTime(0.015 * masterVolume, ctx.currentTime);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start();

  // LFO 调制（让低频嗡鸣有微妙的起伏）
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
  lfoGain.gain.setValueAtTime(10, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);
  lfo.start();

  // 偶尔的高频闪烁
  const shimmerTimer = setInterval(() => {
    if (isMuted() || !bgMusicActive) return;
    const shimmerCtx = getAudioContext();
    const shimmerVol = getVolume();
    const shimmerOsc = shimmerCtx.createOscillator();
    const shimmerGain = shimmerCtx.createGain();
    const freq = 2000 + Math.random() * 3000;
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(freq, shimmerCtx.currentTime);
    shimmerGain.gain.setValueAtTime(0, shimmerCtx.currentTime);
    shimmerGain.gain.linearRampToValueAtTime(0.015 * shimmerVol, shimmerCtx.currentTime + 0.3);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, shimmerCtx.currentTime + 1.5);
    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(shimmerCtx.destination);
    shimmerOsc.start();
    shimmerOsc.stop(shimmerCtx.currentTime + 1.5);
  }, 3000 + Math.random() * 4000);

  bgMusicNodes = { osc1, osc2, gain1, gain2, lfo, lfoGain, shimmerOsc: null, shimmerGain: null, shimmerTimer };
  bgMusicActive = true;
}

export function stopBackgroundMusic(): void {
  if (!bgMusicActive) return;

  const { osc1, osc2, lfo, shimmerTimer } = bgMusicNodes;

  try { osc1?.stop(); } catch (_e) { /* ignore */ }
  try { osc2?.stop(); } catch (_e) { /* ignore */ }
  try { lfo?.stop(); } catch (_e) { /* ignore */ }
  if (shimmerTimer) clearInterval(shimmerTimer);

  bgMusicNodes = {
    osc1: null, osc2: null, gain1: null, gain2: null,
    lfo: null, lfoGain: null, shimmerOsc: null, shimmerGain: null, shimmerTimer: null,
  };
  bgMusicActive = false;
}

export function isBackgroundMusicActive(): boolean {
  return bgMusicActive;
}

// 更新音量时调整背景音乐音量
export function updateBackgroundMusicVolume(): void {
  if (!bgMusicActive) return;
  const masterVolume = getVolume();
  if (bgMusicNodes.gain1) {
    bgMusicNodes.gain1.gain.setValueAtTime(0.03 * masterVolume, getAudioContext().currentTime);
  }
  if (bgMusicNodes.gain2) {
    bgMusicNodes.gain2.gain.setValueAtTime(0.015 * masterVolume, getAudioContext().currentTime);
  }
}

// 更新音量时调整背景音乐音量
export function updateBackgroundMusicVolume(): void {
  if (!bgMusicActive) return;
  const masterVolume = getVolume();
  if (bgMusicNodes.gain1) {
    bgMusicNodes.gain1.gain.setValueAtTime(0.03 * masterVolume, getAudioContext().currentTime);
  }
  if (bgMusicNodes.gain2) {
    bgMusicNodes.gain2.gain.setValueAtTime(0.015 * masterVolume, getAudioContext().currentTime);
  }
}

// ========== 初始化（恢复用户偏好） ==========

export function initAudio(): void {
  // 如果用户没有静音，自动开始背景音乐
  if (!isMuted()) {
    // 需要用户交互后才能播放，所以延迟到第一次点击
  }
}

// 在用户第一次交互时调用
let audioInitialized = false;
export function initAudioOnInteraction(): void {
  if (audioInitialized) return;
  audioInitialized = true;
  if (!isMuted()) {
    startBackgroundMusic();
  }
}

// ========== 切换静音 ==========

export function toggleMute(): boolean {
  const newMuted = !isMuted();
  setMuted(newMuted);
  if (newMuted) {
    stopBackgroundMusic();
  } else {
    startBackgroundMusic();
  }
  return newMuted;
}
