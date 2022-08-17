import { resolve, normalize } from 'path';
import { haveChildren, traverse } from '../src/crawler/crawler';
import { FileOutput } from '../src/types/page';

const testPagesDir = 'test/assets/pages';
const testDeepPagesDir = 'test/assets/deep-pages';

const currentPath = resolve();

describe('Crawler', () => {
  test('Traverse test page dirs', async () => {
    const result = await traverse(testPagesDir, ['svelte'], []);
    const expectedResult = [
      {
        path: normalize(`${currentPath}/test/assets/pages/index.svelte`),
      },
      {
        path: normalize(`${currentPath}/test/assets/pages/components.svelte`),
      },
      {
        children: [
          {
            path: normalize(`${currentPath}/test/assets/pages/blog/index.svelte`),
          },
          {
            path: normalize(`${currentPath}/test/assets/pages/blog/[id].svelte`),
          },
          {
            children: [
              {
                path: normalize(`${currentPath}/test/assets/pages/blog/today/index.svelte`),
              },
            ],
            path: normalize(`${currentPath}/test/assets/pages/blog/today`),
          },
        ],
        path: normalize(`${currentPath}/test/assets/pages/blog`),
      },
      {
        children: [
          {
            path: normalize(`${currentPath}/test/assets/pages/about/index.svelte`),
          },
        ],
        path: normalize(`${currentPath}/test/assets/pages/about`),
      },
      {
        children: [
          {
            path: normalize(`${currentPath}/test/assets/pages/__test__/index.svelte`),
          },
        ],
        path: normalize(`${currentPath}/test/assets/pages/__test__`),
      },
      {
        path: normalize(`${currentPath}/test/assets/pages/[userId].svelte`),
      },
      {
        children: [
          {
            path: normalize(`${currentPath}/test/assets/pages/[sensor]/current.svelte`),
          },
          {
            path: normalize(`${currentPath}/test/assets/pages/[sensor]/[...all].svelte`),
          },
        ],
        path: normalize(`${currentPath}/test/assets/pages/[sensor]`),
      },
      {
        path: normalize(`${currentPath}/test/assets/pages/[...all].svelte`),
      },
    ];

    expectedResult.forEach((i) => expect(result).toContainEqual(i));
  });

  test('Traverse test deep pages dir', async () => {
    const result = await traverse(testDeepPagesDir, ['svelte'], []);
    const expectedResult = [
      {
        children: [
          {
            children: [
              {
                path: normalize(`${currentPath}/test/assets/deep-pages/foo/pages/index.svelte`),
              },
            ],
            path: normalize(`${currentPath}/test/assets/deep-pages/foo/pages`),
          },
        ],
        path: normalize(`${currentPath}/test/assets/deep-pages/foo`),
      },
      {
        children: [
          {
            children: [
              {
                path: normalize(`${currentPath}/test/assets/deep-pages/bar/pages/index.svelte`),
              },
            ],
            path: normalize(`${currentPath}/test/assets/deep-pages/bar/pages`),
          },
        ],
        path: normalize(`${currentPath}/test/assets/deep-pages/bar`),
      },
    ];

    expectedResult.forEach((i) => expect(result).toContainEqual(i));
  });

  test('Have children - Should return true', () => {
    const files: FileOutput = {
      path: '/',
      children: [{ path: '/about' }],
    };
    const result = haveChildren(files);
    expect(result).toBe(true);
  });

  test('Have children - Should return false', () => {
    const files: FileOutput = {
      path: '/',
    };
    const result = haveChildren(files);
    expect(result).toBe(false);
  });
});
