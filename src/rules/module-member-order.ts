import type { Rule } from 'eslint';

const MODULE_MEMBER_ORDER = ['enum', 'type', 'interface', 'const'] as const;
const MODULE_MEMBER_RANK = new Map<string, number>(MODULE_MEMBER_ORDER.map((kind, index) => [kind, index]));

const getSortableNode = (statement: any) => {
    if (statement.type === 'ExportNamedDeclaration' && statement.declaration) {
        return statement.declaration;
    }

    if (['ImportDeclaration', 'ExportAllDeclaration', 'ExportDefaultDeclaration'].includes(statement.type)) {
        return null;
    }

    return statement;
};

const getMemberKind = (statement: any): string | null => {
    const node = getSortableNode(statement);

    if (!node) {
        return null;
    }

    switch (node.type) {
        case 'TSEnumDeclaration':
            return 'enum';
        case 'TSTypeAliasDeclaration':
            return 'type';
        case 'TSInterfaceDeclaration':
            return 'interface';
        case 'VariableDeclaration':
            return node.kind === 'const' ? 'const' : null;
        default:
            return null;
    }
};

const getImportBlockEndIndex = (statements: any[]): number => {
    let index = 0;

    while (index < statements.length && statements[index].type === 'ImportDeclaration') {
        index += 1;
    }

    return index;
};

const buildHeaderSegment = (statements: any[]) => {
    const segment: { statement: any; kind: string }[] = [];
    const startIndex = getImportBlockEndIndex(statements);

    for (let index = startIndex; index < statements.length; index += 1) {
        const kind = getMemberKind(statements[index]);

        if (!kind) {
            break;
        }

        segment.push({ statement: statements[index], kind });
    }

    return segment;
};

const hasCommentsInSegment = (sourceCode: any, segment: { statement: any }[]): boolean =>
    segment.some(
        ({ statement }) =>
            sourceCode.getCommentsBefore(statement).length > 0 ||
            sourceCode.getCommentsAfter(statement).length > 0,
    );

const isSegmentOrdered = (segment: { kind: string }[]): boolean => {
    let highestSeenRank = -1;

    for (const { kind } of segment) {
        const rank = MODULE_MEMBER_RANK.get(kind) ?? Number.MAX_SAFE_INTEGER;

        if (rank < highestSeenRank) {
            return false;
        }

        highestSeenRank = rank;
    }

    return true;
};

const sortSegment = (segment: { kind: string; index: number; statement: any }[]) =>
    [...segment].sort((left, right) => {
        const leftRank = MODULE_MEMBER_RANK.get(left.kind) ?? Number.MAX_SAFE_INTEGER;
        const rightRank = MODULE_MEMBER_RANK.get(right.kind) ?? Number.MAX_SAFE_INTEGER;
        const rankDifference = leftRank - rightRank;

        if (rankDifference !== 0) {
            return rankDifference;
        }

        return left.index - right.index;
    });

const moduleMemberOrderRule: Rule.RuleModule = {
    meta: {
        docs: {
            description: 'Enforce top-level declarations as imports -> enum -> type -> interface -> const.',
        },
        fixable: 'code',
        type: 'layout',
        schema: [],
    },
    create(context) {
        const sourceCode = context.sourceCode as any;

        return {
            Program(program: any) {
                const segment = buildHeaderSegment(program.body);

                if (segment.length < 2 || isSegmentOrdered(segment)) {
                    return;
                }

                const firstOutOfOrderNode = segment.find(({ kind }, index) => {
                    const currentRank = MODULE_MEMBER_RANK.get(kind) ?? Number.MAX_SAFE_INTEGER;
                    const previousRanks = segment
                        .slice(0, index)
                        .map((item) => MODULE_MEMBER_RANK.get(item.kind) ?? Number.MAX_SAFE_INTEGER);

                    return previousRanks.some((previousRank) => previousRank > currentRank);
                });

                const createFix = () => {
                    if (hasCommentsInSegment(sourceCode, segment)) {
                        return null;
                    }

                    const sortedSegment = sortSegment(segment.map((item, index) => ({ ...item, index })));
                    const replacement = sortedSegment
                        .map(({ statement }) => sourceCode.getText(statement))
                        .join('\n\n');
                    const firstStatement = segment[0].statement;
                    const lastStatement = segment[segment.length - 1].statement;

                    return (fixer: any) => fixer.replaceTextRange([firstStatement.range[0], lastStatement.range[1]], replacement);
                };

                context.report({
                    message: `Top-level declarations must be ordered as imports -> ${MODULE_MEMBER_ORDER.join(' -> ')}.`,
                    node: firstOutOfOrderNode?.statement ?? segment[0].statement,
                    fix: createFix() ?? undefined,
                });
            },
        };
    },
};

export default moduleMemberOrderRule;
