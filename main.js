// Создание сцены, камеры и рендера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Добавляем свет
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(2, 2, 2).normalize();
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

// Загрузка 3D-модели сердца
const loader = new THREE.GLTFLoader();
let heart;

loader.load('models/heart/Heart.glb', function (gltf) {
    heart = gltf.scene;
    heart.position.set(0, 0, 0);
    
    // Определяем масштаб в зависимости от устройства
    const isMobile = window.innerWidth < 768;
    const scaleFactor = isMobile ? 0.3 : 0.5;
    heart.scale.set(scaleFactor, scaleFactor, scaleFactor);

    scene.add(heart);
}, undefined, function (error) {
    console.error('Ошибка загрузки модели:', error);
});

// Устанавливаем камеру
camera.position.z = 2;

// Анимация вращения сердца
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
const rotationSpeed = 0.005;

// Обработчики событий для вращения модели
function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseMove(event) {
    if (!isDragging || !heart) return;

    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    
    heart.rotation.y += deltaX * rotationSpeed;
    heart.rotation.x += deltaY * rotationSpeed;

    previousMousePosition = { x: event.clientX, y: event.clientY };
}

function onMouseUp() {
    isDragging = false;
}

// Поддержка сенсорных экранов
function onTouchStart(event) {
    if (event.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
}

function onTouchMove(event) {
    if (!isDragging  !heart  event.touches.length !== 1) return;

    const deltaX = event.touches[0].clientX - previousMousePosition.x;
    const deltaY = event.touches[0].clientY - previousMousePosition.y;

    heart.rotation.y += deltaX * rotationSpeed;
    heart.rotation.x += deltaY * rotationSpeed;

    previousMousePosition = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}

function onTouchEnd() {
    isDragging = false;
}

// Добавляем обработчики событий
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mouseup', onMouseUp);

window.addEventListener('touchstart', onTouchStart);
window.addEventListener('touchmove', onTouchMove);
window.addEventListener('touchend', onTouchEnd);

// Функция анимации
function animate() {
    requestAnimationFrame(animate);
    
    // Возвращаем сердце в исходное положение, если не вращают
    if (!isDragging && heart) {
        heart.rotation.x *= 0.95;
        heart.rotation.y *= 0.95;
    }

    renderer.render(scene, camera);
}
animate();

// Обновление размеров при изменении окна
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
