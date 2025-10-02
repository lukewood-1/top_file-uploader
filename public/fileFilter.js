const input = document.getElementById('upload-file');
const label = document.querySelector('.fileLabel');

input.addEventListener('cancel', e => {
  e.preventDefault()
});

input.addEventListener('change', e => {
  const sizeLimit = 512000;
  if(e.target.files[0].size > sizeLimit){
    e.preventDefault();
    label.className = 'invalid';
    label.textContent = `Upload failed: Cannot upload files bigger than ${sizeLimit / 1000}kb`;
    return;
  }
  
  const size = e.target.files[0].size;
  const isKb = size > 1024;
  const hrSize = size > 1024 ? (size / 1000).toFixed(1) : size;
  const name = isKb ? 'kb' : 'b';
  label.className = 'valid';
  label.textContent = `file size: ${hrSize}${name}`;
})