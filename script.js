let htmlBase = '';

// Inicializar TinyMCE
tinymce.init({
  selector: '#editor',
  height: 600,
  menubar: false,
  plugins: 'link image code table lists',
  toolbar: 'undo redo | styleselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code'
});

function cargarHTMLBase() {
  if(!htmlBase) {
    fetch('template.html')
      .then(response => response.text())
      .then(text => {
        htmlBase = text;
        tinymce.get('editor').setContent(htmlBase);
      })
      .catch(error => {
        alert('Error al cargar el template: ' + error);
      });
  } else {
    tinymce.get('editor').setContent(htmlBase);
  }
}

function copiarHTML() {
  var htmlActual = tinymce.get('editor').getContent();
  navigator.clipboard.writeText(htmlActual).then(function() {
    alert('HTML copiado al portapapeles.');
  }, function() {
    alert('Error al copiar el HTML.');
  });
}
