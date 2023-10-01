import { Dropzone } from 'dropzone'
 
// Obteniendo el valor del token csrf
const token = document.querySelector("meta[name='csrf-token']").getAttribute('content')
 
// Referencia al id de la vista agregar-imagen.pug
Dropzone.options.imagen = {
  dictDefaultMessage: 'Sube tus imágenes aquí', // Mensaje del drop
  acceptedFiles: '.png,.jpg,.jpeg', // Tipos de archivos aceptados
  maxFilesize: 5, // Tamaño maximo de archiv
  maxFiles: 1, // Maximo de archivos a subir
  paralleUploads: 1, // Cantidad de archivo a subir
  autoProcessQueue: false, // false - Indicando que no se suba en automático, true - sube en automático
  addRemoveLinks: true, // Mostrar enlace para eliminar imagen
  dictRemoveFile: 'Borrar Archivo', // Mensaje del enlace
  dictMaxFilesExceeded: 'El límite es 1 archivo', // Mensjae cuando se excede la cantidad de archivos
  dictFileTooBig: 'El archivo debe pesar menos de 5 MB', // Mensaje para el peso máximo
  headers: {
    'CSRF-Token': token
  },
  paramName: 'imagen', // Identificador que se utiliza en el controlador
  init: function() {
    const dropzone = this
    const btnPublicar = document.querySelector("#publicar")
    btnPublicar.addEventListener("click", function() {
      dropzone.processQueue()
    })
    dropzone.on('queuecomplete', function() {
      if(dropzone.getActiveFiles().length == 0) {
        window.location.href = '/mis-propiedades'
      }
    })
  }
}