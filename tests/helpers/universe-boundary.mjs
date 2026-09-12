import ts from 'typescript';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';

const forbidden = /^(three(?:\/|$)|@react-three\/|react-three-fiber(?:\/|$)|gsap(?:\/|$))/;
export function runtimeGraph(root, entries) {
  const config = ts.readConfigFile(resolve(root, 'tsconfig.json'), ts.sys.readFile);
  if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  if (parsed.errors.length) throw new Error(ts.flattenDiagnosticMessageText(parsed.errors[0].messageText, '\n'));
  const seen = new Map();
  function visit(file, chain) {
    if (seen.has(file)) return;
    if (!existsSync(file)) throw new Error(`UNRESOLVED_LOCAL: ${file}`);
    const text = readFileSync(file, 'utf8');
    seen.set(file, text);
    if (!/\.[cm]?[jt]sx?$/.test(file)) return;
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    function edge(spec) {
      if (forbidden.test(spec)) throw new Error(`FORBIDDEN_RUNTIME: ${[...chain, file, spec].join(' -> ')}`);
      const alias = Object.keys(parsed.options.paths ?? {}).some(key => spec.startsWith(key.split('*')[0]));
      const local = spec.startsWith('.') || spec.startsWith('/') || alias;
      const result = ts.resolveModuleName(spec, file, parsed.options, ts.sys).resolvedModule;
      if (result && !result.isExternalLibraryImport) return visit(result.resolvedFileName, [...chain, file]);
      if (local && /\.(css|json)$/.test(spec)) {
        const candidate = spec.startsWith('.') ? resolve(dirname(file), spec) : spec.startsWith('@/') ? resolve(root, 'src', spec.slice(2)) : resolve(root, spec);
        return visit(candidate, [...chain, file]);
      }
      if (local) throw new Error(`UNRESOLVED_LOCAL: ${file} -> ${spec}`);
    }
    function walk(n) {
      if (ts.isImportDeclaration(n)) {
        const c = n.importClause;
        const typeOnly = c?.isTypeOnly || (c && !c.name && c.namedBindings && ts.isNamedImports(c.namedBindings) && c.namedBindings.elements.length > 0 && c.namedBindings.elements.every(e => e.isTypeOnly));
        if (!typeOnly) edge(n.moduleSpecifier.text);
      } else if (ts.isExportDeclaration(n) && n.moduleSpecifier) {
        const typeOnly = n.isTypeOnly || (n.exportClause && ts.isNamedExports(n.exportClause) && n.exportClause.elements.length > 0 && n.exportClause.elements.every(e => e.isTypeOnly));
        if (!typeOnly) edge(n.moduleSpecifier.text);
      } else if (ts.isImportEqualsDeclaration(n) && !n.isTypeOnly && ts.isExternalModuleReference(n.moduleReference)) {
        edge(n.moduleReference.expression.text);
      } else if (ts.isCallExpression(n) && (n.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(n.expression) && n.expression.text === 'require'))) {
        if (!n.arguments[0] || !ts.isStringLiteralLike(n.arguments[0])) throw new Error(`NON_LITERAL_RUNTIME: ${file}`);
        edge(n.arguments[0].text);
      }
      ts.forEachChild(n, walk);
    }
    walk(source);
  }
  entries.forEach(entry => visit(resolve(root, entry), []));
  return seen;
}
export function universeEntries(root) {
  return ['src/app/page.tsx', 'src/app/layout.tsx', 'src/app/universe-preview/page.tsx', 'src/data/universe-navigation.ts',
    ...readdirSync(resolve(root, 'src/components/universe')).filter(f => ['.ts', '.tsx'].includes(extname(f))).map(f => `src/components/universe/${f}`)];
}
