import { DEFAULT_FORMAT, formatTokenName, type FormatOptions } from './formatter';

export type TokenRef = {
  kind: 'variable' | 'style';
  rawName: string;
  tokenized: string;
};

export class TokenResolver {
  private variableCache = new Map<string, Variable | null>();
  private styleCache = new Map<string, BaseStyle | null>();

  constructor(private fmt: FormatOptions = DEFAULT_FORMAT) {}

  async getVariable(id: string): Promise<Variable | null> {
    if (this.variableCache.has(id)) return this.variableCache.get(id) ?? null;
    const v = await figma.variables.getVariableByIdAsync(id);
    this.variableCache.set(id, v);
    return v;
  }

  async getStyle(id: string): Promise<BaseStyle | null> {
    if (this.styleCache.has(id)) return this.styleCache.get(id) ?? null;
    const s = await figma.getStyleByIdAsync(id);
    this.styleCache.set(id, s);
    return s;
  }

  tokenFromVariable(v: Variable): TokenRef {
    return { kind: 'variable', rawName: v.name, tokenized: formatTokenName(v.name, this.fmt) };
  }

  tokenFromStyle(s: BaseStyle): TokenRef {
    return { kind: 'style', rawName: s.name, tokenized: formatTokenName(s.name, this.fmt) };
  }

  async resolveByBoundVariable(
    bound: VariableAlias | undefined
  ): Promise<TokenRef | null> {
    if (!bound) return null;
    const v = await this.getVariable(bound.id);
    return v ? this.tokenFromVariable(v) : null;
  }

  async resolveByStyleId(styleId: string | typeof figma.mixed | undefined): Promise<TokenRef | null> {
    if (!styleId || styleId === figma.mixed || typeof styleId !== 'string') return null;
    const s = await this.getStyle(styleId);
    return s ? this.tokenFromStyle(s) : null;
  }

  /**
   * For fills[i]: first try per-index variable, then fill-list style.
   */
  async resolveFill(
    node: SceneNode & { readonly fills?: readonly Paint[] | PluginAPI['mixed'] } & { fillStyleId?: string | PluginAPI['mixed'] },
    index: number
  ): Promise<TokenRef | null> {
    const boundVar = (node as SceneNode & { boundVariables?: { fills?: readonly VariableAlias[] } }).boundVariables?.fills?.[index];
    const viaVar = await this.resolveByBoundVariable(boundVar);
    if (viaVar) return viaVar;
    if ('fillStyleId' in node) {
      return await this.resolveByStyleId(node.fillStyleId);
    }
    return null;
  }

  async resolveStroke(
    node: SceneNode & { readonly strokes?: readonly Paint[] } & { strokeStyleId?: string | PluginAPI['mixed'] },
    index: number
  ): Promise<TokenRef | null> {
    const boundVar = (node as SceneNode & { boundVariables?: { strokes?: readonly VariableAlias[] } }).boundVariables?.strokes?.[index];
    const viaVar = await this.resolveByBoundVariable(boundVar);
    if (viaVar) return viaVar;
    if ('strokeStyleId' in node) {
      return await this.resolveByStyleId(node.strokeStyleId);
    }
    return null;
  }

  async resolveEffect(
    node: SceneNode & { readonly effects?: readonly Effect[] } & { effectStyleId?: string | PluginAPI['mixed'] },
    index: number
  ): Promise<TokenRef | null> {
    const boundVar = (node as SceneNode & { boundVariables?: { effects?: readonly VariableAlias[] } }).boundVariables?.effects?.[index];
    const viaVar = await this.resolveByBoundVariable(boundVar);
    if (viaVar) return viaVar;
    if ('effectStyleId' in node) {
      return await this.resolveByStyleId(node.effectStyleId);
    }
    return null;
  }

  async resolveText(node: TextNode): Promise<TokenRef | null> {
    return await this.resolveByStyleId(node.textStyleId);
  }

  async resolveScalar(
    node: SceneNode,
    prop: keyof NonNullable<SceneNode['boundVariables']>
  ): Promise<TokenRef | null> {
    const bound = (node.boundVariables as Record<string, VariableAlias | undefined> | undefined)?.[prop as string];
    return await this.resolveByBoundVariable(bound);
  }
}
