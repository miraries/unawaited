declare module 'acorn-stage3';
declare module 'acorn-with-stage3';

interface TraverseResult {
    call: {
        file: string;
        name: string;
        loc: {
            line: number;
            column: number;
        };
    };
    definition: {
        file: string;
        name: string;
        loc: {
            line: number;
            column: number;
        };
    };
};

type TraverseResults = TraverseResult[];