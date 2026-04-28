import { useEffect, useState } from 'react';
import { onCodeMessage, sendToCode } from './bridge';
import type { Aspect, FullDSSection, SelectionSummary } from '../shared/messages';

type Mode = 'selection' | 'fullds';

type AspectDef = { id: Aspect; label: string; group: 'atomic' | 'composite' };

const ASPECTS: AspectDef[] = [
  { id: 'background', label: 'Background', group: 'atomic' },
  { id: 'surface', label: 'Surface', group: 'atomic' },
  { id: 'backdrop', label: 'Backdrop', group: 'atomic' },
  { id: 'stack', label: 'Stack', group: 'atomic' },
  { id: 'button', label: 'Button', group: 'composite' },
  { id: 'buttonPremium', label: 'Button Premium', group: 'composite' },
  { id: 'input', label: 'Input', group: 'composite' },
  { id: 'card', label: 'Card', group: 'composite' },
  { id: 'componentSet', label: 'Component Set', group: 'composite' },
  { id: 'frame', label: 'Frame', group: 'composite' },
  { id: 'all', label: 'All', group: 'composite' },
  { id: 'screen', label: 'Screen', group: 'composite' }
];

const FULL_DS_SECTIONS: { id: FullDSSection; label: string }[] = [
  { id: 'textStyles', label: 'Text Styles' },
  { id: 'paintStyles', label: 'Paint Styles' },
  { id: 'effectStyles', label: 'Effect Styles' },
  { id: 'colorVariables', label: 'Color Variables' },
  { id: 'numberVariables', label: 'Number Variables' },
  { id: 'localComponents', label: 'Local Components' },
  { id: 'icons', label: 'Icons (SVG)' }
];

export function App() {
  const [mode, setMode] = useState<Mode>('selection');
  const [selection, setSelection] = useState<SelectionSummary | null>(null);
  const [selectedAspect, setSelectedAspect] = useState<Aspect | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [sections, setSections] = useState<Set<FullDSSection>>(new Set(['textStyles']));
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [screenFormat, setScreenFormat] = useState<'md' | 'json'>('md');

  useEffect(() => {
    const off = onCodeMessage((msg) => {
      if (msg.type === 'selection-changed') {
        setSelection(msg.summary);
      } else if (msg.type === 'extract-result') {
        setMarkdown(msg.markdown);
        setWarnings(msg.warnings);
        setGenerating(false);
      } else if (msg.type === 'error') {
        setWarnings([`Error: ${msg.message}`]);
        setGenerating(false);
      }
    });
    sendToCode({ type: 'ready' });
    return off;
  }, []);

  useEffect(() => {
    if (mode !== 'selection') return;
    if (!selectedAspect) return;
    if (!selection || selection.count === 0) return;
    setGenerating(true);
    sendToCode({
      type: 'extract-aspect',
      aspect: selectedAspect,
      format: selectedAspect === 'screen' ? screenFormat : undefined
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAspect, screenFormat, selection?.count, selection?.nodeNames.join('|')]);

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(markdown);
      ok = true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = markdown;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, markdown.length);
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      setWarnings((w) => [...w, 'Clipboard недоступен — выдели текст в textarea и скопируй вручную (⌘C).']);
    }
  };

  const isScreenJson = selectedAspect === 'screen' && screenFormat === 'json';
  const download = () => {
    const ext = isScreenJson ? 'json' : 'md';
    const mime = isScreenJson ? 'application/json' : 'text/markdown';
    const base = mode === 'fullds' ? 'full-ds' : selectedAspect ?? 'export';
    const blob = new Blob([markdown], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSection = (s: FullDSSection) => {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const hasSelection = (selection?.count ?? 0) > 0;
  const canGenerateSelection = !!selectedAspect && hasSelection;

  const generateSelection = () => {
    if (!canGenerateSelection || !selectedAspect) return;
    setGenerating(true);
    sendToCode({
      type: 'extract-aspect',
      aspect: selectedAspect,
      format: selectedAspect === 'screen' ? screenFormat : undefined
    });
  };

  const generateFullDS = () => {
    if (sections.size === 0) return;
    setGenerating(true);
    sendToCode({ type: 'extract-fullds', sections: Array.from(sections) });
  };

  const generateButtonLabel = () => {
    if (generating) return 'Generating…';
    if (!selectedAspect) return 'Pick an aspect above';
    if (!hasSelection) return 'Select something in Figma';
    return `Generate — ${ASPECTS.find((a) => a.id === selectedAspect)?.label ?? ''}`;
  };

  return (
    <div className="app">
      <details className="howto">
        <summary>Как работает инструмент</summary>
        <div className="howto-body">
          <p><strong>Selection</strong> — экспорт по выделенному в Figma. <strong>Full DS</strong> — выгрузка всей дизайн-системы целиком (стили, переменные, иконки).</p>
          <p className="howto-section">Атомарные аспекты:</p>
          <ul>
            <li><strong>Background</strong> — полная спека выделенного узла: размер, layout, padding, gap, radius, fills, strokes, effects, opacity, rotation, текст. Без обхода детей.</li>
            <li><strong>Border</strong> — обводки и их параметры в выделении.</li>
            <li><strong>Typography</strong> — текстовые стили, размеры, веса.</li>
            <li><strong>Shadow</strong> — тени и blur-эффекты.</li>
            <li><strong>Radius / Spacing / Layout</strong> — геометрия и раскладка.</li>
            <li><strong>Icon</strong> — иконки в выделении.</li>
          </ul>
          <p className="howto-section">Composite:</p>
          <ul>
            <li><strong>Button / Input / Card / Component Set / Frame</strong> — спека по типу компонента, варианты, состояния.</li>
            <li><strong>All</strong> — всё атомарное сразу.</li>
            <li><strong>Screen</strong> — полный рекурсивный дамп выделенного экрана со всеми детьми, координатами, токенами. Над output есть переключатель MD / JSON.</li>
          </ul>
          <p className="howto-section">Поток:</p>
          <p>1) Выдели нод/фрейм в Figma → 2) выбери аспект → 3) Generate → 4) Copy или Download.</p>
        </div>
      </details>

      <div className="mode-switch" role="tablist">
        <button
          role="tab"
          aria-selected={mode === 'selection'}
          className={mode === 'selection' ? 'active' : ''}
          onClick={() => setMode('selection')}
        >
          Selection
        </button>
        <button
          role="tab"
          aria-selected={mode === 'fullds'}
          className={mode === 'fullds' ? 'active' : ''}
          onClick={() => setMode('fullds')}
        >
          Full DS
        </button>
      </div>

      {mode === 'selection' ? (
        <>
          <div className="selection-status">
            {hasSelection ? (
              <>
                <strong>{selection!.count} selected</strong>
                {': '}
                {Object.entries(selection!.types)
                  .map(([t, n]) => `${n} ${t}`)
                  .join(', ')}
              </>
            ) : (
              <span className="muted">Select something in Figma</span>
            )}
          </div>

          <section className="group">
            <div className="tools-grid">
              <button
                className={`tool${selectedAspect === 'screen' ? ' selected' : ''}`}
                onClick={() => setSelectedAspect('screen')}
              >
                <span className="tool-title">Screen</span>
                <span className="tool-sub">весь экран рекурсивно</span>
              </button>
              <button
                className={`tool${selectedAspect === 'background' ? ' selected' : ''}`}
                onClick={() => setSelectedAspect('background')}
              >
                <span className="tool-title">Background</span>
                <span className="tool-sub">один узел, без детей</span>
              </button>
              <button
                className={`tool${selectedAspect === 'surface' ? ' selected' : ''}`}
                onClick={() => setSelectedAspect('surface')}
              >
                <span className="tool-title">Surface</span>
                <span className="tool-sub">плашки, чипы, карточки</span>
              </button>
              <button
                className={`tool${selectedAspect === 'backdrop' ? ' selected' : ''}`}
                onClick={() => setSelectedAspect('backdrop')}
              >
                <span className="tool-title">Backdrop</span>
                <span className="tool-sub">background для модалок, bottom sheet и прочего</span>
              </button>
              <button
                className={`tool${selectedAspect === 'stack' ? ' selected' : ''}`}
                onClick={() => setSelectedAspect('stack')}
              >
                <span className="tool-title">Stack</span>
                <span className="tool-sub">сложный фон с обходом всех детей</span>
              </button>
              <button
                className={`tool${selectedAspect === 'button' ? ' selected' : ''}`}
                onClick={() => setSelectedAspect('button')}
              >
                <span className="tool-title">Button</span>
                <span className="tool-sub">варианты и состояния</span>
              </button>
              <button
                className={`tool${selectedAspect === 'buttonPremium' ? ' selected' : ''}`}
                onClick={() => setSelectedAspect('buttonPremium')}
              >
                <span className="tool-title">Button Premium</span>
                <span className="tool-sub">для подписок и монетизации</span>
              </button>
            </div>
          </section>

          <section className="group">
            <h3>Composite</h3>
            <div className="aspect-grid">
              {ASPECTS.filter(
                (a) => a.group === 'composite' && a.id !== 'screen' && a.id !== 'button'
              ).map((a) => (
                <button
                  key={a.id}
                  className={`aspect${selectedAspect === a.id ? ' selected' : ''}`}
                  onClick={() => setSelectedAspect(a.id)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </section>

          {generating && <div className="auto-status">Generating…</div>}
          {!generating && selectedAspect && !hasSelection && (
            <div className="auto-status muted">Select something in Figma</div>
          )}
        </>
      ) : (
        <section className="group">
          <h3>Export sections</h3>
          <div className="sections-list">
            {FULL_DS_SECTIONS.map((s) => (
              <label key={s.id} className="section-item">
                <input
                  type="checkbox"
                  checked={sections.has(s.id)}
                  onChange={() => toggleSection(s.id)}
                />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
          <button
            className="primary big"
            disabled={sections.size === 0 || generating}
            onClick={generateFullDS}
          >
            {generating ? 'Generating…' : 'Generate markdown'}
          </button>
        </section>
      )}

      <section className="output">
        <div className="output-head">
          <h3>Output</h3>
          {selectedAspect === 'screen' && (
            <div className="format-toggle" role="tablist">
              <button
                role="tab"
                aria-selected={screenFormat === 'md'}
                className={screenFormat === 'md' ? 'active' : ''}
                onClick={() => setScreenFormat('md')}
              >
                MD
              </button>
              <button
                role="tab"
                aria-selected={screenFormat === 'json'}
                className={screenFormat === 'json' ? 'active' : ''}
                onClick={() => setScreenFormat('json')}
              >
                JSON
              </button>
            </div>
          )}
        </div>
        <textarea
          className="markdown"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          placeholder="Pick an aspect, select a layer in Figma, press Generate."
          rows={10}
        />
        {warnings.length > 0 && (
          <ul className="warnings">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
        <div className="actions">
          <button className="primary" disabled={!markdown} onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button className="secondary" disabled={!markdown} onClick={download}>
            Download .{isScreenJson ? 'json' : 'md'}
          </button>
        </div>
      </section>
    </div>
  );
}
