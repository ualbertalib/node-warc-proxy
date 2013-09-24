node-warc-proxy
===============

Simple node.js server to allow navigation of the contents of a WARC file

## Requirements
- [node.js](http://nodejs.org/)
- [npm](https://npmjs.org/)
- [csv plugin](https://github.com/wdavidw/node-csv): npm install csv
- [Internet Archive WARC tools](https://github.com/internetarchive/warctools):

```
git clone https://github.com/internetarchive/warctools.git
cd warctools
sudo python ./setup.py install
```

Currently works on hard-coded warc [drupalib.interoperating.info.warc.gz](https://dl.dropboxusercontent.com/u/1015702/drupalib.interoperating.info.warc.gz)

## To run

- Copy drupalib.interoperating.info.warc.gz to diretory ../warc (relative to directory where warcnode.js is installed)
- gunzip drupalib.interoperating.info.warc.gz
- generate the csv index (in the same directory as drupalib.interoperating.info.warc.gz):

```
warkindex drupalib.interoperating.info.warc > drupalib.interoperating.info.warc.csv
```

- in the directory with warcnode.js:

```
node warcnode.js
```
- visit http://127.0.0.1:1337/WARC/

## Note

The WARC does not contain all the files that are linked in the html - notably, the /themes/ directory is absent. 
404 errors are returned for these requests.

## TODO

- diagnose problem that causes truncated html sometimes
