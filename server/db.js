// Simple JSON-file database (no MongoDB/MySQL install needed).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const FILE = path.join(__dirname, 'data', 'db.json');
let db = { users: [], products: [], orders: [] };
const id = () => crypto.randomBytes(6).toString('hex');

function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

function seed() {
  db.users.push(
    { id: id(), name: 'Pharmacy Admin', email: 'admin@pharmacy.com', password: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: id(), name: 'Demo Customer', email: 'customer@pharmacy.com', password: bcrypt.hashSync('customer123', 10), role: 'customer' }
  );
  const P = (name, category, price, stock, rx, icon, description) =>
    db.products.push({ id: id(), name, category, price, stock, rx, icon, description });
  P('Paracetamol 500mg (10 tablets)', 'Pain Relief', 25, 200, false, '💊', 'Relief from fever and mild to moderate pain.');
  P('Ibuprofen 400mg (10 tablets)', 'Pain Relief', 35, 150, false, '💊', 'Anti-inflammatory for pain and swelling.');
  P('Cetirizine 10mg (10 tablets)', 'Cold & Allergy', 30, 120, false, '🤧', 'Relief from allergy symptoms.');
  P('Cough Syrup 100ml', 'Cold & Allergy', 85, 80, false, '🍯', 'Soothes dry and irritating cough.');
  P('Vitamin C 500mg (30 tablets)', 'Vitamins', 120, 100, false, '🍊', 'Daily immunity support.');
  P('Multivitamin (30 capsules)', 'Vitamins', 250, 60, false, '🌿', 'Essential vitamins and minerals.');
  P('ORS Sachets (pack of 5)', 'Digestive', 50, 90, false, '🧂', 'Oral rehydration salts.');
  P('Antacid Gel 170ml', 'Digestive', 95, 70, false, '🧴', 'Fast relief from acidity and heartburn.');
  P('Digital Thermometer', 'Devices', 199, 40, false, '🌡️', 'Fast and accurate digital reading.');
  P('Blood Pressure Monitor', 'Devices', 1499, 15, false, '🩺', 'Automatic upper-arm BP monitor.');
  P('Adhesive Bandages (50 pcs)', 'First Aid', 60, 150, false, '🩹', 'Washable, breathable bandages.');
  P('Hand Sanitizer 200ml', 'First Aid', 75, 130, false, '🧼', '70% alcohol-based sanitizer.');
  P('Amoxicillin 500mg (10 capsules)', 'Prescription', 110, 50, true, '💉', 'Antibiotic. Prescription required.');
  P('Metformin 500mg (30 tablets)', 'Prescription', 45, 80, true, '💊', 'Prescription required.');
  P('Atorvastatin 10mg (15 tablets)', 'Prescription', 140, 60, true, '💊', 'Prescription required.');
}

if (fs.existsSync(FILE)) db = JSON.parse(fs.readFileSync(FILE, 'utf8'));
else { seed(); save(); }

module.exports = { get: () => db, save, id };
