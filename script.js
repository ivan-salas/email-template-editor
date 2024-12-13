let htmlBase = '';

// Inicializar TinyMCE
tinymce.init({
  selector: '#editor',
  height: 600,
  menubar: false,
  plugins: 'link image code table lists',
  toolbar: 'undo redo | styleselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code',
  content_style: 'body { font-family: Inter, sans-serif; font-size: 16px; line-height:1.5; }',
  setup: function(editor) {
    editor.on('init', function() {
      console.log('Editor inicializado, iniciando carga del template...');
      if(!htmlBase) {
        console.log('Iniciando la carga del template...');
        fetch('template.html')
          .then(response => {
            console.log('Recibida respuesta del servidor:', response);
            return response.text();
          })
          .then(text => {
            console.log('Texto obtenido:', text.slice(0, 100) + '...');
            htmlBase = text;
            console.log('Asignado htmlBase, estableciendo contenido en TinyMCE');
            tinymce.get('editor').setContent(htmlBase);
            console.log('Contenido establecido correctamente en TinyMCE');
          })
          .catch(error => {
            console.error('Error al cargar el template:', error);
            alert('Error al cargar el template: ' + error);
          });
      } else {
        console.log('htmlBase ya cargado previamente, estableciendo contenido en TinyMCE directamente');
        tinymce.get('editor').setContent(htmlBase);
      }
    });
  }
});

function copiarHTML() {
  var htmlActual = tinymce.get('editor').getContent();
  navigator.clipboard.writeText(htmlActual).then(function() {
    alert('HTML copiado al portapapeles.');
  }, function() {
    alert('Error al copiar el HTML.');
  });
}
