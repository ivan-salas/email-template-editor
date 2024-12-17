let htmlBase = ''; // Contenido base HTML

// Inicializar TinyMCE
tinymce.init({
  selector: '#editor',
  height: 600,
  menubar: true, // Activa la barra de menús
  plugins: [
    // Plugins básicos del ejemplo oficial
    'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
    'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'emoticons', 'help',
    // Plugins premium activados
    'checklist', 'mediaembed', 'casechange', 'export', 'formatpainter', 'pageembed', 
    'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 
    'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 
    'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 
    'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
  ],
  toolbar: `
    undo redo | styles fontfamily fontsize | bold italic underline strikethrough
    | alignleft aligncenter alignright alignjustify | lineheight checklist numlist bullist outdent indent
    | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography
    | emoticons charmap codesample | formatpainter casechange pageembed exportword exportpdf
    | visualblocks code removeformat
  `,
  menubar: 'file edit view insert format tools table help',
  menu: {
    insert: { title: 'Insertar', items: 'link image media codesample charmap emoticons hr' }
  },
  content_style: 'body { font-family: Inter, sans-serif; font-size: 16px; line-height: 1.5; }',

  // Configuración de subida de imágenes
  image_advtab: true, // Activa opciones avanzadas
  image_title: true,
  automatic_uploads: true,
  file_picker_types: 'image',
  file_picker_callback: function (callback, value, meta) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.onchange = function () {
      const file = this.files[0];
      const reader = new FileReader();

      reader.onload = function () {
        callback(reader.result, { alt: file.name });
      };
      reader.readAsDataURL(file);
    };

    input.click();
  },

  setup: function (editor) {
    editor.on('init', function () {
      if (!htmlBase) {
        console.log('Cargando contenido inicial...');
        cargarTemplate('Template_Hallazgos_Envis.html');
      }
    });
  }
});

// Función para cargar un template específico
function cargarTemplate(ruta) {
  fetch(ruta)
    .then(response => response.text())
    .then(text => {
      htmlBase = text;
      tinymce.get('editor').setContent(htmlBase);
      console.log(`Contenido cargado desde ${ruta}.`);
    })
    .catch(error => console.error('Error al cargar el template:', error));
}

// Función para copiar el contenido HTML editado al portapapeles
function copiarHTML() {
  var htmlActual = tinymce.get('editor').getContent();
  navigator.clipboard.writeText(htmlActual).then(() => {
    var toastEl = document.getElementById('copyToast');
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
  });
}
