window.onload = function() {
    const soundImages = document.querySelectorAll('.sound-image');
    const sound = new Audio('../../assets/sfx/delfin.mp3'); // Archivo de sonido
    const backgroundVideo = document.getElementById('background-video'); // Obtén el elemento del video

    // Establecer el video inicial como muted
    backgroundVideo.muted = true; // El primer video está silenciado

    soundImages.forEach((image, index) => {
        image.addEventListener('click', () => {
            sound.currentTime = 0; // Reinicia el sonido al inicio
            sound.play(); // Reproducir sonido al hacer clic en la imagen

            // Cambia el video solo si es la segunda imagen (índice 1)
            if (index === 1) {
                backgroundVideo.src = '../../assets/vids/video2.mp4'; // Cambia la fuente del video
                backgroundVideo.muted = false; // Activa el audio del segundo video
                backgroundVideo.load(); // Carga el nuevo video
                backgroundVideo.play(); // Reproduce el nuevo video
            } else {
                backgroundVideo.muted = true; // Mantiene el primer video en muted
            }
        });
    });
};

function showImage(imageId) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const imageElement = document.getElementById(imageId);
    
    modalImage.src = imageElement.src; // Asigna la imagen al modal
    modal.style.display = 'flex'; // Muestra el modal
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    modal.style.display = 'none'; // Oculta el modal al hacer clic
}
