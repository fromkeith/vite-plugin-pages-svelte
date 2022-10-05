import type { PreRoute } from './types/route';
import type { FileOutput } from './types/page';
import { isDynamicRoute, isCatchAllRoute } from './utils/validate';
import { stringifyRoutes } from './stringify';
import { haveChildren } from './crawler/crawler';
import { extname } from 'path';
import { sortRoute } from './utils/route';
import { slash } from './utils/convert';

/**
 * Generate
 * @param pages
 * @returns
 */
export function generateRoutes(pages: FileOutput[]): PreRoute[] {
  const routes: PreRoute[] = [];

  for (let i = 0; i < pages.length; i++) {
    const fixedPath = slash(pages[i].path);
    const node = fixedPath.split('/')[fixedPath.split('/').length - 1];
    const fileExt = extname(node);
    const isDynamic = isDynamicRoute(node.replace(fileExt, ''));
    const isCatchAll = isCatchAllRoute(node.replace(fileExt, ''));
    const normalizedName = isDynamic
      ? node
          .replace(fileExt, '')
          .replace(/^\[(\.{3})?/, '')
          .replace(/\]$/, '')
      : node.replace(fileExt, '');
    const normalizedPath = normalizedName.toLowerCase();
    let name: string;
    if (normalizedPath === 'index') {
      name = '/';
    } else {
      if (isCatchAll) {
        name = '/*';
      } else if (isDynamic) {
        name = `/:${normalizedName}`;
      } else {
        name = `/${normalizedPath}`;
      }
    }

    if (!haveChildren(pages[i])) {
      routes.push({
        name,
        path: pages[i].path,
      });
      continue;
    }

    // flatten if we can otherwise spa fails
    if (pages[i].children && pages[i].children!.length === 1){
      const c = pages[i].children as FileOutput[];
      const myPath = slash(c[0].path);
      const myNode = myPath.split('/')[myPath.split('/').length - 1]
      const myFileExt = extname(myNode);
      if (isDynamicRoute(myNode.replace(myFileExt, ''))) {
        const myNorm = myNode
          .replace(myFileExt, '')
          .replace(/^\[(\.{3})?/, '')
          .replace(/\]$/, '');
        routes.push({
          name: name + `/:${myNorm}`,
          children: generateRoutes(c[0].children as FileOutput[]),
        });
        continue;
      }
    }

    routes.push({
      name,
      children: generateRoutes(pages[i].children as FileOutput[]),
    });
  }

  return routes;
}

/**
 * This pretty much acts as a final codegen for it to be executed by Vite.
 * @param {PreRoute[]} routes
 * @returns {String}
 */
export function generateClientCode(routes: PreRoute[]): string {
  const { imports, stringRoutes } = stringifyRoutes(routes.sort(sortRoute));

  return (
    `${imports.join(';\n')}${imports.length > 1 ? ';' : ''}\n\n` +
    `const routes = ${stringRoutes};\n\n` +
    `export default routes;`
  );
}
