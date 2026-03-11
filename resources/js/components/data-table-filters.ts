export type DataTableFilterOption = {
    label: string;
    value: string;
};

export type DataTableFilterDef =
    | {
          kind: 'text';
          columnId: string;
          label: string;
          placeholder?: string;
      }
    | {
          kind: 'select';
          columnId: string;
          label: string;
          options: DataTableFilterOption[];
          clearable?: boolean;
          placeholder?: string;
      }
    | {
          kind: 'multi';
          columnId: string;
          label: string;
          options: DataTableFilterOption[];
      }
    | {
          kind: 'numberRange';
          columnId: string;
          label: string;
          minPlaceholder?: string;
          maxPlaceholder?: string;
      }
    | {
          kind: 'boolean';
          columnId: string;
          label: string;
          trueLabel?: string;
          falseLabel?: string;
      };
