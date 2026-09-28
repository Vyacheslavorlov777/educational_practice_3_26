const PARTNER_TYPES = ['ЗАО', 'ООО', 'ИП', 'АО', 'ПАО'];

let editingPartnerId = null; // null => режим добавления, число => режим редактирования (ID передан из списка)

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

function initPartnerTypeSelect() {
  fieldType.innerHTML = PARTNER_TYPES
    .map((type) => `<option value="${type}">${type}</option>`)
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
  document.getElementById('fieldAddress').value = partner.address || '';
  document.getElementById('fieldDirector').value = partner.director || '';
  document.getElementById('fieldPhone').value = partner.phone || '';
  document.getElementById('fieldEmail').value = partner.email || '';
}

function resetForm() {
  partnerForm.reset();
  fieldType.selectedIndex = 0;
}

function readFormData() {
  return {
    partnerType: fieldType.value,
    name: document.getElementById('fieldName').value,
    rating: Number(document.getElementById('fieldRating').value) || 0,
    address: document.getElementById('fieldAddress').value,
    director: document.getElementById('fieldDirector').value,
    phone: document.getElementById('fieldPhone').value,
    email: document.getElementById('fieldEmail').value,
  };
}

async function loadPartners() {
  const response = await fetch('/api/partners');
  const partners = await response.json();
  partnerList.innerHTML = partners
    .map((p) => `<li class="partner-list__item" data-id="${p.id}">${p.partnerType} «${p.name}» — рейтинг ${p.rating}</li>`)
    .join('');
}

document.getElementById('btnAddPartner').addEventListener('click', () => {
  editingPartnerId = null;
  resetForm();
  editWindowTitle.textContent = WINDOW_TITLES.edit.add;
  showWindow('edit');
});

// Двойной клик по строке подгружает актуальные данные партнера из БД по его ID
// и запоминает этот ID, чтобы при сохранении отправить UPDATE, а не INSERT.
partnerList.addEventListener('dblclick', async (event) => {
  const item = event.target.closest('.partner-list__item');
  if (!item) return;

  const partnerId = Number(item.dataset.id);
  const response = await fetch(`/api/partners/${partnerId}`);
  if (!response.ok) return;

  const partner = await response.json();
  editingPartnerId = partnerId;
  fillFormWithPartner(partner);
  editWindowTitle.textContent = WINDOW_TITLES.edit.edit;
  showWindow('edit');
});

document.getElementById('btnBack').addEventListener('click', () => {
  showWindow('main');
});

partnerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = readFormData();
  const url = editingPartnerId ? `/api/partners/${editingPartnerId}` : '/api/partners';
  const method = editingPartnerId ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  await loadPartners();
  showWindow('main');
});

initPartnerTypeSelect();
loadPartners();
showWindow('main');
