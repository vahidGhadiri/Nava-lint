import type { Rule } from 'eslint';

const INLINE_TYPE_IMPORT = /^import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+(['"])([^'"]+)\2;?$/;

const buildReplacement = (body: string, source: string): string | null => {
    const typeSpecifiers: string[] = [];
    const valueSpecifiers: string[] = [];

    for (const raw of body.split(',')) {
        const specifier = raw.trim();

        if (specifier.length === 0) {
            continue;
        }

        if (specifier.startsWith('type ')) {
            typeSpecifiers.push(specifier.slice('type '.length).trim());
        } else {
            valueSpecifiers.push(specifier);
        }
    }

    if (typeSpecifiers.length === 0) {
        return null;
    }

    const lines: string[] = [];

    if (typeSpecifiers.length > 0) {
        lines.push(`import type { ${typeSpecifiers.join(', ')} } from '${source}';`);
    }

    if (valueSpecifiers.length > 0) {
        lines.push(`import { ${valueSpecifiers.join(', ')} } from '${source}';`);
    }

    return lines.join('\n');
};

const noInlineTypeImportsRule: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'Disallow inline type imports in favor of `import type { X }`.',
        },
        fixable: 'code',
        type: 'layout',
        schema: [],
        messages: {
            inlineTypeImport: 'Use `import type { X }` instead of `import { type X }`.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            Program(node) {
                const text = sourceCode.getText(node);
                const lines = text.split('\n');

                lines.forEach((line, index) => {
                    const match = line.match(INLINE_TYPE_IMPORT);

                    if (!match) {
                        return;
                    }

                    const replacement = buildReplacement(match[1], match[3]);

                    if (!replacement) {
                        return;
                    }

                    const lineNumber = index + 1;
                    const startColumn = line.indexOf('import') + 1;
                    const endColumn = line.length + 1;

                    context.report({
                        fix: (fixer) => {
                            const lineStart = sourceCode.getIndexFromLoc({ line: lineNumber, column: 0 });

                            return fixer.replaceTextRange(
                                [lineStart + line.indexOf('import'), lineStart + line.length],
                                replacement,
                            );
                        },
                        loc: {
                            start: { line: lineNumber, column: startColumn },
                            end: { line: lineNumber, column: endColumn },
                        },
                        messageId: 'inlineTypeImport',
                    });
                });
            },
        };
    },
};

export default noInlineTypeImportsRule;
