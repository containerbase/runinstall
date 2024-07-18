const maven = require('./mvn');

describe('src/tools/mvn', () => {
    describe('tests successful parsing', () => {

        it('pom in dir 1 - java and maven', () => {
            const constraints = maven.getToolConstraints({},'test/mvn/passing/1/pom.xml');

            expect(constraints.length).toEqual(2);

             const j = javaConstraint = constraints[0];
            expect(j.toolName).toEqual('java');
            expect(j.source).toEqual('enforce-maven');
            expect(j.constraint).toEqual('^11');
            expect(j.rawConstraint).toEqual('[11,)');

            const m =mavenConstraint = constraints[1];
            expect(m.toolName).toEqual('maven');
            expect(m.source).toEqual('enforce-maven');
            expect(m.constraint).toEqual('[3.8.6,)');
        });

        it('pom in dir 2 - java and maven', () => {
            const constraints = maven.getToolConstraints({},'test/mvn/passing/2/pom.xml');

            expect(constraints.length).toEqual(2);

            const j = constraints[0];
            expect(j.toolName).toEqual('java');
            expect(j.source).toEqual('enforce-maven');
            expect(j.constraint).toEqual('11');
            expect(j.rawConstraint).toEqual('11');

            const m = constraints[1];
            expect(m.toolName).toEqual('maven');
            expect(m.source).toEqual('enforce-maven');
            expect(m.constraint).toEqual('3.5.0');
        });

        it('pom in dir 3 - only java - no maven', () => {
            const constraints = maven.getToolConstraints({},'test/mvn/passing/3/pom.xml');

            expect(constraints.length).toEqual(1);

            const j = constraints[0];
            expect(j.toolName).toEqual('java');
            expect(j.source).toEqual('maven.compiler.source');
            expect(j.constraint).toEqual('17');
            expect(j.rawConstraint).toEqual('17');
        });

    });

    describe('tests handle invalid files', () => {
        it('pom in dir bad', () => {
            const constraints = maven.getToolConstraints({},'test/mvn/failures/empty_file.txt');
            expect(constraints).toBeDefined();
            expect(constraints.length).toEqual(0);
        });

        it('pom in dir bad', () => {
            const constraints = maven.getToolConstraints({},'test/mvn/failures/empty_project.xml');
            expect(constraints).toBeDefined();
            expect(constraints.length).toEqual(0);
        });

        it('pom in dir bad', () => {
            const constraints = maven.getToolConstraints({},'test/mvn/failures/not_an_xml_file.txt');
            expect(constraints).toBeDefined();
            expect(constraints.length).toEqual(0);
        });

    });
});
