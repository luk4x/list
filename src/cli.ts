#!/usr/bin/env node
import { confirm, intro, isCancel, note, outro, text } from '@clack/prompts';

import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { exitCancel } from './utils/cancel';
import { copyDir } from './utils/copy-dir';
import { getDestBase } from './utils/dest-base';
import { getPackageRootDir } from './utils/package-root-dir';
import { pathExists } from './utils/path-exists';

const DEFAULT_DEST = 'src/components/ui';
const COMPONENT_DIRNAME = 'list';

async function main() {
  intro('@luk4x/list');

  const destInput = await text({
    message: 'Where should the component be installed?',
    placeholder: DEFAULT_DEST,
    defaultValue: DEFAULT_DEST,
  });

  if (isCancel(destInput)) {
    exitCancel();
  }

  const destDir = path.resolve(process.cwd(), getDestBase(destInput));
  const targetDir = path.join(destDir, COMPONENT_DIRNAME);

  const alreadyExists = await pathExists(targetDir);

  if (alreadyExists) {
    const overwrite = await confirm({
      message: `"${path.relative(process.cwd(), targetDir)}" already exists. Overwrite?`,
      initialValue: false,
    });

    if (isCancel(overwrite)) exitCancel();
    if (!overwrite) exitCancel();
  }

  const pkgRoot = getPackageRootDir();
  const templateDir = path.join(pkgRoot, 'templates', COMPONENT_DIRNAME);

  if (!(await pathExists(templateDir))) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  await mkdir(destDir, { recursive: true });
  await copyDir(templateDir, targetDir);

  note(
    ['Installed in:', path.relative(process.cwd(), targetDir)].join('\n'),
    'Done',
  );

  outro('Component copied successfully.');
}

main().catch(err => {
  console.error('\n[Error]', err?.message ?? err);
  process.exit(1);
});
