const notifications = document.querySelector('.notification');
const closeBtn = document.querySelector('.notification > div > button');

notifications.showModal();

closeBtn.addEventListener('click', e => {
  notifications.close()
})