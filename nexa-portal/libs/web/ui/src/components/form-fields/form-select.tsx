import { Select } from 'antd';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { FormFieldWrapper } from './form-field-wrapper';

export interface SelectOption {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  options,
  label,
  placeholder,
  required,
  disabled,
}: FormSelectProps<T>) {
  const { field, fieldState } = useController({ name, control });
  const id = `field-${String(name)}`;

  return (
    <FormFieldWrapper
      label={label}
      required={required}
      error={fieldState.error?.message}
      htmlFor={id}
    >
      <Select
        {...field}
        id={id}
        size="large"
        className="w-full"
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        status={fieldState.error ? 'error' : undefined}
      />
    </FormFieldWrapper>
  );
}
