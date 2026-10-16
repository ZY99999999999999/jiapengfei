// 可选的本地手势控制。只有用户点击「开启手势」后才请求摄像头；视频帧不上传。
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error('手势识别组件未能载入'));
    document.head.append(script);
  });
}

function handGesture(hand) {
  const span = Math.hypot(hand[5].x - hand[17].x, hand[5].y - hand[17].y);
  const pinch = Math.hypot(hand[4].x - hand[8].x, hand[4].y - hand[8].y) < span * 0.37;
  if (pinch) return 'pinch';
  const raised = [8, 12, 16, 20].filter(tip => hand[tip].y < hand[tip - 2].y - 0.018).length;
  if (raised >= 4) return 'open';
  if (raised <= 1) return 'fist';
  return 'neutral';
}

export function createGestureControl(video, callbacks) {
  let hands = null;
  let stream = null;
  let active = false;
  let busy = false;
  let lastSent = 0;
  let candidate = '';
  let candidateSince = 0;
  let cooldownUntil = 0;
  let lastStatus = '';
  let frameId = 0;
  const report = message => {
    if (message === lastStatus) return;
    lastStatus = message;
    callbacks.onStatus(message);
  };

  function onResults(result) {
    if (!active) return;
    const hand = result.multiHandLandmarks?.[0];
    if (!hand) { candidate = ''; report('镜头中未检测到手'); return; }
    const gesture = handGesture(hand);
    const now = performance.now();
    if (gesture !== candidate) { candidate = gesture; candidateSince = now; }
    const labels = { open: '张开手掌 · 停止', fist: '握拳 · 继续', pinch: '捏合 · 确认', neutral: '请张掌、握拳或捏合' };
    report(labels[gesture]);
    if (gesture === 'neutral' || now < cooldownUntil || now - candidateSince < 680) return;
    cooldownUntil = now + 1550;
    candidate = '';
    if (gesture === 'open') callbacks.onOpen();
    else if (gesture === 'fist') callbacks.onFist();
    else callbacks.onPinch();
  }

  async function process(time) {
    if (!active) return;
    frameId = requestAnimationFrame(process);
    if (busy || time - lastSent < 95 || video.readyState < 2) return;
    busy = true;
    lastSent = time;
    try { await hands.send({ image: video }); }
    catch (error) { report(`识别暂时不可用：${error.message}`); }
    finally { busy = false; }
  }

  async function start() {
    if (active) return;
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('请使用 localhost 或安全连接打开页面，才能启用摄像头');
    report('正在准备摄像头…');
    try {
      if (!window.Hands) await loadScript('../lib/hands.min.js');
      hands = new window.Hands({ locateFile: file => new URL(`../lib/mediapipe_hands/${file}`, import.meta.url).href });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.65, minTrackingConfidence: 0.55 });
      hands.onResults(onResults);
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
      video.srcObject = stream;
      await video.play();
      active = true;
      report('已开启：张掌停、握拳走、捏合确认');
      frameId = requestAnimationFrame(process);
    } catch (error) {
      stop();
      throw error;
    }
  }

  function stop() {
    active = false;
    cancelAnimationFrame(frameId);
    stream?.getTracks().forEach(track => track.stop());
    stream = null;
    video.pause();
    video.srcObject = null;
    if (hands?.close) hands.close();
    hands = null;
    candidate = '';
    report('手势已关闭，摄像头已停止');
  }

  return { start, stop, get active() { return active; } };
}
