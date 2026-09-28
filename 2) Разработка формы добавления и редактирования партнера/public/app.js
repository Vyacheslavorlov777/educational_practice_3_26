const PARTNER_TYPES = ['ЗАО', 'ООО', 'ИП', 'АО', 'ПАО'];

// Демонстрационные данные хранятся в памяти: реальная работа с БД появится в задании 3.
const partners = [
  { id: 1, name: 'Северный Альянс', partnerType: 'ЗАО', rating: 9, address: 'г. Москва, ул. Ленина, 1', director: 'Ковалёв А.П.', phone: '+7 223 322-22-32', email: 'info@severny.ru' },
  { id: 2, name: 'ТоргСервис', partnerType: 'ООО', rating: 7, address: 'г. Казань, ул. Баумана, 12', director: 'Мельникова О.И.', phone: '+7 495 111-22-33', email: 'sales@torgservice.ru' },
  { id: 3, name: 'Кофе Плюс', partnerType: 'ИП', rating: 8, address: 'г. Санкт-Петербург, Невский пр., 5', director: 'Захаров Д.С.', phone: '+7 812 555-44-66', email: 'zaharov@coffeeplus.ru' },
];

let editingPartnerId = null; // null => режим добавления, число => режим редактирования

const WINDOW_TITLES = {
  main: 'CRM: Реестр партнеров',
  edit: {
    add: 'CRM: Карточка партнера [Добавление]',
    edit: 'CRM: Карточка партнера [Редактирование]',
  },
};

const mainWindow = document.getElementById('mainWindow');
const editWindow = document.getElementById('editWindow');
const editWindowTitle = document.getElementById('editWindowTitle');
const partnerList = document.getElementById('partnerList');
const partnerForm = document.getElementById('partnerForm');
const fieldType = document.getElementById('fieldType');

// Инициализация выпадающего списка типов партнера из общего справочника PARTNER_TYPES.
function initPartnerTypeSelect() {
  fieldType.innerHTML = PARTNER_TYPES
    .map((type) => `<option value="${type}">${type}</option>`)
    .join('');
}

function renderPartnerList() {
  partnerList.innerHTML = partners
    .map((p) => `<li class="partner-list__item" data-id="${p.id}">${p.partnerType} «${p.name}» — рейтинг ${p.rating}</li>`)
    .join('');
}

function showWindow(name) {
  mainWindow.classList.toggle('window--hidden', name !== 'main');
  editWindow.classList.toggle('window--hidden', name !== 'edit');
  document.title = name === 'main' ? WINDOW_TITLES.main : WINDOW_TITLES.edit[editingPartnerId ? 'edit' : 'add'];
}

function fillFormWithPartner(partner) {
  fieldType.value = partner.partnerType;
  document.getElementById('fieldName').value = partner.name;
  document.getElementById('fieldRating').value = partner.rating;
  document.getElementById('fieldAddress').value = partner.address;
  document.getElementById('fieldDirector').value = partner.director;
  document.getElementById('fieldPhone').value = partner.phone;
  document.getElementById('fieldEmail').value = partner.email;
}

function resetForm() {
  partnerForm.reset();
  fieldType.selectedIndex = 0;
}

document.getElementById('btnAddPartner').addEventListener('click', () => {
  editingPartnerId = null;
  resetForm();
  editWindowTitle.textContent = WINDOW_TITLES.edit.add;
  showWindow('edit');
});

// Клик по строке списка передает ID партнера в форму редактирования,
// чтобы при сохранении знать, какую запись обновлять.
partnerList.addEventListener('click', (event) => {
  const item = event.target.closest('.partner-list__item');
  if (!item) return;

  const partnerId = Number(item.dataset.id);
  const partner = partners.find((p) => p.id === partnerId);
  if (!partner) return;

  editingPartnerId = partnerId;
  fillFormWithPartner(partner);
  editWindowTitle.textContent = WINDOW_TITLES.edit.edit;
  showWindow('edit');
});

document.getElementById('btnBack').addEventListener('click', () => {
  showWindow('main');
});

partnerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  showWindow('main');
});

initPartnerTypeSelect();
renderPartnerList();
showWindow('main');
