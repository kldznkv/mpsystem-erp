// ===== BUSINESS LOGIC METHODS TO ADD TO ERPStorage =====

// Production Rules and Recipes
getDefaultProductionRecipes() {
    return [
        {
            id: 1,
            product_name: 'Пленка PET прозрачная 30мкм',
            material_requirements: [
                { material_id: 1, quantity_per_unit: 0.5 }, // PET granules
                { material_id: 2, quantity_per_unit: 0.025 } // Clear dye
            ],
            setup_time_minutes: 60,
            production_time_per_unit: 0.5,
            line_types: ['extrusion']
        },
        {
            id: 2,
            product_name: 'Пленка LDPE 50мкм',
            material_requirements: [
                { material_id: 4, quantity_per_unit: 0.6 }
            ],
            setup_time_minutes: 45,
            production_time_per_unit: 0.4,
            line_types: ['extrusion']
        }
    ];
}

getDefaultProductionLines() {
    return [
        {
            id: 1,
            name: 'Линия экструзии 1',
            type: 'extrusion',
            status: 'available',
            capacity_per_hour: 100,
            current_order_id: null
        },
        {
            id: 2,
            name: 'Линия экструзии 2',
            type: 'extrusion',
            status: 'maintenance',
            capacity_per_hour: 120,
            current_order_id: null
        }
    ];
}

getDefaultContracts() {
    return [
        {
            id: 1,
            supplier_id: 1,
            material_id: 1,
            price: 82.0,
            min_order_qty: 500,
            lead_time_days: 7,
            valid_from: '2024-01-01',
            valid_to: '2024-12-31'
        }
    ];
}

// Order Processing Logic
processOrder(orderData) {
    try {
        // Create order
        const order = this.addRecord('orders', {
            order_number: this.generateOrderNumber(),
            customer_name: orderData.customer,
            product_name: orderData.product,
            quantity: orderData.quantity,
            order_date: new Date().toISOString().split('T')[0],
            delivery_date: orderData.deliveryDate,
            status: 'new',
            priority: 'medium'
        });

        // Find production recipe
        const recipe = this.findProductionRecipe(orderData.product);
        if (!recipe) {
            throw new Error('Рецепт производства не найден');
        }

        // Calculate material requirements
        const materialRequirements = this.calculateMaterialRequirements(recipe, orderData.quantity);
        
        // Check material availability
        const availabilityCheck = this.checkMaterialAvailability(materialRequirements);
        if (!availabilityCheck.available) {
            throw new Error(`Недостаточно материалов: ${availabilityCheck.missing.join(', ')}`);
        }

        // Reserve materials
        this.reserveMaterials(order.id, materialRequirements);

        // Schedule production
        this.scheduleProduction(order, recipe, materialRequirements);

        this.addActivity('order_created', `Создан заказ ${order.order_number}`);
        
        return {
            success: true,
            order: order,
            message: 'Заказ успешно создан и запланирован'
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

generateOrderNumber() {
    const orders = this.getTable('orders');
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const count = orders.filter(o => o.order_number.startsWith(`ORD-${year}${month}`)).length + 1;
    return `ORD-${year}${month}${count.toString().padStart(3, '0')}`;
}

findProductionRecipe(productName) {
    const recipes = this.data.production_recipes || [];
    return recipes.find(r => r.product_name === productName);
}

calculateMaterialRequirements(recipe, quantity) {
    return recipe.material_requirements.map(req => ({
        material_id: req.material_id,
        required_quantity: req.quantity_per_unit * quantity
    }));
}

checkMaterialAvailability(requirements) {
    const inventory = this.getTable('inventory');
    const materials = this.getTable('materials');
    const missing = [];

    for (const req of requirements) {
        const inventoryItem = inventory.find(inv => inv.material_id === req.material_id);
        if (!inventoryItem || inventoryItem.available_quantity < req.required_quantity) {
            const material = materials.find(m => m.id === req.material_id);
            missing.push(`${material.name} (требуется: ${req.required_quantity}, доступно: ${inventoryItem?.available_quantity || 0})`);
        }
    }

    return {
        available: missing.length === 0,
        missing: missing
    };
}

reserveMaterials(orderId, requirements) {
    const inventory = this.getTable('inventory');
    
    for (const req of requirements) {
        const inventoryIndex = inventory.findIndex(inv => inv.material_id === req.material_id);
        if (inventoryIndex !== -1) {
            inventory[inventoryIndex].reserved_quantity += req.required_quantity;
            inventory[inventoryIndex].available_quantity -= req.required_quantity;
            
            if (!inventory[inventoryIndex].reservations) {
                inventory[inventoryIndex].reservations = [];
            }
            inventory[inventoryIndex].reservations.push({
                order_id: orderId,
                quantity: req.required_quantity
            });
        }
    }
    
    this.saveToStorage();
}

scheduleProduction(order, recipe, materialRequirements) {
    const productionLines = this.getTable('production_lines');
    const availableLine = productionLines.find(line => 
        line.status === 'available' && 
        recipe.line_types.includes(line.type)
    );

    if (availableLine) {
        const queueItem = {
            order_id: order.id,
            order_number: order.order_number,
            product_name: order.product_name,
            quantity: order.quantity,
            line_id: availableLine.id,
            status: 'scheduled',
            scheduled_start: new Date().toISOString(),
            estimated_completion: this.calculateCompletionTime(recipe, order.quantity),
            priority: order.priority
        };

        this.addRecord('production_queue', queueItem);
        
        // Update order status
        this.updateRecord('orders', order.id, { 
            status: 'scheduled',
            material_requirements: materialRequirements
        });
    }
}

calculateCompletionTime(recipe, quantity) {
    const totalMinutes = recipe.setup_time_minutes + (recipe.production_time_per_unit * quantity);
    const completionTime = new Date();
    completionTime.setMinutes(completionTime.getMinutes() + totalMinutes);
    return completionTime.toISOString();
}

// MRP Functions
generateMRPRequirements() {
    const orders = this.getTable('orders').filter(o => ['new', 'approved'].includes(o.status));
    const inventory = this.getTable('inventory');
    const materials = this.getTable('materials');
    const requirements = [];

    for (const order of orders) {
        const recipe = this.findProductionRecipe(order.product_name);
        if (recipe) {
            const materialReqs = this.calculateMaterialRequirements(recipe, order.quantity);
            
            for (const req of materialReqs) {
                const inventoryItem = inventory.find(inv => inv.material_id === req.material_id);
                const material = materials.find(m => m.id === req.material_id);
                
                if (inventoryItem && inventoryItem.available_quantity < req.required_quantity) {
                    const shortage = req.required_quantity - inventoryItem.available_quantity;
                    
                    requirements.push({
                        material_id: req.material_id,
                        material_code: material.code,
                        material_name: material.name,
                        required_quantity: shortage,
                        order_number: order.order_number,
                        required_date: order.delivery_date,
                        priority: order.priority
                    });
                }
            }
        }
    }

    this.data.requirements = requirements;
    this.saveToStorage();
    return requirements;
}

createPurchaseOrder(requirements, supplierId) {
    const supplier = this.getTable('suppliers').find(s => s.id === supplierId);
    if (!supplier) throw new Error('Поставщик не найден');

    const po = {
        po_number: this.generatePONumber(),
        supplier_id: supplierId,
        supplier_name: supplier.name,
        status: 'draft',
        total_amount: 0,
        order_date: new Date().toISOString().split('T')[0],
        items: []
    };

    let totalAmount = 0;
    for (const req of requirements) {
        const material = this.getTable('materials').find(m => m.id === req.material_id);
        const amount = req.required_quantity * material.standard_cost;
        totalAmount += amount;

        po.items.push({
            material_id: req.material_id,
            material_code: material.code,
            material_name: material.name,
            quantity: req.required_quantity,
            unit_price: material.standard_cost,
            total_price: amount
        });
    }

    po.total_amount = totalAmount;
    return this.addRecord('purchase_orders', po);
}

generatePONumber() {
    const pos = this.getTable('purchase_orders');
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const count = pos.filter(po => po.po_number.startsWith(`PO-${year}`)).length + 1;
    return `PO-${year}${count.toString().padStart(4, '0')}`;
}