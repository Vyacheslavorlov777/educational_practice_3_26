const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, 'partners.db');

function openDatabase() {
  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      partner_type TEXT NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER DEFAULT 0,
      address TEXT,
      director TEXT,
      phone TEXT,
      email TEXT
    )
  `);
  return db;
}

function seedIfEmpty(db) {
  const row = db.prepare('SELECT COUNT(*) AS total FROM partners').get();
  if (row.total > 0) return;

  const insertPartner = db.prepare(`
    INSERT INTO partners (partner_type, name, rating, address, director, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const partners = [
    { type: 'ЗАО', name: 'Северный Альянс', rating: 9, address: 'г. Москва, ул. Ленина, 1', director: 'Ковалёв А.П.', phone: '+7 223 322-22-32', email: 'info@severny.ru' },
    { type: 'ООО', name: 'ТоргСервис', rating: 7, address: 'г. Казань, ул. Баумана, 12', director: 'Мельникова О.И.', phone: '+7 495 111-22-33', email: 'sales@torgservice.ru' },
    { type: 'ИП', name: 'Кофе Плюс', rating: 8, address: 'г. Санкт-Петербург, Невский пр., 5', director: 'Захаров Д.С.', phone: '+7 812 555-44-66', email: 'zaharov@coffeeplus.ru' },
  ];

  for (const p of partners) {
    insertPartner.run(p.type, p.name, p.rating, p.address, p.director, p.phone, p.email);
  }
}

module.exports = { openDatabase, seedIfEmpty };
