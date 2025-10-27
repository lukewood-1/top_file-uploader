const indexGet = async (req, res) => {
  try {
    res.render('index', {
      user: req.user,
    });
  } catch (e) {
    console.error(e);
  }
}

const indexCtrl = {
  indexGet,
};

export default indexCtrl