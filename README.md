## Description 
This is a tool for building complex MongoDB queries.  In my exprerience, queries that contain nested boolean logic with nested $and and $or conditions can get confusing fast.  Consider writing a mongo query for this logic ( ( ( (hasMicrowave) and (hasRefrigerator) ) or (hasKitchen) ) and ( ( (hasHotTub) or (hasJacuzzi) ) and (isInWalkingDistanceToSlopes) ) ) 


## Demo
[Click here for a demo](http://ericpet.com:8080/mongo-query-builder/index.html "Title").

## Instructions for Developing with Hot Module Reload Support
  * npm install
  * sudo npm install -g webpack-dev-server  
  * webpack-dev-server --host 0.0.0.0
  * browser http://IPADDR:8080
