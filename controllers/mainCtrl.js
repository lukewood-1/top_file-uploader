async function uploadPageGet(req, res){
  res.render('upload-page');
}

async function uploadPagePost(req, res){
  console.log('Body: ', req.body, 'file: ', req.file);

  res.redirect('/');
}

const mainCtrl = {
  uploadPageGet,
  uploadPagePost
}

export default mainCtrl