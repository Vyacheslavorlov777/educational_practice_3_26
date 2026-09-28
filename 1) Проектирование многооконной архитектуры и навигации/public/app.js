const WINDOW_TITLES = {
  main: 'CRM: Реестр партнеров',
  edit: 'CRM: Карточка партнера [Редактирование]',
};

const mainWindow = document.getElementById('mainWindow');
const editWindow = document.getElementById('editWindow');

// Единая точка переключения экранов: скрывает все окна и показывает нужное,
// синхронно обновляя document.title, чтобы заголовок всегда отражал активный экран.
function showWindow(name) {
  mainWindow.classList.toggle('window--hidden', name !== 'main');
  editWindow.classList.toggle('window--hidden', name !== 'edit');
  document.title = WINDOW_TITLES[name];
  window.location.hash = name;
}

document.getElementById('btnAddPartner').addEventListener('click', () => {
  showWindow('edit');
});

document.getElementById('btnBack').addEventListener('click', () => {
  showWindow('main');
});

// Поддержка кнопки "Назад" браузера без потери состояния приложения.
window.addEventListener('hashchange', () => {
  const target = window.location.hash === '#edit' ? 'edit' : 'main';
  showWindow(target);
});

showWindow(window.location.hash === '#edit' ? 'edit' : 'main');
