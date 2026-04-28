import type { TokenResolver } from '../tokens/resolver';

export type ExtractorContext = {
  selection: readonly SceneNode[];
  resolver: TokenResolver;
};

export type ExtractorResult = {
  markdown: string;
  warnings: string[];
};

export type AspectExtractor = (ctx: ExtractorContext) => Promise<ExtractorResult>;

export type FullDSContext = {
  resolver: TokenResolver;
};

export type FullDSExtractor = (ctx: FullDSContext) => Promise<ExtractorResult>;
