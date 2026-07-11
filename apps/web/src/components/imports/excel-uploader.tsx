'use client';

import { useState, useTransition } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, X, ArrowRight } from "lucide-react";
import { processImportedData } from "@/server/actions/import-actions";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { SearchSelect } from "@/components/ui/search-select"; // IMPORT NEW COMPONENT

export function ExcelUploader({ categories, disabled = false }: { categories: any[], disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{ headers: string[], rows: any[] } | null>(null);
  
  const [mappings, setMappings] = useState<Record<string, string>>({
    date: '', description: '', amount: '', type: '', category: ''
  });

  const dbFields = [
    { id: 'date', label: 'Transaction Date *', required: true },
    { id: 'description', label: 'Description/Vendor *', required: true },
    { id: 'amount', label: 'Amount *', required: true },
    { id: 'type', label: 'Type (Income/Expense)', required: false },
    { id: 'category', label: 'Category', required: false }
  ];

  const parseBulletproofDate = (dateVal: any): string => {
    if (!dateVal) return new Date().toISOString();
    try {
      if (typeof dateVal === 'number') {
        const jsDate = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
        return jsDate.toISOString().split('T')[0];
      }
      const dStr = String(dateVal).trim();
      const textMonthRegex = /^(\d{1,2})[\/\-\s]+([a-zA-Z]{3,})[\/\-\s]+(\d{4})$/;
      const textMatch = dStr.match(textMonthRegex);
      if (textMatch) {
        const monthStr = textMatch[2].substring(0, 3).toLowerCase();
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = months.indexOf(monthStr);
        if (monthIndex !== -1) {
          const d = new Date(parseInt(textMatch[3]), monthIndex, parseInt(textMatch[1]));
          const userTimezoneOffset = d.getTimezoneOffset() * 60000;
          return new Date(d.getTime() - userTimezoneOffset).toISOString().split('T')[0];
        }
      }
      const dmyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
      const dmyMatch = dStr.match(dmyRegex);
      if (dmyMatch) {
        const d = new Date(parseInt(dmyMatch[3]), parseInt(dmyMatch[2]) - 1, parseInt(dmyMatch[1]));
         const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - userTimezoneOffset).toISOString().split('T')[0];
      }
      const standardDate = new Date(dStr);
      if (!isNaN(standardDate.getTime())) return standardDate.toISOString().split('T')[0];
      return new Date().toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const autoMapColumns = (headers: string[]) => {
    const newMap: Record<string, string> = { date: '', description: '', amount: '', type: '', category: '' };
    headers.forEach(h => {
      const lower = h.toLowerCase();
      if (lower.includes('date')) newMap.date = h;
      else if (lower.includes('desc') || lower.includes('vendor') || lower.includes('payee') || lower.includes('particulars')) newMap.description = h;
      else if (lower.includes('amount') || lower.includes('amt') || lower.includes('value')) newMap.amount = h;
      else if (lower.includes('type') || lower.includes('cr/dr')) newMap.type = h;
      else if (lower.includes('category') || lower.includes('cat')) newMap.category = h;
    });
    setMappings(newMap);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary', raw: true }); 
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

      if (data.length > 0) {
        const headers = data[0] as string[];
        const rows = data.slice(1, 6).map(row => {
          const rowObj: any = {};
          headers.forEach((h, i) => { rowObj[h] = (row as any)[i]; });
          return rowObj;
        });

        setPreviewData({ headers, rows });
        autoMapColumns(headers);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewData(null);
    setMappings({ date: '', description: '', amount: '', type: '', category: '' });
  };

  const handleProcess = () => {
    if (!mappings.date || !mappings.description || !mappings.amount) {
      toast.error("Please map Date, Description, and Amount columns.");
      return;
    }

    const toastId = toast.loading("Processing file...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary', raw: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const allRows = XLSX.utils.sheet_to_json(ws, {raw: true});

      const incomes: any[] = [];
      const expenses: any[] = [];

      allRows.forEach((row: any) => {
        try {
          const amtVal = row[mappings.amount];
          if (!amtVal) return;
          const amt = parseFloat(amtVal.toString().replace(/[^0-9.-]+/g, ""));
          if (isNaN(amt) || amt === 0) return;

          let isIncome = false;
          if (mappings.type && row[mappings.type]) {
            const typeVal = String(row[mappings.type]).toLowerCase();
            isIncome = typeVal.includes('inc') || typeVal.includes('cr') || typeVal.includes('deposit');
          } else {
            isIncome = amt > 0;
          }

          const rawDate = row[mappings.date];
          const parsedDateString = parseBulletproofDate(rawDate);

          const record = {
            transaction_date: parsedDateString + "T00:00:00.000Z", 
            source: isIncome ? (row[mappings.description] || 'Unknown') : undefined,
            vendor: !isIncome ? (row[mappings.description] || 'Unknown') : undefined,
            amount: Math.abs(amt),
            categoryName: mappings.category ? row[mappings.category] : 'Uncategorized'
          };

          if (isIncome) incomes.push(record);
          else expenses.push(record);

        } catch (e) {
          console.error("Error parsing row", row, e);
        }
      });

      startTransition(async () => {
        const res = await processImportedData({ incomes, expenses });
        if (res.success) {
          toast.success(`Imported ${incomes.length} incomes and ${expenses.length} expenses!`, { id: toastId });
          resetUpload();
        } else {
          toast.error(res.error, { id: toastId });
        }
      });
    };
    reader.readAsBinaryString(file!);
  };

  // Convert headers into the format expected by SearchSelect
  const headerOptions = previewData?.headers.map(h => ({ label: h, value: h })) || [];

  if (disabled) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Upload Permission Disabled</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
          Your current account role does not have the privileges required to import new transaction datasets.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!previewData && (
        <div className="bg-white border-2 border-dashed border-border rounded-xl p-12 text-center shadow-sm relative hover:bg-secondary/30 transition-colors">
          <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4"><UploadCloud className="w-8 h-8" /></div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Drag & Drop Excel/CSV</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">Upload your bank statements. We will auto-detect columns and let you review before importing.</p>
        </div>
      )}

      {previewData && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-border rounded-xl shadow-sm p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><FileSpreadsheet className="w-6 h-6" /></div>
              <div><h3 className="font-semibold text-foreground">{file?.name}</h3><p className="text-sm text-muted-foreground">{previewData.headers.length} columns detected</p></div>
            </div>
            <button onClick={resetUpload} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-secondary/50 p-4 rounded-xl border border-border">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><ArrowRight className="w-4 h-4 text-primary" /> Map Columns</h3>
                <div className="space-y-4 relative">
                  
                  {/* USING THE NEW SEARCH-SELECT COMPONENT */}
                  {dbFields.map(field => {
                     const isError = !mappings[field.id] && field.required;
                     return (
                      <div key={field.id} className="relative z-10" style={{ zIndex: dbFields.length - dbFields.indexOf(field) }}>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">{field.label}</label>
                        <SearchSelect 
                          options={headerOptions}
                          value={mappings[field.id]}
                          onChange={(val) => setMappings({...mappings, [field.id]: val})}
                          hasError={isError}
                        />
                      </div>
                    )
                  })}

                </div>
              </div>
              <button onClick={handleProcess} disabled={isPending || !mappings.date || !mappings.description || !mappings.amount} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-premium hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <CheckCircle2 className="w-5 h-5" /> {isPending ? 'Processing...' : 'Import Data'}
              </button>
            </div>

            <div className="lg:col-span-3 bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border bg-secondary/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Previewing first 5 rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-muted-foreground text-xs uppercase font-semibold border-b border-border">
                    <tr>
                      {previewData.headers.map((header, i) => (
                        <th key={i} className="px-4 py-3 whitespace-nowrap">
                          {header}
                          {Object.entries(mappings).map(([key, val]) => val === header ? <span key={key} className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full uppercase">{key}</span> : null)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-secondary/30">
                        {previewData.headers.map((header, cIdx) => {
                           let val = row[header];
                           if (mappings.date === header) {
                             val = parseBulletproofDate(val);
                           }
                           return (
                            <td key={cIdx} className="px-4 py-3 whitespace-nowrap text-foreground">
                              {val !== undefined ? String(val) : ''}
                            </td>
                           )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
