# node-mongo
node-mongo plugin

 * wt-node-mongo v1.0.0 (http://www.wenable.com/)
 * Copyright Wenable Technologies pvt Ltd 2016 , Inc.
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 * Developed by alexander pradeep jangam alexander.jangam@wenable.com


Documentation :
This is Node Plugin for connecting with mongoDB

It serves as mongo db GUI with documentation.

Defaultly this plugin connects to local mongoDB path "mongodb://localhost:27017", to change it specify full path while connecting to DB


mongoPg.newCollection - create a blank collection ,
mongoPg.newCollection("newCollectionName")

mongoPgn.add - Add to the collections and create a collections and add it, if the collection is not present,
mongoPgn.add("collectionName",{data},callback(optional)) - note: "collectionName" can be ignored if defaultCollections name si specified

mongoPgn.addBulk - Bulk upload a set of data into DB,
mongoPgn.addBulk("collectionName",[{data}],callback(optional))

mongoPgn.search  - search functionality
mongoPgn.search("collectionName","searchQuery",callback(optional)) - searchQuery can be custom query other than defult search provided(in development)
