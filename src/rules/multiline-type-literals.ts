import type { Rule } from 'eslint';

const INDENT_SIZE = 4;

const getLineIndent = (sourceCode: any, node: any): string => {
    const lineText = sourceCode.getText().split('\n')[node.loc.start.line - 1] ?? '';

    return lineText.match(/^\s*/)?.[0] ?? '';
};

const formatObjectLikeNode = (sourceCode: any, members: any[], node: any): string => {
    if (members.length === 0) {
        return '{}';
    }

    const currentIndent = getLineIndent(sourceCode, node);
    const innerIndent = `${currentIndent}${' '.repeat(INDENT_SIZE)}`;
    const formattedMembers = members.map((member) => `${innerIndent}${sourceCode.getText(member).trim()}`);

    return `{\n${formattedMembers.join('\n')}\n${currentIndent}}`;
};

const multilineTypeLiteralsRule: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'Enforce multiline formatting for inline TypeScript object type literals.',
        },
        fixable: 'code',
        type: 'layout',
        schema: [],
    },
    create(context) {
        const sourceCode = context.sourceCode as any;

        const check = (node: any) => {
            const members = node.members ?? node.body;

            if (!members || members.length === 0) {
                return;
            }

            if (node.loc.start.line !== node.loc.end.line) {
                return;
            }

            context.report({
                fix: (fixer: any) => fixer.replaceText(node, formatObjectLikeNode(sourceCode, members, node)),
                message: 'Inline object type literals must be multiline.',
                node,
            });
        };

        return {
            TSTypeLiteral: check,
            TSInterfaceBody: check,
        };
    },
};

export default multilineTypeLiteralsRule;
