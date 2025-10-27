const renameBtn = document.querySelector('.show-rename-form');
const target = document.getElementById('rename-input');
const oldName = document.querySelector('.old-name');
const oldInput = oldName.textContent;
const ext = oldInput.split('.')[1];


renameBtn.addEventListener('click', e => {
  target.value = `.${ext}`;
  target.focus();
  target.setSelectionRange(0, 0);
});