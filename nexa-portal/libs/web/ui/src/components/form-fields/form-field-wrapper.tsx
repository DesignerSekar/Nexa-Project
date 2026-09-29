import { Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

export interface FormFieldWrapperProps {
  label?: ReactNode;
  required?: boolean;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

/**
 * Label, control, error.
 *
 * The required marker is a red asterisk rendered AFTER the label text (`Field Name *`), per
 * rule 6 — Ant Design's own `Form.Item` puts it before, which is why labels are hand-rolled here.
 */
export function FormFieldWrapper({
  label,
  required,
  error,
  htmlFor,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className="form-field">
      {label ? (
        <label className="form-field-label" htmlFor={htmlFor}>
          {label}
          {required ? <Text type="danger"> *</Text> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <Text type="danger" className="form-field-error">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
