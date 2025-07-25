# MPSYSTEM - Бизнес-логика

## Производственный процесс

### Жизненный цикл заказа
1. **Создание заказа** → Ввод спецификации, количества, сроков
2. **Проверка материалов** → Автоматическая проверка наличия сырья
3. **Резервирование** → Резервирование материалов под заказ (FIFO)
4. **Планирование** → Выбор линии и временного слота
5. **Производство** → Запуск на выбранной линии
6. **Контроль качества** → Проверка соответствия стандартам
7. **Завершение** → Перемещение на склад готовой продукции

### Алгоритм планирования производства
```javascript
function planOrder(order) {
    // 1. Определить тип материала и подходящие линии
    const suitableLines = getCompatibleLines(order.material_type);
    
    // 2. Проверить доступность материалов
    const materialAvailability = checkMaterialAvailability(order.materials);
    if (!materialAvailability.sufficient) {
        return { status: 'blocked', reason: 'insufficient_materials' };
    }
    
    // 3. Найти оптимальную линию по критериям:
    //    - Минимальное время настройки
    //    - Максимальная эффективность для данного материала
    //    - Ближайший доступный слот
    const optimalLine = findOptimalLine(suitableLines, order);
    
    // 4. Зарезервировать временной слот
    const timeSlot = reserveTimeSlot(optimalLine, order.estimated_duration);
    
    // 5. Создать производственное задание
    return createProductionJob(order, optimalLine, timeSlot);
}
```

## Управление материалами

### Резервирование (FIFO)
При создании заказа система автоматически резервирует материалы по принципу "первый пришел - первый ушел":

```javascript
function reserveMaterials(orderMaterials) {
    orderMaterials.forEach(required => {
        const batches = getBatchesByMaterial(required.material_id)
            .filter(batch => batch.quality_status === 'released')
            .sort((a, b) => new Date(a.received_date) - new Date(b.received_date));
        
        let remainingQuantity = required.quantity;
        const reservations = [];
        
        for (const batch of batches) {
            if (remainingQuantity <= 0) break;
            
            const availableQuantity = batch.quantity - batch.reserved_quantity;
            const reserveQuantity = Math.min(remainingQuantity, availableQuantity);
            
            if (reserveQuantity > 0) {
                batch.reserved_quantity += reserveQuantity;
                remainingQuantity -= reserveQuantity;
                
                reservations.push({
                    batch_id: batch.id,
                    quantity: reserveQuantity
                });
            }
        }
        
        if (remainingQuantity > 0) {
            throw new Error(`Insufficient materials: ${required.material_name}`);
        }
    });
}
```

### MRP (Material Requirements Planning)
Система автоматически рассчитывает потребности в материалах:

```javascript
function calculateMRP() {
    const activeOrders = getActiveOrders();
    const currentInventory = getCurrentInventory();
    const requirements = {};
    
    // Рассчитать потребности по всем активным заказам
    activeOrders.forEach(order => {
        order.materials.forEach(material => {
            if (!requirements[material.id]) {
                requirements[material.id] = 0;
            }
            requirements[material.id] += material.quantity;
        });
    });
    
    // Сравнить с текущими остатками
    const purchaseRequests = [];
    Object.keys(requirements).forEach(materialId => {
        const required = requirements[materialId];
        const available = currentInventory[materialId]?.available || 0;
        const shortage = required - available;
        
        if (shortage > 0) {
            purchaseRequests.push({
                material_id: materialId,
                quantity: shortage + getSafetyStock(materialId),
                priority: calculatePriority(materialId, shortage)
            });
        }
    });
    
    return purchaseRequests;
}
```

## OEE (Overall Equipment Effectiveness)

### Расчет OEE метрик
```javascript
function calculateOEE(line, timeRange) {
    const data = getLineData(line.id, timeRange);
    
    // Availability = Running Time / Planned Production Time
    const availability = data.running_time / data.planned_time;
    
    // Performance = Actual Output / Theoretical Output
    const performance = data.actual_output / data.theoretical_output;
    
    // Quality = Good Output / Total Output
    const quality = data.good_output / data.total_output;
    
    // OEE = Availability × Performance × Quality
    const oee = availability * performance * quality;
    
    return {
        availability: Math.round(availability * 100),
        performance: Math.round(performance * 100),
        quality: Math.round(quality * 100),
        oee: Math.round(oee * 100)
    };
}
```

## Система приоритетов

### Автоматическое определение приоритета заказов
```javascript
function calculateOrderPriority(order) {
    const now = new Date();
    const deadline = new Date(order.deadline);
    const daysUntilDeadline = (deadline - now) / (1000 * 60 * 60 * 24);
    
    // Критический - менее 1 дня
    if (daysUntilDeadline < 1) return 'urgent';
    
    // Высокий - менее 3 дней
    if (daysUntilDeadline < 3) return 'high';
    
    // Нормальный - менее 7 дней
    if (daysUntilDeadline < 7) return 'normal';
    
    // Низкий - более 7 дней
    return 'low';
}
```

### Рекомендации по оптимизации
```javascript
function generateOptimizationRecommendations() {
    const recommendations = [];
    
    // Проверка загрузки линий
    const lines = getProductionLines();
    lines.forEach(line => {
        const utilization = calculateLineUtilization(line);
        
        if (utilization < 70) {
            recommendations.push({
                type: 'warning',
                title: `Низкая загрузка линии ${line.name}`,
                description: `Загрузка составляет ${utilization}%. Рекомендуется перенести заказы с других линий.`,
                action: 'rebalance_orders',
                line_id: line.id
            });
        }
        
        if (utilization > 95) {
            recommendations.push({
                type: 'error',
                title: `Перегрузка линии ${line.name}`,
                description: `Загрузка составляет ${utilization}%. Необходимо перенести часть заказов.`,
                action: 'reduce_load',
                line_id: line.id
            });
        }
    });
    
    return recommendations;
}
```

## Контроль качества

### Автоматические проверки
```javascript
function performQualityChecks(batch) {
    const checks = [];
    
    // Проверка срока годности
    const expiryDate = new Date(batch.expiry_date);
    const now = new Date();
    const daysUntilExpiry = (expiryDate - now) / (1000 * 60 * 60 * 24);
    
    if (daysUntilExpiry < 0) {
        checks.push({
            type: 'error',
            message: 'Материал просрочен',
            action: 'block_material'
        });
    } else if (daysUntilExpiry < 30) {
        checks.push({
            type: 'warning',
            message: 'Материал истекает в течение 30 дней',
            action: 'priority_usage'
        });
    }
    
    // Проверка температурного режима
    if (batch.storage_temperature > batch.max_storage_temp) {
        checks.push({
            type: 'error',
            message: 'Нарушен температурный режим хранения',
            action: 'quarantine'
        });
    }
    
    return checks;
}
```

## Система уведомлений

### Критические уведомления
```javascript
function generateCriticalAlerts() {
    const alerts = [];
    
    // Низкие остатки материалов
    const lowStockMaterials = checkLowStockMaterials();
    lowStockMaterials.forEach(material => {
        alerts.push({
            type: 'critical',
            icon: '⚠️',
            title: 'Критический остаток',
            message: `${material.name}: ${material.current_stock} ${material.unit}`,
            action: 'create_purchase_request',
            data: { material_id: material.id }
        });
    });
    
    // Просроченные заказы
    const overdueOrders = getOverdueOrders();
    overdueOrders.forEach(order => {
        alerts.push({
            type: 'critical',
            icon: '🚨',
            title: 'Просроченный заказ',
            message: `Заказ ${order.number} просрочен на ${order.days_overdue} дней`,
            action: 'prioritize_order',
            data: { order_id: order.id }
        });
    });
    
    // Проблемы с линиями
    const problemLines = getLinesWithProblems();
    problemLines.forEach(line => {
        alerts.push({
            type: 'warning',
            icon: '🔧',
            title: 'Проблема с линией',
            message: `${line.name}: ${line.problem_description}`,
            action: 'schedule_maintenance',
            data: { line_id: line.id }
        });
    });
    
    return alerts;
}
```

## Аналитика и отчеты

### Ключевые показатели эффективности (KPI)
```javascript
function calculateKPIs(period) {
    return {
        // Производственные показатели
        oee: calculateAverageOEE(period),
        throughput: calculateThroughput(period),
        quality_rate: calculateQualityRate(period),
        
        // Складские показатели
        inventory_turnover: calculateInventoryTurnover(period),
        stock_accuracy: calculateStockAccuracy(period),
        
        // Заказы
        on_time_delivery: calculateOnTimeDelivery(period),
        order_fulfillment: calculateOrderFulfillment(period),
        
        // Финансовые
        production_cost: calculateProductionCost(period),
        material_cost: calculateMaterialCost(period)
    };
}
```

## Интеграция модулей

### Связь между компонентами
- **Order → Production**: Автоматическое создание производственных заданий
- **Production → Inventory**: Обновление остатков при выпуске продукции
- **Inventory → Purchasing**: Автоматическое создание заявок при низких остатках
- **Quality → Production**: Блокировка материалов при выявлении проблем
- **Planning → All**: Координация всех процессов через единый план