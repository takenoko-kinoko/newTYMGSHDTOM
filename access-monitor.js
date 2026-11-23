/* 東急在線モニタ・匿名訪問履歴クライアント（GAS版） */
(() => {
  'use strict';
  // GASの新しいデプロイURL（/execまで）に書き換えてください。
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbx2yCJjxJkTVDOCjoKp1JMMCdvh0gXqVR8mcHiFVhLWV5iQKQdSxG1FteHZN5h9qVw0/exec';
  if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(GAS_URL)) return;
  const key = 'tokyu_access_visitor_v1';
  let visitor = '';
  try { visitor = localStorage.getItem(key) || ''; } catch (_) {}
  if (!/^[A-Za-z0-9_-]{16,80}$/.test(visitor)) {
    const bytes = new Uint8Array(18);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else return; // 安全な乱数生成ができない環境では識別しない
    visitor = Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('');
    try { localStorage.setItem(key, visitor); } catch (_) {}
  }
  const pathname = location.pathname.slice(0, 150);
  let referrer = '';
  try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch (_) {}
  const args = new URLSearchParams({action:'log', vid:visitor, page:pathname, ref:referrer,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '', ua:navigator.userAgent.slice(0,220)});
  // 記録は画面の動作を妨げない。ブラウザ側で遮断される場合は記録されない。
  const ping = new Image();
  ping.src = `${GAS_URL}?${args.toString()}&_=${Date.now()}`;
  // JSONPによる簡易ブロック判定。JSを無効化すれば回避できるためセキュリティ境界ではありません。
  const cb = '__tokyuPolicy' + Math.random().toString(36).slice(2);
  window[cb] = data => {
    try {
      if (data && data.blocked) {
        document.documentElement.replaceChildren();
        document.documentElement.innerHTML = '<head><meta charset="utf-8"><title>ご利用いただけません</title></head><body style="font-family:sans-serif;text-align:center;padding:12vh 20px"><h1>アクセスを制限しています</h1><p>このページは現在ご利用いただけません。</p></body>';
      }
    } finally { delete window[cb]; }
  };
  const script = document.createElement('script');
  script.src = `${GAS_URL}?action=check&vid=${encodeURIComponent(visitor)}&callback=${encodeURIComponent(cb)}&_=${Date.now()}`;
  script.async = true;
  script.onerror = () => { delete window[cb]; };
  (document.head || document.documentElement).appendChild(script);
})();
