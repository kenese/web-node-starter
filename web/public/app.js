document.addEventListener('DOMContentLoaded', async () => {
    const strategyContainer = document.getElementById('strategy-container');
    const statsContainer = document.getElementById('stats-container');
    const alternativesTable = document.querySelector('#alternatives-table tbody');
    const ordersContainer = document.getElementById('orders-container');
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('.content-section');

    let rawData = null;
    let activeSellers = new Set();
    let manualExclusions = new Set();

    // Navigation logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(s => {
                s.id === target ? s.classList.remove('hidden') : s.classList.add('hidden');
            });
        });
    });

    try {
        const response = await fetch('purchase_data.json');
        if (!response.ok) throw new Error('Failed to load data');
        rawData = await response.json();

        // Initialize state
        rawData.orders.forEach(o => activeSellers.add(o.seller));

        renderDashboard();
    } catch (error) {
        console.error(error);
        strategyContainer.innerHTML = `<div class="loading">Error loading data: ${error.message}</div>`;
    }

    function renderDashboard() {
        if (!rawData) return;
        
        renderStrategy();
        renderSummary(); // Summary depends on strategy calculation
        renderAllOrders(); // This remains mostly static but can show current status
    }

    function renderStrategy() {
        strategyContainer.innerHTML = '';
        const { recommendations } = rawData;
        const assignments = {};
        
        // Initialize assignments for all sellers (even if empty)
        rawData.orders.forEach(o => assignments[o.seller] = []);

        // 1. Calculate best active assignments
        Object.entries(recommendations).forEach(([normName, rec]) => {
            if (manualExclusions.has(normName)) return;

            // Find cheapest option where seller is active
            const bestActive = rec.all.find(opt => activeSellers.has(opt.seller));
            if (bestActive) {
                assignments[bestActive.seller].push({
                    ...bestActive,
                    isBestOverall: bestActive.seller === rec.best.seller,
                    originalBestSeller: rec.best.seller
                });
            }
        });

        // 2. Separate and sort sellers
        const activeList = Object.keys(assignments)
            .filter(s => activeSellers.has(s))
            .sort((a, b) => assignments[b].length - assignments[a].length);
        
        const inactiveList = Object.keys(assignments)
            .filter(s => !activeSellers.has(s));

        // 3. Render Active Sellers
        activeList.forEach(seller => {
            renderSellerCard(seller, assignments[seller], true);
        });

        // 4. Render Inactive Sellers
        inactiveList.forEach(seller => {
            renderSellerCard(seller, [], false);
        });

        // Update Stats
        updateStats(assignments);
    }

    function renderSellerCard(seller, items, isActive) {
        const sellerTotal = items.reduce((sum, i) => sum + i.total_inc_tax_ship_nzd, 0);
        const card = document.createElement('div');
        card.className = `seller-card ${isActive ? '' : 'seller-excluded'}`;
        card.dataset.seller = seller;
        
        card.innerHTML = `
            <div class="seller-header">
                <input type="checkbox" class="seller-checkbox" ${isActive ? 'checked' : ''} title="Toggle Seller">
                <h3>${seller}</h3>
            </div>
            <div class="seller-total">
                NZ$${sellerTotal.toFixed(2)} (${items.length} items)
            </div>
            <ul class="item-list">
                ${items.map(item => `
                    <li class="item-row" data-norm-name="${item.normalized_name}">
                        <input type="checkbox" class="item-checkbox" checked>
                        <span class="item-name" title="${item.name}">
                            ${item.name}
                            ${!item.isBestOverall ? `<span class="moved-badge">Moved from ${item.originalBestSeller}</span>` : ''}
                        </span>
                        <span class="item-price">$${item.total_inc_tax_ship_nzd.toFixed(2)}</span>
                    </li>
                `).join('')}
            </ul>
        `;

        // Seller toggle listener
        card.querySelector('.seller-checkbox').addEventListener('change', (e) => {
            if (e.target.checked) activeSellers.add(seller);
            else activeSellers.delete(seller);
            renderStrategy();
        });

        // Item toggle listener
        card.querySelectorAll('.item-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const normName = e.target.closest('.item-row').dataset.normName;
                if (!e.target.checked) manualExclusions.add(normName);
                renderStrategy();
            });
        });

        strategyContainer.appendChild(card);
    }

    function updateStats(assignments) {
        let grandTotal = 0;
        let totalItems = 0;
        let sellersUsed = 0;

        activeSellers.forEach(seller => {
            const items = assignments[seller] || [];
            if (items.length > 0) {
                grandTotal += items.reduce((sum, i) => sum + i.total_inc_tax_ship_nzd, 0);
                totalItems += items.length;
                sellersUsed++;
            }
        });

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalItems}</div>
                <div class="stat-label">Total Items</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$${grandTotal.toFixed(2)}</div>
                <div class="stat-label">Optimized Grand Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${sellersUsed}</div>
                <div class="stat-label">Active Sellers</div>
            </div>
        `;
    }

    function renderSummary() {
        // Render alternatives (static from rawData for now)
        alternativesTable.innerHTML = '';
        Object.entries(rawData.recommendations).forEach(([normName, rec]) => {
            rec.close_seconds.forEach(alt => {
                const diff = alt.total_inc_tax_ship_nzd - rec.best.total_inc_tax_ship_nzd;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${rec.best.name}</td>
                    <td><strong>${alt.seller}</strong> ($${alt.total_inc_tax_ship_nzd.toFixed(2)})</td>
                    <td>${rec.best.seller} ($${rec.best.total_inc_tax_ship_nzd.toFixed(2)})</td>
                    <td class="text-warning">+ $${diff.toFixed(2)}</td>
                `;
                alternativesTable.appendChild(row);
            });
        });
    }

    function renderAllOrders() {
        ordersContainer.innerHTML = '';
        rawData.orders.forEach(order => {
            const group = document.createElement('div');
            group.className = 'order-group';
            group.innerHTML = `
                <div class="order-header">
                    <div class="order-info">
                        <h3>Order from ${order.seller}</h3>
                        <div class="order-meta">Subtotal: NZ$${order.subtotal_nzd.toFixed(2)} | Shipping: NZ$${order.shipping_nzd.toFixed(2)}</div>
                    </div>
                    <div class="order-total-price">NZ$${order.total_nzd.toFixed(2)}</div>
                </div>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Condition</th>
                                <th>Price (Inc. Ship/Tax)</th>
                                <th>Current Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => {
                                const rec = rawData.recommendations[item.normalized_name];
                                const currentBest = rec.all.find(opt => activeSellers.has(opt.seller));
                                
                                let statusBadge = '';
                                if (manualExclusions.has(item.normalized_name)) {
                                    statusBadge = '<span class="badge badge-better">Manually Excluded</span>';
                                } else if (currentBest && currentBest.seller === order.seller) {
                                    statusBadge = '<span class="badge badge-best">Active Choice</span>';
                                } else if (!activeSellers.has(order.seller)) {
                                    statusBadge = '<span class="badge badge-better">Seller Inactive</span>';
                                } else {
                                    statusBadge = `<span class="badge badge-close">Available</span>`;
                                }

                                return `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.condition}</td>
                                        <td>$${item.total_inc_tax_ship_nzd.toFixed(2)}</td>
                                        <td>${statusBadge}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            ordersContainer.appendChild(group);
        });
    }
});
