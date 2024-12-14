import { promises as fs } from 'fs'
import path from 'path'

async function removeDtsFiles(dir: string): Promise<void> {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const files = await fs.readdir(dir, { withFileTypes: true })

    for (const file of files) {
      const fullPath = path.join(dir, file.name)

      if (file.isDirectory()) {
        await removeDtsFiles(fullPath)
      } else if (file.isFile() && (file.name.endsWith('.d.ts') || file.name.endsWith('.d.ts.map'))) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.unlink(fullPath)
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error processing directory ${dir}:`, error)
  }
}

const targetDir = path.join(__dirname, '../', '../', '../', 'utilities/src')

removeDtsFiles(targetDir)
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('All .d.ts and .d.ts.map files have been removed from `utilities` after building `ui`')
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Error removing .d.ts and .d.ts.map files from `utilities`:', error)
  })
