import orm from "../db/dbClient.js";
import { fetchUtils } from "./mainCtrl.js";

const viewSharedDir = async (req, res) => {
  const { dir } = req.query;

  const shareLink = await orm.shareableLink.findFirst({
    where: {
      link: dir
    }
  });

  const query = await orm.folder.findUnique({
    where: {
      id: shareLink.sharedFolder
    },
    include: {
      children: true,
      files: true
    }
  });

  const folderData = await fetchUtils.explorerDirData(query.id);
  folderData.directories.current.link = dir;

  res.render('fileExplorerGuest', {
    data: folderData
  })
}

const viewSharedFile = async (req, res) => {
  const { dir, fileId } = req.query;

  const file = await fetchUtils.explorerFileData(+fileId);
  file.assFolder.link = dir

  res.render('fileDetailsGuest', {
    file
  })
}

const viewSharedLink = async (req, res) => {
  try {
    if(req.query.fileId){
      return viewSharedFile(req, res);
    } else {
      return viewSharedDir(req, res);
    }
  } catch (e) {
    console.error(e)
  }
}

const shareCtrl = {
  viewSharedLink
}

export default shareCtrl