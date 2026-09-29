import { Input } from 'antd';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { FormFieldWrapper } from './form-field-wrapper';

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'password';
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
}

/**
 * Text input bound to React Hook Form.
 *
 * `size="large"` is fixed rather than a prop, per rule 3: every input in the portal is large, and
 * making it configurable is how that consistency erodes.
 */
export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = 'text',
  required,
  autoComplete,
  disabled,
}: FormInputProps<T>) {
  const { field, fieldState } = useController({ name, control });
  const id = `field-${String(name)}`;

  const sharedProps = {
    ...field,
    id,
    size: 'large' as const,
    placeholder,
    autoComplete,
    disabled,
    status: fieldState.error ? ('error' as const) : undefined,
  };

  return (
    <FormFieldWrapper
      label={label}
      required={required}
      error={fieldState.error?.message}
      htmlFor={id}
    >
      {type === 'password' ? (
        <Input.Password {...sharedProps} />
      ) : (
        <Input {...sharedProps} type={type} />
      )}
    </FormFieldWrapper>
  );
}
