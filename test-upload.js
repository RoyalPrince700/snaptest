const fs = require('fs');
const FormData = require('form-data');

const form = new FormData();
form.append('file', fs.createReadStream('C:/Users/HP/Downloads/RCCG_Job_Descriptions_Updated.docx'));

fetch('https://snaptest-eight.vercel.app/api/extract', {
  method: 'POST',
  body: form,
  headers: form.getHeaders(),
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error); 