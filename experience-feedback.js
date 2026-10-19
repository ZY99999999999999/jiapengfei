(() => {
  'use strict';
  const key = 'pattern-ui-sound-v1';
  let enabled = true, context, last = 0;
  try { enabled = localStorage.getItem(key) !== 'off'; } catch {}
  const desktop = () => matchMedia('(min-width:821px)').matches;
  const sync = () => document.querySelectorAll('[data-ui-sound]').forEach(button => {
    button.textContent = enabled ? '音效：开' : '音效：关';
    button.setAttribute('aria-pressed', String(enabled));
    button.title = '界面操作音效；不影响背景音乐';
  });
  async function cue(kind = 'tap') {
    if (!enabled || !desktop() || document.hidden || performance.now() - last < 90) return;
    last = performance.now();
    try {
      context ||= new (window.AudioContext || window.webkitAudioContext)();
      if (context.state === 'suspended') await context.resume();
      if (!enabled || context.state !== 'running') return;
      const now = context.currentTime, duration = kind === 'tap' ? .07 : .17;
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(kind === 'back' ? 610 : 470, now);
      oscillator.frequency.exponentialRampToValueAtTime(kind === 'back' ? 280 : kind === 'open' ? 960 : 630, now + duration);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.018, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(now); oscillator.stop(now + duration + .02);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    } catch { /* Sound must never block navigation. */ }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button, summary, a, [role="button"], .pattern-card');
    if (!button || button.disabled || !desktop()) return;
    if (document.body.dataset.feedbackScope === 'co' && !button.closest('.co-scene,.co-create-entry')) return;
    if (button.matches('[data-ui-sound]')) {
      enabled = !enabled;
      try { localStorage.setItem(key, enabled ? 'on' : 'off'); } catch {}
      sync(); if (enabled) cue('tap'); return;
    }
    const label = button.textContent || '';
    cue(/返回|关闭|退出|收起|取消/.test(label) ? 'back' : /进入|开始|确认|融入|放飞|导览/.test(label) ? 'open' : 'tap');
  }, true);
  window.addEventListener('storage', event => { if (event.key === key) { enabled = event.newValue !== 'off'; sync(); } });
  window.PatternFeedback = { cue };
  sync();
})();
