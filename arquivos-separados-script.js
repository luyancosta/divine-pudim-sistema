// ================================
// DIVINE PUDIM GOURMET - SCRIPT V2
// Sistema de Controle de Pedidos
// ================================

// ===== BANCO DE DADOS DE PRODUTOS =====
const PRODUTOS = [
    // Doces e Sobremesas
    { nome: 'Delícia de abacaxi', tamanhos: [{ tamanho: 'P', preco: 35 }, { tamanho: 'G', preco: 55 }] },
    { nome: 'Ouro branco', tamanhos: [{ tamanho: 'P', preco: 35 }, { tamanho: 'G', preco: 75 }] },
    { nome: 'Sonho de valsa', tamanhos: [{ tamanho: 'P', preco: 35 }, { tamanho: 'G', preco: 75 }] },
    { nome: 'Supreme de morango', tamanhos: [{ tamanho: 'P', preco: 35 }, { tamanho: 'G', preco: 75 }] },
    { nome: 'Bombom de morango', tamanhos: [{ tamanho: 'P', preco: 50 }, { tamanho: 'G', preco: 85 }] },
    { nome: 'Bombom de uva', tamanhos: [{ tamanho: 'P', preco: 50 }, { tamanho: 'G', preco: 85 }] },
    { nome: 'Kinder Bueno', tamanhos: [{ tamanho: 'P', preco: 55 }, { tamanho: 'G', preco: 95 }] },
    { nome: 'Torta de brownie', tamanhos: [{ tamanho: 'P', preco: 55 }, { tamanho: 'G', preco: 95 }] },
    { nome: 'Ferrero Rocher', tamanhos: [{ tamanho: 'P', preco: 55 }, { tamanho: 'G', preco: 95 }] },
    
    // Pudins
    { nome: 'Pudim tradicional', tamanhos: [{ tamanho: 'M', preco: 35 }, { tamanho: 'G', preco: 75 }] },
    { nome: 'Pudim ninho com Nutella', tamanhos: [{ tamanho: 'M', preco: 50 }, { tamanho: 'G', preco: 85 }] },
    { nome: 'Pudim ninho com geleia de morango', tamanhos: [{ tamanho: 'M', preco: 50 }, { tamanho: 'G', preco: 85 }] },
    
    // Brownietone
    { nome: 'Brownietone', tamanhos: [{ tamanho: '250g', preco: 25 }, { tamanho: '500g', preco: 55 }] },
    
    // Sobremesas na taça
    { nome: 'Sobremesa na taça - Delícia de abacaxi', tamanhos: [{ tamanho: 'Único', preco: 100 }] },
    { nome: 'Sobremesa na taça - Torta brownie', tamanhos: [{ tamanho: 'Único', preco: 120 }] },
    
    // Mimos
    { nome: '4 brigadeiros', tamanhos: [{ tamanho: 'Único', preco: 14 }] },
    { nome: '4 mini brownies recheados', tamanhos: [{ tamanho: 'Único', preco: 18 }] },
    { nome: 'Mini bolo', tamanhos: [{ tamanho: 'Único', preco: 15 }] },
    { nome: 'Bolo médio', tamanhos: [{ tamanho: 'Único', preco: 50 }] },
    
    // Salgados
    { nome: 'Empadão de carne de sol', tamanhos: [{ tamanho: 'Único', preco: 85 }] },
    { nome: 'Empadão de frango', tamanhos: [{ tamanho: 'Único', preco: 85 }] },
];

// ===== GERENCIAMENTO DE DADOS =====
let orders = JSON.parse(localStorage.getItem('divinePudimOrders')) || [];
let currentOrderId = null;
let currentFilter = 'hoje';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let searchTerm = '';

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    // Define data de hoje como padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataPedido').value = today;
    
    updateDashboard();
    updateProductsReport();
    renderOrders();
    populateBairroFilter();
    showAlerts();
    renderCalendar();
    renderCharts();
});

// ===== TABS =====
function showTab(tabName) {
    // Remove active de todos
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ativa o selecionado
    event.target.closest('.tab-btn').classList.add('active');
    document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    
    // Atualiza conteúdo específico
    if (tabName === 'producao') {
        renderProductionReport();
    } else if (tabName === 'calendario') {
        renderCalendar();
    } else if (tabName === 'graficos') {
        renderCharts();
    }
}

// ===== DASHBOARD =====
function updateDashboard() {
    const total = orders.length;
    const entregues = orders.filter(o => o.status === 'Entregue').length;
    const pendentes = orders.filter(o => o.status !== 'Entregue').length;
    
    const faturado = orders.reduce((sum, o) => sum + parseFloat(o.valorTotal || 0), 0);
    const receber = orders.reduce((sum, o) => sum + parseFloat(o.valorRestante || 0), 0);
    const entregas = orders.reduce((sum, o) => sum + parseFloat(o.taxaEntrega || 0), 0);
    
    document.getElementById('totalPedidos').textContent = total;
    document.getElementById('pedidosEntregues').textContent = entregues;
    document.getElementById('pedidosPendentes').textContent = pendentes;
    document.getElementById('totalFaturado').textContent = formatCurrency(faturado);
    document.getElementById('totalReceber').textContent = formatCurrency(receber);
    document.getElementById('totalEntregas').textContent = formatCurrency(entregas);
}

// ===== RELATÓRIO DE PRODUTOS =====
function updateProductsReport() {
    const productCount = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const key = `${item.produto} - ${item.tamanho}`;
            if (!productCount[key]) {
                productCount[key] = 0;
            }
            productCount[key] += item.quantidade;
        });
    });
    
    // Converte para array e ordena
    const sortedProducts = Object.entries(productCount)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 12); // Top 12
    
    const container = document.getElementById('productsReportList');
    
    if (sortedProducts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 40px;">Nenhum produto pedido ainda.</p>';
        return;
    }
    
    container.innerHTML = sortedProducts.map(product => `
        <div class="product-item">
            <div class="product-name">${product.name}</div>
            <div class="product-quantity">${product.qty}</div>
        </div>
    `).join('');
}

// ===== ALERTAS =====
function showAlerts() {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = '';
    
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => o.dataEntrega === today && o.status !== 'Entregue');
    
    if (todayOrders.length > 0) {
        container.innerHTML += `
            <div class="alert alert-warning">
                <h4><i class="fas fa-exclamation-triangle"></i> Pedidos para Hoje</h4>
                <p>${todayOrders.length} pedido(s) para entrega hoje</p>
            </div>
        `;
    }
    
    // Pedidos atrasados
    const lateOrders = orders.filter(o => {
        return new Date(o.dataEntrega) < new Date(today) && o.status !== 'Entregue';
    });
    
    if (lateOrders.length > 0) {
        container.innerHTML += `
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-circle"></i> Pedidos Atrasados</h4>
                <p>${lateOrders.length} pedido(s) com entrega atrasada</p>
            </div>
        `;
    }
}

// ===== BUSCA RÁPIDA =====
function searchOrders() {
    searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const clearBtn = document.querySelector('.btn-clear-search');
    
    if (searchTerm) {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
    }
    
    applyFilters();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    searchTerm = '';
    document.querySelector('.btn-clear-search').style.display = 'none';
    applyFilters();
}

// ===== MODAL =====
function showNewOrderModal() {
    currentOrderId = null;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Novo Pedido';
    document.getElementById('orderForm').reset();
    document.getElementById('orderId').value = '';
    document.getElementById('itemsList').innerHTML = '';
    
    // Data padrão
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dataPedido').value = today;
    
    addItem(); // Adiciona primeiro item
    document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// ===== BUSCA DE CEP =====
function formatCep(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    input.value = value;
}

async function buscarCep() {
    const cep = document.getElementById('clienteCep').value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        alert('CEP inválido. Digite 8 dígitos.');
        return;
    }
    
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        
        if (data.erro) {
            alert('CEP não encontrado.');
            return;
        }
        
        // Preenche os campos
        document.getElementById('clienteEndereco').value = `${data.logradouro}, ${data.complemento || ''}`.trim();
        
        // Tenta encontrar o bairro na lista
        const bairroSelect = document.getElementById('clienteBairro');
        const bairroOption = Array.from(bairroSelect.options).find(opt => 
            opt.value.toLowerCase() === data.bairro.toLowerCase()
        );
        
        if (bairroOption) {
            bairroSelect.value = bairroOption.value;
        } else {
            // Se não encontrar, seleciona "Outro" e preenche
            bairroSelect.value = 'OUTRO';
            handleBairroChange();
            document.getElementById('outroBairro').value = data.bairro;
        }
        
        alert('Endereço preenchido com sucesso!');
    } catch (error) {
        alert('Erro ao buscar CEP. Tente novamente.');
        console.error(error);
    }
}

function handleBairroChange() {
    const select = document.getElementById('clienteBairro');
    const outroGroup = document.getElementById('outroBairroGroup');
    const outroInput = document.getElementById('outroBairro');
    
    if (select.value === 'OUTRO') {
        outroGroup.style.display = 'block';
        outroInput.required = true;
    } else {
        outroGroup.style.display = 'none';
        outroInput.required = false;
        outroInput.value = '';
    }
}

// ===== GERENCIAMENTO DE ITENS =====
function addItem() {
    const itemsList = document.getElementById('itemsList');
    const itemId = Date.now();
    
    const itemHTML = `
        <div class="item-row" id="item-${itemId}">
            <div class="item-grid">
                <div class="form-group">
                    <label>Produto</label>
                    <select class="item-produto" onchange="updateSizes(${itemId})" required>
                        <option value="">Selecione o produto</option>
                        ${PRODUTOS.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('')}
                        <option value="PERSONALIZADO">+ Produto Personalizado</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Tamanho</label>
                    <select class="item-tamanho" id="tamanho-${itemId}" onchange="updatePrice(${itemId})" required>
                        <option value="">Selecione</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Quantidade</label>
                    <input type="number" class="item-quantidade" min="1" value="1" onchange="calculateItemTotal(${itemId})" required>
                </div>
                
                <div class="form-group">
                    <label>Valor Unit.</label>
                    <input type="number" class="item-preco" id="preco-${itemId}" step="0.01" onchange="calculateItemTotal(${itemId})" required>
                </div>
                
                <div class="form-group">
                    <label>Subtotal</label>
                    <input type="number" class="item-subtotal" id="subtotal-${itemId}" readonly>
                </div>
                
                <button type="button" class="btn-remove-item" onclick="removeItem(${itemId})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <input type="text" class="item-personalizado" id="personalizado-${itemId}" placeholder="Nome do produto personalizado" style="display: none; margin-top: 10px; padding: 10px; border: 2px solid #e5e5e5; border-radius: 8px; width: 100%;">
        </div>
    `;
    
    itemsList.insertAdjacentHTML('beforeend', itemHTML);
}

function updateSizes(itemId) {
    const itemRow = document.getElementById(`item-${itemId}`);
    const produtoSelect = itemRow.querySelector('.item-produto');
    const tamanhoSelect = document.getElementById(`tamanho-${itemId}`);
    const precoInput = document.getElementById(`preco-${itemId}`);
    const personalizadoInput = document.getElementById(`personalizado-${itemId}`);
    
    const produtoNome = produtoSelect.value;
    
    // Se for produto personalizado
    if (produtoNome === 'PERSONALIZADO') {
        personalizadoInput.style.display = 'block';
        personalizadoInput.required = true;
        tamanhoSelect.innerHTML = '<option value="Único">Único</option>';
        tamanhoSelect.value = 'Único';
        precoInput.value = '';
        precoInput.readOnly = false;
        return;
    } else {
        personalizadoInput.style.display = 'none';
        personalizadoInput.required = false;
        personalizadoInput.value = '';
    }
    
    const produto = PRODUTOS.find(p => p.nome === produtoNome);
    
    if (produto) {
        tamanhoSelect.innerHTML = produto.tamanhos.map(t => 
            `<option value="${t.tamanho}" data-preco="${t.preco}">${t.tamanho} - R$ ${t.preco.toFixed(2)}</option>`
        ).join('');
        
        // Define primeiro tamanho
        if (produto.tamanhos.length > 0) {
            tamanhoSelect.value = produto.tamanhos[0].tamanho;
            updatePrice(itemId);
        }
    } else {
        tamanhoSelect.innerHTML = '<option value="">Selecione</option>';
        precoInput.value = '';
    }
}

function updatePrice(itemId) {
    const tamanhoSelect = document.getElementById(`tamanho-${itemId}`);
    const precoInput = document.getElementById(`preco-${itemId}`);
    
    const selectedOption = tamanhoSelect.options[tamanhoSelect.selectedIndex];
    const preco = selectedOption.getAttribute('data-preco');
    
    if (preco) {
        precoInput.value = preco;
        precoInput.readOnly = true;
    } else {
        precoInput.readOnly = false;
    }
    
    calculateItemTotal(itemId);
}

function calculateItemTotal(itemId) {
    const itemRow = document.getElementById(`item-${itemId}`);
    const quantidade = parseFloat(itemRow.querySelector('.item-quantidade').value) || 0;
    const preco = parseFloat(itemRow.querySelector('.item-preco').value) || 0;
    const subtotal = quantidade * preco;
    
    document.getElementById(`subtotal-${itemId}`).value = subtotal.toFixed(2);
    calculateOrderTotal();
}

function calculateOrderTotal() {
    const subtotals = document.querySelectorAll('.item-subtotal');
    let total = 0;
    
    subtotals.forEach(input => {
        total += parseFloat(input.value) || 0;
    });
    
    document.getElementById('totalPedidoDisplay').textContent = formatCurrency(total);
    document.getElementById('valorTotal').value = total.toFixed(2);
    calculateRemaining();
}

function calculateRemaining() {
    const total = parseFloat(document.getElementById('valorTotal').value) || 0;
    const pago = parseFloat(document.getElementById('valorPago').value) || 0;
    const taxa = parseFloat(document.getElementById('taxaEntrega').value) || 0;
    
    const restante = total + taxa - pago;
    document.getElementById('valorRestante').value = restante.toFixed(2);
}

function removeItem(itemId) {
    const item = document.getElementById(`item-${itemId}`);
    if (item) {
        item.remove();
        calculateOrderTotal();
    }
}

// ===== SALVAR PEDIDO =====
function saveOrder(event) {
    event.preventDefault();
    
    // Coleta itens
    const itemsRows = document.querySelectorAll('.item-row');
    const items = [];
    
    itemsRows.forEach(row => {
        const produtoSelect = row.querySelector('.item-produto');
        const personalizadoInput = row.querySelector('.item-personalizado');
        
        let nomeProduto = produtoSelect.value;
        if (nomeProduto === 'PERSONALIZADO') {
            nomeProduto = personalizadoInput.value;
        }
        
        items.push({
            produto: nomeProduto,
            tamanho: row.querySelector('.item-tamanho').value,
            quantidade: parseFloat(row.querySelector('.item-quantidade').value),
            preco: parseFloat(row.querySelector('.item-preco').value),
            subtotal: parseFloat(row.querySelector('.item-subtotal').value)
        });
    });
    
    // Pega o bairro (pode ser da lista ou digitado)
    let bairro = document.getElementById('clienteBairro').value;
    if (bairro === 'OUTRO') {
        bairro = document.getElementById('outroBairro').value;
    }
    
    // Cria objeto do pedido
    const order = {
        id: currentOrderId || Date.now(),
        // Cliente
        clienteNome: document.getElementById('clienteNome').value,
        clienteTelefone: document.getElementById('clienteTelefone').value,
        clienteEndereco: document.getElementById('clienteEndereco').value,
        clienteBairro: bairro,
        clienteObservacoes: document.getElementById('clienteObservacoes').value,
        
        // Pedido
        dataPedido: document.getElementById('dataPedido').value,
        dataEntrega: document.getElementById('dataEntrega').value,
        turnoEntrega: document.getElementById('turnoEntrega').value,
        status: document.getElementById('statusPedido').value,
        
        // Itens
        items: items,
        
        // Financeiro
        valorTotal: parseFloat(document.getElementById('valorTotal').value),
        valorPago: parseFloat(document.getElementById('valorPago').value),
        formaPagamento: document.getElementById('formaPagamento').value,
        taxaEntrega: parseFloat(document.getElementById('taxaEntrega').value),
        valorRestante: parseFloat(document.getElementById('valorRestante').value),
        
        // Histórico
        history: []
    };
    
    // Salva ou atualiza
    if (currentOrderId) {
        const index = orders.findIndex(o => o.id === currentOrderId);
        const oldOrder = orders[index];
        
        // Adiciona ao histórico
        if (!order.history) order.history = oldOrder.history || [];
        order.history.push({
            timestamp: new Date().toISOString(),
            action: 'Pedido editado',
            details: `Status: ${order.status}`
        });
        
        orders[index] = order;
    } else {
        order.history = [{
            timestamp: new Date().toISOString(),
            action: 'Pedido criado',
            details: `Cliente: ${order.clienteNome}`
        }];
        orders.push(order);
    }
    
    localStorage.setItem('divinePudimOrders', JSON.stringify(orders));
    
    closeOrderModal();
    updateDashboard();
    updateProductsReport();
    renderOrders();
    populateBairroFilter();
    showAlerts();
    renderCalendar();
    renderCharts();
    
    alert('Pedido salvo com sucesso!');
}


// ===== EDITAR PEDIDO =====
function editOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrderId = orderId;
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Pedido';
    
    // Preenche formulário
    document.getElementById('clienteNome').value = order.clienteNome;
    document.getElementById('clienteTelefone').value = order.clienteTelefone;
    document.getElementById('clienteEndereco').value = order.clienteEndereco;
    
    // Preenche bairro
    const bairroSelect = document.getElementById('clienteBairro');
    const bairroOption = Array.from(bairroSelect.options).find(opt => opt.value === order.clienteBairro);
    
    if (bairroOption) {
        bairroSelect.value = order.clienteBairro;
    } else {
        bairroSelect.value = 'OUTRO';
        handleBairroChange();
        document.getElementById('outroBairro').value = order.clienteBairro;
    }
    
    document.getElementById('clienteObservacoes').value = order.clienteObservacoes || '';
    
    document.getElementById('dataPedido').value = order.dataPedido;
    document.getElementById('dataEntrega').value = order.dataEntrega;
    document.getElementById('turnoEntrega').value = order.turnoEntrega;
    document.getElementById('statusPedido').value = order.status;
    
    document.getElementById('valorPago').value = order.valorPago;
    document.getElementById('formaPagamento').value = order.formaPagamento;
    document.getElementById('taxaEntrega').value = order.taxaEntrega;
    
    // Preenche itens
    document.getElementById('itemsList').innerHTML = '';
    order.items.forEach((item, index) => {
        addItem();
        const itemRows = document.querySelectorAll('.item-row');
        const currentRow = itemRows[itemRows.length - 1];
        
        const produtoSelect = currentRow.querySelector('.item-produto');
        
        // Verifica se é produto personalizado
        const isProdutoCadastrado = PRODUTOS.find(p => p.nome === item.produto);
        
        if (isProdutoCadastrado) {
            produtoSelect.value = item.produto;
            const itemId = currentRow.id.split('-')[1];
            updateSizes(itemId);
            
            setTimeout(() => {
                currentRow.querySelector('.item-tamanho').value = item.tamanho;
                currentRow.querySelector('.item-quantidade').value = item.quantidade;
                currentRow.querySelector('.item-preco').value = item.preco;
                currentRow.querySelector('.item-subtotal').value = item.subtotal;
            }, 100);
        } else {
            // Produto personalizado
            produtoSelect.value = 'PERSONALIZADO';
            const itemId = currentRow.id.split('-')[1];
            updateSizes(itemId);
            
            setTimeout(() => {
                const personalizadoInput = document.getElementById(`personalizado-${itemId}`);
                personalizadoInput.value = item.produto;
                currentRow.querySelector('.item-tamanho').value = item.tamanho;
                currentRow.querySelector('.item-quantidade').value = item.quantidade;
                currentRow.querySelector('.item-preco').value = item.preco;
                currentRow.querySelector('.item-subtotal').value = item.subtotal;
            }, 100);
        }
    });
    
    setTimeout(() => {
        calculateOrderTotal();
    }, 200);
    
    document.getElementById('orderModal').classList.add('active');
}

// ===== DELETAR PEDIDO =====
function deleteOrder(orderId) {
    if (confirm('Tem certeza que deseja excluir este pedido?')) {
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('divinePudimOrders', JSON.stringify(orders));
        updateDashboard();
        updateProductsReport();
        renderOrders();
        populateBairroFilter();
        showAlerts();
        renderCalendar();
        renderCharts();
        alert('Pedido excluído com sucesso!');
    }
}

// ===== HISTÓRICO =====
function showHistory(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const historyContent = document.getElementById('historyContent');
    
    if (!order.history || order.history.length === 0) {
        historyContent.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--gray-500);">Nenhum histórico disponível</p>';
    } else {
        historyContent.innerHTML = `
            <div class="history-timeline">
                ${order.history.map(h => `
                    <div class="history-item">
                        <div class="history-time">${formatDateTime(h.timestamp)}</div>
                        <div class="history-action">${h.action}</div>
                        <div class="history-details">${h.details}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    document.getElementById('historyModal').classList.add('active');
}

function closeHistoryModal() {
    document.getElementById('historyModal').classList.remove('active');
}

// ===== RENDERIZAR PEDIDOS =====
function renderOrders(filteredOrders = null) {
    const ordersList = document.getElementById('ordersList');
    const ordersToRender = filteredOrders || orders;
    
    document.getElementById('pedidosCount').textContent = ordersToRender.length;
    
    if (ordersToRender.length === 0) {
        ordersList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--gray-400);">
                <i class="fas fa-inbox" style="font-size: 64px; margin-bottom: 20px; display: block;"></i>
                <h3 style="font-size: 24px; margin-bottom: 10px;">Nenhum pedido encontrado</h3>
                <p>Adicione um novo pedido para começar</p>
            </div>
        `;
        return;
    }
    
    // Ordena por data de entrega
    const sortedOrders = [...ordersToRender].sort((a, b) => 
        new Date(a.dataEntrega) - new Date(b.dataEntrega)
    );
    
    ordersList.innerHTML = sortedOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h3><i class="fas fa-user"></i> ${order.clienteNome}</h3>
                    <p><i class="fas fa-phone"></i> ${order.clienteTelefone}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${order.clienteEndereco}</p>
                    <p><i class="fas fa-map-pin"></i> ${order.clienteBairro}</p>
                    <p><i class="fas fa-calendar"></i> ${formatDate(order.dataEntrega)} - ${order.turnoEntrega}</p>
                </div>
                <span class="order-status status-${order.status.toLowerCase().replace(/ /g, '')}">${order.status}</span>
            </div>
            
            <div class="order-body">
                <div class="order-section">
                    <h4><i class="fas fa-shopping-bag"></i> Itens do Pedido</h4>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item">
                                <div class="item-name">${item.produto}</div>
                                <div class="item-details">
                                    ${item.tamanho} | Qtd: ${item.quantidade} | 
                                    R$ ${item.preco.toFixed(2)} | 
                                    Subtotal: R$ ${item.subtotal.toFixed(2)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="order-section">
                    <h4><i class="fas fa-dollar-sign"></i> Financeiro</h4>
                    <div class="order-financial">
                        <div class="financial-row">
                            <span>Valor Total:</span>
                            <strong>${formatCurrency(order.valorTotal)}</strong>
                        </div>
                        <div class="financial-row">
                            <span>Taxa de Entrega:</span>
                            <strong>${formatCurrency(order.taxaEntrega)}</strong>
                        </div>
                        <div class="financial-row">
                            <span>Valor Pago:</span>
                            <strong>${formatCurrency(order.valorPago)}</strong>
                        </div>
                        <div class="financial-row">
                            <span>Forma:</span>
                            <strong>${order.formaPagamento}</strong>
                        </div>
                        <div class="financial-row total">
                            <span>A Receber:</span>
                            <strong>${formatCurrency(order.valorRestante)}</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            ${order.clienteObservacoes ? `
                <div class="order-section">
                    <h4><i class="fas fa-comment"></i> Observações</h4>
                    <p style="padding: 12px; background: #fef3c7; border-radius: 8px; margin-top: 8px; font-size: 13px;">${order.clienteObservacoes}</p>
                </div>
            ` : ''}
            
            <div class="order-actions">
                <button class="btn-action btn-edit" onclick="editOrder(${order.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action btn-print" onclick="printReceipt(${order.id})">
                    <i class="fas fa-print"></i> Imprimir
                </button>
                <button class="btn-action btn-history" onclick="showHistory(${order.id})">
                    <i class="fas fa-history"></i> Histórico
                </button>
                <button class="btn-action btn-delete" onclick="deleteOrder(${order.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// ===== FILTROS =====
function populateBairroFilter() {
    const bairros = [...new Set(orders.map(o => o.clienteBairro))].sort();
    const select = document.getElementById('filterBairro');
    
    select.innerHTML = '<option value="">Todos</option>' + 
        bairros.map(b => `<option value="${b}">${b}</option>`).join('');
}

function applyFilters() {
    const filterData = document.getElementById('filterData').value;
    const filterBairro = document.getElementById('filterBairro').value;
    const filterPagamento = document.getElementById('filterPagamento').value;
    const filterTurno = document.getElementById('filterTurno').value;
    const filterStatus = document.getElementById('filterStatus').value;
    
    let filtered = [...orders];
    
    if (filterData) {
        filtered = filtered.filter(o => o.dataEntrega === filterData);
    }
    
    if (filterBairro) {
        filtered = filtered.filter(o => o.clienteBairro === filterBairro);
    }
    
    if (filterPagamento) {
        filtered = filtered.filter(o => o.formaPagamento === filterPagamento);
    }
    
    if (filterTurno) {
        filtered = filtered.filter(o => o.turnoEntrega === filterTurno);
    }
    
    if (filterStatus) {
        filtered = filtered.filter(o => o.status === filterStatus);
    }
    
    if (searchTerm) {
        filtered = filtered.filter(o => 
            o.clienteNome.toLowerCase().includes(searchTerm) ||
            o.id.toString().includes(searchTerm)
        );
    }
    
    renderOrders(filtered);
}

function clearFilters() {
    document.getElementById('filterData').value = '';
    document.getElementById('filterBairro').value = '';
    document.getElementById('filterPagamento').value = '';
    document.getElementById('filterTurno').value = '';
    document.getElementById('filterStatus').value = '';
    renderOrders();
}

// ===== PRODUÇÃO =====
function filterProduction(period) {
    currentFilter = period;
    document.querySelectorAll('.btn-filter-period').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderProductionReport();
}

function renderProductionReport() {
    const container = document.getElementById('productionReport');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = orders.filter(o => o.status !== 'Entregue');
    
    if (currentFilter === 'hoje') {
        const todayStr = today.toISOString().split('T')[0];
        filtered = filtered.filter(o => o.dataEntrega === todayStr);
    } else if (currentFilter === 'amanha') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        filtered = filtered.filter(o => o.dataEntrega === tomorrowStr);
    } else if (currentFilter === 'semana') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        filtered = filtered.filter(o => {
            const entrega = new Date(o.dataEntrega);
            return entrega >= today && entrega <= weekEnd;
        });
    }
    
    // Agrupa por data
    const byDate = {};
    filtered.forEach(order => {
        if (!byDate[order.dataEntrega]) {
            byDate[order.dataEntrega] = [];
        }
        byDate[order.dataEntrega].push(order);
    });
    
    // Ordena datas
    const sortedDates = Object.keys(byDate).sort();
    
    if (sortedDates.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 60px; color: var(--gray-500);">Nenhum pedido pendente para este período</p>';
        return;
    }
    
    container.innerHTML = sortedDates.map(date => {
        const dayOrders = byDate[date];
        const productCount = {};
        
        dayOrders.forEach(order => {
            order.items.forEach(item => {
                const key = `${item.produto}|||${item.tamanho}`;
                if (!productCount[key]) {
                    productCount[key] = 0;
                }
                productCount[key] += item.quantidade;
            });
        });
        
        const products = Object.entries(productCount).map(([key, qty]) => {
            const [name, size] = key.split('|||');
            return { name, size, qty };
        }).sort((a, b) => a.name.localeCompare(b.name));
        
        return `
            <div class="production-day">
                <h3><i class="fas fa-calendar-day"></i> ${formatDate(date)} (${dayOrders.length} pedido${dayOrders.length > 1 ? 's' : ''})</h3>
                <div class="production-items">
                    ${products.map(p => `
                        <div class="production-item">
                            <div class="production-item-info">
                                <div class="production-item-name">${p.name}</div>
                                <div class="production-item-size">Tamanho: ${p.size}</div>
                            </div>
                            <div class="production-item-qty">${p.qty}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// ===== CALENDÁRIO =====
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const title = document.getElementById('calendarTitle');
    
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    title.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    let calendarHTML = '<div class="calendar-grid">';
    
    // Dias da semana
    ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });
    
    // Dias vazios do início
    for (let i = 0; i < startDay; i++) {
        calendarHTML += '<div class="calendar-day other-month"></div>';
    }
    
    // Dias do mês
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = orders.filter(o => o.dataEntrega === dateStr);
        
        let classes = 'calendar-day';
        
        if (date.getTime() === today.getTime()) {
            classes += ' today';
        }
        
        if (dayOrders.length > 0) {
            classes += ' has-orders';
        }
        
        calendarHTML += `
            <div class="${classes}" onclick="showDayOrders('${dateStr}')">
                <div class="calendar-day-number">${day}</div>
                ${dayOrders.length > 0 ? `<div class="calendar-day-badge">${dayOrders.length}</div>` : ''}
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function showDayOrders(dateStr) {
    const dayOrders = orders.filter(o => o.dataEntrega === dateStr);
    const container = document.getElementById('calendarOrders');
    
    if (dayOrders.length === 0) {
        container.innerHTML = `
            <h3 style="margin-bottom: 20px;"><i class="fas fa-calendar-day"></i> ${formatDate(dateStr)}</h3>
            <p style="text-align: center; padding: 40px; color: var(--gray-500);">Nenhum pedido para esta data</p>
        `;
        return;
    }
    
    container.innerHTML = `
        <h3 style="margin-bottom: 20px;"><i class="fas fa-calendar-day"></i> ${formatDate(dateStr)} - ${dayOrders.length} Pedido${dayOrders.length > 1 ? 's' : ''}</h3>
        <div style="display: grid; gap: 16px;">
            ${dayOrders.map(order => `
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px; border-left: 4px solid var(--primary);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div>
                            <strong style="font-size: 16px;">${order.clienteNome}</strong>
                            <p style="color: var(--gray-600); font-size: 13px; margin-top: 4px;">${order.clienteTelefone}</p>
                            <p style="color: var(--gray-600); font-size: 13px;">${order.turnoEntrega}</p>
                        </div>
                        <span class="order-status status-${order.status.toLowerCase().replace(/ /g, '')}">${order.status}</span>
                    </div>
                    <div style="font-size: 13px; color: var(--gray-700);">
                        <strong>${order.items.length} item${order.items.length > 1 ? 's' : ''}</strong> - ${formatCurrency(order.valorTotal)}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}


// ===== GRÁFICOS =====
let chartInstances = {};

function renderCharts() {
    // Limpa gráficos anteriores
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    renderProductChart();
    renderRevenueChart();
    renderBairrosChart();
    renderPaymentChart();
}

function renderProductChart() {
    const productCount = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!productCount[item.produto]) {
                productCount[item.produto] = 0;
            }
            productCount[item.produto] += item.quantidade;
        });
    });
    
    const sortedProducts = Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const ctx = document.getElementById('chartProdutos');
    
    chartInstances.produtos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedProducts.map(p => p[0]),
            datasets: [{
                label: 'Quantidade Vendida',
                data: sortedProducts.map(p => p[1]),
                backgroundColor: '#ec4899',
                borderColor: '#be185d',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderRevenueChart() {
    const revenueByStatus = {};
    
    orders.forEach(order => {
        if (!revenueByStatus[order.status]) {
            revenueByStatus[order.status] = 0;
        }
        revenueByStatus[order.status] += order.valorTotal;
    });
    
    const ctx = document.getElementById('chartFaturamento');
    
    const statusColors = {
        'Pedido confirmado': '#3b82f6',
        'Produzindo': '#f59e0b',
        'Pronto': '#8b5cf6',
        'Em rota': '#06b6d4',
        'Entregue': '#10b981'
    };
    
    chartInstances.faturamento = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(revenueByStatus),
            datasets: [{
                data: Object.values(revenueByStatus),
                backgroundColor: Object.keys(revenueByStatus).map(s => statusColors[s]),
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + formatCurrency(context.raw);
                        }
                    }
                }
            }
        }
    });
}

function renderBairrosChart() {
    const bairroCount = {};
    
    orders.forEach(order => {
        if (!bairroCount[order.clienteBairro]) {
            bairroCount[order.clienteBairro] = 0;
        }
        bairroCount[order.clienteBairro]++;
    });
    
    const sortedBairros = Object.entries(bairroCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
    
    const ctx = document.getElementById('chartBairros');
    
    chartInstances.bairros = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedBairros.map(b => b[0]),
            datasets: [{
                label: 'Número de Entregas',
                data: sortedBairros.map(b => b[1]),
                backgroundColor: '#06b6d4',
                borderColor: '#0891b2',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function renderPaymentChart() {
    const paymentCount = {};
    
    orders.forEach(order => {
        if (!paymentCount[order.formaPagamento]) {
            paymentCount[order.formaPagamento] = 0;
        }
        paymentCount[order.formaPagamento]++;
    });
    
    const ctx = document.getElementById('chartPagamento');
    
    chartInstances.pagamento = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(paymentCount),
            datasets: [{
                data: Object.values(paymentCount),
                backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'],
                borderWidth: 3,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// ===== IMPRESSÃO TÉRMICA 58MM =====
function printReceipt(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const printWindow = window.open('', '', 'width=300,height=600');
    
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    width: 58mm;
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    line-height: 1.4;
                    padding: 5mm;
                }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .divider { 
                    border-top: 1px dashed #000; 
                    margin: 5px 0; 
                }
                .row {
                    display: flex;
                    justify-content: space-between;
                    margin: 2px 0;
                }
                .item {
                    margin: 4px 0;
                }
                .total {
                    font-size: 13px;
                    font-weight: bold;
                    margin-top: 5px;
                }
                h1 { font-size: 16px; margin: 8px 0; }
                h2 { font-size: 13px; margin: 6px 0; }
            </style>
        </head>
        <body>
            <div class="center">
                <h1 class="bold">DIVINE PUDIM GOURMET</h1>
                <p>Comprovante de Pedido</p>
            </div>
            
            <div class="divider"></div>
            
            <div class="row">
                <span>Pedido Nº:</span>
                <span class="bold">${order.id}</span>
            </div>
            
            <div class="row">
                <span>Data:</span>
                <span>${formatDate(order.dataPedido)}</span>
            </div>
            
            <div class="divider"></div>
            
            <h2 class="bold">CLIENTE</h2>
            <p>${order.clienteNome}</p>
            <p>${order.clienteTelefone}</p>
            <p>${order.clienteEndereco}</p>
            <p>${order.clienteBairro}</p>
            
            <div class="divider"></div>
            
            <h2 class="bold">ENTREGA</h2>
            <div class="row">
                <span>Data:</span>
                <span>${formatDate(order.dataEntrega)}</span>
            </div>
            <div class="row">
                <span>Turno:</span>
                <span>${order.turnoEntrega}</span>
            </div>
            <div class="row">
                <span>Status:</span>
                <span>${order.status}</span>
            </div>
            
            <div class="divider"></div>
            
            <h2 class="bold">ITENS</h2>
            ${order.items.map(item => `
                <div class="item">
                    <div class="bold">${item.produto}</div>
                    <div class="row">
                        <span>${item.tamanho} x ${item.quantidade}</span>
                        <span>R$ ${item.subtotal.toFixed(2)}</span>
                    </div>
                </div>
            `).join('')}
            
            <div class="divider"></div>
            
            <div class="row">
                <span>Subtotal:</span>
                <span>R$ ${order.valorTotal.toFixed(2)}</span>
            </div>
            
            <div class="row">
                <span>Taxa de Entrega:</span>
                <span>R$ ${order.taxaEntrega.toFixed(2)}</span>
            </div>
            
            <div class="row">
                <span>Valor Pago:</span>
                <span>R$ ${order.valorPago.toFixed(2)}</span>
            </div>
            
            <div class="row">
                <span>Pagamento:</span>
                <span>${order.formaPagamento}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="row total">
                <span>A RECEBER:</span>
                <span>R$ ${order.valorRestante.toFixed(2)}</span>
            </div>
            
            ${order.clienteObservacoes ? `
                <div class="divider"></div>
                <h2 class="bold">OBSERVAÇÕES</h2>
                <p>${order.clienteObservacoes}</p>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="center" style="margin-top: 10px;">
                <p>Obrigado pela preferência!</p>
                <p class="bold">Divine Pudim Gourmet</p>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// ===== EXPORTAÇÃO PDF =====
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(236, 72, 153);
    doc.text('Divine Pudim Gourmet', 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Relatório Completo de Pedidos', 14, 28);
    
    doc.setFontSize(10);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 35);
    
    // Prepara dados
    const tableData = orders.map(order => [
        order.id,
        order.clienteNome,
        order.clienteTelefone,
        order.clienteBairro,
        formatDate(order.dataEntrega),
        order.status,
        formatCurrency(order.valorTotal),
        formatCurrency(order.valorRestante)
    ]);
    
    // Tabela
    doc.autoTable({
        startY: 40,
        head: [['ID', 'Cliente', 'Telefone', 'Bairro', 'Entrega', 'Status', 'Total', 'A Receber']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [236, 72, 153] },
        styles: { fontSize: 8 }
    });
    
    // Totais
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    
    const totalFaturado = orders.reduce((sum, o) => sum + o.valorTotal, 0);
    const totalReceber = orders.reduce((sum, o) => sum + o.valorRestante, 0);
    
    doc.text(`Total Faturado: ${formatCurrency(totalFaturado)}`, 14, finalY);
    doc.text(`Total a Receber: ${formatCurrency(totalReceber)}`, 14, finalY + 7);
    doc.text(`Total de Pedidos: ${orders.length}`, 14, finalY + 14);
    
    doc.save('divine-pudim-relatorio-completo.pdf');
}

// ===== EXPORTAÇÃO EXCEL =====
function exportToExcel() {
    const data = orders.map(order => {
        // Itens do pedido formatados
        const itensDetalhados = order.items.map(item => 
            `${item.produto} (${item.tamanho}) x${item.quantidade} = R$ ${item.subtotal.toFixed(2)}`
        ).join(' | ');
        
        return {
            'ID': order.id,
            'Data Pedido': order.dataPedido,
            'Data Entrega': order.dataEntrega,
            'Turno': order.turnoEntrega,
            'Status': order.status,
            'Cliente': order.clienteNome,
            'Telefone': order.clienteTelefone,
            'Endereço': order.clienteEndereco,
            'Bairro': order.clienteBairro,
            'Itens': itensDetalhados,
            'Quantidade Itens': order.items.length,
            'Valor Total': order.valorTotal,
            'Valor Pago': order.valorPago,
            'Taxa Entrega': order.taxaEntrega,
            'Valor Restante': order.valorRestante,
            'Forma Pagamento': order.formaPagamento,
            'Observações': order.clienteObservacoes || ''
        };
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Ajusta largura das colunas
    const colWidths = [
        { wch: 12 }, // ID
        { wch: 12 }, // Data Pedido
        { wch: 12 }, // Data Entrega
        { wch: 10 }, // Turno
        { wch: 15 }, // Status
        { wch: 25 }, // Cliente
        { wch: 15 }, // Telefone
        { wch: 40 }, // Endereço
        { wch: 20 }, // Bairro
        { wch: 50 }, // Itens
        { wch: 8 },  // Qtd Itens
        { wch: 12 }, // Valor Total
        { wch: 12 }, // Valor Pago
        { wch: 12 }, // Taxa
        { wch: 12 }, // Restante
        { wch: 15 }, // Pagamento
        { wch: 30 }  // Observações
    ];
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
    
    // Adiciona sheet de produtos
    const productsData = [];
    const productCount = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const key = `${item.produto}|||${item.tamanho}`;
            if (!productCount[key]) {
                productCount[key] = {
                    produto: item.produto,
                    tamanho: item.tamanho,
                    quantidade: 0,
                    valorTotal: 0
                };
            }
            productCount[key].quantidade += item.quantidade;
            productCount[key].valorTotal += item.subtotal;
        });
    });
    
    Object.values(productCount).forEach(p => {
        productsData.push({
            'Produto': p.produto,
            'Tamanho': p.tamanho,
            'Quantidade Total': p.quantidade,
            'Valor Total': p.valorTotal
        });
    });
    
    const wsProducts = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(wb, wsProducts, 'Produtos');
    
    XLSX.writeFile(wb, 'divine-pudim-relatorio-completo.xlsx');
}

// ===== BACKUP E IMPORTAÇÃO =====
function exportBackup() {
    const dataStr = JSON.stringify(orders, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `divine-pudim-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('Backup exportado com sucesso!');
}

function importBackup() {
    document.getElementById('importInput').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedOrders = JSON.parse(e.target.result);
            
            if (confirm('Deseja SUBSTITUIR os dados atuais ou MESCLAR com os importados?\n\nOK = Mesclar | Cancelar = Substituir')) {
                // Mesclar
                importedOrders.forEach(newOrder => {
                    const exists = orders.find(o => o.id === newOrder.id);
                    if (!exists) {
                        orders.push(newOrder);
                    }
                });
            } else {
                // Substituir
                orders = importedOrders;
            }
            
            localStorage.setItem('divinePudimOrders', JSON.stringify(orders));
            updateDashboard();
            updateProductsReport();
            renderOrders();
            populateBairroFilter();
            showAlerts();
            renderCalendar();
            renderCharts();
            
            alert('Dados importados com sucesso!');
        } catch (error) {
            alert('Erro ao importar arquivo. Verifique se é um backup válido.');
            console.error(error);
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Limpa input
}

// ===== UTILITÁRIOS =====
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR');
}

