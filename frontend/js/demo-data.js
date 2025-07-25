// ===== MPSYSTEM DEMO DATA =====
// Статические данные для работы без backend API

console.log('📊 MPSYSTEM Demo Data загружен');

// Demo Orders Data (15-20 заказов)
const DEMO_ORDERS = [
    {
        id: 1,
        number: "ZP-2024/0001",
        client_id: "ML-001",
        client_name: "MLEKOVITA",
        product_id: "PKG-001",
        product_name: "Opakowania do serów żółtych 500g",
        quantity: 50000.0,
        unit: "pcs",
        due_date: "2024-12-25",
        priority: "high",
        status: "confirmed",
        value: 125000.0,
        margin: 18.5,
        progress: 10,
        special_requirements: "Nadruk logo MLEKOVITA, certyfikat BRC",
        created_by: "jan.kowalski@mpsystem.pl",
        created_at: "2024-12-01T08:00:00Z",
        updated_at: "2024-12-15T10:30:00Z"
    },
    {
        id: 2,
        number: "ZP-2024/0002", 
        client_id: "AG-001",
        client_name: "AGRONA",
        product_id: "FLM-002",
        product_name: "Folia stretch 500mm x 300m",
        quantity: 2000.0,
        unit: "m",
        due_date: "2024-12-22",
        priority: "urgent",
        status: "in_production",
        value: 84000.0,
        margin: 22.0,
        progress: 65,
        special_requirements: "Grubość 23μm, transparent, paleta drewniana",
        created_by: "maria.nowak@mpsystem.pl",
        created_at: "2024-11-28T09:15:00Z",
        updated_at: "2024-12-15T14:20:00Z"
    },
    {
        id: 3,
        number: "ZP-2024/0003",
        client_id: "LP-001", 
        client_name: "LACPOL",
        product_id: "BAG-003",
        product_name: "Torby na mleko w proszku 25kg",
        quantity: 8000.0,
        unit: "pcs",
        due_date: "2024-12-30",
        priority: "normal",
        status: "planned",
        value: 96000.0,
        margin: 20.8,
        progress: 0,
        special_requirements: "Wentyl bezpieczeństwa, handle wzmocniony",
        created_by: "piotr.zielinski@mpsystem.pl",
        created_at: "2024-12-02T11:30:00Z",
        updated_at: "2024-12-15T16:45:00Z"
    },
    {
        id: 4,
        number: "ZP-2024/0004",
        client_id: "DN-001",
        client_name: "DANONE", 
        product_id: "CUP-004",
        product_name: "Kubki jogurtowe 150ml z pokrywką",
        quantity: 75000.0,
        unit: "pcs",
        due_date: "2024-12-18",
        priority: "urgent",
        status: "completed",
        value: 180000.0,
        margin: 25.3,
        progress: 100,
        special_requirements: "PS crystal clear, food grade, tamper evident",
        created_by: "anna.kowalczyk@mpsystem.pl",
        created_at: "2024-11-20T07:45:00Z",
        updated_at: "2024-12-10T18:00:00Z"
    },
    {
        id: 5,
        number: "ZP-2024/0005",
        client_id: "MZ-001",
        client_name: "MONDELEZ",
        product_id: "TRA-005",
        product_name: "Tace do ciastek 6-pack",
        quantity: 12000.0,
        unit: "pcs",
        due_date: "2024-12-14", // OVERDUE
        priority: "high",
        status: "planned",
        value: 36000.0,
        margin: 19.8,
        progress: 25,
        special_requirements: "PET cristal, compartments 6x, food safe",
        created_by: "maria.nowak@mpsystem.pl",
        created_at: "2024-11-25T13:20:00Z",
        updated_at: "2024-12-15T09:10:00Z"
    },
    {
        id: 6,
        number: "ZP-2024/0006",
        client_id: "ML-001",
        client_name: "MLEKOVITA",
        product_id: "BOT-006",
        product_name: "Butelki na mleko 1L HDPE",
        quantity: 25000.0,
        unit: "pcs", 
        due_date: "2025-01-10",
        priority: "normal",
        status: "new",
        value: 87500.0,
        margin: 16.2,
        progress: 0,
        special_requirements: "HDPE food grade, neck 28mm, white opaque",
        created_by: "jan.kowalski@mpsystem.pl",
        created_at: "2024-12-15T15:30:00Z",
        updated_at: "2024-12-15T15:30:00Z"
    },
    {
        id: 7,
        number: "ZP-2024/0007",
        client_id: "AG-001",
        client_name: "AGRONA",
        product_id: "NET-007", 
        product_name: "Siatki na warzywa 50x80cm",
        quantity: 15000.0,
        unit: "pcs",
        due_date: "2024-12-28",
        priority: "low",
        status: "confirmed",
        value: 45000.0,
        margin: 28.5,
        progress: 5,
        special_requirements: "PE mesh 2x2mm, czerwone, UV stabilized",
        created_by: "tomasz.brown@mpsystem.pl",
        created_at: "2024-12-03T10:15:00Z",
        updated_at: "2024-12-15T12:45:00Z"
    },
    {
        id: 8,
        number: "ZP-2024/0008",
        client_id: "LP-001",
        client_name: "LACPOL", 
        product_id: "LID-008",
        product_name: "Pokrywki aluminiowe 83mm",
        quantity: 30000.0,
        unit: "pcs",
        due_date: "2024-12-20",
        priority: "high",
        status: "in_production",
        value: 90000.0,
        margin: 24.2,
        progress: 78,
        special_requirements: "Aluminium 0.2mm, easy peel, sterile",
        created_by: "katarzyna.white@mpsystem.pl",
        created_at: "2024-11-30T14:00:00Z",
        updated_at: "2024-12-15T17:20:00Z"
    },
    {
        id: 9,
        number: "ZP-2024/0009",
        client_id: "DN-001",
        client_name: "DANONE",
        product_id: "POT-009",
        product_name: "Pojemniki na smoothie 250ml",
        quantity: 40000.0,
        unit: "pcs",
        due_date: "2025-01-15",
        priority: "normal",
        status: "new", 
        value: 120000.0,
        margin: 21.7,
        progress: 0,
        special_requirements: "PET clear, snap-on lid, recyclable",
        created_by: "marek.green@mpsystem.pl",
        created_at: "2024-12-10T08:45:00Z",
        updated_at: "2024-12-15T11:15:00Z"
    },
    {
        id: 10,
        number: "ZP-2024/0010",
        client_id: "MZ-001", 
        client_name: "MONDELEZ",
        product_id: "WRP-010",
        product_name: "Opakowania na cukierki 500g",
        quantity: 22000.0,
        unit: "pcs",
        due_date: "2024-12-27",
        priority: "high",
        status: "planned",
        value: 77000.0,
        margin: 19.3,
        progress: 15,
        special_requirements: "Metallized film, barrier properties, resealable",
        created_by: "ewa.blue@mpsystem.pl",
        created_at: "2024-12-05T16:20:00Z",
        updated_at: "2024-12-15T13:50:00Z"
    },
    {
        id: 11,
        number: "ZP-2024/0011",
        client_id: "ML-001",
        client_name: "MLEKOVITA",
        product_id: "CAP-011",
        product_name: "Nakrętki HDPE 28mm",
        quantity: 100000.0,
        unit: "pcs",
        due_date: "2025-01-05",
        priority: "low",
        status: "confirmed",
        value: 95000.0,
        margin: 15.8,
        progress: 0,
        special_requirements: "HDPE white, tamper evident band, food contact",
        created_by: "jan.kowalski@mpsystem.pl",
        created_at: "2024-12-08T09:30:00Z",
        updated_at: "2024-12-15T14:10:00Z"
    },
    {
        id: 12,
        number: "ZP-2024/0012",
        client_id: "AG-001",
        client_name: "AGRONA", 
        product_id: "SHT-012",
        product_name: "Arkusze termoformowane A4",
        quantity: 5000.0,
        unit: "pcs",
        due_date: "2024-12-31",
        priority: "normal",
        status: "shipped",
        value: 25000.0,
        margin: 32.4,
        progress: 100,
        special_requirements: "PET 0.5mm, transparent, food grade",
        created_by: "robert.red@mpsystem.pl", 
        created_at: "2024-11-22T11:00:00Z",
        updated_at: "2024-12-12T16:30:00Z"
    },
    {
        id: 13,
        number: "ZP-2024/0013",
        client_id: "LP-001",
        client_name: "LACPOL",
        product_id: "TUB-013", 
        product_name: "Tubki na masło 200g",
        quantity: 18000.0,
        unit: "pcs",
        due_date: "2024-12-12", // OVERDUE
        priority: "urgent",
        status: "in_production",
        value: 54000.0,
        margin: 26.1,
        progress: 92,
        special_requirements: "PE coated paper, heat sealable, grease proof",
        created_by: "magdalena.pink@mpsystem.pl",
        created_at: "2024-11-18T12:45:00Z",
        updated_at: "2024-12-15T15:45:00Z"
    },
    {
        id: 14,
        number: "ZP-2024/0014",
        client_id: "DN-001",
        client_name: "DANONE",
        product_id: "SPO-014",
        product_name: "Łyżeczki plastikowe 50szt",
        quantity: 60000.0,
        unit: "pcs",
        due_date: "2025-01-20",
        priority: "low",
        status: "new",
        value: 42000.0,
        margin: 18.9,
        progress: 0,
        special_requirements: "PS crystal, disposable, food contact approved", 
        created_by: "adam.yellow@mpsystem.pl",
        created_at: "2024-12-12T14:15:00Z",
        updated_at: "2024-12-15T10:20:00Z"
    },
    {
        id: 15,
        number: "ZP-2024/0015",
        client_id: "MZ-001",
        client_name: "MONDELEZ",
        product_id: "BOX-015",
        product_name: "Pudełka na herbatniki 300g",
        quantity: 35000.0,
        unit: "pcs",
        due_date: "2024-12-16", // OVERDUE
        priority: "critical",
        status: "planned",
        value: 105000.0,
        margin: 23.7,
        progress: 45,
        special_requirements: "Cardboard 350gsm, UV lacquer, window PET",
        created_by: "natalia.purple@mpsystem.pl",
        created_at: "2024-11-28T15:30:00Z",
        updated_at: "2024-12-15T18:00:00Z"
    }
];

// Demo Dashboard Metrics
const DEMO_DASHBOARD_METRICS = {
    totalOrders: 47,
    totalOrdersChange: 12, // %
    productionEfficiency: 89.2,
    productionEfficiencyChange: 3.1, // %
    overallEfficiency: 92.4,
    overallEfficiencyChange: -1.2, // %
    qualityScore: 96.8,
    qualityScoreChange: 0.5 // %
};

// Demo Production Lines
const DEMO_PRODUCTION_LINES = [
    // Экструзия
    { id: 'EXT-1', name: 'Линия EXT-1', type: 'extrusion', status: 'running', currentOrder: 'ZP-2024/0142', progress: 73, timeRemaining: '2ч 15м', oee: 94.2, queue: 3 },
    { id: 'EXT-2', name: 'Линия EXT-2', type: 'extrusion', status: 'idle', currentOrder: null, progress: 0, timeRemaining: 'Готова к работе', oee: null, queue: 5 },
    { id: 'EXT-3', name: 'Линия EXT-3', type: 'extrusion', status: 'maintenance', currentOrder: 'ТО оборудования', progress: 45, timeRemaining: '1ч 30м', oee: null, queue: 2 },
    { id: 'EXT-4', name: 'Линия EXT-4', type: 'extrusion', status: 'running', currentOrder: 'ZP-2024/0158', progress: 28, timeRemaining: '4ч 45м', oee: 91.7, queue: 4 },
    { id: 'CUT-1', name: 'Резка CUT-1', type: 'cutting', status: 'running', currentOrder: 'ZP-2024/0134', progress: 82, timeRemaining: '0ч 45м', oee: 96.1, queue: 1 },
    { id: 'CUT-2', name: 'Резка CUT-2', type: 'cutting', status: 'idle', currentOrder: null, progress: 0, timeRemaining: 'Готова к работе', oee: null, queue: 0 },
    { id: 'LAB-1', name: 'Лаборатория', type: 'laboratory', status: 'testing', currentOrder: 'Тестирование образцов', progress: 60, timeRemaining: '3 образца', oee: null, queue: 7 },
    
    // Ламинация  
    { id: 'LAM-1', name: 'Линия LAM-1', type: 'lamination', status: 'running', currentOrder: 'ZP-2024/0167', progress: 41, timeRemaining: '3ч 20м', oee: 88.9, queue: 6 },
    { id: 'LAM-CUT-1', name: 'Резка LAM-CUT', type: 'cutting', status: 'idle', currentOrder: null, progress: 0, timeRemaining: 'Готова к работе', oee: null, queue: 2 },
    
    // Печать
    { id: 'PRINT-FLEXO', name: 'Флексопечать', type: 'printing', status: 'running', currentOrder: 'ZP-2024/0189', progress: 67, timeRemaining: '1ч 50м', oee: 93.4, queue: 8 },
    { id: 'PRINT-DIGITAL', name: 'Цифровая печать', type: 'printing', status: 'idle', currentOrder: null, progress: 0, timeRemaining: 'Готова к работе', oee: null, queue: 4 }
];

// Demo Critical Alerts
const DEMO_CRITICAL_ALERTS = [
    {
        id: 1,
        type: 'critical',
        icon: '⚠️',
        title: 'Низкий остаток материала',
        message: 'LDPE пленка 50мкм: осталось 2 дня',
        time: '5 мин назад',
        action: 'Заказать',
        actionId: 'LDPE-50'
    },
    {
        id: 2, 
        type: 'warning',
        icon: '⏰',
        title: 'Просроченный заказ',
        message: 'ZP-2024/0134 просрочен на 2 дня',
        time: '15 мин назад',
        action: 'Эскалация',
        actionId: 'ZP-2024/0134'
    },
    {
        id: 3,
        type: 'info',
        icon: '🔧',
        title: 'Плановое ТО',
        message: 'Линия EXT-2: ТО через 3 дня',
        time: '1 час назад',
        action: 'Запланировать',
        actionId: 'EXT-2'
    },
    {
        id: 4,
        type: 'warning', 
        icon: '📉',
        title: 'Снижение качества',
        message: 'Партия B-1247: несоответствие толщины',
        time: '2 часа назад',
        action: 'Карантин',
        actionId: 'B-1247'
    }
];

// Demo Materials Data
const DEMO_MATERIALS = [
    { id: 1, name: "LDPE Пленка 50мкм", code: "LDPE-50", category: "Пленки", stock: 2450, unit: "кг", minStock: 1000, supplier: "ChemPoland", cost: 4.50 },
    { id: 2, name: "HDPE Гранулы белые", code: "HDPE-W", category: "Гранулы", stock: 15600, unit: "кг", minStock: 5000, supplier: "PlasticSupply", cost: 3.20 },
    { id: 3, name: "PP Пленка 30мкм", code: "PP-30", category: "Пленки", stock: 890, unit: "кг", minStock: 800, supplier: "PolyMat", cost: 5.10 },
    { id: 4, name: "PET Гранулы прозрачные", code: "PET-T", category: "Гранулы", stock: 8750, unit: "кг", minStock: 3000, supplier: "ChemPoland", cost: 6.80 },
    { id: 5, name: "Краска синяя RAL5015", code: "INK-B", category: "Краски", stock: 125, unit: "л", minStock: 50, supplier: "ColorTech", cost: 18.90 }
];

// Demo Suppliers Data
const DEMO_SUPPLIERS = [
    { id: 1, name: "ChemPoland Sp. z o.o.", code: "CHEM", contact: "Jan Kowalski", email: "jan@chempoland.pl", phone: "+48 22 123 4567", rating: 4.8, deliveryTime: 3 },
    { id: 2, name: "PlasticSupply Ltd", code: "PLAS", contact: "Anna Nowak", email: "anna@plasticsupply.com", phone: "+48 61 987 6543", rating: 4.5, deliveryTime: 5 },
    { id: 3, name: "PolyMat Industries", code: "POLY", contact: "Marek Zieliński", email: "marek@polymat.eu", phone: "+48 12 456 7890", rating: 4.2, deliveryTime: 4 },
    { id: 4, name: "ColorTech Solutions", code: "COLOR", contact: "Ewa Wiśniewska", email: "ewa@colortech.pl", phone: "+48 71 321 0987", rating: 4.7, deliveryTime: 2 }
];

// Demo Inventory Data
const DEMO_INVENTORY = [
    { id: 1, materialId: 1, batch: "B-001-2024", quantity: 2450, location: "MAG-A-01", expiryDate: "2025-06-15", qualityStatus: "approved", supplierId: 1 },
    { id: 2, materialId: 2, batch: "B-002-2024", quantity: 15600, location: "MAG-A-02", expiryDate: "2026-12-31", qualityStatus: "approved", supplierId: 2 },
    { id: 3, materialId: 3, batch: "B-003-2024", quantity: 890, location: "MAG-B-01", expiryDate: "2025-03-20", qualityStatus: "quarantine", supplierId: 3 },
    { id: 4, materialId: 4, batch: "B-004-2024", quantity: 8750, location: "MAG-A-03", expiryDate: "2027-01-10", qualityStatus: "approved", supplierId: 1 },
    { id: 5, materialId: 5, batch: "B-005-2024", quantity: 125, location: "MAG-C-01", expiryDate: "2025-08-30", qualityStatus: "testing", supplierId: 4 }
];

// Demo API Response Generator
function generateDemoApiResponse(data, page = 1, limit = 20) {
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = data.slice(start, end);
    
    return {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}

// Export demo data
window.DEMO_DATA = {
    orders: DEMO_ORDERS,
    dashboardMetrics: DEMO_DASHBOARD_METRICS,
    productionLines: DEMO_PRODUCTION_LINES, 
    criticalAlerts: DEMO_CRITICAL_ALERTS,
    materials: DEMO_MATERIALS,
    suppliers: DEMO_SUPPLIERS,
    inventory: DEMO_INVENTORY,
    generateApiResponse: generateDemoApiResponse
};

console.log('✅ Demo data готов:', Object.keys(window.DEMO_DATA));