import { Tag, Typography } from 'antd';

const { Text } = Typography;

/**
 * Classification pill colours, mapped from the legacy `pillColor()` to Ant Design preset tags so
 * they track the active theme instead of being hard-coded for the old dark-only palette.
 *
 * The four keys and the fallback are unchanged: an unrecognised or null classification renders
 * grey, and a null one renders an em dash rather than a tag.
 */
const CLASSIFICATION_COLORS: Record<string, string> = {
  ENQUIRY: 'blue',
  INTENT: 'green',
  PROMOTION: 'gold',
  SOCIAL: 'purple',
};

interface ClassificationTagProps {
  classification: string | null;
}

export function ClassificationTag({ classification }: ClassificationTagProps) {
  if (!classification) {
    return <Text type="secondary">{'\u2014'}</Text>;
  }
  return (
    <Tag variant="filled" color={CLASSIFICATION_COLORS[classification] ?? 'default'}>
      {classification}
    </Tag>
  );
}
