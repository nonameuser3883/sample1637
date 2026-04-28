export type SelectionSummary = {
  count: number;
  types: Record<string, number>;
  nodeNames: string[];
};

export type Aspect =
  | 'background'
  | 'border'
  | 'typography'
  | 'shadow'
  | 'radius'
  | 'spacing'
  | 'layout'
  | 'icon'
  | 'surface'
  | 'backdrop'
  | 'stack'
  | 'button'
  | 'buttonPremium'
  | 'input'
  | 'card'
  | 'componentSet'
  | 'frame'
  | 'screen'
  | 'all';

export type FullDSSection =
  | 'paintStyles'
  | 'textStyles'
  | 'effectStyles'
  | 'colorVariables'
  | 'numberVariables'
  | 'localComponents'
  | 'icons';

export type UiMessage =
  | { type: 'ready' }
  | { type: 'extract-aspect'; aspect: Aspect; format?: 'md' | 'json' }
  | { type: 'extract-fullds'; sections: FullDSSection[] }
  | { type: 'close' };

export type CodeMessage =
  | { type: 'selection-changed'; summary: SelectionSummary }
  | { type: 'extract-result'; markdown: string; warnings: string[] }
  | { type: 'error'; message: string };
