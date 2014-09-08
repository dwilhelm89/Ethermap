Ethermap
=========

Ethermap is a real-time collaborative map editor allowing:
* synchronization of geoobjects between all clients
* visual highlights of changes creating user-awareness
* watching other users or show their current workarea
* basic feature version control (browse older revisions and revert changes)
* communicating about specific features within the chat


[How does it work?](How_does_it_work.md) shortly explains the overall concept.

For a [demo](http://giv-wilhelm.uni-muenster.de) (desktop only), open the website with several browsers log into the same map id with different user names. Or check out the [video](https://www.youtube.com/watch?v=ByRp-g3egLk).


The application has been built as part of my master thesis at the ifgi (Institute for Geoinformatics, WWU Münster).


###Technologies

* [node.js]
* [AngularJS]
* [socket.io]
* [CouchDB]
* [Grunt]
* [Bower]




###Install dependencies (Ubuntu)

It is assumed that you have installed node.js (developed using 0.10.26)
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
