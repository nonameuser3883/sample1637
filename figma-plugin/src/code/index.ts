import type { CodeMessage, UiMessage } from '../shared/messages';
import { summarizeSelection } from './selection';
import { TokenResolver } from './tokens/resolver';
import { MdBuilder } from './markdown/builder';
import { ASPECT_EXTRACTORS, FULLDS_EXTRACTORS } from './extractors';
import { buildScreenTrees, screenToJSON, screenToMarkdown } from './extractors/aspects/screen';

figma.showUI(__html__, { width: 440, height: 780, themeColors: true });

const resolver = new TokenResolver();

function postToUI(msg: CodeMessage) {
  figma.ui.postMessage(msg);
}

function sendSelection() {
  postToUI({
    type: 'selection-changed',
    summary: summarizeSelection(figma.currentPage.selection)
  });
}

figma.on('selectionchange', sendSelection);

figma.ui.onmessage = async (msg: UiMessage) => {
  try {
    switch (msg.type) {
      case 'ready':
        sendSelection();
        break;

      case 'extract-aspect': {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
          postToUI({
            type: 'extract-result',
            markdown: `# ${msg.aspect}\n\nНичего не выделено.\n`,
            warnings: ['Выдели что-нибудь в Figma перед экспортом.']
          });
          break;
        }
        if (msg.aspect === 'screen') {
          const warnings: string[] = [];
          const trees = await buildScreenTrees(selection, resolver, warnings);
          const out =
            msg.format === 'json' ? screenToJSON(trees) : screenToMarkdown(trees);
          postToUI({ type: 'extract-result', markdown: out, warnings });
          break;
        }
        const extractor = ASPECT_EXTRACTORS[msg.aspect];
        const result = await extractor({ selection, resolver });
        postToUI({ type: 'extract-result', markdown: result.markdown, warnings: result.warnings });
        break;
      }

      case 'extract-fullds': {
        if (msg.sections.length === 0) {
          postToUI({
            type: 'extract-result',
            markdown: '',
            warnings: ['Выбери хотя бы одну секцию.']
          });
          break;
        }
        const md = new MdBuilder();
        const allWarnings: string[] = [];
        for (let i = 0; i < msg.sections.length; i++) {
          const section = msg.sections[i];
          const extractor = FULLDS_EXTRACTORS[section];
          const result = await extractor({ resolver });
          md.raw(result.markdown.trim());
          allWarnings.push(...result.warnings);
          if (i < msg.sections.length - 1) md.hr();
        }
        postToUI({
          type: 'extract-result',
          markdown: md.toString(),
          warnings: allWarnings
        });
        break;
      }

      case 'close':
        figma.closePlugin();
        break;
    }
  } catch (e) {
    postToUI({
      type: 'error',
      message: e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e)
    });
  }
};
