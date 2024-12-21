let htmlBase = ''; 
let currentUser = null; 
const editorId = 'editor';
const AUTO_SAVE_INTERVAL = 60000; // 1 minuto

document.addEventListener('DOMContentLoaded', () => {
  currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    let loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
  } else {
    updateUserInfo();
  }

  tinymce.init({
    selector: `#${editorId}`,
    height: 600,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
      'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'emoticons', 'help',
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
    image_advtab: true,
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
          if (currentUser) {
            const draft = localStorage.getItem(`user_${currentUser}_draft`);
            if (draft) {
              tinymce.get(editorId).setContent(draft);
            } else {
              cargarTemplate('templates/Template_Hallazgos_Envis.html');
            }
          } else {
            cargarTemplate('templates/Template_Hallazgos_Envis.html');
          }
        }
      });
    }
  });

  document.getElementById('saveProjectBtn').addEventListener('click', showProjectNameModal);
  document.getElementById('saveProjectConfirmBtn').addEventListener('click', confirmSaveProject);

  // Iniciar auto-guardado
  setInterval(autoSaveDraft, AUTO_SAVE_INTERVAL);
});

function showProjectNameModal() {
  if (!currentUser) {
    Swal.fire({
      title: 'No has iniciado sesión',
      text: 'Debes iniciar sesión para guardar proyectos.',
      icon: 'warning',
      confirmButtonText: 'OK'
    });
    return;
  }
  let projectNameModal = new bootstrap.Modal(document.getElementById('projectNameModal'));
  document.getElementById('projectNameInput').value = '';
  projectNameModal.show();
}

function confirmSaveProject() {
  const projectNameInput = document.getElementById('projectNameInput').value.trim();
  if (!projectNameInput) {
    Swal.fire({
      title: 'Nombre inválido',
      text: 'Debe ingresar un nombre de proyecto válido.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
    return;
  }

  const htmlActual = tinymce.get(editorId).getContent();
  let userProjects = JSON.parse(localStorage.getItem(`user_${currentUser}_projects`) || '[]');

  userProjects.push({
    name: projectNameInput,
    content: htmlActual
  });
  localStorage.setItem(`user_${currentUser}_projects`, JSON.stringify(userProjects));

  let projectNameModal = bootstrap.Modal.getInstance(document.getElementById('projectNameModal'));
  projectNameModal.hide();

  Swal.fire({
    title: 'Proyecto Guardado',
    text: 'Proyecto guardado con éxito',
    icon: 'success',
    confirmButtonText: 'OK'
  });
}

function cargarTemplate(ruta) {
  fetch(ruta)
    .then(response => response.text())
    .then(text => {
      htmlBase = text;
      tinymce.get(editorId).setContent(htmlBase);
      console.log(`Contenido cargado desde ${ruta}.`);
    })
    .catch(error => console.error('Error al cargar el template:', error));
}

function copiarHTML() {
  var htmlActual = tinymce.get(editorId).getContent();
  navigator.clipboard.writeText(htmlActual).then(() => {
    var toastEl = document.getElementById('copyToast');
    var toast = new bootstrap.Toast(toastEl);
    toast.show();
  });
}

function descargarHTML() {
  var htmlActual = tinymce.get(editorId).getContent();
  const blob = new Blob([htmlActual], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contenido_editado.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function loginUser() {
  const username = document.getElementById('usernameInput').value.trim();
  if (username) {
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    let loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
    updateUserInfo();
  } else {
    Swal.fire({
      title: 'Nombre de usuario inválido',
      text: 'Debes ingresar un nombre de usuario',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

function updateUserInfo() {
  const userInfoDiv = document.getElementById('userInfo');
  userInfoDiv.innerHTML = `
    <span class="me-3">Hola, ${currentUser}</span>
    <button class="btn btn-outline-danger btn-sm" onclick="logoutUser()">
      <i class="bi bi-box-arrow-left"></i> Cerrar Sesión
    </button>
    <div id="autosaveIndicator" class="ms-3" style="display:flex;align-items:center;">
      <i class="bi bi-check-circle me-1" style="color:gray;"></i>
      <small class="fw-semibold" style="color:gray;">Auto-guardado</small>
    </div>
  `;
}

function logoutUser() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  location.reload();
}

document.getElementById('projectsModal').addEventListener('show.bs.modal', () => {
  const projectsListDiv = document.getElementById('projectsList');
  projectsListDiv.innerHTML = '';
  if (!currentUser) {
    projectsListDiv.innerHTML = '<p>No ha iniciado sesión.</p>';
    return;
  }

  let userProjects = JSON.parse(localStorage.getItem(`user_${currentUser}_projects`) || '[]');
  if (userProjects.length === 0) {
    projectsListDiv.innerHTML = '<p>No tienes proyectos guardados.</p>';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'list-group';

  userProjects.forEach((proj, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <span>${proj.name}</span>
      <div>
        <button class="btn btn-sm btn-primary me-2" onclick="loadProject(${index})">
          <i class="bi bi-box-arrow-in-down"></i> Cargar
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteProject(${index})">
          <i class="bi bi-trash"></i> Borrar
        </button>
      </div>
    `;
    list.appendChild(li);
  });
  projectsListDiv.appendChild(list);
});

function loadProject(index) {
  let userProjects = JSON.parse(localStorage.getItem(`user_${currentUser}_projects`) || '[]');
  const proj = userProjects[index];
  if (proj) {
    tinymce.get(editorId).setContent(proj.content);
    let modal = bootstrap.Modal.getInstance(document.getElementById('projectsModal'));
    modal.hide();
    Swal.fire({
      title: 'Proyecto cargado',
      text: 'Proyecto cargado con éxito',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }
}

function deleteProject(index) {
  let userProjects = JSON.parse(localStorage.getItem(`user_${currentUser}_projects`) || '[]');
  if (userProjects[index]) {
    Swal.fire({
      title: '¿Desea borrar este proyecto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        userProjects.splice(index, 1);
        localStorage.setItem(`user_${currentUser}_projects`, JSON.stringify(userProjects));
        let modal = bootstrap.Modal.getInstance(document.getElementById('projectsModal'));
        modal.hide();
        // Reabrir el modal para refrescar la lista
        let projectsModal = new bootstrap.Modal(document.getElementById('projectsModal'));
        projectsModal.show();
        Swal.fire({
          title: 'Borrado',
          text: 'El proyecto ha sido borrado.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}

function autoSaveDraft() {
  if (!currentUser) return;
  const editorInstance = tinymce.get(editorId);
  if (!editorInstance) return;

  const htmlActual = editorInstance.getContent();
  if (!htmlActual) return;

  // Guardar el draft
  localStorage.setItem(`user_${currentUser}_draft`, htmlActual);
  mostrarIndicadorAutoGuardado();
}

function mostrarIndicadorAutoGuardado() {
  const indicator = document.getElementById('autosaveIndicator');
  if (!indicator) return;

  const icon = indicator.querySelector('i');
  const text = indicator.querySelector('small');

  // Mostrar en verde temporalmente
  icon.style.color = 'green';
  text.style.color = 'green';

  setTimeout(() => {
    // Volver a gris
    icon.style.color = 'gray';
    text.style.color = 'gray';
  }, 3000);
}
