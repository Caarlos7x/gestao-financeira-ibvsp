import * as XLSX from 'xlsx';

export type ChurchReportSheetRow = {
  Data: string;
  Tipo: string;
  Descrição: string;
  Detalhe: string;
  'Valor (R$)': string;
};

export function downloadChurchReportExcel(
  rows: ChurchReportSheetRow[],
  fileBaseName: string
): void {
  const safeName = fileBaseName.replace(/[^\w-]+/g, '_');
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  XLSX.writeFile(wb, `${safeName}.xlsx`);
}
