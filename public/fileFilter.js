const input = document.getElementById('upload-file');
const fileLabel = document.querySelector('.uploaded-file-name');
const fileSize = document.querySelector('.uploaded-file-size');
const wrapper = document.querySelector('.uploaded-file-details');

input.addEventListener('cancel', e => {
  e.preventDefault()
});

input.addEventListener('change', e => {
  wrapper.style.display = 'block';

  const sizeLimit = 512000;
  if(e.target.files[0].size > sizeLimit){
    e.preventDefault();
    fileLabel.className = 'invalid';
    fileLabel.textContent = `Upload failed: Cannot upload files bigger than ${sizeLimit / 1000}kb`;
    return;
  }
  
  const size = e.target.files[0].size;
  const isKb = size > 1024;
  const hrSize = size > 1024 ? (size / 1000).toFixed(1) : size;
  const name = isKb ? 'kb' : 'b';
  const fileName = e.target.files[0].name;
  fileLabel.textContent = `${fileName}`;
  fileSize.className = 'valid';
  fileSize.textContent = `${hrSize}${name}`;
})