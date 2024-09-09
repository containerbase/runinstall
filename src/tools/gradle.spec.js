const gradle = require('./gradle');

describe('src/tools/gradle', () => {
    describe('tests successful parsing', () => {

        it('gradle wrapper dir 1 - get java version only from gradle wrapper', () => {
            const constraints = gradle.getToolConstraints({},'test/gradle/passing/1/gradle/wrapper/gradle-wrapper.properties');

            expect(constraints.length).toEqual(1);

            const j = constraints[0];
            expect(j.toolName).toEqual('java');
            expect(j.source).toEqual('gradle');
            expect(j.constraint).toEqual('^8.0.0');
        });

        it('gradle properties dir 2 - gradle and java version from gradle.properties', () => {
            const constraints = gradle.getToolConstraints({},'test/gradle/passing/2/gradle.properties');

            expect(constraints.length).toEqual(2);

            const j = constraints[0];
            expect(j.toolName).toEqual('java');
            expect(j.source).toEqual('gradle');
            expect(j.constraint).toEqual('^17.0.0');

            const m = constraints[1];
            expect(m.toolName).toEqual('gradle');
            expect(m.source).toEqual('gradle');
            expect(m.constraint).toEqual('8.4');
        });

        it('build gradle dir 3 - gradle and java from build.gradle', () => {
            const constraints = gradle.getToolConstraints({},'test/gradle/passing/3/build.gradle');

            expect(constraints.length).toEqual(2);

            const j = constraints[0];
            expect(j.toolName).toEqual('java');
            expect(j.source).toEqual('gradle');
            expect(j.constraint).toEqual('^11.0.0');

            const m = constraints[1];
            expect(m.toolName).toEqual('gradle');
            expect(m.source).toEqual('gradle');
            expect(m.constraint).toEqual('6.7.1');
        });

    });

    describe('tests handle invalid files', () => {
        it('build.gradle empty', () => {
            const constraints = gradle.getToolConstraints({},'test/gradle/failures/empty_file.txt');
            expect(constraints).toBeDefined();
            expect(constraints.length).toEqual(0);
        });

    });
});
