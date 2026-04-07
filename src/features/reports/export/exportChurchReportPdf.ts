import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function downloadChurchReportPdf(options: {
  title: string;
  subtitle: string;
  headRow: string[];
  body: string[][];
  fileBaseName: string;
}): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(options.title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const subtitleLines = doc.splitTextToSize(options.subtitle, 260);
  doc.text(subtitleLines, 14, 22);
  const startY = 20 + subtitleLines.length * 5;

  autoTable(doc, {
    startY,
    head: [options.headRow],
    body: options.body,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [29, 78, 216], textColor: 255 },
    margin: { left: 14, right: 14 },
  });

  const safeName = options.fileBaseName.replace(/[^\w-]+/g, '_');
  doc.save(`${safeName}.pdf`);
}
