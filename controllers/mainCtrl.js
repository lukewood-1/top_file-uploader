import orm from "../db/dbClient.js";
import fs from 'fs/promises';
import path from 'path';
import pathUtil from "../app.js";
import bcrypt from 'bcrypt';

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
  const directories = [];
  for await(const dir of userFolders){
    const obj = {};
    obj.id = dir.id;
    obj.name = dir.name.split('_')[1];
    directories.push(obj);
  }

  res.render('upload-page', {
    user: req.user,
    directories: directories
  });
}

async function uploadPagePost(req, res){
  const { folderId } = req.body;
  let filename = req.file.filename.split('-')[2];
  const filepath = `${path.join(pathUtil.__dirname, 'public', 'uploads')}/${req.file.filename}`;
  const file = await fs.readFile(filepath);


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


  await orm.file.create({
    data: data
  });

  res.redirect('/main/dashboard');
}

const explorerDirData = async dirId => {
  const data = {
    directories: {
      current: {},
      children: [],
      parent: {}
    }, 
    files: []
  };

  try {
    const targetFolder = await orm.folder.findUnique({
      where: {
        id: dirId
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

    const dirObj = {};
    dirObj.name = targetFolder.name.split('_')[1];
    dirObj.id = dirId;
    data.directories.current = dirObj;

    for await(const file of targetFolder.files){
      const fileObj = {};
      fileObj.id = file.id;
      fileObj.name = file.name;
      data.files.push(fileObj);
    }

    for await(const dir of targetFolder.children){
      const folderObj = {};

      folderObj.id = dir.id;
      folderObj.name = dir.name.split("_")[1];

      data.directories.children.push(folderObj);
    }

    const allUserFolders = await orm.folder.findMany({
      where: {
        folderOwner: targetFolder.folderOwner
      }
    });

    const userDirs = [];
    for await(const d of allUserFolders){
      const obj = {};
      obj.id = d.id;
      obj.name = d.name.split('_')[1];
      userDirs.push(obj);
    };
    data.directories.userFolders = userDirs;

    return data
  } catch (e) {
    console.error(e);
  }
}

const explorerDir = async (req, res) => {
  const { dirId } = req.params;
  try {
    const data = await explorerDirData(+dirId.slice(1));

    res.render('fileExplorer', {
      user: req.user,
      data: data
    })
  } catch (e) {
    console.error(e);
  }
}

const dirStatsData = async (req, dirId) => {
  try {
    const query = await orm.folder.findUnique({
      where: {
        id: dirId
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

    const folders = [];
    for await(const folder of userFolders){
      if(folder.id === query.parentId){
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

    return folder;
  } catch (e) {
    console.error(e);
  }
}

const dirStats = async (req, res) => {
  const { dirId } = req.params;

  try {
    const folder = await dirStatsData(req, +dirId.slice(1));

    res.render('dirDetails', {
      user: req.user,
      folder
    })
  } catch (e) {
    console.error(e);
  }
}

const explorerFileData = async fileId => {
  const query = await orm.file.findUnique({
    where: {
      id: fileId
    }
  });

  const assFolder = await orm.folder.findFirst({
    where: {
      id: query.fileFolder
    }
  });

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
  
  return stats
}

const explorerFileData_folders = async folderOwnerId => {
  const folders = await orm.folder.findMany({
    where: {
      folderOwner: folderOwnerId
    }
  });

  const folderData = [];
  for await(const f of folders){
    const obj = {
      id: f.id,
      name: f.name.split('_')[1]
    };
    folderData.push(obj);
  }

  return folderData
};

const explorerFile = async (req, res) => {
  const { fileId } = req.params;

  const data = await explorerFileData(+fileId.slice(1));

  const folderData = await explorerFileData_folders(data.fileOwner);

  res.render('fileDetails', {
    file: data,
    user: req.user,
    folders: folderData
  });
}

const createFolder = async (req, res) => {
  const { newFolder, parentFolder, userRootFolder } = req.body;

  try {
    const target = await orm.folder.create({
      data: {
        name: `${req.user.username}_${newFolder}`,
        userId: {connect: {id: req.user.id}},
        parentFolder: {connect: {id: +parentFolder}}
      }
    });

    const data = await explorerDirData(+userRootFolder);

    req.flash('success', true);
    req.flash('successContent', `folder '${newFolder}' created and placed under the '${data.directories.parent ? data.directories.parent.name : 'home'}`);
    req.flash('successTitle', 'Folder created!');

    res.render('fileExplorer', {
      user: req.user,
      data,
      messages: req.flash()
    });
  } catch (e){
    console.error(e);
  }
}

const sendClientFile = async (req, res) => {
  const { fileId } = req.params;

  const query = await orm.file.findUnique({
    where: {
      id: +fileId.slice(1)
    }
  });


  const fileName = path.join(pathUtil.__dirname, query.path);

  res.download(query.path, query.name, err => {
    if(err) {
      console.error('download error', err);
    } else {
      console.log(`file ${query.name} downloaded successfully by address ${req.host}`)
    }
  });
}

const deleteFile = async (req, res) => {
  const { fileId, fileFolder } = req.body;

  let target;
  const oldTarget = await orm.file.findUnique({
    where: {
      id: +fileId
    }
  });
  try {
    target = await orm.file.delete({
      where: {
        id: +fileId
      }
    });
    
    req.flash('success', `file ${oldTarget.name} deleted.`);
    res.redirect(`/main/explorer/dir:${+fileFolder}`);
  } catch (error) {
    console.error(error)
  }
}

const renameFile = async (req, res) => {
  const { fileId, renameInput, fileFolder } = req.body;
  let target;
  let oldTarget;

  try {
    oldTarget = await orm.file.findUnique({
      where: {
        id: +fileId
      }
    });

    let fileData;
    let folderData;
    if(renameInput.length === 0){
      req.flash('fail', true);
      req.flash('failTitle', 'Could not rename file');
      req.flash('failContent', 'You cannot rename a file to an empty label');
      fileData = await explorerFileData(+fileId);
      folderData = await explorerFileData_folders(fileData.fileFolder);

      res.render('fileDetails', {
        user: req.user,
        file: fileData,
        messages: req.flash(),
        folders: folderData
      });
      return;
    }

    target = await orm.file.update({
      where: {
        id: +fileId
      },
      data: {
        name: renameInput
      }
    });

    fileData = await explorerFileData(+fileId);
    folderData = await explorerFileData_folders(fileData.fileFolder);

    req.flash('success', true);
    req.flash('successTitle', 'File rename - success');
    req.flash('successContent', `file '${oldTarget.name}' is now named '${renameInput}'.`);
    res.render('fileDetails', {
      user: req.user,
      file: fileData,
      messages: req.flash(),
      folders: folderData
    });
  } catch(e) {
    console.error(e);
  }
}

const deleteFolder = async (req, res) => {
  const { folderId, parentId } = req.body;

  try {
    if(!parentId){
      genFlashMsg(req, 'fail', 'No deleting root folder', "This is your root folder. It is crucial to the system, so you can delete anything but it.");

      const data = await explorerDirData(+folderId);
      res.render('fileExplorer', {
        user: req.user,
        data,
        messages: req.flash()
      });
      return;
    }

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

  } catch (e) {
    console.error(e);
  }
}

const renameFolder = async (req, res) => {
  const { folderId, newFolderName } = req.body;

  const result = await orm.folder.update({
    where: {
      id: +folderId
    },
    data: {
      name: `${req.user.username}_${newFolderName}`
    }
  });

  res.redirect(`/main/explorer/dirDetails:${+folderId}`);
}

const switchFolderParent = async (req, res) => {
  const { folderId, chosenFolder } = req.body;

  const target = await orm.folder.findUnique({
    where: {
      id: +folderId
    }
  });

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

const shareFolder = async (req, res) => {
  const { folderId } = req.body;

  try {
    const query = await orm.shareableLink.create({
      data: {
        userId: {connect: {id: req.user.id }},
        folderId: {connect: {id: +folderId}}
      }
    });

    req.flash('notification', true);
    req.flash('notificationTitle', 'shareable link generated! Link to your folder:');
    req.flash('notificationContent', `http://${req.get('host')}/share:${query.link}`);

    const folderData = await dirStatsData(req, +folderId);

    res.render('dirDetails', {
      user: req.user,
      folder: folderData,
      messages: req.flash()
    });
  } catch (e) {
    console.error(e);
  }
}

const switchFileFolder = async (req, res) => {
  const { fileId, newFileFolder } = req.body;
  console.log('fileId and newFileFolder: ', fileId, newFileFolder);

  await orm.file.update({
    where: {
      id: +fileId
    },
    data: {
      fileFolder: +newFileFolder
    }
  });

  const file = await explorerFileData(+fileId);

  const targetFile = await orm.file.findUnique({
    where: {
      id: +fileId
    }
  });

  const fileFolder = await orm.folder.findUnique({
    where: {
      id: targetFile.fileFolder
    }
  });
  console.log('targetFile: ', targetFile, 'fileFolder: ', fileFolder);
  const folders = await explorerFileData_folders(file.fileOwner);

  genFlashMsg(req, 'success', 'file moved!', `file ${file.name} belongs now to ${fileFolder.name.split('_')[1]}`);

  res.render('fileDetails', {
    user: req.user,
    file,
    folders,
    messages: req.flash()
  })
}

const genFlashMsg = async (req, method, title, content) => {
  req.flash(method, true);
  req.flash(`${method}Title`, title);
  req.flash(`${method}Content`, content);
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
  switchFolderParent,
  shareFolder,
  switchFileFolder
}

export const fetchUtils = {
  explorerDirData,
  explorerFileData,
  dirStatsData,
  genFlashMsg
}

export default mainCtrl