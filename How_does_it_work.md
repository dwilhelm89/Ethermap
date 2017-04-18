How does it work?
=========

### Synchronization
Ethermap makes heavy use of WebSockets to synchronize the map editor between all clients. socket.io as a library has been chosen for the automatic fallback to Long-Polling.

Within Leaflet, the L.stamp function has been adapted to provide unique layer id's which are required to synchronize the map content between different clients. Based on the Leaflet.Draw events, all changes are sent to the server, where they are stored in CouchDB and distributed again via WebSockets. Leaflet.Draw has however been modified to allow only one feature to be edited at a time. In addition to that, every change will be transmitted. Usually Leaflet.Draw only applies changes after hitting "Save".
The feature properties views are adapted from the JSON categories of the [iD editor](https://github.com/openstreetmap/iD) to provide OSM like feature properties. Changes to the feature properties will also be directly transferred.
Features are transferred as GeoJSON objects.

To watch users or show there current workarea, all movements (panning/zooming) are also transferred with the current bounding box of the map window. To prevent feedback, custom event listeners have been used instead of the existing Leaflet events. 

### Version-control
For the feature history, every change is stored as a new document revision in CouchDB and thus can be requested individually. This works as long as no "Compaction" operation will be applied to the database in which case all older revisions would be deleted. The diffs are calculated dynamically on the client side.

For the global map history, all feature actions are stored within a seperate database to allow the creation of a map history. To prevent a cluttering of the list, subsequent entries of a single user are aggregated on the client side. Possible actions are: 
 * create feature
 * delete feature
 * edit properties
 * edit geometry
 * revert feature