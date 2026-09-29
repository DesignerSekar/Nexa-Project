import type { Message } from '@nexa/contract';
import { useAppConfig } from '@nexa/shared-ui/providers';
import { formatTimestamp, senderHandle, truncate } from '@nexa/util';
import type {
  ColDef,
  DefaultMenuItem,
  GetContextMenuItemsParams,
  ICellRendererParams,
  MenuItemDef,
  SideBarDef,
} from 'ag-grid-community';
import {
  AllCommunityModule,
  colorSchemeDark,
  colorSchemeLight,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';
import { Tag, Typography } from 'antd';
import { useCallback, useMemo } from 'react';
import { ClassificationTag } from './classification-tag';

const { Text } = Typography;

/** Same module surface as ecom-v2 ListView (community + enterprise). */
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

/** Columns + Filters tool panels — ecom ListView DEFAULT_SIDE_BAR. */
const SIDE_BAR: SideBarDef = {
  toolPanels: [
    {
      id: 'columns',
      toolPanel: 'agColumnsToolPanel',
      labelDefault: 'Columns',
      labelKey: 'columns',
      iconKey: 'columns',
    },
    {
      id: 'filters',
      toolPanel: 'agFiltersToolPanel',
      labelDefault: 'Filters',
      labelKey: 'filters',
      iconKey: 'filter',
    },
  ],
};

interface RecentMessagesTableProps {
  messages: Message[];
}

function SenderCell({ data }: ICellRendererParams<Message>) {
  if (!data) return null;
  return (
    <Text type="secondary" className="text-xs">
      {senderHandle(data.sender)}
    </Text>
  );
}

function ContentCell({ data }: ICellRendererParams<Message>) {
  if (!data) return null;
  return <span>{truncate(data.content)}</span>;
}

function PlatformCell({ data }: ICellRendererParams<Message>) {
  if (!data) return null;
  return (
    <Tag variant="filled" color="blue">
      {data.platform}
    </Tag>
  );
}

function ClassificationCell({ data }: ICellRendererParams<Message>) {
  if (!data) return null;
  return <ClassificationTag classification={data.classification} />;
}

function TimeCell({ data }: ICellRendererParams<Message>) {
  if (!data) return null;
  return (
    <Text type="secondary" className="text-xs">
      {formatTimestamp(data.timestamp)}
    </Text>
  );
}

/**
 * Recent-messages AG Grid — ecom-v2 ListView feature parity (modules + defaults).
 * Columns: Sender | Content | Platform | Classification | Time.
 */
export function RecentMessagesTable({ messages }: RecentMessagesTableProps) {
  const { resolvedMode } = useAppConfig();
  const gridTheme = useMemo(
    () => themeQuartz.withPart(resolvedMode === 'dark' ? colorSchemeDark : colorSchemeLight),
    [resolvedMode]
  );

  const columnDefs = useMemo<ColDef<Message>[]>(
    () => [
      {
        headerName: 'Sender',
        field: 'sender',
        minWidth: 140,
        cellRenderer: SenderCell,
      },
      {
        headerName: 'Content',
        field: 'content',
        flex: 1,
        minWidth: 240,
        cellRenderer: ContentCell,
      },
      {
        headerName: 'Platform',
        field: 'platform',
        width: 130,
        cellRenderer: PlatformCell,
      },
      {
        headerName: 'Classification',
        field: 'classification',
        width: 150,
        cellRenderer: ClassificationCell,
      },
      {
        headerName: 'Time',
        field: 'timestamp',
        width: 180,
        cellRenderer: TimeCell,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<Message>>(
    () => ({
      filter: false,
      sortable: true,
      resizable: true,
      floatingFilter: false,
      editable: false,
      minWidth: 100,
      suppressMovable: false,
    }),
    []
  );

  const getContextMenuItems = useCallback((params: GetContextMenuItemsParams<Message>) => {
    const defaults = params.defaultItems ?? [];
    const items: (DefaultMenuItem | MenuItemDef<Message>)[] = [];
    if (defaults.includes('copy')) items.push('copy');
    if (defaults.includes('copyWithHeaders')) items.push('copyWithHeaders');
    if (items.length > 0) items.push('separator');
    if (defaults.includes('csvExport') || defaults.includes('export')) {
      items.push('csvExport');
    }
    if (defaults.includes('excelExport') || defaults.includes('export')) {
      items.push('excelExport');
    }
    return items.length > 0 ? items : defaults;
  }, []);

  return (
    <div className="dashboard-messages-grid">
      <AgGridReact<Message>
        theme={gridTheme}
        rowData={messages}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        getRowId={(params) => params.data.id}
        domLayout="autoHeight"
        animateRows
        enableCellTextSelection
        enableFilterHandlers
        cellSelection
        sideBar={SIDE_BAR}
        getContextMenuItems={getContextMenuItems}
        pagination
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50]}
      />
    </div>
  );
}
