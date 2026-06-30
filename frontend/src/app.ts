interface Item {
  id: number;
  nome: string;
  descricao: string;
  created_at: string;
}

const API = '/api/items';
let editingId: number | null = null;

const form = document.getElementById('item-form') as HTMLFormElement;
const nomeInput = document.getElementById('nome') as HTMLInputElement;
const descricaoInput = document.getElementById('descricao') as HTMLTextAreaElement;
const tbody = document.getElementById('items-table-body') as HTMLTableSectionElement;
const formTitle = document.getElementById('form-title') as HTMLHeadingElement;
const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
const cancelBtn = document.getElementById('cancel-btn') as HTMLButtonElement;

async function fetchItems(): Promise<void> {
  const res = await fetch(API);
  const items: Item[] = await res.json();
  renderItems(items);
}

function renderItems(items: Item[]): void {
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">Nenhum item encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = items
    .map(
      (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.nome}</td>
        <td>${item.descricao}</td>
        <td class="actions">
          <button class="btn-edit" onclick="editItem(${item.id})">Editar</button>
          <button class="btn-danger" onclick="deleteItem(${item.id})">Excluir</button>
        </td>
      </tr>
    `
    )
    .join('');
}

async function addItem(nome: string, descricao: string): Promise<void> {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descricao }),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(`Erro: ${err.error}`);
    return;
  }

  form.reset();
  await fetchItems();
}

async function updateItem(id: number, nome: string, descricao: string): Promise<void> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, descricao }),
  });

  if (!res.ok) {
    const err = await res.json();
    alert(`Erro: ${err.error}`);
    return;
  }

  resetForm();
  await fetchItems();
}

async function loadItemForEdit(id: number): Promise<void> {
  const res = await fetch(`${API}/${id}`);
  const item: Item = await res.json();

  nomeInput.value = item.nome;
  descricaoInput.value = item.descricao;
  editingId = id;
  formTitle.textContent = 'Editar Item';
  submitBtn.textContent = 'Salvar';
  cancelBtn.style.display = 'block';
}

(window as any).editItem = async (id: number): Promise<void> => {
  await loadItemForEdit(id);
};

(window as any).deleteItem = async (id: number): Promise<void> => {
  if (!confirm('Tem certeza que deseja excluir este item?')) return;

  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    const err = await res.json();
    alert(`Erro: ${err.error}`);
    return;
  }

  if (editingId === id) resetForm();
  await fetchItems();
};

function resetForm(): void {
  form.reset();
  editingId = null;
  formTitle.textContent = 'Adicionar Item';
  submitBtn.textContent = 'Adicionar';
  cancelBtn.style.display = 'none';
}

cancelBtn.addEventListener('click', resetForm);

form.addEventListener('submit', async (e: Event) => {
  e.preventDefault();

  const nome = nomeInput.value.trim();
  const descricao = descricaoInput.value.trim();

  if (!nome || !descricao) return;

  if (editingId) {
    await updateItem(editingId, nome, descricao);
  } else {
    await addItem(nome, descricao);
  }
});

fetchItems();
