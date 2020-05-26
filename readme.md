# pxls_place
pxls_atlas is a fork of place_atlas.

It allow you to reference different part of a finished canvas.

The main difference with the original is that you can now have multiple canvas.

It also have a node.js backend, and come with a new button that allow to disable the drawing of line for unhighlited element.

## adding a new canvas
- add it to the config.json file, idincating it's width and height, in pixel.
- create a folder data/{CANVAS_NAME}
- place the canvas in data/{CANVAS_NAME}/image.png (in the png format)
- create a file data/{CANVAS_NAME}/info.json containing "[]" (without the two ")
- restart the server

## adding an element in the canvas
You can use the contribute button in the canvas to select an area, and indicate a name, a description, a subreddit (inherited from place_atlas) and multiple website (come from this fork).

the website should be in the form
sitename1
http://examplesite.org
anothersite
http://sitefortest.space

Once finish, click on the button to continue.
You will have a dictionary to add to the corresponding info.json file. please keep background at the beggining of the file.
