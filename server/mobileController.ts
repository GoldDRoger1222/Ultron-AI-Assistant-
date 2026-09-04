export interface ServerMobileAction {
  type: string;
  app?: string;
  query?: string;
  phone?: string;
  contactName?: string;
  message?: string;
  torchState?: 'on' | 'off' | 'toggle';
  url?: string;
  commandDescription: string;
}

export function parseMobileIntent(
  command: string,
  detectedLanguage: string = 'en'
): {
  isMobileAction: boolean;
  action?: ServerMobileAction;
  spokenResponse?: string;
  textResponse?: string;
} {
  const lower = command.toLowerCase().trim();

  // 1. YouTube Actions
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
        .replace(/^(open\s*youtube\s*(and\s*search|for)?|youtube\s*(e\s*search\s*koro|search|kholo|e\s*chalao)?|play\s*on\s*youtube)\s*/i, '')
        .trim();
    } else {
      query = lower
        .replace(/গান\s*চালাও/i, '')
        .replace(/ভিডিও\s*দেখাও/i, '')
        .replace(/play\s*song/i, '')
        .replace(/play\s*music/i, '')
        .trim();
    }

    const searchQuery = query || 'trending music';
    const isBn = detectedLanguage === 'bn' || /[\u0980-\u09FF]/.test(command) || lower.includes('kholo') || lower.includes('chalao');

    return {
      isMobileAction: true,
      action: {
        type: 'SEARCH_YOUTUBE',
        app: 'youtube',
        query: searchQuery,
        commandDescription: `Open YouTube search: "${searchQuery}"`,
      },
      spokenResponse: isBn
        ? `YouTube e ${searchQuery} open kora hocche.`
        : `Opening YouTube for ${searchQuery}.`,
      textResponse: isBn
        ? `▶️ **YouTube চালু করা হয়েছে:** "${searchQuery}" অনুসন্ধান করা হচ্ছে।`
        : `▶️ **Launching YouTube:** Searching for "${searchQuery}".`,
    };
  }

  // 2. Phone Call Actions ("Call him", "Call Mom", "Phone koro", "017...")
  if (
    lower.startsWith('call') ||
    lower.includes('ফোন করো') ||
    lower.includes('phone koro') ||
    lower.includes('call him') ||
    lower.includes('call her') ||
    lower.includes('dial')
  ) {
    let target = lower
      .replace(/^(call\s*him|call\s*her|call|phone\s*koro|ফোন\s*করো|dial)\s*/i, '')
      .replace(/ke\s*phone\s*koro/i, '')
      .trim();

    if (!target || target === 'him' || target === 'her') {
      target = 'Mom';
    }

    const isBn = detectedLanguage === 'bn' || /[\u0980-\u09FF]/.test(command) || lower.includes('phone koro');

    return {
      isMobileAction: true,
      action: {
        type: 'MAKE_CALL',
        app: 'phone',
        contactName: target,
        phone: /^[0-9+ -]+$/.test(target) ? target : undefined,
        commandDescription: `Initiate phone call to ${target}`,
      },
      spokenResponse: isBn
        ? `${target} ke call kora hocche.`
        : `Initiating call to ${target}.`,
      textResponse: isBn
        ? `📞 **ফোন কল ডায়াল করা হচ্ছে:** ${target}-এর নম্বরে সংযোগ করা হচ্ছে।`
        : `📞 **Connecting Phone Call:** Dialing ${target} now.`,
    };
  }

  // 3. WhatsApp Messages
  if (lower.includes('whatsapp') || lower.includes('হোয়াটসঅ্যাপ')) {
    let msg = lower
      .replace(/^(send\s*whatsapp\s*(to\s*\w+)?\s*(saying)?|whatsapp\s*e\s*message\s*dao|হোয়াটসঅ্যাপ)\s*/i, '')
      .trim();

    const isBn = detectedLanguage === 'bn' || /[\u0980-\u09FF]/.test(command);
    const content = msg || 'Hello from JARVIS';

    return {
      isMobileAction: true,
      action: {
        type: 'SEND_WHATSAPP',
        app: 'whatsapp',
        message: content,
        commandDescription: `Send WhatsApp message: "${content}"`,
      },
      spokenResponse: isBn
        ? 'WhatsApp e message dispatch kora hocche.'
        : 'Preparing WhatsApp message for dispatch.',
      textResponse: isBn
        ? `💬 **WhatsApp বার্তা প্রস্তুত:** "${content}"`
        : `💬 **WhatsApp Intent Prepared:** "${content}"`,
    };
  }

  // 4. Flashlight / Torch
  if (
    lower.includes('flashlight') ||
    lower.includes('torch') ||
    lower.includes('টর্চ') ||
    lower.includes('আলো জ্বালাও') ||
    lower.includes('light on') ||
    lower.includes('light off')
  ) {
    const isOff = lower.includes('off') || lower.includes('bondho') || lower.includes('নিভাও');
    const isBn = detectedLanguage === 'bn' || /[\u0980-\u09FF]/.test(command);

    return {
      isMobileAction: true,
      action: {
        type: 'TOGGLE_TORCH',
        torchState: isOff ? 'off' : 'on',
        commandDescription: isOff ? 'Turn off Flashlight' : 'Turn on Flashlight',
      },
      spokenResponse: isBn
        ? (isOff ? 'Flashlight bondho kora hoyeche.' : 'Flashlight on kora hoyeche.')
        : (isOff ? 'Flashlight deactivated.' : 'Flashlight activated.'),
      textResponse: isOff
        ? `🔦 **Flashlight Status:** Deactivated (Off).`
        : `🔦 **Flashlight Status:** Activated (Torch ON).`,
    };
  }

  // 5. Background Continuous Mode
  if (
    lower.includes('background') ||
    lower.includes('ব্যাকগ্রাউন্ড') ||
    lower.includes('all time') ||
    lower.includes('keep running') ||
    lower.includes('cholte thakbo') ||
    lower.includes('cholte thakbe')
  ) {
    const isBn = detectedLanguage === 'bn' || /[\u0980-\u09FF]/.test(command) || lower.includes('cholte');

    return {
      isMobileAction: true,
      action: {
        type: 'BACKGROUND_SERVICE_START',
        commandDescription: 'Start Continuous Background Service',
      },
      spokenResponse: isBn
        ? 'JARVIS Background Service chalu hoyeche. Ekhon apnar mobile background e sobshomoy active thakbe.'
        : 'JARVIS Background Service active. System will stay alive in background.',
      textResponse: isBn
        ? `🔋 **JARVIS ব্যাকগ্রাউন্ড সার্ভিস সক্রিয়:** স্ক্রিন লক বা অন্য অ্যাপ ব্যবহারে JARVIS চলমান থাকবে। MediaSession ও Wake-Lock সক্রিয়।`
        : `🔋 **JARVIS Continuous Background Engine Active:** Process will stay alive in background with Screen WakeLock and MediaSession controls.`,
    };
  }

  // 6. Camera
  if (lower.includes('camera') || lower.includes('ক্যামেরা') || lower.includes('ছবি তোলো') || lower.includes('photo')) {
    return {
      isMobileAction: true,
      action: {
        type: 'OPEN_CAMERA',
        app: 'camera',
        commandDescription: 'Open Device Camera',
      },
      spokenResponse: 'Opening Camera.',
      textResponse: `📸 **Camera Launcher Active:** Accessing device optics.`,
    };
  }

  // 7. Maps / Navigation
  if (lower.includes('maps') || lower.includes('ম্যাপ') || lower.includes('navigation') || lower.includes('rasta') || lower.includes('location')) {
    const dest = lower
      .replace(/^(open\s*maps\s*to|navigate\s*to|maps\s*e|ম্যাপ\s*এ|rasta\s*dekhao)\s*/i, '')
      .trim() || 'Current Location';

    return {
      isMobileAction: true,
      action: {
        type: 'NAVIGATE_MAPS',
        app: 'maps',
        query: dest,
        commandDescription: `Navigate to ${dest}`,
      },
      spokenResponse: `Navigating to ${dest}.`,
      textResponse: `🗺️ **Google Maps Navigation:** Routing to "${dest}".`,
    };
  }

  return { isMobileAction: false };
}
