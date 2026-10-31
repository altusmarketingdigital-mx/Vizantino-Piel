// ========================================================
// VIZANTINO PIEL - CONTROL DE CAJA REGISTRADORA & POS
// ========================================================

window.cashierSession = {
  isOpen: true,
  branch: "Independencia",
  shift: "Matutino",
  cashier: "Ventas Mostrador",
  openedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  openingBalance: 1500,
  movements: [
    {
      id: "mov-1",
      time: "09:00 AM",
      type: "APERTURA",
      folio: "FONDO-01",
      method: "EFECTIVO",
      amount: 1500,
      concept: "Fondo inicial para cambio",
      authorizedBy: "Gerencia"
    }
  ]
};

function renderCashierModule() {
  const statusBadge = document.getElementById('cashierStatusBadge');
  const navStatus = document.getElementById('navCashierStatus');
  const branchName = document.getElementById('cashierBranchName');
  const shiftName = document.getElementById('cashierShiftName');
  const userName = document.getElementById('cashierUserName');

  if (window.cashierSession.isOpen) {
    if (statusBadge) {
      statusBadge.textContent = 'Caja Abierta';
      statusBadge.className = 'badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    }
    if (navStatus) {
      navStatus.textContent = 'Abierta';
      navStatus.className = 'badge bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5';
    }
  } else {
    if (statusBadge) {
      statusBadge.textContent = 'Caja Cerrada';
      statusBadge.className = 'badge bg-rose-500/20 text-rose-300 border border-rose-500/40';
    }
    if (navStatus) {
      navStatus.textContent = 'Cerrada';
      navStatus.className = 'badge bg-rose-500/20 text-rose-300 text-[10px] px-1.5 py-0.5';
    }
  }

  if (branchName) branchName.textContent = window.cashierSession.branch;
  if (shiftName) shiftName.textContent = window.cashierSession.shift;
  if (userName) userName.textContent = window.cashierSession.cashier;

  let cashSales = 0;
  let cashSalesCount = 0;
  let cardSales = 0;
  let cashIn = 0;
  let cashOut = 0;

  (window.cashierSession.movements || []).forEach(m => {
    if (m.type === 'VENTA_EFECTIVO') {
      cashSales += Number(m.amount) || 0;
      cashSalesCount++;
    } else if (m.type === 'VENTA_TARJETA' || m.type === 'VENTA_TRANSFERENCIA') {
      cardSales += Number(m.amount) || 0;
    } else if (m.type === 'INGRESO_EXTRA') {
      cashIn += Number(m.amount) || 0;
    } else if (m.type === 'RETIRO_GASTO') {
      cashOut += Number(m.amount) || 0;
    }
  });

  const opening = Number(window.cashierSession.openingBalance) || 0;
  const totalInDrawer = opening + cashSales + cashIn - cashOut;

  const openBalEl = document.getElementById('cashierOpeningBalance');
  if (openBalEl) openBalEl.textContent = '$' + opening.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const cashSalesEl = document.getElementById('cashierCashSales');
  if (cashSalesEl) cashSalesEl.textContent = '$' + cashSales.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const cashSalesCountEl = document.getElementById('cashierCashSalesCount');
  if (cashSalesCountEl) cashSalesCountEl.textContent = cashSalesCount;

  const cardSalesEl = document.getElementById('cashierCardSales');
  if (cardSalesEl) cardSalesEl.textContent = '$' + cardSales.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const totalDrawerEl = document.getElementById('cashierTotalInDrawer');
  if (totalDrawerEl) totalDrawerEl.textContent = '$' + totalInDrawer.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const arqOpening = document.getElementById('arqOpening');
  if (arqOpening) arqOpening.textContent = '$' + opening.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const arqCashSales = document.getElementById('arqCashSales');
  if (arqCashSales) arqCashSales.textContent = '$' + cashSales.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const arqCashIn = document.getElementById('arqCashIn');
  if (arqCashIn) arqCashIn.textContent = '$' + cashIn.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const arqCashOut = document.getElementById('arqCashOut');
  if (arqCashOut) arqCashOut.textContent = '$' + cashOut.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const arqExpected = document.getElementById('arqExpected');
  if (arqExpected) arqExpected.textContent = '$' + totalInDrawer.toLocaleString('es-MX', { minimumFractionDigits: 2 });

  const tbody = document.getElementById('cashierMovementsTbody');
  if (tbody) {
    if (!window.cashierSession.movements || window.cashierSession.movements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-brandMuted">Sin movimientos en esta sesión.</td></tr>';
    } else {
      tbody.innerHTML = window.cashierSession.movements.map(m => {
        let badgeClass = 'bg-brandSurface text-brandBeige';
        if (m.type.includes('VENTA')) badgeClass = 'bg-emerald-500/20 text-emerald-300';
        else if (m.type === 'INGRESO_EXTRA' || m.type === 'APERTURA') badgeClass = 'bg-sky-500/20 text-sky-300';
        else if (m.type === 'RETIRO_GASTO') badgeClass = 'bg-rose-500/20 text-rose-300';

        const sign = m.type === 'RETIRO_GASTO' ? '-' : '+';
        const color = m.type === 'RETIRO_GASTO' ? 'text-rose-400' : 'text-emerald-400';

        return `
          <tr class="hover:bg-brandSurface/40 transition">
            <td class="p-3 text-brandMuted font-mono text-[11px]">${m.time}</td>
            <td class="p-3"><span class="badge ${badgeClass}">${m.type}</span></td>
            <td class="p-3 font-mono font-bold text-brandGold">${m.folio}</td>
            <td class="p-3 text-white">${m.method}</td>
            <td class="p-3 text-right font-bold ${color}">
              ${sign}$${Number(m.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </td>
            <td class="p-3 text-brandBeige max-w-xs truncate" title="${m.concept}">${m.concept}</td>
            <td class="p-3 text-right">
              <span class="text-[10px] text-brandMuted font-mono">${m.authorizedBy || 'Cajero'}</span>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
}

function openNewCashSaleModal() {
  if (!window.cashierSession.isOpen) {
    alert('La caja está actualmente CERRADA. Por favor abre una nueva sesión para registrar ventas.');
    return;
  }
  if (typeof openModal === 'function') openModal('quickSaleModal');
}

function openOpenCashModal() {
  if (typeof openModal === 'function') openModal('openCashModal');
}

function submitOpenCashSession() {
  const branchEl = document.getElementById('modalOpenCashBranch');
  const shiftEl = document.getElementById('modalOpenCashShift');
  const userEl = document.getElementById('modalOpenCashUser');
  const amountEl = document.getElementById('modalOpenCashAmount');

  const branch = branchEl ? branchEl.value : 'Independencia';
  const shift = shiftEl ? shiftEl.value : 'Matutino';
  const user = userEl && userEl.value.trim() ? userEl.value.trim() : 'Ventas Mostrador';
  const amount = amountEl ? (parseFloat(amountEl.value) || 0) : 0;

  window.cashierSession = {
    isOpen: true,
    branch: branch,
    shift: shift,
    cashier: user,
    openedAt: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    openingBalance: amount,
    movements: [
      {
        id: 'mov-' + Date.now(),
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        type: 'APERTURA',
        folio: 'FONDO-' + Math.floor(100 + Math.random() * 900),
        method: 'EFECTIVO',
        amount: amount,
        concept: 'Apertura de turno de mostrador',
        authorizedBy: user
      }
    ]
  };

  if (typeof closeModal === 'function') closeModal('openCashModal');
  renderCashierModule();
  alert('¡Turno de caja aperturado correctamente con fondo de $' + amount.toFixed(2) + ' MXN!');
}

function openCashInModal() {
  if (!window.cashierSession.isOpen) {
    alert('La caja está cerrada.');
    return;
  }
  document.getElementById('cashFlowType').value = 'INGRESO';
  document.getElementById('cashFlowModalTitle').textContent = 'Ingreso Extraordinario a Caja';
  document.getElementById('cashFlowModalSubtitle').textContent = 'Entrada de efectivo (aportación de cambio, etc.)';
  document.getElementById('cashFlowSubmitBtn').textContent = 'Registrar Ingreso (+)';
  document.getElementById('cashFlowAmount').value = '';
  document.getElementById('cashFlowConcept').value = '';
  if (typeof openModal === 'function') openModal('cashFlowModal');
}

function openCashOutModal() {
  if (!window.cashierSession.isOpen) {
    alert('La caja está cerrada.');
    return;
  }
  document.getElementById('cashFlowType').value = 'RETIRO';
  document.getElementById('cashFlowModalTitle').textContent = 'Retiro / Gasto de Caja Chica';
  document.getElementById('cashFlowModalSubtitle').textContent = 'Salida de efectivo (pago de servicios, flete menor, insumos)';
  document.getElementById('cashFlowSubmitBtn').textContent = 'Registrar Retiro (-)';
  document.getElementById('cashFlowAmount').value = '';
  document.getElementById('cashFlowConcept').value = '';
  if (typeof openModal === 'function') openModal('cashFlowModal');
}

function submitCashFlowMovement() {
  const type = document.getElementById('cashFlowType').value;
  const amount = parseFloat(document.getElementById('cashFlowAmount').value);
  const concept = document.getElementById('cashFlowConcept').value.trim();
  const auth = document.getElementById('cashFlowAuthorizedBy').value.trim();

  if (!amount || amount <= 0 || !concept) {
    alert('Ingresa un monto válido y el concepto del movimiento.');
    return;
  }

  const newMov = {
    id: 'mov-' + Date.now(),
    time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    type: type === 'INGRESO' ? 'INGRESO_EXTRA' : 'RETIRO_GASTO',
    folio: (type === 'INGRESO' ? 'ING-' : 'RET-') + Math.floor(1000 + Math.random() * 9000),
    method: 'EFECTIVO',
    amount: amount,
    concept: concept,
    authorizedBy: auth || 'Gerencia'
  };

  window.cashierSession.movements.unshift(newMov);
  if (typeof closeModal === 'function') closeModal('cashFlowModal');
  renderCashierModule();
  alert('Movimiento registrado con éxito: ' + (type === 'INGRESO' ? '+$' : '-$') + amount.toFixed(2));
}

function openCloseCashModal() {
  if (!window.cashierSession.isOpen) {
    alert('La caja ya se encuentra cerrada.');
    return;
  }

  let cashSales = 0;
  let cardSales = 0;
  let cashIn = 0;
  let cashOut = 0;

  window.cashierSession.movements.forEach(m => {
    if (m.type === 'VENTA_EFECTIVO') cashSales += Number(m.amount) || 0;
    else if (m.type === 'VENTA_TARJETA' || m.type === 'VENTA_TRANSFERENCIA') cardSales += Number(m.amount) || 0;
    else if (m.type === 'INGRESO_EXTRA') cashIn += Number(m.amount) || 0;
    else if (m.type === 'RETIRO_GASTO') cashOut += Number(m.amount) || 0;
  });

  const teoCash = (Number(window.cashierSession.openingBalance) || 0) + cashSales + cashIn - cashOut;

  document.getElementById('modalCloseTeoCash').textContent = '$' + teoCash.toLocaleString('es-MX', { minimumFractionDigits: 2 });
  document.getElementById('modalCloseTeoCards').textContent = '$' + cardSales.toLocaleString('es-MX', { minimumFractionDigits: 2 });
  document.getElementById('modalCloseRealCash').value = teoCash;
  calculateCashDiff();

  if (typeof openModal === 'function') openModal('closeCashModal');
}

function calculateCashDiff() {
  const real = parseFloat(document.getElementById('modalCloseRealCash').value) || 0;
  const teoText = document.getElementById('modalCloseTeoCash').textContent.replace(/[^0-9.]/g, '');
  const teo = parseFloat(teoText) || 0;
  const diff = real - teo;

  const container = document.getElementById('cashDiffContainer');
  const valEl = document.getElementById('cashDiffValue');

  if (container && valEl) {
    container.classList.remove('hidden');
    if (Math.abs(diff) < 0.01) {
      valEl.textContent = '$0.00 (Cuadre Exacto)';
      valEl.className = 'font-bold text-base text-emerald-400';
    } else if (diff > 0) {
      valEl.textContent = '+$' + diff.toFixed(2) + ' (Sobrante en Caja)';
      valEl.className = 'font-bold text-base text-sky-400';
    } else {
      valEl.textContent = '-$' + Math.abs(diff).toFixed(2) + ' (Faltante en Caja)';
      valEl.className = 'font-bold text-base text-rose-400';
    }
  }
}

function submitCloseCashSession() {
  window.cashierSession.isOpen = false;
  if (typeof closeModal === 'function') closeModal('closeCashModal');
  renderCashierModule();
  printCashierCutPDF();
  alert('¡Corte de Caja finalizado con éxito! El ticket de arqueo ha sido generado.');
}

function exportCashierSessionCSV() {
  let csv = "\uFEFF";
  csv += "CORTE Y MOVIMIENTOS DE CAJA REGISTRADORA - VIZANTINO PIEL\n";
  csv += `Fecha de Emisión,"${new Date().toLocaleString('es-MX')}"\n`;
  csv += `Sucursal,"${window.cashierSession.branch}",Turno,"${window.cashierSession.shift}",Cajero,"${window.cashierSession.cashier}"\n\n`;

  csv += "Hora,Tipo_Movimiento,Folio,Metodo,Monto_MXN,Concepto,Autorizo\n";
  window.cashierSession.movements.forEach(m => {
    csv += `"${m.time}","${m.type}","${m.folio}","${m.method}",${m.amount},"${(m.concept || '').replace(/"/g, '""')}","${m.authorizedBy || ''}"\n`;
  });

  if (typeof downloadCSV === 'function') {
    downloadCSV(csv, `Corte_Caja_Vizantino_${window.cashierSession.branch}.csv`);
  }
}

function printCashierCutPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('Cargando motor de generación PDF...');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200]
  });

  doc.setFillColor(18, 13, 10);
  doc.rect(0, 0, 80, 16, "F");

  doc.setTextColor(198, 164, 119);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("VIZANTINO PIEL", 40, 7, { align: "center" });

  doc.setTextColor(245, 235, 225);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("CORTE DE CAJA (ARQUEO X/Z)", 40, 12, { align: "center" });

  let y = 22;
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(7.5);
  doc.text("Fecha: " + new Date().toLocaleDateString('es-MX') + " " + new Date().toLocaleTimeString('es-MX'), 5, y);
  y += 4;
  doc.text("Sucursal: " + window.cashierSession.branch, 5, y);
  y += 4;
  doc.text("Turno: " + window.cashierSession.shift + " | Cajero: " + window.cashierSession.cashier, 5, y);
  y += 4;
  doc.text("Estado: " + (window.cashierSession.isOpen ? "ABIERTA" : "CERRADA"), 5, y);

  y += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(5, y, 75, y);
  y += 4;

  let cashSales = 0;
  let cardSales = 0;
  let cashIn = 0;
  let cashOut = 0;

  window.cashierSession.movements.forEach(m => {
    if (m.type === 'VENTA_EFECTIVO') cashSales += Number(m.amount) || 0;
    else if (m.type.includes('TARJETA')) cardSales += Number(m.amount) || 0;
    else if (m.type === 'INGRESO_EXTRA') cashIn += Number(m.amount) || 0;
    else if (m.type === 'RETIRO_GASTO') cashOut += Number(m.amount) || 0;
  });

  const opening = Number(window.cashierSession.openingBalance) || 0;
  const totalDrawer = opening + cashSales + cashIn - cashOut;

  doc.setFont("helvetica", "normal");
  doc.text("Fondo Inicial:", 5, y);
  doc.text("$" + opening.toFixed(2), 75, y, { align: "right" });
  y += 4;

  doc.text("(+) Ventas Efectivo:", 5, y);
  doc.text("$" + cashSales.toFixed(2), 75, y, { align: "right" });
  y += 4;

  doc.text("(+) Ingresos Extra:", 5, y);
  doc.text("$" + cashIn.toFixed(2), 75, y, { align: "right" });
  y += 4;

  doc.text("(-) Retiros / Gastos:", 5, y);
  doc.text("-$" + cashOut.toFixed(2), 75, y, { align: "right" });
  y += 4;

  doc.line(5, y, 75, y);
  y += 4;

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL ESPERADO EN CAJA:", 5, y);
  doc.text("$" + totalDrawer.toFixed(2), 75, y, { align: "right" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.text("Ventas Terminal Tarjeta:", 5, y);
  doc.text("$" + cardSales.toFixed(2), 75, y, { align: "right" });
  y += 4;

  doc.line(5, y, 75, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FIRMA DE CONFORMIDAD", 40, y + 10, { align: "center" });
  doc.line(20, y + 9, 60, y + 9);

  doc.save("Corte_Caja_Ticket_" + window.cashierSession.branch + ".pdf");
}
