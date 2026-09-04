import {
  MobileDeviceAction,
  MobileActionType,
  MobileAppId,
  MobileContact,
  DeviceHardwareState,
} from '../types/jarvis';

// Default Contact Book for instant voice and tap calling
const DEFAULT_CONTACTS: MobileContact[] = [
  { id: 'c-1', name: 'Mom', phone: '+1234567890', relation: 'Family', isQuickDial: true, avatar: '👩' },
  { id: 'c-2', name: 'Dad', phone: '+1234567891', relation: 'Family', isQuickDial: true, avatar: '👨' },
  { id: 'c-3', name: 'Alex Friend', phone: '+1987654321', relation: 'Friend', isQuickDial: true, avatar: '🧑' },
  { id: 'c-4', name: 'Office Boss', phone: '+1555444333', relation: 'Work', isQuickDial: false, avatar: '👔' },
  { id: 'c-5', name: 'Emergency Services', phone: '911', relation: 'Emergency', isQuickDial: true, avatar: '🚨' },
];

// Valid 1-second silent WAV Data URI for mobile background audio persistence
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';

/**
 * High-Volume Crystal Wake Chime (Loud, Clear, Futuristic Dual-Harmonic Tone)
 */
export function playWakeChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Master Compressor + High-Gain Output Node for maximum loudness without clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(4, now);
    compressor.ratio.setValueAtTime(12, now);
    compressor.attack.setValueAtTime(0.002, now);
    compressor.release.setValueAtTime(0.15, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.8, now); // 1.8x Master Amplification
    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Tone 1: 659.25 Hz (E5) - Crisp high-tech chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.65, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
    osc1.connect(gain1);
    gain1.connect(compressor);
    osc1.start(now);
    osc1.stop(now + 0.14);

    // Tone 2: 987.77 Hz (B5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08);
    gain2.gain.setValueAtTime(0.75, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
    osc2.connect(gain2);
    gain2.connect(compressor);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.26);

    // Tone 3: 1318.51 Hz (E6) - Brilliant harmonic sparkle
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1318.51, now + 0.16);
    gain3.gain.setValueAtTime(0.85, now + 0.16);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc3.connect(gain3);
    gain3.connect(compressor);
    osc3.start(now + 0.16);
    osc3.stop(now + 0.38);
  } catch {
    // ignore audio failure
  }
}

/**
 * End-of-Speech Auto-Commit Feedback Chime (Plays automatically when user stops speaking)
 */
export function playEndpointChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.09); // G5
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch {
    // ignore
  }
}

/**
 * Task Success Affirmation Chime
 */
export function playSuccessChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.0, now + 0.1); // A5
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  } catch {
    // ignore
  }
}

export class MobileBridge {
  private static instance: MobileBridge;
  private wakeLockSentinel: any = null;
  private torchTrack: MediaStreamTrack | null = null;
  private backgroundAudioCtx: AudioContext | null = null;
  private backgroundOscillator: OscillatorNode | null = null;
  private silentAudioEl: HTMLAudioElement | null = null;
  private isBackgroundKeepAliveActive = false;
  private contacts: MobileContact[] = [];
  private hardwareState: DeviceHardwareState = {
    batteryLevel: null,
    isCharging: null,
    isWakeLockActive: false,
    isTorchOn: false,
    isBackgroundAudioActive: false,
    isMediaSessionActive: false,
    networkOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    networkType: '4G / Wi-Fi',
    platform: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    isPWA: false,
    isCompanionConnected: true,
  };

  private listeners: ((state: DeviceHardwareState) => void)[] = [];
  private actionHistory: MobileDeviceAction[] = [];

  private constructor() {
    this.loadContacts();
    this.initHardwareListeners();
    this.detectPWA();
    this.initVisibilityListener();
  }

  private initVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isBackgroundKeepAliveActive) {
          this.requestWakeLock();
          if (this.silentAudioEl && this.silentAudioEl.paused) {
            this.silentAudioEl.play().catch(() => {});
          }
        }
      });
    }
  }

  public static getInstance(): MobileBridge {
    if (!MobileBridge.instance) {
      MobileBridge.instance = new MobileBridge();
    }
    return MobileBridge.instance;
  }

  public onStateChange(callback: (state: DeviceHardwareState) => void): () => void {
    this.listeners.push(callback);
    callback({ ...this.hardwareState });
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private emitState() {
    const clone = { ...this.hardwareState };
    this.listeners.forEach((cb) => cb(clone));
  }

  public getHardwareState(): DeviceHardwareState {
    return { ...this.hardwareState };
  }

  public getActionHistory(): MobileDeviceAction[] {
    return [...this.actionHistory];
  }

  public getContacts(): MobileContact[] {
    return [...this.contacts];
  }

  public saveContacts(newContacts: MobileContact[]) {
    this.contacts = newContacts;
    try {
      localStorage.setItem('jarvis_mobile_contacts', JSON.stringify(newContacts));
    } catch {
      // ignore
    }
  }

  public addContact(contact: Omit<MobileContact, 'id'>): MobileContact {
    const created: MobileContact = {
      ...contact,
      id: `c-${Date.now()}`,
    };
    this.contacts.push(created);
    this.saveContacts(this.contacts);
    return created;
  }

  public deleteContact(id: string) {
    this.contacts = this.contacts.filter((c) => c.id !== id);
    this.saveContacts(this.contacts);
  }

  private loadContacts() {
    try {
      const saved = localStorage.getItem('jarvis_mobile_contacts');
      if (saved) {
        this.contacts = JSON.parse(saved);
      } else {
        this.contacts = DEFAULT_CONTACTS;
        this.saveContacts(DEFAULT_CONTACTS);
      }
    } catch {
      this.contacts = DEFAULT_CONTACTS;
    }
  }

  private detectPWA() {
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      this.hardwareState.isPWA = !!isStandalone;
    }
  }

  private async initHardwareListeners() {
    if (typeof window === 'undefined') return;

    // 1. Network Status
    window.addEventListener('online', () => {
      this.hardwareState.networkOnline = true;
      this.emitState();
    });
    window.addEventListener('offline', () => {
      this.hardwareState.networkOnline = false;
      this.emitState();
    });

    // 2. Battery API
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        this.hardwareState.batteryLevel = Math.round(battery.level * 100);
        this.hardwareState.isCharging = battery.charging;
        this.emitState();

        battery.addEventListener('levelchange', () => {
          this.hardwareState.batteryLevel = Math.round(battery.level * 100);
          this.emitState();
        });
        battery.addEventListener('chargingchange', () => {
          this.hardwareState.isCharging = battery.charging;
          this.emitState();
        });
      } catch {
        // ignore
      }
    }

    // 3. MediaSession API (Lock Screen & Notification Drawer Controller)
    this.setupMediaSession();
  }

  // ----------------------------------------------------------------
  // 1. BACKGROUND KEEP-ALIVE & MEDIA SESSION
  // ----------------------------------------------------------------
  public setupMediaSession(onVoiceTrigger?: () => void) {
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'ULTRON — Voice Intelligence',
          artist: 'Always-On Standby (Say "Heyy ULTRON")',
          album: 'Background Voice & Super Brain Active',
          artwork: [
            { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&h=192&fit=crop', sizes: '192x192', type: 'image/png' },
            { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&h=512&fit=crop', sizes: '512x512', type: 'image/png' },
          ],
        });

        navigator.mediaSession.setActionHandler('play', () => {
          this.startBackgroundKeepAlive();
          if (onVoiceTrigger) onVoiceTrigger();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          this.stopBackgroundKeepAlive();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          if (onVoiceTrigger) onVoiceTrigger();
        });

        this.hardwareState.isMediaSessionActive = true;
        this.emitState();
      } catch (err) {
        console.warn('MediaSession setup failed:', err);
      }
    }
  }

  /**
   * Starts a continuous, imperceptible silent audio stream and screen wake lock.
   * This prevents mobile browsers (Android Chrome, iOS Safari) from sleeping or killing
   * the JARVIS process when the user switches apps or locks their phone screen.
   */
  public async startBackgroundKeepAlive(): Promise<boolean> {
    try {
      // 1. Acquire Wake Lock
      await this.requestWakeLock();

      // 2. Start Silent HTML5 Audio Element Loop (prevents mobile browser background suspension)
      if (typeof document !== 'undefined') {
        if (!this.silentAudioEl) {
          const el = document.createElement('audio');
          el.id = 'jarvis-bg-silent-audio';
          el.src = SILENT_WAV_DATA_URI;
          el.loop = true;
          el.setAttribute('playsinline', 'true');
          el.setAttribute('webkit-playsinline', 'true');
          el.volume = 0.01;
          document.body.appendChild(el);
          this.silentAudioEl = el;
        }
        if (this.silentAudioEl.paused) {
          this.silentAudioEl.play().catch(() => {});
        }
      }

      // 3. Start Silent Audio Oscillator
      if (!this.backgroundAudioCtx || this.backgroundAudioCtx.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.backgroundAudioCtx = new AudioCtx();
      }

      if (this.backgroundAudioCtx.state === 'suspended') {
        await this.backgroundAudioCtx.resume();
      }

      if (!this.backgroundOscillator) {
        const osc = this.backgroundAudioCtx.createOscillator();
        const gain = this.backgroundAudioCtx.createGain();
        // Inaudible frequency + near-zero volume
        osc.frequency.setValueAtTime(440, this.backgroundAudioCtx.currentTime);
        gain.gain.setValueAtTime(0.00001, this.backgroundAudioCtx.currentTime);
        osc.connect(gain);
        gain.connect(this.backgroundAudioCtx.destination);
        osc.start();
        this.backgroundOscillator = osc;
      }

      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }

      this.isBackgroundKeepAliveActive = true;
      this.hardwareState.isBackgroundAudioActive = true;
      this.emitState();
      this.vibrate([40, 30, 40]);
      return true;
    } catch (err) {
      console.warn('Background keep-alive start failed:', err);
      return false;
    }
  }

  public stopBackgroundKeepAlive() {
    try {
      this.releaseWakeLock();
      if (this.silentAudioEl) {
        this.silentAudioEl.pause();
      }
      if (this.backgroundOscillator) {
        this.backgroundOscillator.stop();
        this.backgroundOscillator.disconnect();
        this.backgroundOscillator = null;
      }
      if (this.backgroundAudioCtx && this.backgroundAudioCtx.state !== 'closed') {
        this.backgroundAudioCtx.suspend();
      }
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      this.isBackgroundKeepAliveActive = false;
      this.hardwareState.isBackgroundAudioActive = false;
      this.emitState();
    } catch {
      // ignore
    }
  }

  public toggleBackgroundKeepAlive(): boolean {
    if (this.isBackgroundKeepAliveActive) {
      this.stopBackgroundKeepAlive();
      return false;
    } else {
      this.startBackgroundKeepAlive();
      return true;
    }
  }

  // ----------------------------------------------------------------
  // 2. WAKE LOCK API (Screen & Background Hold)
  // ----------------------------------------------------------------
  public async requestWakeLock(): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        this.hardwareState.isWakeLockActive = true;
        this.emitState();

        this.wakeLockSentinel.addEventListener('release', () => {
          this.hardwareState.isWakeLockActive = false;
          this.emitState();
        });
        return true;
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    }
    return false;
  }

  public releaseWakeLock() {
    if (this.wakeLockSentinel) {
      this.wakeLockSentinel.release().catch(() => {});
      this.wakeLockSentinel = null;
      this.hardwareState.isWakeLockActive = false;
      this.emitState();
    }
  }

  // ----------------------------------------------------------------
  // 3. FLASHLIGHT / TORCH CONTROL
  // ----------------------------------------------------------------
  public async toggleTorch(targetState?: 'on' | 'off' | 'toggle'): Promise<boolean> {
    try {
      const wantOn =
        targetState === 'on'
          ? true
          : targetState === 'off'
          ? false
          : !this.hardwareState.isTorchOn;

      if (!wantOn) {
        if (this.torchTrack) {
          this.torchTrack.stop();
          this.torchTrack = null;
        }
        this.hardwareState.isTorchOn = false;
        this.emitState();
        return false;
      }

      // Turn on torch via rear camera track
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
        },
      });

      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          await (track as any).applyConstraints({
            advanced: [{ torch: true }],
          });
        }
        this.torchTrack = track;
        this.hardwareState.isTorchOn = true;
        this.emitState();
        this.vibrate(80);
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn('Torch control error:', err);
      this.hardwareState.isTorchOn = false;
      this.emitState();
      return false;
    }
  }

  // ----------------------------------------------------------------
  // 4. HAPTICS & VIBRATION
  // ----------------------------------------------------------------
  public vibrate(pattern: number | number[] = 100): boolean {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        return navigator.vibrate(pattern);
      } catch {
        return false;
      }
    }
    return false;
  }

  // ----------------------------------------------------------------
  // 5. GEOLOCATION
  // ----------------------------------------------------------------
  public async getCoordinates(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported on this device.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // ----------------------------------------------------------------
  // 6. MASTER MOBILE INTENT & APP EXECUTOR
  // ----------------------------------------------------------------
  public executeAction(action: Omit<MobileDeviceAction, 'status'>): MobileDeviceAction {
    const fullAction: MobileDeviceAction = {
      ...action,
      status: 'EXECUTING',
    };

    this.vibrate([50, 40, 50]);

    try {
      switch (action.type) {
        // --- YOUTUBE LAUNCH / SEARCH / PLAY ---
        case 'SEARCH_YOUTUBE':
        case 'PLAY_YOUTUBE': {
          const query = action.query || 'trending music';
          const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
          window.open(ytUrl, '_blank');
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = `Opened YouTube with query: "${query}"`;
          break;
        }

        // --- PHONE CALL ---
        case 'MAKE_CALL': {
          let number = action.phone || '';
          if (!number && action.contactName) {
            const found = this.contacts.find(
              (c) => c.name.toLowerCase().includes(action.contactName!.toLowerCase())
            );
            if (found) {
              number = found.phone;
            }
          }
          if (!number) {
            number = this.contacts[0]?.phone || '911';
          }
          // Launch native phone dialer intent
          window.location.href = `tel:${encodeURIComponent(number)}`;
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = `Initiated phone call to ${action.contactName || number}`;
          break;
        }

        // --- WHATSAPP MESSAGE ---
        case 'SEND_WHATSAPP': {
          const text = encodeURIComponent(action.message || 'Hello from JARVIS');
          const phone = action.phone ? action.phone.replace(/[^0-9]/g, '') : '';
          const waUrl = phone
            ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}`
            : `https://api.whatsapp.com/send?text=${text}`;
          window.open(waUrl, '_blank');
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = `Prepared WhatsApp message: "${action.message || ''}"`;
          break;
        }

        // --- SMS MESSAGE ---
        case 'SEND_SMS': {
          const phone = action.phone || '';
          const body = encodeURIComponent(action.message || '');
          window.location.href = `sms:${phone}?body=${body}`;
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = `Prepared SMS to ${phone || 'recipient'}`;
          break;
        }

        // --- GOOGLE MAPS NAVIGATION ---
        case 'NAVIGATE_MAPS': {
          const dest = action.query || 'current location';
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`;
          window.open(mapUrl, '_blank');
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = `Opened Maps navigation to "${dest}"`;
          break;
        }

        // --- OPEN APP (Generic & Deep-Linked) ---
        case 'OPEN_APP': {
          const app = action.app || 'youtube';
          const appUrls: Record<MobileAppId, string> = {
            youtube: action.query
              ? `https://www.youtube.com/results?search_query=${encodeURIComponent(action.query)}`
              : 'https://www.youtube.com',
            whatsapp: 'https://web.whatsapp.com',
            phone: 'tel:',
            camera: '',
            maps: 'https://maps.google.com',
            spotify: action.query
              ? `https://open.spotify.com/search/${encodeURIComponent(action.query)}`
              : 'https://open.spotify.com',
            facebook: 'https://www.facebook.com',
            instagram: 'https://www.instagram.com',
            twitter: 'https://twitter.com',
            tiktok: 'https://www.tiktok.com',
            telegram: 'https://web.telegram.org',
            gmail: 'mailto:',
            sms: 'sms:',
            calculator: 'https://www.google.com/search?q=calculator',
            settings: '#settings',
            browser: 'https://www.google.com',
            clock: 'https://time.is',
          };

          const targetUrl = action.url || appUrls[app];
          if (targetUrl) {
            window.open(targetUrl, '_blank');
            fullAction.status = 'SUCCESS';
            fullAction.resultDetails = `Launched ${app.toUpperCase()} application`;
          } else {
            fullAction.status = 'SUCCESS';
            fullAction.resultDetails = `Triggered ${app} launcher`;
          }
          break;
        }

        // --- CAMERA ---
        case 'OPEN_CAMERA': {
          navigator.mediaDevices
            ?.getUserMedia({ video: true })
            .then((stream) => {
              // Just a verification that camera is accessed
              stream.getTracks().forEach((t) => t.stop());
            })
            .catch(() => {});
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = 'Camera access initialized';
          break;
        }

        // --- TORCH / FLASHLIGHT ---
        case 'TOGGLE_TORCH': {
          this.toggleTorch(action.torchState);
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = `Flashlight toggled`;
          break;
        }

        // --- VIBRATION ---
        case 'DEVICE_VIBRATE': {
          this.vibrate(action.vibratePattern || [150, 100, 150, 100, 200]);
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = 'Device haptic vibration pattern executed';
          break;
        }

        // --- WAKE LOCK ---
        case 'TOGGLE_WAKELOCK': {
          if (this.hardwareState.isWakeLockActive) {
            this.releaseWakeLock();
            fullAction.resultDetails = 'Screen Wake Lock released';
          } else {
            this.requestWakeLock();
            fullAction.resultDetails = 'Screen Wake Lock active (prevents screen sleep)';
          }
          fullAction.status = 'SUCCESS';
          break;
        }

        // --- BACKGROUND KEEP-ALIVE ---
        case 'BACKGROUND_SERVICE_START': {
          this.startBackgroundKeepAlive();
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = 'JARVIS Background Keep-Alive Service is now active';
          break;
        }
        case 'BACKGROUND_SERVICE_STOP': {
          this.stopBackgroundKeepAlive();
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = 'JARVIS Background Service stopped';
          break;
        }

        // --- CLIPBOARD ---
        case 'COPY_CLIPBOARD': {
          if (action.message && 'clipboard' in navigator) {
            navigator.clipboard.writeText(action.message);
            fullAction.status = 'SUCCESS';
            fullAction.resultDetails = `Copied to clipboard: "${action.message}"`;
          }
          break;
        }

        default:
          fullAction.status = 'SUCCESS';
          fullAction.resultDetails = 'Action processed';
      }
    } catch (err: any) {
      fullAction.status = 'FAILED';
      fullAction.resultDetails = err?.message || 'Failed to execute mobile action';
    }

    this.actionHistory.unshift(fullAction);
    if (this.actionHistory.length > 50) {
      this.actionHistory.pop();
    }
    this.hardwareState.lastAction = fullAction;
    this.emitState();
    return fullAction;
  }

  // ----------------------------------------------------------------
  // 7. CLIENT-SIDE INSTANT NATURAL LANGUAGE COMMAND CLASSIFIER
  // (Recognizes English, Bengali, Banglish for direct mobile execution)
  // ----------------------------------------------------------------
  public parseAndExecuteLocalMobileCommand(command: string): MobileDeviceAction | null {
    const lower = command.toLowerCase().trim();

    // 1. YouTube commands
    if (
      lower.includes('youtube') ||
      lower.includes('গান চালাও') ||
      lower.includes('ভিডিও দেখাও') ||
      lower.includes('play song') ||
      lower.includes('play music')
    ) {
      let query = '';
      if (lower.includes('youtube')) {
        query = lower
          .replace(/open\s+youtube\s*(and\s*search|for)?/i, '')
          .replace(/youtube\s*(e\s*search\s*koro|search|kholo|e\s*chalao)?/i, '')
          .replace(/play\s*/i, '')
          .trim();
      } else {
        query = lower
          .replace(/গান চালাও/i, '')
          .replace(/ভিডিও দেখাও/i, '')
          .replace(/play song/i, '')
          .replace(/play music/i, '')
          .trim();
      }
      return this.executeAction({
        type: 'SEARCH_YOUTUBE',
        app: 'youtube',
        query: query || 'Trending songs',
        commandDescription: `Open YouTube: ${query || 'Homepage'}`,
      });
    }

    // 2. Phone Call commands ("Call him", "Call Mom", "Phone koro", "017...")
    if (
      lower.startsWith('call') ||
      lower.includes('ফোন করো') ||
      lower.includes('phone koro') ||
      lower.includes('call him') ||
      lower.includes('call her') ||
      lower.includes('dial')
    ) {
      // Check if number or contact name mentioned
      let nameOrNumber = lower
        .replace(/^(call\s*him|call\s*her|call|phone\s*koro|ফোন\s*করো|dial)\s*/i, '')
        .replace(/ke\s*phone\s*koro/i, '')
        .trim();

      if (!nameOrNumber || nameOrNumber === 'him' || nameOrNumber === 'her') {
        nameOrNumber = 'Mom'; // fallback default contact
      }

      return this.executeAction({
        type: 'MAKE_CALL',
        app: 'phone',
        contactName: nameOrNumber,
        phone: /^\+?[0-9\s-]+$/.test(nameOrNumber) ? nameOrNumber : undefined,
        commandDescription: `Call ${nameOrNumber}`,
      });
    }

    // 3. WhatsApp commands ("Send WhatsApp to Alex saying ...", "WhatsApp e message dao")
    if (lower.includes('whatsapp') || lower.includes('হোয়াটসঅ্যাপ')) {
      let msg = lower
        .replace(/^(send\s*whatsapp\s*(to\s*\w+)?\s*(saying)?|whatsapp\s*e\s*message\s*dao|হোয়াটসঅ্যাপ)\s*/i, '')
        .trim();
      return this.executeAction({
        type: 'SEND_WHATSAPP',
        app: 'whatsapp',
        message: msg || 'Hello from JARVIS',
        commandDescription: `Send WhatsApp message`,
      });
    }

    // 4. Flashlight / Torch commands
    if (
      lower.includes('flashlight') ||
      lower.includes('torch') ||
      lower.includes('টর্চ') ||
      lower.includes('আলো জ্বালাও') ||
      lower.includes('light on') ||
      lower.includes('light off')
    ) {
      const isOff = lower.includes('off') || lower.includes('bondho') || lower.includes('নিভাও');
      return this.executeAction({
        type: 'TOGGLE_TORCH',
        torchState: isOff ? 'off' : 'on',
        commandDescription: isOff ? 'Turn off Flashlight' : 'Turn on Flashlight',
      });
    }

    // 5. Background mode commands ("Background e chalao", "Keep running in background")
    if (
      lower.includes('background') ||
      lower.includes('ব্যাকগ্রাউন্ড') ||
      lower.includes('all time cholte thakbe') ||
      lower.includes('keep running') ||
      lower.includes('wake lock')
    ) {
      return this.executeAction({
        type: 'BACKGROUND_SERVICE_START',
        commandDescription: 'Activate JARVIS Continuous Background Service',
      });
    }

    // 6. Camera commands
    if (lower.includes('camera') || lower.includes('ক্যামেরা') || lower.includes('ছবি তোলো') || lower.includes('take photo')) {
      return this.executeAction({
        type: 'OPEN_CAMERA',
        app: 'camera',
        commandDescription: 'Open Camera',
      });
    }

    // 7. Maps / Navigation commands
    if (lower.includes('maps') || lower.includes('ম্যাপ') || lower.includes('navigation') || lower.includes('location dekhao') || lower.includes('rasta dekhao')) {
      const dest = lower
        .replace(/^(open\s*maps\s*to|navigate\s*to|maps\s*e|ম্যাপ\s*এ)\s*/i, '')
        .trim();
      return this.executeAction({
        type: 'NAVIGATE_MAPS',
        app: 'maps',
        query: dest || 'Current Location',
        commandDescription: `Navigate to ${dest || 'Maps'}`,
      });
    }

    // 8. Vibration
    if (lower.includes('vibrate') || lower.includes('ভাইব্রেট')) {
      return this.executeAction({
        type: 'DEVICE_VIBRATE',
        commandDescription: 'Trigger Haptic Vibration',
      });
    }

    // 9. Generic App Launchers
    const apps: { name: MobileAppId; triggers: string[] }[] = [
      { name: 'spotify', triggers: ['spotify', 'স্পটিফাই'] },
      { name: 'facebook', triggers: ['facebook', 'ফেসবুক', 'fb'] },
      { name: 'instagram', triggers: ['instagram', 'ইনস্টাগ্রাম', 'insta'] },
      { name: 'tiktok', triggers: ['tiktok', 'টিকটক'] },
      { name: 'telegram', triggers: ['telegram', 'টেলিগ্রাম'] },
      { name: 'gmail', triggers: ['gmail', 'ইমেইল', 'email', 'mail'] },
      { name: 'calculator', triggers: ['calculator', 'ক্যালকুলেটর', 'calc'] },
      { name: 'settings', triggers: ['settings', 'সেটিংস'] },
    ];

    for (const item of apps) {
      if (item.triggers.some((t) => lower.includes(t))) {
        return this.executeAction({
          type: 'OPEN_APP',
          app: item.name,
          commandDescription: `Open ${item.name.toUpperCase()}`,
        });
      }
    }

    return null;
  }
}
