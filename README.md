# ipGrapperFramework
An example framework for an IP grabber

## setup

This program requires the node express module.
 
### database

 you must connect the index.js file to your mysql database. 
 The first time you start this program make sure to call the `configureTables` function in the index.js file.
 
 In order to acsess admin privleges you need to add an admin key to the adminperns table.
 
 You can do this with `INSERT INTO adminperms (name, keyVal, plevel) VALUES (name, yourKey, 4)` now once you start the server, navigate to http://localhost:3002/admin?key=yourKey 
 
 In this GUI you can add/delete other admin permissions.
 
 If authentication fails then you will be redirected to the wikipedia page for digital security.

## Creating new paths

You can create new paths to capture data as long as you have the nesessary permissions.

If someone then tries to accsess http://hostDomain/thePath then it will capture all the information and save it to this path profile.

This will then redirect you to the wikipedia page for L.

 
