# depver

## Install

```sh
npm i -g npm-dependency-versions
```

## Binary dependencies

You'll need node & npm. Detective mode also requires git to be on the path.

## CLI

**Usage:** `depver [packages...]`

Determine the latest available version of npm packages at a given point in time. Parses local `package.json` if no packages are specified. Git blames local `package.json` to infer dates if no dates are specified either.

| Options: | |
|---|---|
| `-h, --help` | output usage information |
| `-d, --date [date]` | the date at which the packages should be versioned (defaults to the present moment) |
| `-o, --output [filename]` | file to write the output to (defaults to stdout) |

## Examples

```sh
depver
```

Assumes you are in the root of an npm package (which does not need to be published on npmjs.org), which is git versioned. Git blames `package.json` in the current folder, determines when each dependency entry was added, and queries npmjs.org to determine which specific version of each dependency would have been returned at that time given the version range specified.

```sh
depver --date=2016-07-06
```

Assumes you are in the root of an npm package. Determines what versions of each dependency in the local `package.json` would have satisfied the specified version range therein on 2016-07-06.

```sh
depver mithril urijs --date=2016-07-06
```

Determines what the latest versions of `mithril` and `urijs` would have been on 2016-07-06.
