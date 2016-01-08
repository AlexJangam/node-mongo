 * wt-node-mongo v1.0.0 (http://www.wenable.com/)
 * Copyright Wenable Technologies pvt Ltd 2016 , Inc.
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 * Developed by alexander pradeep jangam alexander.jangam@wenable.com


Documentation :
This is Node Plugin for connecting with mongoDB

Defaultly this plugin connects to local mongoDB path "mongodb://localhost:27017", to change it specify full path while connecting to DB

mongoPg.setCollection  - set a default collection in case we are working with single collection but is ineffective if we specify collection names during operations ,
mongoPg.setCollection("defalutCollectionName")

mongoPg.newCollection - create a blank collection ,
mongoPg.newCollection("newCollectionName")

mongoPgn.add - Add to the collections and create a collections and add it, if the collection is not present,
mongoPgn.add("collectionName",{data},callback(optional)) - note: "collectionName" can be ignored if defaultCollections name si specified

mongoPgn.addBulk - Bulk upload a set of data into DB,
mongoPgn.addBulk("collectionName",[{data}],callback(optional))

mongoPgn.remove - Remove records matching with the function
mongoPgn.remove("collectionName",{},onlyOne(optional),callback(optional)) - {} object reference to find with this data in collection, onlyOne is boolean and deletes only one if true.

mongoPgn.search  - search functionality
mongoPgn.search("collectionName","searchQuery",callback(optional)) - searchQuery can be custom query other than default search provided; {"n1":"v1","n2":v2}

mongoPgn.update - update existing functions
mongoPgn.update("collectionName","searchQuery","upQuery",callback(optional),firstOnly) upQuery is the data to be updated ex: update its filed x with 123 ; upQuery = {x:123}


mongoPgn.getSample - get first record of collection
mongoPgn.getSample("colectionName",CallBack)
