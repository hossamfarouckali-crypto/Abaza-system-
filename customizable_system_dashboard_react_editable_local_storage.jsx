import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  MoreVertical,
  Pencil,
  Trash2,
  Save,
  FileText,
  Printer,
  Database,
  RefreshCw,
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ---------------------------
// Utilities
// ---------------------------
const LS_KEY = "custom-system-records-v1";
const SETTINGS_KEY = "custom-system-settings-v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function download(filename, text) {
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows, headers) {
  const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const headerLine = headers.map(h => escape(h.label)).join(",");
  const lines = rows.map(r => headers.map(h => escape(r[h.key] ?? "")).join(","));
  return [headerLine, ...lines].join("\n");
}

// ---------------------------
// Demo Data
// ---------------------------
const demoRecords = [
  { id: uid(), code: "ORD-1001", customer: "Cook Door - Dokki", status: "active", amount: 4200, date: "2025-09-01", channel: "Online", note: "Priority day (rush)", phone: "+201112223334" },
  { id: uid(), code: "ORD-1002", customer: "Cook Door - Heliopolis", status: "paused", amount: 2100, date: "2025-08-28", channel: "Offline", note: "Pending confirmation", phone: "+201098765432" },
  { id: uid(), code: "ORD-1003", customer: "Asil Co.", status: "active", amount: 6900, date: "2025-08-15", channel: "Online", note: "SLA 99.9%", phone: "+201223344556" },
];

const defaultSettings = {
  brand: {
    name: "E-Zone System",
    accent: "", // Tailwind accent class (optional), kept simple here
  },
  table: {
    headers: [
      { key: "code", label: "Code" },
      { key: "customer", label: "Customer" },
      { key: "status", label: "Status" },
      { key: "amount", label: "Amount" },
      { key: "date", label: "Date" },
      { key: "channel", label: "Channel" },
      { key: "phone", label: "Phone" },
      { key: "note", label: "Note" },
    ],
  },
  flags: {
    compact: false,
    showTotals: true,
  },
};

// ---------------------------
// Record Form Component
// ---------------------------
function RecordForm({ open, onOpenChange, onSubmit, initial }) {
  const [values, setValues] = useState(
    initial ?? { code: "", customer: "", status: "active", amount: 0, date: "", channel: "Online", note: "", phone: "" }
  );

  useEffect(() => {
    setValues(initial ?? { code: "", customer: "", status: "active", amount: 0, date: "", channel: "Online", note: "", phone: "" });
  }, [initial, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: name === "amount" ? Number(value) : value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Record" : "Add New Record"}</DialogTitle>
          <DialogDescription>Fill the fields then press Save.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" value={values.code} onChange={handleChange} placeholder="ORD-1004" />
          </div>
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Input id="customer" name="customer" value={values.customer} onChange={handleChange} placeholder="Cook Door - Nasr City" />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={values.status} onValueChange={(v) => setValues((x) => ({ ...x, status: v }))}>
              <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" value={values.amount} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" value={values.date} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="channel">Channel</Label>
            <Select value={values.channel} onValueChange={(v) => setValues((x) => ({ ...x, channel: v }))}>
              <SelectTrigger id="channel"><SelectValue placeholder="Select channel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Online">Online</SelectItem>
                <SelectItem value="Offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={values.phone} onChange={handleChange} placeholder="+2012XXXXXXX" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" name="note" value={values.note} onChange={handleChange} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSubmit(values)}><Save className="w-4 h-4 mr-2"/>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------
// Main Component
// ---------------------------
export default function SystemDashboard() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return demoRecords;
  });
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [openForm, setOpenForm] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const filtered = useMemo(() => {
    return records
      .filter((r) =>
        status === "all" ? true : r.status === status
      )
      .filter((r) => {
        const q = query.toLowerCase();
        if (!q) return true;
        return (
          r.code.toLowerCase().includes(q) ||
          r.customer.toLowerCase().includes(q) ||
          String(r.amount).includes(q) ||
          (r.note || "").toLowerCase().includes(q) ||
          (r.phone || "").toLowerCase().includes(q)
        );
      });
  }, [records, query, status]);

  const totals = useMemo(() => {
    const total = filtered.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    return { count: filtered.length, amount: total };
  }, [filtered]);

  const headerDefs = settings.table.headers;

  function handleAdd(values) {
    const row = { id: uid(), ...values };
    setRecords((prev) => [row, ...prev]);
    setOpenForm(false);
  }

  function handleUpdate(values) {
    setRecords((prev) => prev.map((r) => (r.id === editRow.id ? { ...r, ...values } : r)));
    setEditRow(null);
    setOpenForm(false);
  }

  function handleDelete(id) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function exportJSON() {
    download("records.json", JSON.stringify(records, null, 2));
  }

  function exportCSV() {
    const csv = toCSV(records, headerDefs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "records.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (Array.isArray(data)) setRecords(data);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  function printTable() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-2xl bg-black text-white grid place-items-center font-bold">EZ</div>
            <div>
              <h1 className="text-xl font-semibold leading-none">{settings.brand.name}</h1>
              <p className="text-xs text-muted-foreground">Lightweight CRM / Operations Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2"/>CSV</Button>
            <Button variant="outline" onClick={exportJSON}><Database className="w-4 h-4 mr-2"/>Export</Button>
            <Button variant="outline" onClick={printTable}><Printer className="w-4 h-4 mr-2"/>Print</Button>
            <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if(!o) setEditRow(null); }}>
              <DialogTrigger asChild>
                <Button className=""><Plus className="w-4 h-4 mr-2"/>Add</Button>
              </DialogTrigger>
              <RecordForm
                open={openForm}
                onOpenChange={setOpenForm}
                onSubmit={(vals) => editRow ? handleUpdate(vals) : handleAdd(vals)}
                initial={editRow}
              />
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid gap-4 md:grid-cols-12">
        {/* Sidebar */}
        <aside className="md:col-span-3 lg:col-span-2">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {[
                { icon: <LayoutGrid className="w-4 h-4"/>, label: "Dashboard" },
                { icon: <ShoppingCart className="w-4 h-4"/>, label: "Orders" },
                { icon: <Users className="w-4 h-4"/>, label: "Customers" },
                { icon: <Package className="w-4 h-4"/>, label: "Inventory" },
                { icon: <Settings className="w-4 h-4"/>, label: "Settings" },
              ].map((i) => (
                <Button key={i.label} variant="ghost" className="justify-start gap-2">{i.icon}{i.label}</Button>
              ))}

              <div className="h-px bg-border my-2"/>
              <div className="text-xs text-muted-foreground">Quick Stats</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl bg-white border">
                  <div className="text-xs text-muted-foreground">Records</div>
                  <div className="text-lg font-semibold">{records.length}</div>
                </div>
                <div className="p-3 rounded-2xl bg-white border">
                  <div className="text-xs text-muted-foreground">Active</div>
                  <div className="text-lg font-semibold">{records.filter(r=>r.status==='active').length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Content */}
        <section className="md:col-span-9 lg:col-span-10 grid gap-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex items-center gap-2 w-full md:w-[420px]">
                <Search className="w-4 h-4 text-muted-foreground"/>
                <Input placeholder="Search code, customer, phone, note..." value={query} onChange={(e)=>setQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline"><Filter className="w-4 h-4 mr-2"/>More</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Table Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={()=>setSettings(s=>({ ...s, flags: { ...s.flags, compact: !s.flags.compact } }))}>
                      Compact rows {settings.flags.compact ? "✔" : ""}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={()=>setSettings(s=>({ ...s, flags: { ...s.flags, showTotals: !s.flags.showTotals } }))}>
                      Show totals {settings.flags.showTotals ? "✔" : ""}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportCSV}><Download className="w-4 h-4 mr-2"/>Export CSV</DropdownMenuItem>
                    <DropdownMenuItem onClick={exportJSON}><Database className="w-4 h-4 mr-2"/>Export JSON</DropdownMenuItem>
                    <DropdownMenuItem onClick={printTable}><Printer className="w-4 h-4 mr-2"/>Print</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base">Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table className={settings.flags.compact ? "text-sm" : ""}>
                <TableHeader>
                  <TableRow>
                    {headerDefs.map(h => (
                      <TableHead key={h.key}>{h.label}</TableHead>
                    ))}
                    <TableHead className="w-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((r) => (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="border-b"
                      >
                        <TableCell>{r.code}</TableCell>
                        <TableCell>{r.customer}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "active" ? "default" : r.status === "paused" ? "secondary" : "outline"}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{Intl.NumberFormat().format(r.amount)}</TableCell>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.channel}</TableCell>
                        <TableCell>{r.phone}</TableCell>
                        <TableCell className="max-w-[260px] truncate" title={r.note}>{r.note}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4"/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditRow(r); setOpenForm(true); }}>
                                <Pencil className="w-4 h-4 mr-2"/> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(r.id)}>
                                <Trash2 className="w-4 h-4 mr-2"/> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>

            {settings.flags.showTotals && (
              <div className="flex items-center justify-between p-3 text-sm text-muted-foreground border-t bg-muted/30">
                <div>Total records: <span className="font-medium text-foreground">{totals.count}</span></div>
                <div>Total amount: <span className="font-medium text-foreground">{Intl.NumberFormat().format(totals.amount)}</span></div>
              </div>
            )}
          </Card>

          {/* Settings Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4"/> Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid sm:grid-cols-3 gap-3 items-center">
                <Label>Brand Name</Label>
                <Input className="sm:col-span-2" value={settings.brand.name} onChange={(e)=>setSettings(s=>({ ...s, brand: { ...s.brand, name: e.target.value } }))}/>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 items-start">
                <Label>Columns</Label>
                <div className="sm:col-span-2 grid gap-2">
                  {settings.table.headers.map((h, idx) => (
                    <div key={h.key} className="flex items-center gap-2">
                      <Input value={h.label} onChange={(e)=>{
                        const label = e.target.value; 
                        setSettings(s=>{
                          const next = { ...s, table: { ...s.table, headers: [...s.table.headers] } };
                          next.table.headers[idx] = { ...next.table.headers[idx], label };
                          return next;
                        });
                      }}/>
                      <Button variant="ghost" size="icon" onClick={()=>{
                        setSettings(s=>{
                          const arr = s.table.headers.filter((_,i)=>i!==idx);
                          return { ...s, table: { ...s.table, headers: arr } };
                        })
                      }}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={()=>{
                    const key = prompt("New column key (no spaces):", "custom");
                    const label = prompt("New column label:", "Custom");
                    if(!key || !label) return;
                    setSettings(s=>({ ...s, table: { ...s.table, headers: [...s.table.headers, { key, label }] } }));
                    // Also backfill values in existing records
                    setRecords(rs => rs.map(r => ({ ...r, [key]: r[key] ?? "" })));
                  }}>
                    <Plus className="w-4 h-4 mr-2"/>Add Column
                  </Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 items-center">
                <Label>Compact Rows</Label>
                <div className="sm:col-span-2"><Switch checked={settings.flags.compact} onCheckedChange={(v)=>setSettings(s=>({ ...s, flags: { ...s.flags, compact: v } }))}/></div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 items-center">
                <Label>Show Totals</Label>
                <div className="sm:col-span-2"><Switch checked={settings.flags.showTotals} onCheckedChange={(v)=>setSettings(s=>({ ...s, flags: { ...s.flags, showTotals: v } }))}/></div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 items-start">
                <Label>Import JSON</Label>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <Input type="file" accept="application/json" onChange={(e)=>{
                    const file = e.target.files?.[0];
                    if(file) importJSON(file);
                  }}/>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 items-start">
                <Label>Quick Tips</Label>
                <div className="sm:col-span-2 text-sm text-muted-foreground space-y-1">
                  <p>• Click <strong>Add</strong> to create a new record. Use the three-dots action to edit or delete.</p>
                  <p>• Use <strong>Export</strong> to save your data and <strong>Import JSON</strong> to load it back.</p>
                  <p>• Customize columns and brand name from here; changes are saved to your browser automatically.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-8 text-center text-xs text-muted-foreground">
        Built with ❤ — fully client‑side, data saved in your browser (localStorage).
      </footer>
    </div>
  );
}
