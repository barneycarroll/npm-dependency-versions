# depver

## Install

```sh
npm i -g depver
```

## CLI

**Usage:** `depver [packages...]`

Determine the latest available version of npm packages at a given point in time. Parses local package.json if no packages are specified.

| Options: | |
|---|---|
|`-h, --help`
| output usage information
|
|`-d, --date [date]
| the date at which the packages should be versioned (defaults to the present moment)

## Eg

```
$ depver mithril mithril-router --date 2015-06-11
Querying npm's release history for mithril...
Querying npm's release history for mithril-router...
{
  "mithril": "0.2.0",
  "mithril-router": "1.3.3"
}
```
