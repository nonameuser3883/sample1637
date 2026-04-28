export class MdBuilder {
  private lines: string[] = [];

  h1(text: string): this {
    this.lines.push(`# ${text}`, '');
    return this;
  }
  h2(text: string): this {
    this.lines.push(`## ${text}`, '');
    return this;
  }
  h3(text: string): this {
    this.lines.push(`### ${text}`, '');
    return this;
  }
  p(text: string): this {
    this.lines.push(text, '');
    return this;
  }
  li(text: string): this {
    this.lines.push(`- ${text}`);
    return this;
  }
  kv(key: string, value: string): this {
    this.lines.push(`- **${key}:** ${value}`);
    return this;
  }
  blank(): this {
    this.lines.push('');
    return this;
  }
  code(lang: string, body: string): this {
    this.lines.push('```' + lang, body, '```', '');
    return this;
  }
  raw(text: string): this {
    this.lines.push(text);
    return this;
  }
  hr(): this {
    this.lines.push('', '---', '');
    return this;
  }

  toString(): string {
    return this.lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }
}
