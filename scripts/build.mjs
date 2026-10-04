import {mkdir,copyFile,rm} from 'node:fs/promises';
const files=['index.html','src/app.js','src/styles.css','src/journal-model.js','src/journal-store.js','src/journal-ui.js','manifest.webmanifest','sw.js','assets/icon.svg','data/sample.csv'];
await rm('dist',{recursive:true,force:true});
for(const f of files){await mkdir(`dist/${f.split('/').slice(0,-1).join('/')}`,{recursive:true});await copyFile(f,`dist/${f}`);}
console.log(`Built ${files.length} static assets. Personal CSVs and backups are excluded.`);
