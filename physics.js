/**
 * Простой минимальный пример игровой физики на канвасе для Крис
 */

// канвас и его 2d контекст, на них будем рисовать
const canvas = window.canvas;
const ctx = canvas.getContext('2d');

// физические константы нашей симуляции
const width = 60; // ширина мира в метрах, чтобы наши расчеты не зависели от пикселей
const height = 40; // высота мира в метрах, чтобы наши расчеты не зависели от пикселей
const gravity = 3; // на сколько прирастает скорость падения тела в секунду в метрах, ускорение свободного падения в желе =)
const friction = 0.95; // во сколько раз замедляется скорость тела в среде (для упрощения мы не будем считать аэродинамическое сопротивление)

// свойства контролов
const xForce = 2; // горизонтальная сила, которую сообщают телу кнопки Left и Right (движение)
const yForce = 5; // вертикальная сила, которую сообщает телу кнопка Space (прыжки)

// базовое состояние тела
let objectRadius = 1; // радиус тела в метрах, тело у нас будет шариком, радиус нужен чтобы посчитать не коснулся ли шарик стенок мира
let objectX = width / 2; // положение в мире в метрах, посередине
let objectY = height / 2; // положение в мире в метрах, посередине
let objectWeight = 1; // масса тела
let objectXForce = 0; // горизонтальная сила, действующая на тело, если меньше нуля, то тело движется назад, иначе вперед (движение)
let objectYForce = 0; // вертикальная сила, действующая на тело, если меньше нуля, то тело движется вниз, иначе вверх (прыжки)

// производное состояния тела, считаем их на основе базового состояния
let objectXVelocity = 0; // текущая горизонтальная скорость тела, каждый кадр к ней прибавляется ускорение тела, а сама она умножается на коэффициен трения
let objectYVelocity = 0; // текущая вертикальная скорость тела, каждый кадр к ней прибавляется ускорение тела, вычитается гравитация, а сама она умножается на коэффициен трения
let objectXAcceleration = 0; // горизонтальное ускорение, расчитывается как a = F / m, где F - сила, а m - масса
let objectYAcceleration = 0; // вертикальное ускорение, расчитывается как a = F / m, где F - сила, а m - масса

// свойства рендеринга, с какой часто пересчитывать и перерисовывать
let FPS = 120; // кадры в секунду

// слушаем нажатия клавиш, нам нужно только знать когда началось нажатие и когда закончилось, так как приложение сил - продолжкенный процесс
let spacePressed = false;
let arrowLeftPressed = false;
let arrowRightPressed = false;
window.addEventListener('keydown', (ev) => {
  if (ev.code === 'Space') spacePressed = true;
  if (ev.code === 'ArrowLeft') arrowLeftPressed = true;
  if (ev.code === 'ArrowRight') arrowRightPressed = true;
});
window.addEventListener('keyup', (ev) => {
  if (ev.code === 'Space') spacePressed = false;
  if (ev.code === 'ArrowLeft') arrowLeftPressed = false;
  if (ev.code === 'ArrowRight') arrowRightPressed = false;
});

// цикл жизни игрового мира
setInterval(() => {

  /**
   * Применяем силы если нажаты клавиши
   */

  objectXForce = 0;
  objectYForce = 0;

  if (arrowLeftPressed) objectXForce -= xForce; // добавляем силу, давящую влево
  if (arrowRightPressed) objectXForce += xForce; // добавляем силу, давящую вправо
  if (spacePressed) objectYForce += yForce; // добавляем сиду, поднимающую вверх

  /**
   * Считаем математику перемещения тела
   */

  objectXAcceleration = objectXForce / objectWeight; // ускорение тела по горизонтали
  objectYAcceleration = objectYForce / objectWeight; // ускорение тела по вертикали
  objectXVelocity = objectXVelocity * friction + objectXAcceleration; // скорость тела по горизонтали
  objectYVelocity = objectYVelocity * friction + objectYAcceleration - gravity;  // скорость тела по вертикали

  console.log(`xa: ${objectXAcceleration.toFixed(2)}, xv: ${objectXVelocity.toFixed(2)}, ya: ${objectYAcceleration.toFixed(2)}, yv: ${objectYVelocity.toFixed(2)}, `);

  const secondsSinceLastFrame = 1 / FPS; // сколько секунд прошло с последнего перерасчета, за какое время считать изменение положения тела
  objectX += objectXVelocity * secondsSinceLastFrame;
  objectY += objectYVelocity * secondsSinceLastFrame;  

  // проверяем, не уперлись ли мы в стены, пол и потолок
  // если уперлись - не даем пройти за них, а также обнуляем скорость
  if (objectX < objectRadius) {
    objectX = objectRadius;
    objectXVelocity = 0;
  }
  if (objectX > width - objectRadius) {
    objectX = width - objectRadius;
    objectXVelocity = 0;
  }
  if (objectY < objectRadius) {
    objectY = objectRadius;
    objectYVelocity = 0;
  }
  if (objectY > height - objectRadius) {
    objectY = height - objectRadius;
    objectYVelocity = 0;
  }

  /**
   * Рисуем кадр
   */
  ctx.clearRect(0, 0, canvas.width, canvas.height); // очищаем весь канвас, каждый кадр рисуется полностью заново

  const objectXInPixels = objectX * canvas.width / width; // считаем позицию тела в пикселях по горизонтали
  const objectYInPixels = canvas.height - objectY * canvas.height / height;  // считаем позицию тела в пикселях по вертикали (и ещё переворачиваем, так как 0 на канвасе сверху, а в нашем мире снизу, как и полагается)
  const objectRadiusInPixels = objectRadius * canvas.width / width; // пересчитываем радиус в пиксели

  ctx.beginPath(); // начали рисовать фигуру, канвасу нужно указывать начало и конец чтобы он знал что ему красить или обводить
  ctx.arc(objectXInPixels, objectYInPixels, objectRadiusInPixels, 0, Math.PI * 2); // рисуем кружок
  ctx.closePath(); // закончили рисовать фигуру

  ctx.strokeStyle = '#000000'; // задаем цвет обводки нашего шарика
  ctx.lineWidth = objectRadiusInPixels / 5; // задаем толщину обводки, например одна пятая радиуса
  ctx.stroke(); // обводим

}, 1000 / FPS);


