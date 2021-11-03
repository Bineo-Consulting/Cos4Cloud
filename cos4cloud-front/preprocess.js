const path = require('path')
const fs = require('fs-extra')
const wwwDir = path.resolve(__dirname, 'www')
const enDir = path.resolve(__dirname, 'www/en')
const publicDir = path.resolve(__dirname, 'public')
const apiDir = path.resolve(__dirname, 'apidoc')

const copyFile = (f) => {
  if (f.includes('head.html')) return null
  if (f.includes('.html')) {
    const head = fs.readFileSync(path.resolve(publicDir, 'head.html'))
    const data = fs.readFileSync(f)
    const dest = f.replace('public', 'www')
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(dest, `${head}\n${data}`)
  }
}

async function* getFiles(dir) {
  const { resolve } = require('path');
  const { readdir } = require('fs').promises;
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

const preprocess = async () => {
  for await (const f of getFiles('public')) {
    copyFile(f)
  }
}
if (!process.argv.join(',').includes('preprocess')) {
  const hound = require('hound')
  const watcher = hound.watch(publicDir)
  watcher.on('create', function(file, stats) {
    console.log(file + ' was created')
    copyFile(file)
  })
  watcher.on('change', function(file, stats) {
    console.log(file + ' was changed')
    copyFile(file)
  })
  watcher.on('delete', function(file) {
    console.log(file + ' was deleted')
  })
  let pid = setInterval(() => {
    try {
      const watcherEn = hound.watch(enDir)
      watcher.on('delete', function(file) {
        console.log(file + ' was deleted')
        preprocess()
      })
      clearInterval(pid)
    } catch(_) {}
  }, 2000)
} else {
  preprocess()
}

module.exports = preprocess
