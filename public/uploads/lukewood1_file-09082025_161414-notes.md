# To-do list of shit I gotta do for this damn app to work properly - why so much damn work just for things to work? Tooling sucks so much in JS I wanna go to sleep just for thinking about it, holy moly


Mission:
- Create a desktop environment-styled window for the user CRUD view. Possibly iteratively showing the user-acessible directories in divs that contain a folder icon and the dir name?

Tasks:
- FIX: show errors array in login page - currently no feedback is given when login does not succeed.
- Add download, rename and delete funcions for the file details view
- Add folderDetails view (where in the UI though? MAYBE CSS modal button with openFolder and folderDetails links)
- Add delete, rename and moveParent functions to the folder details view
- Make the deleteFile button conditional to a logged user (fileDetails view to be used in the shareFolderLink function)
	 - shareFolderLink function - No login wall, but load ONLY the files in the shared folder, not parent or children folders. Clicking in the folder sends the user to a fileDetails view but unrestricted, with the download button ONLY active, not the delete button
