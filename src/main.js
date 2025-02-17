// Определяем мобильное устройство
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// Инициализация сцены
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Черный фон
document.body.appendChild(renderer.domElement);

// Источник света
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 2, 5);
scene.add(light);

// Загрузка 3D-модели сердца
const loader = new THREE.GLTFLoader();
let heart;
const initialRotation = { x: 0, y: 0, z: 0 };

loader.load('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/Heart/glTF/Heart.gltf', function(gltf) {
    heart = gltf.scene;
    heart.position.set(0, 0, 0);
    const scaleFactor = isMobile ? 0.3 : 0.5; // Уменьшаем размер сердца на мобилке
    heart.scale.set(scaleFactor, scaleFactor, scaleFactor);
    scene.add(heart);
}, undefined, function(error) {
    console.error(error);
});

camera.position.z = isMobile ? 4 : 3; // Отодвигаем камеру дальше на мобилке

// Управление вращением (мышь + touch)
let isDragging = false, prevX = 0, prevY = 0, rotationX = 0, rotationY = 0;

const startRotation = (x, y) => {
    isDragging = true;
    prevX = x;
    prevY = y;
};

const moveRotation = (x, y) => {
    if (isDragging && heart) {
        const deltaX = x - prevX;
        const deltaY = y - prevY;
        rotationY += deltaX * 0.005;
        rotationX += deltaY * 0.005;
        heart.rotation.y = rotationY;
        heart.rotation.x = rotationX;
        prevX = x;
        prevY = y;
    }
};

const stopRotation = () => {
    isDragging = false;
};

// Обработчики для ПК (мышь)
document.addEventListener('mousedown', (e) => startRotation(e.clientX, e.clientY));
document.addEventListener('mousemove', (e) => moveRotation(e.clientX, e.clientY));
document.addEventListener('mouseup', stopRotation);

// Обработчики для мобильных устройств (тач)
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        startRotation(e.touches[0].clientX, e.touches[0].clientY);
    }
});
document.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        moveRotation(e.touches[0].clientX, e.touches[0].clientY);
    }
});
document.addEventListener('touchend', stopRotation);

// Функция возвращения в исходное положение
function resetRotation() {
    if (heart) {
        heart.rotation.x += (initialRotation.x - heart.rotation.x) * 0.05;
        heart.rotation.y += (initialRotation.y - heart.rotation.y) * 0.05;
        heart.rotation.z += (initialRotation.z - heart.rotation.z) * 0.05;
    }
}

// Анимация снега
const snowflakes = [];
const snowGeometry = new THREE.BufferGeometry();
const snowMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });

const snowCount = isMobile ? 300 : 500; // Меньше снежинок на мобильных для оптимизации
const positions = new Float32Array(snowCount * 3);

for (let i = 0; i < snowCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = Math.random() * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    snowflakes.push({ x: positions[i * 3], y: positions[i * 3 + 1], z: positions[i * 3 + 2] });
}

snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const snowParticles = new THREE.Points(snowGeometry, snowMaterial);
scene.add(snowParticles);

// Анимация сцены
function animate() {
    requestAnimationFrame(animate);
    if (heart) resetRotation();

    // Анимация снега
    const positions = snowGeometry.attributes.position.array;
    for (let i = 0; i < snowCount; i++) {
        positions[i * 3 + 1] -= 0.02;
        if (positions[i * 3 + 1] < -2.5) {
            positions[i * 3 + 1] = 2.5;
        }
    }
    snowGeometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}

animate();

// Адаптация под размер окна
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});