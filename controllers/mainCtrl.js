import { orm } from "../db/queries.js";
import fs from 'fs/promises';
import path from 'path';
import pathUtil from "../app.js";

const hrSize = num => (
  num > 1024 ? `${parseInt(num / 1024)}KB`
  : num > (1024**2) ? `${num / 1024 / 1024}MB`
  : `${num}B`
);

async function dashboardGet(req, res){
  try {
    const userRootFolder = await orm.user.findUnique({
      where: {
        id: req.user.id
      },
      include: {
        folders: {
          where: {
            parentId: null
          }
        }
      }
    });

    res.render('dashboard', {
      user: req.user,
      rootFolderId: userRootFolder.folders[0].id
    });
  } catch (e) {
    console.error(e);
  }
}

async function uploadPageGet(req, res){
  const userFolders = await orm.folder.findMany({
    where: {
      folderOwner: req.user.id
    }
  });
  console.log('userFolders: ', userFolders);
  const directories = [];
  for await(const dir of userFolders){
    const obj = {};
    obj.id = dir.id;
    obj.name = dir.name.split('_')[1];
    directories.push(obj);
  }
  console.log('directories: ', directories);

  res.render('upload-page', {
    user: req.user,
    directories: directories
  });
}

async function uploadPagePost(req, res){
  // console.log('req.body: ', req.body);
  // console.log('req.file: ', req.file);
  // console.log('user: ', req.user);
  const { folderId } = req.body;
  let filename = req.file.filename.split('-')[2];
  const filepath = `${path.join(pathUtil.__dirname, 'public', 'uploads')}/${req.file.filename}`;
  const file = await fs.readFile(filepath);

  console.log('folderId: ', folderId);

  const date = new Date(),
    format = num => num >= 10 ? num : '0' + num,
    year = date.getFullYear(),
    month = format(date.getMonth() + 1),
    day = format(date.getDate()),
    hour = format(date.getHours()),
    minute = format(date.getMinutes()),
    second = format(date.getSeconds()),
    fileDate = `${month}/${day}/${year}`,
    fileTime = `${hour}:${minute}:${second}`,
    fileSize = hrSize(req.file.size);

  const data = {
    name: filename,
    file: file,
    size: fileSize,
    uploadTime: fileTime,
    uploadDate: fileDate,
    userId: { connect: {id: req.user.id} },
    folderId: { connect: {id: folderId ? +folderId : 1 } },
    path: req.file.path 
  };
  console.log('newFile obj: ', data);


  await orm.file.create({
    data: data
  });

  res.redirect('/main/dashboard');
}

const explorerDir = async (req, res) => {
  const data = {
    directories: {
      current: {},
      children: [],
      parent: {}
    }, 
    files: []
  };

  const { dirId } = req.params;
  console.log('dirId: ', dirId);

  try {
    const targetFolder = await orm.folder.findUnique({
      where: {
        id: +dirId[1]
      },
      include: {
        files: true,
        children: true
      }
    });

    let parentFolder;
    if(targetFolder && targetFolder.parentId){
      const parentQuery = await orm.folder.findFirst({
        where: {
          id: targetFolder.parentId
        }
      });
      parentFolder = {
        id: parentQuery.id,
        name: parentQuery.name.split('_')[1]
      }
    }

    data.directories.parent = parentFolder;
    // console.log('parentFolder: ', parentFolder);

    const dirObj = {};
    dirObj.name = targetFolder.name.split('_')[1];
    dirObj.id = +dirId[1];
    data.directories.current = dirObj;

    for await(const file of targetFolder.files){
      const fileObj = {};
      fileObj.id = file.id;
      fileObj.name = `${file.id}_${file.name}`;
      data.files.push(fileObj);
    }

    for await(const dir of targetFolder.children){
      const folderObj = {};

      folderObj.id = dir.id;
      folderObj.name = dir.name.split("_")[1];

      data.directories.children.push(folderObj);
      // console.log('folderObj: ', folderObj);
    }

    const allUserFolders = await orm.folder.findMany({
      where: {
        folderOwner: req.user.id
      }
    });

    const userDirs = [];
    for await(const d of allUserFolders){
      // console.log('d: ', d);
      const obj = {};
      obj.id = d.id;
      obj.name = d.name.split('_')[1];
      userDirs.push(obj);
    };
    data.directories.userFolders = userDirs;

    // console.log('data obj: ', data);

    res.render('file-explorer', {
      user: req.user,
      data: data
    })
  } catch (e) {
    console.error(e);
  }
}

const dirStats = async (req, res) => {
  const { dirId } = req.params;

  const query = await orm.folder.findUnique({
    where: {
      id: +dirId[1]
    }
  });

  let parent;

  if(query.parentId){
    parent = await orm.folder.findUnique({
      where: {
        id: query.parentId
      }
    });
  } else {
    parent = {
      name: 'home'
    }
  }

  const assFiles = await orm.file.findMany({
    where: {
      fileFolder: query.id
    }
  });

  const userFolderQuery = await orm.folder.findMany({
    where: {
      folderOwner: req.user.id
    }
  });
  const userFolders = userFolderQuery.filter(record => record.id !== query.id);
  console.log('userFolders: ', userFolders, 'parentId: ', query.parentId);

  const folders = [];
  for await(const folder of userFolders){
    console.log('folder: ', folder);
    if(folder.id === query.parentId){
      console.log('continuing...');
      continue;
    }

    const obj = {
      id: folder.id,
      name: folder.name.split('_')[1]
    };
    folders.push(obj);
  };

  const fileArr = [] ;
  for await(const file of assFiles){
    const obj = {};
    console.log('file: ', file);
    obj.id = file.id;
    obj.name = file.name;
    fileArr.push(obj);
  };

  const assFolders = await orm.folder.findMany({
    where: {
      parentId: query.id
    }
  });

  const children = [];
  for await(const child of assFolders){
    const obj = {};
    obj.id = child.id;
    obj.name = child.name.split('_')[1];
    children.push(obj);
  }

  const folder = {
    id: query.id,
    name: query.name.split('_')[1],
    parent: {
      id: parent.id,
      name: parent.name.split('_')[1]
    },
    children,
    userFolders: folders,
    fileList: fileArr
  };
  console.log('folder obj: ', folder);

  res.render('dirDetails', {
    user: req.user,
    folder
  })
}

const explorerFile = async (req, res) => {
  const { fileId } = req.params;
  const query = await orm.file.findFirst({
    where: {
      id: +fileId.split('_')[0][1]
    }
  });
  // console.log('query result: ', query);

  const assFolder = await orm.folder.findFirst({
    where: {
      id: query.fileFolder
    }
  });
  console.log('assFolder: ', assFolder);

  const stats = {
    name: query.name,
    size: query.size,
    uploadDate: query.uploadDate,
    uploadTime: query.uploadTime,
    id: query.id,
    link: query.path,
    assFolder: {
      id: assFolder.id,
      name: assFolder.name.split('_')[1]
    }
  }
  // console.log('file stats for explorer page: ', stats);

  res.render('fileDetails', {
    file: stats,
    user: req.user
  });
}

const createFolder = async (req, res) => {
  const { newFolder, parentFolder, userRootFolder } = req.body;
  console.log('newFolder: ', newFolder, 'parentFolder: ', parentFolder, 'userRootFolder: ', userRootFolder);

  await orm.folder.create({
    data: {
      name: `${req.user.username}_${newFolder}`,
      userId: {connect: {id: req.user.id}},
      parentFolder: {connect: {id: +parentFolder}}
    }
  });

  res.redirect(`/main/explorer/dir:${userRootFolder}`);
}

const sendClientFile = async (req, res) => {
  const { fileId } = req.params;
  console.log('fileId: ', fileId);

  const query = await orm.file.findUnique({
    where: {
      id: +fileId[1]
    }
  });
  console.log('query: ', query);


  const fileName = path.join(pathUtil.__dirname, query.path);
  console.log('filename: ', fileName);

  res.download(query.path, 'readme.md', err => {
    if(err) {
      console.error('download error', err);
    } else {
      console.log('file downloaded successfully')
    }
  });
}

const deleteFile = async (req, res) => {
  const { fileId, fileFolder } = req.body;
  console.log('fileId: ', fileId, '; fileFolder: ', fileFolder);

  try {
    await orm.file.delete({
      where: {
        id: +fileId
      }
    });
    
    res.redirect(`/main/explorer/dir:${+fileFolder}`);
  } catch (error) {
    console.error(error)
  }
}

const renameFile = async (req, res) => {
  const { fileId, renameInput, fileFolder } = req.body;
  console.log('fileId: ', fileId, '; renameinput: ', renameInput, '; fileFolder: ', fileFolder);

  await orm.file.update({
    where: {
      id: +fileId
    },
    data: {
      name: renameInput
    }
  });

  res.redirect(`/main/explorer/dir:${+fileFolder}`);
}

const deleteFolder = async (req, res) => {
  const { folderId, parentId } = req.body;
  console.log('target and parent ID: ', folderId, parentId);

  const childDirs = await orm.folder.findMany({
    where: {
       parentId: +folderId
    }
  });

  for await(const cDir of childDirs){
    await orm.folder.update({
      where: {
        id: cDir.id
      },
      data: {
        parentId: +parentId
      }
    })
  };

  const files = await orm.file.findMany({
    where: {
      fileFolder: +folderId
    }
  });

  for await(const file of files){
    await orm.file.update({
      where: {
        id: file.id
      },
      data: {
        fileFolder: +parentId
      }
    })
  };

  await orm.folder.delete({
    where: {
      id: +folderId
    }
  });

  res.redirect(`/main/explorer/dir:${+parentId}`)
}

const renameFolder = async (req, res) => {
  const { folderId, newFolderName } = req.body;
  console.log('renameFOlder: ', folderId, newFolderName);

  const result = await orm.folder.update({
    where: {
      id: +folderId
    },
    data: {
      name: `${req.user.username}_${newFolderName}`
    }
  });
  console.log('new record: ', result);

  res.redirect(`/main/explorer/dirDetails:${+folderId}`);
}

const switchFolderParent = async (req, res) => {
  const { folderId, chosenFolder } = req.body;
  // console.log('switchFolderParent: ', folderId, chosenFolder);

  const target = await orm.folder.findUnique({
    where: {
      id: +folderId
    }
  });
  // console.log('target: ', target);

  await orm.folder.update({
    where: {
      id: +folderId
    },
    data: {
      parentId: +chosenFolder
    }
  });

  res.redirect(`/main/explorer/dirDetails:${+folderId}`);
}

const mainCtrl = {
  dashboardGet,
  uploadPageGet,
  uploadPagePost,
  explorerDir,
  explorerFile,
  createFolder,
  sendClientFile,
  deleteFile,
  renameFile,
  dirStats,
  deleteFolder,
  renameFolder,
  switchFolderParent
}

export default mainCtrl