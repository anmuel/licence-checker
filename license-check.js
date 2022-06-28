#!/usr/bin/env node

const {readDirDeepSync} = require('read-dir-deep');
const path = require('path');
const checker = require('license-checker');
const {exec} = require('child_process');
const csvWriter = require('csv-writer');

const basePath = process.env.BASE_PATH || path.resolve(__dirname, '..', '..');
const paths = readDirDeepSync(basePath, {patterns: ['**/package.json'], ignore: ['**/node_modules/**']});
console.log('npm repositories:');
console.table(paths);
const promises = [];

console.log('Parsing license data ...');
paths.forEach((_path) => {
  promises.push(new Promise((resolve, reject) => {
    const directory = path.dirname(_path);
    // the node_modules must be installed for each npm package. That's where license-checker gets its data from.
    exec('npm install', {cwb: directory}, (err) => {
      if (err) {
        console.warn(err);
      }
      checker.init({
        start: directory,
        direct: true,
        excludePrivatePackages: true,
      }, (err, packages) => {
        if (err) {
          reject(err);
        } else {
          resolve(packages);
        }
      });
    })
  }));
});

function splitNameAndVersionFromPackagename(packageName) {
  const split = packageName.split('@');
  const isScoped = split.length > 2;
  const name = isScoped ? '@' + split[1] : split[0];
  const version = split[split.length - 1];
  return {name, version};
}

Promise.all(promises).then((packagesArr) => {
  console.log('Converting license data to CSV ...');
  const packages = [];

  packagesArr.forEach((packagesResultObj) => {
    Object.keys(packagesResultObj).forEach((pkg) => {
      const obj = {...packagesResultObj[pkg]};
      const nameVersion = splitNameAndVersionFromPackagename(pkg);
      obj.name = nameVersion.name;
      obj.version = nameVersion.version;
      packages.push(obj);
    });
  });

  const outputPath = process.env.CSV_PATH || path.join(basePath, 'licenses.csv');
  const csvWriterImpl = csvWriter.createObjectCsvWriter({
    path: outputPath,
    header: [
      {id: 'name', title: 'Package'},
      {id: 'version', title: 'Version'},
      {id: 'licenses', title: 'License(s)'},
    ]
  });
  csvWriterImpl.writeRecords((packages))
    .then(() => {
      console.log('Wrote to ', outputPath);
    });
});
