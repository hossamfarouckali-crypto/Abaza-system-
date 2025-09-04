<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Smart System</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
    th { background: #f4f4f4; }
    .actions button { margin: 0 2px; }
    #controls { margin-top: 15px; }
  </style>
</head>
<body>
  <h1>📋 My System</h1>
  <div id="controls">
    <button onclick="addRow()">➕ Add</button>
    <button onclick="exportData()">⬇️ Export</button>
    <button onclick="importData()">⬆️ Import</button>
    <button onclick="print()">🖨️ Print</button>
  </div>

  <table id="dataTable">
    <thead>
      <tr>
        <th>Name</th>
        <th>Phone</th>
        <th>Email</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>

  <script>
    let data = JSON.parse(localStorage.getItem("mySystemData")) || [];

    function saveData() {
      localStorage.setItem("mySystemData", JSON.stringify(data));
    }

    function renderTable() {
      const tbody = document.querySelector("#dataTable tbody");
      tbody.innerHTML = "";
      data.forEach((row, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.name}</td>
          <td>${row.phone}</td>
          <td>${row.email}</td>
          <td class="actions">
            <button onclick="editRow(${index})">✏️</button>
            <button onclick="deleteRow(${index})">🗑️</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function addRow() {
      const name = prompt("Enter name:");
      const phone = prompt("Enter phone:");
      const email = prompt("Enter email:");
      if(name) {
        data.push({ name, phone, email });
        saveData();
        renderTable();
      }
    }

    function editRow(index) {
      const row = data[index];
      const name = prompt("Edit name:", row.name);
      const phone = prompt("Edit phone:", row.phone);
      const email = prompt("Edit email:", row.email);
      data[index] = { name, phone, email };
      saveData();
      renderTable();
    }

    function deleteRow(index) {
      if(confirm("Are you sure?")) {
        data.splice(index, 1);
        saveData();
        renderTable();
      }
    }

    function exportData() {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.json";
      a.click();
    }

    function importData() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
          data = JSON.parse(event.target.result);
          saveData();
          renderTable();
        };
        reader.readAsText(file);
      };
      input.click();
    }

    renderTable();
  </script>
</body>
</html>
