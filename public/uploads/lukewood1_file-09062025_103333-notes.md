# To-do list of shit I gotta do for this damn app to work properly - why so much damn work just for things to work? Tooling sucks so much in JS I wanna go to sleep just for thinking about it, holy moly

- FEAT: Modify the data.directories array obj into an object, with the addition of a 'current' property which will inform where the user is into their file traversals. The current directory list gets renamed into 'children' but its contents get mostly unchanged apart from the current folder which will get moved out. In the view, the current folder won't be rendered as a link but as a paragraph so it does not contain a hiperlink to itself.
data.directories = {
	current: {//current folder in the user traversal. defaults to home},
	children: [//usual data.directories array with all other directories that are not the current one]
}

Pending:
- FIX: Adapt Both schema and file explorer to 1 - have folders as models housing files on them, and 2 - fetching files and folders' names from the database itself, not the file system. That way, the app only depends on the database schema being set up properly(all the folders and files set up correctly);
- FIX: the link property on the file explorer items(folders and files) is not working;
- Create a desktop environment-styled window for the user CRUD view. Possibly iteratively showing the user-acessible directories in divs that contain a folder icon and the dir name?
	- That will need two views: a DIRECTORY VIEW that shows all folders and files in the current directory (with a link to the folder above IF the folder is a branch of the uploads directory, which will be treated as the root), and a FILE VIEW, where it will show convenient details of the user uploaded files, with a download link, a file deletion link and a 'back to directory' link.
	- Render all files and folders contained in the current directory, along with a 'one level up' button(optional - might be too hard to get, if the fs module can't predict what folder the level above is supposed to be);
		- If it's a folder, it gets a folder icon, and it redirects to it's path upon clicking(HTML anchor href to same view with different directory read object, not a script onClick);
		- If it's a file, it gets a file icon, and a click redirects to that file's details window, with routes to download requests or a form to exclude the file(HTML anchor to specific view where one file's stats are read and shown);
		- Organize them as objects passed to the views, with their names(constant) and icons(conditional - file or directory). The path design to the folders can be just a mirror of the uploads folder, with itself as the root (that way it's easier to program the directory traversal). Obs: That's a good call for some client-side rendering, intercepting the requests on the client side to render the directories faster and smoother than reloading the whole page on the server.
		- Access to them should be given through a db query that filters by user - users only have access to their own uploaded files.
- Add a UI form button for creating directories (possibly using the fs node module)
