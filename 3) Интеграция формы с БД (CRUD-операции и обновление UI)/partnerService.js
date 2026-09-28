function rowToPartner(row) {
  return {
    id: row.id,
    partnerType: row.partner_type,
    name: row.name,
    rating: row.rating,
    address: row.address,
    director: row.director,
    phone: row.phone,
    email: row.email,
  };
}

function getAllPartners(db) {
  const rows = db.prepare('SELECT * FROM partners ORDER BY id').all();
  return rows.map(rowToPartner);
}

function getPartnerById(db, id) {
  const row = db.prepare('SELECT * FROM partners WHERE id = ?').get(id);
  return row ? rowToPartner(row) : null;
}

function createPartner(db, data) {
  const result = db.prepare(`
    INSERT INTO partners (partner_type, name, rating, address, director, phone, email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(data.partnerType, data.name, data.rating, data.address, data.director, data.phone, data.email);

  return getPartnerById(db, Number(result.lastInsertRowid));
}

function updatePartner(db, id, data) {
  // Партнер должен существовать: обновление по несуществующему ID сохраняло бы
  // ссылочную целостность в поврежденном состоянии для связанных данных.
  const existing = getPartnerById(db, id);
  if (!existing) return null;

  db.prepare(`
    UPDATE partners
    SET partner_type = ?, name = ?, rating = ?, address = ?, director = ?, phone = ?, email = ?
    WHERE id = ?
  `).run(data.partnerType, data.name, data.rating, data.address, data.director, data.phone, data.email, id);

  return getPartnerById(db, id);
}

module.exports = { getAllPartners, getPartnerById, createPartner, updatePartner };
