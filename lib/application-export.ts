import writeExcelFile from "write-excel-file/node";
import type { StoreApplication } from "./ifg-store";

const HEADERS = ["Serial", "Applied", "Name", "X", "Telegram", "Email", "Country", "Role", "Desks", "Clearance", "Status", "Proof of work", "Context", "Why IFAGRITHM"];
const WIDTHS = [13, 17, 22, 16, 16, 26, 14, 16, 24, 11, 11, 42, 34, 52];

export async function buildApplicationsWorkbook(applications: StoreApplication[]): Promise<Buffer> {
  const rows = applications.map(app => {
    const date = new Date(app.created_at);
    const applied = Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16).replace("T", " ");
    const role = app.role === "scout" ? "Research Scout" : app.role === "analyst" ? "Research Analyst" : "BD/Partnership";
    return [app.serial, applied, app.full_name, app.x_handle, app.telegram, app.email, app.country, role,
      app.desks.join(", "), app.tier ?? "", app.status, app.links, app.context, app.why]
      .map(value => ({ value, type: String }));
  });
  const filter = { files: { transform: { "xl/worksheets/sheet{id}.xml": {
    insert: () => `<autoFilter ref="A1:N${rows.length + 1}"/>`,
  } } } };
  return writeExcelFile([
    HEADERS.map(value => ({ value, type: String, fontWeight: "bold" as const })), ...rows,
  ], { sheet: "Applications", columns: WIDTHS.map(width => ({ width })), stickyRowsCount: 1 }, { features: [filter] }).toBuffer();
}
