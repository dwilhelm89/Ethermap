Ethermap
=========

Ethermap is a real-time collaborative map editor allowing:
* synchronization of geoobjects between all clients
* highlight changes for user-awareness
* store each change as a new revision
* browse revisions and show changes in the map context
* revert to older revisions or restore deleted features


[How does it work?](How_does_it_work.md) shortly explains the overall concept.

For a [demo](http://giv-wilhelm.uni-muenster.de), open the following website with several browsers log into the same map id and different user names.


The application has been built as part of my master thesis at the ifgi (Institute for Geoinformatics, WWU Münster).


###Technologies

* [node.js]
* [AngularJS]
* [socket.io]
* [CouchDB]
* [Grunt]
* [Bower]




###Install dependencies (Ubuntu)

It is assumed that you have installed node.js (> 0.10.26)
```
sudo apt-get install couchdb
npm install -g grunt-cli
npm install -g bower
npm install -g forever

```


###Run for Development


```
npm install
bower install
grunt serve

```

###Run for Production


```
npm install
bower install
grunt build
NODE_ENV=production forever -o out.log -e err.log start dist/server.js

```


###Testing

Tests are based on Karma + Jasmine

For single test runs:
```
grunt test
```
For continuous testing:
```
npm install -g karma-cli
karma start
```

###Create the JSDoc pages

```
grunt docs
```


###License

[Apache v2.0](license.md) - Dennis Wilhelm 2014



[node.js]:http://nodejs.org/
[CouchDB]:http://couchdb.apache.org/
[AngularJS]:https://angularjs.org/
[Grunt]:http://gruntjs.com/
[Bower]:http://bower.io/
[socket.io]:http://socket.io/
