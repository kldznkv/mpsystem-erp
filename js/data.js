// Demo data for MPSYSTEM
const DEMO_DATA = {
    // Dashboard KPIs
    kpis: {
        efficiency: {
            current: 94.8,
            previous: 92.5,
            target: 95
        },
        activeOrders: {
            current: 28,
            new: 6,
            completed: 4
        },
        qualityRate: {
            current: 99.2,
            previous: 98.7,
            target: 98.5
        },
        stockLevel: {
            current: 87,
            previous: 90,
            minimum: 85
        }
    },
    
    // Production lines data
    productionLines: [
        {
            id: 'ext-1',
            name: 'Extrusion Line 1',
            type: 'extrusion',
            status: 'running',
            product: 'PE Film 250mm',
            orderId: 'ZP-2024/0318',
            progress: 76,
            metrics: {
                speed: 145,
                speedUnit: 'm/min',
                output: 287,
                outputUnit: 'kg/h',
                temperature: 185,
                temperatureUnit: '°C'
            },
            efficiency: 96.5,
            startTime: '2024-03-15T06:00:00',
            estimatedEnd: '2024-03-15T14:30:00'
        },
        {
            id: 'print-1',
            name: 'Printing Station',
            type: 'printing',
            status: 'setup',
            product: '6-Color Flexo',
            orderId: 'ZP-2024/0321',
            progress: 25,
            metrics: {
                nextOrder: 'ZP-0321',
                setupTime: 35,
                colors: 6,
                currentColor: 'Changing to Green'
            },
            efficiency: 0,
            estimatedStart: '2024-03-15T11:00:00'
        },
        {
            id: 'ext-2',
            name: 'Extrusion Line 2',
            type: 'extrusion',
            status: 'running',
            product: 'PE Film 230mm',
            orderId: 'ZP-2024/0319',
            progress: 45,
            metrics: {
                speed: 132,
                speedUnit: 'm/min',
                output: 264,
                outputUnit: 'kg/h',
                temperature: 182,
                temperatureUnit: '°C'
            },
            efficiency: 94.2,
            startTime: '2024-03-15T08:00:00',
            estimatedEnd: '2024-03-15T16:00:00'
        }
    ],
    
    // Orders data
    orders: [
        {
            id: 'ZP-2024/0318',
            customer: 'MLEKOVITA',
            customerType: 'VIP',
            product: 'Cheese Packaging 250×450mm',
            productType: 'food-packaging',
            quantity: 20000,
            unit: 'pcs',
            value: 1983,
            currency: 'EUR',
            dueDate: '2024-03-18',
            status: 'in-production',
            priority: 'high',
            progress: 76,
            bom: {
                material: 'PE-LD',
                weight: 164,
                additives: ['Antiblock CESA', 'White Masterbatch'],
                colors: 6,
                adhesive: 'Liofol UR7780'
            },
            qualityStatus: 'released',
            documents: ['spec', 'bom', 'coa'],
            assignedLine: 'ext-1'
        },
        {
            id: 'ZP-2024/0319',
            customer: 'AGRONA',
            customerType: 'VIP',
            product: 'Food Wrap 230×475mm',
            productType: 'food-packaging',
            quantity: 10000,
            unit: 'pcs',
            value: 945,
            currency: 'EUR',
            dueDate: '2024-03-20',
            status: 'in-production',
            priority: 'high',
            progress: 45,
            bom: {
                material: 'PE-LD',
                weight: 92,
                additives: ['Slip Agent'],
                colors: 4,
                adhesive: null
            },
            qualityStatus: 'testing',
            documents: ['spec', 'bom'],
            assignedLine: 'ext-2'
        },
        {
            id: 'ZP-2024/0320',
            customer: 'LACPOL',
            customerType: 'regular',
            product: 'Laminate 425×750mm',
            productType: 'laminate',
            quantity: 5000,
            unit: 'pcs',
            value: 782,
            currency: 'EUR',
            dueDate: '2024-03-22',
            status: 'scheduled',
            priority: 'normal',
            progress: 0,
            bom: {
                material: 'PE/PET',
                weight: 156,
                additives: ['EVOH Barrier'],
                colors: 8,
                adhesive: 'Liofol UR7785'
            },
            qualityStatus: 'pending',
            documents: ['spec'],
            assignedLine: null
        },
        {
            id: 'ZP-2024/0321',
            customer: 'Sainsbury\'s',
            customerType: 'international',
            product: 'Premium Print 320×480mm',
            productType: 'printed-film',
            quantity: 15000,
            unit: 'pcs',
            value: 2145,
            currency: 'EUR',
            dueDate: '2024-03-28',
            status: 'pending',
            priority: 'normal',
            progress: 0,
            bom: {
                material: 'PE-LD',
                weight: 144,
                additives: ['UV Stabilizer'],
                colors: 6,
                adhesive: null
            },
            qualityStatus: 'pending',
            documents: ['spec', 'artwork'],
            assignedLine: 'print-1'
        }
    ],
    
    // Inventory data
    inventory: {
        materials: [
            {
                id: 'PE-LD-001',
                name: 'PE-LD Granulate',
                category: 'raw-material',
                warehouse: 'MAG1',
                quantity: 19250,
                unit: 'kg',
                minStock: 5000,
                maxStock: 25000,
                supplier: 'Orlen SA',
                lastDelivery: '2024-03-10',
                nextDelivery: '2024-03-25',
                price: 2.45,
                currency: 'EUR/kg'
            },
            {
                id: 'CESA-AB-001',
                name: 'Antiblock CESA',
                category: 'additive',
                warehouse: 'MAG1',
                quantity: 940,
                unit: 'kg',
                minStock: 1000,
                maxStock: 3000,
                supplier: 'Clariant AG',
                lastDelivery: '2024-03-01',
                nextDelivery: '2024-03-22',
                price: 9.20,
                currency: 'EUR/kg',
                alert: 'low-stock'
            },
            {
                id: 'INK-CMYK-001',
                name: 'Flexo Ink Set CMYK',
                category: 'consumable',
                warehouse: 'MAG1_1',
                quantity: 850,
                unit: 'kg',
                minStock: 500,
                maxStock: 2000,
                supplier: 'Huber Group',
                lastDelivery: '2024-03-05',
                nextDelivery: '2024-04-01',
                price: 28.50,
                currency: 'EUR/kg',
                hazmat: true
            }
        ],
        finishedGoods: [
            {
                id: 'FG-240318-01',
                orderId: 'ZP-2024/0318',
                product: 'Cheese Packaging 250×450mm',
                quantity: 15200,
                unit: 'pcs',
                warehouse: 'MAG9',
                location: 'A-12',
                qualityStatus: 'released',
                productionDate: '2024-03-15',
                expiryDate: '2025-03-15'
            }
        ]
    },
    
    // BOM templates
    bomTemplates: [
        {
            id: 'BOM-001',
            name: 'Standard Cheese Packaging',
            customer: 'MLEKOVITA',
            version: '2.1',
            active: true,
            structure: {
                material: 'PE-LD',
                thickness: 80,
                width: 250,
                length: 450,
                weightPer1000: 8.2,
                additives: [
                    { name: 'White Masterbatch', percentage: 2 },
                    { name: 'Antiblock', percentage: 0.5 }
                ],
                printing: {
                    colors: 6,
                    coverage: 85,
                    inkType: 'Food-safe Flexo'
                }
            },
            cost: {
                material: 20.09,
                additives: 0.56,
                printing: 12.40,
                labor: 11.35,
                overhead: 4.72,
                total: 49.12,
                currency: 'EUR/1000pcs'
            }
        }
    ],
    
    // Recent activities
    activities: [
        {
            id: 1,
            type: 'production',
            message: 'Extrusion Line 1 completed batch EXT240318-01',
            timestamp: '2024-03-15T10:30:00',
            user: 'System',
            importance: 'normal'
        },
        {
            id: 2,
            type: 'quality',
            message: 'Batch FG240318-01 released after quality check',
            timestamp: '2024-03-15T10:15:00',
            user: 'Anna Kowalska',
            importance: 'high'
        },
        {
            id: 3,
            type: 'inventory',
            message: 'Low stock alert: Antiblock CESA below minimum',
            timestamp: '2024-03-15T09:45:00',
            user: 'System',
            importance: 'warning'
        }
    ]
};
