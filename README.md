node-warc-proxy
===============

Simple node.js server to allow navigation of the contents of a WARC file

## Requirements
- [node.js](http://nodejs.org/)
- [npm](https://npmjs.org/)
- [csv plugin](https://github.com/wdavidw/node-csv): npm install csv csv-stream stream-transform
- stdio plugin: npm install stdio
- [Internet Archive WARC tools](https://github.com/internetarchive/warctools): pip install warctools

Sample warc used in testing: [drupalib.interoperating.info.warc.gz](https://dl.dropboxusercontent.com/u/1015702/drupalib.interoperating.info.warc.gz)

## To run

- Copy drupalib.interoperating.info.warc.gz to directory ../warc (relative to directory where warcnode.js is installed); or elsewhere
- gunzip drupalib.interoperating.info.warc.gz
- generate the csv index (in the same directory as drupalib.interoperating.info.warc.gz):

```
warcindex drupalib.interoperating.info.warc > drupalib.interoperating.info.warc.csv
```

- in the directory with warcnode.js:

```
node warcnode.js --warc ../warc/drupalib.interoperating.info.warc
```

(or substitute the path to your warc)

- visit http://127.0.0.1:1337/WARC/

## Note

- drupalib.interoperating.info.warc does not contain all the files that are linked in the html - notably, the /themes/ directory is absent.
404 errors are returned for these requests.

## TODO

- diagnose problem that causes truncated html sometimes
