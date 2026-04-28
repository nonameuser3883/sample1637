import type { CodeMessage, UiMessage } from '../shared/messages';

type Listener = (msg: CodeMessage) => void;
const listeners: Listener[] = [];

window.addEventListener('message', (event) => {
  const pluginMessage = (event.data as { pluginMessage?: CodeMessage })?.pluginMessage;
  if (!pluginMessage) return;
  for (const listener of listeners) listener(pluginMessage);
});

export function sendToCode(msg: UiMessage): void {
  parent.postMessage({ pluginMessage: msg }, '*');
}

export function onCodeMessage(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
