import { NextResponse } from "next/server";
import { TaskItem } from "@/types";

export async function POST(request: Request) {
  try {
    const { notionToken, databaseId } = await request.json();

    if (!notionToken || !databaseId) {
      return NextResponse.json({ error: "Missing Notion Token or Database ID" }, { status: 400 });
    }

    const headers = {
      "Authorization": `Bearer ${notionToken}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    };

    // Fetch the children of the block ID (assuming it is a Table block)
    const blockRes = await fetch(`https://api.notion.com/v1/blocks/${databaseId}/children`, { headers });
    
    if (!blockRes.ok) {
      const errorText = await blockRes.text();
      return NextResponse.json({ error: `Notion API Error: ${errorText}` }, { status: blockRes.status });
    }

    const data = await blockRes.json();
    const results = data.results || [];

    // Parse Simple Table rows
    const tableRows = results.filter((block: any) => block.type === "table_row");
    
    if (tableRows.length === 0) {
      return NextResponse.json({ error: "No table rows found in this block. Ensure the ID belongs to a Table block." }, { status: 400 });
    }

    // Assume first row is header, skip it.
    const dataRows = tableRows.slice(1);

    const tasks: TaskItem[] = dataRows.map((row: any) => {
      const cells = row.table_row.cells;

      const getCellText = (cell: any) => {
        if (!cell || !Array.isArray(cell)) return "";
        return cell.map((t: any) => t.plain_text).join("");
      };

      const orderIndexStr = getCellText(cells[0]);
      const timeBlock = getCellText(cells[1]);
      const action = getCellText(cells[2]);
      const rawChecklist = getCellText(cells[3]);
      const benefit = getCellText(cells[4] || []);
      const instruction = getCellText(cells[5] || []);

      const checklist = rawChecklist
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-'))
        .map((line: string) => line.replace(/^-+\s*/, '').trim());

      return {
        id: row.id,
        orderIndex: parseInt(orderIndexStr) || 0,
        timeBlock: timeBlock,
        action: action,
        checklist,
        benefit,
        instruction,
        isCompleted: false,
        checklistStatus: new Array(checklist.length).fill(false)
      };
    });

    // Filter out rows that are empty or don't have a time block
    const validTasks = tasks.filter(t => t.timeBlock && t.action);

    return NextResponse.json({ tasks: validTasks });
  } catch (error: any) {
    console.error("Notion Sync Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync with Notion" }, { status: 500 });
  }
}
