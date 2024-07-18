const path = require('./path');
const git = require("./git");

const assert = require("node:assert");

describe('src/path', () => {
    describe('tests RUNINSTALL_ENABLE_NO_GIT', () => {
        it('value set to true', () => {
            path.setRiMatch(undefined);
            path.setIncludes(undefined);
            path.setExcludes(undefined);
            path.setEnableNoGit('true');

            expect(path.skipToolInstall()).toEqual(false);
        });
        it('value set to value other than true', () => {
            path.setRiMatch(undefined);
            path.setIncludes(undefined);
            path.setExcludes(undefined);
            path.setEnableNoGit('some-value');

            // false because there is nothing to include
            expect(path.skipToolInstall()).toEqual(true);
        });
        it('value undefined value', () => {
            path.setRiMatch(undefined);
            path.setIncludes(undefined);
            path.setExcludes(undefined);
            path.setEnableNoGit(undefined);

            // false because there is nothing to include
            expect(path.skipToolInstall()).toEqual(true);
        });
    });

    describe('tests backward compatible of RUNINSTALL_MATCH and RUNINSTALL_INCLUDES', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('RUNINSTALL_MATCH - should not match', () => {
            path.setRiMatch("https://github.com/containerbase/");
            path.setIncludes(undefined);
            path.setExcludes(undefined);
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValue('https://github.com/some-other-org/runinstall.git');
            expect(path.skipToolInstall()).toEqual(true);
        });
        it('RUNINSTALL_MATCH - should match', () => {
            path.setRiMatch("https://github.com/containerbase/");
            path.setIncludes(undefined);
            path.setExcludes(undefined);
            path.setEnableNoGit(undefined);
            jest.spyOn(git, 'getRemote').mockReturnValue('https://github.com/containerbase/runinstall.git');
            expect(path.skipToolInstall()).toEqual(false);
        });
        it('RUNINSTALL_INCLUDES - should not match', () => {
            path.setRiMatch(undefined);
            path.setIncludes("https://github.com/containerbase/");
            path.setExcludes(undefined);
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValue('https://github.com/some-other-org/runinstall.git');
            expect(path.skipToolInstall()).toEqual(true);
        });
        it('RUNINSTALL_INCLUDES - should match', () => {
            path.setRiMatch(undefined);
            path.setIncludes("https://github.com/containerbase/");
            path.setExcludes(undefined);
            path.setEnableNoGit(undefined);
            jest.spyOn(git, 'getRemote').mockReturnValue('https://github.com/containerbase/runinstall.git');
            expect(path.skipToolInstall()).toEqual(false);
        });
        it('RUNINSTALL_INCLUDES overrides RUNINSTALL_MATCH - should not match ', () => {
            path.setRiMatch('https://github.com/some-other-org/');
            path.setIncludes("https://github.com/containerbase/");
            path.setExcludes(undefined);
            path.setEnableNoGit(undefined);
            jest.spyOn(git, 'getRemote').mockReturnValue('https://github.com/some-other-org/runinstall.git');
            expect(path.skipToolInstall()).toEqual(true);
        });
        it('RUNINSTALL_INCLUDES overrides RUNINSTALL_MATCH - should match ', () => {
            path.setRiMatch('https://github.com/some-other-org/');
            path.setIncludes("https://github.com/containerbase/");
            path.setExcludes(undefined);
            path.setEnableNoGit(undefined);
            jest.spyOn(git, 'getRemote').mockReturnValue('https://github.com/containerbase/runinstall.git');
            expect(path.skipToolInstall()).toEqual(false);
        });
    });

    describe('RUNINSTALL_EXCLUDES', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('exclude matched', () => {
            path.setRiMatch(undefined);
            path.setIncludes("https://github.com/containerbase/");
            path.setExcludes('runinstall');
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValue('https://github.com/containerbase/runinstall.git');
            expect(path.skipToolInstall()).toEqual(true);
        });

        it('exclude not matched', () => {
            path.setRiMatch(undefined);
            path.setIncludes("https://github.com/containerbase/");
            path.setExcludes('runinstaller');
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValue('https://github.com/containerbase/runinstall.git');
            expect(path.skipToolInstall()).toEqual(false);
        });
    });

    describe('test multi-value in field', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('multi-value 1 - match by 1st include', () => {
            path.setRiMatch(undefined);
            path.setIncludes('github.com/tests,test.com/,github.com/containerbase/');
            path.setExcludes('runinstall');
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValueOnce('github.com/tests/other.git');
            expect(path.skipToolInstall()).toEqual(false);
        });

        it('multi-value 2 - match by 2nd includes', () => {
            path.setRiMatch(undefined);
            path.setIncludes('github.com/tests,test.com/,github.com/containerbase/');
            path.setExcludes('runinstall');
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValueOnce('test.com/tests/other.git');
            expect(path.skipToolInstall()).toEqual(false);
        });

        it('multi-value 3 - match by 3rd includes', () => {
            path.setRiMatch(undefined);
            path.setIncludes('github.com/tests,test.com/,github.com/containerbase/');
            path.setExcludes('runinstall');
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValueOnce('github.com/containerbase/other.git');
            expect(path.skipToolInstall()).toEqual(false);
        });

        it('multi-value 4 - match by one exclude', () => {
            path.setRiMatch(undefined);
            path.setIncludes('github.com/tests,test.com/,github.com/containerbase/');
            path.setExcludes('runinstall');
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValueOnce('github.com/containerbase/runinstall.git');
            expect(path.skipToolInstall()).toEqual(true);
        });

        it('multi-value 5 - match by one exclude', () => {
            path.setRiMatch(undefined);
            path.setIncludes('github.com/tests,test.com/,github.com/containerbase/');
            path.setExcludes('runinstall');
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValueOnce('github.com/tests/runinstall.git');
            expect(path.skipToolInstall()).toEqual(true);
        });

        it('multi-value 6 - match by 2nd exclude', () => {
            path.setRiMatch(undefined);
            path.setIncludes('github.com/tests,test.com/,github.com/containerbase/');
            path.setExcludes('runinstall,other');
            path.setEnableNoGit(undefined);

            jest.spyOn(git, 'getRemote').mockReturnValueOnce('test.com/tests/other.git');
            expect(path.skipToolInstall()).toEqual(true);
        });
    });

});
