# license-checker

> Generate a license data csv file based on each npm module within basepath

## Usage

```bash
npm install
BASE_PATH=$HOME/git/repo CSV_PATH=./licenses/license.csv node .
```

* `BASE_PATH` should point to the root directory that contains the packages. However, it may point to any arbitrary directory and will then
 traverse its child folders recursively looking for `package.json` files. `node_modules`-folders are ignored.
 Defaults to `./../..` (cloud_apps root)
* `CSV_PATH` determines the path to the CSV file that will be generated. The folder must exist. Defaults to
 `cloud_apps/license.csv`
