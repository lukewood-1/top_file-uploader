const indexGet = (req, res) => {
  res.render('index', {
    user: req.user
  });
}

async function uploadPagePost(req, res){
  // const { file } = req.body;

  // console.log(file);

  console.log(req.body, req.file)

  res.redirect('/');
}

const indexCtrl = {
  indexGet,
  uploadPagePost
};

export default indexCtrl